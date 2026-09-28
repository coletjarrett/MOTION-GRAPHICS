// INFOGRAPHIC — donut chart. A sand track ring draws on, segments sweep in one after another while the centre
// total counts up and the legend rows slide in; one segment is then lifted out and the rest dim to make the point.
// Data-driven: pass any list of {label, value} (values are normalised to percentages). Labelled SAMPLE DATA.
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

  K.template({ id: 'infographic-donut', title: 'Donut chart', style: 'Infographic', type: 'Chart', dur: 10, alpha: false,
    fonts: [...FONTS, '600 88px "Avenir Next"', '600 32px "Avenir Next"'],
    params: { kicker: 'Volunteer time · sample year', title: 'Where the hours went', total: 96000, unit: 'volunteer hours', tag: 'SAMPLE DATA',
      items: [{ label: 'Construction', value: 42 }, { label: 'Maintenance', value: 26 }, { label: 'Training', value: 18 }, { label: 'Administration', value: 14 }],
      note: "Construction was the largest share", colors: ['#1f3350', '#2e8b8b', '#e07a5f', '#c9a970'], bg: '#f7f3ec', navy: '#1f3350', teal: '#2e8b8b', highlight: 0 },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = 690, cy = 610, R = 250, TH = 64;
      c.drawImage(bg(p.bg), 0, 0);
      const out = K.E(t, 9.0, 9.8, 'io');
      c.save(); c.globalAlpha = 1 - out;
      header(c, t, p); pill(c, p.tag, W - 150, 160, K.E(t, .6, 1.2));
      const sum = p.items.reduce((a, b) => a + b.value, 0), gap = .022, n = p.items.length;
      // track ring
      const tr = K.E(t, .5, 1.5, 'io5');
      c.lineCap = 'butt'; c.strokeStyle = K.rgba('#e9dcc3', .9); c.lineWidth = TH;
      c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + K.TAU * tr); c.stroke();
      // segments sweep in one after another (overlapping), shrinking back at the exit
      const hk = K.bell(t, 5.2, 5.8, 7.6, 8.2), hi = p.highlight;
      let a0 = -Math.PI / 2;
      p.items.forEach((it, i) => {
        const span = it.value / sum * K.TAU, ts = 1.2 + i * .5, k = K.E(t, ts, ts + .9, 'io');
        const dim = i === hi ? 1 : 1 - .55 * hk, grow = i === hi ? 14 * K.ease.outBack(hk) : 0;
        if (k > 0) {
          c.strokeStyle = K.rgba(p.colors[i % p.colors.length], dim); c.lineWidth = TH + grow * .8;
          c.beginPath(); c.arc(cx, cy, R + grow * .4, a0 + gap / 2, a0 + gap / 2 + Math.max(0, span - gap) * k); c.stroke();
        }
        // percentage tag outside the ring at the segment's midpoint
        const am = a0 + span / 2, kt = K.E(t, ts + .6, ts + 1.1, 'out');
        if (kt > 0) { const rr = R + TH / 2 + 46 + (1 - kt) * -14 + grow * .6; K.setText(c, F(28, 600), K.rgba(p.navy, kt * (i === hi ? 1 : 1 - .5 * hk)), 0, 'center', 'middle');
          c.fillText(Math.round(it.value / sum * 100) + '%', cx + Math.cos(am) * rr, cy + Math.sin(am) * rr); }
        a0 += span;
      });
      // centre: counting total
      const kc = K.E(t, 1.3, 3.9, 'out'), kcA = K.E(t, 1.2, 1.7);
      c.globalAlpha = (1 - out) * kcA;
      K.setText(c, F(88, 600), p.navy, 0, 'center', 'alphabetic'); c.fillText(fmt(p.total * kc), cx, cy + 18);
      K.setText(c, F(24, 500), C.muted, 2, 'center'); c.fillText(p.unit.toUpperCase(), cx, cy + 64);
      c.globalAlpha = 1 - out;
      // legend
      const lx = 1170, ly = 430, rowH = 104;
      p.items.forEach((it, i) => {
        const ts = 1.2 + i * .5, k = K.E(t, ts + .1, ts + .8, 'out5'); if (k <= 0) return;
        const y = ly + i * rowH, dim = i === hi ? 1 : 1 - .5 * hk;
        c.save(); c.globalAlpha *= k * dim; c.translate((1 - k) * 40, 0);
        c.fillStyle = p.colors[i % p.colors.length]; K.rr(c, lx, y - 22, 28, 28, 7); c.fill();
        K.setText(c, F(32, 500), p.navy, 0, 'left'); c.fillText(it.label, lx + 52, y);
        K.setText(c, F(32, 600), p.navy, 0, 'right'); c.fillText(Math.round(it.value / sum * 100 * K.E(t, ts, ts + 1.2, 'out')) + '%', lx + 600, y);
        c.fillStyle = 'rgba(31,51,80,.12)'; c.fillRect(lx, y + 36, 600 * k, 1.5);
        c.restore();
      });
      // highlight caption
      if (hk > 0) { c.save(); c.globalAlpha *= hk; K.setText(c, F(24, 500), C.muted, 0, 'left');
        c.fillText(p.note, lx, ly + n * rowH + 10 + (1 - hk) * 10); c.restore(); }
      c.restore();
      K.grain(c, t, .025);
    } });
})();
