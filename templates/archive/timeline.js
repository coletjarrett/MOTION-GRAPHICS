// ARCHIVAL — timeline. Index cards are pegged one by one onto a string stretched between brass tacks across an
// aged paper wall. Each card drops in, tugs the string down and swings to rest while its date and caption type on;
// the camera pans along the line (canvas transform) and finally pulls back to show the whole run.
// Data-driven: pass any list of {date, text} (4 to 6 items read best).
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

  // ---------- the timeline ----------
  // World layout: a string runs between brass tacks; one index card hangs from a wooden peg between each pair.
  const SP = 700, X0 = 560, TY = 410, CW = 560, CH = 336, PEG = 34;
  const wall = () => K.cached('arcWall', 2600, 1080, (c, w, h) => {
    c.fillStyle = '#dcc9a4'; c.fillRect(0, 0, w, h);
    const m = document.createElement('canvas'); m.width = 325; m.height = 135; const mc = m.getContext('2d'), d = mc.createImageData(325, 135);
    for (let y = 0; y < 135; y++) for (let x = 0; x < 325; x++) { const v = K.fbm(x / 36, y / 36, 61, 5) * 255, i = (y * 325 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    mc.putImageData(d, 0, 0);
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .7; c.filter = 'blur(16px)'; c.drawImage(m, -60, -60, w + 120, h + 120); c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .2; c.fillStyle = c.createPattern(K.noiseTex(512, 512, 62), 'repeat'); c.fillRect(0, 0, w, h); c.restore();
    const R = K.rand(63); c.globalCompositeOperation = 'multiply'; c.lineCap = 'round';
    for (let i = 0; i < 5200; i++) { const x = R() * w, y = R() * h, a = R() * K.TAU, l = 4 + R() * 16; c.strokeStyle = `rgba(110,80,45,${.04 + R() * .06})`; c.lineWidth = .7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 90, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(150,100,50,${.05 + R() * .07})`); g.addColorStop(1, 'rgba(150,100,50,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.globalCompositeOperation = 'source-over';
  });
  const peg = (c) => { // wooden clothes peg, centred on x, jaw at y=0 grips the card top at y≈PEG
    c.save(); c.shadowColor = 'rgba(40,25,10,.4)'; c.shadowBlur = 6; c.shadowOffsetY = 4; c.shadowOffsetX = 2;
    const g = c.createLinearGradient(-13, 0, 13, 0); g.addColorStop(0, '#9c7446'); g.addColorStop(.45, '#c9a06b'); g.addColorStop(1, '#8a6238');
    c.fillStyle = g; K.rr(c, -13, -26, 26, 88, 5); c.fill(); c.restore();
    c.fillStyle = 'rgba(60,38,18,.35)'; c.fillRect(-.8, -24, 1.6, 84);
    c.fillStyle = '#7c7f82'; c.fillRect(-14, 14, 28, 5); c.fillStyle = 'rgba(230,232,234,.6)'; c.fillRect(-14, 14, 28, 1.5);
  };
  const tack = (c, x, y) => {
    c.save(); c.fillStyle = 'rgba(40,25,10,.35)'; c.filter = 'blur(3px)'; c.beginPath(); c.arc(x + 4, y + 5, 11, 0, K.TAU); c.fill(); c.filter = 'none';
    const g = c.createRadialGradient(x - 4, y - 4, 1, x, y, 12); g.addColorStop(0, '#f3dca0'); g.addColorStop(.5, '#b98c3e'); g.addColorStop(1, '#6e4f1d');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 11, 0, K.TAU); c.fill(); c.restore();
  };

  K.template({ id: 'archive-timeline', title: 'Timeline', style: 'Archival', type: 'Timeline', dur: 16, alpha: false,
    fonts: ['400 80px "American Typewriter"', '600 44px "American Typewriter"', '400 32px "Courier New"', '700 20px "Courier New"', '400 20px Mono'],
    params: { heading: 'Milestones in Printing the Bible', kicker: 'From the archives · Timeline',
      items: [{ date: '1450', text: 'Printing press with movable type' }, { date: '1522', text: 'New Testament in German' },
        { date: '1526', text: 'Tyndale’s English New Testament' }, { date: '1611', text: 'King James Version' },
        { date: '1800s', text: 'Bible societies spread translations' }],
      ink: '#2b2118', red: '#9a3b2c' },
    setup(c, p) { wall(); p.items.forEach((_, i) => indexCard(CW, CH, 30 + i)); },
    draw(c, t, p) {
      const W = K.W, H = K.H, n = p.items.length, step = 2.1, t0 = 1.6;
      const TI = i => t0 + i * step, XC = i => X0 + i * SP;
      // camera focus: glides to each card just before it is hung, then pulls back to show the whole line
      const focusAt = tt => { let f = XC(0); for (let i = 1; i < n; i++) f = K.mix(f, XC(i) - SP / 2, K.E(tt, TI(i) - 1.0, TI(i) + .35, 'io')); return f; };
      const zk = K.E(t, TI(n - 1) + 1.4, TI(n - 1) + 2.9, 'io'), mid = (XC(0) + XC(n - 1)) / 2;
      const zoomOut = Math.min(1, (W - 360) / (XC(n - 1) - XC(0) + CW + 120));
      const F = K.mix(focusAt(t), mid, zk), S = K.mix(1, zoomOut, zk), ycam = K.mix(0, 70, zk);
      const out = K.E(t, 14.9, 15.8, 'io');
      // wall with gentle parallax
      c.drawImage(wall(), -(F - X0) * .12 - 40, 0);
      c.save(); c.globalAlpha = 1 - out;
      // heading (screen-fixed)
      const kk = K.P(t, .2, 1.0);
      K.setText(c, K.font(20, 'Courier New', 700), K.rgba(p.red, .9 * K.E(t, .2, .8)), 6); c.fillText(p.kicker.toUpperCase(), 150, 150);
      typed(c, p.heading, 150, 212, K.font(44, 'American Typewriter', 600), p.ink, (t - .5) * 26, 91, { caret: t > .4 && t < 2.6 ? (Math.floor(t * 2.2) % 2 ? .85 : .2) : 0 });
      c.fillStyle = K.rgba(p.red, .6); c.fillRect(150, 236, K.width(c, p.heading, K.font(44, 'American Typewriter', 600)) * K.E(t, 1.4, 2.4, 'io5'), 2.5);
      // world transform
      c.translate(W / 2, 560 + ycam); c.scale(S, S); c.translate(-F, -560);
      // swing impulse from camera motion (pure function of t: compares focus now vs a moment ago)
      const vel = (focusAt(t) - focusAt(t - .25)) * (1 - zk);
      // string: tacks at midpoints; each hung card pulls its point down with a springy settle
      const hang = i => K.ease.spring(K.P(t, TI(i), TI(i) + 1.1));
      const pts = [[XC(0) - SP / 2, TY]];
      for (let i = 0; i < n; i++) { pts.push([XC(i), TY + 16 + 30 * hang(i)]); pts.push([XC(i) + SP / 2, TY]); }
      const sa = K.E(t, .4, 2.2, 'io');
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(40,25,10,.12)'; c.lineWidth = 5; c.translate(3, 7); K.draw(c, pts, sa); c.translate(-3, -7);
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 2.6; K.draw(c, pts, sa);
      c.strokeStyle = 'rgba(230,205,160,.45)'; c.lineWidth = 1; c.setLineDash([3, 5]); K.draw(c, pts, sa); c.setLineDash([]);
      c.restore();
      for (let j = 0; j <= n; j++) { const k = K.E(t, .3 + j * .12, .7 + j * .12, 'outBack'); if (k > 0) { c.save(); c.translate(XC(0) - SP / 2 + j * SP, TY); c.scale(k, k); tack(c, 0, 0); c.restore(); } }
      // cards
      p.items.forEach((it, i) => {
        const ti = TI(i); if (t < ti) return;
        const tau = t - ti, drop = K.E(t, ti, ti + .45, 'out');
        const [px, py] = pts[1 + i * 2];
        const swing = .1 * Math.exp(-2.3 * tau) * Math.cos(6.2 * tau + .3) - vel * .00022 * Math.exp(-.2 * tau) + .006 * Math.sin(t * 1.3 + i * 2.1) * K.P(tau, .5, 2.5);
        c.save(); c.globalAlpha *= drop; c.translate(px, py - (1 - drop) * 70); c.rotate(swing);
        const card = indexCard(CW, CH, 30 + i);
        c.drawImage(K.cached(`arcCardSh|${i}`, CW + 120, CH + 120, (q) => { q.shadowColor = 'rgba(40,25,10,.38)'; q.shadowBlur = 22; q.shadowOffsetY = 14; q.shadowOffsetX = 6; q.drawImage(card, 60, 60); }), -CW / 2 - 60, PEG - 70);
        const lx = -CW / 2 + 40, top = PEG - 10;
        typed(c, it.date, lx, top + 82, K.font(80, 'American Typewriter', 400), p.ink, (tau - .45) * 10, 100 + i);
        K.setText(c, K.font(18, 'Courier New', 700), K.rgba(p.red, .75 * K.E(t, ti + .4, ti + .9)), 3, 'right'); c.fillText('NO. ' + String(i + 1).padStart(2, '0'), CW / 2 - 36, top + 76);
        const fD = K.font(32, 'Courier New', 400), lines = K.wrap(c, it.text, fD, CW - 90); let used = 0;
        lines.forEach((ln, j) => { const nn = (tau - 1.0) * 30 - used; used += ln.length + 1; typed(c, ln, lx, top + 96 + 56 * (j + 1) - 12, fD, '#3d3024', K.clamp(nn, 0, ln.length), 200 + i * 7 + j); });
        peg(c);
        c.restore();
      });
      c.restore();
      c.globalAlpha = 1; K.vignette(c, .32, '60,35,10'); film(c, t);
    } });
})();
