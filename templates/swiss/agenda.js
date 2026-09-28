// SWISS GRID — program agenda. A heading and full-measure rule set the grid; the four items are revealed row
// by row (hairline, number, title, note, time), then a charcoal highlight bar steps precisely from item to
// item, inverting the type it passes over. Data-driven: pass any list of {n, title, note, time} (4–5 rows fit).
(() => {
  const M = 150, GUT = 24, CW = (1920 - 2 * M - 11 * GUT) / 12;
  const col = i => M + i * (CW + GUT), EDGE = col(11) + CW;
  const lift = (c, s, x, y, font, color, size, k, o = 0, track = 0, align = 'left') => {
    if (k <= 0 || o >= 1) return; c.save(); c.beginPath(); c.rect(x - 2000, y - size * 1.05, 4000, size * 1.35); c.clip();
    K.setText(c, font, color, track, align); c.fillText(s, x, y + (1 - K.ease.out5(k)) * size * 1.15 - K.ease.in5(o) * size * 1.2); c.restore();
  };

  K.template({ id: 'swiss-agenda', title: 'Program agenda', style: 'Swiss Grid', type: 'Agenda / list', dur: 12, alpha: false,
    fonts: ['700 96px "Helvetica Neue"', '700 60px "Helvetica Neue"', '500 26px "Helvetica Neue"', '500 22px "Helvetica Neue"', '500 56px "Helvetica Neue"'],
    params: { label: 'Program', heading: 'Agenda', meta: 'Session 2 · Sample times',
      items: [{ n: '01', title: 'Opening', note: 'Song and prayer', time: '10:00' }, { n: '02', title: 'Report', note: 'Translation progress', time: '10:10' },
        { n: '03', title: 'Interview', note: 'Two translators', time: '10:35' }, { n: '04', title: 'Conclusion', note: 'Summary and song', time: '11:05' }],
      bg: '#efece6', ink: '#222222', accent: '#c8452f', paper: '#f7f5f0', muted: '#7a7772' },
    draw(c, t, p) {
      const W = K.W, H = K.H, n = p.items.length, top = 402, RH = Math.min(124, 500 / n);
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      const X = K.E(t, 11.0, 11.6, 'in5');   // global exit
      // heading block: red label square + label, big heading, meta flush right on the grid
      const sq = K.E(t, .2, .6, 'out5') * (1 - X); c.fillStyle = p.accent; c.fillRect(col(0), 150, 22 * sq, 22);
      lift(c, p.label.toUpperCase(), col(0) + 36, 170, K.font(22, 'Helvetica Neue', 500), p.ink, 22, K.P(t, .3, .9), K.P(t, 10.8, 11.3), 1.5);
      lift(c, p.heading, col(0) - 4, 290, K.font(96, 'Helvetica Neue', 700), p.ink, 96, K.P(t, .45, 1.3), K.P(t, 10.85, 11.45), -2.5);
      lift(c, p.meta, EDGE, 290, K.font(26, 'Helvetica Neue', 500), p.muted, 26, K.P(t, .8, 1.5), K.P(t, 10.8, 11.3), 0, 'right');
      // full-measure rule
      const lk = K.E(t, .6, 1.4, 'io5'), lo = K.E(t, 10.9, 11.6, 'io5');
      c.fillStyle = p.ink; c.fillRect(col(0) + (EDGE - col(0)) * lo, 322, (EDGE - col(0)) * (lk - lo), 3);
      // column heads
      const hk = K.P(t, 1.0, 1.6), ho = K.P(t, 10.7, 11.2), fH = K.font(22, 'Helvetica Neue', 500);
      lift(c, 'NO.', col(0), 372, fH, p.muted, 22, hk, ho, 1.5); lift(c, 'SESSION', col(2), 372, fH, p.muted, 22, hk, ho, 1.5);
      const th = K.E(t, 1.1, 1.8, 'io5') * (1 - K.E(t, 10.3, 10.9, 'io5')); c.fillStyle = K.rgba(p.ink, .5); c.fillRect(col(0), top, (EDGE - col(0)) * th, 1);
      lift(c, 'NOTE', col(7), 372, fH, p.muted, 22, hk, ho, 1.5); lift(c, 'TIME', EDGE, 372, fH, p.muted, 22, hk, ho, 1.5, 'right');
      // the rows, drawn with a colour set so the highlight pass can repaint them inverted
      const t0 = 1.5, step = .55, fN = K.font(60, 'Helvetica Neue', 700), fT = K.font(60, 'Helvetica Neue', 700), fS = K.font(26, 'Helvetica Neue', 500), fTm = K.font(56, 'Helvetica Neue', 500);
      const rows = (ink, num, muted, line) => p.items.forEach((it, i) => {
        const ti = t0 + i * step, y = top + i * RH, base = y + RH / 2 + 21, o = K.P(t, 10.4 + i * .08, 10.9 + i * .08);
        const hl = K.E(t, ti, ti + .6, 'io5') * (1 - K.E(t, 10.4 + i * .08, 10.9 + i * .08, 'io5'));
        if (line && hl > 0) { c.fillStyle = K.rgba(p.ink, .28); c.fillRect(col(0), y + RH, (EDGE - col(0)) * hl, 1); }
        lift(c, it.n, col(0), base, fN, num, 60, K.P(t, ti + .1, ti + .7), o, -1);
        lift(c, it.title, col(2) - 3, base, fT, ink, 60, K.P(t, ti + .18, ti + .8), o, -1.5);
        lift(c, it.note, col(7), base - 6, fS, muted, 26, K.P(t, ti + .3, ti + .9), o, 0);
        lift(c, it.time, EDGE, base, fTm, ink, 56, K.P(t, ti + .24, ti + .85), o, -.5, 'right');
      });
      rows(p.ink, p.accent, p.muted, true);
      // highlight bar: arrives on row 1, then steps down one row at a time; collapses on exit
      const hs = 4.0, hd = 1.5, arrive = K.E(t, hs, hs + .5, 'out5'), leave = K.E(t, 10.1, 10.6, 'in5');
      let pos = 0; for (let i = 1; i < n; i++) pos += K.E(t, hs + i * hd, hs + i * hd + .45, 'io5');
      if (arrive > 0 && leave < 1) {
        const by = top + pos * RH + 1, bx = col(0) - 24, bw = (EDGE + 24 - bx), x0 = bx + bw * leave, w = bw * arrive * (1 - leave);
        c.fillStyle = p.ink; c.fillRect(x0, by, w, RH - 1);
        c.fillStyle = p.accent; c.fillRect(x0, by, Math.min(w, 8), RH - 1);
        c.save(); c.beginPath(); c.rect(x0, by, w, RH - 1); c.clip(); rows(p.paper, '#e5715a', 'rgba(247,245,240,.62)', false); c.restore();
      }
    } });
})();
