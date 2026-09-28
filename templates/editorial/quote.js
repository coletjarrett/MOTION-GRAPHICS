// EDITORIAL SERIF — pull-quote card. A magazine running head sits above; a large gold quotation mark hangs in the
// margin, the quote sets itself word by word in a book serif (chosen words in italic), and the reference follows
// in wide small caps after an em rule.
(() => {
  K.template({ id: 'editorial-quote', title: 'Pull quote', style: 'Editorial Serif', type: 'Scripture card', dur: 10, alpha: false,
    fonts: ['400 90px GB', 'italic 400 90px GB', '400 22px GB', '400 30px GB', '400 560px Didot'],
    params: { lines: ['The dream is true,', 'and its interpretation', 'is trustworthy.'], italic: ['trustworthy.'], ref: 'Daniel 2:45',
      head: 'Faith and Everyday Life', folio: 'No. 7', bg: '#f4efe4', ink: '#1f1d1a', gold: '#a3824a' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(K.paper(W, H, 11, p.bg, { blot: .22, fibres: 900 }), 0, 0);
      const g = c.createRadialGradient(W * .5, H * .5, 150, W * .5, H * .5, W * .75); g.addColorStop(0, 'rgba(255,255,255,.24)'); g.addColorStop(1, 'rgba(70,50,20,.07)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const out = K.E(t, 8.9, 9.7, 'io'), alive = 1 - out;

      // ---- running head ----
      const fH = K.font(22, 'GB', 400), yH = 168, hk = K.E(t, .1, 1.3, 'io5') * (1 - K.E(t, 9.0, 9.8, 'io5'));
      c.fillStyle = K.rgba(p.gold, .6);
      const hw = (W - 300) * hk; if (hw > 0) c.fillRect(W / 2 - hw / 2, yH + 22, hw, 1);
      c.globalAlpha = K.E(t, .5, 1.4) * alive;
      K.setText(c, fH, p.gold, 7, 'left'); c.fillText(p.head.toUpperCase(), 150, yH);
      K.setText(c, fH, p.gold, 7, 'right'); c.fillText(p.folio.toUpperCase(), W - 150 + 7, yH);
      c.globalAlpha = 1;

      // ---- quote layout ----
      const fR = K.font(90, 'GB', 400), fI = K.font(90, 'GB', 400, 'italic'), lh = 118, sp = K.width(c, ' ', fR) * .95;
      const lines = p.lines.map(ln => { const ws = ln.split(' ').map(w => ({ w, f: p.italic.includes(w) ? fI : fR })); ws.forEach(o => o.wd = K.width(c, o.w, o.f)); return { ws, w: ws.reduce((a, o) => a + o.wd, 0) + sp * (ws.length - 1) }; });
      const bw = Math.max(...lines.map(l => l.w)), x0 = Math.round((W - bw) / 2 + 60);
      const y0 = H / 2 - (lines.length - 1) * lh / 2 + 16;

      // hanging quote mark
      const qk = K.E(t, .35, 1.6, 'out');
      if (qk > 0) {
        c.save(); c.globalAlpha = qk * alive; c.filter = qk < 1 ? `blur(${(1 - qk) * 8}px)` : 'none';
        K.setText(c, K.font(560, 'Didot', 400), p.gold, 0, 'right'); c.fillText('“', x0 - 22, y0 + 300 + (1 - qk) * 24 - out * 10); c.restore();
      }

      // words
      let wi = 0;
      lines.forEach((ln, li) => {
        let x = x0; const y = y0 + li * lh;
        ln.ws.forEach(o => {
          const a = 1.0 + li * .55 + wi * .16, k = K.E(t, a, a + 1.0, 'out'); wi++;
          if (k > 0) {
            c.save(); c.globalAlpha = k * alive; c.filter = k < 1 ? `blur(${(1 - k) * 5}px)` : 'none';
            K.setText(c, o.f, p.ink, 0); c.fillText(o.w, x, y + (1 - k) * 14 - out * 10); c.restore();
          }
          x += o.wd + sp;
        });
        if (li === lines.length - 1) { // closing mark in gold
          const a = 1.0 + li * .55 + wi * .16, k = K.E(t, a, a + 1.0, 'out');
          if (k > 0) { c.save(); c.globalAlpha = k * alive; K.setText(c, fR, p.gold); c.fillText('”', x - sp + 4, y - out * 10); c.restore(); }
        }
      });

      // attribution
      const ya = y0 + (lines.length - 1) * lh + 104, ak = K.E(t, 3.7, 4.6, 'out5');
      c.globalAlpha = alive;
      c.fillStyle = p.gold; if (ak > 0) c.fillRect(x0 + 2, ya - 9, 44 * ak, 1.5);
      K.reveal(c, p.ref.toUpperCase(), x0 + 66, ya, { font: K.font(30, 'GB', 400), color: p.gold, track: 8, k: K.P(t, 3.9, 5.0), mode: 'track', stagger: .3, alpha: alive });
      c.globalAlpha = 1; K.grain(c, t, .03);
    } });
})();
