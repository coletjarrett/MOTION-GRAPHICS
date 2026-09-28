// CLEAN MINIMAL — verse card. Lines of a scripture fade up one at a time, key words warm to the accent colour,
// the reference settles beneath.
K.template({ id: 'minimal-verse', title: 'Verse card', style: 'Clean Minimal', type: 'Scripture card', dur: 12, alpha: false,
  fonts: ['400 54px "Avenir Next"', '600 54px "Avenir Next"', '500 30px "Avenir Next"'],
  params: { lines: ['“In the days of those kings', 'the God of heaven will set up a kingdom', 'that will never be destroyed.”'], key: ['kingdom', 'never be destroyed.”'], ref: 'Daniel 2:44', bg: '#f5f3ef', ink: '#26282b', accent: '#a9803f' },
  draw(c, t, p) {
    const W = K.W, H = K.H, n = p.lines.length, lh = 84, y0 = H / 2 - (n - 1) * lh / 2 - 30;
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    const out = K.E(t, 10.9, 11.8, 'in'); c.globalAlpha = 1 - out;
    const f = K.font(54, 'Avenir Next', 400), fb = K.font(54, 'Avenir Next', 600);
    p.lines.forEach((ln, i) => {
      const k = K.E(t, .4 + i * 1.1, 1.6 + i * 1.1, 'out'); if (k <= 0) return;
      const w = K.width(c, ln, f), x = W / 2 - w / 2, y = y0 + i * lh + (1 - k) * 18;
      c.globalAlpha = k * (1 - out); K.setText(c, f, p.ink); c.fillText(ln, x, y);
      for (const kw of p.key) { const j = ln.indexOf(kw); if (j < 0) continue; const xo = K.width(c, ln.slice(0, j), f); const warm = K.E(t, 4.6 + i * .3, 5.6 + i * .3);
        c.globalAlpha = warm * (1 - out); K.setText(c, f, p.accent); c.fillText(kw, x + xo, y); c.fillRect(x + xo, y + 14, K.width(c, kw, f) * warm, 2); }
    });
    c.globalAlpha = 1 - out;
    const kr = K.E(t, 4.0, 5.0); c.fillStyle = p.accent; c.fillRect(W / 2 - 30 * kr, y0 + n * lh + 10, 60 * kr, 2);
    K.reveal(c, p.ref.toUpperCase(), W / 2, y0 + n * lh + 70, { font: K.font(30, 'Avenir Next', 500), color: p.accent, track: 6, align: 'center', k: K.P(t, 4.2, 5.2), mode: 'track' });
    c.globalAlpha = 1; K.grain(c, t, .03);
  } });
