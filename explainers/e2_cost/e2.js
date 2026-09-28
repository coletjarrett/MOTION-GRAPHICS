// EXPLAINER 2 — "The cost picture". Measured numbers from the Daniel 2 film session and this library's render log
// (explainers/stats.json, written by explainers/stats.py) — nothing here is invented; estimates are labelled.
K.template({ id: 'explainer-cost', title: 'The cost picture', style: 'Explainer', type: 'Explainer', dur: 73, alpha: false,
  fonts: ['600 64px "Avenir Next"', '500 30px "Avenir Next"', '700 120px "Avenir Next"'],
  params: { dir: 'explainers/e2_cost' },
  async setup(c, p) {
    p.caps = await X.json('/' + p.dir + '/captions.json');
    p.S = (await X.json('/explainers/stats.json')) || { clips: 60, styles: 15, languages: 12, l3_secs: 25, packs_ai: 7, gemini_jobs: 6 };
    p.daniel = await Promise.all(['15.60', '63.00', '100.90', '148.20', '169.90', '178.80'].map(s => X.load(`/explainers/assets/daniel_${s}.jpg`)));
    const posters = (await X.json('/explainers/posters.json')) || []; p.posters = (await Promise.all(posters.slice(0, 24).map(X.load))).filter(Boolean);
    p.T = i => p.caps[i].a;
  },
  draw(c, t, p) {
    p._t = t; const W = K.W, H = K.H, C = X.C, T = p.T, S = p.S;
    X.bg(c, t);
    // 0. question
    let a = X.sc(t, 0, T(1) + .2, .6, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'The cost picture', W / 2, 470, K.P(t, .3, 1.3), { align: 'center' }); X.title(c, 'What does production like this actually cost?', W / 2, 560, K.P(t, 1.1, 2.6), { size: 64, align: 'center' }); c.restore(); }
    // 1–7. the Daniel 2 case study
    a = X.sc(t, T(1), T(8) - .1, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a;
      X.kicker(c, 'Case study · Daniel 2:31–45', 160, 150, K.P(t, T(1), T(1) + 1));
      // film panel with slow crossfading stills
      const fx = 160, fy = 190, fw = 900, fh = 506; X.panel(c, fx - 10, fy - 10, fw + 20, fh + 20, { r: 16 });
      const n = p.daniel.length, per = 3.2, u = (t - T(1)) / per, i0 = Math.max(0, Math.floor(u)) % n, i1 = (i0 + 1) % n, fr = K.ease.io(K.clamp((u - Math.floor(u) - .75) / .25));
      for (const [im, al, j] of [[p.daniel[i0], 1, 0], [p.daniel[i1], fr, 1]]) { if (!im || al <= 0) continue; c.save(); c.globalAlpha = a * al; K.rr(c, fx, fy, fw, fh, 8); c.clip(); const z = 1.04 + .04 * ((u + j) % 1); c.drawImage(im, fx - (z - 1) * fw / 2, fy - (z - 1) * fh / 2, fw * z, fh * z); c.restore(); }
      c.globalAlpha = a; const facts = [['3:08', 'running time'], ['5,640', 'frames'], ['1', 'on-device voice'], ['0', 'stock assets']];
      facts.forEach(([n1, l], i) => { const k = K.E(t, T(2) + i * .45, T(2) + .8 + i * .45); c.globalAlpha = a * k; const x = fx + i * 250; X.label(c, n1, x, 790, { size: 54, w: 700, color: C.gold }); X.label(c, l, x, 830, { size: 22, color: C.muted }); });
      // right column: the story of the session
      const rx = 1140; c.globalAlpha = a;
      // person: fewer than ten short messages (paraphrased)
      const msgs = ['Make a video narrating Daniel 2', 'New World Translation, please', 'Verses 31–45', 'Here is the text', 'Use an on-device voice'];
      const mk = K.E(t, T(3) - .2, T(3) + .6); if (mk > 0) { c.globalAlpha = a * mk; X.icon(c, 'person', rx + 30, 205, .8, C.gold); X.label(c, 'Director — 8 short messages', rx + 75, 215, { size: 26, w: 600 });
        msgs.forEach((m, i) => { const k = K.E(t, T(3) + i * .35, T(3) + .5 + i * .35, 'out5'); if (k <= 0) return; c.globalAlpha = a * k; const w = K.width(c, m, X.F(22, 500)) + 36, y = 245 + i * 52; K.rr(c, rx + 20 + (1 - k) * 20, y, w, 40, 20); c.fillStyle = 'rgba(216,179,111,.16)'; c.fill(); X.label(c, m, rx + 38 + (1 - k) * 20, y + 27, { size: 22 }); }); }
      // AI did the work
      const done = [['Planned six scenes to the narration', T(4)], ['Wrote 1,427 lines of animation code', T(4) + 1.4], ['Designed the sound: 100+ cues', T(5)], ['Checked every frame for defects', T(5) + 1.3]];
      const ak = K.E(t, T(4) - .2, T(4) + .6); if (ak > 0) { c.globalAlpha = a * ak; X.icon(c, 'ai', rx + 30, 550, .7, C.teal); X.label(c, 'AI assistant', rx + 75, 560, { size: 26, w: 600 });
        done.forEach(([s, t0], i) => { const k = K.E(t, t0, t0 + .5); if (k <= 0) return; c.globalAlpha = a * k; const y = 610 + i * 44; c.strokeStyle = C.teal; c.lineWidth = 3; K.draw(c, [[rx + 22, y - 8], [rx + 30, y], [rx + 44, y - 16]], K.E(t, t0 + .1, t0 + .5)); X.label(c, s, rx + 60, y, { size: 23 }); }); }
      // render
      const rk = K.E(t, T(6), T(6) + .7); if (rk > 0) { c.globalAlpha = a * rk; K.rr(c, rx + 10, 800, 640, 80, 12); c.fillStyle = C.panel; c.fill(); X.icon(c, 'film', rx + 55, 840, .8, C.gold); X.label(c, 'Final render: 22 minutes', rx + 100, 835, { size: 26, w: 600 }); X.label(c, 'one Apple M1 laptop, 8 GB · in the background', rx + 100, 865, { size: 20, color: C.muted });
        c.fillStyle = C.line; c.fillRect(rx + 440, 832, 190, 8); c.fillStyle = C.gold; c.fillRect(rx + 440, 832, 190 * K.E(t, T(6) + .3, T(7) - .3, 'io'), 8); }
      // no farm / stock / plugins
      ['Render farm', 'Stock footage', 'Licensed plugins'].forEach((s, i) => { const t0 = T(7) + i * .9, k = K.E(t, t0, t0 + .4); if (k <= 0) return; c.globalAlpha = a * k; const x = 160 + i * 330, y = 940; X.label(c, s, x, y, { size: 30, color: C.muted, w: 500 }); const w = K.width(c, s, X.F(30, 500)); c.fillStyle = C.coral; c.fillRect(x - 6, y - 10, (w + 12) * K.E(t, t0 + .3, t0 + .7, 'io'), 3); });
      c.restore(); }
    // 8–13. the library
    a = X.sc(t, T(8) - .1, T(14) - .1, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a;
      // background wall of this library's posters
      p.posters.forEach((im, i) => { const col = i % 8, row = Math.floor(i / 8), w = 220, h = 124, k = K.E(t, T(8) + (col + row) * .06, T(8) + .8 + (col + row) * .06); c.globalAlpha = a * k * .35; X.img(c, im, 40 + col * (w + 12), 40 + row * (h + 12) - (t - T(8)) * 5, w, h, { r: 6 }); });
      c.globalAlpha = a; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(15,20,27,.3)'); g.addColorStop(.45, 'rgba(15,20,27,.92)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      X.kicker(c, 'This library · prepared overnight', 160, 470, K.P(t, T(8), T(8) + 1));
      const cnt = [[S.clips, 'clips rendered', T(9)], [S.styles, 'visual styles', T(9) + 1.1], [S.languages, 'languages demonstrated', T(10)]];
      cnt.forEach(([v, l, t0], i) => { const k = K.E(t, t0, t0 + 1.2, 'out'); if (k <= 0) return; c.globalAlpha = a * K.clamp(k * 3); const x = 160 + i * 420; X.label(c, String(Math.round(v * k)), x, 610, { size: 120, w: 700, color: i === 0 ? C.gold : C.ink }); X.label(c, l, x, 660, { size: 26, color: C.muted }); });
      // parallel workers + reviewer
      const wk = K.E(t, T(11), T(11) + .8); if (wk > 0) { c.globalAlpha = a * wk; const lanes = [...Array(S.packs_ai).fill(['ai', 'Claude', C.teal]), ...Array(S.gemini_jobs).fill(['ai', 'Gemini', C.coral])].slice(0, 10);
        lanes.forEach(([ic, nm, col], i) => { const x = 160 + i * 90, y = 780, k = K.E(t, T(11) + i * .12, T(11) + .5 + i * .12, 'outBack'); c.save(); c.translate(x + 30, y); c.scale(k, k); X.icon(c, ic, 0, 0, .7, col); c.restore(); X.label(c, nm, x + 30, y + 50, { size: 16, color: C.muted, align: 'center' }); });
        X.label(c, 'AI workers building style packs in parallel', 160, 890, { size: 24, color: C.ink }); }
      const rv = K.E(t, T(12), T(12) + .7); if (rv > 0) { c.globalAlpha = a * rv; X.icon(c, 'eye', 1140, 780, 1, C.gold); X.label(c, 'critique pass', 1185, 790, { size: 24, color: C.gold, w: 600 }); X.arrow(c, [1100, 780], [1080, 780], rv, C.gold); }
      const l3 = K.E(t, T(13), T(13) + .7); if (l3 > 0) { c.globalAlpha = a * l3; K.rr(c, 1400, 740, 380, 150, 14); c.fillStyle = C.panel; c.fill(); X.label(c, '≈ ' + Math.round(S.l3_secs) + ' s', 1430, 820, { size: 64, w: 700, color: C.gold }); X.label(c, 'to render one lower third', 1430, 862, { size: 22, color: C.muted }); }
      c.restore(); }
    // 14–18. the shift and the costs
    a = X.sc(t, T(14) - .1, T(19) - .1, .7, .7);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'The difference', 160, 170, K.P(t, T(14), T(14) + 1));
      const bars = [['Traditional package', 'several weeks of a designer’s time', 1, C.muted], ['Code-driven package', 'one night, directed by one person', .06, C.gold]];
      bars.forEach(([l, s, v, col], i) => { const k = K.E(t, T(14) + .5 + i * 1.2, T(14) + 2.2 + i * 1.2, 'io'); const y = 260 + i * 120; c.globalAlpha = a * K.clamp(k * 4); X.label(c, l, 160, y, { size: 28, w: 600 }); c.fillStyle = C.line; c.fillRect(160, y + 20, 1200, 26); c.fillStyle = col; c.fillRect(160, y + 20, Math.max(8, 1200 * v) * k, 26); X.label(c, s, 160 + Math.max(8, 1200 * v) * k + 20, y + 42, { size: 22, color: C.muted }); });
      c.globalAlpha = a; X.label(c, 'Illustrative estimate — varies with scope', 160, 540, { size: 18, color: C.muted });
      // building → directing
      const sh = K.E(t, T(15), T(15) + 1); if (sh > 0) { c.globalAlpha = a * sh; X.label(c, 'Building', 160, 680, { size: 56, w: 600, color: C.muted }); c.fillStyle = C.muted; c.fillRect(160, 664, K.width(c, 'Building', X.F(56, 600)) * K.E(t, T(15) + .6, T(15) + 1.4, 'io'), 4); X.arrow(c, [460, 662], [560, 662], K.E(t, T(15) + .8, T(15) + 1.4), C.gold, 4); X.title(c, 'Directing', 590, 680, K.P(t, T(15) + 1.2, T(15) + 2.2), { size: 56, color: C.gold });
        ['choosing', 'approving', 'refining'].forEach((s, i) => { const k = K.E(t, T(16) + i * .5, T(16) + .5 + i * .5); c.globalAlpha = a * k; X.label(c, s, 590 + i * 220, 740, { size: 28, color: C.ink }); }); }
      // running costs
      const ck = K.E(t, T(17), T(17) + .8); if (ck > 0) { c.globalAlpha = a * ck; X.panel(c, 1180, 600, 580, 240, { r: 16 }); X.kicker(c, 'Running costs', 1220, 650, 1); X.label(c, 'A few AI subscriptions', 1220, 720, { size: 34, w: 600 }); const k2 = K.E(t, T(18), T(18) + .7); c.globalAlpha = a * k2; X.label(c, '+ one laptop’s electricity', 1220, 780, { size: 34, w: 600, color: C.gold }); }
      c.restore(); }
    // 19–20. the message
    a = X.sc(t, T(19) - .1, 73, .7, 1.4);
    if (a > 0) { c.save(); c.globalAlpha = a; X.label(c, 'Skilled volunteers can focus on what matters most:', W / 2, 470, { size: 38, color: C.muted, align: 'center' }); X.title(c, 'the message.', W / 2, 600, K.P(t, T(20), T(20) + 1.4), { size: 110, align: 'center', color: C.gold }); c.restore(); }
    X.captions(c, t, p.caps);
    K.grain(c, t, .025);
  } });
