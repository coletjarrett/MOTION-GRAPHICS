// CLEAN MINIMAL — timeline. An axis draws across, a progress line advances, and each era pops in with its date
// above and its name below, in sequence. Data-driven: pass any list of {date, name, note}.
K.template({ id: 'minimal-timeline', title: 'Timeline', style: 'Clean Minimal', type: 'Timeline', dur: 15, alpha: false,
  fonts: ['600 46px "Avenir Next"', '500 30px "Avenir Next"', '400 22px "Avenir Next"', '600 26px "Avenir Next"'],
  params: { heading: 'World Powers of Daniel 2', bg: '#f5f3ef', ink: '#26282b', accent: '#b08d57', muted: '#8b8680',
    items: [{ date: '607 B.C.E.', name: 'Babylon', note: 'Head of gold' }, { date: '539 B.C.E.', name: 'Medo-Persia', note: 'Breast and arms of silver' },
      { date: '331 B.C.E.', name: 'Greece', note: 'Belly and thighs of copper' }, { date: '30 B.C.E.', name: 'Rome', note: 'Legs of iron' },
      { date: '1763 C.E.', name: 'Anglo-America', note: 'Feet of iron and clay' }] },
  draw(c, t, p) {
    const W = K.W, H = K.H, x0 = 230, x1 = W - 230, y = 600, n = p.items.length, step = 1.75, t0 = 1.9;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    const out = K.E(t, 13.6, 14.6, 'in');
    c.globalAlpha = 1 - out;
    K.reveal(c, p.heading.toUpperCase(), x0, 250, { font: K.font(26, 'Avenir Next', 600), color: p.accent, track: 6, k: K.P(t, .3, 1.3), mode: 'track', stagger: .3 });
    c.fillStyle = p.ink; c.globalAlpha = (1 - out) * K.E(t, .5, 1.2); c.fillRect(x0, 272, 60, 2); c.globalAlpha = 1 - out;
    // axis
    const ax = K.E(t, .6, 2.0, 'io5'); c.fillStyle = 'rgba(38,40,43,.18)'; c.fillRect(x0, y - 1, (x1 - x0) * ax, 2);
    const X = i => K.mix(x0 + 60, x1 - 60, i / (n - 1));
    // progress follows the nodes
    let prog = x0; for (let i = 0; i < n; i++) prog = K.mix(prog, X(i), K.E(t, t0 + i * step - .5, t0 + i * step, 'io'));
    c.fillStyle = p.accent; c.fillRect(x0, y - 2, Math.max(0, prog - x0) * (t > t0 - .6 ? 1 : 0), 4);
    p.items.forEach((it, i) => {
      const ti = t0 + i * step, k = K.E(t, ti, ti + .6, 'outBack'), x = X(i); if (t < ti) { c.fillStyle = 'rgba(38,40,43,.25)'; c.beginPath(); c.arc(x, y, 5 * ax, 0, K.TAU); c.fill(); return; }
      const active = K.bell(t, ti, ti + .3, ti + step - .2, ti + step + .4) * (i < n - 1 ? 1 : 0) + (i === n - 1 ? K.P(t, ti, ti + .3) : 0);
      c.fillStyle = p.bg; c.beginPath(); c.arc(x, y, 15 * k, 0, K.TAU); c.fill();
      c.strokeStyle = p.accent; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 15 * k, 0, K.TAU); c.stroke();
      c.fillStyle = p.accent; c.beginPath(); c.arc(x, y, 7 * k, 0, K.TAU); c.fill();
      if (active > 0) { c.strokeStyle = K.rgba(p.accent, .35 * active); c.lineWidth = 2; c.beginPath(); c.arc(x, y, 15 + 14 * K.ease.out(K.P(t, ti, ti + 1.2)), 0, K.TAU); c.stroke(); }
      const tick = 58 * K.E(t, ti + .1, ti + .5, 'out5'); c.fillStyle = 'rgba(38,40,43,.3)'; c.fillRect(x - 1, y - 22 - tick, 2, tick);
      K.reveal(c, it.date, x, y - 100, { font: K.font(46, 'Avenir Next', 600), color: p.ink, align: 'center', k: K.P(t, ti + .2, ti + .9), mode: 'rise', dist: 20, stagger: .3 });
      K.reveal(c, it.name, x, y + 72, { font: K.font(30, 'Avenir Next', 500), color: p.ink, align: 'center', k: K.P(t, ti + .35, ti + 1.0), mode: 'rise', dist: -16, stagger: .3 });
      K.reveal(c, it.note, x, y + 110, { font: K.font(22, 'Avenir Next', 400), color: p.muted, align: 'center', k: K.P(t, ti + .55, ti + 1.3), mode: 'fade', stagger: .4 });
    });
    c.globalAlpha = 1; K.grain(c, t, .03);
  } });
