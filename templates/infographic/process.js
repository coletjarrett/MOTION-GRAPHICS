// INFOGRAPHIC — process. Four circular steps sit on a sand connector; a teal line fills from step to step, and as
// it arrives each disc fills, its line icon draws on in white and the label rises in. Pass any 3 to 5 {icon, label, note}.
// Icons: request, design, approve, build, house, people, clock, refresh.
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

  K.template({ id: 'infographic-process', title: 'Process steps', style: 'Infographic', type: 'Diagram', dur: 12, alpha: false,
    fonts: [...FONTS, '600 36px "Avenir Next"'],
    params: { kicker: 'How a graphics request moves', title: 'From request to finished clip', tag: 'SAMPLE',
      steps: [{ icon: 'request', label: 'Request', note: 'A team describes the need' }, { icon: 'design', label: 'Design', note: 'A template is drafted' },
        { icon: 'approve', label: 'Approve', note: 'Reviewers sign off' }, { icon: 'build', label: 'Build', note: 'Clips render for every language' }],
      bg: '#f7f3ec', navy: '#1f3350', teal: '#2e8b8b', coral: '#e07a5f' },
    draw(c, t, p) {
      const W = K.W, n = p.steps.length, xa = 330, xb = W - 330, cy = 590, R = 92, step = 1.9, t0 = 2.1;
      const X = i => K.mix(xa, xb, i / (n - 1)), TI = i => t0 + i * step;
      c.drawImage(bg(p.bg), 0, 0);
      const out = K.E(t, 10.9, 11.7, 'io');
      c.save(); c.globalAlpha = 1 - out;
      header(c, t, p); pill(c, p.tag, W - 150, 160, K.E(t, .6, 1.2));
      // connector: sand track draws first, teal fill advances from step to step
      const tr = K.E(t, .7, 1.9, 'io5');
      c.fillStyle = '#e9dcc3'; c.fillRect(xa, cy - 3, (xb - xa) * tr, 6);
      let head = xa; for (let i = 1; i < n; i++) head = K.mix(head, X(i), K.E(t, TI(i) - 1.2, TI(i), 'io'));
      const fillOn = K.E(t, TI(0) - .2, TI(0) + .2);
      c.fillStyle = p.teal; c.globalAlpha = (1 - out) * fillOn; c.fillRect(xa, cy - 3, head - xa, 6);
      // travelling dot at the head of the fill while it moves
      const moving = p.steps.some((_, i) => i > 0 && t > TI(i) - 1.2 && t < TI(i));
      if (moving) { c.beginPath(); c.arc(head, cy, 9, 0, K.TAU); c.fill(); c.fillStyle = K.rgba(p.teal, .18); c.beginPath(); c.arc(head, cy, 18, 0, K.TAU); c.fill(); }
      c.globalAlpha = 1 - out;
      p.steps.forEach((s, i) => {
        const x = X(i), ti = TI(i), kIn = K.E(t, .8 + i * .15, 1.5 + i * .15, 'outBack'); if (kIn <= 0) return;
        const act = K.E(t, ti, ti + .45, 'out'), pop = 1 + .07 * Math.sin(Math.PI * K.P(t, ti, ti + .45));
        c.save(); c.translate(x, cy); c.scale(kIn * pop, kIn * pop);
        // disc: outlined until the fill reaches it, then fills teal
        c.shadowColor = `rgba(31,51,80,${.10 + .10 * act})`; c.shadowBlur = 30; c.shadowOffsetY = 10;
        c.fillStyle = C.card; c.beginPath(); c.arc(0, 0, R, 0, K.TAU); c.fill(); c.shadowColor = 'transparent';
        if (act > 0) { c.fillStyle = p.teal; c.beginPath(); c.arc(0, 0, R * act, 0, K.TAU); c.fill(); }
        c.strokeStyle = act > .5 ? p.teal : '#d9c9a8'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, R - 2, 0, K.TAU); c.stroke();
        // ring pulse on arrival (single, soft)
        const pr = K.P(t, ti, ti + 1.1); if (pr > 0 && pr < 1) { c.strokeStyle = K.rgba(p.teal, .35 * (1 - pr)); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R + 6 + 26 * K.ease.out(pr), 0, K.TAU); c.stroke(); }
        c.restore();
        // icon: faint preview in sand, then drawn on in white as the step activates
        c.save(); c.globalAlpha *= kIn * (1 - act); icon(c, s.icon, x, cy, 92, '#c9b48d', 1, 4.5); c.restore();
        icon(c, s.icon, x, cy, 92, '#ffffff', K.P(t, ti + .1, ti + 1.0), 5);
        // number above, label + note below
        K.reveal(c, String(i + 1).padStart(2, '0'), x, cy - R - 40, { font: F(22, 600), color: act > .5 ? p.teal : C.muted, track: 4, align: 'center', k: K.P(t, .9 + i * .15, 1.6 + i * .15), mode: 'fade' });
        const kl = K.P(t, ti + .15, ti + .85);
        K.reveal(c, s.label, x, cy + R + 70, { font: F(38, 600), color: p.navy, align: 'center', k: kl, mode: 'rise', dist: 18, stagger: .3 });
        K.reveal(c, s.note, x, cy + R + 116, { font: F(26, 400), color: C.muted, align: 'center', k: K.P(t, ti + .35, ti + 1.1), mode: 'fade', stagger: .3, by: 'word' });
      });
      c.restore();
      K.grain(c, t, .025);
    } });
})();
