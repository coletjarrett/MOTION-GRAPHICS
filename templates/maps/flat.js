// BIBLE MAPS — flat map. A clean, modern flat map of the land of Israel: Mediterranean coast, Sea of Galilee,
// Jordan River and Dead Sea (approximate, hand-authored lon/lat). Markers pop in for each place, then a travel line
// draws from the first place to the last along the Jordan valley road. Opaque, Avenir Next, no textures.
(() => {
  const LON0 = 35.2, LAT0 = 32.3, S = 400, COS = Math.cos(32.3 * Math.PI / 180);
  const PX = (lon, lat) => [(lon - LON0) * S * COS, (LAT0 - lat) * S];
  const COAST = [[35.3, 33.9], [35.2, 33.27], [35.1, 33.09], [35.08, 32.92], [35.05, 32.84], [34.97, 32.83], [34.95, 32.72], [34.91, 32.6], [34.89, 32.5],
    [34.85, 32.33], [34.79, 32.15], [34.75, 32.05], [34.64, 31.8], [34.54, 31.67], [34.45, 31.52], [34.3, 31.35], [34.2, 31.3], [33.9, 31.15], [33.4, 31.1]];
  const CLOSE = [[33.4, 30], [37.5, 30], [37.5, 34.2], [35.3, 34.2]];
  const GALILEE_SEA = [[35.52, 32.85], [35.56, 32.89], [35.61, 32.9], [35.64, 32.86], [35.65, 32.8], [35.62, 32.74], [35.59, 32.71], [35.56, 32.72], [35.53, 32.78]];
  const DEAD_SEA = [[35.47, 31.76], [35.56, 31.77], [35.59, 31.6], [35.57, 31.42], [35.53, 31.35], [35.47, 31.29], [35.45, 31.2], [35.44, 31.05], [35.4, 30.98],
    [35.38, 31.1], [35.39, 31.3], [35.41, 31.5], [35.44, 31.68]];
  const JORDAN = [[35.57, 32.71], [35.56, 32.6], [35.58, 32.5], [35.56, 32.4], [35.55, 32.25], [35.56, 32.12], [35.53, 31.98], [35.55, 31.87], [35.53, 31.77]];
  const UPPER_JORDAN = [[35.63, 33.25], [35.62, 33.1], [35.61, 32.98], [35.6, 32.9]];
  const HILLS = [   // flat relief bands (central highlands, Galilee, Carmel, Transjordan plateau)
    [[35.0, 31.35], [35.3, 31.3], [35.35, 31.6], [35.38, 31.95], [35.42, 32.3], [35.35, 32.5], [35.15, 32.45], [35.05, 32.15], [35.0, 31.75]],
    [[35.2, 32.72], [35.42, 32.75], [35.5, 32.95], [35.56, 33.3], [35.55, 34.1], [35.25, 34.1], [35.22, 33.2]],
    [[34.97, 32.82], [35.06, 32.72], [35.19, 32.57], [35.13, 32.55], [34.99, 32.7]],
    [[35.72, 30.5], [38.5, 30.5], [38.5, 34.2], [35.8, 34.2], [35.75, 33.1], [35.72, 32.6], [35.68, 32.1], [35.65, 31.6]],
  ];

  K.template({
    id: 'maps-flat', title: 'Flat map', style: 'Bible Maps', type: 'Map', dur: 10, alpha: false,
    fonts: ['600 54px "Avenir Next"', '500 28px "Avenir Next"', '600 26px "Avenir Next"', 'italic 500 24px "Avenir Next"', '600 18px "Avenir Next"'],
    params: {
      title: 'From Nazareth to Jerusalem', sub: 'Luke 2:41, 42',
      sea: '#cfe2ea', land: '#f4efe4', hill: '#e9e1cf', hill2: '#e2d8c2', water: '#8fc0d3', waterInk: '#4f8aa2', ink: '#2c3a47', muted: '#8a8f93', accent: '#e0673c',
      places: [
        { name: 'Nazareth', lon: 35.30, lat: 32.70, side: 'left' },
        { name: 'Capernaum', lon: 35.575, lat: 32.88, side: 'left' },
        { name: "Jerusalem", lon: 35.23, lat: 31.78, side: "left" },
        { name: 'Bethlehem', lon: 35.20, lat: 31.70, side: 'left' },
      ],
      from: 0, to: 2,
      path: [[35.30, 32.70], [35.42, 32.6], [35.5, 32.42], [35.52, 32.18], [35.5, 31.98], [35.45, 31.87], [35.33, 31.81], [35.23, 31.78]],
      regions: [{ text: 'GALILEE', lon: 35.32, lat: 33.0 }, { text: 'SAMARIA', lon: 35.16, lat: 32.24 }, { text: 'JUDEA', lon: 34.98, lat: 31.52 }],
    },
    setup(c, p) {
      const P = q => PX(...q);
      const land = new Path2D(); K.catmull(COAST, 6).map(P).concat(CLOSE.map(P)).forEach(([x, y], i) => i ? land.lineTo(x, y) : land.moveTo(x, y)); land.closePath();
      const poly = (pts, n = 8) => { const Q = K.catmull(pts.concat([pts[0], pts[1]]), n).slice(0, -n).map(P); const q = new Path2D(); Q.forEach(([x, y], i) => i ? q.lineTo(x, y) : q.moveTo(x, y)); q.closePath(); return q; };
      p._g = { land, hills: HILLS.map(h => poly(h, 10)), gal: poly(GALILEE_SEA), dead: poly(DEAD_SEA), jordan: K.catmull(JORDAN, 8).map(P), upper: K.catmull(UPPER_JORDAN, 8).map(P),
        path: K.catmull(p.path, 12).map(P), places: p.places.map(q => ({ ...q, w: P([q.lon, q.lat]) })) };
    },
    draw(c, t, p) {
      const W = K.W, H = K.H, g = p._g, out = K.E(t, 9.1, 9.85, 'io');
      c.fillStyle = p.sea; c.fillRect(0, 0, W, H);
      const z = 1 + .035 * K.E(t, 0, 10, 'sine'), mapIn = K.E(t, 0, 1.1, 'out5');
      c.save(); c.translate(1190, 560); c.scale(z, z); c.translate(0, (1 - mapIn) * 30);
      c.save(); c.globalAlpha = .07 * mapIn; c.strokeStyle = p.ink; c.lineWidth = 1 / z; for (let lo = 33; lo <= 37; lo += .5) { const [x] = PX(lo, 32); c.beginPath(); c.moveTo(x, -900); c.lineTo(x, 900); c.stroke(); } for (let la = 30; la <= 35; la += .5) { const [, y] = PX(35, la); c.beginPath(); c.moveTo(-1500, y); c.lineTo(1500, y); c.stroke(); } c.restore();
      // land with a soft flat shadow on the sea
      c.save(); c.globalAlpha = mapIn; c.translate(0, 6); c.fillStyle = 'rgba(40,80,100,.10)'; c.fill(g.land); c.restore();
      c.globalAlpha = mapIn; c.fillStyle = p.land; c.fill(g.land);
      c.save(); c.clip(g.land); g.hills.forEach((h, i) => { c.fillStyle = i === 3 ? p.hill2 : p.hill; c.fill(h); }); c.restore();
      // water
      const wk = K.E(t, .4, 1.4, 'out');
      c.globalAlpha = wk; c.fillStyle = p.water; c.fill(g.gal); c.fill(g.dead);
      c.strokeStyle = p.water; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 4;
      K.draw(c, g.upper, K.E(t, .4, 1.0, 'io')); K.draw(c, g.jordan, K.E(t, .7, 1.9, 'io'));
      c.globalAlpha = 1; c.restore();
      const SX = ([x, y]) => [1190 + x * z, 560 + y * z + (1 - mapIn) * 30];
      // labels
      const txt = (s, x, y, f, col, a, track = 0, align = 'center', rot = 0) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); K.setText(c, f, col, track, align); c.fillText(s, 0, 0); c.restore(); };
      p.regions.forEach((r, i) => { const [x, y] = SX(PX(r.lon, r.lat)); txt(r.text, x, y, K.font(18, 'Avenir Next', 600), p.muted, K.E(t, 1.0 + i * .15, 1.8 + i * .15) * .9, 6); });
      const fW = K.font(22, 'Avenir Next', 500, 'italic'), wa = K.E(t, 1.2, 2.0);
      { const [x, y] = SX(PX(35.66, 32.83)); txt('Sea of Galilee', x + 22, y + 8, fW, p.waterInk, wa, .5, 'left'); }
      { const [x, y] = SX(PX(35.62, 32.3)); txt('Jordan River', x, y, fW, p.waterInk, wa, .5, 'center', Math.PI / 2); }
      { const [x, y] = SX(PX(35.6, 31.45)); txt('Dead Sea', x + 16, y, fW, p.waterInk, wa, .5, 'left'); }
      { const [x, y] = SX(PX(34.5, 32.25)); txt('Mediterranean Sea', x, y, K.font(24, 'Avenir Next', 500, 'italic'), p.waterInk, wa, 1, 'center'); }
      // travel line
      const t0 = 3.9, t1 = 7.4, k = K.E(t, t0, t1, 'io');
      if (k > 0) {
        const pts = g.path.map(SX), L = K.len(pts);
        c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
        c.strokeStyle = K.rgba(p.accent, .18); c.lineWidth = 12; K.draw(c, pts, k);
        c.strokeStyle = p.accent; c.lineWidth = 4; c.setLineDash([2, 11]); c.lineWidth = 5; K.draw(c, pts, k); c.setLineDash([]);
        if (t < t1 + .6) { const [mx, my, a] = K.at(pts, L * k), mv = 1 - K.E(t, t1, t1 + .5);
          c.globalAlpha = mv; c.fillStyle = '#fff'; c.beginPath(); c.arc(mx, my, 11, 0, K.TAU); c.fill(); c.fillStyle = p.accent; c.beginPath(); c.arc(mx, my, 7, 0, K.TAU); c.fill(); }
        c.restore();
      }
      // markers
      p._g.places.forEach((pl, i) => {
        const ti = 1.8 + i * .45, km = K.E(t, ti, ti + .5, 'outBack'); if (km <= 0) return;
        const [x, y] = SX(pl.w), end = (i === p.to) ? K.P(t, t1, t1 + 1.2) : 0, hl = i === p.from || i === p.to;
        if (end > 0 && end < 1) { c.strokeStyle = K.rgba(p.accent, .6 * (1 - end)); c.lineWidth = 3; c.beginPath(); c.arc(x, y, 12 + 30 * K.ease.out(end), 0, K.TAU); c.stroke(); }
        c.save(); c.translate(x, y); c.scale(km, km);
        c.fillStyle = 'rgba(30,50,70,.18)'; c.beginPath(); c.arc(0, 3, 12, 0, K.TAU); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 12, 0, K.TAU); c.fill();
        c.fillStyle = hl && t > (i === p.from ? t0 : t1) ? p.accent : p.ink; c.beginPath(); c.arc(0, 0, 6.5, 0, K.TAU); c.fill();
        c.restore();
        const la = K.E(t, ti + .15, ti + .7, 'out'), f = K.font(26, 'Avenir Next', 600), right = pl.side === 'right';
        const lx = x + (right ? 22 : -22) + (1 - la) * (right ? -10 : 10);
        c.save(); c.globalAlpha = la; K.setText(c, f, p.ink, .3, right ? 'left' : 'right'); c.lineJoin = 'round'; c.strokeStyle = K.rgba(p.land, .9); c.lineWidth = 6; c.strokeText(pl.name, lx, y + 9); c.fillText(pl.name, lx, y + 9); c.restore();
      });
      // title block
      const x0 = 160, tk = K.E(t, 1.0, 1.9, 'out5');
      c.fillStyle = p.accent; c.fillRect(x0, 424, 56 * tk, 5);
      K.reveal(c, p.title, x0, 500, { font: K.font(54, 'Avenir Next', 600), color: p.ink, k: K.P(t, 1.1, 2.1), mode: 'rise', dist: 24, stagger: .35, by: 'word' });
      K.reveal(c, p.sub, x0, 548, { font: K.font(28, 'Avenir Next', 500), color: p.muted, track: .5, k: K.P(t, 1.5, 2.4), mode: 'rise', dist: 16, stagger: .3 });
      if (out > 0) { c.globalAlpha = out; c.fillStyle = p.sea; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    },
  });
})();
