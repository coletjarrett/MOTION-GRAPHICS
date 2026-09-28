// SOFT LIGHT — lower third. A frosted-glass pill with a small warm light inside slides in, then opens into a
// panel; the name resolves out of a soft blur, the role follows, and a single glint travels across the glass.
// On exit the panel folds back into the pill and slips away. (A real frosted blur of the footage behind is
// added in the editor; this emulates the look with translucency, a darkening tint and a bright top edge.)
(() => {
  const glass = (c, x, y, w, h, r, a = 1, o = {}) => {
    if (a <= 0 || w <= 0) return;
    c.save(); c.beginPath(); c.rect(-5000, -5000, 12000, 12000); K.rr(c, x, y, w, h, r); c.clip('evenodd');
    c.shadowColor = `rgba(18,12,8,${(o.shadow ?? .3) * a})`; c.shadowBlur = 44; c.shadowOffsetX = 9000; c.shadowOffsetY = 14;
    K.rr(c, x - 9000, y, w, h, r); c.fillStyle = '#000'; c.fill(); c.restore();
    c.save(); K.rr(c, x, y, w, h, r); c.clip();
    c.fillStyle = `rgba(${o.tint || '34,28,26'},${(o.dark ?? .16) * a})`; c.fillRect(x, y, w, h);
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgba(255,255,255,${.2 * a})`); g.addColorStop(.45, `rgba(255,255,255,${.1 * a})`); g.addColorStop(1, `rgba(255,255,255,${.13 * a})`);
    c.fillStyle = g; c.fillRect(x, y, w, h);
    const d = c.createRadialGradient(x + h * .5, y + h * .5, 0, x + h * .5, y + h * .5, Math.max(w, h) * .8);
    d.addColorStop(0, `rgba(255,226,186,${.16 * a})`); d.addColorStop(1, 'rgba(255,226,186,0)'); c.fillStyle = d; c.fillRect(x, y, w, h);
    c.restore();
    const e = c.createLinearGradient(0, y, 0, y + h);
    e.addColorStop(0, `rgba(255,255,255,${.9 * a})`); e.addColorStop(.3, `rgba(255,255,255,${.24 * a})`); e.addColorStop(1, `rgba(255,255,255,${.1 * a})`);
    c.save(); c.lineWidth = 1; c.strokeStyle = e; K.rr(c, x + .5, y + .5, w - 1, h - 1, Math.max(0, r - .5)); c.stroke(); c.restore();
  };
  const glint = (c, x, y, w, h, r, k) => { if (k <= 0 || k >= 1) return; c.save(); K.rr(c, x, y, w, h, r); c.clip(); const gx = K.mix(x - 300, x + w + 300, K.ease.io(k));
    const g = c.createLinearGradient(gx - 200, 0, gx + 200, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.14 * Math.sin(Math.PI * k)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.setTransform(c.getTransform().translate(gx, y + h / 2).multiply(new DOMMatrix([1, 0, -.5, 1, 0, 0])).translate(-gx, -(y + h / 2))); c.fillStyle = g; c.fillRect(gx - 200, y - 50, 400, h + 100); c.restore(); };
  const orb = (col) => K.cached(`slOrb${col}`, 120, 120, c => {
    const g = c.createRadialGradient(60, 60, 0, 60, 60, 60);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.12, K.rgba(col, 1)); g.addColorStop(.3, K.rgba(col, .35)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, 120, 120);
  });

  K.template({ id: 'light-lower-third', title: 'Lower third', style: 'Soft Light', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['500 52px "Avenir Next"', '400 30px "Avenir Next"'],
    params: { name: 'Mariana Costa', role: 'Regular pioneer, Portugal', light: '#ffc27a', x: 150, y: 790, h: 142 },
    draw(c, t, p) {
      const { x, y, h } = p, r = h / 2;
      const fN = K.font(52, 'Avenir Next', 500), fR = K.font(30, 'Avenir Next', 400);
      const wN = K.width(c, p.name, fN, .3), wR = K.width(c, p.role, fR, .6);
      const pad = 118, W1 = pad + Math.max(wN, wR) + 60;
      // in: pill slides + fades in (0–.8), opens (.55–1.5). out: closes (5.6–6.3), slips away (6.1–6.8)
      const kin = K.E(t, 0, .8, 'out5'), kopen = K.E(t, .55, 1.5, 'out5') * (1 - K.E(t, 5.6, 6.3, 'io5')), kout = K.E(t, 6.05, 6.75, 'in');
      const a = kin * (1 - kout); if (a <= 0) return;
      const px = x - 50 * (1 - kin) - 40 * kout, w = K.mix(h, W1, kopen), rad = K.mix(r, 30, kopen);
      glass(c, px, y, w, h, rad, a, { dark: .2, shadow: .28 });
      glint(c, px, y, w, h, rad, K.P(t, 1.4, 2.6));
      // the small warm light: centred in the pill, glides to its seat on the left as the panel opens
      const ox = px + K.mix(h / 2, 62, kopen), oy = y + h / 2, pulse = 1 + .06 * Math.sin(t * 2.2);
      const ok = K.E(t, .15, .9, 'out') * (1 - kout);
      c.save(); c.globalAlpha = ok; c.globalCompositeOperation = 'lighter'; const ob = orb(p.light); c.drawImage(ob, ox - 60 * pulse, oy - 60 * pulse, 120 * pulse, 120 * pulse); c.restore();
      // a hairline divider between light and text
      const dv = K.E(t, .9, 1.5, 'out5') * (1 - K.E(t, 5.5, 6.0, 'in'));
      if (dv > 0) { c.fillStyle = `rgba(255,255,255,${.35 * dv})`; const dh = (h - 52) * dv; c.fillRect(px + 100, oy - dh / 2, 1, dh); }
      // text, clipped to the glass
      c.save(); K.rr(c, px, y, w, h, rad); c.clip();
      const tout = K.P(t, 5.3, 5.9), sh = ['rgba(0,0,0,.28)', 10, 1];
      K.reveal(c, p.name, px + pad + 14 * (1 - K.E(t, .8, 1.8, 'out5')), y + 67, { font: fN, color: '#ffffff', track: .3, k: K.P(t, .85, 1.9) * (1 - tout), mode: 'blur', stagger: .4, shadow: sh });
      K.reveal(c, p.role, px + pad + 14 * (1 - K.E(t, 1.1, 2.1, 'out5')), y + 108, { font: fR, color: 'rgba(255,248,238,.9)', track: .6, k: K.P(t, 1.15, 2.2) * (1 - tout), mode: 'fade', stagger: .35, shadow: sh });
      c.restore();
    } });
})();
