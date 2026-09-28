// motion-kit: a deterministic 2D motion-graphics runtime. Every frame is a pure function of t, so any frame
// can be rendered on any machine, in any order, in parallel, and re-rendered identically after a text change.
// A template calls K.template({...}); the page exposes ready() / audit() / snap(t) to the renderer.
(() => {
  const K = window.K = {};
  const TAU = K.TAU = Math.PI * 2;

  // ---------- time ----------
  K.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  K.mix = (a, b, k) => a + (b - a) * k;
  K.P = (t, a, b) => K.clamp((t - a) / (b - a));
  K.bell = (t, a, b, c, d) => K.P(t, a, b) * (1 - K.P(t, c, d));
  const E = K.ease = {
    lin: x => x,
    in: x => x * x * x,
    out: x => 1 - Math.pow(1 - x, 3),
    io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    in5: x => Math.pow(x, 5),
    out5: x => 1 - Math.pow(1 - x, 5),
    io5: x => x < .5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2,
    outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
    ioExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
    outBack: (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
    sine: x => -(Math.cos(Math.PI * x) - 1) / 2,
    // a critically-damped-ish spring settle, 0..1 → 0..1 with a gentle overshoot
    spring: (x, k = 7, d = 5.5) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(k * x) * (1 - x) - x * Math.exp(-d),
  };
  // eased progress in a window: K.E(t, a, b, 'out')
  K.E = (t, a, b, e = 'io') => E[e](K.P(t, a, b));
  // in/hold/out envelope for an element that enters at a, is fully in by b, leaves from c, gone by d
  K.env = (t, a, b, c, d, ei = 'out', eo = 'in') => t < b ? E[ei](K.P(t, a, b)) : 1 - E[eo](K.P(t, c, d));

  // ---------- randomness & noise (seeded, deterministic) ----------
  K.rand = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hash = (x, y, s = 0) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  K.hash = hash;
  const sm = x => x * x * (3 - 2 * x);
  K.noise = (x, y = 0, s = 0) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    return K.mix(K.mix(hash(xi, yi, s), hash(xi + 1, yi, s), xf), K.mix(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), xf), yf); };
  K.fbm = (x, y = 0, s = 0, oct = 4) => { let v = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { v += a * K.noise(x * f, y * f, s + i * 17); f *= 2.03; a *= .5; } return v / (1 - Math.pow(.5, oct)); };

  // ---------- colour ----------
  K.rgb = (hex) => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  K.rgba = (hex, a = 1) => { const [r, g, b] = K.rgb(hex); return `rgba(${r},${g},${b},${a})`; };
  K.lerpc = (h1, h2, k, a = 1) => { const A = K.rgb(h1), B = K.rgb(h2); return `rgba(${A.map((v, i) => Math.round(K.mix(v, B[i], k))).join(',')},${a})`; };

  // ---------- geometry ----------
  K.rr = (c, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  K.len = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  K.at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= s) { const k = s ? d / s : 0; return [K.mix(pts[i - 1][0], pts[i][0], k), K.mix(pts[i - 1][1], pts[i][1], k), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; } d -= s; } const n = pts.length - 1; return [pts[n][0], pts[n][1], Math.atan2(pts[n][1] - pts[n - 1][1], pts[n][0] - pts[n - 1][0])]; };
  K.sub = (pts, d0, d1) => { const out = [K.at(pts, d0).slice(0, 2)]; let acc = 0; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc += s; if (acc > d0 && acc < d1) out.push(pts[i]); } out.push(K.at(pts, d1).slice(0, 2)); return out; };
  K.line = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); };
  // stroke a polyline drawn on from 0..1 (k), optionally only the window [k0,k]
  K.draw = (c, pts, k, k0 = 0) => { if (k <= k0) return; const L = K.len(pts); K.line(c, K.sub(pts, L * k0, L * K.clamp(k))); c.stroke(); };
  K.bez = (p0, p1, p2, p3, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });
  K.catmull = (P, n = 16) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2; for (let j = 0; j < n; j++) { const u = j / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); } } out.push(P[P.length - 1]); return out; };
  K.circle = (x, y, r, a0 = -Math.PI / 2, a1 = a0 + TAU, n = 96) => Array.from({ length: n + 1 }, (_, i) => { const a = K.mix(a0, a1, i / n); return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });
  // a wobbly hand-drawn version of a polyline (seeded)
  K.wobble = (pts, amp = 2, seed = 1, step = 8) => { const L = K.len(pts), n = Math.max(2, Math.ceil(L / step)); return Array.from({ length: n + 1 }, (_, i) => { const [x, y, a] = K.at(pts, L * i / n); const o = (K.noise(i * .35, 0, seed) - .5) * 2 * amp; return [x - Math.sin(a) * o, y + Math.cos(a) * o]; }); };

  // ---------- text ----------
  K.font = (size, family = 'Avenir Next', weight = 500, style = '') => `${style} ${weight} ${size}px ${/[ ,"]/.test(family) && !family.includes('"') ? `"${family}"` : family}`.trim();
  K.setText = (c, f, color, track = 0, align = 'left', base = 'alphabetic') => { c.font = f; if (color) c.fillStyle = color; c.letterSpacing = track + 'px'; c.textAlign = align; c.textBaseline = base; };
  K.width = (c, s, f, track = 0) => { c.save(); c.font = f; c.letterSpacing = track + 'px'; const w = c.measureText(s).width - (s.length ? track : 0); c.restore(); return w; };
  K.wrap = (c, s, f, maxW, track = 0) => { const words = s.split(/\s+/), lines = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (K.width(c, tr, f, track) > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; } if (cur) lines.push(cur); return lines; };
  // per-glyph layout for a single line → [{ch, x}] with x relative to the line start
  K.glyphs = (c, s, f, track = 0) => { c.save(); c.font = f; c.letterSpacing = '0px'; const out = []; let x = 0; for (const ch of [...s]) { out.push({ ch, x }); x += c.measureText(ch).width + track; } c.restore(); return { g: out, w: x - track }; };
  // Animated text. mode: 'fade' | 'rise' | 'blur' | 'type' | 'wipe' | 'scale' | 'track'. k 0..1 overall progress
  // (1 = fully shown). stagger is the fraction of the time spread across letters.
  K.reveal = (c, s, x, y, o) => {
    const { font, color = '#fff', track = 0, align = 'left', k = 1, mode = 'rise', stagger = .6, dist = 24, by = 'char', shadow } = o;
    const base = c.globalAlpha, L = K.glyphs(c, s, font, track); const x0 = align === 'center' ? x - L.w / 2 : align === 'right' ? x - L.w : x;
    c.save(); c.font = font; c.fillStyle = color; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.letterSpacing = '0px';
    if (shadow) { c.shadowColor = shadow[0]; c.shadowBlur = shadow[1]; c.shadowOffsetY = shadow[2] || 0; }
    if (mode === 'wipe') { c.beginPath(); c.rect(x0 - 40, y - 400, (L.w + 80) * E.io(K.clamp(k)), 800); c.clip(); c.fillText(s, x0, y); c.letterSpacing = track + 'px'; c.restore(); return L.w; }
    let units = L.g.map((q, i) => ({ ...q, i }));
    if (by === 'word') { const words = []; let cur = null; units.forEach(u => { if (u.ch === ' ') { cur = null; return; } if (!cur) { cur = { ch: '', x: u.x, i: words.length }; words.push(cur); } cur.ch += u.ch; }); units = words; }
    const n = units.length;
    for (const u of units) {
      const a = n > 1 ? u.i / (n - 1) * stagger : 0, kk = K.clamp((k * (1 + stagger) - a) / 1);
      if (mode === 'type') { if (k * n >= u.i + 1 || k >= 1) c.fillText(u.ch, x0 + u.x, y); continue; }
      const e = E.out(kk); if (e <= 0) continue;
      c.globalAlpha = base * e * (o.alpha ?? 1);
      if (mode === 'rise') c.fillText(u.ch, x0 + u.x, y + (1 - e) * dist);
      else if (mode === 'fade') c.fillText(u.ch, x0 + u.x, y);
      else if (mode === 'blur') { c.filter = `blur(${(1 - e) * 10}px)`; c.fillText(u.ch, x0 + u.x, y); c.filter = 'none'; }
      else if (mode === 'scale') { c.save(); c.translate(x0 + u.x, y); const s2 = .6 + .4 * E.outBack(kk); c.scale(s2, s2); c.fillText(u.ch, 0, 0); c.restore(); }
      else if (mode === 'track') c.fillText(u.ch, x0 + u.x * K.mix(1.35, 1, e), y);
    }
    c.restore(); return L.w;
  };
  // a paragraph block with per-line reveal
  K.para = (c, lines, x, y, lh, o, k) => lines.forEach((ln, i) => K.reveal(c, ln, x, y + i * lh, { ...o, k: K.clamp(k * (lines.length * .35 + 1) - i * .35) }));

  // ---------- textures (seeded, cached offscreen canvases) ----------
  const cache = new Map();
  K.cached = (key, w, h, fn) => { if (cache.has(key)) return cache.get(key); const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); cache.set(key, cv); return cv; };
  K.noiseTex = (w, h, seed, fn) => K.cached(`n${w}x${h}s${seed}${fn}`, w, h, (c) => { const d = c.createImageData(w, h); const R = K.rand(seed); for (let i = 0; i < w * h; i++) { const v = fn ? fn(i % w, (i / w) | 0, R) : R(); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v * 255; d.data[i * 4 + 3] = 255; } c.putImageData(d, 0, 0); });
  // warm paper: fibres + blotches, tinted with base colour
  K.paper = (w, h, seed = 1, base = '#f3ecdf', o = {}) => K.cached(`paper${w}x${h}${seed}${base}${JSON.stringify(o)}`, w, h, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const s = 4, sw = Math.ceil(w / s), sh = Math.ceil(h / s), d = c.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) { const v = K.fbm(x / 60, y / 60, seed, 5) * .6 + K.noise(x / 6, y / 6, seed + 3) * .4; const i = (y * sw + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v * 255; d.data[i + 3] = 255; }
    const tmp = document.createElement('canvas'); tmp.width = sw; tmp.height = sh; tmp.getContext('2d').putImageData(d, 0, 0);
    c.globalCompositeOperation = 'soft-light'; c.globalAlpha = o.blot ?? .55; c.imageSmoothingQuality = 'high'; c.drawImage(tmp, 0, 0, w, h);
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = 1; const R = K.rand(seed + 9);
    for (let i = 0; i < (o.fibres ?? w * h / 900); i++) { const x = R() * w, y = R() * h, a = R() * TAU, l = 4 + R() * 18; c.strokeStyle = `rgba(90,70,40,${.03 + R() * .05})`; c.lineWidth = .6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * .5 + (R() - .5) * 6, y + Math.sin(a) * l * .5 + (R() - .5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
  });
  // film grain overlay; changes each frame but deterministically (seeded by frame index)
  K.grain = (c, t, amt = .05, fps = 30) => { const f = Math.round(t * fps) % 8; const g = K.noiseTex(512, 512, 1000 + f); c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = amt; const pat = c.createPattern(g, 'repeat'); c.fillStyle = pat; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); };
  K.vignette = (c, amt = .35, col = '0,0,0') => { const w = c.canvas.width, h = c.canvas.height, g = c.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, h * .95); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${amt})`); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  // soft watercolour bloom: a blob that spreads with edge darkening; seed makes each different. k 0..1 spread
  K.wash = (c, x, y, r, col, k = 1, seed = 1, o = {}) => {
    if (k <= 0) return; const R = K.rand(seed), n = 80, rad = r * E.out(k);
    const pts = Array.from({ length: n }, (_, i) => { const a = i / n * TAU, v = .72 + .5 * K.fbm(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3, seed, 3) + .08 * K.noise(i * .9, 0, seed); return [x + Math.cos(a) * rad * v * (o.sx || 1), y + Math.sin(a) * rad * v * (o.sy || 1)]; });
    c.save(); c.globalCompositeOperation = o.blend || 'multiply';
    for (let layer = 0; layer < 4; layer++) { c.globalAlpha = (o.alpha ?? .28) * (1 - layer * .18); c.filter = `blur(${2 + layer * 4}px)`; c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => { const q = 1 - layer * .06 - R() * .02; const X = x + (px - x) * q, Y = y + (py - y) * q; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.fill(); }
    c.filter = 'none'; c.globalAlpha = (o.edge ?? .35); c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.filter = 'blur(1.2px)'; c.stroke();
    c.restore();
  };

  // ---------- template registry & page contract ----------
  let T = null, P = null, cv, c;
  K.template = def => { T = def; };
  const qs = new URLSearchParams(location.search);
  window.ready = async () => {
    if (!T) throw Error('no template registered');
    P = Object.assign({}, T.params || {}, JSON.parse(qs.get('p') || '{}'));
    const [w, h] = (P.size || T.size || [1920, 1080]);
    cv = document.getElementById('c'); cv.width = w; cv.height = h; K.W = w; K.H = h; c = cv.getContext('2d', { alpha: true });
    await Promise.all((T.fonts || []).map(f => document.fonts.load(f).catch(() => null)));
    await document.fonts.ready;
    if (T.setup) await T.setup(c, P);
    K.W = w; K.H = h; return true;
  };
  window.audit = () => ({ id: T.id, fps: T.fps || 30, dur: P.dur || T.dur, frames: Math.ceil((P.dur || T.dur) * (T.fps || 30)), alpha: !!(P.alpha ?? T.alpha), size: [cv.width, cv.height], title: T.title, style: T.style, type: T.type });
  window.frame = t => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, cv.width, cv.height); c.save(); T.draw(c, t, P); c.restore(); };
  window.snap = t => { window.frame(t); return cv.toDataURL('image/png'); };
  K.params = () => P;
})();
