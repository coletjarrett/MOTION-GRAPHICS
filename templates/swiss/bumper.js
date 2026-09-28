// SWISS GRID — program bumper. International Typographic Style on a strict 12-column grid: the columns flash in
// as faint guides, a red block drops into columns 1–4 carrying the issue number, a charcoal block slides into
// columns 9–12, a rule draws across the full measure and the title and subtitle rise out of it flush-left.
// Exit reverses the build with the same precise out5/in5 motion.
(() => {
  const M = 150, GUT = 24, CW = (1920 - 2 * M - 11 * GUT) / 12;
  const col = i => M + i * (CW + GUT), span = n => n * CW + (n - 1) * GUT, EDGE = col(11) + CW;
  // text that rises out of a hard mask: k 0..1 in, o 0..1 out (continues upward)
  const lift = (c, s, x, y, font, color, size, k, o = 0, track = 0, align = 'left') => {
    if (k <= 0 || o >= 1) return; c.save(); c.beginPath(); c.rect(x - 2000, y - size * 1.05, 4000, size * 1.35); c.clip();
    K.setText(c, font, color, track, align); c.fillText(s, x, y + (1 - K.ease.out5(k)) * size * 1.15 - K.ease.in5(o) * size * 1.2); c.restore();
  };

  K.template({ id: 'swiss-bumper', title: 'Program bumper', style: 'Swiss Grid', type: 'Bumper / open', dur: 7, alpha: false,
    fonts: ['700 150px "Helvetica Neue"', '500 44px "Helvetica Neue"', '500 22px "Helvetica Neue"', '700 200px "Helvetica Neue"'],
    params: { title: 'Research Report', sub: 'Bible Translation · 2026', num: '04', meta: 'Report', meta2: 'Part 4 of 12', bg: '#efece6', ink: '#222222', accent: '#c8452f', paper: '#f7f5f0' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      // grid guides: twelve faint columns that wipe down, then settle to a whisper
      const gk = K.E(t, 0, .7, 'out5'), ga = (.05 - .025 * K.E(t, 1.2, 2.2, 'io')) * (1 - K.E(t, 6.2, 6.8, 'io'));
      c.fillStyle = K.rgba(p.ink, ga * 2.2); for (let i = 0; i < 12; i++) { const gh = H * K.clamp(gk * 1.3 - i * .025); c.fillRect(col(i), 0, 1, gh); c.fillRect(col(i) + CW - 1, 0, 1, gh); }
      // red block: columns 1–4, drops from the top edge
      const rk = K.E(t, .25, 1.0, 'out5') * (1 - K.E(t, 5.9, 6.5, 'in5')), rh = 380 * rk;
      c.fillStyle = p.accent; c.fillRect(col(0), 0, span(4), rh);
      c.save(); c.beginPath(); c.rect(col(0), 0, span(4), rh); c.clip();
      K.setText(c, K.font(22, 'Helvetica Neue', 500), p.paper, 1); c.fillText(p.meta.toUpperCase(), col(0) + 28, rh - 206);
      K.setText(c, K.font(200, 'Helvetica Neue', 700), p.paper, -5); c.fillText(p.num, col(0) + 18, rh - 28);
      c.restore();
      // charcoal block: columns 9–12, slides in from the right edge, bottom band
      const ck = K.E(t, .55, 1.3, 'out5') * (1 - K.E(t, 5.8, 6.4, 'in5')), cx0 = K.mix(W, col(8), ck);
      c.fillStyle = p.ink; c.fillRect(cx0, 850, W - cx0, H - 850);
      c.save(); c.beginPath(); c.rect(cx0, 850, W, H); c.clip();
      K.setText(c, K.font(22, 'Helvetica Neue', 500), p.paper, 1); c.fillText(p.meta2.toUpperCase(), col(8) + 28 + (1 - ck) * 200, 900);
      c.fillStyle = p.accent; c.fillRect(col(8) + 28 + (1 - ck) * 200, 920, 40, 4);
      c.restore();
      // rule across the full measure, drawn left to right; retracts to the right on exit
      const lk = K.E(t, .9, 1.7, 'io5'), lo = K.E(t, 5.6, 6.3, 'io5'), ry = 668;
      c.fillStyle = p.ink; c.fillRect(col(0) + (EDGE - col(0)) * lo, ry, (EDGE - col(0)) * (lk - lo), 3);
      // tick marks on the grid above the rule
      for (let i = 0; i <= 12; i++) { const tk = K.E(t, 1.2 + i * .03, 1.6 + i * .03, 'out5') * (1 - lo); if (tk <= 0) continue; const x = i < 12 ? col(i) : EDGE - 1; c.fillRect(x, ry - 14 * tk, 1, 14 * tk); }
      // title above the rule, subtitle below, both flush-left on column 1
      lift(c, p.title, col(0) - 6, ry - 40, K.font(150, 'Helvetica Neue', 700), p.ink, 150, K.P(t, 1.25, 2.2), K.P(t, 5.3, 6.0), -4);
      lift(c, p.sub, col(0), ry + 72, K.font(44, 'Helvetica Neue', 500), p.ink, 44, K.P(t, 1.6, 2.4), K.P(t, 5.2, 5.8), 0);
    } });
})();
