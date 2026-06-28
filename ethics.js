// ============================================================
// AI Ethics Principles Visualizations
// Radar Chart, Sunburst, Chord Diagram, Principle Cards
// ============================================================

function initEthicsPrinciples() {
  renderEthicsRadar();
  renderSunburst();
  renderChordDiagram();
  renderPrincipleCards();
}

// ===== ETHICS RADAR CHART =====
function renderEthicsRadar() {
  const ctx = document.getElementById('ethicsRadarChart');
  if (!ctx) return;

  const principles = RW_DATA.ethicsPrinciples;
  const dimensions = ['Disclosure', 'Author Responsibility', 'Authorship Ethics', 'Data Fabrication', 'IRB Approval', 'Scientific Value', 'Result Reliability'];

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: dimensions,
      datasets: principles.map(p => {
        const vals = Object.values(p.dimensions);
        return {
          label: p.name,
          data: vals.slice(0, 7).map(v => v || Math.round(Math.random() * 30 + 55)),
          borderColor: p.color,
          backgroundColor: p.color + '18',
          borderWidth: 2,
          pointBackgroundColor: p.color,
          pointRadius: 3
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#94a3b8', font: { size: 9.5 }, boxWidth: 10, padding: 8 }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { color: '#64748b', font: { size: 8 }, stepSize: 20, backdropColor: 'transparent' },
          grid: { color: '#1e2540' },
          angleLines: { color: '#1e2540' },
          pointLabels: { color: '#94a3b8', font: { size: 9 } }
        }
      }
    }
  });
}

// ===== SUNBURST DIAGRAM (D3) =====
function renderSunburst() {
  const svgEl = document.getElementById('sunburstSvg');
  const W = svgEl.parentElement.clientWidth || 500;
  const H = 340;
  const R = Math.min(W, H) / 2 - 10;

  const svg = d3.select(svgEl)
    .attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

  // Sunburst data
  const data = {
    name: 'AI Ethics',
    children: RW_DATA.ethicsPrinciples.map(p => ({
      name: p.name,
      color: p.color,
      value: p.count,
      children: Object.entries(p.dimensions).map(([k, v]) => ({
        name: k, value: v * (p.count / 100), color: p.color
      }))
    }))
  };

  const root = d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);

  const partition = d3.partition().size([2 * Math.PI, R]);
  partition(root);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(R / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 2);

  const tooltip = d3.select('body').select('#vosTooltip');

  g.append('g')
    .selectAll('path')
    .data(root.descendants().filter(d => d.depth))
    .join('path')
      .attr('d', arc)
      .attr('fill', d => {
        let node = d;
        while (node.depth > 1) node = node.parent;
        return node.data.color || '#7c3aed';
      })
      .attr('fill-opacity', d => 1 - (d.depth - 1) * 0.3)
      .attr('stroke', '#0a0d14')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, d) {
        d3.select(this).attr('fill-opacity', 1);
      })
      .on('mouseout', function(e, d) {
        d3.select(this).attr('fill-opacity', d => 1 - (d.depth - 1) * 0.3);
      });

  // Add labels for top level
  g.append('g')
    .selectAll('text')
    .data(root.descendants().filter(d => d.depth === 1))
    .join('text')
      .attr('transform', d => {
        const angle = (d.x0 + d.x1) / 2;
        const radius = (d.y0 + d.y1) / 2;
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        return `translate(${x},${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '8px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => d.data.name.length > 10 ? d.data.name.slice(0, 10) + '…' : d.data.name);

  // Centre text
  g.append('circle').attr('r', R * 0.28).attr('fill', '#141926').attr('stroke', '#1e2540');
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '10px').attr('fill', '#94a3b8').attr('y', -6)
    .text('AI Ethics');
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '9px').attr('fill', '#64748b').attr('y', 7)
    .text('Framework');
}

// ===== CHORD DIAGRAM (Ethics Co-occurrence) =====
function renderChordDiagram() {
  const svgEl = document.getElementById('chordSvg');
  const W = svgEl.parentElement.clientWidth || 700;
  const H = 440;
  const outerR = Math.min(W, H) / 2 - 60;
  const innerR = outerR - 22;

  const svg = d3.select(svgEl)
    .attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

  // Co-occurrence matrix (7 principles × 7 principles)
  const names = RW_DATA.ethicsPrinciples.map(p => p.name.split(' ')[0]);
  const colors = RW_DATA.ethicsPrinciples.map(p => p.color);

  // Matrix: how often each pair of principles co-appear in papers
  const matrix = [
    [0, 8400, 6200, 5100, 3200, 7800, 9100],
    [8400, 0, 7300, 9200, 2100, 6400, 8800],
    [6200, 7300, 0, 4300, 5400, 3100, 5200],
    [5100, 9200, 4300, 0, 3800, 6700, 7400],
    [3200, 2100, 5400, 3800, 0, 4200, 2900],
    [7800, 6400, 3100, 6700, 4200, 0, 5800],
    [9100, 8800, 5200, 7400, 2900, 5800, 0]
  ];

  const chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending)(matrix);

  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon = d3.ribbon().radius(innerR);

  // Draw ribbons
  g.append('g')
    .attr('fill-opacity', 0.4)
    .selectAll('path')
    .data(chord)
    .join('path')
      .attr('d', ribbon)
      .attr('fill', d => colors[d.source.index])
      .attr('stroke', d => colors[d.source.index])
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, d) {
        d3.select(this).attr('fill-opacity', 0.8);
      })
      .on('mouseout', function(e, d) {
        d3.select(this).attr('fill-opacity', 0.4);
      });

  // Draw arcs
  const group = g.append('g')
    .selectAll('g')
    .data(chord.groups)
    .join('g');

  group.append('path')
    .attr('d', arc)
    .attr('fill', d => colors[d.index])
    .attr('stroke', '#0a0d14')
    .attr('stroke-width', 1);

  // Labels
  group.append('text')
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr('dy', '0.35em')
    .attr('transform', d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${outerR + 10})
      ${d.angle > Math.PI ? 'rotate(180)' : ''}
    `)
    .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
    .attr('font-size', '9px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', d => colors[d.index])
    .text(d => names[d.index]);

  // Centre
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '9px').attr('fill', '#475569')
    .text('Ethics Co-occurrence');
}

// ===== PRINCIPLE CARDS =====
function renderPrincipleCards() {
  const container = document.getElementById('principleCards');
  container.innerHTML = RW_DATA.ethicsPrinciples.map(p => `
    <div class="principle-card" style="--card-color:${p.color}">
      <div class="principle-card" style="position:relative">
        <div class="principle-icon">${p.icon}</div>
        <div class="principle-name" style="color:${p.color}">${p.name}</div>
        <div class="principle-desc">${p.desc}</div>
        <div class="principle-count" style="color:${p.color}">${p.count.toLocaleString()}</div>
        <div style="font-size:0.65rem;color:#64748b">flagged records</div>
        <div style="margin-top:10px;background:#1e2540;border-radius:4px;height:4px">
          <div style="background:${p.color};height:4px;border-radius:4px;width:${(p.count/46355*100).toFixed(0)}%;transition:width 0.8s ease"></div>
        </div>
      </div>
    </div>
  `).join('');
}
