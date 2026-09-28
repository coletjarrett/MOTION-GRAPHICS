// NIGHT SKY — program open. Dusk deepens into night, stars come out, a constellation traces itself,
// and the title settles beneath it in a fine serif.
K.template({ id: 'nightsky-bumper', title: 'Program open', style: 'Night Sky', type: 'Bumper / open', dur: 9, alpha: false,
  fonts: ['400 84px Didot', 'italic 400 40px Didot', '500 24px "Avenir Next"'],
  params: { title: 'Lessons From Creation', sub: 'Part 5 · The Stars', kicker: 'A family study series' },
  setup(c, p) {
    const R = K.rand(42); p._stars = Array.from({ length: 900 }, () => ({ x: R() * K.W, y: R() * K.H * .9, m: Math.pow(R(), 3), ph: R() * 6.28, sp: .5 + R() * 1.5, hue: R() }));
    // a simple pleasing figure (not a named constellation), placed above the title
    p._con = [[640, 250], [760, 190], [900, 230], [1010, 160], [1130, 215], [1260, 180], [1300, 290], [1130, 215]].map(([x, y]) => [x, y + 40]);
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, night = K.E(t, 0, 4.5, 'sine');
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, K.lerpc('#2b3f63', '#070b16', night)); g.addColorStop(.6, K.lerpc('#6c6a86', '#0f1830', night)); g.addColorStop(1, K.lerpc('#e0a77a', '#1d2640', night));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // faint milky band
    c.save(); c.globalAlpha = .18 * night; c.translate(W / 2, H / 2); c.rotate(-.35); c.filter = 'blur(60px)'; g = c.createLinearGradient(0, -220, 0, 220); g.addColorStop(0, 'rgba(160,170,220,0)'); g.addColorStop(.5, 'rgba(190,195,235,1)'); g.addColorStop(1, 'rgba(160,170,220,0)'); c.fillStyle = g; c.fillRect(-W, -220, W * 2, 440); c.restore();
    // stars: brighter ones appear first, twinkle gently (never flashing)
    for (const s of p._stars) {
      const appear = K.P(night, .9 - s.m * .8 - .1, 1.0 - s.m * .8); if (appear <= 0) continue;
      const tw = .8 + .2 * Math.sin(t * s.sp + s.ph), r = .5 + s.m * 2.2, a = appear * tw * (.35 + s.m * .65);
      c.fillStyle = s.hue < .15 ? `rgba(255,220,190,${a})` : s.hue > .9 ? `rgba(190,210,255,${a})` : `rgba(255,255,255,${a})`;
      c.beginPath(); c.arc(s.x, s.y, r, 0, K.TAU); c.fill();
      if (s.m > .6) { const gg = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 7); gg.addColorStop(0, `rgba(255,255,255,${a * .25})`); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(s.x - r * 7, s.y - r * 7, r * 14, r * 14); }
    }
    // horizon hills
    c.fillStyle = '#05070d'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 16) c.lineTo(x, H - 120 - 60 * K.fbm(x / 500, 0, 9, 4)); c.lineTo(W, H); c.fill();
    const out = K.E(t, 7.8, 8.7, 'in');
    c.globalAlpha = 1 - out;
    // constellation traces
    const k = K.E(t, 3.0, 5.2, 'io'), P = p._con;
    c.strokeStyle = 'rgba(214,196,150,.55)'; c.lineWidth = 1.5; K.draw(c, P, k);
    P.forEach(([x, y], i) => { const a = K.E(t, 3.0 + i * .28, 3.4 + i * .28, 'out'); if (a <= 0) return; const gg = c.createRadialGradient(x, y, 0, x, y, 22); gg.addColorStop(0, `rgba(255,236,200,${.9 * a})`); gg.addColorStop(.25, `rgba(255,220,170,${.35 * a})`); gg.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = gg; c.fillRect(x - 22, y - 22, 44, 44); c.fillStyle = `rgba(255,248,230,${a})`; c.beginPath(); c.arc(x, y, 3.2, 0, K.TAU); c.fill(); });
    K.reveal(c, p.kicker.toUpperCase(), W / 2, 500, { font: K.font(24, 'Avenir Next', 500), color: 'rgba(214,196,150,.9)', track: 8, align: 'center', k: K.P(t, 4.4, 5.6), mode: 'fade', stagger: .5 });
    K.reveal(c, p.title, W / 2, 610, { font: K.font(84, 'Didot', 400), color: '#f4efe4', track: 2, align: 'center', k: K.P(t, 4.8, 6.4), mode: 'blur', stagger: .5 });
    K.reveal(c, p.sub, W / 2, 680, { font: K.font(40, 'Didot', 400, 'italic'), color: 'rgba(244,239,228,.8)', align: 'center', k: K.P(t, 5.6, 6.8), mode: 'fade', stagger: .4 });
    c.globalAlpha = 1; K.vignette(c, .4); K.grain(c, t, .04);
  } });
