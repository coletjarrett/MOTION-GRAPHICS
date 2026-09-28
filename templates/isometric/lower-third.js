K.template({
  id: 'isometric-lower-third', title: 'Lower Third', style: 'Isometric', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['600 56px "Avenir Next"', '400 32px "Avenir Next"'],
  params: { name: 'Tomás Rivera', role: 'Project overseer, Peru', color: '#d89a8c' },
  setup(c, p) {
  },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    const x = 170, y = 860;
    
    const kIn = K.E(t, 0.4, 1.4, 'outBack');
    const out = K.E(t, 5.5, 6.2, 'in5');
    const kTotal = Math.max(0, kIn - out);
    
    if (kTotal <= 0) return;
    
    const col = p.color;
    const mainCol = K.lerpc(col, '#ffffff', 0.1);
    const sideCol = K.lerpc(col, '#000000', 0.1);
    const bottomCol = K.lerpc(col, '#000000', 0.25);
    
    c.font = K.font(56, 'Avenir Next', 600);
    const wName = c.measureText(p.name).width;
    c.font = K.font(32, 'Avenir Next', 400);
    const wRole = c.measureText(p.role).width;
    const maxW = Math.max(wName, wRole) + 80;
    
    const w = maxW * kTotal;
    const h = 120;
    const d = 35 * kTotal;
    const dx = d * 0.8;
    const dy = d * 0.6;
    
    c.lineJoin = 'round';
    c.lineWidth = 2;
    
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.15)';
    c.beginPath();
    const shDx = dx * 1.5;
    const shDy = dy * 1.5 + 15;
    K.line(c, [
      [x, y + h],
      [x + w, y + h],
      [x + w + shDx, y + h + shDy],
      [x + shDx, y + h + shDy]
    ]);
    c.closePath();
    c.fill();
    
    // Bottom face
    c.fillStyle = bottomCol;
    c.strokeStyle = bottomCol;
    c.beginPath();
    K.line(c, [
      [x, y + h],
      [x + w, y + h],
      [x + w + dx, y + h + dy],
      [x + dx, y + h + dy]
    ]);
    c.closePath();
    c.fill(); c.stroke();
    
    // Right side face
    c.fillStyle = sideCol;
    c.strokeStyle = sideCol;
    c.beginPath();
    K.line(c, [
      [x + w, y],
      [x + w + dx, y + dy],
      [x + w + dx, y + h + dy],
      [x + w, y + h]
    ]);
    c.closePath();
    c.fill(); c.stroke();
    
    // Main face
    c.fillStyle = mainCol;
    c.strokeStyle = mainCol;
    c.beginPath();
    c.rect(x, y, w, h);
    c.fill(); c.stroke();
    
    // Text
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    
    c.globalAlpha = 1 - out;
    K.reveal(c, p.name, x + 40, y + 60, { font: K.font(56, 'Avenir Next', 600), color: '#ffffff', track: 1, k: K.P(t, 1.0, 2.0), mode: 'rise', dist: 20 });
    K.reveal(c, p.role, x + 42, y + 98, { font: K.font(32, 'Avenir Next', 400), color: 'rgba(255,255,255,0.85)', track: 1, k: K.P(t, 1.2, 2.2), mode: 'fade' });
    c.restore();
    
    if (out < 1 && kIn > 0) {
      K.grain(c, t, 0.03);
    }
  }
});
