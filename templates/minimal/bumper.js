// CLEAN MINIMAL — program bumper. A hairline draws out from the centre, the title rises above it, the subtitle
// tracks in below; everything collapses back into the line and out.
K.template({ id: 'minimal-bumper', title: 'Program bumper', style: 'Clean Minimal', type: 'Bumper / open', dur: 7, alpha: false,
  fonts: ['600 88px "Avenir Next"', '500 28px "Avenir Next"'],
  params: { title: 'Lessons From Creation', sub: 'Part 3 · The Water Cycle', bg: '#f5f3ef', ink: '#26282b', accent: '#b08d57' },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2 + 20;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(cx, cy, 100, cx, cy, W * .7); g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(0,0,0,.025)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const fT = K.font(88, 'Avenir Next', 600), fS = K.font(28, 'Avenir Next', 500);
    const wT = K.width(c, p.title, fT, 1), half = (wT / 2 + 60) * K.E(t, .2, 1.3, 'out5') * (1 - K.E(t, 6.0, 6.6, 'io5'));
    c.fillStyle = p.accent; c.fillRect(cx - half, cy, half * 2, 2);
    const dot = K.E(t, .15, .5, 'outBack') * (1 - K.E(t, 6.3, 6.6)); if (dot > 0) { c.beginPath(); c.arc(cx, cy + 1, 5 * dot, 0, K.TAU); c.fill(); }
    const out = K.E(t, 5.4, 6.0, 'in');
    c.save(); c.beginPath(); c.rect(0, 0, W, cy - 1); c.clip();
    K.reveal(c, p.title, cx, cy - 44 + out * 110, { font: fT, color: p.ink, track: 1, align: 'center', k: K.P(t, .7, 1.9), mode: 'rise', dist: 110, stagger: .45 });
    c.restore();
    c.save(); c.beginPath(); c.rect(0, cy + 3, W, H); c.clip();
    K.reveal(c, p.sub.toUpperCase(), cx, cy + 62 - out * 80, { font: fS, color: p.accent, track: 7, align: 'center', k: K.P(t, 1.3, 2.4), mode: 'track', stagger: .2 });
    c.restore();
    K.grain(c, t, .035);
  } });
