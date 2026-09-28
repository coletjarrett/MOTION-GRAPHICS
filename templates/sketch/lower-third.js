// SKETCHBOOK — lower third (alpha). A yellow highlighter swash is laid down, the name is handwritten over it in
// ink, and the role follows on a strip of paper-coloured marker; a small star is doodled beside the name. Drifts
// left and fades out, fully clear before the last frame.
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

  // a marker swash: rounded start, slightly arched body, tapering dry end; wipes on to k
  const swash = (l, x0, x1, yc, h, k, col, seed, lift = 8) => { if (k <= 0) return; const n = 80, top = [], bot = [];
    for (let i = 0; i <= n; i++) { const u = i / n, x = K.mix(x0, x1, u), tp = Math.sqrt(K.clamp(u / .03)) * (1 - .55 * Math.pow(K.P(u, .7, 1), 2)), arc = -Math.sin(u * Math.PI) * 5 - u * lift, dry = K.P(u, .75, 1) * .16;
      top.push([x, yc + arc - h / 2 * tp * (.95 + .08 * K.noise(u * 9, 0, seed) - dry * K.hash(i, 0, seed))]); bot.push([x, yc + arc + h / 2 * tp * (.95 + .08 * K.noise(u * 9, 3, seed) - dry * K.hash(i, 1, seed))]); }
    const end = [x1 + h * .12, yc - 5 * 0 - lift + h * .02];
    const fx = x0 - 30 + (x1 - x0 + 80) * K.ease.sine(k), ty = yc - K.mix(0, lift + 5, K.P(fx, x0, x1));
    l.save(); if (k < 1) { l.beginPath(); l.rect(x0 - 30, yc - h * 2, fx - x0 + 30, h * 4); l.ellipse(fx, ty, h * .32, h * .6, 0, 0, K.TAU); l.clip(); } l.fillStyle = col;
    K.line(l, [...top, end, ...bot.reverse()]); l.closePath(); l.fill();
    l.restore(); };

  K.template({ id: 'sketch-lower-third', title: 'Lower third', style: 'Sketchbook', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['700 80px "Bradley Hand"', '700 40px "Noteworthy"'],
    params: { name: 'Priya Nair', role: 'Bible teacher, Kerala, India', x: 180, y: 846, ink: '#2b3040', highlight: '#f6d45a', tape: '#fbf6ea', accent: '#e9876a' },
    draw(c, t, p) {
      const { x, y } = p, fN = K.font(80, 'Bradley Hand', 700), fR = K.font(40, 'Noteworthy', 700);
      const wN = K.width(c, p.name, fN), wR = K.width(c, p.role, fR);
      // exit: drifts left and fades, clear by 6.45 s
      const ex = K.E(t, 5.7, 6.45, 'in'); if (ex >= 1) return;
      c.save(); c.globalAlpha = 1 - ex; c.translate(-50 * ex, 0);
      const m = SK.mBegin();
      swash(m, x - 40, x + wN + 70, y - 26, 96, K.E(t, .15, .9, 'io'), p.highlight, 3, 10);
      swash(m, x - 22, x + wR + 44, y + 50, 56, K.E(t, .7, 1.3, 'io'), p.tape, 8, 3);
      SK.mEnd(c, { a: .95 * (1 - ex), soft: 1, blend: 'source-over', streak: .35 });
      SK.write(c, p.name, x, y, { font: fN, col: p.ink, k: K.P(t, .45, 1.45), a: 1 - ex });
      SK.write(c, p.role, x + 4, y + 64, { font: fR, col: p.ink, k: K.P(t, 1.0, 1.8), a: 1 - ex });
      // a small ink star doodled after the name
      const sx = x + wN + 108, sy = y - 56, star = Array.from({ length: 6 }, (_, i) => [sx + Math.cos(-Math.PI / 2 + i * K.TAU * 2 / 5) * 24, sy + Math.sin(-Math.PI / 2 + i * K.TAU * 2 / 5) * 24]);
      SK.pen(c, 'star' + wN, star, K.E(t, 1.5, 1.95, 'io'), { col: p.highlight, w: 4, amp: .6, step: 5, a: 1 - ex });
      c.restore();
    } });
})();
