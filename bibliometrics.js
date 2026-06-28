// ============================================================
// Bibliometrics Visualizations
// Lotka's Law, Bradford's Law, Zipf's Law, h-index, Collab Map
// ============================================================

function initBibliometrics() {
  renderLotkaChart();
  renderBradfordChart();
  renderZipfChart();
  renderHIndexChart();
  renderCollabMap();
  renderJournalTable();
}

// ===== LOTKA'S LAW =====
// Author productivity: y = k / x^n  where n ≈ 2 for most scientific disciplines
function renderLotkaChart() {
  const ctx = document.getElementById('lotkaChart');
  if (!ctx) return;

  // Theoretical Lotka distribution vs observed data
  const publications = [1,2,3,4,5,6,7,8,9,10,15,20,30,50,100];
  const theoretical = publications.map(x => Math.round(1000 / (x * x)));
  const observed = [847, 312, 168, 98, 67, 48, 36, 28, 22, 18, 11, 7, 4, 2, 1];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: publications,
      datasets: [
        {
          label: 'Theoretical (Lotka, n=2)',
          data: theoretical,
          borderColor: '#7c3aed',
          backgroundColor: '#7c3aed22',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 2
        },
        {
          label: 'Observed (Retraction Watch)',
          data: observed,
          borderColor: '#f43f5e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f43f5e'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          type: 'logarithmic',
          ticks: { color: '#64748b' },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Papers per Author', color: '#64748b', font: { size: 10 } }
        },
        y: {
          type: 'logarithmic',
          ticks: { color: '#64748b' },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'No. of Authors (log)', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

// ===== BRADFORD'S LAW =====
// Core journals produce most of the literature
function renderBradfordChart() {
  const ctx = document.getElementById('bradfordChart');
  if (!ctx) return;

  // Cumulative papers vs ranked journals
  const journals = RW_DATA.topJournals;
  const cumulative = [];
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += journals[i]?.count || 0;
    cumulative.push(sum);
  }
  // Extrapolate to 50 journals
  for (let i = 15; i < 50; i++) {
    sum += Math.round(400 * Math.exp(-i * 0.08));
    cumulative.push(sum);
  }

  const totalPapers = cumulative[49];
  const zone1End = cumulative.findIndex(v => v >= totalPapers / 3);
  const zone2End = cumulative.findIndex(v => v >= (totalPapers * 2) / 3);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 50}, (_, i) => i + 1),
      datasets: [
        {
          label: 'Cumulative Papers',
          data: cumulative,
          borderColor: '#06b6d4',
          backgroundColor: (ctx) => {
            const i = ctx.dataIndex;
            if (i <= zone1End) return '#7c3aed44';
            if (i <= zone2End) return '#06b6d444';
            return '#10b98144';
          },
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
        annotation: {},
        tooltip: {
          callbacks: {
            label: ctx => {
              const i = ctx.dataIndex;
              const zone = i <= zone1End ? 'Zone 1 (Core)' : i <= zone2End ? 'Zone 2' : 'Zone 3';
              return ` ${ctx.parsed.y.toLocaleString()} papers | ${zone}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', maxTicksLimit: 10 },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Journal Rank', color: '#64748b', font: { size: 10 } }
        },
        y: {
          ticks: { color: '#64748b', callback: v => v.toLocaleString() },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Cumulative Papers', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

// ===== ZIPF'S LAW =====
// Keyword frequency follows power law: f(r) = k / r^α
function renderZipfChart() {
  const ctx = document.getElementById('zipfChart');
  if (!ctx) return;

  const reasons = RW_DATA.topReasons.slice(0, 20);
  const theoretical = reasons.map((_, i) => Math.round(reasons[0].count / Math.pow(i + 1, 0.9)));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: reasons.map((_, i) => i + 1),
      datasets: [
        {
          label: 'Zipf Theoretical',
          data: theoretical,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b22',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          borderDash: [5, 3],
          pointRadius: 0
        },
        {
          label: 'Observed Frequency',
          data: reasons.map(r => r.count),
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            title: ctx => reasons[ctx[0].dataIndex]?.short || '',
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          type: 'logarithmic',
          ticks: { color: '#64748b' },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Reason Rank (log)', color: '#64748b', font: { size: 10 } }
        },
        y: {
          type: 'logarithmic',
          ticks: { color: '#64748b', callback: v => v.toLocaleString() },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Frequency (log)', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

// ===== H-INDEX CURVE =====
function renderHIndexChart() {
  const ctx = document.getElementById('hindexChart');
  if (!ctx) return;

  // Simulated h-index for Retraction Watch top papers
  const n = 60;
  const papers = Array.from({length: n}, (_, i) => i + 1);
  // Citations decrease roughly by rank
  const citations = papers.map(i => Math.round(12000 * Math.exp(-i * 0.06)));
  // h-index: largest h where citations[h] >= h
  let hIndex = 0;
  for (let i = 0; i < n; i++) {
    if (citations[i] >= i + 1) hIndex = i + 1;
    else break;
  }
  // g-index: largest g where sum(citations[1..g]) >= g²
  let gIndex = 0, cumCit = 0;
  for (let i = 0; i < n; i++) {
    cumCit += citations[i];
    if (cumCit >= (i + 1) * (i + 1)) gIndex = i + 1;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: papers.slice(0, 40),
      datasets: [
        {
          label: 'Citations per Paper',
          data: citations.slice(0, 40),
          backgroundColor: papers.slice(0, 40).map(i =>
            i <= hIndex ? '#7c3aed99' : i <= gIndex ? '#06b6d455' : '#1e254099'
          ),
          borderColor: papers.slice(0, 40).map(i =>
            i <= hIndex ? '#7c3aed' : i <= gIndex ? '#06b6d4' : '#1e2540'
          ),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `Paper #${ctx[0].label}`,
            label: ctx => ` ${ctx.parsed.y.toLocaleString()} citations`
          },
          afterBody: ctx => {
            const i = ctx[0].dataIndex + 1;
            if (i <= hIndex) return [`In h-core (h=${hIndex})`];
            if (i <= gIndex) return [`In g-core (g=${gIndex})`];
            return [];
          }
        },
        title: {
          display: true,
          text: `h-index = ${hIndex}  |  g-index = ${gIndex}`,
          color: '#a78bfa', font: { size: 12, weight: 'bold' }
        }
      },
      scales: {
        x: { ticks: { color: '#64748b', maxTicksLimit: 10 }, grid: { color: '#1e2540' } },
        y: { ticks: { color: '#64748b', callback: v => v.toLocaleString() }, grid: { color: '#1e2540' } }
      }
    }
  });
}

