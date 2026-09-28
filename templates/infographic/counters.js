// INFOGRAPHIC — stat counters. Three tiles rise in; each line icon draws itself on inside a soft disc while the
// number counts up (the clock's hands turn as it counts), then an accent underline settles beneath. Labelled SAMPLE DATA.
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

  K.template({ id: 'infographic-counters', title: 'Stat counters', style: 'Infographic', type: 'Chart', dur: 9, alpha: false,
    fonts: [...FONTS, '600 104px "Avenir Next"'],
    params: { kicker: 'Regional building work · sample year', title: 'The year at a glance', tag: 'SAMPLE DATA',
      items: [{ icon: 'house', value: 32, label: 'Kingdom Halls', note: 'built or renovated' }, { icon: 'people', value: 1450, label: 'volunteers', note: 'from 40 congregations' },
        { icon: 'clock', value: 96000, label: 'hours', note: 'of volunteer time' }],
      accents: ['#2e8b8b', '#e07a5f', '#1f3350'], bg: '#f7f3ec', navy: '#1f3350', teal: '#2e8b8b' },
    draw(c, t, p) {
      const W = K.W, n = p.items.length, tw = 470, th = 500, gapX = 60, x0 = W / 2 - (n * tw + (n - 1) * gapX) / 2, ty = 340;
      c.drawImage(bg(p.bg), 0, 0);
      const out = K.E(t, 8.0, 8.8, 'io');
      c.save(); c.globalAlpha = 1 - out;
      header(c, t, p); pill(c, p.tag, W - 150, 160, K.E(t, .6, 1.2));
      p.items.forEach((it, i) => {
        const ts = .55 + i * .22, k = K.E(t, ts, ts + .8, 'out5'); if (k <= 0) return;
        const x = x0 + i * (tw + gapX), y = ty + (1 - k) * 50 + out * 20 * (i + 1), cx = x + tw / 2, acc = p.accents[i % p.accents.length];
        c.save(); c.globalAlpha *= K.clamp(k * 1.4);
        card(c, x, y, tw, th, 28);
        // icon disc
        const kd = K.E(t, ts + .3, ts + .9, 'outBack');
        c.fillStyle = K.rgba(acc, .12); c.beginPath(); c.arc(cx, y + 130, 74 * kd, 0, K.TAU); c.fill();
        const cnt = K.E(t, 1.3 + i * .3, 3.6 + i * .3, 'out');
        icon(c, it.icon, cx, y + 130, 92, acc, K.P(t, ts + .5, ts + 1.6), 5, it.icon === 'clock' ? cnt * K.TAU * 3 : undefined);
        // number counts up
        c.save(); c.globalAlpha *= K.E(t, 1.1 + i * .3, 1.6 + i * .3); K.setText(c, F(104, 600), p.navy, 0, 'center'); c.fillText(fmt(it.value * cnt), cx, y + 330 + 12 * (1 - K.E(t, 1.1 + i * .3, 1.7 + i * .3, 'out'))); c.restore();
        const ul = 60 * K.E(t, 3.4 + i * .3, 4.1 + i * .3, 'out5'); c.fillStyle = acc; c.fillRect(cx - ul / 2, y + 356, ul, 4);
        K.reveal(c, it.label, cx, y + 412, { font: F(34, 600), color: p.navy, align: 'center', k: K.P(t, ts + .6, ts + 1.4), mode: 'rise', dist: 14, stagger: .3 });
        K.reveal(c, it.note, cx, y + 452, { font: F(24, 400), color: C.muted, align: 'center', k: K.P(t, ts + .8, ts + 1.6), mode: 'fade', stagger: .4 });
        c.restore();
      });
      c.restore();
      K.grain(c, t, .025);
    } });
})();
