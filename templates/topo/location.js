// Topographic location tag.
// Alpha overlay with a contour map inset and animated coordinates.
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
  id: 'topo-location', title: 'Location tag', style: 'Topographic', type: 'Lower third',
  dur: 7, alpha: true,
  fonts: ['600 60px "Avenir Next Condensed"', 'italic 400 34px "Iowan Old Style"'],
  params: { name: 'Mount Sinai (traditional site)', coords: '28.54° N · 33.97° E', ink: '#2b302c', accent: '#cf6a36', bg: '#f3efe6', x: 200, y: 850 },
  setup(c, p) {
    const levels = [];
    for(let i = -0.6; i <= 0.6; i += 0.05) levels.push(i);
    p._paths = makeContours(200, 200, 8, 88, levels);
  },
  draw(c, t, p) {
    const { x, y } = p;
    const fN = K.font(60, 'Avenir Next Condensed', 600);
    const fC = K.font(34, 'Iowan Old Style', 400, 'italic');
    
    // Legibility scrim
    const out = K.E(t, 5.7, 6.5, 'in');
    const sc = K.E(t, 0.2, 1.2) * (1 - out);
    if (sc > 0) {
      const wN = K.width(c, p.name, fN, 1);
      const wC = K.width(c, p.coords, fC, 0);
      const w = Math.max(wN, wC) + 200;
      c.save(); c.filter = 'blur(40px)'; c.fillStyle = `rgba(255,255,255,${0.6 * sc})`;
      c.fillRect(x - 100, y - 100, w + 100, 180);
      c.restore();
    }
    
    // Inset animation
    const inK = K.E(t, 0.2, 1.0, 'outBack');
    const kA = inK * (1 - out);
    
    if (kA > 0) {
      c.save();
      c.translate(x, y);
      c.scale(kA, kA);
      
      // Circle background
      c.fillStyle = p.bg;
      c.shadowColor = 'rgba(0,0,0,0.15)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
      c.beginPath(); c.arc(0, 0, 60, 0, K.TAU); c.fill();
      c.shadowColor = 'transparent';
      
      // Inset contours
      c.save();
      c.beginPath(); c.arc(0, 0, 60, 0, K.TAU); c.clip();
      const drift = t * 2;
      c.translate(-100 - drift, -100 + drift * 0.5);
      p._paths.forEach(pt => {
        c.strokeStyle = pt.major ? K.rgba(p.ink, 0.25) : K.rgba(p.ink, 0.1);
        c.lineWidth = pt.major ? 1.5 : 1;
        c.stroke(pt.path);
      });
      c.restore();
      
      // Target mark in center
      c.strokeStyle = p.accent; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.moveTo(0, -8); c.lineTo(0, 8); c.stroke();
      c.beginPath(); c.arc(0, 0, 3, 0, K.TAU); c.stroke();
      
      c.restore();
    }
    
    // Line extending
    const lineK = K.E(t, 0.5, 1.3, 'io5');
    const wN = K.width(c, p.name, fN, 1);
    const wC = K.width(c, p.coords, fC, 0);
    const lineW = Math.max(wN, wC) + 40;
    
    if (lineK > 0 && out < 1) {
      c.strokeStyle = p.accent; c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x + 75 * kA, y);
      c.lineTo(x + 75 * kA + lineW * lineK * (1 - out), y);
      c.stroke();
    }
    
    // Text
    c.save();
    c.beginPath(); c.rect(x + 70, y - 100, lineW + 50, 95); c.clip();
    K.reveal(c, p.name, x + 90, y - 16 + out * 50, { font: fN, color: p.ink, track: 1, k: K.P(t, 0.7, 1.8), mode: 'rise', dist: 40, stagger: 0.3 });
    c.restore();
    
    c.save();
    c.beginPath(); c.rect(x + 70, y + 5, lineW + 50, 80); c.clip();
    K.reveal(c, p.coords, x + 90, y + 42 - out * 40, { font: fC, color: K.rgba(p.ink, 0.8), k: K.P(t, 0.9, 1.9), mode: 'fade', stagger: 0.2 });
    c.restore();
  }
});
