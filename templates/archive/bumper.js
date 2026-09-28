// ARCHIVAL — program bumper. A manila file folder lies on a dark desk blotter; its cover swings open, an index
// card lifts out and settles in front of a photo, the title and episode line type on, and a rubber date stamp
// thumps down with a small scale settle. Everything eases back into the dark at the end.
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

  // ---------- the bumper ----------
  const FW = 1040, FH = 660, FX = (1920 - FW) / 2, FY = 214, HINGE = FY + FH; // folder back panel
  const CW = 900, CH = 470;
  const desk = () => K.cached('arcDesk', 1920, 1080, (c, w, h) => {
    c.fillStyle = '#3b2b1e'; c.fillRect(0, 0, w, h);
    const m = document.createElement('canvas'); m.width = 240; m.height = 135; const mc = m.getContext('2d'), d = mc.createImageData(240, 135);
    for (let y = 0; y < 135; y++) for (let x = 0; x < 240; x++) { const v = (K.fbm(x / 40, y / 40, 21, 5) * .75 + K.fbm(x / 9, y / 60, 22, 3) * .25) * 255, i = (y * 240 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    mc.putImageData(d, 0, 0);
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .8; c.filter = 'blur(18px)'; c.drawImage(m, -60, -60, w + 120, h + 120); c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .18; c.fillStyle = c.createPattern(K.noiseTex(512, 512, 88), 'repeat'); c.fillRect(0, 0, w, h); c.restore();
    const g = c.createRadialGradient(w / 2, h * .48, 200, w / 2, h / 2, w * .75); g.addColorStop(0, 'rgba(255,210,150,.10)'); g.addColorStop(1, 'rgba(8,5,2,.72)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const manila = (key, w, h, seed, base) => K.cached(`arcManila|${key}|${w}x${h}|${base}`, w, h, (c) => { c.drawImage(aged('m' + key, w, h, base, seed, { burn: .35, fox: 10 }), 0, 0); });
  const coverFront = (p) => K.cached(`arcCover|${p.folderLabel}|${p.folderNo}`, FW, FH, (c, w, h) => {
    c.drawImage(manila('front', w, h, 44, '#d9b77c'), 0, 0);
    // a typed sticker label
    const lx = 90, ly = 90, lw = 470, lh = 150; c.save(); c.shadowColor = 'rgba(60,40,20,.25)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
    c.drawImage(aged('lab', lw, lh, '#f3ead6', 71, { burn: .15, fox: 2 }), lx, ly); c.restore();
    c.fillStyle = K.rgba(SEP.red, .5); c.fillRect(lx, ly + 44, lw, 2);
    typed(c, p.folderNo, lx + 24, ly + 34, K.font(24, 'Courier New', 700), SEP.ink2, 99, 5);
    typed(c, p.folderLabel.toUpperCase(), lx + 24, ly + 108, K.font(40, 'American Typewriter', 600), SEP.ink, 99, 7, { track: 2 });
    c.strokeStyle = 'rgba(80,55,25,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, h - 26); c.lineTo(w, h - 26); c.stroke();
  });
  const coverInside = () => K.cached('arcCoverIn', FW, FH, (c, w, h) => { c.drawImage(manila('inside', w, h, 45, '#cfab6f'), 0, 0); });
  // stack of typed pages inside the folder
  const page = () => K.cached('arcPage', 820, 1000, (c, w, h) => {
    c.drawImage(aged('page', w, h, '#ede2c9', 12, { burn: .25, fox: 8 }), 0, 0);
    const R = K.rand(3); c.fillStyle = 'rgba(50,38,26,.28)';
    for (let y = 110; y < h - 80; y += 34) { if (R() < .12) continue; const len = (R() < .15 ? .4 + R() * .3 : .86 + R() * .1) * (w - 160); for (let x = 80; x < 80 + len; x += 13) if (R() > .16) c.fillRect(x, y - 12 + R(), 9, 12 * (.35 + R() * .5)); }
  });

  K.template({ id: 'archive-bumper', title: 'Program bumper', style: 'Archival', type: 'Bumper / open', dur: 8, alpha: false,
    fonts: ['400 76px "American Typewriter"', '600 40px "American Typewriter"', '700 64px "American Typewriter"', '400 38px "Courier New"', '700 36px "Courier New"', '400 24px Mono'],
    params: { title: 'From the Archives', sub: 'Episode 3 · Printing by Hand', folderLabel: 'Printing by Hand', folderNo: 'FILE No. 03', stamp: 'ARCHIVE', stampDate: 'MAR 12 1928', photoLabel: 'photo', ink: '#2b2118', stampInk: '#9a3b2c' },
    setup(c, p) { desk(); coverFront(p); coverInside(); page(); indexCard(CW, CH, 8); photo(520, 400, 5, p.photoLabel); stamp([p.stamp, p.stampDate], p.stampInk, 9); aged('mback', FW, FH + 44, '#d3b074', 43); },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.drawImage(desk(), 0, 0);
      const fadeIn = K.E(t, 0, .9, 'out'), out = K.E(t, 7.0, 7.85, 'io');
      // slow camera push centred on the card's resting place
      const zoom = K.mix(1.0, 1.045, K.E(t, 0, 8, 'sine')) * K.mix(1.02, 1, K.E(t, 0, 1.2, 'out5'));
      c.save(); c.translate(W / 2, H / 2 + 20); c.scale(zoom, zoom); c.translate(-W / 2, -H / 2 - 20);
      c.globalAlpha = fadeIn * (1 - out);

      // back panel with tab
      const back = aged('mback', FW, FH + 44, '#d3b074', 43), bp = new Path2D(); bp.rect(FX, FY, FW, FH);
      const tab = new Path2D(); tab.roundRect(FX + FW - 360, FY - 44, 260, 80, [14, 14, 0, 0]); bp.addPath(tab);
      c.save(); c.shadowColor = 'rgba(10,6,2,.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#d3b074'; c.fill(bp); c.restore();
      c.save(); c.clip(bp); c.drawImage(back, FX, FY - 44); c.restore();
      K.setText(c, K.font(22, 'Courier New', 700), 'rgba(60,40,20,.7)', 3, 'center'); c.fillText(p.folderNo, FX + FW - 230, FY - 12);
      c.fillStyle = 'rgba(80,55,25,.22)'; c.fillRect(FX, FY, FW, 3);

      // contents: typed pages and the photo in its corners
      c.save(); c.beginPath(); c.rect(FX - 60, FY - 200, FW + 120, FH + 200); c.clip();
      shadowed(c, () => { c.save(); c.translate(FX + 150, FY + 40); c.rotate(-.025); c.drawImage(page(), 0, 0, 700, 853); c.restore(); }, 10, 3, .3);
      shadowed(c, () => { c.save(); c.translate(FX + 250, FY + 70); c.rotate(.018); c.drawImage(page(), 0, 0, 700, 853); c.restore(); }, 10, 3, .3);
      c.restore();
      const ph = photo(520, 400, 5, p.photoLabel), phx = FX + 600, phy = FY + 34;
      c.save(); c.translate(phx + 260, phy + 200); c.rotate(.06); c.translate(-260, -200);
      shadowed(c, () => c.drawImage(ph, 0, 0), 12, 4, .4); corners(c, 0, 0, 520, 400); c.restore();

      // the index card: lifts out of the folder and settles
      const lift = K.E(t, 1.75, 3.05, 'io5'), settle = K.E(t, 2.6, 3.35, 'out');
      const cx = K.mix(FX + 70 + CW / 2, W / 2 - 110, lift), cy = K.mix(HINGE - 24 - CH / 2, H / 2 + 70, lift);
      const rot = K.mix(.035, -.018, lift) + Math.sin(K.P(t, 2.6, 3.6) * Math.PI * 2) * .006 * (1 - K.P(t, 2.6, 3.6));
      const sc = K.mix(1, 1.05, lift) - .018 * Math.sin(Math.PI * settle) * (t > 2.6 ? 1 : 0);
      const drawCard = () => {
        c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(sc, sc); c.translate(-CW / 2, -CH / 2);
        shadowed(c, () => c.drawImage(indexCard(CW, CH, 8), 0, 0), K.mix(8, 34, lift), K.mix(3, 16, lift), K.mix(.35, .5, lift));
        c.drawImage(indexCard(CW, CH, 8), 0, 0);
        // typed content
        const fT = K.font(76, 'American Typewriter', 400), fS = K.font(38, 'Courier New', 400);
        const nT = (t - 3.0) * 13, nS = (t - 4.35) * 24, lenT = p.title.length, lenS = p.sub.length;
        const caretT = t > 2.9 && t < 4.35 ? (Math.floor(t * 2.2) % 2 ? .9 : .25) : 0;
        const caretS = t >= 4.35 && t < 6.4 ? (Math.floor(t * 2.2) % 2 ? .9 : .25) : 0;
        if (t > 2.9) typed(c, p.title, 70, 76, fT, p.ink, K.clamp(nT, 0, lenT), 17, { caret: nT < lenT + 3 ? caretT : 0 });
        if (t > 4.3) typed(c, p.sub, 72, 206, fS, '#3d3024', K.clamp(nS, 0, lenS), 23, { caret: caretS });
        // stamp thump: drops from slightly larger, settles, ink density rises; no flash
        const ts = 5.35, ks = K.P(t, ts, ts + .22);
        if (t > ts) {
          const s2 = t < ts + .22 ? K.mix(1.22, .985, K.ease.in(ks)) : K.mix(.985, 1, K.E(t, ts + .22, ts + .6, 'out'));
          c.save(); c.translate(CW - 240, CH - 118); c.rotate(-.1); c.scale(s2, s2);
          c.globalAlpha *= t < ts + .22 ? K.ease.in(ks) * .5 : K.mix(.5, .82, K.E(t, ts + .22, ts + .5, 'out'));
          c.globalCompositeOperation = 'multiply'; c.drawImage(stamp([p.stamp, p.stampDate], p.stampInk, 9), -280 * .68, -130 * .68, 560 * .68, 260 * .68);
          c.restore();
        }
        clip(c, CW - 110, -50, .05, 1.05);
        c.restore();
      };
      // the card is under the cover until the cover opens
      const open = K.E(t, .75, 2.0, 'io');
      if (open < .5) drawCard();
      // front cover: flips down about the bottom hinge toward the viewer
      if (open < 1) {
        const s = Math.cos(Math.PI * open), topY = HINGE - FH * s, bulge = 1 + .1 * Math.sin(Math.PI * open), half = FW / 2 * bulge, mx = FX + FW / 2;
        c.save();
        c.shadowColor = `rgba(10,6,2,${.45 * (1 - open)})`; c.shadowBlur = 30; c.shadowOffsetY = 12;
        c.beginPath(); c.moveTo(FX, HINGE); c.lineTo(FX + FW, HINGE); c.lineTo(mx + half, topY); c.lineTo(mx - half, topY); c.closePath();
        c.fillStyle = '#caa56a'; c.fill(); c.shadowColor = 'transparent'; c.clip();
        c.translate(mx, HINGE); c.scale(1, s >= 0 ? Math.max(.002, s) : Math.min(-.002, s));
        c.drawImage(s >= 0 ? coverFront(p) : coverInside(), -FW / 2 * bulge, -FH, FW * bulge, FH);
        c.restore();
        // edge-on darkening
        c.save(); c.beginPath(); c.moveTo(FX, HINGE); c.lineTo(FX + FW, HINGE); c.lineTo(mx + half, topY); c.lineTo(mx - half, topY); c.closePath();
        c.fillStyle = `rgba(40,25,10,${.35 * Math.pow(Math.sin(Math.PI * open), 2) + (s < 0 ? .12 : 0)})`; c.fill(); c.restore();
      }
      if (open >= .5) drawCard();
      c.restore();
      c.globalAlpha = 1;
      K.vignette(c, .45, '12,7,3');
      film(c, t);
    } });
})();
