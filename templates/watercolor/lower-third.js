// WATERCOLOUR — lower third. A translucent indigo wash is brushed out behind the name: pigment mottles and
// granulates, pools darker at the rim, a warm second colour bleeds into its tail and a small backrun blooms. The
// name soaks in; at the end the swatch is lifted off left-to-right. Legible over any footage (cream type on a
// ~80% wash).
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

K.template({ id: 'watercolor-lower-third', title: 'Lower third', style: 'Watercolor', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['italic 500 64px GB', '400 31px Cochin'],
  params: { name: 'Lucía Fernández', role: 'Sign-language translator, Mexico', x: 150, y: 866,
    wash: '#33425a', light: '#6f93bd', rim: '#1d2638', warm: '#c99a5c', opacity: .84, ink: '#fbf6ec', roleInk: '#ead7ae' },
  setup(c, p) {
    const W = c.canvas.width, H = c.canvas.height, WC = window.__WC;
    this.tx = WC.tooth(W, H, 8);
    // soft mottling (where the water carried more pigment), generated at quarter resolution
    const mottle = K.cached('wc-l3-mottle', W, H, (q) => {
      const w2 = W / 4 | 0, h2 = H / 4 | 0, d = q.createImageData(w2, h2);
      for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) { const v = K.fbm(x / 20, y / 12, 21, 4), j = (y * w2 + x) * 4; d.data[j] = d.data[j + 1] = d.data[j + 2] = 255; d.data[j + 3] = K.clamp((v - .42) * 1.9) * 255; }
      const tmp = document.createElement('canvas'); tmp.width = w2; tmp.height = h2; tmp.getContext('2d').putImageData(d, 0, 0);
      q.imageSmoothingQuality = 'high'; q.drawImage(tmp, 0, 0, W, H); });
    const tint = (src, col, key) => K.cached(key + col, W, H, (q) => { q.drawImage(src, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = col; q.fillRect(0, 0, W, H); });
    this.mot = tint(mottle, p.light, 'wc-l3-mot'); this.grn = tint(this.tx.gran, p.rim, 'wc-l3-grn');
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; this.oc = cv.getContext('2d');
  },
  draw(c, t, p) {
    const WC = window.__WC, oc = this.oc, W = K.W, H = K.H;
    const fN = K.font(64, 'GB', 500, 'italic'), fR = K.font(31, 'Cochin', 400);
    const wN = K.width(c, p.name, fN, .3), wR = K.width(c, p.role, fR, 1.2);
    const padL = 72, padR = 96, x0 = p.x, tx = x0 + padL, w = Math.max(wN, wR) + padL + padR, top = p.y - 104, h = 176;
    const k = K.E(t, .1, 1.15, 'out'), dry = K.E(t, 5.8, 6.65, 'io'), tOut = 1 - K.E(t, 5.45, 6.05, 'in');
    if (k <= 0 || dry >= 1) return;
    // the swatch: one broad brush stroke whose wet head advances to the right and ends in a ragged, dry-brush
    // tail; lifted off left-to-right at the end
    const S = 7, cap = h * .5, xl = x0 + (w - cap) * dry, xr = x0 + w * k, nb = 26, pts = [];
    const edge = (x, side) => (K.noise(x * .005, side, S) - .5) * 16 + (K.noise(x * .02, side + 4, S) - .5) * 4;
    const xe = j => xr - cap * .35 + (K.noise(j * .45, 5, S) - .5) * 64 * K.clamp(k * 1.5 - .2);
    for (let x = xl + cap * .4; x <= xe(0); x += 8) pts.push([x, top + edge(x, 0)]);
    for (let j = 0; j <= nb; j++) pts.push([xe(j), top + j / nb * h + (j === 0 ? edge(xe(0), 0) : j === nb ? edge(xe(nb), 1) : 0)]);
    for (let x = xe(nb); x >= xl + cap * .4; x -= 8) pts.push([x, top + h + edge(x, 1)]);
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + i / 16 * Math.PI, rr = cap * (.46 + .22 * K.noise(i * .35, 3, S)); pts.push([xl + cap * .4 + Math.cos(a) * rr, top + h / 2 + Math.sin(a) * h / 2 + (i === 0 ? edge(xl, 1) : i === 16 ? edge(xl, 0) : 0)]); }
    const bb = [Math.max(0, x0 - 60), Math.max(0, top - 60), Math.min(W, w + 320), Math.min(H - Math.max(0, top - 60), h + 120)];
    const wet = 1 - k, R0 = 33;
    const shape = (col, blur) => {
      oc.filter = `blur(${blur}px)`; oc.fillStyle = col; WC.path(oc, pts); oc.fill();
      // dry-brush bristle streaks running out of the tail
      const R = K.rand(R0), nS = 30; oc.lineCap = 'round';
      for (let i = 0; i < nS; i++) { const yy = top + 6 + (h - 12) * (i + .5) / nS + (R() - .5) * 5, L = (14 + R() * R() * 110) * K.clamp(k * 1.25 - .25), lw = 1.2 + R() * 3.5, skip = R() < .35;
        const j = Math.round((yy - top) / h * nb), xa = xe(K.clamp(j, 0, nb)) - 10; if (skip || L < 2) continue;
        const sg = oc.createLinearGradient(xa, 0, xa + L, 0); sg.addColorStop(0, col); sg.addColorStop(.35, col); sg.addColorStop(1, 'rgba(0,0,0,0)');
        oc.strokeStyle = sg; oc.lineWidth = lw; oc.beginPath(); oc.moveTo(xa, yy); oc.quadraticCurveTo(xa + L * .5, yy + (R() - .5) * 4, xa + L, yy + (R() - .5) * 5); oc.stroke(); }
    };
    oc.save(); oc.clearRect(...bb);
    // 1) the rim colour fills the stroke, 2) a blurred copy of the same stroke in the body colour covers all but
    // a soft band at the edge — that band is the pigment that pooled as the wash dried
    shape(p.rim, 1 + wet * 5 + dry * 6);
    oc.globalCompositeOperation = 'source-atop'; shape(p.wash, 5 + wet * 6);
    // bottom-heavy pooling where the water ran
    const bl = oc.createLinearGradient(0, top + h - 50, 0, top + h + 8); bl.addColorStop(0, K.rgba(p.rim, 0)); bl.addColorStop(1, K.rgba(p.rim, .5)); oc.fillStyle = bl; oc.filter = 'none'; oc.fillRect(...bb);
    oc.globalAlpha = .5; oc.drawImage(this.mot, ...bb, ...bb);   // lighter mottling
    oc.globalAlpha = .35; oc.drawImage(this.grn, ...bb, ...bb);  // granulation settling in the paper tooth
    oc.globalAlpha = 1;
    // wet-in-wet: a lighter charge at the head and a warm colour bleeding into the tail
    const dab = K.E(t, .25, 1.9, 'out');
    if (dab > 0) { const lg = oc.createLinearGradient(x0, 0, x0 + w * (.1 + .25 * dab), 0); lg.addColorStop(0, K.rgba(p.light, .4)); lg.addColorStop(1, K.rgba(p.light, 0));
      oc.filter = 'blur(6px)'; oc.fillStyle = lg; oc.fillRect(...bb);
      const lg2 = oc.createLinearGradient(x0 + w + 40, 0, x0 + w * (.78 - .2 * dab), 0); lg2.addColorStop(0, K.rgba(p.warm, .42)); lg2.addColorStop(1, K.rgba(p.warm, 0)); oc.fillStyle = lg2; oc.fillRect(...bb); }
    oc.restore();
    // translucent: the whole wash sits at ~80% so footage glows faintly through
    c.save(); c.globalAlpha = p.opacity * (1 - K.ease.in(dry)); c.drawImage(oc.canvas, ...bb, ...bb); c.restore();
    // type: the name soaks in, then the role
    WC.soak(c, p.name, tx, p.y - 8, fN, p.ink, K.P(t, .45, 1.45), { align: 'left', track: .3, alpha: tOut, blend: 'source-over', stagger: .4 });
    WC.soak(c, p.role, tx + 2, p.y + 42, fR, p.roleInk, K.P(t, .8, 1.8), { align: 'left', track: 1.2, alpha: tOut, blend: 'source-over', stagger: .5 });
  } });
