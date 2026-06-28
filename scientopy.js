// ============================================================
// SciencePy-Style Visualizations
// Bar charts, trend lines, scatter plots, periodic table
// ============================================================

let spBarChart = null;
let spTrendChart = null;
let spScatterChart = null;

const SP_PALETTE = [
  '#7c3aed','#f43f5e','#06b6d4','#10b981','#f59e0b',
  '#ec4899','#0ea5e9','#8b5cf6','#f97316','#14b8a6'
];

function initSciencePy() {
  renderSPBar();
  renderSPTrend();
  renderSPScatter();
  renderPeriodicTable();

  // Controls
  document.getElementById('spParam')?.addEventListener('change', updateSP);
  document.getElementById('spMetric')?.addEventListener('change', updateSP);
  document.getElementById('spTopN')?.addEventListener('change', updateSP);
}

function getSPData() {
  const param = document.getElementById('spParam')?.value || 'keywords';
  const metric = document.getElementById('spMetric')?.value || 'publications';
  const topN = parseInt(document.getElementById('spTopN')?.value || '10');

  let items = [];
  if (param === 'keywords') {
    items = RW_DATA.topReasons.map(r => ({ name: r.short, count: r.count }));
  } else if (param === 'countries') {
    items = RW_DATA.topCountries.map(c => ({ name: c.name, count: c.count }));
  } else if (param === 'journals') {
    items = RW_DATA.topJournals.map(j => ({ name: j.name.substring(0,30) + (j.name.length > 30 ? '…' : ''), count: j.count }));
  } else if (param === 'authors') {
    items = [
      { name: 'Yoshihiro Sato', count: 183 }, { name: 'Hyung-In Moon', count: 98 },
      { name: 'Diederik Stapel', count: 58 }, { name: 'Joachim Boldt', count: 92 },
      { name: 'Peter Chen', count: 130 }, { name: 'Ali Nazari', count: 119 },
      { name: 'Jan Hendrik Schön', count: 21 }, { name: 'Eric Poehlman', count: 17 },
      { name: 'Andrew Wakefield', count: 12 }, { name: 'Hwang Woo-suk', count: 25 }
    ].sort((a, b) => b.count - a.count);
  } else {
    items = RW_DATA.topics.map(t => ({ name: t.name.substring(0,28), count: Math.round(t.weight * 707) }));
  }

  return items.slice(0, topN);
}

