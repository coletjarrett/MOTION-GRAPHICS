// RISO PRINT — keypoint
K.template({
  id: 'riso-keypoint', title: 'Key point', style: 'Riso Print', type: 'Card',
  dur: 8, alpha: false,
  fonts: ['700 85px "Futura"'],
  params: { text: 'Kindness costs nothing but means everything.', bg: '#f4ece2', red: '#e4572e', teal: '#1b6f7a' },
  setup(c, p) {
    this.bg = K.paper(c.canvas.width, c.canvas.height, 1, p.bg, { blot: 0.6 });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    c.drawImage(this.bg, 0, 0);

    const out = K.E(t, 7.2, 7.8, 'in5');
    c.globalCompositeOperation = 'multiply';

    // Red circle (bottom framing)
    c.fillStyle = p.red;
    c.translate(3, -2);
    const rad = 380 * K.E(t, 0.2, 1.4, 'outExpo') * (1 - out);
    if (rad > 0) {
      c.beginPath();
      c.arc(cx, H + 100, rad, 0, K.TAU);
      c.fill();
    }
    c.translate(-3, 2);

    // Teal band (top framing)
    c.fillStyle = p.teal;
    c.translate(-2, 1);
    const bandH = 180 * K.E(t, 0.4, 1.5, 'out5') * (1 - out);
    c.fillRect(0, 0, W, bandH);
    c.translate(2, -1);

    // Text (wrapped)
    c.globalAlpha = 1 - out;

    const fT = K.font(85, 'Futura', 700);
    const lines = K.wrap(c, p.text, fT, W * 0.7);
    const lh = 110;
    const startY = cy - ((lines.length - 1) * lh) / 2 + 20;

    // Draw text with multiply so it overprints
    K.para(c, lines, cx, startY, lh, { font: fT, color: p.teal, track: 1, align: 'center', mode: 'rise', dist: 60, stagger: 0.2 }, K.P(t, 0.6, 2.0));

    c.globalCompositeOperation = 'overlay';
    K.grain(c, t, 0.08);
  }
});
