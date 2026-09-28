// SWISS GRID — lower third. A red rule snaps across four grid columns, an off-white block opens beneath it
// with the name set flush-left in bold, and a charcoal block slides out below carrying the role. Hard edges,
// out5 motion, no shadows; the exit retracts each block in reverse order and is clear on the last frame.
(() => {
  const M = 150, GUT = 24, CW = (1920 - 2 * M - 11 * GUT) / 12;
  const span = n => n * CW + (n - 1) * GUT;
  const lift = (c, s, x, y, font, color, size, k, o = 0, track = 0) => {
    if (k <= 0 || o >= 1) return; c.save(); c.beginPath(); c.rect(x - 200, y - size * 1.05, 4000, size * 1.35); c.clip();
    K.setText(c, font, color, track); c.fillText(s, x, y + (1 - K.ease.out5(k)) * size * 1.15 - K.ease.in5(o) * size * 1.2); c.restore();
  };

  K.template({ id: 'swiss-lower-third', title: 'Lower third', style: 'Swiss Grid', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['700 54px "Helvetica Neue"', '500 28px "Helvetica Neue"'],
    params: { name: 'Jonas Weber', role: 'Translator, Switzerland', x: 150, y: 776, bg: '#efece6', ink: '#222222', accent: '#c8452f', paper: '#f7f5f0' },
    draw(c, t, p) {
      const { x, y } = p, fN = K.font(54, 'Helvetica Neue', 700), fR = K.font(28, 'Helvetica Neue', 500);
      const padX = 32, wN = K.width(c, p.name, fN, -1) + padX * 2, wR = K.width(c, p.role, fR, 0) + padX * 2;
      const nameW = Math.max(wN, span(3)), roleW = Math.max(wR, span(2)), nameH = 96, roleH = 58, ruleW = Math.max(nameW, span(4));
      // timings: in ≈ 0–1.2 s, hold, out 5.7–6.6 s
      const rk = K.E(t, 0, .55, 'out5'), ro = K.E(t, 6.05, 6.6, 'in5');
      const nk = K.E(t, .2, .8, 'out5'), no = K.E(t, 5.85, 6.4, 'in5');
      const qk = K.E(t, .45, 1.05, 'out5'), qo = K.E(t, 5.7, 6.2, 'in5');
      // red rule on top of the stack
      if (rk > 0 && ro < 1) { c.fillStyle = p.accent; c.fillRect(x + ruleW * ro, y - 8, ruleW * (rk - ro), 8); }
      // name block (off-white), opens left→right; retracts right→left
      const nw = nameW * nk * (1 - no);
      if (nw > 0) {
        c.fillStyle = p.bg; c.fillRect(x, y, nw, nameH);
        c.save(); c.beginPath(); c.rect(x, y, nw, nameH); c.clip();
        lift(c, p.name, x + padX - 2, y + 68, fN, p.ink, 54, K.P(t, .45, 1.1), K.P(t, 5.55, 6.0), -1);
        c.restore();
      }
      // role block (charcoal), slides down from under the name block
      const rh = roleH * qk * (1 - qo);
      if (rh > 0) {
        c.save(); c.beginPath(); c.rect(x, y + nameH, roleW, roleH); c.clip();
        const dy = y + nameH - roleH + rh;
        c.fillStyle = p.ink; c.fillRect(x, dy, roleW, roleH);
        K.setText(c, fR, p.paper, 0); c.globalAlpha = K.E(t, .75, 1.2) * (1 - K.E(t, 5.5, 5.8)); c.fillText(p.role, x + padX, dy + 39);
        c.restore();
      }
    } });
})();
