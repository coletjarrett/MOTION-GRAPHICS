// BOTANICAL — program bumper. Like a hand-coloured engraved plate: fine sepia vines draw on along bezier stems,
// leaves unfurl from their bases with engraved veins and hatching, a few flowers open, and the title is printed
// into the middle of the plate. Everything fades back to clean paper at the end.
(() => {
  // ---------- botanical helpers (self-contained; each pack file carries its own copy) ----------
  const TAU = Math.PI * 2;
  // a stem from bezier control points → dense polyline with cumulative lengths
  const stem = (ctrl, n = 40) => { let pts = []; for (let i = 0; i + 3 < ctrl.length; i += 3) { const seg = K.bez(ctrl[i], ctrl[i + 1], ctrl[i + 2], ctrl[i + 3], n); pts = pts.concat(i ? seg.slice(1) : seg); }
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, L: cum[cum.length - 1] }; };
  // point + tangent angle at distance d along a stem
  const at = (s, d) => { d = K.clamp(d, 0, s.L); let i = 1; while (i < s.cum.length - 1 && s.cum[i] < d) i++; const a = s.pts[i - 1], b = s.pts[i], k = (d - s.cum[i - 1]) / Math.max(1e-6, s.cum[i] - s.cum[i - 1]);
    return [K.mix(a[0], b[0], k), K.mix(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  // draw a stem on to fraction g, tapering from w0 at the base to w1 at the tip (engraved line)
  const drawStem = (c, s, g, w0, w1, col) => { if (g <= 0) return; const D = s.L * K.clamp(g); c.strokeStyle = col; c.lineCap = 'round';
    for (let i = 1; i < s.pts.length && s.cum[i - 1] < D; i++) { const b = s.cum[i] > D ? at(s, D) : s.pts[i]; c.lineWidth = K.mix(w0, w1, s.cum[i] / s.L) * (.75 + .25 * Math.min(1, (D - s.cum[i - 1]) / 30));
      c.beginPath(); c.moveTo(s.pts[i - 1][0], s.pts[i - 1][1]); c.lineTo(b[0], b[1]); c.stroke(); } };
  // leaf outline in local coords (x along the midrib, base at 0). o: {len, wid, bend, tipK}
  const leafPts = (len, wid, bend, open) => { const n = 26, up = [], dn = [];
    for (let i = 0; i <= n; i++) { const u = i / n, x = u * len, mid = bend * len * u * u, hw = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, .85)), .9) * (1 - .15 * u) * open;
      up.push([x, mid - hw]); dn.push([x, mid + hw]); } return { up, dn, mid: u => [u * len, bend * len * u * u] }; };
  // an engraved leaf: tinted body, outline, midrib, veins and hatching on the shaded half. k 0..1 unfurl.
  const leaf = (c, x, y, ang, o, k, st) => {
    if (k <= 0) return; const e = K.ease.out(K.clamp(k)), open = K.ease.out(K.clamp(k / .55)), sc = .05 + .95 * e;
    const len = o.len * sc, wid = o.wid, side = o.side || 1, a = ang + side * (1 - e) * .7;
    const L = leafPts(len, wid * sc, o.bend * side, open), outline = L.up.concat(L.dn.slice().reverse());
    c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha *= K.clamp(k * 6);
    const path = () => { c.beginPath(); outline.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); };
    // hand-colouring: a soft wash, warmer toward the tip
    path(); const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, K.rgba(st.leaf, .55 * st.tint)); g.addColorStop(1, K.rgba(st.leaf2, .5 * st.tint)); c.fillStyle = g; c.fill();
    // hatching on the shaded half (clipped), like an engraving
    if (open > .3) { c.save(); c.beginPath(); L.dn.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); for (let i = L.dn.length - 1; i >= 0; i--) { const m = L.mid(i / (L.dn.length - 1)); c.lineTo(m[0], m[1]); } c.closePath(); c.clip();
      c.strokeStyle = K.rgba(st.ink, .5 * K.clamp((open - .3) / .5)); c.lineWidth = st.hair; c.beginPath(); for (let hx = -wid * 2; hx < len + wid; hx += st.hatch) { c.moveTo(hx, 0); c.lineTo(hx + wid * 1.4, wid * 1.6 * side); } c.stroke(); c.restore(); }
    // outline, midrib, veins
    c.strokeStyle = st.ink; c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = st.line; path(); c.stroke();
    c.lineWidth = st.line * .8; c.beginPath(); for (let i = 0; i <= 20; i++) { const m = L.mid(i / 20 * .96); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); } c.stroke();
    if (open > .2) { c.lineWidth = st.hair * 1.2; c.globalAlpha *= K.clamp((open - .2) / .5); const nv = o.veins || 5;
      for (let v = 1; v <= nv; v++) { const u = v / (nv + 1) * .9, m = L.mid(u), i2 = Math.round(Math.min(1, u + .12) * 26);
        for (const E of [L.up, L.dn]) { const ep = E[i2]; c.beginPath(); c.moveTo(m[0], m[1]); c.quadraticCurveTo(m[0] + (ep[0] - m[0]) * .3, m[1] + (ep[1] - m[1]) * .75, K.mix(m[0], ep[0], .92), K.mix(m[1], ep[1], .88)); c.stroke(); } } }
    c.restore();
  };
  // a flower seen from the front: n petals open outward and scale up, stippled centre. k 0..1
  const flower = (c, x, y, r, rot, k, st, seed = 1) => {
    if (k <= 0) return; const e = K.ease.out(K.clamp(k)), n = st.petals || 5, R = K.rand(seed);
    c.save(); c.translate(x, y); c.rotate(rot + (1 - e) * .6);
    for (let i = 0; i < n; i++) { const a = i / n * TAU + (R() - .5) * .15, pe = K.ease.out(K.clamp(k * 1.3 - i * .06)), pl = r * (.3 + .7 * pe) * (.92 + R() * .16), pw = r * .42 * pe;
      c.save(); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(pw, -pl * .25, pw * 1.1, -pl * .85, 0, -pl); c.bezierCurveTo(-pw * 1.1, -pl * .85, -pw, -pl * .25, 0, 0); c.closePath();
      c.fillStyle = K.rgba(st.petal, .6 * st.tint); c.fill(); c.strokeStyle = st.ink; c.lineWidth = st.line * .9; c.stroke();
      c.strokeStyle = K.rgba(st.ink, .45); c.lineWidth = st.hair; c.beginPath(); for (let j = -2; j <= 2; j++) { c.moveTo(0, -pl * .12); c.quadraticCurveTo(j * pw * .2, -pl * .4, j * pw * .32, -pl * .62); } c.stroke(); c.restore(); }
    const cr = r * .2 * e; c.fillStyle = K.rgba(st.heart, .9); c.beginPath(); c.arc(0, 0, cr, 0, TAU); c.fill(); c.strokeStyle = st.ink; c.lineWidth = st.hair * 1.4; c.stroke();
    c.fillStyle = st.ink; for (let i = 0; i < 12; i++) { const a = R() * TAU, d = Math.sqrt(R()) * cr * .8; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, .9, 0, TAU); c.fill(); }
    c.restore();
  };
  // a closed bud on a short pedicel (for variety)
  const bud = (c, x, y, ang, r, k, st) => { if (k <= 0) return; const e = K.ease.out(K.clamp(k)); c.save(); c.translate(x, y); c.rotate(ang); c.scale(e, e);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(r * .55, -r * .1, r * .45, -r * .9, 0, -r * 1.2); c.bezierCurveTo(-r * .45, -r * .9, -r * .55, -r * .1, 0, 0);
    c.fillStyle = K.rgba(st.petal, .55 * st.tint); c.fill(); c.strokeStyle = st.ink; c.lineWidth = st.line * .9; c.stroke();
    c.beginPath(); c.moveTo(0, -r * .1); c.quadraticCurveTo(r * .1, -r * .6, 0, -r * 1.15); c.lineWidth = st.hair; c.stroke(); c.restore(); };
  // a tendril curl drawn on (logarithmic-ish spiral)
  const tendril = (c, x, y, ang, r, turns, dir, k, st) => { if (k <= 0) return; const pts = [[x, y]]; let px = x, py = y;
    for (let i = 1; i <= 80; i++) { const u = i / 80, stalk = u < .3, a = ang + dir * (stalk ? u * .8 : .24 + Math.pow((u - .3) / .7, 1.3) * turns * TAU), step = stalk ? r * .03 : r * .042 * (1 - (u - .3) / .7 * .8);
      px += Math.cos(a) * step; py += Math.sin(a) * step; pts.push([px, py]); }
    c.strokeStyle = st.ink; c.lineWidth = st.hair * 1.4; c.lineCap = 'round'; K.draw(c, pts, K.ease.out(K.clamp(k))); };
  // first time a stem's growth g(t) (eased over [t0,t1]) reaches distance d
  const reach = (s, d, t0, t1, ease = 'io') => { let lo = t0, hi = t1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (K.E(m, t0, t1, ease) * s.L < d) lo = m; else hi = m; } return hi; };
  window.__BOT = { stem, at, drawStem, leaf, flower, bud, tendril, reach };
})();

