// EXPLAINER 5 — "On-screen text: one source". The problems with today's OST workflow, and how the code-driven
// workflow answers each one. Scene times follow the narration captions (captions.json, index = line).
K.template({ id: 'explainer-ost', title: 'On-screen text: one source', style: 'Explainer', type: 'Explainer', dur: 108, alpha: false,
  fonts: ['600 64px "Avenir Next"', '500 30px "Avenir Next"', '400 24px Menlo', '600 40px "Geeza Pro"', '600 30px "Hiragino Sans"'],
  params: { dir: 'explainers/e5_ost' },
  async setup(c, p) {
    p.caps = await X.json('/' + p.dir + '/captions.json');
    p.T = i => p.caps[i].a;
    p.img = {}; for (const l of ['en', 'ar', 'ja', 'es', 'fr', 'ko']) p.img[l] = await X.load(`/out/variants/lang-${l}.jpg`);
  },
  draw(c, t, p) {
    p._t = t; const W = K.W, H = K.H, C = X.C, T = p.T;
    X.bg(c, t);
    const card = (x, y, w, h, k, title, sub, col = C.teal) => { c.save(); c.globalAlpha *= k; c.translate(0, (1 - k) * 24); X.panel(c, x, y, w, h, { r: 14 }); c.fillStyle = col; c.fillRect(x, y + 18, 5, 44); X.label(c, title, x + 26, y + 46, { size: 26, w: 600 }); if (sub) X.label(c, sub, x + 26, y + 78, { size: 19, color: C.muted }); c.restore(); };
    const tag = (s, x, y, col, k = 1) => { if (k <= 0) return; c.save(); c.globalAlpha *= k; const f = X.F(18, 600); const w = K.width(c, s.toUpperCase(), f, 2) + 22; K.rr(c, x, y - 20, w, 28, 14); c.fillStyle = K.rgba(col, .18); c.fill(); K.setText(c, f, col, 2); c.fillText(s.toUpperCase(), x + 11, y); c.restore(); return w; };
    const doc = (x, y, w, h, title, k, rot = 0) => { if (k <= 0) return; c.save(); c.globalAlpha *= k; c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2 + (1 - k) * 30);
      c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 24; c.shadowOffsetY = 10; K.rr(c, 0, 0, w, h, 8); c.fillStyle = '#e9e4da'; c.fill(); c.shadowColor = 'transparent';
      K.setText(c, X.F(22, 600), '#2a2f36'); c.fillText(title, 22, 42); c.fillStyle = '#b8b1a4'; for (let i = 0; i < 7; i++) c.fillRect(22, 70 + i * 22, (w - 44) * (i % 3 === 2 ? .6 : .9), 6); c.restore(); };

    // ---- 1. title (lines 0–1)
    let a = X.sc(t, 0, T(2) - .1, .7, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Examining the current workflow', W / 2, 400, K.P(t, .3, 1.3), { align: 'center' }); X.title(c, 'On-screen text', W / 2, 500, K.P(t, .6, 2), { size: 96, align: 'center' });
      const langs = ['English', 'Español', 'Français', 'Português', 'Deutsch', 'Русский', '日本語', '한국어', '中文', 'العربية', 'हिन्दी', 'Kiswahili'];
      langs.forEach((s, i) => { const k = K.E(t, 1.6 + i * .12, 2.2 + i * .12, 'out'); if (k <= 0) return; c.globalAlpha = a * k; const col = i % 6, row = Math.floor(i / 6), x = W / 2 + (col - 2.5) * 190, y = 620 + row * 64;
        const fam = /[؀-ۿ]/.test(s) ? 'Geeza Pro' : /[ऀ-ॿ]/.test(s) ? 'Kohinoor Devanagari' : /[぀-ヿ一-鿿]/.test(s) ? 'Hiragino Sans' : /[가-힯]/.test(s) ? 'Apple SD Gothic Neo' : 'Avenir Next';
        K.rr(c, x - 82, y - 30, 164, 46, 23); c.fillStyle = 'rgba(255,255,255,.05)'; c.fill(); K.setText(c, K.font(22, fam, 500), C.ink, 0, 'center'); c.fillText(s, x, y); });
      const busy = K.E(t, T(1), T(1) + 1); if (busy > 0) { c.globalAlpha = a * busy; X.label(c, 'many tools · many files · many hands', W / 2, 820, { size: 26, color: C.gold, align: 'center' }); }
      c.restore(); }

    // ---- 2. where the text goes today (lines 2–4)
    a = X.sc(t, T(2) - .1, T(5) - .1, .6, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Where the text goes today', 160, 170, K.P(t, T(2), T(2) + 1)); X.title(c, 'One line of text, rebuilt in every tool', 160, 250, K.P(t, T(2) + .2, T(2) + 1.6), { size: 54 });
      const cols = [[T(2), 'Editor · timeline', 'proxy or pre-rendered .mov'], [T(3), 'After Effects · RTL', 'separate project'], [T(4), 'MEPS composition', 'text re-created by hand'], [T(4) + 3.2, 'PowerPoint', 're-created again']];
      cols.forEach(([t0, h, s], i) => { const k = K.E(t, t0, t0 + .7, 'out5'); if (k <= 0) return; const x = 160 + i * 410, y = 330, w = 380;
        card(x, y, w, 420, k, h, s, [C.teal, C.coral, C.gold, C.muted][i]);
        c.save(); c.globalAlpha = a * k; const bx = x + 26, by = y + 140, bw = w - 52, bh = 210; K.rr(c, bx, by, bw, bh, 8); c.fillStyle = '#10151b'; c.fill();
        if (i === 0) { K.rr(c, bx + 30, by + 120, 260, 56, 6); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill(); c.setLineDash([6, 6]); c.strokeStyle = C.muted; c.stroke(); c.setLineDash([]); X.label(c, 'PLACEHOLDER  ·  .MOV', bx + 160, by + 155, { size: 18, color: C.muted, align: 'center', w: 600 }); }
        else if (i === 1) { c.direction = 'rtl'; K.setText(c, K.font(34, 'Geeza Pro', 600), C.ink, 0, 'right'); c.fillText('دانيال منسا', bx + bw - 40, by + 150); c.direction = 'ltr'; c.fillStyle = C.coral; c.fillRect(bx + bw - 34, by + 110, 4, 60); }
        else { K.setText(c, X.F(30, 600), C.ink); c.fillText('Daniel Mensah', bx + 30, by + 150); c.strokeStyle = C.gold; c.lineWidth = 2; const typ = K.clamp((t - t0 - .6) / 1.2); c.fillStyle = C.gold; if (typ < 1) c.fillRect(bx + 30 + K.width(c, 'Daniel Mensah', X.F(30, 600)) * typ, by + 120, 3, 36); }
        if (i >= 1) tag('re-created', bx, by + bh + 42, C.coral, K.E(t, t0 + .8, t0 + 1.3));
        if (i > 0) X.arrow(c, [x - 26, y + 245], [x - 6, y + 245], K.E(t, t0 - .2, t0 + .3), C.muted, 2.5);
        c.restore(); });
      c.restore(); }

    // ---- 3. the side documents (lines 5–8)
    a = X.sc(t, T(5) - .1, T(9) - .1, .6, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'Holding it together', 160, 170, K.P(t, T(5), T(5) + 1)); X.title(c, 'A second set of documents', 160, 250, K.P(t, T(5) + .2, T(5) + 1.6), { size: 54 });
      const docs = ['Style guide', 'MEPS details', 'MEPS references', 'Art references'];
      const dim = K.E(t, T(8), T(8) + 1);
      docs.forEach((s, i) => { const t0 = T(6) + i * .6, k = K.E(t, t0, t0 + .7, 'out5'); c.save(); c.globalAlpha = 1 - dim * .55; doc(180 + i * 250, 360 + (i % 2) * 30, 300, 380, s, k, (i - 1.5) * .05); c.restore(); });
      // annotations: placement, font, translation boundary
      const an = K.E(t, T(7), T(7) + 1); if (an > 0) { c.globalAlpha = a * an * (1 - dim * .55);
        const bx = 1250, by = 380; X.panel(c, bx, by, 520, 300, { r: 10, fill: '#10151b' }); c.setLineDash([8, 6]); c.strokeStyle = C.coral; c.lineWidth = 2; c.strokeRect(bx + 40, by + 150, 380, 90); c.setLineDash([]);
        K.setText(c, X.F(34, 600), C.ink); c.fillText('Daniel Mensah', bx + 60, by + 208); tag('translation boundary', bx + 40, by + 132, C.coral); tag('font · 34 px', bx + 40, by + 280, C.gold); tag('x 170 · y 868', bx + 250, by + 280, C.teal); }
      if (dim > 0) { c.globalAlpha = a * dim; X.icon(c, 'person', 1270, 800, 1.1, C.ink); c.strokeStyle = C.gold; c.lineWidth = 4; c.beginPath(); c.arc(1360, 780, 26, 0, K.TAU); c.stroke(); c.beginPath(); c.moveTo(1379, 799); c.lineTo(1402, 822); c.stroke();
        X.label(c, 'Which file is current?', 1430, 800, { size: 28, color: C.gold, w: 600 }); X.label(c, 'rarely seen in the editor’s workflow', 1430, 836, { size: 20, color: C.muted }); }
      c.restore(); }

    // ---- 4. the cost (lines 9–12)
    a = X.sc(t, T(9) - .1, T(13) - .1, .6, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'The cost', 160, 170, K.P(t, T(9), T(9) + 1)); X.title(c, 'Copies drift. Projects wait.', 160, 250, K.P(t, T(9) + .2, T(9) + 1.6), { size: 54 });
      const copies = [['Timeline', 'Daniel Mensah', C.ink], ['RTL project', 'Daniel Mensah', C.ink], ['MEPS canvas', 'Daniel Mensa', C.coral], ['PowerPoint', 'Daniel Mensah, Ghana', C.coral]];
      copies.forEach(([src, s, col], i) => { const k = K.E(t, T(9) + .4 + i * .35, T(9) + .9 + i * .35, 'out5'); if (k <= 0) return; c.globalAlpha = a * k; const y = 340 + i * 78;
        X.label(c, src, 160, y, { size: 22, color: C.muted }); const drift = i >= 2 ? K.E(t, T(10), T(10) + .8) : 0; K.setText(c, X.F(32, 600), K.lerpc('#eef0f3', '#e08a6d', drift)); c.fillText(i >= 2 && drift < .5 ? 'Daniel Mensah' : s, 400, y);
        if (drift > .5) tag('drifted', 800, y - 2, C.coral, (drift - .5) * 2); });
      const nm = K.E(t, T(10) + 1.2, T(10) + 2); if (nm > 0) { c.globalAlpha = a * nm; X.label(c, 'no single master', 160, 680, { size: 26, color: C.gold, w: 600 }); }
      // stalled project bar
      const st = K.E(t, T(11), T(11) + .6); if (st > 0) { c.globalAlpha = a * st; const bx = 1080, by = 360; X.panel(c, bx, by - 50, 680, 170, { r: 12 }); X.label(c, 'Project', bx + 30, by, { size: 24, w: 600 });
        c.fillStyle = C.line; c.fillRect(bx + 30, by + 30, 620, 14); const prog = .58 * K.E(t, T(11), T(11) + 1.6, 'out'); c.fillStyle = C.teal; c.fillRect(bx + 30, by + 30, 620 * prog, 14);
        const pulse = .5 + .5 * Math.sin(t * 3); if (t > T(11) + 1.6) { X.label(c, 'waiting for the right file…', bx + 30, by + 86, { size: 22, color: K.lerpc('#8d99a8', '#d8b36f', pulse) }); } }
      // onboarding
      const on = K.E(t, T(12), T(12) + .8); if (on > 0) { c.globalAlpha = a * on; const cx = 1420, cy = 720; X.icon(c, 'person', cx, cy, 1.2, C.ink); X.label(c, 'New staff', cx, cy + 70, { size: 22, color: C.muted, align: 'center' });
        ['MEPS composition', 'MEPS details', 'RTL AE template', 'house conventions', 'art references'].forEach((s, i) => { const k = K.E(t, T(12) + .3 + i * .25, T(12) + .7 + i * .25); const ang = -Math.PI * .95 + i * Math.PI * .47, r = 250; if (k > 0) tag(s, cx + Math.cos(ang) * r - 80, cy + Math.sin(ang) * r * .55 + 10, C.gold, k); }); }
      c.restore(); }

    // ---- 5. the code-driven workflow (lines 13–20)
    a = X.sc(t, T(13) - .1, T(21) - .1, .6, .6);
    if (a > 0) { c.save(); c.globalAlpha = a; X.kicker(c, 'The code-driven workflow', 160, 150, K.P(t, T(13), T(13) + 1)); X.title(c, 'Start from the text', 160, 225, K.P(t, T(13) + .2, T(13) + 1.4), { size: 54 });
      // the one table
      const rows = [['TEXT', 'FONT', 'X · Y', 'IN–OUT', 'LANG'], ['Daniel Mensah', 'Avenir 60', '170 · 868', '0.5–6.5', 'en'], ['Lucía Fernández', 'Avenir 60', '170 · 868', '0.5–6.5', 'es'], ['يوسف حداد', 'Geeza 60', 'mirrored', '0.5–6.5', 'ar'], ['佐藤 美咲', 'Hiragino 60', '170 · 868', '0.5–6.5', 'ja']];
      const tk = K.E(t, T(14), T(14) + .6); if (tk > 0) { c.globalAlpha = a * tk; const sx = 160, sy = 300, cw = [220, 150, 140, 110, 60]; X.panel(c, sx - 20, sy - 20, 720, 330, { r: 10 });
        rows.forEach((r, i) => { const k = K.E(t, T(14) + .2 + i * .2, T(14) + .6 + i * .2); c.globalAlpha = a * tk * k; let x = sx; r.forEach((cell, j) => { const fam = /[؀-ۿ]/.test(cell) ? 'Geeza Pro' : /[぀-ヿ一-鿿]/.test(cell) ? 'Hiragino Sans' : 'Avenir Next'; K.setText(c, K.font(i ? 21 : 16, fam, i ? 500 : 600), i ? C.ink : C.gold, i ? 0 : 3); c.fillText(cell, x, sy + 20 + i * 58); x += cw[j]; }); c.fillStyle = C.line; c.fillRect(sx - 20, sy + 40 + i * 58, 720, 1); });
        c.globalAlpha = a * tk; X.label(c, 'one table · the only copy of the words', 160, 670, { size: 22, color: C.gold }); }
      // template = style guide
      const tp = K.E(t, T(15), T(15) + .7, 'out5'); if (tp > 0) { c.globalAlpha = a * tp; X.arrow(c, [890, 460], [960, 460], tp, C.gold, 3); X.panel(c, 980, 300, 380, 330, { r: 12, fill: '#10151b' }); X.label(c, 'lower-third.js', 1005, 340, { size: 20, color: C.muted });
        X.code(c, ["K.setText(c, font, ink);", "c.fillText(p.name,", "  x: 170, y: 868);", "if (p.rtl) mirror();", "fitWidth(p.name);"], 1005, 390, K.P(t, T(15) + .3, T(16) + 2), { size: 19, lh: 40 });
        const sg = K.E(t, T(16), T(16) + .7); if (sg > 0) { c.globalAlpha = a * sg; tag('the template is the style guide', 980, 670, C.teal); } }
      // outputs: LTR + RTL + fits each translation
      const out = [[p.img.en, T(17) - .6, 'English'], [p.img.ar, T(17), 'العربية · mirrored'], [p.img.ja, T(18), '日本語'], [p.img.es, T(18) + .5, 'Español · longer text fits']];
      out.forEach(([im, t0, l], i) => { const k = K.E(t, t0, t0 + .6, 'out5'); if (k <= 0 || !im) return; c.globalAlpha = a * k; const x = 1400, y = 290 + i * 118, w = 380, h = 80;
        const hl = (i === 1 ? K.bell(t, T(17), T(17) + .4, T(18) - .4, T(18)) : 0) + (i === 3 ? K.bell(t, T(18) + .5, T(18) + .9, T(19) - .3, T(19)) : 0);
        c.save(); K.rr(c, x, y, w, h, 6); c.clip(); const rtl = i === 1; c.drawImage(im, rtl ? im.width * .52 : 0, im.height * .72, im.width * .48, im.height * .2, x, y, w, h); c.restore(); K.rr(c, x + .5, y + .5, w - 1, h - 1, 6); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.stroke(); if (hl > 0) { K.rr(c, x, y, w, h, 6); c.strokeStyle = K.rgba('#d8b36f', hl); c.lineWidth = 3; c.stroke(); }
        K.setText(c, K.font(15, /[؀-ۿ]/.test(l) ? 'Geeza Pro' : /[぀-ヿ]/.test(l) ? 'Hiragino Sans' : 'Avenir Next', 500), C.muted); c.fillText(l, x, y + h + 20); });
      if (t > T(17) - .6) { c.globalAlpha = a * K.E(t, T(17) - .6, T(17)); X.arrow(c, [1370, 460], [1392, 460], 1, C.gold, 3); }
      // downstream: translation package (could) and ProRes to the editor
      const pk = K.E(t, T(19), T(19) + .7); if (pk > 0) { c.globalAlpha = a * pk; c.setLineDash([8, 7]); X.arrow(c, [480, 690], [480, 760], pk, C.muted, 2.5); c.setLineDash([]); card(300, 770, 520, 120, pk, 'Translation package', 'could be generated from the table', C.muted); }
      const pr = K.E(t, T(20), T(20) + .7); if (pr > 0) { c.globalAlpha = a * pr; X.arrow(c, [1560, 745], [1560, 765], pr, C.teal, 2.5); card(1180, 770, 600, 120, pr, 'ProRes 4444 with transparency', 'drops into the editor’s timeline', C.teal); }
      c.restore(); }

    // ---- 6. close (line 21 → end)
    a = X.sc(t, T(21) - .1, 108, .7, 1.4);
    if (a > 0) { c.save(); c.globalAlpha = a;
      X.title(c, 'One table. One template. Every language.', W / 2, 430, K.P(t, T(21), T(21) + 1.4), { size: 62, align: 'center' });
      X.title(c, 'Fewer copies · fewer documents · fewer delays', W / 2, 540, K.P(t, T(22), T(22) + 1.4), { size: 40, align: 'center', color: C.gold, w: 500 });
      c.restore(); }
    X.captions(c, t, p.caps);
    K.grain(c, t, .025);
  } });
