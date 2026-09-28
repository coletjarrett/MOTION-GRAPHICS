// LOWER-THIRD COLLECTION — rtl-ready. The plate design, mirrored for right-to-left scripts: tab on the right,
// plate opens leftward, text right-aligned. Defaults show Arabic in Geeza Pro; rtl:false + a Latin family flips it
// back. Never animate Arabic per letter (it breaks joining); whole lines slide instead.
(() => {
  const FONTS = ['600 54px "Avenir Next"', '500 31px "Avenir Next"', '700 54px "Geeza Pro"', '400 31px "Geeza Pro"',
    '600 54px "Hiragino Sans"', '400 31px "Hiragino Sans"', '600 54px "Apple SD Gothic Neo"', '400 31px "Apple SD Gothic Neo"'];
  K.template({ id: 'l3-rtl-ready', title: 'Plate (right-to-left)', style: 'Lower-Third Collection', type: 'Lower third', dur: 7, alpha: true, fonts: FONTS,
    params: { name: 'مريم خوري', role: 'متطوعة في الترجمة', accent: '#d9a441', plate: '#1b1e23', opacity: .85, ink: '#ffffff',
      x: 170, y: 944, family: 'Geeza Pro', rtl: true },
    draw(c, t, p) {
      const W = K.W, rtl = !!p.rtl, latin = p.family === 'Avenir Next';
      const TAB = 10, PL = 32, PR = 42, H = 136, x = p.x, y0 = p.y - H;
      const trN = rtl ? 0 : .3, trR = rtl ? 0 : .4;
      c.direction = rtl ? 'rtl' : 'ltr';
      // fit: shrink type if the text would run past the far title-safe edge
      let fN, fR, wN, wR;
      const mk = k => { fN = K.font(54 * k, p.family, rtl ? 700 : 600); fR = K.font(31 * k, p.family, latin ? 500 : 400);
        wN = K.width(c, p.name, fN, trN); wR = K.width(c, p.role, fR, trR); };
      mk(1); const fit = (W - 150 - x - TAB - PL - PR) / Math.max(wN, wR); if (fit < 1) mk(fit);
      const full = TAB + PL + Math.max(wN, wR) + PR;
      const span = (lx, w) => rtl ? W - lx - w : lx, TX = lx => rtl ? W - lx : lx;
      const hk = K.E(t, 0, .45, 'out5') * (1 - K.E(t, 6.15, 6.55, 'in5'));
      const wk = K.E(t, .2, 1.0, 'out5') * (1 - K.E(t, 5.8, 6.35, 'io5'));
      const h = H * hk, w = TAB + (full - TAB) * wk;
      if (h < .5) return;
      const top = y0 + (H - h) / 2;
      c.save();
      c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 8;
      K.rr(c, span(x, w), top, w, h, Math.min(10, h / 2)); c.fillStyle = K.rgba(p.plate, p.opacity); c.fill();
      c.shadowColor = 'transparent'; c.clip();
      c.fillStyle = p.accent; c.fillRect(span(x, TAB), top, TAB, h);
      if (w > TAB + 1) {
        c.beginPath(); c.rect(span(x + TAB, w - TAB), top, w - TAB, h); c.clip();
        const kN = K.E(t, .45, 1.15, 'out5'), kR = K.E(t, .65, 1.3, 'out5'), oN = K.E(t, 5.55, 6.0, 'in'), oR = K.E(t, 5.45, 5.9, 'in');
        const ax = x + TAB + PL, al = rtl ? 'right' : 'left';
        c.globalAlpha = kN * (1 - oN); K.setText(c, fN, p.ink, trN, al); c.fillText(p.name, TX(ax - (1 - kN) * 40 - oN * 30), y0 + 72);
        c.globalAlpha = kR * (1 - oR); K.setText(c, fR, K.rgba(p.ink, .8), trR, al); c.fillText(p.role, TX(ax - (1 - kR) * 50 - oR * 30), y0 + 111);
      }
      c.restore();
    } });
})();
