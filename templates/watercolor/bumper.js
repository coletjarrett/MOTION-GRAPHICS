// WATERCOLOUR — program bumper. On cold-press paper, soft pigment washes bloom outward, bleed into one another
// and dry with darker edges; then the title soaks in like ink on damp paper. Everything lifts back to clean paper.
(() => {
  // ---------- watercolour helpers (self-contained; each pack file carries its own copy) ----------
  // cold-press tooth: an emboss map (overlay) and a granulation map (alpha, pigment settles in the hollows)
  const tooth = (w, h, seed) => {
    const key = `wc-tooth${w}x${h}s${seed}`;
    const hf = () => { if (tooth[key]) return tooth[key]; const H = new Float32Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) H[y * w + x] = .5 * K.noise(x / 4.2, y / 4.2, seed) + .3 * K.noise(x / 9, y / 9, seed + 1) + .2 * K.hash(x, y, seed + 2);
      return (tooth[key] = H); };
    const emboss = K.cached(key + 'e', w, h, (c) => { const H = hf(), d = c.createImageData(w, h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x, v = K.clamp(.5 + (H[i - w - 1] - H[i + w + 1]) * 1.6), j = i * 4; d.data[j] = d.data[j + 1] = d.data[j + 2] = v * 255; d.data[j + 3] = 255; }
      c.putImageData(d, 0, 0); });
    const gran = K.cached(key + 'g', w, h, (c) => { const H = hf(), d = c.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, m = K.fbm(x / 170, y / 170, seed + 5, 3), a = K.clamp(.8 + (.5 - H[i]) * .34 + (m - .5) * .75, .35, 1), j = i * 4; d.data[j] = d.data[j + 1] = d.data[j + 2] = 255; d.data[j + 3] = a * 255; }
      c.putImageData(d, 0, 0); });
    return { emboss, gran };
  };
  // an irregular blob whose rim creeps outward at different speeds per direction (the bleed), k 0..1
  const blob = (o, k) => {
    const n = 150, pts = [], s = o.seed, rough = o.rough ?? 1;
    for (let i = 0; i < n; i++) {
      const a = i / n * K.TAU, ca = Math.cos(a), sa = Math.sin(a);
      const v = .74 + .4 * K.fbm(ca * 1.1 + s, sa * 1.1, s, 2) + .2 * (K.fbm(ca * 2.8 + s, sa * 2.8, s + 5, 2) - .5) + .05 * rough * (K.fbm(ca * 7 + s, sa * 7, s + 3, 2) - .5);
      const speed = .5 + .5 * K.noise(ca * 1.6 + 9, sa * 1.6, s + 7);
      const kk = K.ease.out(K.clamp(k / speed));
      const creep = 1 + .06 * (K.noise(ca * 3 + k * 2.5, sa * 3, s + 11) - .5) * (1 - k);
      const r = o.r * v * kk * creep, rot = o.rot || 0, px = ca * r * (o.sx || 1), py = sa * r * (o.sy || 1);
      pts.push([o.x + px * Math.cos(rot) - py * Math.sin(rot), o.y + px * Math.sin(rot) + py * Math.cos(rot)]);
    }
    return pts;
  };
  const path = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  const bbox = (pts, m, W, H) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    x0 = Math.max(0, Math.floor(x0 - m)); y0 = Math.max(0, Math.floor(y0 - m)); x1 = Math.min(W, Math.ceil(x1 + m)); y1 = Math.min(H, Math.ceil(y1 + m)); return [x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)]; };
  // paint one wash into the offscreen `oc`, then composite onto c.
  // o: {x,y,r,sx,sy,rot,col,alpha,seed, soft 0..1 (wet-in-wet, no rim), pool [dx,dy] (where pigment gathers), back (backruns)}
  const wash = (c, oc, gran, o, k, fade = 1, blend = 'multiply') => {
    if (k <= 0 || fade <= 0) return; const W = oc.canvas.width, H = oc.canvas.height, pts = blob(o, k), soft = o.soft || 0;
    const [bx, by, bw, bh] = bbox(pts, 40 + soft * 60, W, H);
    oc.save(); oc.globalCompositeOperation = 'source-over'; oc.clearRect(bx, by, bw, bh);
    const wet = 1 - K.ease.out(K.clamp(k * 1.1)), R = o.r * Math.max(o.sx || 1, o.sy || 1) * K.ease.out(K.clamp(k * 1.3));
    const pool = o.pool || [.3, .25], gx = o.x + pool[0] * R, gy = o.y + pool[1] * R;
    // body: lighter where the water was thickest, denser toward the side the pigment drifted to and at the rim
    const g = oc.createRadialGradient(gx, gy, 0, o.x, o.y, Math.max(1, R * 1.05));
    g.addColorStop(0, K.rgba(o.col, o.alpha * 1.0)); g.addColorStop(.45, K.rgba(o.col, o.alpha * .62)); g.addColorStop(1, K.rgba(o.col, o.alpha * .9));
    oc.filter = `blur(${2 + wet * 10 + soft * 26}px)`; oc.fillStyle = g; path(oc, pts); oc.fill();
    if (o.col2) { // wet-in-wet: a second pigment dropped into one end, bleeding across into the first
      const ca = Math.cos(o.rot || 0), sa = Math.sin(o.rot || 0), L = R * .95, lg = oc.createLinearGradient(o.x - ca * L, o.y - sa * L, o.x + ca * L, o.y + sa * L);
      lg.addColorStop(0, K.rgba(o.col2, 0)); lg.addColorStop(.38, K.rgba(o.col2, 0)); lg.addColorStop(.72, K.rgba(o.col2, .7)); lg.addColorStop(1, K.rgba(o.col2, .92));
      oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = lg; oc.fillRect(bx, by, bw, bh); oc.globalCompositeOperation = 'source-over'; }
    if (soft < 1) {
      // pooled pigment at the drying rim: a soft band and a fine hard line
      oc.filter = `blur(${2 + wet * 5}px)`; oc.globalAlpha = .55 * (1 - soft) * K.clamp(k * 1.2); oc.strokeStyle = K.rgba(o.col, o.alpha); oc.lineWidth = 6; path(oc, pts); oc.stroke();
      oc.filter = 'blur(.7px)'; oc.globalAlpha = .7 * (1 - soft) * K.clamp(k * 1.3 - .2); oc.lineWidth = 1.6; oc.stroke(); oc.globalAlpha = 1;
    }
    // backruns: lighter cauliflower blooms with a faint rim, once the wash has partly settled
    if (o.back && k > .5) { const Rr = K.rand(o.seed + 31);
      for (let b = 0; b < o.back; b++) { const bx2 = o.x + (Rr() - .5) * o.r * (o.sx || 1) * .8, by2 = o.y + (Rr() - .5) * o.r * (o.sy || 1) * .7, bk = K.clamp((k - .5) / .5 - b * .12);
        const bp = blob({ x: bx2, y: by2, r: o.r * (.14 + Rr() * .1), seed: o.seed * 7 + b, rough: 3 }, bk);
        oc.globalCompositeOperation = 'destination-out'; oc.filter = 'blur(5px)'; oc.globalAlpha = .24; oc.fillStyle = '#000'; path(oc, bp); oc.fill();
        oc.globalCompositeOperation = 'source-over'; oc.filter = 'blur(1.2px)'; oc.globalAlpha = .5; oc.strokeStyle = K.rgba(o.col, o.alpha); oc.lineWidth = 2; path(oc, bp); oc.stroke(); oc.globalAlpha = 1; } }
    oc.filter = 'none'; oc.globalCompositeOperation = 'destination-in'; oc.drawImage(gran, bx, by, bw, bh, bx, by, bw, bh);
    oc.restore();
    c.save(); c.globalCompositeOperation = blend; c.globalAlpha = fade; c.drawImage(oc.canvas, bx, by, bw, bh, bx, by, bw, bh); c.restore();
  };
  // ink soaking into damp paper, word by word: a feathered bleed arrives first, the crisp letterform settles through it
  const soak = (c, s, x, y, f, col, k, o = {}) => {
    if (k <= 0) return; const track = o.track || 0, align = o.align || 'center', st = o.stagger ?? .5, a = o.alpha ?? 1;
    if (a <= 0) return;
    const w = K.width(c, s, f, track), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const words = s.split(' '); let acc = '';
    c.save(); K.setText(c, f, col, track, 'left'); c.globalCompositeOperation = o.blend || 'multiply';
    words.forEach((wd, i) => {
      const xo = acc ? K.width(c, acc + ' ', f, track) + (track || 0) : 0; acc = acc ? acc + ' ' + wd : wd;
      const n = words.length, ki = K.clamp(k * (1 + st) - (n > 1 ? i / (n - 1) * st : 0)); if (ki <= 0) return;
      const e = K.ease.out(ki);
      c.filter = `blur(${3 + 10 * (1 - e)}px)`; c.globalAlpha = .22 * a * K.clamp(ki * 2.5); c.fillText(wd, x0 + xo, y);   // bleed halo
      c.filter = `blur(${5 * Math.pow(1 - e, 1.5) + .3}px)`; c.globalAlpha = a * K.ease.io(K.clamp(ki * 1.15)); c.fillText(wd, x0 + xo, y); // ink
    });
    c.restore();
  };
  window.__WC = { tooth, blob, path, wash, soak };
})();

