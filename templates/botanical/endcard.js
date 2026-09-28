// BOTANICAL — end card. Two engraved leafy branches grow from the foot of the plate and sweep up either side into
// an open oval wreath; berries set, the sign-off is printed in the centre, and the plate fades back to paper.
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

K.template({ id: 'botanical-endcard', title: 'End card', style: 'Botanical', type: 'End card', dur: 6, alpha: false,
  fonts: ['italic 500 96px GB', '400 22px Cochin'],
  params: { text: 'See you next week', kicker: 'Thank you for watching', paper: '#f2e9d6', ink: '#4b3a28', leaf: '#7f9366', leaf2: '#a8a869', berry: '#b8715a', titleInk: '#3c3024', subInk: '#5e6b47' },
  setup(c, p) {
    const W = c.canvas.width, H = c.canvas.height, B = window.__BOT, s = W / 1920, cx = W / 2, cy = H / 2 + 6 * s, rx = 520 * s, ry = 350 * s;
    this.paper = K.paper(W, H, 31, p.paper, { blot: .45 });
    // a branch following the oval from the foot (crossing slightly) up to near the top, with a little wobble
    const branch = (dir) => { const pts = []; for (let i = 0; i <= 160; i++) { const u = i / 160, th = Math.PI / 2 - dir * (-.1 + u * 2.55), wob = 1 + .025 * Math.sin(u * 9 + dir) - .04 * u;
        pts.push([cx + Math.cos(th) * rx * wob, cy + Math.sin(th) * ry * wob]); }
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, L: cum[cum.length - 1] }; };
    this.br = [{ s: branch(1), t0: .15, t1: 2.5, ease: 'out' }, { s: branch(-1), t0: .25, t1: 2.6, ease: 'out' }];
    this.leaves = []; this.berries = []; const R = K.rand(12);
    this.br.forEach((b, bi) => { const dir = bi ? -1 : 1; let n = 0;
      for (let d = 36 * s; d < b.s.L - 24 * s; d += (30 + R() * 8) * s, n++) {
        const [x, y, a] = B.at(b.s, d), f = d / b.s.L, len = (78 - 40 * f + R() * 12) * s, ta = B.reach(b.s, d, b.t0, b.t1, b.ease);
        // laurel-like: leaves in near-pairs, one to the outside and one to the inside of the oval, both leaning forward
        const outSide = n % 2 ? 1 : -1;
        this.leaves.push({ x, y, ang: a + outSide * dir * (.55 + R() * .2), len, wid: len * (.27 + R() * .05), bend: .1 + R() * .06, side: outSide * dir, t: ta, veins: 5 });
        if (n % 5 === 3 && f < .9) { const oa = a - dir * Math.PI / 2; this.berries.push({ x: x + Math.cos(oa) * 30 * s, y: y + Math.sin(oa) * 30 * s, sx: x, sy: y, r: (7 + R() * 3) * s, t: ta + .5 });
          this.berries.push({ x: x + Math.cos(oa + .5 * dir) * 34 * s, y: y + Math.sin(oa + .5 * dir) * 34 * s, sx: x, sy: y, r: (6 + R() * 2) * s, t: ta + .6 }); } }
      const [ex, ey, ea] = B.at(b.s, b.s.L); this.leaves.push({ x: ex, y: ey, ang: ea, len: 40 * s, wid: 11 * s, bend: .08, side: dir, t: b.t1 - .2, veins: 4 }); });
    this.st = { ink: p.ink, leaf: p.leaf, leaf2: p.leaf2, petal: p.berry, heart: p.berry, tint: 1, line: 1.3 * s, hair: .6 * s, hatch: 4 * s };
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, B = window.__BOT, st = this.st, cx = W / 2, cy = H / 2;
    c.drawImage(this.paper, 0, 0);
    const out = K.E(t, 4.95, 5.75, 'io'); c.globalAlpha = 1 - out;
    const bk = K.E(t, 0, 1.4, 'io'), m = 64;
    if (bk > 0) { c.strokeStyle = K.rgba(p.ink, .55); const rect = (i) => { const q = m + i * 8; return [[q, q], [W - q, q], [W - q, H - q], [q, H - q], [q, q]]; };
      c.lineWidth = 1.4; K.draw(c, rect(0), bk); c.lineWidth = .6; K.draw(c, rect(1), bk); }
    this.br.forEach(b => B.drawStem(c, b.s, K.E(t, b.t0, b.t1, b.ease), 3.2, 1, p.ink));
    this.leaves.forEach(l => B.leaf(c, l.x, l.y, l.ang, l, K.P(t, l.t, l.t + .8), st));
    // berries on short stalks
    this.berries.forEach(q => { const k = K.E(t, q.t, q.t + .6, 'out'); if (k <= 0) return; c.strokeStyle = p.ink; c.lineWidth = .9; c.beginPath(); c.moveTo(q.sx, q.sy); c.lineTo(K.mix(q.sx, q.x, k), K.mix(q.sy, q.y, k)); c.stroke();
      const r = q.r * K.ease.outBack(K.clamp((k - .3) / .7), 1.2); if (r <= 0) return; c.fillStyle = K.rgba(p.berry, .75); c.beginPath(); c.arc(q.x, q.y, r, 0, K.TAU); c.fill(); c.lineWidth = 1.1; c.stroke();
      c.save(); c.beginPath(); c.arc(q.x, q.y, r, 0, K.TAU); c.clip(); c.lineWidth = .5; c.strokeStyle = K.rgba(p.ink, .55); c.beginPath(); for (let i = -3; i <= 3; i++) { c.moveTo(q.x + i * 3 - r, q.y + r); c.lineTo(q.x + i * 3 + r, q.y - r * .2); } c.stroke(); c.restore();
      c.fillStyle = 'rgba(255,250,235,.8)'; c.beginPath(); c.arc(q.x - r * .35, q.y - r * .35, r * .22, 0, K.TAU); c.fill(); });
    // sign-off
    const fT = K.font(96, 'GB', 500, 'italic'), fk = K.font(22, 'Cochin', 400);
    K.reveal(c, p.kicker.toUpperCase(), cx, cy - 78, { font: fk, color: p.subInk, track: 8, align: 'center', k: K.P(t, 1.5, 2.5), mode: 'fade', stagger: .5, alpha: 1 - out });
    K.reveal(c, p.text, cx, cy + 34, { font: fT, color: p.titleInk, track: .5, align: 'center', k: K.P(t, 1.2, 2.5), mode: 'blur', stagger: .45, alpha: 1 - out });
    const ok = K.E(t, 2.2, 3.1, 'io');
    if (ok > 0) { c.strokeStyle = K.rgba(p.ink, .8); c.lineWidth = 1; c.globalAlpha = 1 - out;
      c.beginPath(); c.moveTo(cx - 24 - 90 * ok, cy + 84); c.lineTo(cx - 24, cy + 84); c.moveTo(cx + 24, cy + 84); c.lineTo(cx + 24 + 90 * ok, cy + 84); c.stroke();
      const lst = { ...st, line: 1, hair: .5, hatch: 3.4 };
      B.leaf(c, cx - 2, cy + 84, Math.PI, { len: 20, wid: 6.5, bend: .1, side: 1 }, K.P(t, 2.4, 3.2), lst); B.leaf(c, cx + 2, cy + 84, 0, { len: 20, wid: 6.5, bend: .1, side: -1 }, K.P(t, 2.4, 3.2), lst); }
    c.globalAlpha = 1; K.vignette(c, .14, '80,60,30'); K.grain(c, t, .03);
  } });
