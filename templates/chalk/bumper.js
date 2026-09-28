// CHALKBOARD — program bumper for family worship. A worn green-grey slate with old erased haze; a little sun and
// clouds are doodled in, the title is written on in chalk and underlined, the subtitle follows in yellow chalk.
// A cloth eraser then wipes the board back to a clean slate.
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

  K.template({ id: 'chalk-bumper', title: 'Program bumper', style: 'Chalkboard', type: 'Bumper / open', dur: 8, alpha: false,
    fonts: ['700 136px "Bradley Hand"', '300 62px "Noteworthy"'],
    params: { title: 'Family Worship Night', sub: 'Tonight: The Water Cycle', slate: '#34423d', chalk: '#eeece2', yellow: '#efd78c', blue: '#a9ccd8' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2;
      c.drawImage(CK.slate(p.slate, 3), 0, 0);
      const l = CK.begin();
      // ---- doodle: a cloud with the sun peeping out behind it, a small cloud, drops, two birds ----
      const cloud = (id, x, y, s, a, dir) => { const top = CK.cloudTop(x, y, s, [[-100, 8, 44], [-48, -18, 58], [22, -30, 64], [88, 4, 46]]);
        const pts = dir < 0 ? top.slice().reverse() : top, base = K.catmull([pts[pts.length - 1], [K.mix(pts[pts.length - 1][0], pts[0][0], .5), y + 42 * s], pts[0]], 12);
        CK.stroke(l, id, pts, K.E(t, a, a + .9, 'io'), { w: 7 }); CK.stroke(l, id + 'b', base, K.E(t, a + .8, a + 1.15, 'out'), { w: 7 }); return [...pts, ...base]; };
      const ax = cx - 70, ay = 372, cA = cloud('c1', ax, ay, 1.2, .3, 1);
      const sx = cx + 62, sy = 282;
      l.save(); l.beginPath(); l.rect(0, 0, W, H); cA.forEach(([x, y], i) => i ? l.lineTo(x, y) : l.moveTo(x, y)); l.closePath(); l.clip('evenodd');
      CK.stroke(l, 'sun', circ(sx, sy, 64, -2.6, K.TAU + .3), K.E(t, .9, 1.9, 'io'), { col: p.yellow, w: 7.5 });
      for (let i = 0; i < 12; i++) { const a = -2.6 + i / 12 * K.TAU, r0 = 88, r1 = i % 2 ? 114 : 130;
        CK.stroke(l, 'ray' + i, [[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], K.E(t, 1.65 + i * .05, 1.9 + i * .05, 'out'), { col: p.yellow, w: 6.5, jit: .8 }); }
      l.restore();
      cloud('c2', cx + 330, 318, .62, 1.35, -1);
      [[-40, 0], [10, 8], [60, 0], [110, 8]].forEach(([dx, dy], i) => { const x = ax + dx, y = ay + 68 + dy; CK.stroke(l, 'drop' + i, [[x, y], [x - 10, y + 38]], K.E(t, 2.3 + i * .1, 2.55 + i * .1, 'out'), { col: p.blue, w: 5.5, jit: .6 }); });
      [[cx - 360, 262, 1], [cx - 296, 222, .72]].forEach(([x, y, s], i) => CK.stroke(l, 'bird' + i, K.catmull([[x - 28 * s, y - 4 * s], [x - 13 * s, y - 16 * s], [x, y], [x + 13 * s, y - 16 * s], [x + 28 * s, y - 4 * s]], 8), K.E(t, 2.0 + i * .15, 2.4 + i * .15, 'io'), { w: 5, jit: .5 }));
      // ---- title, underline swoosh, subtitle ----
      const fT = K.font(136, 'Bradley Hand', 700), fS = K.font(62, 'Noteworthy', 300), ty = 650;
      const wT = CK.text(l, p.title, cx, ty, { font: fT, col: p.chalk, align: 'center', k: K.P(t, 1.4, 3.4), bold: 1.5 });
      const u0 = cx - wT / 2 + 10, u1 = cx + wT / 2 - 10;
      CK.stroke(l, 'swoosh' + wT, K.catmull([[u0, ty + 44], [K.mix(u0, u1, .35), ty + 36], [K.mix(u0, u1, .75), ty + 32], [u1, ty + 22], [u1 + 26, ty + 6]], 20), K.E(t, 3.35, 3.95, 'io'), { col: p.yellow, w: 7.5 });
      CK.text(l, p.sub, cx, ty + 132, { font: fS, col: p.yellow, align: 'center', k: K.P(t, 3.8, 5.1), bold: 1 });
      CK.end(c, t, { erase: K.E(t, 6.45, 7.45, 'io'), halo: .2 });
      K.grain(c, t, .03);
    } });
})();
