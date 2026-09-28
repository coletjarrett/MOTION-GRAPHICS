// RISO PRINT — program bumper.
K.template({
  id: 'riso-bumper', title: 'Program bumper', style: 'Riso Print', type: 'Bumper / open',
  dur: 7, alpha: false,
  fonts: ['700 110px "Futura"', '500 40px "Futura"'],
  params: { title: 'Family Study Night', sub: 'Week 12 · Kindness', bg: '#f4ece2', red: '#e4572e', teal: '#1b6f7a' },
  setup(c, p) {
    this.bg = K.paper(c.canvas.width, c.canvas.height, 1, p.bg, { blot: 0.6 });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    
    // Background paper
    c.drawImage(this.bg, 0, 0);

    const out = K.E(t, 5.8, 6.6, 'in5');
    
    // Setup for multiply (Riso effect)
    c.globalCompositeOperation = 'multiply';

    // Misregistration offsets
    const ox1 = -2, oy1 = 1;  // teal
    const ox2 = 3, oy2 = -2;  // red

    // --- TEAL LAYER ---
    c.save();
    c.translate(ox1, oy1);
    c.fillStyle = p.teal;
    
    // Teal band at the bottom
    const bandH = 120 * K.E(t, 0.1, 1.2, 'out5') * (1 - K.E(t, 6.0, 6.6, 'in5'));
    c.fillRect(0, H - bandH, W, bandH);

    // Teal arch (illustration above text)
    const archBase = 580;
    const archY = archBase - 220 * K.E(t, 0.2, 1.4, 'out5') + 300 * K.E(t, 5.9, 6.5, 'in5');
    c.beginPath();
    c.arc(cx, archY, 220, Math.PI, 0);
    c.lineTo(cx + 220, archBase);
    c.lineTo(cx - 220, archBase);
    c.fill();
    c.restore();

    // --- RED LAYER ---
    c.save();
    c.translate(ox2, oy2);
    c.fillStyle = p.red;
    
    // Red circle
    const circR = 160 * K.E(t, 0.4, 1.5, 'outBack') * (1 - K.E(t, 5.8, 6.4, 'in5'));
    if (circR > 0) {
      c.beginPath();
      c.arc(cx - 140, 280, circR, 0, K.TAU);
      c.fill();
    }

    // Red text
    const fT = K.font(110, 'Futura', 700);
    c.globalAlpha = 1 - out;
    K.reveal(c, p.title.toUpperCase(), cx, 740, { font: fT, color: p.red, track: 4, align: 'center', k: K.P(t, 0.6, 1.6), mode: 'rise', dist: 80, stagger: 0.3 });
    
    c.restore();

    // --- TEAL TEXT LAYER ---
    c.save();
    c.translate(ox1, oy1);
    c.globalAlpha = 1 - out;
    // Larger and bolder subtitle
    const fS = K.font(45, 'Futura', 600);
    K.reveal(c, p.sub, cx, 840, { font: fS, color: p.teal, track: 8, align: 'center', k: K.P(t, 1.0, 2.0), mode: 'fade', stagger: 0.2 });
    c.restore();

    // Global texture overprint
    c.globalCompositeOperation = 'overlay';
    K.grain(c, t, 0.08);
  }
});