K.template({ id: 'botanical-bumper', title: 'Program bumper', style: 'Botanical', type: 'Bumper / open', dur: 8, alpha: false,
  fonts: ['400 96px GB', 'italic 400 46px GB', '400 22px Cochin'],
  params: { title: 'Lessons From Creation', sub: 'The Design of a Leaf', kicker: 'Part 3',
    paper: '#f2e9d6', ink: '#4b3a28', leaf: '#7f9366', leaf2: '#a8a869', petal: '#d9a894', heart: '#c9a04f', titleInk: '#3c3024', subInk: '#5e6b47' },
  setup(c, p) {
    const W = c.canvas.width, H = c.canvas.height, B = window.__BOT, s = W / 1920;
    this.paper = K.paper(W, H, 21, p.paper, { blot: .45 });
    const S = (pts) => B.stem(pts.map(([x, y]) => [x * s, y * s]));
    // two vines framing the title diagonally: one climbs from the lower left, one trails from the upper right
    const vines = [
      { s: S([[-30, 1040], [120, 960], [230, 860], [250, 700], [268, 560], [205, 430], [300, 320], [390, 215], [560, 200], [700, 230]]), t0: .1, t1: 2.9, w0: 3.4, w1: .9, ease: 'out' },
      { s: S([[1950, 40], [1800, 110], [1700, 200], [1672, 360], [1648, 520], [1730, 640], [1640, 770], [1560, 880], [1380, 890], [1230, 850]]), t0: .35, t1: 3.2, w0: 3.4, w1: .9, ease: 'out' },
    ];
    // side shoots branch from a point on a main vine, starting when its tip passes that point
    [[0, .30, [[70, -10], [130, 50], [160, 135]], 1.0], [0, .70, [[-55, -50], [-70, -120], [-35, -170]], 1.1], [1, .36, [[-70, -40], [-110, -110], [-108, -185]], 1.1], [1, .68, [[70, 40], [110, 110], [100, 170]], 1.0]]
      .forEach(([vi, f, rel, dur]) => { const par = vines[vi], [x, y] = B.at(par.s, par.s.L * f), ta = B.reach(par.s, par.s.L * f, par.t0, par.t1, par.ease) + .05;
        vines.push({ s: B.stem([[x, y], ...rel.map(([dx, dy]) => [x + dx * s, y + dy * s])]), t0: ta, t1: ta + dur, w0: 1.7, w1: .8, ease: 'out' }); });
    this.vines = vines; const R = K.rand(5);
    // leaves alternate along each stem, timed to the moment the growing tip passes them
    this.leaves = []; this.flowers = []; this.buds = []; this.tendrils = [];
    vines.forEach((v, vi) => {
      const main = vi < 2, step = main ? 92 * s : 70 * s; let side = vi % 2 ? -1 : 1;
      for (let d = main ? 70 * s : 40 * s; d < v.s.L - (main ? 60 : 30) * s; d += step * (.85 + R() * .3)) {
        const [x, y, a] = B.at(v.s, d), ta = B.reach(v.s, d, v.t0, v.t1, v.ease);
        const len = (main ? 70 + R() * 34 : 50 + R() * 22) * s * (1 - .35 * d / v.s.L);
        this.leaves.push({ x, y, ang: a + side * (.75 + R() * .35), len, wid: len * (.3 + R() * .06), bend: .08 + R() * .08, side, t: ta, veins: 5 });
        side = -side; }
    });
    // flowers at the vine tips and shoot tips; buds on the shorter shoots
    const tip = (vi) => { const v = vines[vi], [x, y, a] = B.at(v.s, v.s.L); return { x, y, a, t: v.t1 - .25 }; };
    [[0, 44, 7], [1, 44, 9], [2, 30, 3], [4, 32, 4]].forEach(([vi, r, sd]) => { const q = tip(vi); this.flowers.push({ x: q.x, y: q.y, r: r * s, rot: q.a, t: q.t, seed: sd }); });
    [3, 5].forEach(vi => { const q = tip(vi); this.buds.push({ x: q.x, y: q.y, a: q.a + Math.PI / 2, r: 18 * s, t: q.t }); });
    [[0, .42, -1], [1, .55, 1], [0, .78, 1]].forEach(([vi, f, dir]) => { const v = vines[vi], [x, y, a] = B.at(v.s, v.s.L * f); this.tendrils.push({ x, y, a: a + dir * 1.2, r: 60 * s, dir, t: B.reach(v.s, v.s.L * f, v.t0, v.t1, v.ease) + .1 }); });
    this.st = { ink: p.ink, leaf: p.leaf, leaf2: p.leaf2, petal: p.petal, heart: p.heart, tint: 1, line: 1.35 * s, hair: .6 * s, hatch: 4.2 * s, petals: 5 };
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, B = window.__BOT, st = this.st, cx = W / 2, cy = H / 2;
    c.drawImage(this.paper, 0, 0);
    const out = K.E(t, 6.7, 7.7, 'io'); c.globalAlpha = 1 - out;
    // a fine double-rule plate border draws itself first
    const bk = K.E(t, 0, 1.6, 'io'), m = 64;
    if (bk > 0) { c.strokeStyle = K.rgba(p.ink, .55); const rect = (i) => { const q = m + i * 8; return [[q, q], [W - q, q], [W - q, H - q], [q, H - q], [q, q]]; };
      c.lineWidth = 1.4; K.draw(c, rect(0), bk); c.lineWidth = .6; K.draw(c, rect(1), bk); }
    // clip the illustration inside the inner rule so vines "enter" the plate from under the border
    c.save(); c.beginPath(); c.rect(m + 8, m + 8, W - 2 * (m + 8), H - 2 * (m + 8)); c.clip();
    this.vines.forEach(v => B.drawStem(c, v.s, K.E(t, v.t0, v.t1, v.ease), v.w0, v.w1, p.ink));
    this.tendrils.forEach(q => B.tendril(c, q.x, q.y, q.a, q.r, 1.6, q.dir, K.P(t, q.t, q.t + .9), st));
    this.leaves.forEach(l => B.leaf(c, l.x, l.y, l.ang, l, K.P(t, l.t, l.t + .9), st));
    this.buds.forEach(b => B.bud(c, b.x, b.y, b.a, b.r, K.P(t, b.t, b.t + .8), st));
    this.flowers.forEach(f => B.flower(c, f.x, f.y, f.r, f.rot, K.P(t, f.t, f.t + 1.2), st, f.seed));
    c.restore();
    // title block, printed into the plate
    const fk = K.font(22, 'Cochin', 400), fT = K.font(96, 'GB', 400), fS = K.font(46, 'GB', 400, 'italic');
    K.reveal(c, p.kicker.toUpperCase(), cx, cy - 104, { font: fk, color: K.rgba(p.subInk, 1), track: 9, align: 'center', k: K.P(t, 1.8, 2.8), mode: 'fade', stagger: .5, alpha: 1 - out });
    K.reveal(c, p.title, cx, cy + 12, { font: fT, color: p.titleInk, track: 1, align: 'center', k: K.P(t, 2.0, 3.3), mode: 'blur', stagger: .5, alpha: 1 - out });
    // small leaf-and-rule ornament
    const ok = K.E(t, 2.8, 3.8, 'io');
    if (ok > 0) { c.strokeStyle = K.rgba(p.ink, .8); c.lineWidth = 1; c.globalAlpha = 1 - out;
      c.beginPath(); c.moveTo(cx - 24 - 110 * ok, cy + 56); c.lineTo(cx - 24, cy + 56); c.moveTo(cx + 24, cy + 56); c.lineTo(cx + 24 + 110 * ok, cy + 56); c.stroke();
      const lst = { ...st, line: 1, hair: .5, hatch: 3.4 };
      B.leaf(c, cx - 2, cy + 56, Math.PI, { len: 20, wid: 6.5, bend: .1, side: 1 }, K.P(t, 3.0, 3.8), lst); B.leaf(c, cx + 2, cy + 56, 0, { len: 20, wid: 6.5, bend: .1, side: -1 }, K.P(t, 3.0, 3.8), lst); }
    K.reveal(c, p.sub, cx, cy + 118, { font: fS, color: p.subInk, track: .5, align: 'center', k: K.P(t, 3.0, 4.2), mode: 'fade', stagger: .45, alpha: 1 - out });
    c.globalAlpha = 1; K.vignette(c, .14, '80,60,30'); K.grain(c, t, .03);
  } });
