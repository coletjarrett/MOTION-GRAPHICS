// INFOGRAPHIC — side-by-side comparison. Two cards rise in with a 'vs' disc between them; an hours bar grows on
// each (long and slow on the left, short and quick on the right) while the value counts, then language chips show one
// manual re-edit per language versus one edit feeding every language. Labelled ILLUSTRATIVE ESTIMATE.
(() => {
  // ---------- infographic kit (self-contained) ----------
  const C = { navy: '#1f3350', teal: '#2e8b8b', sand: '#e9dcc3', coral: '#e07a5f', sandDeep: '#c9a970', bg: '#f7f3ec', muted: '#6d7788', card: '#fffdf9' };
  const F = (s, w = 500) => K.font(s, 'Avenir Next', w);
  const FONTS = ['400 24px "Avenir Next"', '500 30px "Avenir Next"', '600 54px "Avenir Next"', '700 96px "Avenir Next"', '600 20px "Avenir Next"'];
  // calm background: warm off-white with a soft light falloff (cached)
  const bg = (col) => K.cached(`igBg|${col}`, 1920, 1080, (c, w, h) => {
    c.fillStyle = col; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w * .5, h * .45, 300, w / 2, h / 2, w * .85); g.addColorStop(0, 'rgba(255,253,248,.45)'); g.addColorStop(1, 'rgba(150,120,80,.10)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  // kicker + title, top-left in title-safe; k = entrance progress, o = exit progress
  const header = (c, t, p, t0 = .2) => {
    K.reveal(c, p.kicker.toUpperCase(), 150, 160, { font: F(22, 600), color: p.teal || C.teal, track: 5, k: K.P(t, t0, t0 + .9), mode: 'fade', stagger: .4 });
    K.reveal(c, p.title, 150, 226, { font: F(54, 600), color: p.navy || C.navy, k: K.P(t, t0 + .15, t0 + 1.1), mode: 'rise', dist: 26, stagger: .3, by: 'word' });
  };
  // small outlined pill, right-aligned at (x, y)
  const pill = (c, s, x, y, k, col = C.navy) => {
    if (k <= 0) return; const f = F(17, 600), w = K.width(c, s, f, 3) + 36;
    c.save(); c.globalAlpha *= k; c.strokeStyle = K.rgba(col, .45); c.lineWidth = 1.5; K.rr(c, x - w, y - 20, w, 38, 19); c.stroke();
    K.setText(c, f, K.rgba(col, .75), 3, 'center'); c.fillText(s, x - w / 2 + 1.5, y + 5); c.restore();
  };
  const fmt = n => Math.round(n).toLocaleString('en-US');
  // soft card with shadow
  const card = (c, x, y, w, h, r = 26, a = 1) => {
    c.save(); c.globalAlpha *= a; c.shadowColor = 'rgba(31,51,80,.10)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = C.card; K.rr(c, x, y, w, h, r); c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = 'rgba(31,51,80,.07)'; c.lineWidth = 1.5; c.stroke(); c.restore();
  };
  // line icons on a 100×100 grid: lists of polylines, drawn on with k (0..1) in sequence
  const arc = (x, y, r, a0, a1, n = 40) => K.circle(x, y, r, a0, a1, n);
  const ICON = {
    house: () => [[[12, 50], [50, 16], [88, 50]], [[24, 40], [24, 86], [76, 86], [76, 40]], [[43, 86], [43, 63], [57, 63], [57, 86]]],
    people: () => [arc(40, 34, 13, -Math.PI / 2, Math.PI * 1.5), arc(40, 88, 27, Math.PI, Math.PI * 2), arc(70, 40, 10, -Math.PI / 2, Math.PI * 1.5), [...arc(70, 86, 20, Math.PI * 1.33, Math.PI * 2)]],
    clock: (h = 0) => [arc(50, 50, 38, -Math.PI / 2, Math.PI * 1.5, 64), [[50, 50], [50 + Math.sin(h) * 24, 50 - Math.cos(h) * 24]], [[50, 50], [50 + Math.sin(h / 12 + 2.1) * 16, 50 - Math.cos(h / 12 + 2.1) * 16]]],
    request: () => [[[18, 28], [82, 28], [82, 68], [46, 68], [30, 82], [32, 68], [18, 68], [18, 28]], [[32, 44], [68, 44]], [[32, 55], [58, 55]]],
    design: () => [[[26, 74], [66, 34], [78, 46], [38, 86], [22, 90], [26, 74]], [[58, 42], [70, 54]], [[18, 22], [44, 22]], [[18, 32], [34, 32]]],
    approve: () => [arc(50, 50, 36, -Math.PI / 2, Math.PI * 1.5, 64), [[34, 51], [45, 62], [67, 39]]],
    build: () => [[[16, 84], [84, 84]], [[20, 84], [20, 62], [48, 62], [48, 84]], [[52, 84], [52, 62], [80, 62], [80, 84]], [[36, 62], [36, 40], [64, 40], [64, 62]], [[44, 40], [44, 24], [56, 24], [56, 40]]],
    pencil: () => ICON.design(),
    refresh: () => { const d = Math.PI / 180, R = 30, head = (ang) => { const ex = 50 + Math.cos(ang) * R, ey = 50 + Math.sin(ang) * R, tx = -Math.sin(ang), ty = Math.cos(ang);
      return [[ex - tx * 13 - ty * 9, ey - ty * 13 + tx * 9], [ex, ey], [ex - tx * 13 + ty * 9, ey - ty * 13 - tx * 9]]; };
      return [arc(50, 50, R, 200 * d, 340 * d), head(340 * d), arc(50, 50, R, 20 * d, 160 * d), head(160 * d)]; },
  };
  const icon = (c, name, x, y, size, col, k, lw = 5, arg) => {
    if (k <= 0) return; const P = ICON[name](arg), n = P.length, s = size / 100;
    c.save(); c.translate(x - size / 2, y - size / 2); c.strokeStyle = col; c.lineWidth = lw / s * s; c.lineCap = 'round'; c.lineJoin = 'round';
    P.forEach((pl, i) => { const kk = K.clamp(k * (n * .6 + 1) - i * .6); if (kk > 0) K.draw(c, pl.map(([a, b]) => [a * s, b * s]), K.ease.io(kk)); });
    c.restore();
  };

  K.template({ id: 'infographic-compare', title: 'Side-by-side comparison', style: 'Infographic', type: 'Chart', dur: 10, alpha: false,
    fonts: [...FONTS, '600 40px "Avenir Next"', '600 72px "Avenir Next"'],
    params: { kicker: 'Making a lower-third package', title: 'Two ways to work', tag: 'ILLUSTRATIVE ESTIMATE',
      left: { name: 'Traditional workflow', hours: 40, rev: 'Manual', revNote: 'one re-edit per language' },
      right: { name: 'Code-driven workflow', hours: 3, rev: 'Automatic', revNote: 'one edit, every language re-renders' },
      metric1: 'Hours per lower-third package', metric2: 'Revisions per language', langs: ['EN', 'ES', 'FR', 'PT', 'SW', 'KO'],
      callout: 'About 13× less time per package', bg: '#f7f3ec', navy: '#1f3350', teal: '#2e8b8b', coral: '#e07a5f' },
    draw(c, t, p) {
      const W = K.W, cw = 760, ch = 540, gap = 100, xL = W / 2 - gap / 2 - cw, xR = W / 2 + gap / 2, y0 = 290;
      c.drawImage(bg(p.bg), 0, 0);
      const out = K.E(t, 9.1, 9.85, 'io');
      c.save(); c.globalAlpha = 1 - out;
      header(c, t, p); pill(c, p.tag, W - 150, 160, K.E(t, .6, 1.2), p.coral);
      const maxH = Math.max(p.left.hours, p.right.hours);
      [[p.left, xL, p.coral, 0], [p.right, xR, p.teal, 1]].forEach(([side, x, acc, j]) => {
        const k = K.E(t, .5 + j * .2, 1.3 + j * .2, 'out5'); if (k <= 0) return;
        const y = y0 + (1 - k) * 50;
        c.save(); c.globalAlpha *= K.clamp(k * 1.4);
        card(c, x, y, cw, ch, 28);
        c.fillStyle = acc; K.rr(c, x, y, cw, 10, 5); c.save(); c.beginPath(); K.rr(c, x, y, cw, ch, 28); c.clip(); c.fillRect(x, y, cw, 8); c.restore();
        const px = x + 60;
        // header row: icon + name
        icon(c, j ? 'refresh' : 'pencil', px + 26, y + 88, 56, acc, K.P(t, 1.0 + j * .2, 2.0 + j * .2), 4.5);
        K.setText(c, F(40, 600), p.navy, 0, 'left'); c.fillText(side.name, px + 76, y + 102);
        // metric 1: hours bar
        K.setText(c, F(20, 600), C.muted, 3, 'left'); c.fillText(p.metric1.toUpperCase(), px, y + 180);
        const bw = cw - 120, kb = K.E(t, 1.8 + j * .35, (j ? 2.6 : 3.8) + j * .35, 'io');
        c.fillStyle = '#efe6d4'; K.rr(c, px, y + 204, bw, 34, 17); c.fill();
        const fw = Math.max(34, bw * side.hours / maxH * kb); if (kb > 0) { c.fillStyle = acc; K.rr(c, px, y + 204, fw, 34, 17); c.fill(); }
        K.setText(c, F(72, 600), p.navy, 0, 'left'); const num = Math.round(side.hours * kb);
        c.globalAlpha *= K.clamp(kb * 4); c.fillText(String(num), px, y + 318);
        const wn = K.width(c, String(num), F(72, 600)); K.setText(c, F(30, 500), C.muted, 0, 'left'); c.fillText('hours', px + wn + 14, y + 318);
        c.globalAlpha = K.clamp(k * 1.4) * (1 - out);
        // metric 2: revisions per language
        c.fillStyle = 'rgba(31,51,80,.08)'; c.fillRect(px, y + 360, bw, 1.5);
        K.setText(c, F(20, 600), C.muted, 3, 'left'); c.fillText(p.metric2.toUpperCase(), px, y + 404);
        const nL = p.langs.length, chipW = 64, chipG = 12;
        if (!j) { // one manual edit per language: chips appear one by one, each with a small pencil tick
          p.langs.forEach((L, i) => { const kc = K.E(t, 4.0 + i * .32, 4.35 + i * .32, 'outBack'); if (kc <= 0) return;
            const cx = px + i * (chipW + chipG); c.save(); c.translate(cx + chipW / 2, y + 450); c.scale(kc, kc);
            c.fillStyle = K.rgba(acc, .14); K.rr(c, -chipW / 2, -22, chipW, 44, 10); c.fill(); c.strokeStyle = K.rgba(acc, .6); c.lineWidth = 1.5; c.stroke();
            K.setText(c, F(20, 600), acc, 1, 'center', 'middle'); c.fillText(L, 0, 1); c.restore(); });
        } else { // one edit feeds every language at once
          const k1 = K.E(t, 4.1, 4.5, 'outBack'), k2 = K.E(t, 4.6, 5.4, 'io');
          if (k1 > 0) { c.save(); c.translate(px + 44, y + 450); c.scale(k1, k1); c.fillStyle = acc; K.rr(c, -44, -22, 88, 44, 10); c.fill();
            K.setText(c, F(20, 600), '#fff', 1, 'center', 'middle'); c.fillText('EDIT', 0, 1); c.restore(); }
          const lastX = px + 150 + (nL - 1) * (chipW - 6 + chipG) + chipW / 2; c.strokeStyle = K.rgba(acc, .45); c.lineWidth = 2; if (k2 > 0) K.draw(c, [[px + 88, y + 450], [lastX, y + 450]], K.clamp(k2 * 1.25));
          p.langs.forEach((L, i) => { const cx = px + 150 + i * (chipW - 6 + chipG), kk = K.clamp(k2 * 1.6 - i * .1); if (kk <= 0) return;
            if (kk > .9) { c.fillStyle = C.card; K.rr(c, cx, y + 432, chipW - 6, 36, 9); c.fill(); c.fillStyle = K.rgba(acc, .14); c.fill(); c.strokeStyle = K.rgba(acc, .5); c.lineWidth = 1.5; c.stroke(); K.setText(c, F(18, 600), acc, 1, 'center', 'middle'); c.fillText(L, cx + (chipW - 6) / 2, y + 451); } });
        }
        K.reveal(c, `${side.rev} · ${side.revNote}`, px, y + 510, { font: F(24, 500), color: p.navy, k: K.P(t, j ? 5.2 : 6.0, j ? 5.9 : 6.7), mode: 'fade', stagger: .3, by: 'word' });
        c.restore();
      });
      // central "vs" disc
      const kv = K.E(t, 1.2, 1.7, 'outBack'); if (kv > 0) { c.save(); c.translate(W / 2, y0 + 250); c.scale(kv, kv); c.fillStyle = p.navy; c.beginPath(); c.arc(0, 0, 36, 0, K.TAU); c.fill();
        K.setText(c, F(24, 600), '#fff', 1, 'center', 'middle'); c.fillText('vs', 0, 1); c.restore(); }
      // callout under the right card
      const kc = K.E(t, 7.0, 7.7, 'out5'); if (kc > 0) { c.save(); c.globalAlpha *= kc;
        const f = F(28, 600), w = K.width(c, p.callout, f) + 64, cx = xR + cw / 2; c.fillStyle = K.rgba(p.teal, .12); K.rr(c, cx - w / 2, y0 + ch + 30 - (1 - kc) * 10, w, 54, 27); c.fill();
        K.setText(c, f, p.teal, 0, 'center'); c.fillText(p.callout, cx, y0 + ch + 67 - (1 - kc) * 10); c.restore(); }
      c.restore();
      K.grain(c, t, .025);
    } });
})();
