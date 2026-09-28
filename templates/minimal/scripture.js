// CLEAN MINIMAL — scripture callout ("please open your Bible to…"). The reference is the hero; a hairline
// underline draws beneath it.
K.template({ id: 'minimal-scripture', title: 'Scripture callout', style: 'Clean Minimal', type: 'Scripture card', dur: 6, alpha: false,
  fonts: ['600 132px "Avenir Next"', '500 30px "Avenir Next"'],
  params: { kicker: 'Please open your Bible to', ref: 'Daniel 2:44', bg: '#1f2429', ink: '#f4f1ea', accent: '#d8b36f' },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2 + 40;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#262c32'); g.addColorStop(1, p.bg); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const out = K.E(t, 5.0, 5.8, 'in'); c.globalAlpha = 1 - out;
    K.reveal(c, p.kicker.toUpperCase(), cx, cy - 150, { font: K.font(30, 'Avenir Next', 500), color: K.rgba(p.accent, 1), track: 8, align: 'center', k: K.P(t, .2, 1.1), mode: 'fade', stagger: .5 });
    const fR = K.font(132, 'Avenir Next', 600);
    K.reveal(c, p.ref, cx, cy, { font: fR, color: p.ink, track: 1, align: 'center', k: K.P(t, .6, 1.6), mode: 'blur', stagger: .35 });
    const w = K.width(c, p.ref, fR, 1) * K.E(t, 1.3, 2.3, 'io5'); c.fillStyle = p.accent; c.fillRect(cx - w / 2, cy + 44, w, 3);
    c.globalAlpha = 1; K.vignette(c, .3); K.grain(c, t, .04);
  } });
