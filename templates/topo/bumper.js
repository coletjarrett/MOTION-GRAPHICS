// Topographic survey map bumper.
// Contours drift and settle, a route line draws across, title reveals.
const makeContours = (W, H, cell, seed, levels) => {
  const cols = Math.ceil(W/cell) + 1, rows = Math.ceil(H/cell) + 1;
  const V = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      V[y * cols + x] = K.fbm(x * cell * 0.0012, y * cell * 0.0012, seed, 4);
    }
  }
  const paths = [];
  const edgeMap = [ [], [3,0], [0,1], [3,1], [1,2], [0,3,1,2], [0,2], [3,2], [2,3], [2,0], [0,1,2,3], [2,1], [3,1], [1,0], [0,3], [] ];
  for (let l = 0; l < levels.length; l++) {
    const T = levels[l], path = new Path2D();
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        const v0 = V[y*cols+x], v1 = V[y*cols+x+1], v2 = V[(y+1)*cols+x+1], v3 = V[(y+1)*cols+x];
        const idx = (v0 >= T ? 1 : 0) | (v1 >= T ? 2 : 0) | (v2 >= T ? 4 : 0) | (v3 >= T ? 8 : 0);
        const edges = edgeMap[idx];
        if (!edges) continue;
        const div = (a, b) => Math.abs(a - b) < 1e-5 ? 0.5 : (T - a) / (b - a);
        const getPt = (e) => {
          if (e === 0) return [(x + div(v0, v1))*cell, y*cell];
          if (e === 1) return [(x+1)*cell, (y + div(v1, v2))*cell];
          if (e === 2) return [(x + div(v3, v2))*cell, (y+1)*cell];
          if (e === 3) return [x*cell, (y + div(v0, v3))*cell];
        };
        for (let i = 0; i < edges.length; i += 2) {
          const p1 = getPt(edges[i]), p2 = getPt(edges[i+1]);
          path.moveTo(p1[0], p1[1]); path.lineTo(p2[0], p2[1]);
        }
      }
    }
    paths.push({ path, major: l % 5 === 0 });
  }
  return paths;
};