// ===== COUNTRY COLLABORATION MAP (SVG Chord) =====
function renderCollabMap() {
  const svg = d3.select('#collabMap');
  const W = document.querySelector('#collabMap').parentElement.clientWidth || 500;
  const H = 300;

  svg.attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  const countries = RW_DATA.topCountries.slice(0, 12);
  const maxCount = countries[0].count;

  // Radial layout
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 40;

  countries.forEach((c, i) => {
    const angle = (i / countries.length) * 2 * Math.PI - Math.PI / 2;
    const r = R * 0.75 + (c.count / maxCount) * R * 0.25;
    c._x = cx + r * Math.cos(angle);
    c._y = cy + r * Math.sin(angle);
    c._r = 5 + (c.count / maxCount) * 18;
  });

  // Draw connections (top 3 collaboration pairs)
  const pairs = [
    [0,1],[0,2],[1,2],[0,6],[1,6],[2,4],[3,5],[0,7],[1,7]
  ];
  const linkG = svg.append('g');
  pairs.forEach(([a, b]) => {
    const ca = countries[a], cb = countries[b];
    if (!ca || !cb) return;
    const strength = Math.min(ca.count, cb.count) / maxCount;
    linkG.append('line')
      .attr('x1', ca._x).attr('y1', ca._y)
      .attr('x2', cb._x).attr('y2', cb._y)
      .attr('stroke', '#7c3aed')
      .attr('stroke-opacity', strength * 0.4)
      .attr('stroke-width', strength * 3);
  });

  // Draw country bubbles
  const nodeG = svg.append('g');
  countries.forEach((c, i) => {
    const hue = (i / countries.length) * 360;
    const col = `hsl(${hue},70%,60%)`;

    nodeG.append('circle')
      .attr('cx', c._x).attr('cy', c._y)
      .attr('r', c._r)
      .attr('fill', col)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3);

    if (c._r > 10) {
      nodeG.append('text')
        .attr('x', c._x).attr('y', c._y + c._r + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', '#94a3b8')
        .attr('font-family', 'Inter, sans-serif')
        .text(c.flag + ' ' + c.name.split(' ')[0]);
    }
  });

  // Centre label
  svg.append('text')
    .attr('x', cx).attr('y', cy)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '10px').attr('fill', '#64748b')
    .attr('font-family', 'Inter, sans-serif')
    .text('Global Retraction Network');
}

// ===== JOURNAL TABLE =====
function renderJournalTable() {
  const table = document.getElementById('journalTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Journal</th>
        <th>Publisher</th>
        <th>Retractions</th>
        <th>Bradford Zone</th>
        <th>Share %</th>
      </tr>
    </thead>
    <tbody>
      ${RW_DATA.topJournals.map((j, i) => `
        <tr>
          <td style="color:#64748b;font-family:var(--font-mono)">${i + 1}</td>
          <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${j.name}">${j.name}</td>
          <td style="color:#94a3b8">${j.publisher}</td>
          <td style="font-family:var(--font-mono);color:#a78bfa">${j.count.toLocaleString()}</td>
          <td><span class="zone-badge zone-${j.zone}">Zone ${j.zone}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <div style="background:#1e2540;border-radius:3px;height:4px;width:80px">
                <div style="background:${j.zone === 1 ? '#7c3aed' : j.zone === 2 ? '#06b6d4' : '#10b981'};height:4px;border-radius:3px;width:${(j.count / 1565 * 100).toFixed(0)}%"></div>
              </div>
              <span style="font-size:0.7rem;color:#64748b">${(j.count / 70675 * 100).toFixed(1)}%</span>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}
