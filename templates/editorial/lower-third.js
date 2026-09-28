// EDITORIAL SERIF — lower third. A gold hairline draws out from a small lozenge; the name rises out of the line
// in a book serif, the role descends from it in italic. On exit both slip back behind the line, which withdraws.
(() => {
  K.template({ id: 'editorial-lower-third', title: 'Lower third', style: 'Editorial Serif', type: 'Lower third', dur: 7, alpha: true,
    fonts: ['400 70px GB', 'italic 400 38px GB'],
    params: { name: 'Henrik Lindqvist', role: 'Bethel volunteer, Sweden', ink: '#fbf7ee', gold: '#d2b27a', x: 176, y: 872 },
    draw(c, t, p) {
      const { x, y } = p;
      const fN = K.font(70, 'GB', 400), fR = K.font(38, 'GB', 400, 'italic');
      const wN = K.width(c, p.name, fN, .4), wR = K.width(c, p.role, fR, .3), wMax = Math.max(wN, wR);
      const inK = K.E(t, .15, 1.15, 'io5'), outK = K.E(t, 5.95, 6.75, 'io5');

      // legibility scrim, very soft, hugging the text block
      const sc = K.E(t, 0, .9) * (1 - K.E(t, 6.0, 6.8));
      if (sc > 0) {
        const g = c.createLinearGradient(0, y - 150, 0, y + 130); g.addColorStop(0, 'rgba(10,8,5,0)'); g.addColorStop(.55, `rgba(10,8,5,${.34 * sc})`); g.addColorStop(1, 'rgba(10,8,5,0)');
        const gx = c.createLinearGradient(0, 0, x + wMax + 420, 0); gx.addColorStop(0, '#000'); gx.addColorStop(.7, 'rgba(0,0,0,.7)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
        c.save(); c.fillStyle = g; c.fillRect(0, y - 150, x + wMax + 420, 280); c.globalCompositeOperation = 'destination-in'; c.fillStyle = gx; c.fillRect(0, y - 150, x + wMax + 420, 280); c.restore();
      }

      // hairline + lozenge
      const L = wMax + 64, lx0 = x + 22 + L * outK, lx1 = x + 22 + L * inK;
      c.fillStyle = p.gold; c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 6;
      if (lx1 > lx0) c.fillRect(lx0, y - .75, lx1 - lx0, 1.5);
      const lz = K.E(t, .05, .5, 'out') * (1 - K.E(t, 6.4, 6.8));
      if (lz > 0) { c.save(); c.translate(x + 6, y); c.rotate(Math.PI / 4); c.fillStyle = p.gold; const s = 5 * lz; c.fillRect(-s, -s, s * 2, s * 2); c.restore(); }
      c.shadowBlur = 0;

      // name rises from the line (clipped above it)
      const kN = K.E(t, .45, 1.45, 'out5'), oN = K.E(t, 5.75, 6.4, 'in');
      c.save(); c.beginPath(); c.rect(0, 0, 1920, y - 3); c.clip();
      c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 14; c.shadowOffsetY = 2;
      K.setText(c, fN, p.ink, .4); c.fillText(p.name, x + 22, y - 30 + (1 - kN) * 92 + oN * 92);
      c.restore();

      // role descends from the line (clipped below it)
      const kR = K.E(t, .8, 1.8, 'out5'), oR = K.E(t, 5.6, 6.25, 'in');
      c.save(); c.beginPath(); c.rect(0, y + 3, 1920, 400); c.clip();
      c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; c.shadowOffsetY = 1;
      K.setText(c, fR, K.rgba(p.ink, .9), .3); c.fillText(p.role, x + 23, y + 52 - (1 - kR) * 60 - oR * 60);
      c.restore();
    } });
})();
