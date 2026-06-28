// ============================================================
// MAIN APP — Tab navigation, Overview charts, KPI counters
// ============================================================

// ===== TAB NAVIGATION =====
document.getElementById('tabNav')?.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  const tab = btn.dataset.tab;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById(`tab-${tab}`)?.classList.add('active');

  // Lazy-init visualizations on first open
  if (tab === 'vosviewer' && !vosSimulation) initVOSviewer();
  if (tab === 'topics' && !topicTimeChart) initTopicModeling();
  if (tab === 'scientopy' && !spBarChart) initSciencePy();
  if (tab === 'bibliometrics') initBibliometrics();
  if (tab === 'ethics') initEthicsPrinciples();
});

// ===== KPI COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.kpi-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ===== OVERVIEW CHARTS =====
function initOverview() {
  renderGrowthChart();
  renderPrinciplesPieChart();
  renderKeywordsBarChart();
  renderDomainsRadarChart();
  renderDocTypesChart();
  renderCountriesChart();
  renderPublishersChart();
}

function renderGrowthChart() {
  const ctx = document.getElementById('growthChart');
  if (!ctx) return;

  const recentYears = RW_DATA.byYear.filter(y => y.year >= 2010);
  const years = recentYears.map(y => y.year);
  const counts = recentYears.map(y => y.count);
  // Citations: simulated as 8x retractions (cumulative lag)
  const citations = counts.map((c, i) => Math.round(c * (3 + i * 0.3)));

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Retractions',
          data: counts,
          backgroundColor: ctx => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, '#7c3aed');
            gradient.addColorStop(1, '#7c3aed44');
            return gradient;
          },
          borderColor: '#7c3aed',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Citation Impact (÷100)',
          data: citations.map(c => Math.round(c / 100)),
          type: 'line',
          borderColor: '#06b6d4',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#06b6d4',
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.datasetIndex === 0) return ` Retractions: ${ctx.parsed.y.toLocaleString()}`;
              return ` Citations (÷100): ${ctx.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e2540' } },
        y: {
          ticks: { color: '#64748b', callback: v => v.toLocaleString() },
          grid: { color: '#1e2540' },
          position: 'left'
        },
        y2: {
          ticks: { color: '#06b6d4', font: { size: 9 } },
          grid: { display: false },
          position: 'right'
        }
      }
    }
  });
}

function renderPrinciplesPieChart() {
  const ctx = document.getElementById('principlesPieChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: RW_DATA.byNature.map(n => n.name),
      datasets: [{
        data: RW_DATA.byNature.map(n => n.count),
        backgroundColor: RW_DATA.byNature.map(n => n.color + 'cc'),
        borderColor: RW_DATA.byNature.map(n => n.color),
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12, padding: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${(ctx.parsed / 70675 * 100).toFixed(1)}%)`
          }
        }
      }
    },
    plugins: [{
      id: 'centreText',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const cx = (left + right) / 2, cy = (top + bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 22px Inter';
        ctx.fillText('70,675', cx, cy - 4);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter';
        ctx.fillText('Total Records', cx, cy + 14);
        ctx.restore();
      }
    }]
  });
}

function renderKeywordsBarChart() {
  const ctx = document.getElementById('keywordsBarChart');
  if (!ctx) return;

  const top10 = RW_DATA.topReasons.slice(0, 10);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(r => r.short),
      datasets: [{
        data: top10.map(r => r.count),
        backgroundColor: top10.map((_, i) => `hsl(${250 + i * 12},70%,60%)88`),
        borderColor: top10.map((_, i) => `hsl(${250 + i * 12},70%,60%)`),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', callback: v => (v/1000).toFixed(0)+'k' }, grid: { color: '#1e2540' } },
        y: { ticks: { color: '#94a3b8', font: { size: 9.5 } }, grid: { display: false } }
      }
    }
  });
}

function renderDomainsRadarChart() {
  const ctx = document.getElementById('domainsRadarChart');
  if (!ctx) return;

  const subjects = RW_DATA.topSubjects.slice(0, 8);

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: subjects.map(s => s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name),
      datasets: [
        {
          label: 'Retraction Count',
          data: subjects.map(s => s.count),
          borderColor: '#7c3aed',
          backgroundColor: '#7c3aed22',
          borderWidth: 2,
          pointBackgroundColor: '#7c3aed',
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 9 } } } },
      scales: {
        r: {
          ticks: { color: '#64748b', font: { size: 7 }, backdropColor: 'transparent', callback: v => (v/1000).toFixed(0)+'k' },
          grid: { color: '#1e2540' },
          angleLines: { color: '#1e2540' },
          pointLabels: { color: '#94a3b8', font: { size: 8 } }
        }
      }
    }
  });
}

function renderDocTypesChart() {
  const ctx = document.getElementById('docTypesChart');
  if (!ctx) return;

  const types = RW_DATA.articleTypes;

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: types.map(t => t.name),
      datasets: [{
        data: types.map(t => t.count),
        backgroundColor: types.map(t => t.color + '99'),
        borderColor: types.map(t => t.color),
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10, padding: 6 }
        }
      },
      scales: {
        r: {
          ticks: { color: '#64748b', font: { size: 7 }, backdropColor: 'transparent' },
          grid: { color: '#1e2540' }
        }
      }
    }
  });
}

function renderCountriesChart() {
  const ctx = document.getElementById('countriesChart');
  if (!ctx) return;
  const top10 = RW_DATA.topCountries.slice(0, 10);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(c => c.flag + ' ' + c.name),
      datasets: [{
        label: 'Retractions',
        data: top10.map(c => c.count),
        backgroundColor: [
          '#f43f5ecc','#7c3aedcc','#06b6d4cc','#f59e0bcc','#10b981cc',
          '#ec4899cc','#8b5cf6cc','#0ea5e9cc','#f97316cc','#14b8a6cc'
        ],
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', callback: v => (v/1000).toFixed(0)+'k' }, grid: { color: '#1e2540' } },
        y: { ticks: { color: '#94a3b8', font: { size: 9.5 } }, grid: { display: false } }
      }
    }
  });
}

function renderPublishersChart() {
  const ctx = document.getElementById('publishersChart');
  if (!ctx) return;
  const pubs = RW_DATA.topPublishers.slice(0, 10);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: pubs.map(p => p.name),
      datasets: [{
        label: 'Retractions',
        data: pubs.map(p => p.count),
        backgroundColor: pubs.map(p => p.color + 'cc'),
        borderColor: pubs.map(p => p.color),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 35 }, grid: { color: '#1e2540' } },
        y: { ticks: { color: '#64748b', callback: v => (v/1000).toFixed(0)+'k' }, grid: { color: '#1e2540' } }
      }
    }
  });
}

// ===== EXPORT BUTTON =====
document.getElementById('exportBtn')?.addEventListener('click', () => {
  const data = {
    source: 'Retraction Watch CSV — AI Ethics Framework Dashboard',
    generated: new Date().toISOString(),
    totalRecords: RW_DATA.totalRecords,
    byYear: RW_DATA.byYear,
    topCountries: RW_DATA.topCountries,
    topReasons: RW_DATA.topReasons,
    topJournals: RW_DATA.topJournals,
    topPublishers: RW_DATA.topPublishers,
    topics: RW_DATA.topics.map(t => ({ id: t.id, name: t.name, weight: t.weight }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-ethics-dashboard-data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initOverview();
  // Init VOSviewer immediately since it's a heavy viz
  setTimeout(() => initVOSviewer(), 200);
});
