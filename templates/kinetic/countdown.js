// KINETIC TYPE — calm pre-program countdown, 10 → 0. A thin ring depletes smoothly around large condensed
// numerals; each second the next digit rolls up into place through a soft window while the old one rolls away.
// One tick per second marks the time already passed. Everything fades to the plain background at the end.
(() => {
  K.template({ id: 'kinetic-countdown', title: 'Countdown', style: 'Kinetic Type', type: 'Countdown', dur: 11, alpha: false,
    fonts: ['700 300px "DIN Condensed"', '500 46px "Avenir Next"', '700 30px "DIN Condensed"'],
    params: { from: 10, headline: 'The program will begin shortly', sub: 'Please take your seats', bg: '#111418', ink: '#f2eee6', accent: '#e2a33a' },
    draw(c, t, p) {
      const W = K.W, H = K.H, cx = W / 2, cy = 440, R = 232, N = p.from;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H); K.vignette(c, .3);
      const fin = K.E(t, 0, .6, 'out'), fout = K.E(t, N + .45, N + .95, 'io'), a = fin * (1 - fout);
      if (a <= 0) return;
      const T = K.clamp(t, 0, N);                     // seconds elapsed in the count

      // track ring, per-second ticks, depleting arc
      c.globalAlpha = a;
      c.strokeStyle = K.rgba(p.ink, .12); c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, K.TAU); c.stroke();
      for (let i = 0; i < N; i++) {
        const ang = -Math.PI / 2 + i / N * K.TAU, passed = K.E(t, i - .2, i + .3, 'io');
        c.strokeStyle = K.rgba(p.ink, K.mix(.45, .12, passed)); c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(cx + Math.cos(ang) * (R + 26), cy + Math.sin(ang) * (R + 26)); c.lineTo(cx + Math.cos(ang) * (R + 40), cy + Math.sin(ang) * (R + 40)); c.stroke();
      }
      const rem = 1 - T / N;
      if (rem > 0.0005) {
        const a0 = -Math.PI / 2 + (1 - rem) * K.TAU, a1 = -Math.PI / 2 + K.TAU;
        c.strokeStyle = p.accent; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, R, a0, a1); c.stroke();
        c.fillStyle = p.accent; c.beginPath(); c.arc(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, 9, 0, K.TAU); c.fill();
      }

      // numerals: roll between values across each whole second
      const fD = K.font(300, 'DIN Condensed', 700);
      c.font = fD; const m = c.measureText('0'), cap = m.actualBoundingBoxAscent, base = cy + cap / 2 - 4, travel = cap * .42;
      c.save();
      K.setText(c, fD, p.ink, 2, 'center');
      const s = Math.floor(t + .3), q = K.E(t, s - .3, s + .3, 'io');   // transition around each integer second
      const cur = Math.max(0, N - s), prev = N - s + 1;
      // soft roll: alpha and focus fall off with distance from rest, so the two values never read as one
      const digit = (v, dy) => { const d = Math.min(1, Math.abs(dy) / travel), al = Math.pow(1 - d, 2); if (al <= 0.001) return;
        c.globalAlpha = a * al; c.filter = d > 0.01 ? `blur(${d * 9}px)` : 'none'; c.fillText(String(v), cx + 1, base + dy); c.filter = 'none'; };
      if (s >= 1 && s <= N && q < 1) { digit(prev, -q * travel); digit(cur, (1 - q) * travel); }
      else digit(cur, 0);
      c.restore();

      // headline + sub on the grid below the ring
      c.globalAlpha = a;
      K.setText(c, K.font(46, 'Avenir Next', 500), p.ink, .5, 'center'); c.fillText(p.headline, cx, cy + R + 150);
      if (p.sub) { K.setText(c, K.font(30, 'DIN Condensed', 700), p.accent, 6, 'center'); c.fillText(p.sub.toUpperCase(), cx + 3, cy + R + 206); }
      c.globalAlpha = 1;
    } });
})();
