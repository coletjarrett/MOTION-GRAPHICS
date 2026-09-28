// CLEAN MINIMAL — lower third. A hairline accent grows, the name slides out from behind it, the role follows.
// Works in any script: set rtl:true for Arabic/Hebrew (the layout mirrors), and a family per language.
K.template({ id: 'minimal-lower-third', title: 'Lower third', style: 'Clean Minimal', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['600 60px "Avenir Next"', '400 34px "Avenir Next"', '600 60px "Hiragino Sans"', '600 60px "Apple SD Gothic Neo"', '600 60px "Geeza Pro"', '600 60px "Kohinoor Devanagari"', '600 60px "PingFang SC"'],
  params: { name: 'Daniel Mensah', role: 'Construction volunteer, Ghana', accent: '#e8c27a', x: 170, y: 868, family: 'Avenir Next', rtl: false, lang: '' },
  draw(c, t, p) {
    const W = K.W, s = p.rtl ? -1 : 1, X = v => p.rtl ? W - v : v, { y } = p, x = p.x, out = 1 - K.E(t, 5.7, 6.5, 'in');
    const fN = K.font(60, p.family, 600), fR = K.font(34, p.family, p.family === 'Avenir Next' ? 400 : 300);
    c.direction = p.rtl ? 'rtl' : 'ltr';
    const wN = K.width(c, p.name, fN, .5), wR = K.width(c, p.role, fR, 1), wMax = Math.max(wN, wR);
    // soft legibility scrim that hugs the text
    const sc = K.E(t, .2, 1.2) * out; if (sc > 0) { const w = x + wMax + 140; c.save(); c.filter = 'blur(55px)'; c.fillStyle = `rgba(0,0,0,${.4 * sc})`; c.fillRect(p.rtl ? W - w : -100, y - 95, w + 100, 170); c.restore(); }
    const lh = 112 * K.E(t, .25, .85, 'out5') * (1 - K.E(t, 6.0, 6.6, 'in5'));
    c.fillStyle = p.accent; c.fillRect(p.rtl ? X(x) - 5 : x, y - 70 + (112 - lh) / 2, 5, lh);
    c.save(); c.beginPath(); p.rtl ? c.rect(X(x) - 6 - 2000, y - 200, 2000, 400) : c.rect(x + 6, y - 200, 2000, 400); c.clip();
    const kN = K.E(t, .55, 1.35, 'out5');
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 12; c.shadowOffsetY = 2;
    c.globalAlpha = out; K.setText(c, fN, '#fff', p.rtl ? 0 : .5, p.rtl ? 'right' : 'left'); c.fillText(p.name, X(x + 32 - (1 - kN) * (wN + 40) - (1 - out) * 40), y - 8);
    const kR = K.E(t, .95, 1.7, 'out5'); c.globalAlpha = kR * out; K.setText(c, fR, 'rgba(255,255,255,.88)', p.rtl ? 0 : 1, p.rtl ? 'right' : 'left'); c.fillText(p.role, X(x + 32 - (1 - kR) * 60 - (1 - out) * 30), y + 40);
    c.restore();
  } });
