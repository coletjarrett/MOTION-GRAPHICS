// RISO PRINT — lower third.
K.template({
  id: 'riso-lower-third', title: 'Lower third', style: 'Riso Print', type: 'Lower third',
  dur: 7, alpha: true,
  fonts: ['700 60px "Futura"', '500 34px "Futura"'],
  params: { name: 'Daniel Mensah', role: 'Construction volunteer', bg: '#f4ece2', red: '#e4572e', teal: '#1b6f7a', x: 170, y: 868 },
  setup(c, p) {
    this.bg = K.paper(c.canvas.width, c.canvas.height, 1, p.bg, { blot: 0.6 });
  },
  draw(c, t, p) {
    const { x, y } = p, W = K.W, H = K.H;
    const fN = K.font(60, 'Futura', 700), fR = K.font(34, 'Futura', 500);
    const wN = K.width(c, p.name, fN, 1), wR = K.width(c, p.role, fR, 1);
    const maxW = Math.max(wN, wR) + 120;

    const inAnim = K.E(t, 0.2, 1.2, 'out5');
    const outAnim = 1 - K.E(t, 5.8, 6.5, 'in5');
    const width = maxW * inAnim * outAnim;

    if (width <= 0) return;

    // We'll draw the lower third block
    const boxH = 160;
    const boxY = y - 80;
    
    // Red circle sliding in
    const circX = x + 100 + 400 * (1 - K.E(t, 0.4, 1.5, 'outBack')) - 200 * (1 - outAnim);
    
    // Create mask of all shapes so paper texture only draws where shapes exist
    const mask = new Path2D();
    mask.rect(x, boxY, width, boxH);
    mask.arc(circX, boxY + boxH / 2, 140, 0, K.TAU);

    // Draw base paper block
    c.save();
    c.clip(mask);

    c.drawImage(this.bg, 0, 0);

    // Setup Riso
    c.globalCompositeOperation = 'multiply';
    
    // Teal block (slightly offset)
    c.fillStyle = p.teal;
    c.fillRect(x - 2, boxY + 1, width, boxH);

    // Red circle
    c.fillStyle = p.red;
    c.beginPath();
    c.arc(circX + 3, boxY + boxH / 2 - 2, 140, 0, K.TAU);
    c.fill();

    // Grain
    c.globalCompositeOperation = 'overlay';
    K.grain(c, t, 0.08);

    c.restore();

    // Now text over the block
    c.save();
    c.clip(mask);

    const tX = x + 40;
    c.globalAlpha = outAnim;
    
    K.reveal(c, p.name, tX, y - 10, { font: fN, color: p.bg, track: 1, align: 'left', k: K.P(t, 0.6, 1.6), mode: 'rise', dist: 40, stagger: 0.3 });
    K.reveal(c, p.role, tX, y + 40, { font: fR, color: p.bg, track: 2, align: 'left', k: K.P(t, 1.0, 1.9), mode: 'fade', stagger: 0.2 });

    c.restore();
  }
});
