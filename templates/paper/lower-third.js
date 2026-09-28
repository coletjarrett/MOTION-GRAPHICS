// PAPER CUT — lower third. A torn sage sheet slides in, a crisp cream label springs on top of it with a slight
// rotation settle, a scrap of mustard tape pins it; the name rises and the role follows. It slides away left
// and is fully clear before the last frame. Alpha: overlay for editors.
(() => {
  // ---------- paper-cut kit (self-contained; every sheet is rendered once and cached) ----------
  const SH = 'rgba(54,40,26,';
  const tex = (col, seed = 1) => K.cached(`pcTex${col}${seed}`, 2600, 1300, (c, w, h) => {
    c.fillStyle = col; c.fillRect(0, 0, w, h);
    const m = document.createElement('canvas'); m.width = 256; m.height = 144; const mc = m.getContext('2d'), d = mc.createImageData(256, 144);
    for (let y = 0; y < 144; y++) for (let x = 0; x < 256; x++) { const v = K.fbm(x / 34, y / 34, seed, 4) * 255, i = (y * 256 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    mc.putImageData(d, 0, 0);
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .6; c.filter = 'blur(9px)'; c.drawImage(m, -40, -40, w + 80, h + 80); c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .22; c.fillStyle = c.createPattern(K.noiseTex(512, 512, seed + 500), 'repeat'); c.fillRect(0, 0, w, h); c.restore();
    const R = K.rand(seed + 77); c.lineCap = 'round';
    const fib = (n, col2, a0, a1) => { for (let i = 0; i < n; i++) { const x = R() * w, y = R() * h, a = R() * K.TAU, l = 5 + R() * 22; c.strokeStyle = `rgba(${col2},${a0 + R() * a1})`; c.lineWidth = .5 + R() * .8; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * .5 + (R() - .5) * 9, y + Math.sin(a) * l * .5 + (R() - .5) * 9, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); } };
    c.globalCompositeOperation = 'screen'; fib(4200, '255,252,244', .08, .16);
    c.globalCompositeOperation = 'multiply'; fib(2600, '96,72,48', .05, .09);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(90,66,42,${.05 + R() * .08})`; c.fillRect(R() * w, R() * h, 1 + R() * 1.6, 1 + R() * 1.6); }
    c.globalCompositeOperation = 'source-over';
  });
  const bbox = pts => { let a = 1e9, b = 1e9, cc = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); cc = Math.max(cc, x); d = Math.max(d, y); } return [a, b, cc, d]; };
  // a cut sheet: soft + contact shadow, fibre texture, and a faint bevel on the cut edge
  const sheet = (key, pts, col, o = {}) => {
    const [x0, y0, x1, y1] = bbox(pts), pad = o.pad ?? 80, w = Math.ceil(x1 - x0 + pad * 2), h = Math.ceil(y1 - y0 + pad * 2);
    const cv = K.cached(`pcS|${key}|${col}|${w}x${h}|${o.shadow ?? 1}|${o.rim || ''}`, w, h, c => {
      c.translate(pad - x0, pad - y0);
      const path = new Path2D(); pts.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y)); path.closePath();
      const sd = o.shadow ?? 1;
      if (sd > 0) { c.save(); c.fillStyle = col;
        c.shadowColor = SH + (.24 * sd) + ')'; c.shadowBlur = 36 * sd; c.shadowOffsetY = 16 * sd; c.shadowOffsetX = 5 * sd; c.fill(path);
        c.shadowColor = SH + '.32)'; c.shadowBlur = 5; c.shadowOffsetY = 2; c.shadowOffsetX = 1; c.fill(path); c.restore(); }
      const pat = c.createPattern(tex(col, o.seed || 1), 'repeat'), R = K.rand((o.seed || 1) * 13 + key.length);
      pat.setTransform(new DOMMatrix().translate(x0 - pad - R() * Math.max(0, 2600 - w), y0 - pad - R() * Math.max(0, 1300 - h))); // offset inside one tile: no seam
      if (o.rim) { c.fillStyle = o.rim; c.fill(path); const p2 = new Path2D(); o.core.forEach(([x, y], i) => i ? p2.lineTo(x, y) : p2.moveTo(x, y)); p2.closePath(); c.save(); c.clip(path); c.fillStyle = pat; c.fill(p2); c.restore(); }
      else { c.fillStyle = pat; c.fill(path); }
      c.save(); c.clip(path); c.lineWidth = 3; c.translate(0, 2); c.strokeStyle = 'rgba(255,250,238,.5)'; c.stroke(path);
      c.translate(0, -4); c.strokeStyle = 'rgba(60,40,20,.16)'; c.stroke(path); c.restore();
    });
    return { cv, x: x0 - pad, y: y0 - pad };
  };
  // draw a cached sheet, rotated/scaled about pivot (ax, ay) in the sheet's own coordinates
  const put = (c, s, dx = 0, dy = 0, rot = 0, sc = 1, ax = 0, ay = 0, a = 1) => {
    if (a <= 0 || sc <= 0) return; c.save(); c.globalAlpha *= a; c.translate(ax + dx, ay + dy); if (rot) c.rotate(rot); if (sc !== 1) c.scale(sc, sc);
    c.drawImage(s.cv, s.x - ax, s.y - ay); c.restore();
  };
  const close = (pts, amp, seed, step = 7) => K.wobble([...pts, pts[0]], amp, seed, step);
  const ridge = (x0, x1, f, bottom) => { const pts = []; for (let x = x0; x <= x1; x += 16) pts.push([x, f(x)]); pts.push([x1, bottom], [x0, bottom]); return pts; };
  const cloudPts = (cx, cy, s, circ) => {
    const C = circ.map(([dx, r, k]) => [cx + dx * s, cy - r * s * k, r * s]);
    const xa = Math.min(...C.map(q => q[0] - q[2])) + .5, xb = Math.max(...C.map(q => q[0] + q[2])) - .5, top = [], bot = [];
    for (let i = 0; i <= 90; i++) { const x = K.mix(xa, xb, i / 90); let t = 1e9, b = -1e9;
      for (const [X, Y, r] of C) { const d = x - X; if (Math.abs(d) < r) { const q = Math.sqrt(r * r - d * d); t = Math.min(t, Y - q); b = Math.max(b, Y + q); } }
      if (t < 1e9) { top.push([x, t]); bot.push([x, Math.min(cy, b)]); } }
    return [...top, ...bot.reverse()];
  };
  const roundPts = (x, y, w, h, r) => { const a = [], q = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const u = a0 + i / 6 * Math.PI / 2; a.push([cx + Math.cos(u) * r, cy + Math.sin(u) * r]); } };
    q(x + w - r, y + r, -Math.PI / 2); q(x + w - r, y + h - r, 0); q(x + r, y + h - r, Math.PI / 2); q(x + r, y + r, Math.PI); return a; };
  // a torn edge from (x0,y0) to (x1,y1): fibrous, irregular, seeded
  const torn = (x0, y0, x1, y1, seed, amp = 7) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L / 4), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    return Array.from({ length: n + 1 }, (_, i) => { const u = i / n, o = (K.fbm(i * .06, 0, seed, 4) - .5) * 2 * amp + (K.hash(i, 3, seed) - .5) * amp * .35; return [K.mix(x0, x1, u) + nx * o, K.mix(y0, y1, u) + ny * o]; }); };
  // the same outline pulled inward by a varying amount (reveals the pale core of torn paper)
  const inset = (pts, seed, a0 = 1.5, a1 = 5) => { const n = pts.length; let cx = 0, cy = 0; pts.forEach(([x, y]) => { cx += x / n; cy += y / n; });
    const N = pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[1] - a[1]) / L, -(b[0] - a[0]) / L]; });
    const sg = N.reduce((s, [nx, ny], i) => s + nx * (cx - pts[i][0]) + ny * (cy - pts[i][1]), 0) > 0 ? 1 : -1;
    return pts.map(([x, y], i) => { const d = a0 + a1 * K.noise(i * .15, 0, seed); return [x + N[i][0] * d * sg, y + N[i][1] * d * sg]; }); };
  const S = K.ease.spring;

  K.template({ id: 'paper-lower-third', title: 'Lower third', style: 'Paper Cut', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['600 58px "Avenir Next"', 'italic 400 38px "Cochin"'],
    params: { name: 'Grace Oduya', role: 'Pioneer, Nairobi, Kenya', x: 168, y: 772, card: '#f6efe0', back: '#c98467', rim: '#f3ecdb', tape: '#dcae52', ink: '#34383c', roleInk: '#9b5a3c' },
    draw(c, t, p) {
      const fN = K.font(58, 'Avenir Next', 600), fR = K.font(38, 'Cochin', 400, 'italic');
      const wN = K.width(c, p.name, fN, .5), wR = K.width(c, p.role, fR, .3);
      const px = 50, fw = Math.ceil(Math.max(wN, wR) + px * 2 + 10), fh = 150, x = p.x, y = p.y;
      // back sheet: torn on all four sides, pale core showing at the tear
      const bx = x - 22, by = y - 20, bw = fw + 64, bh = fh + 44, sd = Math.round(fw);
      const bpts = [...torn(bx, by, bx + bw, by, 11 + sd, 6), ...torn(bx + bw, by, bx + bw, by + bh, 12, 7).slice(1), ...torn(bx + bw, by + bh, bx, by + bh, 13 + sd, 6).slice(1), ...torn(bx, by + bh, bx, by, 14, 7).slice(1, -1)];
      const back = sheet('l3back' + sd, bpts, p.back, { seed: 5, rim: p.rim, core: inset(bpts, 3, 2, 6) });
      const front = sheet('l3front' + sd, close(roundPts(x, y, fw, fh, 10), 1.1, 9, 6), p.card, { seed: 6, shadow: .85 });
      const tw = 120, th = 38, tx = x + 6, ty = y + 4; // tape across the top-left corner
      const tpts = [...torn(tx - tw / 2, ty - th / 2, tx - tw / 2, ty + th / 2, 21, 3), ...torn(tx + tw / 2, ty + th / 2, tx + tw / 2, ty - th / 2, 22, 3)];
      const tape = sheet('l3tape', tpts, p.tape, { seed: 7, shadow: .25, pad: 40 });

      const out = K.P(t, 5.85, 6.65), eo = K.ease.in5(out), eo2 = K.ease.in5(K.P(t, 5.95, 6.75));
      const bcx = bx + bw / 2, bcy = by + bh / 2, fcx = x + fw / 2, fcy = y + fh / 2;
      // back sheet slides in from the left with a spring and settles at a slight tilt
      const kb = S(K.P(t, .05, 1.15));
      put(c, back, -(1 - kb) * (bw + 360) - eo2 * (bw + 420), 0, K.mix(-.09, -.026, kb) - eo2 * .05, 1, bcx, bcy);
      // front label springs on top
      const kf = S(K.P(t, .3, 1.35)), fa = K.E(t, .3, .45);
      const frot = K.mix(.07, .007, kf) - eo * .04, fsc = K.mix(.72, 1, kf), fdx = -eo * (fw + 480);
      c.save(); c.globalAlpha = fa; c.translate(fcx + fdx, fcy); c.rotate(frot); c.scale(fsc, fsc); c.translate(-fcx, -fcy);
      put(c, front);
      K.reveal(c, p.name, x + px, y + 70, { font: fN, color: p.ink, track: .5, k: K.P(t, .6, 1.45), mode: 'rise', dist: 22, stagger: .45, shadow: ['rgba(40,30,20,.22)', 2, 1.5], alpha: fa });
      c.fillStyle = p.tape; c.globalAlpha = fa * K.E(t, .95, 1.4); c.fillRect(x + px, y + 88, 40 * K.E(t, .95, 1.5, 'out5'), 3); c.globalAlpha = fa;
      K.reveal(c, p.role, x + px, y + 128, { font: fR, color: p.roleInk, track: .3, k: K.P(t, .9, 1.75), mode: 'fade', stagger: .4, alpha: fa });
      // tape lands last
      const kt = S(K.P(t, .95, 1.55));
      if (kt > 0) put(c, tape, 0, -(1 - kt) * 30, -.62 + (1 - kt) * .25, K.mix(1.25, 1, kt), tx, ty, K.E(t, .95, 1.1) * .92);
      c.restore();
    } });
})();