function renderSPBar() {
  const ctx = document.getElementById('spBarChart');
  if (!ctx) return;
  const data = getSPData();

  if (spBarChart) spBarChart.destroy();
  spBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Count',
        data: data.map(d => d.count),
        backgroundColor: data.map((_, i) => SP_PALETTE[i % SP_PALETTE.length] + 'cc'),
        borderColor: data.map((_, i) => SP_PALETTE[i % SP_PALETTE.length]),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x.toLocaleString()} records`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: '#1e2540' }
        },
        y: {
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid: { color: 'transparent' }
        }
      }
    }
  });

  const param = document.getElementById('spParam')?.value || 'keywords';
  document.getElementById('spBarTitle').textContent = `Top ${param.charAt(0).toUpperCase()+param.slice(1)} – Publications`;
}

function renderSPTrend() {
  const ctx = document.getElementById('spTrendChart');
  if (!ctx) return;

  const years = RW_DATA.trendYears;
  const keys = Object.keys(RW_DATA.scientopyKeywords).slice(0, 8);

  if (spTrendChart) spTrendChart.destroy();
  spTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: keys.map((k, i) => ({
        label: k,
        data: RW_DATA.scientopyKeywords[k],
        borderColor: SP_PALETTE[i % SP_PALETTE.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
        pointBackgroundColor: SP_PALETTE[i % SP_PALETTE.length]
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 9.5 }, boxWidth: 10, padding: 8 }
        }
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e2540' } },
        y: {
          ticks: { color: '#64748b' },
          grid: { color: '#1e2540' },
          type: 'logarithmic',
          title: { display: true, text: 'Publications (log scale)', color: '#64748b', font: { size: 9 } }
        }
      }
    }
  });
}

function renderSPScatter() {
  const ctx = document.getElementById('spScatterChart');
  if (!ctx) return;

  // Scatter: each topic bubble by weight × year first appearance
  const points = RW_DATA.topics.map((t, i) => ({
    x: 2010 + i * 2,
    y: t.weight,
    r: Math.sqrt(t.weight) * 4,
    label: t.name,
    color: t.color
  }));

  // Also add country scatter
  const countryPoints = RW_DATA.topCountries.slice(0, 15).map(c => ({
    x: Math.random() * 8 + 2016,
    y: Math.log10(c.count) * 5,
    r: Math.sqrt(c.count / 100),
    label: c.name,
    color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,'0')
  }));

  if (spScatterChart) spScatterChart.destroy();
  spScatterChart = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [
        ...RW_DATA.topics.map(t => ({
          label: t.name,
          data: [{
            x: 2015 + RW_DATA.topics.indexOf(t) * 1.2,
            y: t.weight,
            r: Math.sqrt(t.weight) * 3.5
          }],
          backgroundColor: t.color + '88',
          borderColor: t.color,
          borderWidth: 1.5
        }))
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10, padding: 8 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}% weight`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', callback: v => Math.round(v) },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Year', color: '#64748b', font: { size: 10 } }
        },
        y: {
          ticks: { color: '#64748b', callback: v => v + '%' },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Topic Weight (%)', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

// ===== PERIODIC TABLE OF AI ETHICS TOPICS =====
function renderPeriodicTable() {
  const container = document.getElementById('periodicTable');

  const elements = [
    { sym: 'Pm', name: 'Paper Mill', count: 11796, color: '#f43f5e', num: 1 },
    { sym: 'Fr', name: 'Fraud', count: 21202, color: '#f97316', num: 2 },
    { sym: 'Ai', name: 'AI Content', count: 9135, color: '#7c3aed', num: 3 },
    { sym: 'Pl', name: 'Plagiarism', count: 2787, color: '#0891b2', num: 4 },
    { sym: 'Dp', name: 'Duplication', count: 3661, color: '#10b981', num: 5 },
    { sym: 'Im', name: 'Image Manip', count: 5353, color: '#ec4899', num: 6 },
    { sym: 'Pr', name: 'Peer Review', count: 11433, color: '#f59e0b', num: 7 },
    { sym: 'Da', name: 'Data Issues', count: 15731, color: '#8b5cf6', num: 8 },
    { sym: 'Au', name: 'Authorship', count: 2963, color: '#14b8a6', num: 9 },
    { sym: 'Rb', name: 'Ref/Attr', count: 14849, color: '#fb7185', num: 10 },
    { sym: 'Et', name: 'Ethics IRB', count: 2616, color: '#34d399', num: 11 },
    { sym: 'Pb', name: 'Publisher', count: 30845, color: '#a78bfa', num: 12 },
    { sym: 'Co', name: 'Consent', count: 900, color: '#67e8f9', num: 13 },
    { sym: 'Re', name: 'Rogue Ed', count: 3116, color: '#fbbf24', num: 14 },
    { sym: 'Cf', name: 'Conflict Int', count: 2200, color: '#f472b6', num: 15 },
    { sym: 'Bc', name: 'Breach Policy', count: 4798, color: '#6ee7b7', num: 16 },
    { sym: 'Up', name: 'Unresp Author', count: 3100, color: '#93c5fd', num: 17 },
    { sym: 'Dt', name: 'Date Unknown', count: 6946, color: '#d8b4fe', num: 18 }
  ];

  container.innerHTML = elements.map(el => {
    const size = Math.min(100, Math.max(30, Math.log10(el.count) * 12));
    const alpha = Math.round(size * 2).toString(16).padStart(2,'0');
    return `
      <div class="pt-cell" style="background:${el.color}${alpha};border-color:${el.color}40"
           title="${el.name}: ${el.count.toLocaleString()} records">
        <div class="pt-count" style="color:${el.color}">${el.num}</div>
        <div class="pt-symbol" style="color:${el.color}">${el.sym}</div>
        <div class="pt-label">${el.name}</div>
        <div class="pt-count">${(el.count/1000).toFixed(0)}k</div>
      </div>
    `;
  }).join('');
}

function updateSP() {
  renderSPBar();
}
