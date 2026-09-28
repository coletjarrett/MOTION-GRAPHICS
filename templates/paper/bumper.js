// PAPER CUT — program open. Layered cut-paper hills, a lake, clouds and a sun spring up into place with soft
// drop shadows and gentle parallax; a paper label with a ribbon behind it carries the title. Everything sinks
// back out of frame, ending on the plain sky sheet it began on.
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
  const PAL = { sky: '#d3dfdd', sun: '#dca94a', sunRim: '#ebca80', cloud: '#f7f1e3', far: '#a9bcc4', farSage: '#c2cba8', lake: '#8eaab8', wave: '#c5d6da', mid: '#95a984', deep: '#7c916f', field: '#c98a6b', card: '#f6efe0', ribbon: '#c98467', ink: '#36393d', trunk: '#8c6a50', tree: '#6f8763', tree2: '#a8b884' };

  K.template({ id: 'paper-bumper', title: 'Program bumper', style: 'Paper Cut', type: 'Bumper / open', dur: 8, alpha: false,
    fonts: ['600 86px "Avenir Next"', 'italic 400 44px "Cochin"', '600 22px "Avenir Next"'],
    params: { title: 'Lessons From Creation', sub: 'Part 3 · The Water Cycle', ...PAL },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      // sky: the base sheet (no shadow), lightened toward the horizon
      c.drawImage(tex(p.sky, 3), 0, 0, W, H, 0, 0, W, H);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(255,250,236,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H);

      const drift = t - 4.3; // gentle parallax during the hold
      const sink = (i, n) => K.E(t, 6.55 + (n - 1 - i) * .09, 7.35 + (n - 1 - i) * .09, 'in'); // front layers leave first

      // sun (behind the hills): a scalloped rim sheet and the disc
      const sx = 1655, sy = 238, rise = (1 - K.E(t, .45, 2.0, 'out5')) * 460 + K.E(t, 6.35, 7.25, 'in') * 1000;
      const rim = sheet('sunrim', close(Array.from({ length: 180 }, (_, i) => { const a = i / 180 * K.TAU, r = 128 + 9 * Math.cos(a * 14); return [sx + Math.cos(a) * r, sy + Math.sin(a) * r]; }), 1.2, 21), p.sunRim, { shadow: .6, seed: 4 });
      const disc = sheet('sun', close(K.circle(sx, sy, 94, 0, K.TAU, 120).slice(0, -1), 1.4, 22), p.sun, { shadow: .8, seed: 5 });
      const spin = K.mix(-.25, 0, K.E(t, .45, 2.4, 'out5')) + drift * .004;
      put(c, rim, 0, rise + drift * -1.5, spin, 1, sx, sy); put(c, disc, 0, rise * .96 + drift * -1.5);

      // clouds slide in from the sides with a spring and drift slowly
      const CL = [[-150, 52, 1], [-72, 78, .55], [22, 104, .5], [118, 70, .62], [180, 46, 1]];
      const clouds = [{ x: 455, y: 300, s: 1.05, from: -1, a: .75, seed: 31 }, { x: 1235, y: 205, s: .72, from: 1, a: 1.0, seed: 32 }, { x: 1790, y: 520, s: .55, from: 1, a: 1.2, seed: 33 }];
      clouds.forEach((q, i) => {
        const sp = sheet('cloud' + i, close(cloudPts(q.x, q.y, q.s, i === 1 ? CL.slice().reverse().map(([a, b, k]) => [-a, b, k]) : CL), 1.5, q.seed), p.cloud, { shadow: .8, seed: 6 + i });
        const k = S(K.P(t, q.a, q.a + 1.5)), ex = K.E(t, 6.3 + i * .08, 7.1 + i * .08, 'in');
        put(c, sp, q.from * ((1 - k) * 900 + ex * 1100) + drift * (6 + i * 3), Math.sin(t * .6 + i * 2) * 4);
      });

      // hills, back to front: [colour, entry time, parallax, shape]
      const L = [
        { col: p.far, a: .1, par: 2, key: 'far', f: x => 610 + 60 * Math.sin(x / 330 + .6) + 34 * Math.sin(x / 140 + 2) + 18 * K.noise(x / 90, 0, 1) },
        { col: p.farSage, a: .22, par: 4, key: 'farSage', f: x => 700 + 50 * Math.sin(x / 260 + 2.4) + 24 * Math.sin(x / 110) + 12 * K.noise(x / 70, 0, 2) },
        { col: p.lake, a: .34, par: 6, key: 'lake', f: x => 790 + 4 * Math.sin(x / 190) },
        { col: p.mid, a: .46, par: 9, key: 'mid', x0: -160, x1: 1420, f: x => 772 + 150 * Math.pow(K.clamp((x + 160) / 1580), 1.7) + 26 * Math.sin(x / 150 + 1) + 10 * K.noise(x / 60, 0, 4), trees: [[150, 1], [236, .72], [610, .85]] },
        { col: p.deep, a: .58, par: 12, key: 'deep', x0: 820, f: x => 830 + 180 * Math.pow(1 - K.clamp((x - 820) / 1260), 1.6) + 22 * Math.sin(x / 130) + 10 * K.noise(x / 60, 0, 5), trees: [[1660, .95], [1760, .7]] },
        { col: p.field, a: .7, par: 16, key: 'field', f: x => 972 + 20 * Math.sin(x / 210 + 1.3) + 10 * Math.sin(x / 75) + 6 * K.noise(x / 40, 0, 6) },
      ];
      L.forEach((l, i) => {
        const sp = sheet('hill' + l.key, close(ridge(l.x0 ?? -160, l.x1 ?? 2080, l.f, 1180 + i * 25), 1.7, 40 + i), l.col, { seed: 10 + i });
        const k = S(K.P(t, l.a, l.a + 1.35)), dy = (1 - k) * (420 + i * 60) + sink(i, L.length) * (640 + i * 30);
        (l.trees || []).forEach(([x, z], j) => { // little lollipop trees standing on the ridge, same depth as their hill
          const by = l.f(x) + 14, th = 150 * z, r = 46 * z;
          const tr = sheet(`trunk${l.key}${j}`, close([[x - 5 * z, by], [x - 4 * z, by - th + r], [x + 4 * z, by - th + r], [x + 5 * z, by]], .6, 80 + j, 4), p.trunk, { shadow: .5, seed: 40 + j });
          const cr = sheet(`crown${l.key}${j}`, close(Array.from({ length: 80 }, (_, m) => { const a = m / 80 * K.TAU; return [x + Math.cos(a) * r * .86, by - th + Math.sin(a) * r * 1.1]; }), 1.3, 90 + j, 5), j % 2 ? p.tree2 : p.tree, { shadow: .6, seed: 50 + j });
          const kt = S(K.P(t, l.a + .7 + j * .12, l.a + 1.6 + j * .12)), sway = Math.sin(t * 1.3 + j) * .012;
          put(c, tr, drift * l.par * -1, dy, 0, Math.max(.001, kt), x, by); put(c, cr, drift * l.par * -1, dy, sway, Math.max(.001, kt), x, by);
        });
        put(c, sp, drift * l.par * -1, dy);
        if (l.key === 'lake') { // lighter wave strips cut into the lake
          [[830, 842, 150, 0], [1010, 874, 110, 1], [1190, 836, 150, 2], [1330, 866, 110, 3]].forEach(([x, y, w, j]) => {
            const wv = sheet('wave' + j, close([...Array.from({ length: 21 }, (_, m) => [x + w * m / 20, y + 4 * Math.sin(m / 20 * K.TAU * 1.5 + j)]), ...Array.from({ length: 21 }, (_, m) => [x + w * (1 - m / 20), y + 7 + 4 * Math.sin((1 - m / 20) * K.TAU * 1.5 + j)])], .8, 60 + j, 5), p.wave, { shadow: .35, seed: 20 + j });
            put(c, wv, drift * l.par * -1 + Math.sin(t * .9 + j) * 6, dy, 0, 1, 0, 0, K.E(t, 1.2 + j * .12, 1.9 + j * .12));
          });
        }
      });

      // ---------- title label: ribbon behind, cream card in front ----------
      const cx = 960, cy = 470, fT = K.font(86, 'Avenir Next', 600), fS = K.font(44, 'Cochin', 400, 'italic');
      const wT = K.width(c, p.title, fT, 1), wS = K.width(c, p.sub, fS, .5), cw = Math.min(1500, Math.max(wT, wS) + 190), ch = 262;
      const ox = K.P(t, 5.95, 6.6), out = ox, pop = 1 - (2.4 * ox * ox * ox - 1.4 * ox * ox), fade = 1 - K.E(t, 6.4, 6.6, 'in'); // back-in: a small swell, then shrink away
      // ribbon with swallowtail ends
      const rw = cw + 250, rh = 104, ry = cy + 46, nt = 42;
      const ribbon = sheet('ribbon' + rw, close([[cx - rw / 2, ry - rh / 2], [cx + rw / 2, ry - rh / 2], [cx + rw / 2 - nt, ry], [cx + rw / 2, ry + rh / 2], [cx - rw / 2, ry + rh / 2], [cx - rw / 2 + nt, ry]], 1.4, 71, 6), p.ribbon, { seed: 30 });
      const kr = S(K.P(t, 1.55, 2.75));
      c.save(); c.translate(cx, ry); c.scale(Math.max(.001, K.mix(.18, 1, kr) * pop), Math.max(.001, pop)); c.translate(-cx, -ry);
      put(c, ribbon, 0, 0, 0, 1, 0, 0, K.E(t, 1.55, 1.8) * fade); c.restore();
      // card
      const card = sheet('card' + cw, close(roundPts(cx - cw / 2, cy - ch / 2, cw, ch, 20), 1.2, 72, 6), p.card, { seed: 31 });
      const kc = S(K.P(t, 1.8, 3.0)), ca = K.E(t, 1.8, 2.05) * fade;
      const rot = K.mix(-.1, -.006, kc) + K.ease.in(ox) * .06, sc = Math.max(.001, K.mix(.55, 1, kc) * pop), dy = (1 - kc) * 60;
      c.save(); c.globalAlpha = ca; c.translate(cx, cy + dy); c.rotate(rot); c.scale(sc, sc); c.translate(-cx, -cy);
      put(c, card);
      // cut-paper letters: ink with a small contact shadow
      const sh = ['rgba(40,30,20,.28)', 3, 2];
      K.reveal(c, p.title, cx, cy - 12, { font: fT, color: p.ink, track: 1, align: 'center', k: K.P(t, 2.15, 3.2), mode: 'rise', dist: 26, stagger: .5, shadow: sh, alpha: ca });
      const dw = 70 * K.E(t, 2.7, 3.4, 'out5'); c.globalAlpha = ca; c.fillStyle = K.rgba(p.sun, 1); c.fillRect(cx - dw, cy + 26, dw * 2, 3);
      K.reveal(c, p.sub, cx, cy + 86, { font: fS, color: '#9b5a3c', track: .5, align: 'center', k: K.P(t, 2.75, 3.7), mode: 'fade', stagger: .45, alpha: ca });
      c.restore();

      K.vignette(c, .16, '60,40,20'); K.grain(c, t, .025);
    } });

})();
