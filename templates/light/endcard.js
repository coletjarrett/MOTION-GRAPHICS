// SOFT LIGHT — end card. A settled morning glow with drifting bokeh; the thank-you resolves out of a soft
// blur, and two frosted-glass 16:9 placeholders rise in for the editor's 'Next episode' and 'Related video'
// end-screen clips (drop them in at x 280 / 1000, y 410, 640×360). Everything settles away before the end.
(() => {
  // ---------- soft-light kit (self-contained; every sprite is rendered once and cached) ----------
  const glow = (col, r, hard = .35) => K.cached(`slGlow${col}${r}${hard}`, r * 2, r * 2, c => {
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, K.rgba(col, 1)); g.addColorStop(hard, K.rgba(col, .42)); g.addColorStop(.7, K.rgba(col, .1)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, r * 2, r * 2);
  });
  // a bokeh disc: flat soft body, slightly brighter rim, a hair of blur
  const disc = (col, soft = 2) => K.cached(`slDisc${col}${soft}`, 160, 160, c => {
    c.filter = `blur(${soft}px)`;
    const g = c.createRadialGradient(80, 80, 0, 80, 80, 64);
    g.addColorStop(0, K.rgba(col, .5)); g.addColorStop(.8, K.rgba(col, .6)); g.addColorStop(.94, K.rgba(col, .95)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(80, 80, 64, 0, K.TAU); c.fill();
  });
  // a thin horizontal anamorphic streak
  const streak = (col) => K.cached(`slStreak${col}`, 2400, 60, c => {
    const g = c.createLinearGradient(0, 0, 2400, 0);
    g.addColorStop(0, K.rgba(col, 0)); g.addColorStop(.35, K.rgba(col, .25)); g.addColorStop(.5, K.rgba(col, 1)); g.addColorStop(.65, K.rgba(col, .25)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, 2400, 60);
    const v = c.createLinearGradient(0, 0, 0, 60); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalCompositeOperation = 'destination-in'; c.fillStyle = v; c.fillRect(0, 0, 2400, 60);
  });
  // a soft diagonal beam of light
  const beam = () => K.cached('slBeam', 900, 2400, c => {
    const g = c.createLinearGradient(0, 0, 900, 0);
    g.addColorStop(0, 'rgba(255,226,186,0)'); g.addColorStop(.5, 'rgba(255,226,186,1)'); g.addColorStop(1, 'rgba(255,226,186,0)');
    c.fillStyle = g; c.fillRect(0, 0, 900, 2400);
    const v = c.createLinearGradient(0, 0, 0, 2400); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalCompositeOperation = 'destination-in'; c.fillStyle = v; c.fillRect(0, 0, 900, 2400);
  });
  const sprite = (c, cv, x, y, s, a, op = 'screen') => { if (a <= 0 || s <= 0) return; c.save(); c.globalCompositeOperation = op; c.globalAlpha = Math.min(1, a); c.drawImage(cv, x - cv.width * s / 2, y - cv.height * s / 2, cv.width * s, cv.height * s); c.restore(); };
  // frosted-glass panel: outer soft shadow (outside only), light tint, inner gradient, 1px bright top edge
  const glass = (c, x, y, w, h, r, a = 1, o = {}) => {
    if (a <= 0 || w <= 0) return;
    c.save(); c.beginPath(); c.rect(-5000, -5000, 12000, 12000); K.rr(c, x, y, w, h, r); c.clip('evenodd');
    c.shadowColor = `rgba(24,14,8,${(o.shadow ?? .3) * a})`; c.shadowBlur = 48; c.shadowOffsetX = 9000; c.shadowOffsetY = 16;
    K.rr(c, x - 9000, y, w, h, r); c.fillStyle = '#000'; c.fill(); c.restore();
    c.save(); K.rr(c, x, y, w, h, r); c.clip();
    c.fillStyle = `rgba(${o.tint || '40,28,22'},${(o.dark ?? .16) * a})`; c.fillRect(x, y, w, h);
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgba(255,255,255,${.2 * a})`); g.addColorStop(.45, `rgba(255,255,255,${.1 * a})`); g.addColorStop(1, `rgba(255,255,255,${.14 * a})`);
    c.fillStyle = g; c.fillRect(x, y, w, h);
    const d = c.createRadialGradient(x + w * .2, y, 0, x + w * .2, y, Math.max(w, h) * .9);
    d.addColorStop(0, `rgba(255,244,228,${.12 * a})`); d.addColorStop(1, 'rgba(255,244,228,0)'); c.fillStyle = d; c.fillRect(x, y, w, h);
    c.restore();
    const e = c.createLinearGradient(0, y, 0, y + h);
    e.addColorStop(0, `rgba(255,255,255,${.85 * a})`); e.addColorStop(.3, `rgba(255,255,255,${.22 * a})`); e.addColorStop(1, `rgba(255,255,255,${.1 * a})`);
    c.save(); c.lineWidth = 1; c.strokeStyle = e; K.rr(c, x + .5, y + .5, w - 1, h - 1, Math.max(0, r - .5)); c.stroke(); c.restore();
  };
  const glint = (c, x, y, w, h, r, k) => { if (k <= 0 || k >= 1) return; c.save(); K.rr(c, x, y, w, h, r); c.clip(); const gx = K.mix(x - 300, x + w + 300, K.ease.io(k));
    const g = c.createLinearGradient(gx - 200, 0, gx + 200, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.12 * Math.sin(Math.PI * k)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.setTransform(c.getTransform().translate(gx, y + h / 2).multiply(new DOMMatrix([1, 0, -.5, 1, 0, 0])).translate(-gx, -(y + h / 2))); c.fillStyle = g; c.fillRect(gx - 200, y - 50, 400, h + 100); c.restore(); };


  K.template({ id: 'light-endcard', title: 'End card', style: 'Soft Light', type: 'End card', dur: 7, alpha: false,
    fonts: ['400 80px Optima', '500 24px "Avenir Next"', '400 26px "Avenir Next"'],
    params: { title: 'Thank you for watching', left: 'Next episode', right: 'Related video', top: '#15171f', bottom: '#241915', light: '#ffb86e', core: '#fff1da', ink: '#fbf4ea' },
    setup() {
      const R = K.rand(58);
      this.bokeh = Array.from({ length: 30 }, () => ({ x: R() * 1920, y: R() * 1080, s: .25 + R() * R() * .9, a: .05 + R() * .14, sp: 8 + R() * 20, ph: R() * 10, warm: R() < .7 }));
    },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2;
      c.drawImage(K.cached(`slBg${p.top}${p.bottom}`, W, H, (b) => {
        const g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.top); g.addColorStop(.6, K.lerpc(p.bottom, p.light, .2)); g.addColorStop(1, p.bottom); b.fillStyle = g; b.fillRect(0, 0, W, H);
        const r = b.createRadialGradient(W * .5, H * .62, 50, W * .5, H * .62, W * .7); r.addColorStop(0, 'rgba(120,70,50,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = r; b.fillRect(0, 0, W, H);
      }), 0, 0);
      // settled morning light, drifting very slowly
      const lk = K.E(t, 0, 1.6), sx = W * .64 + 90 * Math.sin(t * .18), sy = H * .1, br = 1 + .04 * Math.sin(t * 1.1);
      sprite(c, glow(p.light, 900, .25), sx, sy, 1.4 * br, .5 * lk);
      sprite(c, glow(p.core, 320, .3), sx, sy, 1.1 * br, .45 * lk);
      sprite(c, glow('#ff8d5a', 600, .3), -40, H * .9, 1.3, .22 * lk);
      sprite(c, glow('#ffc98a', 520, .3), W + 40, H * .75, 1.1, .16 * lk);
      sprite(c, streak('#ffd6a8'), sx, sy, 1, .22 * lk);
      for (const b of this.bokeh) {
        const y = ((b.y - t * b.sp) % (H + 200) + H + 200) % (H + 200) - 100, x = b.x + 26 * Math.sin(t * .3 + b.ph);
        sprite(c, disc(b.warm ? '#ffd9a8' : '#fff4e6', b.s > .6 ? 7 : 2.5), x, y, b.s, b.a * (b.s > .6 ? .6 : 1) * lk);
      }
      const out = K.E(t, 6.1, 6.85, 'in');
      // title
      const fT = K.font(80, 'Optima', 400), fL = K.font(24, 'Avenir Next', 500);
      c.save(); c.translate(0, 14 * (1 - K.E(t, .3, 1.8, 'out')) - 10 * out);
      K.reveal(c, p.title, cx, 290, { font: fT, color: p.ink, track: 2, align: 'center', k: K.P(t, .3, 1.7) * (1 - out), mode: 'blur', stagger: .5, shadow: ['rgba(30,15,8,.35)', 24, 3] });
      c.restore();
      const hl = 90 * K.E(t, 1.0, 1.9, 'out5') * (1 - out); if (hl > 0) { const g = c.createLinearGradient(cx - hl, 0, cx + hl, 0); g.addColorStop(0, 'rgba(255,220,180,0)'); g.addColorStop(.5, 'rgba(255,226,190,.8)'); g.addColorStop(1, 'rgba(255,220,180,0)'); c.fillStyle = g; c.fillRect(cx - hl, 340, hl * 2, 1); }
      // two frosted placeholders (16:9) for the editor's end-screen videos
      const pw = 640, ph = 360, gap = 80, x0 = cx - pw - gap / 2, y0 = 410;
      [[p.left, 0], [p.right, 1]].forEach(([label, i]) => {
        const ti = 1.0 + i * .22, k = K.E(t, ti, ti + 1.1, 'out5'), ko = K.E(t, 5.9 + i * .1, 6.75 + i * .1, 'in');
        const a = k * (1 - ko); if (a <= 0) return;
        const x = x0 + i * (pw + gap), y = y0 + 40 * (1 - k) + 24 * ko;
        glass(c, x, y, pw, ph, 22, a, { dark: .14, shadow: .4 });
        glint(c, x, y, pw, ph, 22, K.P(t, 2.1 + i * .25, 3.3 + i * .25));
        // a quiet play mark in the centre
        const m = K.E(t, ti + .5, ti + 1.2, 'out') * (1 - ko), mx = x + pw / 2, my = y + ph / 2;
        if (m > 0) { c.save(); c.globalAlpha = m; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(mx, my, 38, 0, K.TAU); c.stroke();
          c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(mx - 9, my - 14); c.lineTo(mx + 15, my); c.lineTo(mx - 9, my + 14); c.closePath(); c.fill(); c.restore(); }
        // label beneath, small caps-style tracking with a warm dot
        const lk2 = K.P(t, ti + .45, ti + 1.3) * (1 - ko), ly = y0 + ph + 64;
        c.save(); c.globalAlpha = K.ease.out(K.clamp(lk2 * 1.4)); const dg = c.createRadialGradient(x + 6, ly - 8, 0, x + 6, ly - 8, 7); dg.addColorStop(0, '#fff3dc'); dg.addColorStop(.5, K.rgba(p.light, .9)); dg.addColorStop(1, K.rgba(p.light, 0)); c.fillStyle = dg; c.fillRect(x - 4, ly - 18, 20, 20); c.restore();
        K.reveal(c, label.toUpperCase(), x + 26, ly, { font: fL, color: 'rgba(255,240,222,.92)', track: 5, k: lk2, mode: 'track', stagger: .3 });
      });
      K.vignette(c, .4);
      K.grain(c, t, .03);
    } });
})();