K.template({
  id: 'topo-bumper', title: 'Program bumper', style: 'Topographic', type: 'Bumper / open',
  dur: 8, alpha: false,
  fonts: ['600 90px "Avenir Next Condensed"', 'italic 400 40px "Iowan Old Style"', '600 24px "Avenir Next Condensed"'],
  params: { title: 'Journeys of Faith', sub: 'Episode 2 · Across the Wilderness', bg: '#f3efe6', ink: '#2b302c', accent: '#cf6a36' },
  setup(c, p) {
    const W = K.W, H = K.H;
    const levels = [];
    for (let i = -0.6; i <= 0.6; i += 0.04) levels.push(i);
    p._paths = makeContours(W + 200, H + 200, 12, 42, levels);
    
    // Precompute elevation tint bands
    p._bands = K.cached('topo-bands', W + 200, H + 200, (ctx, w, h) => {
      const cell = 8;
      const cols = Math.ceil(w/cell) + 1, rows = Math.ceil(h/cell) + 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = K.fbm(x * cell * 0.0012, y * cell * 0.0012, 42, 4);
          let alpha = 0;
          if (v > 0.3) alpha = 0.12;
          else if (v > 0.1) alpha = 0.08;
          else if (v > -0.1) alpha = 0.04;
          
          if (alpha > 0) {
            ctx.fillStyle = K.rgba(p.ink, alpha);
            ctx.fillRect(x*cell, y*cell, cell, cell);
          }
        }
      }
    });
    
    const R = K.rand(100);
    const pts = [];
    let rx = W * 0.15, ry = H * 0.65;
    for (let i=0; i<6; i++) {
      pts.push([rx, ry]);
      rx += W * 0.15 + R() * 80;
      ry += (R() - 0.5) * 150;
    }
    p._routePts = K.catmull(pts, 20);
    
    // Label points along route
    p._labels = [];
    [0.2, 0.5, 0.8].forEach(k => {
      const pt = K.at(p._routePts, K.len(p._routePts) * k);
      p._labels.push(pt);
    });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W/2, cy = H/2;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    
    // Subtle elevation shading via background gradient
    const g = c.createRadialGradient(cx, cy, 200, cx, cy, W * 0.8);
    g.addColorStop(0, K.rgba(p.ink, 0.03));
    g.addColorStop(1, K.rgba(p.ink, 0.0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    c.save();
    // Drift and settle
    const drift = 1 - K.E(t, 0, 7, 'outExpo');
    c.translate(cx, cy);
    c.scale(1 + drift * 0.05, 1 + drift * 0.05);
    c.translate(-cx - 100 + drift * 40, -cy - 100 + drift * 20);
    
    // Draw on wipe
    const clipR = W * 1.5 * K.E(t, 0, 3, 'io5');
    c.beginPath(); c.arc(cx, cy, clipR, 0, K.TAU); c.clip();
    
    if (p._bands) c.drawImage(p._bands, 0, 0);
    
    // Contours
    p._paths.forEach(pt => {
      c.strokeStyle = pt.major ? K.rgba(p.ink, 0.45) : K.rgba(p.ink, 0.22);
      c.lineWidth = pt.major ? 1.5 : 1;
      c.stroke(pt.path);
    });
    c.restore();
    
    // Route line
    c.save();
    const routeProg = K.E(t, 1.5, 5.0, 'io');
    c.strokeStyle = p.accent; c.lineWidth = 5;
    c.setLineDash([12, 12]);
    K.draw(c, p._routePts, routeProg);
    
    // Nodes and labels
    p._labels.forEach((pt, i) => {
      const nodeStart = 1.5 + i * 0.8;
      const nk = K.E(t, nodeStart, nodeStart + 0.8, 'outBack');
      if (nk > 0) {
        c.fillStyle = p.bg;
        c.beginPath(); c.arc(pt[0], pt[1], 10 * nk, 0, K.TAU); c.fill();
        c.lineWidth = 3; c.strokeStyle = p.accent; c.stroke();
        c.fillStyle = p.accent;
        c.beginPath(); c.arc(pt[0], pt[1], 4 * nk, 0, K.TAU); c.fill();
        
        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          const lk = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.reveal(c, labels[i], pt[0] + 25, pt[1] + 6, { font: '24px Arial', color: p.ink, align: 'left', k: lk, mode: 'fade' });
        }
      }
    });
    c.restore();

    // Typography
    const out = K.E(t, 7.2, 7.8, 'in');
    c.globalAlpha = 1 - out;
    const ty = cy - 20;
    
    // Title background plate
    const wT = K.width(c, p.title.toUpperCase(), K.font(90, 'Avenir Next Condensed', 600), 8) + 120;
    const wS = K.width(c, p.sub, K.font(40, 'Iowan Old Style', 400, 'italic'), 1) + 80;
    const plateW = Math.max(wT, wS);
    const plateK = K.E(t, 1.8, 2.8, 'outExpo');
    if (plateK > 0) {
      c.fillStyle = K.rgba(p.bg, 0.85);
      c.shadowColor = 'rgba(0,0,0,0.1)'; c.shadowBlur = 20; c.shadowOffsetY = 10;
      K.rr(c, cx - plateW/2 * plateK, ty - 100, plateW * plateK, 200, 4);
      c.fill();
      c.shadowColor = 'transparent';
    }

    K.reveal(c, p.title.toUpperCase(), cx, ty, { font: K.font(90, 'Avenir Next Condensed', 600), color: p.ink, track: 8, align: 'center', k: K.P(t, 2, 3.5), mode: 'track', stagger: .2 });
    K.reveal(c, p.sub, cx, ty + 60, { font: K.font(40, 'Iowan Old Style', 400, 'italic'), color: p.accent, track: 1, align: 'center', k: K.P(t, 2.5, 3.5), mode: 'fade', stagger: .3 });

    // Texture
    K.grain(c, t, .04);
  }
});
