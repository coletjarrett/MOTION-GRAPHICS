// EXPLAINER 1 — "How it works". Scene times follow the narration captions (captions.json, index = line).
K.template({ id: 'explainer-how', title: 'How it works', style: 'Explainer', type: 'Explainer', dur: 105, alpha: false,
  fonts: ['600 64px "Avenir Next"', '500 30px "Avenir Next"', '400 26px Menlo', '600 24px "Avenir Next"'],
  params: { dir: 'explainers/e1_how' },
  async setup(c, p) {
    p.caps = await X.json('/' + p.dir + '/captions.json');
    const posters = (await X.json('/explainers/posters.json')) || [];
    p.posters = (await Promise.all(posters.map(X.load))).filter(Boolean);
    p.lang = (await Promise.all(['en', 'es', 'fr', 'pt', 'de', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'sw'].map(l => X.load(`/out/variants/lang-${l}.jpg`))));
    p.strip = await Promise.all(['/out/variants/lang-en.jpg', '/out/minimal/minimal-timeline.jpg', '/out/maps/maps-journey.jpg', '/explainers/assets/daniel_148.20.jpg'].map(X.load));
    p.daniel = await Promise.all(['15.60', '63.00', '148.20', '178.80'].map(s => X.load(`/explainers/assets/daniel_${s}.jpg`)));
    const L = i => p.caps[i]; p.T = i => L(i).a; p.B = i => L(i).b;
  },
  draw(c, t, p) {
    p._t = t; const W = K.W, H = K.H, C = X.C, T = p.T;
    X.bg(c, t);
    // ---- 1. a wall of graphics (0 → line 2)
    let a = X.sc(t, 0, T(2) + .3, .8, .8);
    if (a > 0) { c.save(); c.globalAlpha = a; const cols = 6, w = 300, h = 169, gap = 18, ox = (W - (cols * w + (cols - 1) * gap)) / 2, drift = t * 14;
      p.posters.slice(0, 30).forEach((im, i) => { const col = i % cols, row = Math.floor(i / cols), k = K.E(t, .2 + (col + row) * .09, 1.2 + (col + row) * .09, 'out5');
        const x = ox + col * (w + gap), y = 60 + row * (h + gap) - drift + (1 - k) * 60; c.globalAlpha = a * k * .9; X.img(c, im, x, y, w, h); });
      c.globalAlpha = a; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(15,20,27,.1)'); g.addColorStop(.55, 'rgba(15,20,27,.75)'); g.addColorStop(1, 'rgba(15,20,27,.95)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      X.kicker(c, 'A new way to make broadcast graphics', W / 2, 720, K.P(t, 1.2, 2.4), { align: 'center' });
      X.title(c, 'Code-driven motion graphics', W / 2, 810, K.P(t, 1.6, 3.0), { size: 84, align: 'center' });
      const items = ['Lower thirds', 'Titles', 'Timelines', 'Maps', 'Animated films'];
      items.forEach((s, i) => { const k = K.E(t, T(1) + .3 + i * .6, T(1) + .9 + i * .6, 'out'); c.globalAlpha = a * k; X.label(c, s, W / 2 + (i - 2) * 250, 900 + (1 - k) * 16, { size: 30, color: C.muted, align: 'center' }); if (i) { c.fillStyle = C.gold; c.beginPath(); c.arc(W / 2 + (i - 2.5) * 250, 890, 3, 0, K.TAU); c.fill(); } });
      c.restore(); }
    // ---- 2. every graphic is a small program (line 2 → line 6): code on the left, the graphic it makes on the right
    a = X.sc(t, T(2), T(10) - .2, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a;
      const sl = K.E(t, T(6) - .2, T(6) + 1.0, 'io5');    // at line 6 the code panel slides up to make room for the frame strip
      const cy = 150 - sl * 60;
      X.kicker(c, 'Every graphic is a small program', 160, cy - 30, K.P(t, T(2), T(2) + 1));
      X.panel(c, 160, cy, 860, 520 - sl * 150); X.panel(c, 1080, cy, 680, 520 - sl * 150, { fill: '#111820' });
      const code = ["draw(c, t) {", "  // where is everything at time t?", "  const k = K.E(t, 0.5, 1.3, 'out5');", "  c.fillStyle = '#d8b36f';", "  c.fillRect(170, 800, 5, 112 * k);", "  K.reveal(c, p.name, 200, 860, { k });", "}"];
      c.save(); K.rr(c, 160, cy, 860, 520 - sl * 150, 14); c.clip(); X.code(c, code, 200, cy + 70, K.P(t, T(3) - .6, T(4) + 1.2), { lh: 46 }); c.restore();
      // the preview: a miniature lower third animated by a scrubbing playhead
      const tt = (t - T(4)) % 3.2 < 0 ? 0 : ((t - T(4)) % 3.2) * 1.0, ph = K.clamp(tt / 2.4), px = 1080, py = cy, pw = 680, phh = 520 - sl * 150;
      c.save(); K.rr(c, px, py, pw, phh, 14); c.clip(); const gg = c.createLinearGradient(px, py, px + pw, py + phh); gg.addColorStop(0, '#4a3a2e'); gg.addColorStop(1, '#1e1916'); c.fillStyle = gg; c.fillRect(px, py, pw, phh);
      const kk = K.ease.out5(K.clamp((ph - .1) / .45)); c.fillStyle = C.gold; c.fillRect(px + 50, py + phh - 150, 4, 90 * kk);
      c.beginPath(); c.rect(px + 56, py, pw, phh); c.clip(); K.setText(c, X.F(44, 600), '#fff'); c.fillText('Daniel Mensah', px + 76 - (1 - kk) * 330, py + phh - 105); K.setText(c, X.F(24, 400), 'rgba(255,255,255,.85)'); c.globalAlpha = a * K.clamp((ph - .3) / .4); c.fillText('Construction volunteer, Ghana', px + 76, py + phh - 70); c.restore();
      // time question
      const q = K.E(t, T(4), T(4) + .8); if (q > 0 && t > T(3)) { c.globalAlpha = a * q; const tl = 1080, tw = 680, ty = cy + 520 - sl * 150 + 50; c.fillStyle = C.line; c.fillRect(tl, ty, tw, 3); c.fillStyle = C.gold; c.fillRect(tl, ty, tw * ph, 3); c.beginPath(); c.arc(tl + tw * ph, ty + 1.5, 9, 0, K.TAU); c.fill(); X.label(c, `t = ${(ph * 2.4).toFixed(2)} s`, tl + tw, ty + 46, { size: 28, color: C.gold, align: 'right', w: 600 }); c.globalAlpha = a; X.label(c, 'frame  =  f( time )', tl, ty + 46, { size: 28, color: C.muted }); }
      // any frame, any computer, any order; many frames at once
      const fs = K.E(t, T(6), T(6) + 1.0); if (fs > 0) { c.globalAlpha = a * fs; const n = 24, fw = 62, fh = 40, fx = 160, fy = 690, R = K.rand(11), order = Array.from({ length: n }, (_, i) => i).sort(() => R() - .5);
        X.label(c, 'Frames', fx, fy - 20, { size: 24, color: C.muted, w: 600 });
        for (let i = 0; i < n; i++) { const x = fx + i * (fw + 5), done = (t > T(7) - .4 && order.indexOf(i) < (t - T(7) + .4) * 7) || (t > T(8) && i < (t - T(8)) * 12); K.rr(c, x, fy, fw, fh, 4); c.fillStyle = done ? C.gold : C.panel; c.fill(); c.strokeStyle = C.line; c.stroke(); K.setText(c, X.F(16, 600), done ? '#1b1b1b' : C.muted, 0, 'center'); c.fillText(String(i + 1), x + fw / 2, fy + 26); }
        const lanes = K.E(t, T(8), T(8) + .8); if (lanes > 0) { c.globalAlpha = a * lanes; ['Worker 1', 'Worker 2', 'Worker 3'].forEach((s, j) => { const y = 790 + j * 52; X.label(c, s, fx, y + 20, { size: 22, color: C.muted }); c.fillStyle = C.line; c.fillRect(fx + 130, y + 8, 1440, 16); c.fillStyle = [C.gold, C.teal, C.coral][j]; c.fillRect(fx + 130, y + 8, 1440 * K.E(t, T(8) + .3 + j * .1, T(9) + 1.2, 'io'), 16); }); }
        const id = K.E(t, T(9), T(9) + .8); if (id > 0) { c.globalAlpha = a * id; X.icon(c, 'check', 1790, 842, 1, C.green); X.label(c, 'identical every time', 1840, 965, { size: 24, color: C.green, align: 'right', w: 600 }); } }
      c.restore(); }
    // ---- 3. the workflow (line 10 → 16)
    a = X.sc(t, T(10) - .2, T(16) - .2, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'The workflow', 160, 190, K.P(t, T(10), T(10) + 1)); X.title(c, 'From brief to broadcast', 160, 270, K.P(t, T(10) + .2, T(10) + 1.4), { size: 60 });
      const nodes = [['doc', 'Brief', 'words · style · length', T(11)], ['ai', 'AI writes the template', 'code, not keyframes', T(12)], ['frames', 'Test frames', 'renders & self-checks', T(12) + 2.4], ['eye', 'Second-model review', 'defects with timestamps', T(13)], ['person', 'Person decides', 'look · wording · final cut', T(14)]];
      const nx = i => 250 + i * 355, ny = 560;
      nodes.forEach(([ic, h, s, t0], i) => { const k = K.E(t, t0, t0 + .8, 'outBack'); if (k <= 0) return; const lit = i === 4 ? K.E(t, T(14), T(14) + .6) : K.bell(t, t0, t0 + .4, t0 + 2.2, t0 + 3);
        if (i > 0) X.arrow(c, [nx(i - 1) + 95, ny], [nx(i) - 95, ny], K.E(t, t0 - .4, t0 + .2), C.muted);
        c.save(); c.translate(nx(i), ny); c.scale(k, k); c.beginPath(); c.arc(0, 0, 78, 0, K.TAU); c.fillStyle = C.panel; c.fill(); c.lineWidth = 3; c.strokeStyle = K.lerpc('#2e3a48', i === 4 ? '#d8b36f' : '#6fb5b0', lit); c.stroke(); X.icon(c, ic, 0, 0, 1.1, K.lerpc('#eef0f3', i === 4 ? '#d8b36f' : '#6fb5b0', lit)); c.restore();
        c.globalAlpha = a * K.clamp(k); X.label(c, h, nx(i), ny + 140, { size: 28, w: 600, align: 'center' }); X.label(c, s, nx(i), ny + 180, { size: 22, color: C.muted, align: 'center' }); c.globalAlpha = a; });
      // the review loop back to the template
      const lp = K.E(t, T(13) + 1.2, T(13) + 2.4, 'io'); if (lp > 0) { c.strokeStyle = C.teal; c.lineWidth = 2.5; c.setLineDash([8, 8]); K.draw(c, K.bez([nx(3), ny - 90], [nx(3), ny - 200], [nx(1), ny - 200], [nx(1), ny - 90], 40), lp); c.setLineDash([]); c.globalAlpha = a * lp; X.label(c, 'fix · re-render · review again', (nx(1) + nx(3)) / 2, ny - 200, { size: 22, color: C.teal, align: 'center' }); c.globalAlpha = a; }
      const hu = K.E(t, T(14) + .3, T(15), 'out'); if (hu > 0) { c.globalAlpha = a * hu; K.rr(c, nx(4) - 150, ny + 215, 300, 50, 25); c.fillStyle = 'rgba(216,179,111,.15)'; c.fill(); X.label(c, 'always in charge', nx(4), ny + 249, { size: 22, color: C.gold, align: 'center', w: 600 }); }
      c.restore(); }
    // ---- 4. rendering and delivery (line 16 → 21)
    a = X.sc(t, T(16) - .2, T(21) - .2, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Rendering & delivery', 160, 190, K.P(t, T(16), T(16) + 1)); X.title(c, 'A browser draws it. An encoder packages it.', 160, 270, K.P(t, T(16) + .2, T(16) + 1.6), { size: 56 });
      const y = 560, st = [['browser', 'Headless browser', 'draws each frame', 330, T(16) + .6], ['frames', 'Frames', 'lossless, in parallel', 780, T(16) + 2.4], ['film', 'Encoder (ffmpeg)', 'open-source', 1230, T(17)]];
      st.forEach(([ic, h, s, x, t0], i) => { const k = K.E(t, t0, t0 + .7, 'outBack'); if (k <= 0) return; if (i) X.arrow(c, [st[i - 1][3] + 110, y], [x - 110, y], K.E(t, t0 - .3, t0 + .2));
        c.save(); c.translate(x, y); c.scale(k, k); X.panel(c, -90, -90, 180, 180, { r: 24 }); X.icon(c, ic, 0, 0, 1.4, C.ink); c.restore(); X.label(c, h, x, y + 150, { size: 28, w: 600, align: 'center' }); X.label(c, s, x, y + 188, { size: 22, color: C.muted, align: 'center' }); });
      // flowing frames along the arrows
      if (t > T(16) + 2.6) for (let j = 0; j < 6; j++) { const u = ((t * .7 + j / 6) % 1); const x = K.mix(440, 670, u); c.globalAlpha = a * K.bell(u, 0, .15, .85, 1); K.rr(c, x - 14, y - 10, 28, 20, 3); c.fillStyle = C.gold; c.fill(); }
      c.globalAlpha = a;
      const outs = [['ProRes 4444', 'with transparency · for editors', C.teal, T(18)], ['H.264', 'for review & playback', C.gold, T(18) + 2.2], ['Narration', 'on-device speech model · offline', C.coral, T(19)]];
      outs.forEach(([h, s, col, t0], i) => { const k = K.E(t, t0, t0 + .7, 'out5'); if (k <= 0) return; const bx = 1460, by = 400 + i * 130 + (1 - k) * 30; c.globalAlpha = a * k; X.arrow(c, [1340, y], [bx - 20, by + 45], K.E(t, t0 - .2, t0 + .4), col, 2);
        X.panel(c, bx, by, 380, 96, { r: 12 }); c.fillStyle = col; c.fillRect(bx, by + 18, 5, 60); X.label(c, h, bx + 28, by + 44, { size: 28, w: 600 }); X.label(c, s, bx + 28, by + 76, { size: 20, color: C.muted });
        if (i === 2) { c.strokeStyle = col; c.lineWidth = 2; K.line(c, Array.from({ length: 60 }, (_, q) => [bx + 250 + q * 2, by + 40 + Math.sin(q * .7 + t * 6) * 14 * K.noise(q * .2 + t, 0, 5)])); c.stroke(); } });
      c.restore(); }
    // ---- 5. text is data: one template, many languages (line 21 → 24)
    a = X.sc(t, T(21) - .2, T(24) - .1, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Text is data', 160, 170, K.P(t, T(21), T(21) + 1)); X.title(c, 'One template → hundreds of clips', 160, 250, K.P(t, T(21) + .2, T(21) + 1.5), { size: 58 });
      // a little spreadsheet
      const rows = [['name', 'role', 'language'], ['Daniel Mensah', 'Construction volunteer', 'English'], ['Lucía Fernández', 'Intérprete de señas', 'Español'], ['佐藤 美咲', '翻訳ボランティア', '日本語'], ['يوسف حداد', 'متطوع في أعمال البناء', 'العربية'], ['अनन्या शर्मा', 'अनुवाद स्वयंसेवक', 'हिन्दी']];
      const sx = 160, sy = 320, cw = [230, 330, 130];
      X.panel(c, sx - 20, sy - 20, 720, 380, { r: 10 });
      rows.forEach((r, i) => { const k = K.E(t, T(21) + .8 + i * .25, T(21) + 1.3 + i * .25); c.globalAlpha = a * k; let x = sx; r.forEach((cell, j) => { const fam = /[؀-ۿ]/.test(cell) ? 'Geeza Pro' : /[ऀ-ॿ]/.test(cell) ? 'Kohinoor Devanagari' : /[぀-ヿ一-鿿]/.test(cell) ? 'Hiragino Sans' : 'Avenir Next'; K.setText(c, K.font(i ? 22 : 18, fam, i ? 500 : 600), i ? C.ink : C.gold, i ? 0 : 3); c.fillText(i ? cell : cell.toUpperCase(), x, sy + 20 + i * 58); x += cw[j]; }); c.fillStyle = C.line; c.fillRect(sx - 20, sy + 40 + i * 58, 720, 1); });
      c.globalAlpha = a; X.arrow(c, [900, 510], [990, 510], K.E(t, T(22) - .5, T(22)), C.gold, 3);
      // the rendered lower thirds (real renders from this library)
      p.lang.forEach((im, i) => { const k = K.E(t, T(22) + i * .22, T(22) + .6 + i * .22, 'out5'); if (k <= 0 || !im) return; const col = i % 3, row = Math.floor(i / 3), w = 250, h = 141, x = 1020 + col * (w + 14), y = 310 + row * (h + 14);
        c.globalAlpha = a * k; const hl = i === 9 ? K.E(t, T(23), T(23) + .5) : 0; c.save(); c.translate(x + w / 2, y + h / 2); c.scale(.9 + .1 * k + hl * .12, .9 + .1 * k + hl * .12); X.img(c, im, -w / 2, -h / 2, w, h, { r: 6 }); if (hl > 0) { K.rr(c, -w / 2, -h / 2, w, h, 6); c.strokeStyle = K.rgba('#d8b36f', hl); c.lineWidth = 3; c.stroke(); } c.restore(); });
      const rt = K.E(t, T(23) + .3, T(23) + 1.1); if (rt > 0) { c.globalAlpha = a * rt; X.label(c, '← right-to-left layouts mirror automatically', 1020, 960, { size: 24, color: C.gold }); }
      c.restore(); }
    // ---- 6. versioned, reviewed, shared; scales from a name title to a film (line 24 → 27)
    a = X.sc(t, T(24) - .2, T(27) - .1, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Templates are code', 160, 170, K.P(t, T(24), T(24) + 1)); X.title(c, 'Versioned · reviewed · shared', 160, 250, K.P(t, T(24) + .2, T(24) + 1.5), { size: 58 });
      const vs = [['v1', 'first draft from the brief'], ['v2', 'reviewer: “role text too small”  → 34 px'], ['v3', 'approved · 12 languages rendered']];
      vs.forEach(([v, s], i) => { const k = K.E(t, T(24) + 1 + i * .8, T(24) + 1.6 + i * .8); c.globalAlpha = a * k; const y = 340 + i * 70; c.fillStyle = i === 2 ? C.gold : C.teal; c.beginPath(); c.arc(190, y, 12, 0, K.TAU); c.fill(); if (i) { c.fillStyle = C.line; c.fillRect(188, y - 58, 4, 46); } X.label(c, v, 225, y + 10, { size: 28, w: 600 }); X.label(c, s, 290, y + 10, { size: 24, color: C.muted }); });
      // scale strip: lower third → timeline → map → film
      const strip = [[p.strip[0], 'Name title'], [p.strip[1], 'Timeline'], [p.strip[2], 'Map'], [p.strip[3], 'Narrated film']];
      strip.forEach(([im, s], i) => { const k = K.E(t, T(25) + i * .7, T(25) + .6 + i * .7, 'out5'); if (k <= 0) return; const w = 360 + i * 30, h = w * .5625, x = 160 + [0, 400, 830, 1290][i], y = 880 - h; c.globalAlpha = a * k; X.img(c, im, x, y + (1 - k) * 30, w, h, { r: 8 }); X.label(c, s, x, 930, { size: 24, color: i === 3 ? C.gold : C.muted, w: 600 }); if (i) X.arrow(c, [x - 34, y + h / 2], [x - 8, y + h / 2], k, C.muted, 2); });
      c.restore(); }
    // ---- 7. close (line 27 → end)
    a = X.sc(t, T(27) - .1, 105, .7, 1.4);
    if (a > 0) { c.save(); c.globalAlpha = a; const im = p.daniel[3]; if (im) { c.globalAlpha = a * .35; X.img(c, im, 0, 0, W, H, { r: 0, border: false }); c.globalAlpha = a; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(15,20,27,.6)'); g.addColorStop(1, 'rgba(15,20,27,.95)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
      ['Modest in cost.', 'Consistent in quality.', 'Ready to serve in many languages.'].forEach((s, i) => { const t0 = [T(27), T(27) + 1.5, T(28)][i]; X.title(c, s, W / 2, 440 + i * 100, K.P(t, t0, t0 + 1.2), { size: i === 2 ? 64 : 58, align: 'center', color: i === 2 ? C.gold : C.ink }); });
      c.restore(); }
    X.captions(c, t, p.caps);
    K.grain(c, t, .025);
  } });
