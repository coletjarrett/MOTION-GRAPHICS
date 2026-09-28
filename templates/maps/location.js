// BIBLE MAPS — location tag. A small parchment inset map (a circle) of the region scales in, a pin settles on the
// place and pulses softly, and a parchment tab slides out from behind the circle carrying the place name and a
// region · scripture line. Overlay (alpha). The inset coast covers Macedonia and the Chalcidice
// (lon ≈ 21.5–25, lat ≈ 39.5–41.5), so Philippi, Berea, Amphipolis or Neapolis work by editing lon/lat.
(() => {
  // Macedonian coast: west shore of the Thermaic Gulf → Thessalonica → Chalcidice (Kassandra, Sithonia, Athos) → Strymonian Gulf
  const COAST = [[23.33, 39.1], [23.1, 39.35], [22.95, 39.55], [22.75, 39.75], [22.65, 39.97], [22.6, 40.2], [22.6, 40.44], [22.7, 40.55], [22.85, 40.62], [22.94, 40.64],
    [22.97, 40.58], [22.88, 40.5], [22.9, 40.4], [23.02, 40.3], [23.2, 40.25], [23.3, 40.2], [23.33, 40.07], [23.43, 39.97], [23.62, 39.94], [23.7, 40.03],
    [23.47, 40.18], [23.42, 40.26], [23.56, 40.25], [23.74, 40.18], [23.8, 40.02], [23.93, 39.95], [24.0, 40.1], [23.86, 40.28], [23.96, 40.36],
    [24.1, 40.28], [24.38, 40.13], [24.42, 40.18], [24.22, 40.32], [24.02, 40.44], [23.87, 40.55], [23.82, 40.65], [23.92, 40.78], [24.1, 40.75],
    [24.35, 40.87], [24.62, 40.95], [25.2, 40.95]];
  const CLOSE = [[26, 42], [20.5, 42], [20.5, 38.9], [23.33, 38.9]];
  const THASOS = [[24.55, 40.78], [24.7, 40.8], [24.8, 40.7], [24.72, 40.58], [24.58, 40.64]];

  K.template({
    id: 'maps-location', title: 'Location tag', style: 'Bible Maps', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['400 56px GB', 'italic 400 30px GB', '700 20px GB'],
    params: { name: 'Thessalonica', sub: 'Macedonia · Acts 17:1', lon: 22.94, lat: 40.64, x: 180, y: 872,
      paper: '#efe3c6', sea: '#d9dccd', ink: '#4a3826', pin: '#9a3322' },
    setup(c, p) {
      const R = 88, S = 74, cos = Math.cos(p.lat * Math.PI / 180);
      // inset projection centred a little south-east of the place so the gulf and peninsulas show
      const lon0 = p.lon + .26, lat0 = p.lat - .2;
      const P = ([lo, la]) => [(lo - lon0) * S * cos, (lat0 - la) * S];
      const D = 2 * R + 40;
      p._inset = K.cached(`maps-loc-inset-${p.lon},${p.lat}`, D * 2, D * 2, (x) => {
        x.scale(2, 2); x.translate(D / 2, D / 2);
        x.fillStyle = p.sea; x.fillRect(-D / 2, -D / 2, D, D);
        x.strokeStyle = K.rgba(p.ink, .16); x.lineWidth = .7;
        for (let y = -D / 2; y < D / 2; y += 6) { x.beginPath(); for (let X = -D / 2; X <= D / 2; X += 6) x.lineTo(X, y + Math.sin(X * .06 + y) * 1.1); x.stroke(); }
        const pts = K.wobble(K.catmull(COAST, 5).map(P), .8, 3, 4).concat(CLOSE.map(P));
        const th = K.wobble(K.catmull(THASOS.concat([THASOS[0]]), 5).map(P), .6, 4, 4);
        const land = new Path2D(); [pts, th].forEach(Q => { Q.forEach(([a, b], i) => i ? land.lineTo(a, b) : land.moveTo(a, b)); land.closePath(); });
        [[4, .28], [8, .14]].forEach(([d, a]) => { x.save(); x.strokeStyle = K.rgba(p.ink, a); x.lineWidth = d * 2; x.stroke(land); x.globalCompositeOperation = 'destination-out'; x.lineWidth = d * 2 - 1.2; x.stroke(land); x.restore(); });
        x.fillStyle = p.paper; x.fill(land);
        x.save(); x.clip(land);
        { const n = D, im = x.createImageData(n, n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = i / 38, b = j / 38, h0 = K.fbm(a, b, 5, 4), h1 = K.fbm(a + .03, b + .03, 5, 4), l = K.clamp((h1 - h0) * 30, -1, 1), o = (j * n + i) * 4; if (l < 0) { im.data[o] = 110; im.data[o + 1] = 78; im.data[o + 2] = 45; im.data[o + 3] = -l * 55; } else { im.data[o] = 255; im.data[o + 1] = 250; im.data[o + 2] = 235; im.data[o + 3] = l * 45; } } const tc = document.createElement("canvas"); tc.width = tc.height = n; tc.getContext("2d").putImageData(im, 0, 0); x.drawImage(tc, -D / 2, -D / 2, D, D); }
        x.restore();
        x.strokeStyle = K.rgba(p.ink, .85); x.lineWidth = 1.2; x.lineJoin = 'round'; x.stroke(land);
      });
      p._pin = P([p.lon, p.lat]);
    },
    draw(c, t, p) {
      const R = 88, cx = p.x + R, cy = p.y - 6;
      const kC = K.E(t, .1, .9, 'out5'), oC = 1 - K.E(t, 6.05, 6.7, 'in');
      const kT = K.E(t, .45, 1.25, 'out5'), oT = 1 - K.E(t, 5.75, 6.35, 'in');
      const fN = K.font(56, 'GB', 400), fS = K.font(30, 'GB', 400, 'italic');
      const tw = Math.max(K.width(c, p.name, fN, .5), K.width(c, p.sub, fS, .5));
      // parchment tab sliding out from behind the circle
      const tabW = (tw + R + 84) * kT * oT, tabH = 124, tx = cx, ty = cy - 60;
      if (tabW > 2) {
        c.save(); c.shadowColor = 'rgba(30,20,10,.35)'; c.shadowBlur = 22; c.shadowOffsetY = 5;
        c.fillStyle = K.rgba(p.paper, .97); c.fillRect(tx, ty, tabW, tabH); c.restore();
        c.save(); c.globalCompositeOperation = 'multiply'; c.beginPath(); c.rect(tx, ty, tabW, tabH); c.clip(); c.drawImage(K.paper(900, 120, 12, '#f6eedb'), tx, ty); c.restore();
        c.strokeStyle = K.rgba(p.ink, .55); c.lineWidth = 1; c.strokeRect(tx, ty + 7, tabW - 7, tabH - 14);
        c.save(); c.beginPath(); c.rect(tx + R, ty, Math.max(0, tabW - R), tabH); c.clip();
        const x0 = cx + R + 30;
        K.reveal(c, p.name, x0, cy + 4, { font: fN, color: p.ink, track: .5, k: K.P(t, .8, 1.7) * oT, mode: 'fade', stagger: .5 });
        c.globalAlpha = oT; c.fillStyle = p.pin; c.fillRect(x0, cy + 19, 44 * K.E(t, 1.1, 1.7, 'out5'), 1.5); c.globalAlpha = 1;
        K.reveal(c, p.sub, x0, cy + 47, { font: fS, color: K.rgba(p.ink, .9), track: .5, k: K.P(t, 1.2, 2.1) * oT, mode: 'fade', stagger: .4 });
        c.restore();
      }
      // inset circle
      const s = kC * oC; if (s <= 0) return;
      c.save(); c.translate(cx, cy); c.scale(.85 + .15 * s, .85 + .15 * s); c.globalAlpha = s;
      c.shadowColor = 'rgba(30,20,10,.4)'; c.shadowBlur = 20; c.shadowOffsetY = 5; c.fillStyle = p.paper; c.beginPath(); c.arc(0, 0, R + 7, 0, K.TAU); c.fill(); c.shadowColor = 'transparent';
      c.save(); c.beginPath(); c.arc(0, 0, R, 0, K.TAU); c.clip();
      const z = 1.06 + .06 * K.E(t, 0, 7, 'sine'), D = 2 * R + 40; c.scale(z, z);
      c.drawImage(p._inset, -D / 2, -D / 2, D, D);
      // pin
      const [px, py] = p._pin, kp = K.E(t, .7, 1.2, 'out');
      for (let i = 0; i < 3; i++) { const ph = ((t - 1.2 - i * .6) % 1.8) / 1.8; if (t < 1.2 + i * .6 || t > 5.9) continue; c.strokeStyle = K.rgba(p.pin, .55 * (1 - ph)); c.lineWidth = 1.6; c.beginPath(); c.arc(px, py, 5 + 22 * K.ease.out(ph), 0, K.TAU); c.stroke(); }
      if (kp > 0) {
        c.save(); c.translate(px, py - (1 - kp) * 20); c.globalAlpha = kp;
        c.fillStyle = 'rgba(40,25,10,.25)'; c.beginPath(); c.ellipse(0, 1, 5, 2, 0, 0, K.TAU); c.fill();
        c.fillStyle = p.pin; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-3, -6, -9, -11, -9, -18); c.arc(0, -18, 9, Math.PI, 0); c.bezierCurveTo(9, -11, 3, -6, 0, 0); c.fill();
        c.fillStyle = p.paper; c.beginPath(); c.arc(0, -18, 3.6, 0, K.TAU); c.fill();
        c.restore();
      }
      c.restore();
      c.strokeStyle = K.rgba(p.ink, .85); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, R, 0, K.TAU); c.stroke();
      c.strokeStyle = K.rgba(p.ink, .4); c.lineWidth = 1; c.beginPath(); c.arc(0, 0, R + 4.5, 0, K.TAU); c.stroke();
      c.restore();
    },
  });
})();
