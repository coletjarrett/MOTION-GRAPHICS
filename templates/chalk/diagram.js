// CHALKBOARD — explainer diagram "How Rain Forms". On a worn slate, each stage of the water cycle is drawn in
// chalk in turn — sea, sun, rising evaporation arrows, droplets gathering into a cloud, rain, the land and water
// running back to the sea — each with a circled step number and label. A reference sits in the corner, then the
// board is wiped clean.
(() => {
  // ---------- chalk kit (self-contained; slate, grain and layers are cached) ----------
  const CK = (() => {
    const W = 1920, H = 1080;
    const cloudTop = (cx, cy, s, bumps) => {
      const C = bumps.map(([dx, dy, r]) => [cx + dx * s, cy + dy * s, r * s]);
      const xa = Math.min(...C.map(q => q[0] - q[2])) + 1, xb = Math.max(...C.map(q => q[0] + q[2])) - 1, top = [];
      for (let i = 0; i <= 120; i++) { const x = K.mix(xa, xb, i / 120); let y = 1e9; for (const [X, Y, r] of C) { const d = x - X; if (Math.abs(d) < r) y = Math.min(y, Y - Math.sqrt(r * r - d * d)); } if (y < 1e9) top.push([x, Math.min(y, cy + 36 * s)]); }
      return top;
    };
    // the slate: mottled green-grey, eraser swipes of old chalk haze, faint ghost scribbles, dust
    const slate = (base, seed = 3) => K.cached(`chalkSlate|${base}|${seed}`, W, H, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const sw = 240, sh = 135, m = document.createElement('canvas'); m.width = sw; m.height = sh; const mc = m.getContext('2d'), d = mc.createImageData(sw, sh);
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) { const v = K.fbm(x / 20, y / 20, seed, 5) * 255, i = (y * sw + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      mc.putImageData(d, 0, 0);
      c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .38; c.filter = 'blur(4px)'; c.drawImage(m, -30, -30, w + 60, h + 60); c.restore();
      const R = K.rand(seed + 11); c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      // broad eraser swipes (arcs of smeared chalk dust)
      c.filter = 'blur(26px)';
      for (let i = 0; i < 22; i++) { const x = R() * w, y = R() * h, L = 260 + R() * 620, a = (R() - .5) * .5, bend = (R() - .5) * 220;
        c.strokeStyle = `rgba(222,230,224,${.025 + R() * .04})`; c.lineWidth = 70 + R() * 130; c.beginPath(); c.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2);
        c.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); c.stroke(); }
      // back-and-forth scrubs
      c.filter = 'blur(10px)';
      for (let i = 0; i < 9; i++) { const x = R() * w, y = R() * h, n = 6 + (R() * 6 | 0), sx = 26 + R() * 20, amp = 60 + R() * 80; c.strokeStyle = `rgba(222,230,224,${.018 + R() * .02})`; c.lineWidth = 34 + R() * 26; c.beginPath();
        for (let j = 0; j <= n; j++) { const X = x + j * sx, Y = y + (j % 2 ? amp : -amp) + (R() - .5) * 20; j ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); }
      // ghost scribbles: half-erased loops of old handwriting
      c.filter = 'blur(3.5px)';
      for (let i = 0; i < 7; i++) { const x = 120 + R() * (w - 600), y = 100 + R() * (h - 200), n = 40 + (R() * 70 | 0), sz = 14 + R() * 12, pts = [];
        for (let j = 0; j < n; j++) { const u = j / (2.6 + K.noise(j * .15, i, seed + 2) * 1.6); pts.push([x + j * sz * .42 + Math.cos(u * K.TAU) * sz * .4, y + Math.sin(u * K.TAU) * sz * .8 + (K.noise(j * .2, i, seed) - .5) * sz]); }
        c.strokeStyle = `rgba(230,236,230,${.025 + R() * .03})`; c.lineWidth = 3; K.line(c, pts); c.stroke(); }
      c.restore();
      c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .05; c.fillStyle = c.createPattern(K.noiseTex(512, 512, seed + 40), 'repeat'); c.fillRect(0, 0, w, h); c.restore();
      for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(230,236,228,${.03 + R() * .08})`; const s = .6 + R() * 1.5; c.fillRect(R() * w, R() * h, s, s); }
      const g = c.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    // chalk grain: an alpha mask knocked out of every stroke with destination-out
    const grain = () => K.cached('chalkGrain', 768, 768, (c, w, h) => {
      const d = c.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = K.hash(x, y, 7) * .42 + K.noise(x / 2.3, y / 2.3, 9) * .33 + K.noise(x / 9, y / 4.5, 13) * .25; d.data[(y * w + x) * 4 + 3] = K.clamp((v - .47) * 3.4) * 255; }
      c.putImageData(d, 0, 0);
    });
    const layer = () => K.cached('chalkLayer', W, H, () => {});
    const halo = () => K.cached('chalkHalo', 480, 270, () => {});
    const memo = new Map();
    const passes = (id, pts, jit, seed) => { const key = id + '|' + pts.length + '|' + pts[0] + '|' + pts[pts.length - 1] + '|' + jit; if (!memo.has(key)) memo.set(key, [0, 1, 2, 3].map(i => K.wobble(pts, jit * (i ? 1 : .5), seed + i * 19, 5))); return memo.get(key); };
    const PASS = [[1, .62], [.72, .42], [1.3, .22], [.5, .5]];
    return {
      slate, cloudTop,
      begin() { const l = layer().getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.globalAlpha = 1; l.globalCompositeOperation = 'source-over'; l.filter = 'none'; l.clearRect(0, 0, W, H); return l; },
      // a chalk line drawn on to k: several jittered low-alpha passes
      stroke(l, id, pts, k, o = {}) { if (k <= 0) return; const P = passes(id, pts, o.jit ?? 1.4, o.seed ?? id.length * 7);
        l.save(); l.strokeStyle = o.col || '#eeece2'; l.lineCap = 'round'; l.lineJoin = 'round';
        P.forEach((q, i) => { l.globalAlpha = PASS[i][1] * (o.a ?? 1); l.lineWidth = (o.w ?? 7) * PASS[i][0]; K.draw(l, q, k); }); l.restore(); },
      // chalk lettering written on left to right
      text(l, s, x, y, o) { const k = o.k ?? 1; if (k <= 0 || !s) return 0; const G = K.glyphs(l, s, o.font, o.track || 0), x0 = o.align === 'center' ? x - G.w / 2 : o.align === 'right' ? x - G.w : x;
        l.save(); if (k < 1) { l.beginPath(); l.rect(x0 - 30, y - 400, 30 + (G.w + 50) * K.ease.sine(k), 600); l.clip(); }
        l.font = o.font; l.textAlign = 'left'; l.textBaseline = 'alphabetic'; l.letterSpacing = (o.track || 0) + 'px'; l.fillStyle = o.col || '#eeece2'; l.strokeStyle = o.col || '#eeece2';
        [[0, 0, .85], [1, .7, .38], [-.9, -.5, .34], [.3, -1.1, .3]].forEach(([dx, dy, a]) => { l.globalAlpha = a * (o.a ?? 1); l.fillText(s, x0 + dx, y + dy); });
        if (o.bold) { l.globalAlpha = .35 * (o.a ?? 1); l.lineWidth = o.bold; l.lineJoin = 'round'; l.strokeText(s, x0, y); }
        l.restore(); return G.w; },
      // grain knock-out, eraser wipe, dust halo, composite onto the frame
      end(c, t, o = {}) { const L = layer(), l = L.getContext('2d'), S = halo(), s = S.getContext('2d');
        s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, 480, 270); s.filter = 'blur(2.5px)'; s.drawImage(L, 0, 0, 480, 270); s.filter = 'none';
        l.save(); l.globalCompositeOperation = 'destination-out'; l.fillStyle = l.createPattern(grain(), 'repeat'); l.fillRect(0, 0, W, H); l.restore();
        const e = o.erase || 0;
        if (e > 0) { // a cloth eraser sweeping left to right with a ragged, soft front
          const fx = K.mix(-260, W + 420, e); l.save(); l.globalCompositeOperation = 'destination-out'; l.filter = 'blur(26px)'; l.fillStyle = '#000'; l.beginPath(); l.moveTo(-100, -100);
          for (let y = -100; y <= H + 100; y += 20) l.lineTo(fx + 70 * Math.sin(y / 70) + 60 * (K.noise(y / 90, 0, 5) - .5) - (y - H / 2) * .18, y);
          l.lineTo(-100, H + 100); l.closePath(); l.fill(); l.restore(); }
        const ha = (o.halo ?? .2) * (e > 0 ? (1 + .8 * Math.sin(Math.PI * K.clamp(e * 1.2))) * (1 - K.P(e, .55, 1)) : 1);
        if (ha > 0) { c.save(); c.globalAlpha = ha; c.drawImage(S, 0, 0, W, H); c.restore(); }
        c.drawImage(L, 0, 0); },
    };
  })();

  const circ = (x, y, r, a0, sweep, n = 90) => K.circle(x, y, r, a0, a0 + sweep, n);
  // an arrow: the shaft draws on, then the two barbs flick out from the tip
  const arrow = (l, id, pts, k, o = {}) => { CK.stroke(l, id, pts, K.clamp(k / .82), o); const kh = K.P(k, .8, 1); if (kh <= 0) return;
    const n = pts.length, [x, y] = pts[n - 1], [px, py] = pts[Math.max(0, n - 6)], a = Math.atan2(y - py, x - px), s = o.head || 24;
    [-1, 1].forEach(sg => CK.stroke(l, id + 'h' + sg, [[x, y], [x - Math.cos(a + sg * .5) * s, y - Math.sin(a + sg * .5) * s]], K.ease.out(kh), { ...o, jit: .5 })); };
  // a step label with a small chalk-circled number
  const label = (l, n, s, x, y, k, o) => { if (k <= 0) return; const r = 27, nx = o.align === 'right' ? x + 8 + r : x - 8 - r;
    CK.stroke(l, 'num' + n, circ(nx, y - 15, r, -1.9, K.TAU + .35, 60), K.E(k, 0, .35, 'io'), { col: o.col2, w: 4.5, jit: .7 });
    CK.text(l, String(n), nx, y - 3, { font: o.fN, col: o.col2, align: 'center', k: K.P(k, .2, .4) });
    CK.text(l, s, o.align === 'right' ? nx - r - 18 : nx + r + 18, y, { font: o.font, col: o.col, align: o.align || 'left', k: K.P(k, .3, 1), bold: 1 }); };

  K.template({ id: 'chalk-diagram', title: 'Diagram · How rain forms', style: 'Chalkboard', type: 'Explainer diagram', dur: 14, alpha: false,
    fonts: ['700 96px "Bradley Hand"', '700 52px "Noteworthy"', '300 44px "Noteworthy"', '700 34px "Noteworthy"'],
    params: { title: 'How Rain Forms', steps: ['evaporation', 'condensation', 'precipitation', 'collection'], ref: 'Ecclesiastes 1:7',
      slate: '#34423d', chalk: '#eeece2', yellow: '#efd78c', blue: '#a9ccd8' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(CK.slate(p.slate, 5), 0, 0);
      const l = CK.begin();
      const fT = K.font(96, 'Bradley Hand', 700), fL = K.font(52, 'Noteworthy', 700), fN = K.font(34, 'Noteworthy', 700), fR = K.font(44, 'Noteworthy', 300);
      const L = { font: fL, fN, col: p.chalk, col2: p.yellow };
      // title
      const wT = CK.text(l, p.title, 190, 222, { font: fT, col: p.chalk, k: K.P(t, .3, 1.7), bold: 1.5 });
      CK.stroke(l, 'tul' + wT, K.catmull([[196, 262], [190 + wT * .5, 254], [190 + wT + 14, 248]], 16), K.E(t, 1.6, 2.1, 'io'), { col: p.yellow, w: 6.5 });
      // the sea: three wavy lines
      [[170, 990, 842, 0], [220, 950, 878, 1], [290, 900, 912, 2]].forEach(([x0, x1, y, i]) => { const pts = []; for (let x = x0; x <= x1; x += 8) pts.push([x, y + 9 * Math.sin((x - x0) / 36 + i * 1.7)]);
        CK.stroke(l, 'sea' + i, pts, K.E(t, 1.2 + i * .25, 2.2 + i * .25, 'io'), { col: p.blue, w: 7, jit: 1 }); });
      // the sun
      const sx = 420, sy = 440;
      CK.stroke(l, 'sun', circ(sx, sy, 64, -2.4, K.TAU + .3), K.E(t, 1.9, 2.8, 'io'), { col: p.yellow, w: 7.5 });
      for (let i = 0; i < 12; i++) { const a = -2.4 + i / 12 * K.TAU, r0 = 88, r1 = i % 2 ? 114 : 132;
        CK.stroke(l, 'ray' + i, [[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], K.E(t, 2.6 + i * .04, 2.85 + i * .04, 'out'), { col: p.yellow, w: 6.5, jit: .7 }); }
      // 1 evaporation: wavy arrows rising from the sea toward the cloud
      for (let i = 0; i < 3; i++) { const x0 = 650 + i * 110, y0 = 812, x1 = 940 + i * 66, y1 = 560 - i * 16, pts = [];
        for (let j = 0; j <= 60; j++) { const u = j / 60, x = K.mix(x0, x1, u * u), y = K.mix(y0, y1, u); pts.push([x + Math.sin(u * 3.2 * K.TAU) * 12 * (1 - u * .5), y]); }
        arrow(l, 'ev' + i, pts, K.E(t, 3.1 + i * .3, 4.1 + i * .3, 'io'), { col: p.chalk, w: 6, jit: .8, head: 24 }); }
      label(l, 1, p.steps[0], 610, 700, K.P(t, 4.2, 5.2), { ...L, align: 'right' });
      // 2 condensation: droplets gather, the cloud forms around them
      const cx = 1210, cy = 430;
      [[1100, 392, 9], [1160, 360, 7], [1215, 400, 8], [1280, 356, 9], [1340, 398, 7], [1170, 430, 6], [1300, 432, 7]].forEach(([x, y, r], i) =>
        CK.stroke(l, 'dr' + i, circ(x, y, r, 0, K.TAU + .4, 24), K.E(t, 4.9 + i * .08, 5.2 + i * .08, 'out'), { w: 4.5, jit: .4, a: .9 }));
      const top = CK.cloudTop(cx, cy, 1.75, [[-100, 8, 44], [-48, -18, 58], [22, -30, 64], [88, 4, 46]]);
      const base = K.catmull([top[top.length - 1], [cx + 40, cy + 72], [cx - 70, cy + 68], top[0]], 16);
      CK.stroke(l, 'cloud', top, K.E(t, 5.3, 6.4, 'io'), { w: 8 }); CK.stroke(l, 'cloudb', base, K.E(t, 6.3, 6.7, 'out'), { w: 8 });
      label(l, 2, p.steps[1], 1090, 212, K.P(t, 6.3, 7.3), L);
      // 3 precipitation: rain falls in slanted dashes
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = 1075 + i * 52 + (r % 2) * 26, y = 540 + r * 62 + (i % 2) * 14, a = K.E(t, 7.0 + r * .35 + i * .06, 7.3 + r * .35 + i * .06, 'out');
        CK.stroke(l, `rain${r}_${i}`, [[x, y], [x - 12, y + 40]], a, { col: p.blue, w: 6, jit: .5 }); }
      label(l, 3, p.steps[2], 1440, 580, K.P(t, 8.1, 9.1), L);
      // the land with a small tree, and 4 collection: water runs back down to the sea
      const hill = K.catmull([[1010, 812], [1180, 780], [1380, 752], [1560, 706], [1680, 716], [1770, 752]], 16);
      CK.stroke(l, 'hill', hill, K.E(t, 8.7, 9.6, 'io'), { w: 7.5 });
      CK.stroke(l, 'trunk', [[1690, 714], [1692, 664]], K.E(t, 9.3, 9.5, 'out'), { w: 6, jit: .4 });
      CK.stroke(l, 'crown', circ(1692, 636, 30, 1.6, K.TAU + .3, 50).map(([x, y]) => [x, y + (y - 636) * .15]), K.E(t, 9.4, 9.9, 'io'), { w: 6, jit: .8 });
      arrow(l, 'col', K.catmull([[1330, 792], [1200, 808], [1090, 832], [1000, 852]], 16), K.E(t, 9.4, 10.3, 'io'), { col: p.blue, w: 7, head: 28 });
      label(l, 4, p.steps[3], 1100, 918, K.P(t, 10.1, 11.1), L);
      // scripture reference in the corner
      CK.text(l, p.ref, 1750, 918, { font: fR, col: p.yellow, align: 'right', k: K.P(t, 10.9, 11.8), bold: .8 });
      CK.end(c, t, { erase: K.E(t, 12.4, 13.5, 'io'), halo: .2 });
      K.grain(c, t, .03);
    } });
})();
