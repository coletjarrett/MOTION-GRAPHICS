// EDITORIAL SERIF — program open. A fine gold frame draws itself around an ivory page; the series title settles
// out of a soft focus word by word (one word set in italic), an ornamental rule opens from its lozenge, and the
// episode line follows in small caps and italic. Everything eases away, leaving the empty page.
(() => {
  // draw a run of mixed-font segments on one baseline; returns total width when measuring
  const runW = (c, segs) => segs.reduce((w, s, i) => w + K.width(c, s.s, s.f, s.tr || 0) + (i ? (s.gap || 0) : 0), 0);

  K.template({ id: 'editorial-bumper', title: 'Program open', style: 'Editorial Serif', type: 'Bumper / open', dur: 7, alpha: false,
    fonts: ['400 124px GB', 'italic 400 124px GB', 'italic 400 50px GB', '400 25px GB'],
    params: { kicker: 'A Video Series', title: 'Faith and Everyday Life', italic: 'and', episode: 'Episode 7', sub: 'Contentment',
      bg: '#f4efe4', ink: '#1f1d1a', gold: '#a3824a' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2;
      c.drawImage(K.paper(W, H, 7, p.bg, { blot: .22, fibres: 900 }), 0, 0);
      const g = c.createRadialGradient(cx, H / 2, 200, cx, H / 2, W * .72); g.addColorStop(0, 'rgba(255,255,255,.26)'); g.addColorStop(1, 'rgba(70,50,20,.07)'); c.fillStyle = g; c.fillRect(0, 0, W, H);

      const out = K.E(t, 5.75, 6.55, 'io');           // shared exit
      const alive = 1 - out;

      // ---- frame: a hairline that draws from top-centre round both sides to meet at the bottom ----
      const m = 78, fk = K.E(t, .1, 1.6, 'io5'), fo = K.E(t, 6.1, 6.9, 'io5');
      const half = (dir) => [[cx, m], [dir < 0 ? m : W - m, m], [dir < 0 ? m : W - m, H - m], [cx, H - m]];
      c.strokeStyle = K.rgba(p.gold, .55); c.lineWidth = 1.2;
      for (const d of [-1, 1]) K.draw(c, half(d), fk, fo);
      c.strokeStyle = K.rgba(p.gold, .28); c.lineWidth = 1;
      const m2 = m + 9, half2 = (dir) => [[cx, m2], [dir < 0 ? m2 : W - m2, m2], [dir < 0 ? m2 : W - m2, H - m2], [cx, H - m2]];
      for (const d of [-1, 1]) K.draw(c, half2(d), K.E(t, .3, 1.8, 'io5'), K.E(t, 6.0, 6.8, 'io5'));

      // ---- kicker (small caps, wide tracking) ----
      const fK = K.font(25, 'GB', 400);
      c.globalAlpha = alive;
      K.reveal(c, p.kicker.toUpperCase(), cx, 400 - out * 8, { font: fK, color: p.gold, track: 11, align: 'center', k: K.P(t, .5, 1.6), mode: 'track', stagger: .25, alpha: alive });

      // ---- title: words defocus into place, one set in italic ----
      const fR = K.font(124, 'GB', 400), fI = K.font(124, 'GB', 400, 'italic'), tr = -1;
      const words = p.title.split(' '), sp = K.width(c, ' ', fR) * .92;
      const ws = words.map(w => ({ w, f: w === p.italic ? fI : fR, it: w === p.italic }));
      ws.forEach(o => o.wd = K.width(c, o.w, o.f, tr));
      const total = ws.reduce((a, o) => a + o.wd, 0) + sp * (ws.length - 1);
      let x = cx - total / 2; const yT = 548;
      ws.forEach((o, i) => {
        const a = .75 + i * .2, k = K.E(t, a, a + 1.1, 'out');
        if (k > 0) {
          c.save(); c.globalAlpha = k * alive;
          c.filter = k < 1 ? `blur(${(1 - k) * 7}px)` : 'none';
          K.setText(c, o.f, o.it ? p.gold : p.ink, tr); c.fillText(o.w, x, yT + (1 - k) * 16 - out * 12);
          c.restore();
        }
        x += o.wd + sp;
      });

      // ---- ornamental rule: lozenge first, hairlines open outward, tiny terminal dots ----
      const yR = 622, rk = K.E(t, 1.5, 2.6, 'io5') * (1 - K.E(t, 5.8, 6.5, 'io5')), lz = K.E(t, 1.35, 1.9, 'out') * (1 - K.E(t, 6.2, 6.6));
      c.globalAlpha = 1;
      if (lz > 0) {
        c.save(); c.translate(cx, yR); c.rotate(Math.PI / 4); c.strokeStyle = p.gold; c.lineWidth = 1.4; const s = 7 * lz; c.strokeRect(-s, -s, s * 2, s * 2);
        c.fillStyle = p.gold; c.fillRect(-2.2 * lz, -2.2 * lz, 4.4 * lz, 4.4 * lz); c.restore();
      }
      if (rk > 0) {
        const L = 190 * rk; c.fillStyle = p.gold;
        c.fillRect(cx + 22, yR - .6, L, 1.2); c.fillRect(cx - 22 - L, yR - .6, L, 1.2);
        c.beginPath(); c.arc(cx + 26 + L, yR, 2.2 * rk, 0, K.TAU); c.arc(cx - 26 - L, yR, 2.2 * rk, 0, K.TAU); c.fill();
      }

      // ---- episode line: SMALL CAPS · Italic ----
      const fE = K.font(25, 'GB', 400), fS = K.font(50, 'GB', 400, 'italic');
      const e1 = p.episode.toUpperCase(), dot = '·';
      const w1 = K.width(c, e1, fE, 9), wd = K.width(c, dot, fE), w2 = K.width(c, p.sub, fS, .3), gap = 26;
      const tw = w1 + gap + wd + gap + w2, x0 = cx - tw / 2, yE = 712;
      const k1 = K.E(t, 2.0, 2.9, 'out'), k2 = K.E(t, 2.35, 3.4, 'out');
      c.save(); c.globalAlpha = k1 * alive; K.setText(c, fE, p.gold, 9); c.fillText(e1, x0 - (1 - k1) * 14, yE - 3);
      K.setText(c, fE, p.gold, 0); c.fillText(dot, x0 + w1 + gap, yE - 3); c.restore();
      c.save(); c.globalAlpha = k2 * alive; c.filter = k2 < 1 ? `blur(${(1 - k2) * 5}px)` : 'none';
      K.setText(c, fS, p.ink, .3); c.fillText(p.sub, x0 + w1 + gap * 2 + wd + (1 - k2) * 14, yE + 4); c.restore();

      c.globalAlpha = 1; K.grain(c, t, .03);
    } });
})();
