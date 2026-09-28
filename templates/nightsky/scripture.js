// NIGHT SKY — scripture callout. Stars drift very slowly; the reference forms from points of light.
K.template({ id: 'nightsky-scripture', title: 'Scripture callout', style: 'Night Sky', type: 'Scripture card', dur: 7, alpha: false,
  fonts: ['400 120px Didot', '500 26px "Avenir Next"'],
  params: { kicker: 'Lift up your eyes', ref: 'Isaiah 40:26' },
  setup(c, p) { const R = K.rand(7); p._s = Array.from({ length: 600 }, () => [R() * K.W, R() * K.H, Math.pow(R(), 3), R() * 6.28]);
    // sample the reference text into target points for the light to gather into
    const cv = document.createElement('canvas'); cv.width = K.W; cv.height = K.H; const x = cv.getContext('2d'); x.font = K.font(120, 'Didot', 400); x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText(p.ref, K.W / 2, K.H / 2 + 60);
    const d = x.getImageData(0, 0, K.W, K.H).data, pts = []; for (let y = 0; y < K.H; y += 4) for (let xx = 0; xx < K.W; xx += 4) if (d[(y * K.W + xx) * 4 + 3] > 128) pts.push([xx, y]);
    const R2 = K.rand(8); p._pts = pts.map(q => ({ q, o: [R2() * K.W, R2() * K.H], d: R2() })); },
  draw(c, t, p) {
    const W = K.W, H = K.H; let g = c.createRadialGradient(W / 2, H * .7, 0, W / 2, H * .6, W * .8); g.addColorStop(0, '#16213d'); g.addColorStop(1, '#05070f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (const [x, y, m, ph] of p._s) { c.fillStyle = `rgba(255,255,255,${(.25 + m * .7) * (.85 + .15 * Math.sin(t * 1.3 + ph))})`; c.beginPath(); c.arc((x + t * 6 * (m + .2)) % W, y, .5 + m * 1.8, 0, K.TAU); c.fill(); }
    const out = K.E(t, 6.0, 6.8, 'in'), gather = K.E(t, .4, 2.8, 'io'), text = K.E(t, 2.3, 3.2);
    c.globalAlpha = 1 - out;
    for (const s of p._pts) { const k = K.clamp((gather * 1.3 - s.d * .3)); const e = K.ease.io(k); const x = K.mix(s.o[0], s.q[0], e), y = K.mix(s.o[1], s.q[1], e); c.fillStyle = `rgba(255,236,200,${.9 * (1 - text * .95) * K.P(t, .2, .8)})`; c.beginPath(); c.arc(x, y, 1.4 + (1 - e) * 1.2, 0, K.TAU); c.fill(); }
    c.shadowColor = 'rgba(255,220,170,.6)'; c.shadowBlur = 24 * text; K.setText(c, K.font(120, 'Didot', 400), `rgba(248,242,230,${text})`, 0, 'center'); c.fillText(p.ref, W / 2, H / 2 + 60); c.shadowBlur = 0;
    K.reveal(c, p.kicker.toUpperCase(), W / 2, H / 2 - 90, { font: K.font(26, 'Avenir Next', 500), color: 'rgba(214,196,150,.95)', track: 9, align: 'center', k: K.P(t, 2.8, 3.9), mode: 'fade', stagger: .5 });
    c.globalAlpha = 1; K.grain(c, t, .04);
  } });
