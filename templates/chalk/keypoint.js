// CHALKBOARD — key point card. A double-lined chalk box is drawn, 'Remember:' is written in yellow with three
// little raindrops, the statement is chalked in and underlined with a swoosh, the reference follows; then the
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
  // a hand-drawn chalk box: four slightly overshooting sides drawn in sequence
  const box = (l, id, x, y, w, h, k, o) => { const S = [[[x - 10, y + 2], [x + w + 12, y - 3]], [[x + w + 2, y - 12], [x + w - 3, y + h + 10]], [[x + w + 10, y + h - 2], [x - 12, y + h + 3]], [[x - 2, y + h + 12], [x + 3, y - 10]]];
    S.forEach((seg, i) => CK.stroke(l, id + i + w, K.wobble(K.catmull([seg[0], [K.mix(seg[0][0], seg[1][0], .5) + (i % 2 ? 4 : 0), K.mix(seg[0][1], seg[1][1], .5) + (i % 2 ? 0 : 4 - i * 2)], seg[1]], 12), 2.2, 30 + i, 26), K.clamp(k * 4 - i), o)); };

  // wrap, then even out the line lengths so a short last word is never left alone
  const balance = (c, s, f, maxW) => { const n = K.wrap(c, s, f, maxW).length; if (n < 2) return [s]; let best = null;
    for (let w = maxW; w > maxW * .45; w -= 10) { const L = K.wrap(c, s, f, w); if (L.length > n) break; best = L; } return best; };

  K.template({ id: 'chalk-keypoint', title: 'Key point', style: 'Chalkboard', type: 'Card', dur: 8, alpha: false,
    fonts: ['700 76px "Bradley Hand"', '700 104px "Bradley Hand"', '300 52px "Noteworthy"'],
    params: { kicker: 'Remember:', text: 'Jehovah provides the rain in its season.', ref: 'Acts 14:17', slate: '#34423d', chalk: '#eeece2', yellow: '#efd78c', blue: '#a9ccd8' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(CK.slate(p.slate, 7), 0, 0);
      const l = CK.begin();
      const fK = K.font(76, 'Bradley Hand', 700), fT = K.font(104, 'Bradley Hand', 700), fR = K.font(52, 'Noteworthy', 300);
      const lines = balance(l, p.text, fT, 1180), lh = 132, bw = K.clamp(Math.max(...lines.map(q => K.width(l, q, fT))) + 330, 1000, 1500), bx = (W - bw) / 2, bh = 318 + lines.length * lh, by = (H - bh) / 2;
      // the box, doubled on one pass for a sketched feel
      box(l, 'box', bx, by, bw, bh, K.E(t, .3, 1.5, 'io'), { w: 6.5 });
      box(l, 'box2', bx + 12, by + 10, bw - 22, bh - 20, K.E(t, .6, 1.8, 'io'), { w: 3, a: .45, jit: 1.8 });
      // kicker with three little raindrops beside it
      const kx = bx + 90, ky = by + 118, wK = CK.text(l, p.kicker, kx, ky, { font: fK, col: p.yellow, k: K.P(t, 1.3, 2.1), bold: 1.2 });
      [[0, 0], [40, -18], [80, 2]].forEach(([dx, dy], i) => { const x = kx + wK + 46 + dx, y = ky - 38 + dy, r = 14;
        const drop = [[x, y - 30], [x - r * .75, y - 6], ...K.circle(x, y + 4, r, Math.PI * 1.1, -Math.PI * .1, 24), [x + r * .75, y - 6], [x, y - 30]];
        CK.stroke(l, 'drop' + i, drop, K.E(t, 2.0 + i * .15, 2.45 + i * .15, 'io'), { col: p.blue, w: 5, jit: .5 }); });
      // the statement, written line by line
      const tx = bx + 130, ty = ky + 138, kS = K.P(t, 2.2, 4.3);
      lines.forEach((ln, i) => CK.text(l, ln, tx, ty + i * lh, { font: fT, col: p.chalk, k: K.clamp(kS * lines.length - i), bold: 1.6 }));
      // swoosh under the last line
      const last = lines[lines.length - 1], wl = K.width(l, last, fT), sy = ty + (lines.length - 1) * lh + 40;
      CK.stroke(l, 'sw' + wl, K.catmull([[tx - 16, sy + 12], [tx + wl * .3, sy + 2], [tx + wl * .7, sy - 2], [tx + wl + 10, sy - 14], [tx + wl + 40, sy - 36]], 22), K.E(t, 4.3, 4.95, 'io'), { col: p.yellow, w: 9 });
      // reference, bottom right of the box
      CK.text(l, '— ' + p.ref, bx + bw - 90, by + bh - 52, { font: fR, col: p.blue, align: 'right', k: K.P(t, 4.9, 5.6), bold: .8 });
      CK.end(c, t, { erase: K.E(t, 6.55, 7.5, 'io'), halo: .2 });
      K.grain(c, t, .03);
    } });
})();
