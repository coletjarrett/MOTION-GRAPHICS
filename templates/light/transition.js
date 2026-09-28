// SOFT LIGHT — light-leak transition (alpha overlay). Warm light blooms in from one side, drifts across,
// gently whites-out the frame at the midpoint (cut the two clips underneath at `cut`, 1.25 s), then clears
// the other way. One soft rise and fall — no flashing. Fully transparent on the first and last frames.
(() => {
  const glow = (col, r, hard = .3) => K.cached(`slGlow${col}${r}${hard}`, r * 2, r * 2, c => {
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, K.rgba(col, 1)); g.addColorStop(hard, K.rgba(col, .45)); g.addColorStop(.7, K.rgba(col, .1)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, r * 2, r * 2);
  });
  const streak = (col) => K.cached(`slStreak${col}`, 2400, 60, c => {
    const g = c.createLinearGradient(0, 0, 2400, 0);
    g.addColorStop(0, K.rgba(col, 0)); g.addColorStop(.35, K.rgba(col, .25)); g.addColorStop(.5, K.rgba(col, 1)); g.addColorStop(.65, K.rgba(col, .25)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, 2400, 60);
    const v = c.createLinearGradient(0, 0, 0, 60); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalCompositeOperation = 'destination-in'; c.fillStyle = v; c.fillRect(0, 0, 2400, 60);
  });
  const disc = (col) => K.cached(`slDiscT${col}`, 160, 160, c => {
    c.filter = 'blur(3px)'; const g = c.createRadialGradient(80, 80, 0, 80, 80, 64);
    g.addColorStop(0, K.rgba(col, .5)); g.addColorStop(.85, K.rgba(col, .6)); g.addColorStop(.95, K.rgba(col, .9)); g.addColorStop(1, K.rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(80, 80, 64, 0, K.TAU); c.fill();
  });
  const put = (c, cv, x, y, sx, sy, a) => { if (a <= 0) return; c.globalAlpha = Math.min(1, a); c.drawImage(cv, x - cv.width * sx / 2, y - cv.height * sy / 2, cv.width * sx, cv.height * sy); };

  K.template({ id: 'light-transition', title: 'Light-leak transition', style: 'Soft Light', type: 'Transition', dur: 2.5, alpha: true,
    fonts: [],
    params: { amber: '#ffa24f', peach: '#ff7f5c', cream: '#fff3e2', white: '#fffaf3', peak: .96, cut: 1.25, fromLeft: true },
    setup() { const R = K.rand(77); this.flecks = Array.from({ length: 16 }, () => ({ x: R(), y: .2 + R() * .6, s: .2 + R() * .5, a: .1 + R() * .25, v: .6 + R() * .8 })); },
    draw(c, t, p) {
      const W = K.W, H = K.H, T = p.cut, dir = p.fromLeft ? 1 : -1, X = v => p.fromLeft ? v : W - v;
      // envelope: one smooth rise to the cut, one smooth fall after
      const rise = K.E(t, 0, T, 'sine'), fall = K.E(t, T, 2.5, 'sine'), env = rise * (1 - fall), ge = Math.pow(env, .5);
      if (env <= 0.001) return;
      // the leak centre travels across the frame through the whole transition
      const u = K.E(t, 0, 2.5, 'io'), cx = X(K.mix(W * .04, W * .96, u)), cy = H * (.55 - .1 * Math.sin(u * Math.PI));
      c.globalCompositeOperation = 'lighter';
      put(c, glow(p.peach, 800, .25), cx - dir * 380, cy + 160, .9 + env, .8 + env * .8, .6 * ge);
      put(c, glow(p.amber, 900, .25), cx, cy, .6 + 1.6 * env, .5 + 1.2 * env, .8 * ge);
      put(c, glow(p.cream, 500, .3), cx + dir * 120, cy - 40, .6 + 2 * env, .6 + 1.6 * env, .85 * ge);
      put(c, glow('#ffd9a0', 700, .3), X(W * .92) - dir * 400 * u, H * .12, 1.2, 1.2, .35 * ge);
      // anamorphic streaks, subtle
      put(c, streak(p.cream), cx, cy, 1.2, 1, .5 * ge);
      put(c, streak('#b9d3ff'), cx - dir * 200, cy + 30, .8, .7, .1 * ge);
      // a few soft flecks riding the light
      for (const f of this.flecks) {
        const fx = X(((f.x * W + dir * 0 + (u * f.v * 900)) % (W + 200)) - 100), fy = f.y * H + 40 * Math.sin(t * 1.4 + f.x * 9);
        put(c, disc(p.cream), fx, fy, f.s, f.s, f.a * K.bell(t, .15, .8, 1.6, 2.3));
      }
      c.globalCompositeOperation = 'source-over';
      // the gentle white-out: a full-frame cream veil that crests at the cut
      const veil = Math.pow(env, 3) * p.peak;
      if (veil > 0) {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, W * 1.1);
        g.addColorStop(0, K.rgba(p.white, veil)); g.addColorStop(.6, K.rgba(p.cream, veil * .98)); g.addColorStop(1, K.rgba('#ffe7cc', veil * .92));
        c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
    } });
})();
