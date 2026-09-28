// NIGHT SKY — lower third. A point of starlight draws a fine line; name and role rise into place.
K.template({ id: 'nightsky-lower-third', title: 'Lower third', style: 'Night Sky', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['400 62px Didot', '500 26px "Avenir Next"'],
  params: { name: 'Dr. Elena Ruiz', role: 'Astronomer, Chile' },
  draw(c, t, p) {
    const x = 170, y = 880, out = K.E(t, 5.7, 6.5, 'in'), fN = K.font(62, 'Didot', 400), wN = K.width(c, p.name, fN);
    const L = Math.max(wN, 420) + 30, k = K.E(t, .2, 1.3, 'io5'), kx = x + L * k;
    c.save(); c.filter = 'blur(50px)'; c.fillStyle = `rgba(0,5,15,${.45 * K.E(t, .1, 1) * (1 - out)})`; c.fillRect(-100, y - 110, x + L + 200, 190); c.restore();
    c.globalAlpha = 1 - out;
    let g = c.createLinearGradient(x, 0, kx, 0); g.addColorStop(0, 'rgba(214,196,150,0)'); g.addColorStop(.3, 'rgba(214,196,150,.8)'); g.addColorStop(1, 'rgba(255,240,210,1)'); c.fillStyle = g; c.fillRect(x, y, kx - x, 1.6);
    const star = K.bell(t, .2, .4, 1.3, 2.0); if (star > 0) { const gg = c.createRadialGradient(kx, y, 0, kx, y, 26); gg.addColorStop(0, `rgba(255,245,220,${star})`); gg.addColorStop(.2, `rgba(255,230,180,${.4 * star})`); gg.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = gg; c.fillRect(kx - 26, y - 26, 52, 52); }
    c.save(); c.beginPath(); c.rect(0, y - 200, 2000, 198); c.clip();
    c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10;
    K.setText(c, fN, '#f6f1e6', 1); c.fillText(p.name, x, y - 22 + 80 * (1 - K.E(t, .6, 1.5, 'out5')) + 60 * out); c.restore();
    c.save(); c.beginPath(); c.rect(0, y + 2, 2000, 100); c.clip();
    K.setText(c, K.font(26, 'Avenir Next', 500), 'rgba(214,196,150,1)', 6); c.fillText(p.role.toUpperCase(), x, y + 44 - 50 * (1 - K.E(t, .9, 1.7, 'out5')) - 50 * out); c.restore();
  } });
