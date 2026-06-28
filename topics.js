// ============================================================
// Topic Modeling Visualizations (LDA-style)
// Word Cloud + Heatmap + Time Series
// ============================================================

let activeTopicId = 1;
let topicTimeChart = null;

function initTopicModeling() {
  renderTopicList();
  renderWordCloud(activeTopicId);
  renderTopicTimeChart();
  renderTopicHeatmap();
}

// ===== TOPIC LIST SIDEBAR =====
function renderTopicList() {
  const container = document.getElementById('topicList');
  container.innerHTML = RW_DATA.topics.map(t => `
    <div class="topic-item ${t.id === activeTopicId ? 'active' : ''}" 
         data-topic="${t.id}" onclick="selectTopic(${t.id})">
      <div class="topic-item-num">Topic ${t.id} &bull; LDA</div>
      <div class="topic-item-name" style="color:${t.color}">${t.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
        <span style="font-size:0.68rem;color:#94a3b8">${t.weight}% weight</span>
        <span style="font-size:0.68rem;font-family:var(--font-mono);color:${t.color}">${(t.weight/100*70675).toFixed(0)} docs</span>
      </div>
      <div class="topic-item-bar-wrap">
        <div class="topic-item-bar" style="width:${(t.weight/22.4*100)}%;background:${t.color}"></div>
      </div>
    </div>
  `).join('');
}

function selectTopic(id) {
  activeTopicId = id;
  const topic = RW_DATA.topics.find(t => t.id === id);
  document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-topic="${id}"]`)?.classList.add('active');
  document.getElementById('topicCloudTitle').textContent = `Topic ${id}: ${topic.name}`;
  document.querySelector('.topic-weight-badge').textContent = `Weight: ${topic.weight}%`;
  renderWordCloud(id);
  updateTopicTimeChart(id);
}

// ===== WORD CLOUD (SVG-based) =====
function renderWordCloud(topicId) {
  const topic = RW_DATA.topics.find(t => t.id === topicId);
  const svg = document.getElementById('wordCloudSvg');
  const W = svg.parentElement.clientWidth || 580;
  const H = 320;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  // Sort by probability
  const words = [...topic.topWords].sort((a, b) => b.prob - a.prob);
  const maxProb = words[0].prob;
  const minProb = words[words.length - 1].prob;

  const fontScale = d => {
    const t = (d.prob - minProb) / (maxProb - minProb);
    return 12 + t * 42;
  };

  // Place words in spiral
  const placed = [];
  const cx = W / 2, cy = H / 2;

  words.forEach((w, i) => {
    const fs = fontScale(w);
    const angle = i % 2 === 0 ? 0 : Math.PI;
    const r = i * 30;
    const spiralX = cx + r * Math.cos(angle + i * 0.8);
    const spiralY = cy + r * Math.sin(angle + i * 0.8) * 0.55;

    const x = Math.max(fs * 2, Math.min(W - fs * 2, spiralX));
    const y = Math.max(fs, Math.min(H - fs, spiralY));

    const opacity = 0.5 + (w.prob / maxProb) * 0.5;
    const rotation = i < 2 ? 0 : (Math.random() > 0.7 ? -20 + Math.random() * 40 : 0);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', fs);
    text.setAttribute('font-family', 'Inter, sans-serif');
    text.setAttribute('font-weight', fs > 30 ? '800' : fs > 20 ? '700' : '500');
    text.setAttribute('fill', topic.color);
    text.setAttribute('opacity', opacity);
    text.setAttribute('transform', `rotate(${rotation},${x},${y})`);
    text.setAttribute('title', `P(w|t) = ${w.prob.toFixed(3)}`);
    text.textContent = w.word;

    // Hover effect
    text.addEventListener('mouseenter', function() {
      this.setAttribute('opacity', 1);
      this.setAttribute('fill', '#fff');
    });
    text.addEventListener('mouseleave', function() {
      this.setAttribute('opacity', opacity);
      this.setAttribute('fill', topic.color);
    });

    svg.appendChild(text);
  });

  // Add probability annotation for top word
  const annot = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  annot.setAttribute('x', W - 8);
  annot.setAttribute('y', H - 8);
  annot.setAttribute('text-anchor', 'end');
  annot.setAttribute('font-size', '9');
  annot.setAttribute('fill', '#475569');
  annot.setAttribute('font-family', 'JetBrains Mono, monospace');
  annot.textContent = `Top word P: ${words[0].prob.toFixed(3)}`;
  svg.appendChild(annot);
}

// ===== TOPIC TIME SERIES =====
function renderTopicTimeChart() {
  const ctx = document.getElementById('topicTimeChart');
  if (!ctx) return;

  const years = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];
  const topic = RW_DATA.topics.find(t => t.id === activeTopicId);

  topicTimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: RW_DATA.topics.map(t => ({
        label: t.name,
        data: t.yearlyWeight,
        borderColor: t.color,
        backgroundColor: t.color + '18',
        borderWidth: t.id === activeTopicId ? 3 : 1,
        pointRadius: t.id === activeTopicId ? 4 : 2,
        tension: 0.4,
        fill: t.id === activeTopicId
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 }
        },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e2540' } },
        y: {
          ticks: { color: '#64748b', callback: v => v + '%' },
          grid: { color: '#1e2540' },
          title: { display: true, text: 'Topic Weight (%)', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

function updateTopicTimeChart(topicId) {
  if (!topicTimeChart) return;
  topicTimeChart.data.datasets.forEach((ds, i) => {
    const t = RW_DATA.topics[i];
    ds.borderWidth = t.id === topicId ? 3 : 1;
    ds.pointRadius = t.id === topicId ? 4 : 2;
    ds.fill = t.id === topicId;
  });
  topicTimeChart.update();
}

// ===== TOPIC-TERM HEATMAP =====
function renderTopicHeatmap() {
  const container = document.getElementById('topicHeatmap');
  // Collect all unique top words
  const allWords = [...new Set(RW_DATA.topics.flatMap(t => t.topWords.slice(0,6).map(w => w.word)))];

  const table = document.createElement('table');
  table.className = 'heatmap-table';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th style="min-width:140px">Term</th>
    ${RW_DATA.topics.map(t => `<th style="color:${t.color}">${t.name.split(' ').slice(0,2).join(' ')}</th>`).join('')}
  </tr>`;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  allWords.forEach(word => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="color:#94a3b8;font-family:var(--font-mono)">${word}</td>` +
      RW_DATA.topics.map(t => {
        const w = t.topWords.find(w => w.word === word);
        const prob = w ? w.prob : 0;
        const intensity = Math.round(prob * 1000);
        const alpha = prob > 0 ? 0.1 + prob * 8 : 0;
        const bgColor = prob > 0 ? t.color : 'transparent';
        return `<td>
          <span class="hm-cell" style="background:${bgColor}${Math.round(alpha*255).toString(16).padStart(2,'0')};color:${prob > 0.05 ? '#fff' : '#64748b'}">
            ${prob > 0 ? prob.toFixed(3) : '–'}
          </span>
        </td>`;
      }).join('');
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}
