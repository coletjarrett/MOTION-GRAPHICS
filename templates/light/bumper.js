// SOFT LIGHT — program bumper. A warm morning light sweeps across a dusky gradient, a faint anamorphic streak
// settles through the sun, bokeh drifts upward, the title resolves out of a soft blur and the episode line sits
// on a frosted-glass pill. Everything dissolves back into the light before the end.
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

  K.template({ id: 'light-bumper', title: 'Program bumper', style: 'Soft Light', type: 'Bumper / open', dur: 8, alpha: false,
    fonts: ['400 124px Optima', '500 30px "Avenir Next"', '400 30px "Avenir Next"'],
    params: { title: 'A Closer Look', sub: 'Episode 4 · Hope for the Future', top: '#15171f', bottom: '#241915', light: '#ffb86e', core: '#fff1da', ink: '#fbf4ea' },
    setup(c, p) {
      const R = K.rand(41);
      this.bokeh = Array.from({ length: 34 }, () => ({ x: R() * 1920, y: R() * 1080, s: .25 + R() * R() * .9, a: .06 + R() * .16, sp: 12 + R() * 30, ph: R() * 10, warm: R() < .7 }));
    },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
      // base gradient
      c.drawImage(K.cached(`slBg${p.top}${p.bottom}`, W, H, (b) => {
        const g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.top); g.addColorStop(.6, K.lerpc(p.bottom, p.light, .2)); g.addColorStop(1, p.bottom); b.fillStyle = g; b.fillRect(0, 0, W, H);
        const r = b.createRadialGradient(W * .5, H * .62, 50, W * .5, H * .62, W * .7); r.addColorStop(0, 'rgba(120,70,50,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = r; b.fillRect(0, 0, W, H);
      }), 0, 0);
      const fin = 1 - .35 * K.E(t, 6.8, 8, 'io');
      // the morning light: a warm body that travels in from the left and settles upper-right of centre
      const sw = K.E(t, 0, 6.5, 'out'), sx = K.mix(W * .08, W * .63, sw), sy = K.mix(H * .56, H * .36, sw), rise = (.25 + .75 * K.E(t, 0, 1.6, 'out')) * fin;
      const br = 1 + .04 * Math.sin(t * 1.3);
      sprite(c, glow(p.light, 900, .25), sx, sy, 1.3 * br, .62 * rise);
      sprite(c, glow('#ff9a7a', 700, .3), sx - 260, sy + 120, 1.1, .22 * rise);
      sprite(c, glow(p.core, 320, .3), sx, sy, 1 * br, .7 * rise);
      sprite(c, glow('#ffffff', 90, .3), sx, sy, 1, .5 * rise);
      // light leaks at the frame edges, breathing slowly
      const lk = K.E(t, .2, 2.5) * fin;
      sprite(c, glow('#ff8d5a', 600, .3), -60 + 40 * K.noise(t * .3, 0, 3), H * .85, 1.3, .28 * lk * (.7 + .3 * K.noise(t * .5, 1, 5)));
      sprite(c, glow('#ffc98a', 520, .3), W + 40, H * .08 + 60 * K.noise(t * .25, 2, 7), 1.2, .22 * lk);
      // the sweep: a soft diagonal beam crossing once
      const bk = K.P(t, .3, 4.6); if (bk > 0 && bk < 1) { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .2 * Math.sin(Math.PI * bk); c.translate(K.mix(-700, W + 700, K.ease.io(bk)), cy); c.rotate(.42); const bm = beam(); c.drawImage(bm, -450, -1200); c.restore(); }
      // anamorphic streak through the sun, very subtle
      const st = streak('#ffd6a8'); sprite(c, st, sx + 40, sy, 1, .32 * rise);
      sprite(c, streak('#bcd4ff'), sx - 60, sy + 3, .7, .06 * rise);
      // bokeh drifting up
      for (const b of this.bokeh) {
        const y = ((b.y - t * b.sp) % (H + 200) + H + 200) % (H + 200) - 100, x = b.x + 30 * Math.sin(t * .35 + b.ph);
        const near = 1 - Math.min(1, Math.hypot(x - sx, y - sy) / 1100);
        sprite(c, disc(b.warm ? '#ffd9a8' : '#fff4e6', b.s > .6 ? 7 : 2.5), x, y, b.s, b.a * (b.s > .6 ? .6 : 1) * (.4 + .9 * near) * K.E(t, 0, 1.5) * fin);
      }
      // text
      const fT = K.font(124, 'Optima', 400), fS = K.font(32, 'Avenir Next', 500), ty = cy + 10;
      const out = K.P(t, 6.5, 7.5), kT = K.P(t, 1.5, 3.3) * (1 - out);
      c.save(); c.translate(0, 18 * (1 - K.E(t, 1.5, 3.6, 'out')) - 10 * K.ease.in(out));
      K.reveal(c, p.title, cx, ty, { font: fT, color: p.ink, track: 3, align: 'center', k: kT, mode: 'blur', stagger: .55, shadow: ['rgba(40,20,10,.35)', 30, 4] });
      c.restore();
      // episode line on a frosted pill
      const wS = K.width(c, p.sub, fS, 1.5), pw = wS + 96, ph = 70, pk = K.E(t, 2.6, 3.6, 'out5') * (1 - K.E(t, 6.3, 7.1, 'in'));
      const pwk = K.mix(ph, pw, K.E(t, 2.8, 3.9, 'out5')), px = cx - pwk / 2, py = ty + 62 + 14 * (1 - pk);
      glass(c, px, py, pwk, ph, ph / 2, pk, { dark: .1, shadow: .25 });
      glint(c, px, py, pwk, ph, ph / 2, K.P(t, 4.0, 5.2));
      c.save(); K.rr(c, px, py, pwk, ph, ph / 2); c.clip();
      K.reveal(c, p.sub, cx, py + 46, { font: fS, color: K.rgba(p.ink, .95), track: 1.5, align: 'center', k: K.P(t, 3.1, 4.2) * (1 - out), mode: 'fade', stagger: .5 });
      c.restore();
      K.vignette(c, .42);
      K.grain(c, t, .03);
    } });
})();
