// PAPER CUT — timeline. A torn paper strip slides across a cream sheet; for each milestone a round month tab
// pops onto the strip and a paper card springs up (or down) from it with a slight tilt settle, while a mustard
// ribbon tracks progress. Cards pop away in order, the strip slides off and the frame ends on the clean sheet.
// Data-driven: pass any list of {month, book, note} (4 to 6 items read best).
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

  K.template({ id: 'paper-timeline', title: 'Timeline', style: 'Paper Cut', type: 'Timeline', dur: 14, alpha: false,
    fonts: ['600 66px "Avenir Next"', '600 22px "Avenir Next"', '600 52px "Avenir Next"', 'italic 400 34px "Cochin"'],
    params: { kicker: 'A family reading plan', heading: 'Our Year of Bible Reading',
      items: [{ month: 'Jan', book: 'Genesis', note: 'In the beginning' }, { month: 'Mar', book: 'Exodus', note: 'Out of Egypt' },
        { month: 'Jun', book: 'Psalms', note: 'Songs of praise' }, { month: 'Sep', book: 'Isaiah', note: 'A promised hope' },
        { month: 'Dec', book: 'Revelation', note: 'All things new' }],
      bg: '#efe6d3', strip: '#9fb08c', rim: '#f4eddc', card: '#f7f0e2', tab: '#f7f0e2', progress: '#dcae52', ink: '#34383c', muted: '#8a5a42',
      accents: ['#c98467', '#8eaab8', '#dcae52', '#8fa37f', '#c98467'], cornerA: '#b9ccd3', cornerB: '#c3cdb0' },
    draw(c, t, p) {
      const W = K.W, H = K.H, n = p.items.length, sy = 640, sh = 78, x0 = 150, x1 = W - 150;
      const X = i => K.mix(330, W - 330, n > 1 ? i / (n - 1) : .5), t0 = 2.3, step = 1.85, T = i => t0 + i * step;
      const outA = 12.35; // exit begins
      c.drawImage(tex(p.bg, 2), 0, 0, W, H, 0, 0, W, H);

      // corner sheets frame the page (they slide in and out with the strip)
      const kc = S(K.P(t, .1, 1.3)), xc = K.E(t, 13.0, 13.7, 'in5');
      const blob = (key, P, col, seed) => sheet(key, close(K.catmull(P, 12), 1.5, seed), col, { seed });
      const corners = [
        blob('tlA1', [[1380, -80], [1470, 40], [1600, 150], [1760, 250], [1900, 330], [2020, 360], [2020, -80]], p.cornerA, 3),
        blob('tlA2', [[1620, -80], [1690, 30], [1790, 120], [1910, 170], [2020, 190], [2020, -80]], p.cornerB, 4),
        blob('tlB1', [[-100, 800], [30, 830], [170, 890], [300, 980], [400, 1080], [440, 1160], [-100, 1160]], p.cornerB, 5),
        blob('tlB2', [[-100, 930], [60, 960], [180, 1020], [260, 1100], [280, 1160], [-100, 1160]], p.accents[0], 6),
      ];
      corners.forEach((s2, i) => { const kk = S(K.P(t, .05 + (i % 2) * .15, 1.2 + (i % 2) * .15)), xx = K.E(t, 13.0 - (i % 2) * .12, 13.6 - (i % 2) * .12, 'in5'), sgn = i < 2 ? 1 : -1;
        put(c, s2, sgn * ((1 - kk) * 560 + xx * 600), -sgn * ((1 - kk) * 300 + xx * 320)); });
      // heading
      const ho = K.E(t, 12.5, 13.1, 'in');
      K.reveal(c, p.kicker.toUpperCase(), x0, 178 - ho * 20, { font: K.font(22, 'Avenir Next', 600), color: p.muted, track: 6, k: K.P(t, .3, 1.2), mode: 'track', stagger: .3, alpha: 1 - ho });
      K.reveal(c, p.heading, x0, 252 - ho * 20, { font: K.font(66, 'Avenir Next', 600), color: p.ink, track: .5, k: K.P(t, .5, 1.5), mode: 'rise', dist: 24, stagger: .4, shadow: ['rgba(40,30,20,.2)', 2, 1.5], alpha: 1 - ho });

      // the strip: torn top and bottom edges, pale core at the tear
      const spts = [...torn(x0 - 30, sy - sh / 2, x1 + 30, sy - sh / 2, 31, 5), ...torn(x1 + 30, sy + sh / 2, x0 - 30, sy + sh / 2, 32, 5)];
      const strip = sheet('tlStrip', spts, p.strip, { seed: 11, rim: p.rim, core: inset(spts, 5, 1.5, 5) });
      const ks = S(K.P(t, .6, 1.9)), xs = K.E(t, 13.05, 13.75, 'in5');
      const sdx = -(1 - ks) * (x1 + 200) + xs * (W + 200);
      put(c, strip, sdx, 0);
      // progress ribbon along the strip's centre, revealed node to node
      let prog = X(0) - 90; for (let i = 0; i < n; i++) prog = K.mix(prog, X(i), K.E(t, T(i) - .55, T(i) + .1, 'io'));
      if (t > T(0) - .6) { const pr = sheet('tlProg', close([[x0, sy - 5], [x1, sy - 5], [x1, sy + 5], [x0, sy + 5]], .9, 6, 5), p.progress, { seed: 12, shadow: .35, pad: 40 });
        c.save(); c.beginPath(); c.rect(0, 0, prog + sdx, H); c.clip(); put(c, pr, sdx, 0, 0, 1, 0, 0, K.E(t, T(0) - .6, T(0) - .3)); c.restore(); }

      const fB = K.font(52, 'Avenir Next', 600), fN = K.font(34, 'Cochin', 400, 'italic'), fM = K.font(22, 'Avenir Next', 600);
      const cw = 364, ch = 196, gap = 50;
      p.items.forEach((it, i) => {
        const x = X(i) + sdx, ti = T(i), up = i % 2 === 0, dir = up ? -1 : 1;
        const acc = p.accents[i % p.accents.length];
        const xo = K.P(t, outA + i * .09, outA + .55 + i * .09), pop = 1 - (2.4 * xo * xo * xo - 1.4 * xo * xo); // swell then shrink away
        // month tab on the strip
        const kt = S(K.P(t, ti, ti + .7)) * pop;
        const tab = sheet('tlTab' + i, close(K.circle(X(i), sy, 40, 0, K.TAU, 72).slice(0, -1), 1, 70 + i, 5), p.tab, { seed: 13 + i, shadow: .7, pad: 60 });
        if (t < ti) { c.fillStyle = K.rgba('#ffffff', .55 * ks); c.beginPath(); c.arc(x, sy, 7, 0, K.TAU); c.fill(); }
        if (kt > 0.001) { c.save(); c.translate(x, sy); c.scale(kt, kt); c.translate(-X(i), -sy); put(c, tab);
          K.setText(c, fM, p.ink, 2, 'center', 'middle'); c.fillText(it.month.toUpperCase(), X(i) + 1, sy + 1); c.restore(); }
        if (t < ti + .15) return;
        // card and its stem, springing out of the strip
        const kk = S(K.P(t, ti + .15, ti + 1.15)) * pop; if (kk <= 0.001) return;
        const cy0 = up ? sy - sh / 2 - gap - ch : sy + sh / 2 + gap, ax = X(i), ay = up ? sy - sh / 2 : sy + sh / 2;
        const stem = sheet('tlStem' + i, close([[ax - 6, ay], [ax + 6, ay], [ax + 6, ay + dir * (gap + 14)], [ax - 6, ay + dir * (gap + 14)]].map(([a, b]) => [a, b]), .6, 90 + i, 4), acc, { seed: 20 + i, shadow: .45, pad: 40 });
        const card = sheet('tlCard' + i, close(roundPts(ax - cw / 2, cy0, cw, ch, 14), 1.1, 100 + i, 6), p.card, { seed: 25 + i, shadow: .9 });
        const band = sheet('tlBand' + i, close([[ax - cw / 2 + 20, cy0 + 18], [ax + cw / 2 - 20, cy0 + 18], [ax + cw / 2 - 20, cy0 + 32], [ax - cw / 2 + 20, cy0 + 32]], .8, 110 + i, 5), acc, { seed: 30 + i, shadow: .2, pad: 30 });
        const tilt = (up ? -1 : 1) * (i % 3 === 1 ? .018 : -.014), bob = Math.sin(t * 1.1 + i * 1.7) * 2.5 * K.P(t, ti + 1.2, ti + 2);
        c.save(); c.translate(x, ay); c.rotate(K.mix(dir * -.22, tilt, kk) * 1); c.scale(kk, kk); c.translate(-ax, -ay + bob);
        put(c, stem); put(c, card); put(c, band);
        const bs = Math.min(52, 52 * (cw - 48) / K.width(c, it.book, fB, .5));
        K.reveal(c, it.book, ax, cy0 + 104, { font: K.font(bs, 'Avenir Next', 600), color: p.ink, track: .5, align: 'center', k: K.P(t, ti + .45, ti + 1.15), mode: 'rise', dist: 16, stagger: .4, shadow: ['rgba(40,30,20,.18)', 2, 1.2] });
        K.reveal(c, it.note, ax, cy0 + 156, { font: fN, color: p.muted, track: .3, align: 'center', k: K.P(t, ti + .7, ti + 1.5), mode: 'fade', stagger: .4 });
        c.restore();
      });
      K.vignette(c, .14, '60,40,20'); K.grain(c, t, .02);
    } });
})();