K.template({ id: 'watercolor-bumper', title: 'Program bumper', style: 'Watercolor', type: 'Bumper / open', dur: 8, alpha: false,
  fonts: ['italic 500 128px GB', 'italic 400 128px GB', '400 40px Cochin', 'italic 400 40px Cochin'],
  params: { title: 'Walking With God', sub: 'A Study of Genesis 5', paper: '#f5efe3', ink: '#2e2a33', subInk: '#6d5641',
    colors: ['#e6bd6e', '#5a8fd0', '#9db266', '#dc938c', '#5876a8'] },
  setup(c, p) {
    const W = c.canvas.width, H = c.canvas.height, WC = window.__WC;
    this.paper = K.paper(W, H, 7, p.paper, { blot: .3 }); this.tx = WC.tooth(W, H, 3);
    const mk = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv.getContext('2d'); };
    this.oc = mk();
    const s = W / 1920, C = p.colors;
    // wash layout: a warm field under the title with cooler blooms bleeding in from the corners
    this.washes = [
      { x: 960 * s, y: 545 * s, r: 600 * s, sx: 1.45, sy: .62, col: C[0], alpha: .42, seed: 11, t0: .1, t1: 2.8, soft: 1, pool: [-.2, .3] },
      { x: 640 * s, y: 395 * s, r: 330 * s, sx: 1.55, sy: .72, rot: -.16, col: C[1], col2: C[3], alpha: .5, seed: 23, t0: .5, t1: 3.2, back: 1, pool: [-.35, -.3] },
      { x: 1320 * s, y: 705 * s, r: 330 * s, sx: 1.6, sy: .66, rot: .1, col: C[2], col2: C[0], alpha: .48, seed: 37, t0: .85, t1: 3.5, back: 1, pool: [.35, .3], soft: .35 },
      { x: 1460 * s, y: 345 * s, r: 185 * s, sx: 1.3, sy: .85, rot: .3, col: C[3], alpha: .4, seed: 41, t0: 1.2, t1: 3.7, pool: [.3, -.3] },
      { x: 500 * s, y: 740 * s, r: 195 * s, sx: 1.35, sy: .78, rot: -.1, col: C[4], alpha: .42, seed: 53, t0: 1.45, t1: 3.9, pool: [-.3, .3] },
    ];
    // a few flicked drops of pigment around the edges of the painting
    const R = K.rand(77);
    for (let i = 0; i < 6; i++) { const a = (i + R() * .6) / 6 * K.TAU + .4, d = 1.02 + R() * .12; const w = this.washes[1 + (i % 4)];
      this.washes.push({ x: 960 * s + Math.cos(a) * 820 * s * d, y: 545 * s + Math.sin(a) * 360 * s * d, r: (3 + R() * 7) * s, col: w.col, alpha: .5, seed: 100 + i, t0: 1.1 + R() * 1.6, t1: 0, rough: 2, pool: [0, 0] });
      const q = this.washes[this.washes.length - 1]; q.t1 = q.t0 + .5; }
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, WC = window.__WC, cx = W / 2, cy = H / 2;
    c.drawImage(this.paper, 0, 0);
    // everything lifts back to clean paper at the end
    const lift = 1 - K.E(t, 6.75, 7.75, 'io');
    this.washes.forEach(o => WC.wash(c, this.oc, this.tx.gran, o, K.P(t, o.t0, o.t1), lift));
    // title and subtitle soak in, then fade out (slightly ahead of the washes)
    const tOut = 1 - K.E(t, 6.4, 7.2, 'in');
    const fT = K.font(128, 'GB', 500, 'italic'), fS = K.font(40, 'Cochin', 400);
    WC.soak(c, p.title, cx, cy + 10, fT, p.ink, K.P(t, 2.1, 3.9), { alpha: tOut, track: .5 });
    // a short dry-brush dash between title and subtitle
    const dk = K.E(t, 3.1, 3.9, 'io');
    if (dk > 0 && tOut > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .75 * tOut; c.strokeStyle = p.subInk; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) { c.lineWidth = 2.2 - i * .5; const yy = cy + 62 + i * 1.6, x0 = cx - 46, x1 = cx - 46 + 92 * dk; c.beginPath(); c.moveTo(x0, yy); for (let x = x0; x <= x1; x += 6) c.lineTo(x, yy + (K.noise(x * .05, i, 4) - .5) * 2.4); c.stroke(); }
      c.restore(); }
    WC.soak(c, p.sub.toUpperCase(), cx, cy + 124, fS, p.subInk, K.P(t, 3.3, 4.8), { alpha: tOut * .95, track: 7, stagger: .3 });
    // paper tooth over everything so pigment and ink sit in the sheet
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .22; c.drawImage(this.tx.emboss, 0, 0); c.restore();
    K.vignette(c, .12, '90,70,40');
  } });
