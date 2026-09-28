// PAPER CUT — end card. Scalloped cloud banks spring up in layers, a few paper raindrops dangle from a small
// cloud (a nod to the next episode), and a cream card pops in with the thank-you and a "next time" tab.
// Everything pops and sinks away, ending on the plain sky sheet.
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

  // a scalloped cloud bank across the frame: the top edge is the union of seeded circles
  const bankPts = (y, r, seed) => { const R = K.rand(seed), C = [];
    for (let x = -140; x < 2100; x += r * (1.05 + R() * .5)) C.push([x, y + (R() - .5) * r * .5, r * (.75 + R() * .5)]);
    const top = []; for (let x = -120; x <= 2040; x += 6) { let m = 1e9; for (const [X, Y, rr] of C) { const d = x - X; if (Math.abs(d) < rr) m = Math.min(m, Y - Math.sqrt(rr * rr - d * d)); } top.push([x, Math.min(m, y + r)]); }
    return [...top, [2040, 1260], [-120, 1260]]; };
  const dropPts = (x, y, s) => Array.from({ length: 60 }, (_, i) => { const a = i / 60 * K.TAU, r = s * (1 - .55 * Math.pow(Math.max(0, -Math.sin(a)), 2.5)); // teardrop, point up
    return [x + Math.cos(a) * r * (1 - .6 * Math.max(0, -Math.sin(a))), y + Math.sin(a) * s * (Math.sin(a) < 0 ? 1.9 : 1)]; });

  K.template({ id: 'paper-endcard', title: 'End card', style: 'Paper Cut', type: 'End card', dur: 6, alpha: false,
    fonts: ['600 76px "Avenir Next"', 'italic 400 48px "Cochin"', '600 22px "Avenir Next"'],
    params: { thanks: 'Thank you for watching', next: 'Next time', teaser: 'Part 4 · Clouds and Rain',
      sky: '#cfdcdd', bank1: '#aebfc8', bank2: '#e3e6dc', bank3: '#f6f0e2', cloud: '#f7f1e3', drop: '#8eaab8', sun: '#dca94a', sunRim: '#ebca80', card: '#f6efe0', tab: '#dcae52', ink: '#34383c', accent: '#9b5a3c' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(tex(p.sky, 4), 0, 0, W, H, 0, 0, W, H);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.8, 'rgba(255,250,236,.3)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const sinkK = i => K.E(t, 4.9 + (2 - i) * .1, 5.6 + (2 - i) * .1, 'in');

      // small clouds, one with raindrops dangling on threads
      const CL = [[-150, 52, 1], [-72, 78, .55], [22, 104, .5], [118, 70, .62], [180, 46, 1]];
      const tc = [{ x: 330, y: 250, s: .8, from: -1, a: .3, drops: true }, { x: 1600, y: 200, s: .62, from: 1, a: .45 }];
      // a warm sun peeking from behind the right-hand cloud
      const sun = sheet('ecSunRim', close(Array.from({ length: 150 }, (_, i) => { const a = i / 150 * K.TAU, r = 96 + 7 * Math.cos(a * 12); return [1700 + Math.cos(a) * r, 150 + Math.sin(a) * r]; }), 1, 23), p.sunRim, { seed: 4, shadow: .6 });
      const disc = sheet('ecSun', close(K.circle(1700, 150, 70, 0, K.TAU, 100).slice(0, -1), 1.2, 24), p.sun, { seed: 5, shadow: .7 });
      const ks = K.E(t, .75, 2.1, 'out5'), xs = K.E(t, 4.8, 5.5, 'in'), sa = K.E(t, .75, 1.05);
      put(c, sun, 0, (1 - ks) * 240 - xs * 420, (1 - ks) * -.4 + t * .01, 1, 1700, 150, sa); put(c, disc, 0, (1 - ks) * 240 - xs * 420, 0, 1, 0, 0, sa);
      tc.forEach((q, i) => {
        const k = S(K.P(t, q.a, q.a + 1.3)), ex = K.E(t, 4.85 + i * .08, 5.55 + i * .08, 'in'), dx = q.from * ((1 - k) * 800 + ex * 900), bob = Math.sin(t * .8 + i * 2) * 4;
        if (q.drops) [[-70, 120, 16], [5, 165, 19], [80, 118, 15]].forEach(([ox, len, s], j) => { // drops hang below the cloud
          const kd = S(K.P(t, 1.0 + j * .15, 1.9 + j * .15)), sw = Math.sin(t * 1.4 + j * 1.9) * .06 * kd, ax = q.x + ox * q.s, ay = q.y - 6, L = len * kd;
          if (kd <= 0) return; c.save(); c.translate(ax + dx, ay + bob); c.rotate(sw);
          c.strokeStyle = 'rgba(80,70,60,.45)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, L); c.stroke();
          put(c, sheet('drop' + j, close(dropPts(0, 0, s), .5, 60 + j, 3), p.drop, { seed: 40 + j, shadow: .45, pad: 50 }), 0, L + s * 1.2, 0, Math.max(.001, kd), 0, 0); c.restore(); });
        put(c, sheet('ecCloud' + i, close(cloudPts(q.x, q.y, q.s, i ? CL.slice().reverse().map(([a, b, k2]) => [-a, b, k2]) : CL), 1.5, 30 + i), p.cloud, { seed: 6 + i, shadow: .8 }), dx, bob);
      });

      // three cloud banks spring up from the bottom
      [[p.bank1, 800, 88, 11], [p.bank2, 880, 76, 12], [p.bank3, 960, 64, 13]].forEach(([col, y, r, sd], i) => {
        const k = S(K.P(t, .05 + i * .12, 1.25 + i * .12)), dy = (1 - k) * (380 + i * 60) + sinkK(i) * (520 + i * 40);
        put(c, sheet('bank' + i, close(bankPts(y, r, sd), 1.4, 50 + i), col, { seed: 20 + i }), Math.sin(t * .5 + i) * 6 * (i + 1), dy);
      });

      // the card
      const cx = 960, cy = 480, fT = K.font(76, 'Avenir Next', 600), fS = K.font(48, 'Cochin', 400, 'italic'), fP = K.font(22, 'Avenir Next', 600);
      const wT = K.width(c, p.thanks, fT, .5), wS = K.width(c, p.teaser, fS, .3), tabT = p.next.toUpperCase(), wP = K.width(c, tabT, fP, 4) + 44, row = wP + 26 + wS;
      const cw = Math.min(1560, Math.max(wT, row) + 180), ch = 300;
      const card = sheet('ecCard' + Math.round(cw), close(roundPts(cx - cw / 2, cy - ch / 2, cw, ch, 22), 1.2, 71, 6), p.card, { seed: 31 });
      const ox = K.P(t, 4.55, 5.1), pop = 1 - (2.4 * ox * ox * ox - 1.4 * ox * ox), fade = 1 - K.E(t, 4.95, 5.1);
      const kc = S(K.P(t, .55, 1.6)), ca = K.E(t, .55, .75) * fade, sc = Math.max(.001, K.mix(.6, 1, kc) * pop);
      c.save(); c.globalAlpha = ca; c.translate(cx, cy + (1 - kc) * 50); c.rotate(K.mix(.09, .006, kc) - K.ease.in(ox) * .05); c.scale(sc, sc); c.translate(-cx, -cy);
      put(c, card);
      K.reveal(c, p.thanks, cx, cy - 30, { font: fT, color: p.ink, track: .5, align: 'center', k: K.P(t, .9, 1.9), mode: 'rise', dist: 24, stagger: .5, shadow: ['rgba(40,30,20,.24)', 3, 2], alpha: ca });
      // "next time" tab + teaser on one row
      const rx = cx - row / 2, ry = cy + 68, kp = S(K.P(t, 1.6, 2.3));
      if (kp > 0) { const tab = sheet('ecTab' + Math.round(wP), close(roundPts(rx, ry - 25, wP, 50, 25), .9, 72, 5), p.tab, { seed: 32, shadow: .5, pad: 50 });
        c.save(); c.translate(rx + wP / 2, ry); c.scale(kp, kp); c.rotate((1 - kp) * -.3 - .02); c.translate(-rx - wP / 2, -ry); put(c, tab);
        K.setText(c, fP, p.ink, 4, 'center', 'middle'); c.fillText(tabT, rx + wP / 2 + 2, ry + 1); c.restore(); }
      K.reveal(c, p.teaser, rx + wP + 26, ry + 15, { font: fS, color: p.accent, track: .3, k: K.P(t, 1.9, 2.9), mode: 'rise', dist: 14, stagger: .4, alpha: ca });
      c.restore();

      K.vignette(c, .15, '60,40,20'); K.grain(c, t, .025);
    } });
})();
