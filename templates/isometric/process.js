K.template({
  id: 'isometric-process', title: 'Process', style: 'Isometric', type: 'Full screen', dur: 12, alpha: false,
  fonts: ['600 56px "Avenir Next"', '400 34px "Avenir Next"'],
  params: {
    bg: '#f8f5f0',
    ink: '#3a3d42',
    lbl1: '1 Plan',
    cap1: 'Drawings approved',
    lbl2: '2 Build',
    cap2: 'Volunteers build',
    lbl3: '3 Dedicate',
    cap3: 'Hall dedicated'
  },
  setup(c, p) {
    const colors = { sand: '#e6dcc8', sage: '#9eb2a1', sky: '#99badd', white: '#ffffff', coral: '#d89a8c', grey: '#c2c0bb', pencil: '#e8c27a', eraser: '#d68f9a' };
    p.boxes = [];
    const add = (b) => p.boxes.push(b);
    
    // Island 1: Plan
    const tA = 0.5; // Starts at 0.5s
    add({x: -4.5, y: -0.2, z: 2.5, wx: 2, wy: 0.2, wz: 2, col: colors.sand, t0: tA, t1: tA + 0.8});
    add({x: -4.2, y: 0, z: 2.8, wx: 1.4, wy: 0.05, wz: 1.4, col: colors.white, t0: tA + 0.3, t1: tA + 1.0});
    // blueprint lines
    add({x: -3.8, y: 0.05, z: 3.0, wx: 0.6, wy: 0.02, wz: 0.1, col: colors.sky, t0: tA + 0.5, t1: tA + 1.1});
    add({x: -3.8, y: 0.05, z: 3.3, wx: 0.4, wy: 0.02, wz: 0.1, col: colors.sky, t0: tA + 0.6, t1: tA + 1.2});
    add({x: -3.8, y: 0.05, z: 3.6, wx: 0.8, wy: 0.02, wz: 0.1, col: colors.sky, t0: tA + 0.7, t1: tA + 1.3});
    // pencil
    add({x: -3.1, y: 0.05, z: 3.2, wx: 0.15, wy: 0.15, wz: 0.8, col: colors.pencil, t0: tA + 0.8, t1: tA + 1.5});
    add({x: -3.1, y: 0.05, z: 4.0, wx: 0.15, wy: 0.15, wz: 0.15, col: colors.eraser, t0: tA + 0.9, t1: tA + 1.6});
    
    // Island 2: Build
    const tB = 3.0; // Starts at 3.0s
    add({x: -1, y: -0.2, z: -1, wx: 2, wy: 0.2, wz: 2, col: colors.sand, t0: tB, t1: tB + 0.8});
    // Bricks
    const bx = -0.6, bz = -0.5, bw = 0.5, bh = 0.3, bd = 0.3;
    add({x: bx, y: 0, z: bz, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 0.3, t1: tB + 0.9});
    add({x: bx + 0.6, y: 0, z: bz, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 0.5, t1: tB + 1.1});
    add({x: bx + 0.3, y: bh, z: bz, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 0.7, t1: tB + 1.3});
    add({x: bx - 0.3, y: bh, z: bz, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 0.9, t1: tB + 1.5});
    add({x: bx, y: bh*2, z: bz, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 1.1, t1: tB + 1.7});
    // Single brick on the side
    add({x: 0.2, y: 0, z: 0.2, wx: bw, wy: bh, wz: bd, col: colors.coral, t0: tB + 1.3, t1: tB + 1.9});
    // Another brick
    add({x: -0.5, y: 0, z: 0.5, wx: bd, wy: bh, wz: bw, col: colors.coral, t0: tB + 1.4, t1: tB + 2.0});

    // Island 3: Dedicate
    const tC = 5.5; // Starts at 5.5s
    add({x: 2.5, y: -0.2, z: -4.5, wx: 2, wy: 0.2, wz: 2, col: colors.sand, t0: tC, t1: tC + 0.8});
    add({x: 2.8, y: 0, z: -4.2, wx: 1.4, wy: 0.8, wz: 1.4, col: colors.white, t0: tC + 0.3, t1: tC + 1.0});
    add({x: 2.7, y: 0.8, z: -4.3, wx: 1.6, wy: 0.1, wz: 1.6, col: colors.coral, t0: tC + 0.5, t1: tC + 1.2});
    add({x: 3.3, y: 0, z: -2.8, wx: 0.3, wy: 0.5, wz: 0.3, col: colors.sage, t0: tC + 0.7, t1: tC + 1.4});
    add({x: 2.6, y: 0, z: -3.0, wx: 0.2, wy: 0.4, wz: 0.2, col: colors.sky, t0: tC + 0.9, t1: tC + 1.6});
    
    // Sort boxes
    p.boxes.sort((a, b) => (a.x + a.z) - (b.x + b.z));
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2 - 40;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    
    const U = 75;
    const SH = 0.5;
    
    const pt = (x, y, z) => [cx + (x - z) * U, cy + (x + z) * (U / 2) - y * U];
    
    const activeBoxes = [];
    for (const b of p.boxes) {
      const kIn = K.E(t, b.t0, b.t1, 'spring');
      const kOut = K.E(t, 10.5 + b.t0 * 0.1, 11.2 + b.t0 * 0.1, 'in5');
      if (kIn <= 0 || kOut >= 1) continue;
      activeBoxes.push({ ...b, currentY: b.y + (1 - kIn) * 8 - kOut * 8, kIn, kOut });
    }
    
    // Shadows
    c.fillStyle = 'rgba(0,0,0,0.06)';
    for (const b of activeBoxes) {
      if (b.wy <= 0.2 && b.y < 0) continue; // Skip ground plates
      const { x, currentY, z, wx, wy, wz } = b;
      c.beginPath();
      K.line(c, [
        pt(x + currentY * SH, 0, z),
        pt(x + currentY * SH, 0, z + wz),
        pt(x + wx + (currentY + wy) * SH, 0, z + wz),
        pt(x + wx + (currentY + wy) * SH, 0, z)
      ]);
      c.closePath();
      c.fill();
    }
    
    // Boxes
    for (const b of activeBoxes) {
      const { x, currentY, z, wx, wy, wz, col } = b;
      const y = currentY;
      
      const topCol = K.lerpc(col, '#ffffff', 0.25);
      const leftCol = K.lerpc(col, '#000000', 0.08);
      const rightCol = K.lerpc(col, '#000000', 0.20);
      
      c.lineJoin = 'round';
      c.lineWidth = U * 0.025;
      
      c.fillStyle = leftCol; c.strokeStyle = leftCol;
      c.beginPath(); K.line(c, [pt(x, y, z+wz), pt(x+wx, y, z+wz), pt(x+wx, y+wy, z+wz), pt(x, y+wy, z+wz)]); c.closePath(); c.fill(); c.stroke();
      
      c.fillStyle = rightCol; c.strokeStyle = rightCol;
      c.beginPath(); K.line(c, [pt(x+wx, y, z+wz), pt(x+wx, y, z), pt(x+wx, y+wy, z), pt(x+wx, y+wy, z+wz)]); c.closePath(); c.fill(); c.stroke();
      
      c.fillStyle = topCol; c.strokeStyle = topCol;
      c.beginPath(); K.line(c, [pt(x, y+wy, z+wz), pt(x+wx, y+wy, z+wz), pt(x+wx, y+wy, z), pt(x, y+wy, z)]); c.closePath(); c.fill(); c.stroke();
    }
    
    // Labels
    const out = 1 - K.E(t, 10.8, 11.5, 'in');
    const yText = cy + 280;
    
    const drawLabel = (s, cap, islandX, islandZ, t0) => {
      const px = cx + (islandX - islandZ) * U;
      c.save();
      c.beginPath(); c.rect(px - 300, 0, 600, yText + 20); c.clip();
      c.globalAlpha = out;
      K.reveal(c, s, px, yText, { font: K.font(56, 'Avenir Next', 600), color: p.ink, track: 2, align: 'center', k: K.P(t, t0, t0 + 1.0), mode: 'rise', dist: 40, stagger: 0.2 });
      c.restore();
      
      c.save();
      c.beginPath(); c.rect(px - 300, yText + 20, 600, H); c.clip();
      c.globalAlpha = out;
      K.reveal(c, cap, px, yText + 60, { font: K.font(34, 'Avenir Next', 400), color: p.ink, track: 1, align: 'center', k: K.P(t, t0 + 0.2, t0 + 1.2), mode: 'fade' });
      c.restore();
    };
    
    drawLabel(p.lbl1, p.cap1, -3.5, 3.5, 1.5);
    drawLabel(p.lbl2, p.cap2, 0, 0, 4.0);
    drawLabel(p.lbl3, p.cap3, 3.5, -3.5, 6.5);
    
    K.grain(c, t, 0.04);
  }
});
