// ARCHIVAL — lower third. Two torn paper strips are taped on at a slight tilt; the name and role type on
// with a typewriter caret, then the strips slide away. Transparent background; fully clear on the last frame.
(() => {
  // ---------- archival kit (self-contained; all static surfaces are rendered once and cached) ----------
  const SEP = { ink: '#2b2118', ink2: '#4a3a2a', red: '#9a3b2c', blue: '#6f8aa6', manila: '#d6b479', card: '#efe3c6', desk: '#2a1f16' };
  // aged sheet: paper fibres + burnt edges + a few foxing spots
  const aged = (key, w, h, base, seed, o = {}) => K.cached(`arcAged|${key}|${w}x${h}|${base}|${seed}`, w, h, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h); c.filter = 'blur(2px)'; c.drawImage(K.paper(w, h, seed, base, { blot: .5 }), 0, 0); c.filter = 'none';
    const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.hypot(w, h) * .56);
    g.addColorStop(0, 'rgba(120,80,30,0)'); g.addColorStop(1, `rgba(120,80,30,${o.burn ?? .28})`);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, w, h);
    const R = K.rand(seed + 31);
    for (let i = 0; i < (o.fox ?? 6); i++) { const x = R() * w, y = R() * h, r = 3 + R() * 14, fg = c.createRadialGradient(x, y, 0, x, y, r);
      fg.addColorStop(0, `rgba(140,90,40,${.10 + R() * .12})`); fg.addColorStop(1, 'rgba(140,90,40,0)'); c.fillStyle = fg; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = 'rgba(90,60,30,.18)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
  });
  // index card face with ruled lines
  const indexCard = (w, h, seed) => K.cached(`arcCard|${w}x${h}|${seed}`, w, h, (c) => {
    c.drawImage(aged('card', w, h, SEP.card, seed, { burn: .22, fox: 5 }), 0, 0);
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = K.rgba(SEP.red, .55); c.fillRect(0, 96, w, 2.5);
    c.fillStyle = K.rgba(SEP.blue, .35); for (let y = 96 + 56; y < h - 20; y += 56) c.fillRect(0, y, w, 1.6);
    c.globalCompositeOperation = 'source-over';
  });
  // sepia placeholder photo: gradient + soft shapes + grain, white print border, labelled "photo"
  const photo = (w, h, seed, label = 'photo') => K.cached(`arcPhoto|${w}x${h}|${seed}|${label}`, w, h, (c) => {
    c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h);
    const b = 22, iw = w - b * 2, ih = h - b * 2;
    const g = c.createLinearGradient(0, b, 0, b + ih); g.addColorStop(0, '#b89a74'); g.addColorStop(.55, '#8d6f4e'); g.addColorStop(1, '#5d4632');
    c.fillStyle = g; c.fillRect(b, b, iw, ih);
    c.save(); c.beginPath(); c.rect(b, b, iw, ih); c.clip();
    const R = K.rand(seed); c.filter = 'blur(14px)';
    c.fillStyle = 'rgba(236,220,190,.55)'; c.beginPath(); c.ellipse(b + iw * (.3 + R() * .4), b + ih * .3, iw * .35, ih * .22, 0, 0, K.TAU); c.fill();
    for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(${70 - k * 12},${50 - k * 9},${32 - k * 6},${.35 + k * .15})`; c.beginPath(); c.moveTo(b, b + ih); for (let x = 0; x <= iw; x += 20) c.lineTo(b + x, b + ih * (.55 + k * .12) + Math.sin(x / iw * (3 + k) + R() * 6) * ih * .06); c.lineTo(b + iw, b + ih); c.closePath(); c.fill(); }
    c.filter = 'none';
    c.globalCompositeOperation = 'overlay'; c.globalAlpha = .16; c.fillStyle = c.createPattern(K.noiseTex(256, 256, seed + 40), 'repeat'); c.fillRect(b, b, iw, ih);
    c.globalAlpha = 1; c.globalCompositeOperation = 'multiply';
    const v = c.createRadialGradient(w / 2, h / 2, ih * .2, w / 2, h / 2, Math.hypot(iw, ih) * .6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,40,20,.55)'); c.fillStyle = v; c.fillRect(b, b, iw, ih);
    c.restore();
    c.globalCompositeOperation = 'multiply'; c.drawImage(K.paper(w, h, seed + 3, '#ffffff', { blot: .4 }), 0, 0); c.globalCompositeOperation = 'source-over';
    K.setText(c, K.font(20, 'Courier New', 700), 'rgba(245,235,215,.85)', 4, 'right'); c.fillText(label.toUpperCase(), w - b - 34, h - b - 34);
    c.strokeStyle = 'rgba(245,235,215,.45)'; c.lineWidth = 1.5; c.setLineDash([6, 6]); c.strokeRect(b + 18, b + 18, iw - 36, ih - 36); c.setLineDash([]);
  });
  // black photo corners (paper triangles)
  const corners = (c, x, y, w, h, s = 46) => {
    c.save(); c.fillStyle = '#231a13'; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 4; c.shadowOffsetY = 2;
    [[x, y, 1, 1], [x + w, y, -1, 1], [x + w, y + h, -1, -1], [x, y + h, 1, -1]].forEach(([X, Y, sx, sy]) => {
      c.beginPath(); c.moveTo(X - sx * 8, Y - sy * 8); c.lineTo(X + sx * s, Y - sy * 8); c.lineTo(X - sx * 8, Y + sy * s); c.closePath(); c.fill(); });
    c.restore();
  };
  // a steel paper clip, long axis vertical, top at (0,0)
  const clip = (c, x, y, rot = 0, s = 1) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const p = new Path2D(); p.moveTo(8, 30); p.lineTo(8, 110); p.arc(0, 110, 8, 0, Math.PI); p.lineTo(-8, 18); p.arc(4, 18, 12, Math.PI, 0); p.lineTo(16, 122); p.arc(0, 122, 16, 0, Math.PI); p.lineTo(-16, 40);

    c.lineCap = 'round'; c.lineJoin = 'round';
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 5; c.shadowOffsetX = 3; c.shadowOffsetY = 4;
    c.strokeStyle = '#8c8f92'; c.lineWidth = 5.5; c.stroke(p);
    c.shadowColor = 'transparent'; c.strokeStyle = 'rgba(235,238,240,.75)'; c.lineWidth = 1.6; c.translate(-1, -1); c.stroke(p);
    c.restore();
  };
  // typewriter text: per-glyph ink density + baseline wobble, optional caret. n = characters shown (float)
  const typed = (c, s, x, y, font, col, n, seed, o = {}) => {
    const L = K.glyphs(c, s, font, o.track || 0), x0 = o.align === 'center' ? x - L.w / 2 : o.align === 'right' ? x - L.w : x;
    c.save(); c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.letterSpacing = '0px'; c.fillStyle = col;
    const base = c.globalAlpha, shown = Math.floor(n);
    for (let i = 0; i < Math.min(shown, L.g.length); i++) { const g = L.g[i]; if (g.ch === ' ') continue;
      const h = K.hash(i, 3, seed), dy = (K.hash(i, 5, seed) - .5) * 2.2, fresh = K.clamp(1 - (n - i - 1) * 2.5);
      c.globalAlpha = base * (.74 + .26 * h); c.fillText(g.ch, x0 + g.x, y + dy);
      if (fresh > 0 || h > .7) { c.globalAlpha = base * (.18 + .25 * fresh); c.fillText(g.ch, x0 + g.x + .7, y + dy + .5); } }
    if (o.caret && o.caret > 0) { const cx = x0 + (shown >= L.g.length ? L.w + 6 : (L.g[shown] ? L.g[shown].x : L.w)); const sz = parseFloat(font.match(/(\d+)px/)[1]);
      c.globalAlpha = base * o.caret; c.fillRect(cx, y + sz * .12, sz * .52, Math.max(2, sz * .07)); }
    c.restore(); return L.w;
  };
  // rubber stamp, rendered once with a distressed ink mask
  const stamp = (lines, col, seed) => K.cached(`arcStamp|${lines.join('|')}|${col}|${seed}`, 560, 260, (c, w, h) => {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 7; K.rr(c, 14, 14, w - 28, h - 28, 22); c.stroke(); c.lineWidth = 2.5; K.rr(c, 30, 30, w - 60, h - 60, 12); c.stroke();
    K.setText(c, K.font(64, 'American Typewriter', 700), col, 10, 'center'); c.fillText(lines[0], w / 2 + 5, 128);
    c.fillRect(70, 150, w - 140, 3);
    K.setText(c, K.font(40, 'Courier New', 700), col, 6, 'center'); c.fillText(lines[1], w / 2 + 3, 205);
    // distress: knock out speckles and a few worn patches
    c.globalCompositeOperation = 'destination-out'; const R = K.rand(seed);
    for (let i = 0; i < 2600; i++) { c.globalAlpha = .3 + R() * .7; c.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2.5); }
    c.filter = 'blur(10px)'; for (let i = 0; i < 7; i++) { c.globalAlpha = .25 + R() * .3; c.beginPath(); c.ellipse(R() * w, R() * h, 30 + R() * 60, 12 + R() * 20, R() * 3, 0, K.TAU); c.fill(); }
    c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  });
  // very gentle deterministic film flicker, dust and grain
  const film = (c, t, amt = 1) => {
    const W = K.W, H = K.H, f = Math.round(t * 24);
    const fl = (K.noise(t * 7, 0, 11) - .5) * .045 * amt; // ±2% brightness wander
    c.save(); c.fillStyle = fl > 0 ? `rgba(255,236,200,${fl * .6})` : `rgba(20,12,6,${-fl})`; c.fillRect(0, 0, W, H);
    const R = K.rand(4000 + f); c.fillStyle = 'rgba(40,28,18,.35)';
    for (let i = 0; i < 3; i++) if (R() < .45) { const x = R() * W, y = R() * H, r = .8 + R() * 1.6; c.globalAlpha = .5 * amt; c.beginPath(); c.arc(x, y, r, 0, K.TAU); c.fill(); }
    c.restore(); K.grain(c, t, .06);
  };
  const shadowed = (c, fn, blur, oy, a) => { c.save(); c.shadowColor = `rgba(10,6,2,${a})`; c.shadowBlur = blur; c.shadowOffsetY = oy; c.shadowOffsetX = oy * .3; fn(); c.restore(); };

  // ---------- the lower third ----------
  // a torn paper strip, rendered once per size (texture, torn ends, soft contact shadow baked in)
  const strip = (w, h, seed, base) => K.cached(`arcStrip|${w}x${h}|${seed}|${base}`, w + 80, h + 80, (c) => {
    const R = K.rand(seed), pts = [], P = 40;
    for (let x = 0; x <= w; x += 24) pts.push([P + x, P + (K.noise(x / 60, 0, seed) - .5) * 3]);
    for (let y = 0; y <= h; y += 3) pts.push([P + w + (K.noise(y / 5, 1, seed) - .5) * 9 + (R() - .5) * 3, P + y]);
    for (let x = w; x >= 0; x -= 24) pts.push([P + x, P + h + (K.noise(x / 60, 2, seed) - .5) * 3]);
    for (let y = h; y >= 0; y -= 3) pts.push([P + (K.noise(y / 5, 3, seed) - .5) * 9 + (R() - .5) * 3, P + y]);
    const path = new Path2D(); pts.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y)); path.closePath();
    c.save(); c.shadowColor = 'rgba(20,12,4,.45)'; c.shadowBlur = 18; c.shadowOffsetY = 7; c.shadowOffsetX = 2; c.fillStyle = base; c.fill(path); c.restore();
    c.save(); c.clip(path); c.drawImage(aged('strip' + seed, w + 80, h + 80, base, seed, { burn: .3, fox: 3 }), 0, 0);
    c.fillStyle = 'rgba(255,248,230,.5)'; c.fillRect(0, P, w + 80, 1.5); c.restore();
  });
  // translucent masking tape with torn ends
  const tape = (seed) => K.cached(`arcTape|${seed}`, 130, 50, (c, w, h) => {
    const pth = new Path2D(); pth.moveTo(8 + K.hash(4, 1, seed) * 5, 4);
    for (let y = 4; y <= h - 4; y += 3) pth.lineTo(8 + K.hash(y, 1, seed) * 5, y);
    for (let y = h - 4; y >= 4; y -= 3) pth.lineTo(w - 8 - K.hash(y, 2, seed) * 5, y);
    pth.closePath();
    c.fillStyle = 'rgba(236,224,190,.66)'; c.fill(pth);
    c.save(); c.clip(pth); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .5; c.drawImage(K.paper(w, h, seed, '#f0e4c4', { blot: .6 }), 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, 4, w, 6); c.restore();
  });

  K.template({ id: 'archive-lower-third', title: 'Lower third', style: 'Archival', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['400 56px "American Typewriter"', '400 30px "Courier New"', '700 30px "Courier New"'],
    params: { name: 'Margaret Ellis', role: 'Historian (sample name)', x: 150, y: 790, ink: '#2b2118', paper: '#efe3c6', paper2: '#e6d6b2' },
    draw(c, t, p) {
      const fN = K.font(56, 'American Typewriter', 400), fR = K.font(30, 'Courier New', 400);
      const wN = Math.ceil(K.width(c, p.name, fN) + 88), wR = Math.ceil(K.width(c, p.role, fR) + 64), hN = 86, hR = 54;
      const x = p.x, y = p.y, outN = K.E(t, 5.75, 6.45, 'in'), outR = K.E(t, 5.6, 6.3, 'in');
      // name strip
      const kN = K.E(t, .05, .75, 'out5');
      if (kN > 0 && outN < 1) {
        c.save(); c.globalAlpha = K.clamp(kN * 1.6) * (1 - outN);
        c.translate(x + wN / 2 - (1 - kN) * 90 - outN * 70, y + hN / 2 + outN * 14); c.rotate(K.mix(-.035, -.012, kN) - outN * .02);
        c.drawImage(strip(wN, hN, 11, p.paper), -wN / 2 - 40, -hN / 2 - 40);
        typed(c, p.name, -wN / 2 + 44, 20, fN, p.ink, (t - .55) * 17, 41, { caret: t > .45 && t < 2.2 ? (Math.floor(t * 2.2) % 2 ? .85 : .2) : 0 });
        const tk = K.E(t, .45, .7, 'out');
        if (tk > 0) { c.save(); c.globalAlpha *= tk; c.translate(-wN / 2 + 8, -hN / 2 + 4); c.rotate(-.7); c.scale(K.mix(1.15, 1, tk), K.mix(1.15, 1, tk)); c.drawImage(tape(3), -65, -25); c.restore(); }
        c.restore();
      }
      // role strip, tucked slightly under and offset
      const kR = K.E(t, .35, 1.05, 'out5');
      if (kR > 0 && outR < 1) {
        c.save(); c.globalAlpha = K.clamp(kR * 1.6) * (1 - outR);
        c.translate(x + 26 + wR / 2 - (1 - kR) * 70 - outR * 60, y + hN + 8 + hR / 2 + outR * 10); c.rotate(K.mix(.03, .01, kR));
        c.drawImage(strip(wR, hR, 12, p.paper2), -wR / 2 - 40, -hR / 2 - 40);
        typed(c, p.role, -wR / 2 + 32, 10, fR, '#3d3024', (t - 1.05) * 26, 43);
        const tk = K.E(t, .8, 1.05, 'out');
        if (tk > 0) { c.save(); c.globalAlpha *= tk; c.translate(wR / 2 - 6, 0); c.rotate(1.45); c.scale(K.mix(1.15, 1, tk) * .8, K.mix(1.15, 1, tk) * .8); c.drawImage(tape(5), -65, -25); c.restore(); }
        c.restore();
      }
    } });
})();
