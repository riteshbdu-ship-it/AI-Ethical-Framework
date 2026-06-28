// ============================================================
// VOSviewer-Style Interactive Network Visualization
// Using D3.js Force Simulation
// ============================================================

const CLUSTER_COLORS = [
  '#f43f5e', // 0 - Paper Mills / Peer Review
  '#7c3aed', // 1 - Data Fabrication
  '#06b6d4', // 2 - Plagiarism / Duplication
  '#f59e0b', // 3 - AI / Policy
  '#10b981', // 4 - Authorship
  '#ec4899', // 5 - Ethics / Consent
  '#0ea5e9'  // 6 - Publisher / Institutional
];

const CLUSTER_NAMES = [
  'Paper Mills & Fake Review',
  'Data Fabrication & Fraud',
  'Plagiarism & Duplication',
  'AI Content & Policy Breach',
  'Authorship & Attribution',
  'Ethics & Consent',
  'Publisher Accountability'
];

let vosSimulation = null;
let currentVosData = null;

function initVOSviewer() {
  const svg = d3.select('#vosNetwork');
  const container = document.querySelector('.vos-container');
  const W = container.clientWidth || 900;
  const H = container.clientHeight || 520;

  svg.attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  // Background gradient
  const defs = svg.append('defs');
  const bgGrad = defs.append('radialGradient').attr('id','vosBg');
  bgGrad.append('stop').attr('offset','0%').attr('stop-color','#141926');
  bgGrad.append('stop').attr('offset','100%').attr('stop-color','#0a0d14');
  svg.append('rect').attr('width',W).attr('height',H).attr('fill','url(#vosBg)');

  // Arrow markers for links
  CLUSTER_COLORS.forEach((c, i) => {
    defs.append('marker')
      .attr('id', `arrow-${i}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', c)
        .attr('opacity', 0.6);
  });

  const g = svg.append('g').attr('class','vos-root');

  // Zoom & Pan
  const zoom = d3.zoom()
    .scaleExtent([0.3, 4])
    .on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

  const rawData = RW_DATA.vosNetwork.keyword;
  const nodes = rawData.nodes.map(n => ({
    ...n,
    x: n.x * W,
    y: n.y * H
  }));
  const links = rawData.links.map(l => ({ ...l }));

  currentVosData = { nodes, links };

  // Force simulation
  vosSimulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => 120 / d.strength).strength(d => d.strength * 0.3))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => radiusScale(d.weight) + 10))
    .alphaDecay(0.03);

  const radiusScale = d3.scaleSqrt().domain([1000, 30000]).range([8, 36]).clamp(true);
  const opacityScale = d3.scaleLinear().domain([0.3, 1]).range([0.15, 0.6]);

  // Links
  const link = g.append('g').attr('class','links').selectAll('line')
    .data(links).join('line')
      .attr('stroke', d => {
        const src = nodes.find(n => n.id === (d.source.id ?? d.source));
        return CLUSTER_COLORS[src?.cluster ?? 0];
      })
      .attr('stroke-opacity', d => opacityScale(d.strength))
      .attr('stroke-width', d => d.strength * 3);

  // Node groups
  const node = g.append('g').attr('class','nodes').selectAll('g')
    .data(nodes).join('g')
      .attr('class','vos-node')
      .call(d3.drag()
        .on('start', (e, d) => {
          if (!e.active) vosSimulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) vosSimulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

  // Outer glow ring
  node.append('circle')
    .attr('r', d => radiusScale(d.weight) + 6)
    .attr('fill', d => CLUSTER_COLORS[d.cluster])
    .attr('opacity', 0.12)
    .attr('class', 'node-glow');

  // Main node circle
  node.append('circle')
    .attr('r', d => radiusScale(d.weight))
    .attr('fill', d => CLUSTER_COLORS[d.cluster])
    .attr('fill-opacity', 0.85)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.4);

  // Node labels
  node.append('text')
    .text(d => d.label)
    .attr('dy', d => radiusScale(d.weight) + 13)
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', '#cbd5e1')
    .attr('pointer-events', 'none');

  // Tooltip interaction
  const tooltip = document.getElementById('vosTooltip');
  const infoPanel = document.getElementById('vosInfoPanel');

  node
    .on('mouseover', (e, d) => {
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>${d.label}</strong><br>
        Count: <span style="color:#a78bfa">${d.weight.toLocaleString()}</span><br>
        Cluster: <span style="color:${CLUSTER_COLORS[d.cluster]}">${CLUSTER_NAMES[d.cluster]}</span>`;
      // Highlight connected
      link.attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.05);
      node.select('circle:last-of-type').attr('fill-opacity', n => {
        if (n.id === d.id) return 1;
        const conn = links.some(l => (l.source.id === n.id && l.target.id === d.id) || (l.source.id === d.id && l.target.id === n.id));
        return conn ? 0.9 : 0.25;
      });
    })
    .on('mousemove', e => {
      const r = document.querySelector('.vos-container').getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left + 12) + 'px';
      tooltip.style.top = (e.clientY - r.top - 10) + 'px';
    })
    .on('mouseout', () => {
      tooltip.style.display = 'none';
      link.attr('stroke-opacity', d => opacityScale(d.strength));
      node.select('circle:last-of-type').attr('fill-opacity', 0.85);
    })
    .on('click', (e, d) => {
      const conns = links.filter(l => l.source.id === d.id || l.target.id === d.id);
      const connNodes = [...new Set(conns.flatMap(l => [l.source.id, l.target.id]).filter(id => id !== d.id))];
      const connLabels = connNodes.map(id => nodes.find(n => n.id === id)?.label).filter(Boolean);
      infoPanel.innerHTML = `
        <h4 style="color:${CLUSTER_COLORS[d.cluster]}">${d.label}</h4>
        <p>Records: <strong style="color:#f1f5f9">${d.weight.toLocaleString()}</strong></p>
        <p>Cluster: ${CLUSTER_NAMES[d.cluster]}</p>
        <p style="margin-top:6px">Connected to:</p>
        <p style="color:#a78bfa">${connLabels.join(' · ') || 'None'}</p>
      `;
    });

  // Tick
  vosSimulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // Build legend
  const legend = document.getElementById('vosLegend');
  legend.innerHTML = '<div style="font-size:0.7rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Clusters</div>' +
    CLUSTER_NAMES.map((n, i) => `
      <div class="vos-legend-item">
        <span class="vos-legend-dot" style="background:${CLUSTER_COLORS[i]}"></span>
        <span>${n}</span>
      </div>
    `).join('');

  // Update stats
  document.getElementById('vosNodeCount').textContent = nodes.length;
  document.getElementById('vosLinkCount').textContent = links.length;
  document.getElementById('vosClusterCount').textContent = CLUSTER_COLORS.length;
}

// Reset
document.getElementById('vosReset')?.addEventListener('click', () => {
  if (vosSimulation) {
    vosSimulation.alpha(0.5).restart();
  }
  d3.select('#vosNetwork g.vos-root')
    .transition().duration(600)
    .attr('transform', 'translate(0,0) scale(1)');
});

// Min links filter
document.getElementById('minLinks')?.addEventListener('input', function() {
  document.getElementById('minLinksVal').textContent = this.value;
});
