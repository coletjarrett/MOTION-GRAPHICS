// EDITORIAL SERIF — chapter card on deep ink. A Didot Roman numeral is unveiled from its baseline upward, the
// chapter line tracks in between two hairlines, and the title settles in italic beneath.
(() => {
  K.template({ id: 'editorial-chapter', title: 'Chapter card', style: 'Editorial Serif', type: 'Card', dur: 6, alpha: false,
    fonts: ['400 300px Didot', '400 27px GB', 'italic 400 78px GB'],
    params: { numeral: 'II', chapter: 'Chapter Two', title: 'The Dream of an Immense Image', bg: '#12161d', ink: '#efe8da', gold: '#c8a769' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      const g = c.createRadialGradient(cx, H * .47, 0, cx, H * .47, 760); g.addColorStop(0, K.rgba(p.gold, .075)); g.addColorStop(1, K.rgba(p.gold, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      K.vignette(c, .45);
      const out = K.E(t, 4.85, 5.55, 'io'), alive = 1 - out;

      // fine frame
      const fa = K.E(t, 0, 1.2) * (1 - K.E(t, 5.0, 5.8));
      c.strokeStyle = K.rgba(p.gold, .3 * fa); c.lineWidth = 1; c.strokeRect(78.5, 78.5, W - 157, H - 157);

      // numeral: unveiled bottom-up through a rising mask, settles 18px
      const fN = K.font(300, 'Didot', 400), yN = 500;
      const nk = K.E(t, .25, 1.55, 'io5'), nOut = K.E(t, 4.7, 5.4, 'io5');
      const top = yN - 240, bot = yN + 12, mTop = K.mix(bot, top - 20, nk), mBot = K.mix(bot, top - 20, nOut);
      if (mBot > mTop) {
        c.save(); c.beginPath(); c.rect(0, mTop, W, mBot - mTop); c.clip();
        K.setText(c, fN, p.gold, 6, 'center'); c.fillText(p.numeral, cx + 3, yN + (1 - nk) * 18 - nOut * 18);
        c.restore();
      }

      // chapter line in wide small caps, flanked by hairlines
      const fC = K.font(27, 'GB', 400), sC = p.chapter.toUpperCase(), tr = 13, yC = 626;
      const wC = K.width(c, sC, fC, tr), hk = K.E(t, 1.1, 2.1, 'io5') * (1 - K.E(t, 4.8, 5.4, 'io5')), L = 120 * hk, gap = 34;
      c.fillStyle = K.rgba(p.gold, .85);
      if (L > 0) { c.fillRect(cx - wC / 2 - gap - L, yC - 9, L, 1.2); c.fillRect(cx + wC / 2 + gap, yC - 9, L, 1.2); }
      K.reveal(c, sC, cx, yC, { font: fC, color: p.gold, track: tr, align: 'center', k: K.P(t, 1.0, 2.0), mode: 'fade', stagger: .5, alpha: alive });

      // title in italic, word by word out of soft focus
      const fT = K.font(78, 'GB', 400, 'italic'), words = p.title.split(' '), sp = K.width(c, ' ', fT);
      const wd = words.map(w => K.width(c, w, fT)), tw = wd.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      let x = cx - tw / 2; const yT = 736;
      words.forEach((w, i) => {
        const a = 1.5 + i * .12, k = K.E(t, a, a + 1.0, 'out');
        if (k > 0) { c.save(); c.globalAlpha = k * alive; c.filter = k < 1 ? `blur(${(1 - k) * 6}px)` : 'none'; K.setText(c, fT, p.ink); c.fillText(w, x, yT + (1 - k) * 14 + out * 8); c.restore(); }
        x += wd[i] + sp;
      });
      c.globalAlpha = 1; K.grain(c, t, .035);
    } });
})();
