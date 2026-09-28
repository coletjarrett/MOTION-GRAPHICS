K.template({
  id: 'isometric-bumper', title: 'Bumper', style: 'Isometric', type: 'Bumper / open', dur: 8, alpha: false,
  fonts: ['600 90px "Avenir Next"', '400 36px "Avenir Next"'],
  params: {
    title: 'Building Together',
    sub: 'Volunteers Around the World',
    bg: '#f8f5f0',
    ink: '#3a3d42'
  },
  setup(c, p) {
    const colors = { sand: '#e6dcc8', sage: '#9eb2a1', sky: '#99badd', white: '#ffffff', coral: '#d89a8c' };
    p.boxes = [];
    const add = (b) => p.boxes.push(b);
    
    // Base/Ground plate
    add({x: -3, y: -0.1, z: -3, wx: 7, wy: 0.1, wz: 7, col: colors.sand, t0: 0.1, t1: 0.9});
    
    // Hall main
    add({x: -1, y: 0, z: -1, wx: 3, wy: 1.5, wz: 2, col: colors.white, t0: 0.2, t1: 1.0});
    // Hall roof
    add({x: -1.2, y: 1.5, z: -1.2, wx: 3.4, wy: 0.2, wz: 2.4, col: colors.coral, t0: 0.4, t1: 1.2});
    
    // Hall entrance
    add({x: 0, y: 0, z: 1, wx: 1, wy: 0.8, wz: 0.8, col: colors.white, t0: 0.5, t1: 1.3});
    // Entrance roof
    add({x: -0.2, y: 0.8, z: 0.9, wx: 1.4, wy: 0.15, wz: 1.0, col: colors.coral, t0: 0.6, t1: 1.4});
    
    // Path
    add({x: 0.2, y: 0, z: 1.8, wx: 0.6, wy: 0.05, wz: 0.8, col: '#d3c9b5', t0: 0.7, t1: 1.4});
    add({x: 0.2, y: 0, z: 2.8, wx: 0.6, wy: 0.05, wz: 1.2, col: '#d3c9b5', t0: 0.8, t1: 1.5});
    
    // Trees
    const addTree = (x, z, t0) => {
      add({x: x+0.15, y: 0, z: z+0.15, wx: 0.15, wy: 0.4, wz: 0.15, col: '#a39b8e', t0: t0, t1: t0+0.5});
      add({x: x, y: 0.4, z: z, wx: 0.45, wy: 1.2, wz: 0.45, col: colors.sage, t0: t0+0.2, t1: t0+0.9});
    };
    addTree(2, -1, 0.5);
    addTree(2.5, 0.5, 0.7);
    addTree(-2.5, 0, 0.9);
    addTree(-2, 1.5, 1.1);
    
    // People
    add({x: 0.4, y: 0, z: 2.2, wx: 0.2, wy: 0.4, wz: 0.2, col: colors.sky, t0: 1.2, t1: 1.8});
    add({x: 0.1, y: 0, z: 3.1, wx: 0.2, wy: 0.35, wz: 0.2, col: colors.coral, t0: 1.4, t1: 2.0});
    
    // Sort permanently by base depth (x + z) since they only move in Y
    p.boxes.sort((a, b) => (a.x + a.z) - (b.x + b.z));
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2 - 50;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    
    const U = 90;
    const SH = 0.6; // shadow slope
    
    const pt = (x, y, z) => [cx + (x - z) * U, cy + (x + z) * (U / 2) - y * U];
    
    const activeBoxes = [];
    for (const b of p.boxes) {
      const kIn = K.E(t, b.t0, b.t1, 'spring');
      const kOut = K.E(t, 6.5 + b.t0 * 0.3, 7.2 + b.t0 * 0.3, 'in5');
      if (kIn <= 0 || kOut >= 1) continue;
      
      const currentY = b.y + (1 - kIn) * 8 - kOut * 8;
      activeBoxes.push({ ...b, currentY, kIn, kOut });
    }
    
    // Draw shadows
    c.fillStyle = 'rgba(0,0,0,0.06)';
    for (const b of activeBoxes) {
      const { x, currentY, z, wx, wy, wz } = b;
      const y = currentY;
      // Skip shadows for things very high up if we want, or just draw them
      c.beginPath();
      K.line(c, [
        pt(x + y * SH, 0, z),
        pt(x + y * SH, 0, z + wz),
        pt(x + wx + (y + wy) * SH, 0, z + wz),
        pt(x + wx + (y + wy) * SH, 0, z)
      ]);
      c.closePath();
      c.fill();
    }
    
    // Draw boxes
    for (const b of activeBoxes) {
      const { x, currentY, z, wx, wy, wz, col } = b;
      const y = currentY;
      
      const topCol = K.lerpc(col, '#ffffff', 0.25);
      const leftCol = K.lerpc(col, '#000000', 0.06);
      const rightCol = K.lerpc(col, '#000000', 0.18);
      
      c.lineJoin = 'round';
      c.lineWidth = U * 0.025;
      
      // Z-facing (Left)
      c.fillStyle = leftCol; c.strokeStyle = leftCol;
      c.beginPath(); K.line(c, [pt(x, y, z+wz), pt(x+wx, y, z+wz), pt(x+wx, y+wy, z+wz), pt(x, y+wy, z+wz)]); c.closePath(); c.fill(); c.stroke();
      
      // X-facing (Right)
      c.fillStyle = rightCol; c.strokeStyle = rightCol;
      c.beginPath(); K.line(c, [pt(x+wx, y, z+wz), pt(x+wx, y, z), pt(x+wx, y+wy, z), pt(x+wx, y+wy, z+wz)]); c.closePath(); c.fill(); c.stroke();
      
      // Y-facing (Top)
      c.fillStyle = topCol; c.strokeStyle = topCol;
      c.beginPath(); K.line(c, [pt(x, y+wy, z+wz), pt(x+wx, y+wy, z+wz), pt(x+wx, y+wy, z), pt(x, y+wy, z)]); c.closePath(); c.fill(); c.stroke();
    }
    
    // Draw text
    const out = 1 - K.E(t, 6.8, 7.3, 'in');
    const yText = cy + 420;
    
    c.save();
    c.beginPath(); c.rect(0, 0, W, yText + 20); c.clip();
    c.globalAlpha = out;
    K.reveal(c, p.title, cx, yText, { font: K.font(90, 'Avenir Next', 600), color: p.ink, track: 2, align: 'center', k: K.P(t, 2.0, 3.0), mode: 'rise', dist: 60, stagger: 0.4 });
    c.restore();
    
    c.save();
    c.beginPath(); c.rect(0, yText + 20, W, H); c.clip();
    c.globalAlpha = out;
    K.reveal(c, p.sub, cx, yText + 70, { font: K.font(36, 'Avenir Next', 400), color: p.ink, track: 6, align: 'center', k: K.P(t, 2.5, 3.5), mode: 'track', stagger: 0.2 });
    c.restore();
    
    K.grain(c, t, 0.04);
  }
});
