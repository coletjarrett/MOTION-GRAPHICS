// Topographic chapter card.
// Deep forest background, subtle contours, and elegant typography.
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
  id: 'topo-chapter', title: 'Chapter card', style: 'Topographic', type: 'Title',
  dur: 6, alpha: false,
  fonts: ['600 50px "Avenir Next Condensed"', 'italic 400 90px "Iowan Old Style"'],
  params: { pre: 'Part Two', title: 'The Wilderness Years', bg: '#1a2421', ink: '#e8eedf', accent: '#d96c42' },
  setup(c, p) {
    const W = K.W, H = K.H;
    p._paper = K.paper(W, H, 42, p.bg, { blot: 0.3 });
    const levels = [];
    for(let i = -0.5; i <= 0.5; i += 0.035) levels.push(i);
    p._paths = makeContours(W + 200, H + 200, 12, 10, levels);
    
    // Generate accent path
    const R = K.rand(12);
    const pts = [];
    let rx = -100, ry = H * 0.3;
    for (let i=0; i<8; i++) {
      pts.push([rx, ry]);
      rx += W * 0.2 + R() * 100;
      ry += (R() - 0.5) * 300;
    }
    p._accentPts = K.catmull(pts, 20);
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W/2, cy = H/2;
    c.drawImage(p._paper, 0, 0);
    
    // Draw subtle contours
    c.save();
    const drift = t * 6;
    c.translate(cx, cy);
    c.scale(1.05, 1.05);
    c.translate(-cx - 100 - drift, -cy - 100 + drift * 0.3);
    
    // Animate map drawing on via soft radial mask
    const clipR = W * 1.2 * K.E(t, 0, 4, 'io');
    c.beginPath(); c.arc(cx + 100 + drift, cy + 100 - drift*0.3, clipR, 0, K.TAU); c.clip();
    
    p._paths.forEach(pt => {
      c.strokeStyle = pt.major ? K.rgba(p.ink, 0.55) : K.rgba(p.ink, 0.25);
      c.lineWidth = pt.major ? 1.5 : 1;
      c.stroke(pt.path);
    });
    c.restore();
    
    // Drawn-on accent contour
    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 2.5;
    c.beginPath();
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();

    // Typography
    const out = K.E(t, 5, 5.8, 'in');
    c.globalAlpha = 1 - out;
    
    const fP = K.font(50, 'Avenir Next Condensed', 600);
    const fT = K.font(90, 'Iowan Old Style', 400, 'italic');
    
    // Accent line separator
    const lineW = 100;
    const lineK = K.E(t, 0.5, 1.5, 'outBack');
    if (lineK > 0) {
      c.strokeStyle = p.accent; c.lineWidth = 3;
      c.beginPath(); c.moveTo(cx - lineW/2 * lineK, cy - 10); c.lineTo(cx + lineW/2 * lineK, cy - 10); c.stroke();
    }
    
    K.reveal(c, p.pre.toUpperCase(), cx, cy - 60, { font: fP, color: p.accent, track: 8, align: 'center', k: K.P(t, 0.8, 2.0), mode: 'track', stagger: 0.3 });
    K.reveal(c, p.title, cx, cy + 65, { font: fT, color: p.ink, track: 1, align: 'center', k: K.P(t, 1.2, 2.5), mode: 'rise', dist: 30, stagger: 0.4 });
    
    // Extra grain
    K.grain(c, t, .03);
  }
});
