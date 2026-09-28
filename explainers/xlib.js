// Shared helpers for the narrated explainer videos (dark "studio" look, gold accent, burned-in captions).
(() => {
  const X = window.X = {};
  X.C = { bg0: '#0f141b', bg1: '#18202a', panel: '#1b2430', line: '#2e3a48', ink: '#eef0f3', muted: '#8d99a8', gold: '#d8b36f', teal: '#6fb5b0', coral: '#e08a6d', green: '#8fbf7f' };
  X.F = (s, w = 500, f = 'Avenir Next') => K.font(s, f, w);
  X.load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  X.json = async src => { try { return await (await fetch(src)).json(); } catch (e) { return null; } };
  // scene envelope: fade in over fi at a, fade out over fo ending at b
  X.sc = (t, a, b, fi = .6, fo = .6) => K.clamp(Math.min((t - a) / fi, (b - t) / fo));
  X.bg = (c, t) => { const W = K.W, H = K.H; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, X.C.bg1); g.addColorStop(1, X.C.bg0); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = c.createRadialGradient(W * .5 + Math.sin(t * .05) * 200, H * .35, 0, W * .5, H * .4, W * .7); r.addColorStop(0, 'rgba(216,179,111,.07)'); r.addColorStop(1, 'rgba(216,179,111,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,.025)'; c.lineWidth = 1; for (let x = 0; x < W; x += 80) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, H); c.stroke(); } for (let y = 0; y < H; y += 80) { c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W, y + .5); c.stroke(); } };
  X.panel = (c, x, y, w, h, o = {}) => { c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 14; K.rr(c, x, y, w, h, o.r ?? 14); c.fillStyle = o.fill || X.C.panel; c.fill(); c.restore(); K.rr(c, x + .5, y + .5, w - 1, h - 1, o.r ?? 14); c.strokeStyle = o.stroke || 'rgba(255,255,255,.08)'; c.lineWidth = 1; c.stroke(); };
  X.label = (c, s, x, y, o = {}) => { K.setText(c, X.F(o.size || 30, o.w || 500), o.color || X.C.ink, o.track || 0, o.align || 'left'); c.fillText(s, x, y); };
  X.kicker = (c, s, x, y, k, o = {}) => K.reveal(c, s.toUpperCase(), x, y, { font: X.F(o.size || 24, 600), color: o.color || X.C.gold, track: 7, align: o.align || 'left', k, mode: 'fade', stagger: .4 });
  X.title = (c, s, x, y, k, o = {}) => K.reveal(c, s, x, y, { font: X.F(o.size || 64, o.w || 600), color: o.color || X.C.ink, align: o.align || 'left', k, mode: 'rise', dist: 30, stagger: .35, by: 'word' });
  // simple syntax colouring for a JS snippet; k = fraction typed
  X.code = (c, lines, x, y, k, o = {}) => {
    const lh = o.lh || 40, f = K.font(o.size || 26, 'Menlo', 400), total = lines.join('\n').length, shown = Math.floor(total * K.clamp(k)); let used = 0;
    c.font = f; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.letterSpacing = '0px';
    lines.forEach((ln, i) => { const n = Math.max(0, Math.min(ln.length, shown - used)); used += ln.length + 1; const s = ln.slice(0, n); let cx = x;
      for (const tok of s.split(/(\s+|[(){}\[\],.;:=+\-*\/<>]|'[^']*'?)/).filter(Boolean)) {
        c.fillStyle = /^'/.test(tok) ? X.C.green : /^(const|let|return|function|if|for|of|new)$/.test(tok) ? X.C.coral : /^(K|c|t|p|draw)$/.test(tok) ? X.C.teal : /^\/\//.test(tok) ? X.C.muted : /^[0-9.]+$/.test(tok) ? X.C.gold : X.C.ink;
        c.fillText(tok, cx, y + i * lh); cx += c.measureText(tok).width; }
      if (n < ln.length && n > 0 || (n === 0 && used - ln.length - 1 === shown)) { if (Math.floor(K.params()._t * 2) % 2 === 0) { c.fillStyle = X.C.gold; c.fillRect(cx + 2, y + i * lh - 22, 12, 28); } } });
  };
  // burned-in captions from captions.json
  X.captions = (c, t, caps) => { if (!caps) return; const cur = caps.find(q => t >= q.a && t <= q.b + .15); if (!cur) return; const a = K.clamp(Math.min((t - cur.a) / .15, (cur.b + .15 - t) / .15));
    const f = X.F(34, 500), w = K.width(c, cur.text, f); c.save(); c.globalAlpha = a; K.rr(c, K.W / 2 - w / 2 - 22, K.H - 118, w + 44, 58, 10); c.fillStyle = 'rgba(8,11,15,.72)'; c.fill(); K.setText(c, f, '#fff', 0, 'center'); c.fillText(cur.text, K.W / 2, K.H - 78); c.restore(); };
  // a small icon set drawn from primitives (stroke style, 64px box centred at x,y)
  X.icon = (c, name, x, y, s = 1, col = X.C.ink, k = 1) => {
    c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3.2 / s * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha *= k;
    const P = (pts) => { K.line(c, pts); c.stroke(); };
    if (name === 'doc') { K.rr(c, -22, -30, 44, 60, 5); c.stroke(); P([[-12, -12], [12, -12]]); P([[-12, 0], [12, 0]]); P([[-12, 12], [4, 12]]); }
    else if (name === 'ai') { K.rr(c, -26, -26, 52, 52, 12); c.stroke(); for (const [a, b] of [[-10, -6], [10, -6]]) { c.beginPath(); c.arc(a, b, 4, 0, K.TAU); c.fill(); } P([[-10, 10], [10, 10]]); for (const d of [-26, 26]) { P([[d, 0], [d * 1.35, 0]]); P([[0, d], [0, d * 1.35]]); } }
    else if (name === 'eye') { c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(0, -30, 30, 0); c.quadraticCurveTo(0, 30, -30, 0); c.stroke(); c.beginPath(); c.arc(0, 0, 9, 0, K.TAU); c.fill(); }
    else if (name === 'person') { c.beginPath(); c.arc(0, -14, 12, 0, K.TAU); c.stroke(); c.beginPath(); c.arc(0, 30, 26, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else if (name === 'frames') { for (let i = 2; i >= 0; i--) { K.rr(c, -26 + i * 7, -22 - i * 7, 44, 34, 4); c.fillStyle = X.C.panel; c.fill(); c.stroke(); } }
    else if (name === 'browser') { K.rr(c, -32, -24, 64, 48, 6); c.stroke(); P([[-32, -12], [32, -12]]); for (const d of [-24, -16, -8]) { c.beginPath(); c.arc(d, -18, 2, 0, K.TAU); c.fill(); } }
    else if (name === 'film') { K.rr(c, -30, -22, 60, 44, 4); c.stroke(); for (let i = -2; i <= 2; i++) { c.fillRect(i * 11 - 3, -18, 6, 5); c.fillRect(i * 11 - 3, 13, 6, 5); } c.beginPath(); c.moveTo(-6, -8); c.lineTo(10, 0); c.lineTo(-6, 8); c.closePath(); c.fill(); }
    else if (name === 'wave') { K.line(c, Array.from({ length: 41 }, (_, i) => [-30 + i * 1.5, Math.sin(i * .9) * (6 + 12 * K.noise(i * .3, 0, 3))])); c.stroke(); }
    else if (name === 'check') { c.beginPath(); c.arc(0, 0, 26, 0, K.TAU); c.stroke(); P([[-11, 1], [-3, 9], [12, -8]]); }
    c.restore(); };
  // arrow from a to b drawn to k
  X.arrow = (c, a, b, k, col = X.C.muted, w = 3) => { if (k <= 0) return; const pts = [a, b]; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; K.draw(c, pts, k); if (k > .95) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); c.fillStyle = col; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - 14 * Math.cos(ang - .45), b[1] - 14 * Math.sin(ang - .45)); c.lineTo(b[0] - 14 * Math.cos(ang + .45), b[1] - 14 * Math.sin(ang + .45)); c.closePath(); c.fill(); } };
  X.img = (c, im, x, y, w, h, o = {}) => { if (!im) { c.fillStyle = '#222'; c.fillRect(x, y, w, h); return; } c.save(); K.rr(c, x, y, w, h, o.r ?? 8); c.clip(); const s = Math.max(w / im.width, h / im.height); c.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s); c.restore(); if (o.border !== false) { K.rr(c, x + .5, y + .5, w - 1, h - 1, o.r ?? 8); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.stroke(); } };
})();
