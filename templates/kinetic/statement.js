// KINETIC TYPE — two-line statement built word by word. Each word rises into its own mask; the line re-centres
// itself as every new word arrives (the earlier words glide aside to make room). A colour bar wipes in behind the
// key word of each line, the first line lifts to make room for the second, and the reference settles beneath.
(() => {
  const N = 'Avenir Next';
  K.template({ id: 'kinetic-statement', title: 'Statement', style: 'Kinetic Type', type: 'Card', dur: 10, alpha: false,
    fonts: ['800 128px "Avenir Next"', '700 42px "DIN Condensed"'],
    params: { line1: 'Imitate their faith.', key1: 'faith.', line2: 'Learn from their example.', key2: 'example.', ref: 'Hebrews 13:7',
      bg: '#111418', ink: '#f2eee6', accent: '#e2a33a' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2, cy = H / 2 - 48;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      K.vignette(c, .3);

      // fit the longest line inside title-safe
      const base = 128, fb = K.font(base, N, 800), tr = -1.5;
      const wMax = Math.max(K.width(c, p.line1, fb, tr), K.width(c, p.line2, fb, tr));
      const size = Math.min(base, Math.floor(base * 1460 / wMax)), f = K.font(size, N, 800), trk = tr * size / base;
      const sp = K.width(c, ' ', f) * 1.05, lh = size * 1.3;

      // line build: word i arrives at T[i]
      const build = (text, key, T, y, exitT0) => {
        const ws = text.split(' ').map(w => ({ w, wd: K.width(c, w, f, trk), key: w === key }));
        // the line re-centres as each word's slot opens; words are chained so they can never overlap
        const e = ws.map((_, i) => K.E(t, T[i] - .1, T[i] + .65, 'io'));
        const tw = ws.reduce((a, o, i) => a + e[i] * (o.wd + sp), 0) - sp * e[0];
        let x = cx - tw / 2;
        ws.forEach((o, i) => {
          o.x = x; x += e[i + 1] !== undefined ? o.wd + sp : 0;
          o.k = K.E(t, T[i], T[i] + .7, 'out5'); o.o = K.E(t, exitT0 + i * .07, exitT0 + i * .07 + .6, 'in');
        });
        return ws;
      };
      const drawLine = (ws, y, barK, barOut) => {
        const top = y - size * .9, bot = y + size * .3;
        // bar behind the key word
        const kw = ws.find(o => o.key);
        let bx0 = 0, bx1 = 0;
        if (kw && barK > 0) {
          const pad = size * .12; bx0 = kw.x - pad + (kw.wd + pad * 2) * barOut; bx1 = kw.x - pad + (kw.wd + pad * 2) * barK;
          if (bx1 > bx0) { c.fillStyle = p.accent; c.fillRect(bx0, y - size * .8, bx1 - bx0, size * 1.1); }
        }
        for (const o of ws) {
          if (o.k <= 0 || o.o >= 1) continue;
          const dy = (1 - o.k) * size * 1.2 - o.o * size * 1.2;
          c.save(); c.beginPath(); c.rect(o.x - 30, top, o.wd + 60, bot - top); c.clip();
          K.setText(c, f, p.ink, trk); c.fillText(o.w, o.x, y + dy);
          if (o.key && bx1 > bx0) { c.beginPath(); c.rect(bx0, top, bx1 - bx0, bot - top); c.clip(); K.setText(c, f, p.bg, trk); c.fillText(o.w, o.x, y + dy); }
          c.restore();
        }
      };

      // line 1 builds centred, then lifts to make room for line 2
      const lift = K.E(t, 3.3, 4.2, 'io');
      const y1 = K.mix(cy + size * .34, cy - lh * .5 + size * .34, lift), y2 = cy + lh * .5 + size * .34;
      const A = build(p.line1, p.key1, [.4, .85, 1.3], y1, 8.55);
      const B = build(p.line2, p.key2, [4.0, 4.4, 4.8, 5.2], y2, 8.7);
      drawLine(A, y1, K.E(t, 2.0, 2.65, 'io5'), K.E(t, 8.4, 8.95, 'io5'));
      drawLine(B, y2, K.E(t, 6.0, 6.65, 'io5'), K.E(t, 8.5, 9.05, 'io5'));

      // reference, set on the grid below line 2
      const rk = K.E(t, 6.7, 7.5, 'out5') * (1 - K.E(t, 8.5, 9.0, 'io'));
      if (rk > 0) {
        const yR = y2 + size * .62 + 64;
        c.save(); c.beginPath(); c.rect(0, yR - 40, W, 54); c.clip();
        K.setText(c, K.font(42, 'DIN Condensed', 700), p.accent, 6, 'center'); c.globalAlpha = rk; c.fillText(p.ref.toUpperCase(), cx + 3, yR + (1 - rk) * 30);
        c.restore();
        c.fillStyle = K.rgba(p.ink, .35 * rk); c.fillRect(cx - 24 * rk, yR - 58, 48 * rk, 2);
      }
    } });
})();
