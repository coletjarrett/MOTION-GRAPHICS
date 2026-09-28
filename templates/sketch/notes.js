// SKETCHBOOK — sketch-note summary of the image in Daniel 2. On a dotted notebook page a standing figure is
// outlined in ink and divided into five bands; each band is coloured in with marker in turn, with an arrow to its
// handwritten label (metal · world power). A sticky note is slapped on with Daniel 2:44, the key word circled. The
// page then turns to a fresh sheet.
(() => {
  // ---------- sketchbook kit (self-contained; page, marker texture and layers are cached) ----------
  const SK = (() => {
    const W = 1920, H = 1080;
    // the notebook page: warm paper, a dotted grid, a faint shade toward the spine
    const page = (base, dot, seed = 2) => K.cached(`skPage|${base}|${dot}|${seed}`, W, H, (c, w, h) => {
      c.drawImage(K.paper(w, h, seed, base, { blot: .3, fibres: 900 }), 0, 0);
      const R = K.rand(seed + 5);
      for (let y = 30; y < h; y += 40) for (let x = 20; x < w; x += 40) { c.globalAlpha = .55 + R() * .3; c.fillStyle = dot; c.beginPath(); c.arc(x + (R() - .5) * .6, y + (R() - .5) * .6, 1.9, 0, K.TAU); c.fill(); }
      c.globalAlpha = 1;
      const g = c.createLinearGradient(0, 0, 90, 0); g.addColorStop(0, 'rgba(90,70,40,.10)'); g.addColorStop(1, 'rgba(90,70,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 90, h);
      const v = c.createRadialGradient(w / 2, h / 2, h * .4, w / 2, h / 2, h * 1.1); v.addColorStop(0, 'rgba(80,60,30,0)'); v.addColorStop(1, 'rgba(80,60,30,.12)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
    });
    // highlighter streaks: faint lengthwise variation knocked out of the marker layer
    const streak = () => K.cached('skStreak', 1024, 256, (c, w, h) => {
      const d = c.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = K.noise(x / 90, y / 2.2, 3) * .7 + K.hash(x, y, 4) * .3; d.data[(y * w + x) * 4 + 3] = K.clamp((v - .35) * .55) * 255; }
      c.putImageData(d, 0, 0);
    });
    const layer = () => K.cached('skMarker', W, H, () => {});
    const memo = new Map();
    const wob = (id, pts, amp, seed, step) => { const key = id + '|' + pts.length + '|' + pts[0] + '|' + pts[pts.length - 1] + '|' + amp; if (!memo.has(key)) memo.set(key, [K.wobble(pts, amp, seed, step), K.wobble(pts, amp * 1.6, seed + 31, step)]); return memo.get(key); };
    return {
      page,
      // ink pen: a confident line plus a lighter second pass that drifts slightly (the "sketchy" overdraw)
      pen(c, id, pts, k, o = {}) { if (k <= 0) return; const [a, b] = wob(id, pts, o.amp ?? 1.6, o.seed ?? id.length * 5 + 3, o.step ?? 9);
        c.save(); c.strokeStyle = o.col || '#2b3040'; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalCompositeOperation = 'multiply';
        c.globalAlpha = .92 * (o.a ?? 1); c.lineWidth = o.w ?? 4; K.draw(c, a, k);
        if (o.double !== false) { c.globalAlpha = .3 * (o.a ?? 1); c.lineWidth = (o.w ?? 4) * .6; K.draw(c, b, K.clamp(k * 1.04)); }
        c.restore(); },
      // handwritten ink text, written on left to right
      write(c, s, x, y, o) { const k = o.k ?? 1; if (k <= 0 || !s) return K.width(c, s, o.font, o.track || 0); const w = K.width(c, s, o.font, o.track || 0), x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
        c.save(); if (k < 1) { c.beginPath(); c.rect(x0 - 30, y - 400, 30 + (w + 50) * K.ease.sine(k), 600); c.clip(); }
        K.setText(c, o.font, o.col || '#2b3040', o.track || 0, 'left'); c.globalCompositeOperation = o.blend || 'multiply';
        c.globalAlpha = .95 * (o.a ?? 1); c.fillText(s, x0, y); c.globalAlpha = .18 * (o.a ?? 1); c.fillText(s, x0 + .8, y + .6);
        c.restore(); return w; },
      // marker strokes go onto one layer (no darker overlaps), then streak + multiply onto the page
      mBegin() { const l = layer().getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.globalAlpha = 1; l.globalCompositeOperation = 'source-over'; l.filter = 'none'; l.clearRect(0, 0, W, H); return l; },
      marker(l, id, pts, k, o = {}) { if (k <= 0) return; const [a] = wob(id, pts, o.amp ?? 1.2, o.seed ?? 9, 12);
        l.save(); l.strokeStyle = o.col; l.lineWidth = o.w ?? 40; l.lineCap = o.cap || 'round'; l.lineJoin = 'round'; K.draw(l, a, k); l.restore(); },
      mEnd(c, o = {}) { const L = layer(), l = L.getContext('2d');
        l.save(); l.globalCompositeOperation = 'destination-out'; l.globalAlpha = o.streak ?? 1; l.fillStyle = l.createPattern(streak(), 'repeat'); l.fillRect(0, 0, W, H); l.restore();
        c.save(); c.globalCompositeOperation = o.blend || 'multiply'; c.globalAlpha = o.a ?? .82; c.filter = `blur(${o.soft ?? 1.4}px)`; c.drawImage(L, 0, 0); c.restore(); },
      // page turn: a fresh sheet slides over from the right with a soft curl shadow on its edge
      turn(c, base, dot, k) { if (k <= 0) return; const x = W * (1 - k), pg = page(base, dot);
        c.save(); const g = c.createLinearGradient(x - 70, 0, x, 0); g.addColorStop(0, 'rgba(60,45,25,0)'); g.addColorStop(1, 'rgba(60,45,25,.28)'); c.fillStyle = g; c.fillRect(x - 70, 0, 70, H);
        c.drawImage(pg, x, 0, W - x, H, x, 0, W - x, H);
        const h = c.createLinearGradient(x, 0, x + 120, 0); h.addColorStop(0, 'rgba(255,255,255,.55)'); h.addColorStop(.25, 'rgba(255,255,255,.15)'); h.addColorStop(1, 'rgba(120,100,70,0)'); c.fillStyle = h; c.fillRect(x, 0, 120, H);
        c.restore(); },
    };
  })();

  // ---------- the image of Daniel 2: right half of a standing figure (arms folded), mirrored ----------
  const X = 470;
  const HALF = [...K.circle(0, 0, 1, -Math.PI / 2, Math.PI * .36, 20).map(([x, y]) => [x * 38, 282 + y * 48]),
    [16, 332], [18, 350], [60, 358], [104, 368], [124, 386], [132, 424], [136, 484], [136, 546], [133, 594], [127, 612], [115, 618], [105, 610],
    [102, 632], [99, 700], [92, 768], [86, 792], [80, 852], [76, 880], [94, 898], [100, 918], [94, 930], [12, 930], [10, 898], [10, 800], [8, 724], [0, 704]];
  const OUT = [...HALF.map(([x, y]) => [X + x, y]), ...HALF.slice(0, -1).reverse().map(([x, y]) => [X - x, y])];
  const BANDS = [[232, 352], [352, 612], [612, 772], [772, 886], [886, 936]];
  const EDGE = [44, 142, 104, 84, 104]; // outline half-width at each band's centre, for the arrows
  const zig = (y0, y1, x0, x1, g0) => { const pts = [], n = Math.max(1, Math.round((y1 - y0) / g0)), gap = (y1 - y0) / n; let dir = 1; for (let y = y0; y <= y1 + .1; y += gap) { pts.push(dir > 0 ? [x0, y] : [x1, y], dir > 0 ? [x1, y + gap * .3] : [x0, y + gap * .3]); dir = -dir; } return pts; };

  K.template({ id: 'sketch-notes', title: 'Sketch-note · Daniel 2', style: 'Sketchbook', type: 'Explainer diagram', dur: 14, alpha: false,
    fonts: ['700 84px "Bradley Hand"', '700 52px "Noteworthy"', '300 52px "Noteworthy"'],
    params: { title: 'The Image of Daniel 2',
      bands: [['Gold', 'Babylon', '#f3c84b'], ['Silver', 'Medo-Persia', '#c2ccd8'], ['Copper', 'Greece', '#eba27c'], ['Iron', 'Rome', '#a3adb9'], ['Iron & clay', 'Anglo-America', '#a3adb9|#d9a47f']],
      noteRef: 'Daniel 2:44', note: 'a Kingdom that lasts forever', circleWord: 'forever',
      paper: '#f6f1e6', dots: '#9aa3b5', ink: '#2b3040', sticky: '#f8e38c', accent: '#e9876a' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(SK.page(p.paper, p.dots, 4), 0, 0);
      const fT = K.font(84, 'Bradley Hand', 700), fB = K.font(52, 'Noteworthy', 700), fL = K.font(52, 'Noteworthy', 300);
      const LX = 780, LY = [308, 498, 708, 845, 926], st = i => 3.3 + i * 1.15;
      // ---- marker layer: band fills (clipped to the figure) and highlights behind each metal ----
      const m = SK.mBegin();
      m.save(); K.line(m, OUT); m.closePath(); m.clip();
      p.bands.forEach(([, , col], i) => { const [y0, y1] = BANDS[i], cols = col.split('|'), k = K.E(t, st(i), st(i) + .75, 'io');
        if (cols.length === 1) SK.marker(m, 'band' + i, zig(y0 + 8, y1 - 14, X - 175, X + 175, 24), k, { col: cols[0], w: 34, amp: 1.5 });
        else cols.forEach((cc, j) => SK.marker(m, 'band' + i + j, [[X - 175, K.mix(y0, y1, .3 + j * .45)], [X + 175, K.mix(y0, y1, .3 + j * .45)]], K.clamp(k * 2 - j), { col: cc, w: 26, cap: 'butt' })); });
      m.restore();
      p.bands.forEach(([metal, , col], i) => { const wM = K.width(c, metal, fB); SK.marker(m, 'hl' + i + wM, [[LX - 8, LY[i] - 14], [LX + wM + 10, LY[i] - 16]], K.E(t, st(i) + .95, st(i) + 1.35, 'io'), { col: K.lerpc(col.split('|')[0], '#ffffff', .2), w: 30, cap: 'butt' }); });
      SK.mEnd(c, { a: .78 });
      // ---- ink ----
      const wT = SK.write(c, p.title, 190, 170, { font: fT, col: p.ink, k: K.P(t, .3, 1.6) });
      SK.pen(c, 'tul' + wT, K.catmull([[186, 196], [190 + wT * .45, 190], [190 + wT + 16, 186]], 16), K.E(t, 1.5, 2.0, 'io'), { col: p.accent, w: 4 });
      SK.pen(c, 'fig', OUT, K.E(t, .9, 2.9, 'io'), { col: p.ink, w: 4.2, amp: 1.2, step: 8 });
      [-1, 1].forEach(sg => SK.pen(c, 'arm' + sg, [[X + sg * 100, 404], [X + sg * 103, 500], [X + sg * 104, 606]], K.E(t, 2.6, 3.0, 'io'), { col: p.ink, w: 3.6 }));
      [[352, 20], [612, 104], [772, 92], [886, 80]].forEach(([y, hw], i) => SK.pen(c, 'div' + i, [[X - hw, y], [X + hw, y]], K.E(t, 2.8 + i * .1, 3.1 + i * .1, 'out'), { col: p.ink, w: 2.6, amp: .8, a: .75, double: false }));
      p.bands.forEach(([metal, realm], i) => { const [y0, y1] = BANDS[i], cy = (y0 + y1) / 2, ay = LY[i] - 15, k = K.E(t, st(i) + .35, st(i) + .9, 'io');
        const a0 = [X + EDGE[i] + 18, cy], a1 = [LX - 26, ay], pts = K.bez(a0, [K.mix(a0[0], a1[0], .45), cy], [K.mix(a0[0], a1[0], .55), ay], a1, 40);
        SK.pen(c, 'ar' + i, pts, k, { col: p.ink, w: 3.2 });
        const ang = Math.atan2(a1[1] - pts[36][1], a1[0] - pts[36][0]), kh = K.P(k, .85, 1);
        [-1, 1].forEach(sg => SK.pen(c, `arh${i}${sg}`, [a1, [a1[0] - Math.cos(ang + sg * .5) * 18, a1[1] - Math.sin(ang + sg * .5) * 18]], kh, { col: p.ink, w: 3.2, double: false }));
        const kl = K.P(t, st(i) + .6, st(i) + 1.3), wM = K.width(c, metal, fB), wR = K.width(c, ' · ' + realm, fL), f = wM / (wM + wR);
        SK.write(c, metal, LX, LY[i], { font: fB, col: p.ink, k: K.clamp(kl / f) });
        SK.write(c, ' · ' + realm, LX + wM, LY[i], { font: fL, col: p.ink, k: K.clamp((kl - f) / (1 - f)) });
      });
      // ---- the sticky note ----
      const ks = K.P(t, 9.3, 9.75), sx = 1520, sy = 560, S = 400;
      if (ks > 0) {
        const note = K.cached('skSticky' + p.sticky, S + 4, S + 4, (n, w, h) => {
          n.fillStyle = p.sticky; n.fillRect(2, 2, S, S);
          n.globalCompositeOperation = 'multiply'; n.drawImage(K.paper(S, S, 9, '#ffffff', { blot: .5, fibres: 160 }), 2, 2);
          const g = n.createLinearGradient(0, 2, 0, 60); g.addColorStop(0, 'rgba(200,160,40,.16)'); g.addColorStop(1, 'rgba(200,160,40,0)'); n.fillStyle = g; n.fillRect(2, 2, S, 60);
          const g2 = n.createLinearGradient(S * .6, S * .6, S, S); g2.addColorStop(0, 'rgba(160,120,30,0)'); g2.addColorStop(1, 'rgba(160,120,30,.14)'); n.fillStyle = g2; n.fillRect(2, 2, S, S);
          n.globalCompositeOperation = 'source-over'; });
        const e = K.ease.out5(ks), sc = K.mix(1.12, 1, e), lift = (1 - e);
        c.save(); c.translate(sx, sy); c.rotate(-.045 + lift * .05); c.scale(sc, sc);
        c.globalAlpha = K.clamp(ks * 3);
        c.shadowColor = `rgba(70,50,20,${.22 + lift * .1})`; c.shadowBlur = 22 + lift * 30; c.shadowOffsetY = 10 + lift * 26; c.shadowOffsetX = 3;
        c.drawImage(note, -S / 2 - 2, -S / 2 - 2); c.shadowColor = 'transparent';
        const fR = K.font(52, 'Noteworthy', 700), fN = K.font(48, 'Noteworthy', 700), x0 = -S / 2 + 40;
        const wRf = SK.write(c, p.noteRef, x0, -S / 2 + 122, { font: fR, col: p.ink, k: K.P(t, 9.9, 10.5) });
        SK.pen(c, 'nul' + wRf, [[x0 - 4, -S / 2 + 140], [x0 + wRf + 8, -S / 2 + 136]], K.E(t, 10.4, 10.7, 'out'), { col: p.ink, w: 3.4 });
        const lines = K.wrap(c, p.note, fN, S - 80), kN = K.P(t, 10.6, 11.9);
        lines.forEach((ln, i) => SK.write(c, ln, x0, -S / 2 + 232 + i * 66, { font: fN, col: p.ink, k: K.clamp(kN * lines.length - i) }));
        const li = lines.findIndex(q => q.includes(p.circleWord));
        if (li >= 0) { const pre = lines[li].slice(0, lines[li].indexOf(p.circleWord)), wx = x0 + K.width(c, pre, fN), ww = K.width(c, p.circleWord, fN), ccx = wx + ww / 2 + 4, ccy = -S / 2 + 232 + li * 66 - 16;
          const ring = K.circle(0, 0, 1, -2.6, -2.6 + K.TAU + .5, 60).map(([x, y], j) => [ccx + x * (ww / 2 + 12) * (1 + j * .0015), ccy + y * 36]);
          SK.pen(c, 'ring' + ww, ring, K.E(t, 11.9, 12.4, 'io'), { col: p.accent, w: 4 }); }
        c.restore();
      }
      SK.turn(c, p.paper, p.dots, K.E(t, 12.95, 13.7, 'io'));
    } });
})();
