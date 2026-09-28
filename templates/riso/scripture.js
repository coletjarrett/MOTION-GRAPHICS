// RISO PRINT — scripture callout
K.template({
  id: 'riso-scripture', title: 'Scripture callout', style: 'Riso Print', type: 'Scripture card',
  dur: 6, alpha: false,
  fonts: ['700 130px "Futura"', '500 34px "Futura"'],
  params: { kicker: 'Please open your Bible to', ref: 'Proverbs 3:5, 6', bg: '#f4ece2', red: '#e4572e', teal: '#1b6f7a' },
  setup(c, p) {
    this.bg = K.paper(c.canvas.width, c.canvas.height, 1, p.bg, { blot: 0.6 });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2 + 10;
    c.drawImage(this.bg, 0, 0);

    const out = K.E(t, 5.2, 5.8, 'in5');
    c.globalCompositeOperation = 'multiply';

    // Teal arch from the bottom
    c.fillStyle = p.teal;
    c.translate(-2, 1);
    const archY = H + 200 - 600 * K.E(t, 0.1, 1.3, 'out5') + 600 * out;
    c.beginPath();
    c.arc(cx, archY, 600, Math.PI, 0);
    c.fill();
    c.translate(2, -1);

    // Red pill behind the scripture
    c.fillStyle = p.red;
    c.translate(3, -2);
    // Use measureText to size the pill appropriately
    const fR = K.font(130, 'Futura', 700);
    const wRef = K.width(c, p.ref, fR, 2) + 200;
    const pW = wRef * K.E(t, 0.3, 1.4, 'outExpo') * (1 - out);
    const pH = 200 * K.E(t, 0.4, 1.5, 'outBack') * (1 - out);
    if (pW > 0 && pH > 0) {
      K.rr(c, cx - pW / 2, cy - 10, pW, pH, pH / 2);
      c.fill();
    }
    c.translate(-3, 2);

    // Text
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1 - out;

    const fK = K.font(34, 'Futura', 500);
    K.reveal(c, p.kicker.toUpperCase(), cx, cy - 80, { font: fK, color: p.bg, track: 8, align: 'center', k: K.P(t, 0.5, 1.5), mode: 'fade', stagger: 0.2 });

    // Knockout color for scripture ref
    K.reveal(c, p.ref, cx, cy + 135, { font: fR, color: p.bg, track: 2, align: 'center', k: K.P(t, 0.8, 1.8), mode: 'rise', dist: 50, stagger: 0.3 });

    c.globalCompositeOperation = 'overlay';
    K.grain(c, t, 0.08);
  }
});
