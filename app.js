/* ==========================================
   ETHICAL-AI & TELEMETRY INTERACTIVE JS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  let isRealTimeActive = false;
  let realTimeInterval = null;

  // --- Tab Navigation Switcher ---
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      item.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // --- Theme Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });

  // --- Mobile Sidebar Toggle ---
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // --- Chart.js Defaults ---
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = '#9ca3af';

  function getGridColor() {
    return document.body.classList.contains('light-theme') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  }

  // 1. Governance Line Chart
  const ctxLine = document.getElementById('lineTrendChart').getContext('2d');
  const lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          label: 'AI Inferences',
          data: [14200, 18500, 24100, 31200, 28900, 34500],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.15)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Active Users',
          data: [3100, 4200, 6800, 9500, 8900, 11200],
          borderColor: '#06b6d4',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { grid: { color: getGridColor() } }, y: { grid: { color: getGridColor() } } }
    }
  });

  // 2. Governance Safety Doughnut
  const ctxDoughnut = document.getElementById('doughnutSourcesChart').getContext('2d');
  new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: ['Fairness & Bias Verified', 'Hallucination Blocked', 'Data Privacy Shield', 'Safety Guardrail Clear'],
      datasets: [{ data: [45, 25, 20, 10], backgroundColor: ['#10b981', '#6366f1', '#06b6d4', '#8b5cf6'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
  });

  // 3. Biometric Reaction Watch Line Chart
  const ctxBioLine = document.getElementById('bioLineChart').getContext('2d');
  const bioLineChart = new Chart(ctxBioLine, {
    type: 'line',
    data: {
      labels: ['10s ago', '8s ago', '6s ago', '4s ago', '2s ago', 'Now'],
      datasets: [
        {
          label: 'Heart Rate (BPM)',
          data: [68, 70, 74, 72, 71, 73],
          borderColor: '#ef4444',
          borderWidth: 3,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'Reaction Velocity (ms)',
          data: [195, 188, 179, 184, 182, 180],
          borderColor: '#ec4899',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: getGridColor() } },
        y: { type: 'linear', position: 'left', min: 50, max: 120, grid: { color: getGridColor() } },
        y1: { type: 'linear', position: 'right', min: 100, max: 300, grid: { drawOnChartArea: false } }
      }
    }
  });

  // 4. Biometric Cognitive Radar Chart
  const ctxBioRadar = document.getElementById('bioRadarChart').getContext('2d');
  new Chart(ctxBioRadar, {
    type: 'radar',
    data: {
      labels: ['Attention Focus', 'Calmness', 'Reflex Speed', 'SpO2 Saturation', 'Vagal Tone', 'Thermal Balance'],
      datasets: [{
        label: 'Subject Metrics',
        data: [92, 84, 96, 99, 88, 91],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236,72,153,0.2)'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 50, suggestedMax: 100 } } }
  });

  // --- OS Processes Data ---
  const sampleProcesses = [
    { pid: '1024', name: 'python3 (Ethical-AI Kernel)', user: 'SYSTEM', cpu: '14.2%', mem: '1.2 GB', priority: 'High', status: 'Running' },
    { pid: '2048', name: 'reaction_watch_daemon', user: 'telemetry', cpu: '4.8%', mem: '340 MB', priority: 'Realtime', status: 'Running' },
    { pid: '3092', name: 'nvml_gpu_governor', user: 'SYSTEM', cpu: '8.1%', mem: '890 MB', priority: 'Normal', status: 'Running' },
    { pid: '4110', name: 'node_dashboard_service', user: 'admin', cpu: '2.5%', mem: '410 MB', priority: 'Normal', status: 'Running' },
    { pid: '5820', name: 'db_reaction_watch_log', user: 'postgres', cpu: '1.9%', mem: '680 MB', priority: 'Normal', status: 'Sleeping' }
  ];

  function renderOsProcesses(items) {
    const body = document.getElementById('os-process-body');
    if (!body) return;
    body.innerHTML = '';
    items.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono" style="color:var(--accent-secondary); font-weight:600;">${p.pid}</td>
        <td style="font-weight:600;">${p.name}</td>
        <td>${p.user}</td>
        <td class="font-mono" style="color:var(--accent-warning);">${p.cpu}</td>
        <td class="font-mono">${p.mem}</td>
        <td><span class="badge badge-info">${p.priority}</span></td>
        <td><span class="badge badge-success">${p.status}</span></td>
      `;
      body.appendChild(tr);
    });
  }
  renderOsProcesses(sampleProcesses);

  const procSearch = document.getElementById('process-search');
  if (procSearch) {
    procSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderOsProcesses(sampleProcesses.filter(p => p.name.toLowerCase().includes(q) || p.pid.includes(q)));
    });
  }

  // --- Reaction Watch Telemetry Database Logs ---
  const sampleDbLogs = [
    { id: 'REC-9012', time: '14:28:42', speed: '178 ms', hr: '74 BPM', spo2: '99%', stress: '22 / 100', trigger: 'Visual Stimulus Flash A' },
    { id: 'REC-9011', time: '14:27:10', speed: '184 ms', hr: '72 BPM', spo2: '99%', stress: '24 / 100', trigger: 'Auditory Tone Ping' },
    { id: 'REC-9010', time: '14:25:02', speed: '192 ms', hr: '76 BPM', spo2: '98%', stress: '28 / 100', trigger: 'Tactile Watch Vibration' },
    { id: 'REC-9009', time: '14:22:15', speed: '181 ms', hr: '71 BPM', spo2: '99%', stress: '21 / 100', trigger: 'Cognitive Choice Reflex' },
    { id: 'REC-9008', time: '14:18:50', speed: '189 ms', hr: '73 BPM', spo2: '99%', stress: '25 / 100', trigger: 'Baseline Sync Event' }
  ];

  function renderDbLogs(items) {
    const body = document.getElementById('db-table-body');
    if (!body) return;
    body.innerHTML = '';
    items.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono" style="color:var(--accent-pink); font-weight:600;">${d.id}</td>
        <td class="font-mono">${d.time}</td>
        <td class="font-mono" style="font-weight:700; color:var(--accent-success);">${d.speed}</td>
        <td class="font-mono" style="color:var(--accent-danger);">${d.hr}</td>
        <td class="font-mono">${d.spo2}</td>
        <td><span class="badge badge-info">${d.stress}</span></td>
        <td style="font-weight:500;">${d.trigger}</td>
      `;
      body.appendChild(tr);
    });
  }
  renderDbLogs(sampleDbLogs);

  const dbSearch = document.getElementById('db-search');
  if (dbSearch) {
    dbSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderDbLogs(sampleDbLogs.filter(d => d.id.toLowerCase().includes(q) || d.trigger.toLowerCase().includes(q)));
    });
  }

  // --- Real-time Simulation Engine ---
  const realTimeBtn = document.getElementById('realtime-toggle');
  realTimeBtn.addEventListener('click', () => {
    isRealTimeActive = !isRealTimeActive;
    if (isRealTimeActive) {
      realTimeBtn.classList.add('active-sim');
      realTimeBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Pause Live Stream</span>';

      realTimeInterval = setInterval(() => {
        // Pulse OS CPU meter
        const newCpu = Math.floor(25 + Math.random() * 25);
        document.getElementById('cpu-percent').textContent = newCpu + '%';
        document.getElementById('cpu-bar').style.width = newCpu + '%';

        // Pulse Heart Rate
        const newHr = Math.floor(68 + Math.random() * 8);
        document.getElementById('bio-hr').innerHTML = `${newHr} <small>BPM</small>`;

        // Shift Biometric line chart
        const lastIdx = bioLineChart.data.datasets[0].data.length - 1;
        bioLineChart.data.datasets[0].data[lastIdx] = newHr;
        bioLineChart.data.datasets[1].data[lastIdx] = Math.floor(175 + Math.random() * 15);
        bioLineChart.update('none');
      }, 1200);
    } else {
      realTimeBtn.classList.remove('active-sim');
      realTimeBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Simulate Live</span>';
      clearInterval(realTimeInterval);
    }
  });

  // CSV Export Trigger
  document.querySelectorAll('.export-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      let csv = "Event ID,Timestamp,Reaction Time,Heart Rate,SpO2,Stress Score,Trigger\n";
      sampleDbLogs.forEach(l => { csv += `${l.id},${l.time},${l.speed},${l.hr},${l.spo2},${l.stress},"${l.trigger}"\n`; });
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + csv));
      link.setAttribute("download", "reaction_watch_telemetry_db.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
});
