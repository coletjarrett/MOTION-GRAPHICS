// SKETCHBOOK — program bumper for study notes. A dotted-grid notebook page; the title is handwritten in ink and
// swiped with a yellow highlighter, the subtitle gets a loopy doodled underline, and a curly arrow and a star are
// doodled in the margin. The page then turns to a fresh blank sheet.
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

  K.template({ id: 'sketch-bumper', title: 'Program bumper', style: 'Sketchbook', type: 'Bumper / open', dur: 7, alpha: false,
    fonts: ['700 172px "Bradley Hand"', '700 66px "Noteworthy"'],
    params: { title: 'Study Notes', sub: 'Daniel Chapter 2', paper: '#f6f1e6', dots: '#9aa3b5', ink: '#2b3040', highlight: '#f6d45a', accent: '#e9876a' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2;
      c.drawImage(SK.page(p.paper, p.dots), 0, 0);
      const fT = K.font(172, 'Bradley Hand', 700), fS = K.font(66, 'Noteworthy', 700), ty = 530, sy = 680;
      const wT = K.width(c, p.title, fT), wS = K.width(c, p.sub, fS);
      // highlighter swipe across the lower half of the title (after it is written)
      const m = SK.mBegin(), x0 = cx - wT / 2 - 34, x1 = cx + wT / 2 + 30;
      SK.marker(m, 'hl' + wT, [[x0, ty - 34], [K.mix(x0, x1, .5), ty - 40], [x1, ty - 30]], K.E(t, 2.0, 2.75, 'io'), { col: p.highlight, w: 82, cap: 'butt', amp: 2.2 });
      SK.mEnd(c);
      SK.write(c, p.title, cx, ty, { font: fT, col: p.ink, align: 'center', k: K.P(t, .4, 2.0) });
      SK.write(c, p.sub, cx, sy, { font: fS, col: p.ink, align: 'center', k: K.P(t, 2.5, 3.5) });
      // loopy doodled underline beneath the subtitle
      const u0 = cx - wS / 2 - 10, u1 = cx + wS / 2 + 10, loops = [];
      const nl = Math.max(6, Math.round((u1 - u0) / 42)); for (let i = 0; i <= 240; i++) { const u = i / 240, x = K.mix(u0, u1, u), a = u * nl * K.TAU; loops.push([x - Math.sin(a) * 17, sy + 40 - (1 - Math.cos(a)) * 10]); }
      SK.pen(c, 'loops' + wS, loops, K.E(t, 3.35, 4.2, 'io'), { col: p.accent, w: 3.6, amp: .8, step: 5 });
      // a curved arrow from the margin to the title, and a star
      const A = [cx - wT / 2 - 240, 690], B = [cx - wT / 2 - 64, 504], arr = K.bez(A, [A[0] - 40, A[1] - 120], [B[0] - 140, B[1] + 6], B, 60);
      SK.pen(c, 'arr' + wT, arr, K.E(t, 3.9, 4.7, 'io'), { col: p.ink, w: 4, step: 6 });
      const [hx, hy] = arr[arr.length - 1], ang = Math.atan2(hy - arr[arr.length - 6][1], hx - arr[arr.length - 6][0]);
      [-1, 1].forEach(sg => SK.pen(c, 'ah' + sg + wT, [[hx, hy], [hx - Math.cos(ang + sg * .5) * 28, hy - Math.sin(ang + sg * .5) * 28]], K.E(t, 4.65, 4.85, 'out'), { col: p.ink, w: 4, double: false }));
      const stx = cx + wT / 2 + 90, sty = ty - 150, star = Array.from({ length: 6 }, (_, i) => [stx + Math.cos(-Math.PI / 2 + i * K.TAU * 2 / 5) * 42, sty + Math.sin(-Math.PI / 2 + i * K.TAU * 2 / 5) * 42]);
      SK.pen(c, 'star' + wT, star, K.E(t, 4.3, 4.95, 'io'), { col: p.accent, w: 4.2, amp: 1 });
      SK.turn(c, p.paper, p.dots, K.E(t, 5.9, 6.65, 'io'));
    } });
})();
