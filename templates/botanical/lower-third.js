// BOTANICAL — lower third. A slender engraved stem draws itself out beneath the name, two leaves unfurl from it
// and a tendril curls at its tip; the role settles below. Cream line-work with a soft shadow and scrim, so it
// holds up over light or dark footage.
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

K.template({ id: 'botanical-lower-third', title: 'Lower third', style: 'Botanical', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['400 66px GB', 'italic 400 36px GB'],
  params: { name: 'Samuel Park', role: 'Elder, Seoul, Korea', x: 170, y: 846, ink: '#f6efdf', roleInk: '#eadfc1', leaf: '#a7bb86', leaf2: '#d2cd92', scrim: .42 },
  draw(c, t, p) {
    const B = window.__BOT, { x, y } = p, s = 1;
    const fN = K.font(66, 'GB', 400), fR = K.font(36, 'GB', 400, 'italic');
    const wN = K.width(c, p.name, fN, .5), wR = K.width(c, p.role, fR, .5), tw = Math.max(wN, wR), len = tw + 150;
    const out = 1 - K.E(t, 5.7, 6.5, 'in'); if (out <= 0) return;
    // soft legibility scrim hugging the block, fading off to the right
    const sc = K.E(t, .1, 1.1) * out;
    if (sc > 0) { const x1 = x + len + 220, g = c.createLinearGradient(0, y - 140, 0, y + 110); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, `rgba(0,0,0,${p.scrim * sc})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.save(); c.fillStyle = g; c.fillRect(0, y - 140, x1, 250); const h = c.createLinearGradient(x1 - 380, 0, x1, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = h; c.fillRect(x1 - 380, y - 140, 380, 250); c.restore(); }
    c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 1.5;
    // the stem: a long, gently waving line under the name ending in a lifted tip
    const sy = y + 20, st = { ink: p.ink, leaf: p.leaf, leaf2: p.leaf2, petal: p.leaf2, heart: p.leaf2, tint: 1, line: 1.5, hair: .65, hatch: 4 };
    const S = B.stem([[x - 6, sy + 4], [x + len * .3, sy - 6], [x + len * .6, sy + 10], [x + len * .86, sy + 2], [x + len * .93, sy - 2], [x + len * .98, sy - 14], [x + len, sy - 30]]);
    const g = K.E(t, .15, 1.35, 'out');
    c.globalAlpha = out; B.drawStem(c, S, g, 2.2, .9, p.ink);
    // two leaves past the end of the text, and a tendril at the tip
    const d1 = Math.min(S.L * .78, tw + 40), [ax, ay, aa] = B.at(S, d1), t1 = B.reach(S, d1, .15, 1.35, 'out');
    B.leaf(c, ax, ay, aa - .85, { len: 64, wid: 20, bend: .12, side: -1, veins: 5 }, K.P(t, t1, t1 + .9), st);
    const [bx, by, ba] = B.at(S, S.L * .9), t2 = B.reach(S, S.L * .9, .15, 1.35, 'out');
    B.leaf(c, bx, by, ba + .75, { len: 52, wid: 17, bend: .12, side: 1, veins: 4 }, K.P(t, t2, t2 + .9), st);
    const [ex, ey, ea] = B.at(S, S.L);
    B.tendril(c, ex, ey, ea, 50, 1.4, -1, K.P(t, 1.2, 2.1), st);
    // type
    K.reveal(c, p.name, x, y - 14, { font: fN, color: p.ink, track: .5, k: K.P(t, .35, 1.3), mode: 'rise', dist: 14, stagger: .35, alpha: out });
    K.reveal(c, p.role, x + 2, y + 70, { font: fR, color: p.roleInk, track: .5, k: K.P(t, .8, 1.7), mode: 'rise', dist: -10, stagger: .35, alpha: out });
    c.restore();
  } });
