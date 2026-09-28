// ENGRAVING — quote card.
K.template({
  id: 'engraving-quote', title: 'Quote card', style: 'Engraving', type: 'Scripture card', dur: 10, alpha: false,
  fonts: ['400 64px "Big Caslon"', 'italic 48px "Baskerville"'],
  params: {
    lines: ['“The Grand God has made known to the king', 'what will happen in the future.”'],
    ref: 'Daniel 2:45',
    ink: '#2b2118', bg: '#efe3c8'
  },
  setup(c, p) {},
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    c.drawImage(K.paper(W, H, 234, p.bg, { blot: 0.6, fibres: 2000 }), 0, 0);

    const k_border = K.E(t, 0.2, 2.5, 'out5') * (1 - K.E(t, 9.2, 9.8, 'in5'));

    const fillHatch = (path, px, py, pw, ph, angle, pitch, seed, progress) => {
      c.save(); c.clip(path, 'evenodd'); c.translate(px + pw/2, py + ph/2); c.rotate(angle);
      const diag = Math.hypot(pw, ph), startY = -diag/2, endY = diag/2;
      c.strokeStyle = p.ink; c.lineCap = 'round';
      const seg = 12;
      for (let yi = startY; yi < endY; yi += pitch) {
        const drawProg = K.clamp(progress * 1.5 - K.hash(yi, seed) * 0.5); 
        if (drawProg <= 0) continue;
        const l_start = -diag/2, l_end = -diag/2 + diag * drawProg;
        for (let xi = l_start; xi < l_end; xi += seg) {
           const wx = px + pw/2 + xi * Math.cos(angle) - yi * Math.sin(angle);
           const wy = py + ph/2 + xi * Math.sin(angle) + yi * Math.cos(angle);
           const n = K.noise(wx * 0.005, wy * 0.005, seed);
           if (n > 0.05) {
             c.lineWidth = Math.min(2.0, n * 3);
             c.beginPath(); c.moveTo(xi, yi); c.lineTo(xi + seg + 0.5, yi); c.stroke();
           }
        }
      }
      c.restore();
    };

    if (k_border > 0) {
      c.save();
      const bPath = new Path2D();
      // Outer rect
      const bx = 120, by = 120, bw = W - 240, bh = H - 240;
      bPath.rect(bx, by, bw, bh);
      // Inner rect
      const tx = 20, ty = 20;
      bPath.rect(bx + tx, by + ty, bw - tx * 2, bh - ty * 2);
      
      // Add engraved corner ornaments drawn with hatching
      const cornerOrnament = (x, y, sx, sy) => {
        // Corner diamond
        bPath.moveTo(x, y - 45 * sy);
        bPath.lineTo(x + 45 * sx, y);
        bPath.lineTo(x, y + 45 * sy);
        bPath.lineTo(x - 45 * sx, y);
        bPath.closePath();
        // Inner cut-out diamond
        bPath.moveTo(x, y - 25 * sy);
        bPath.lineTo(x - 25 * sx, y);
        bPath.lineTo(x, y + 25 * sy);
        bPath.lineTo(x + 25 * sx, y);
        bPath.closePath();
        // Outer decorative circles
        bPath.moveTo(x - 30 * sx + 15, y - 30 * sy);
        bPath.arc(x - 30 * sx, y - 30 * sy, 15, 0, Math.PI * 2);
        bPath.moveTo(x - 50 * sx + 8, y);
        bPath.arc(x - 50 * sx, y, 8, 0, Math.PI * 2);
        bPath.moveTo(x, y - 50 * sy + 8);
        bPath.arc(x, y - 50 * sy, 8, 0, Math.PI * 2);
      };
      
      cornerOrnament(bx, by, 1, 1);
      cornerOrnament(bx + bw, by, -1, 1);
      cornerOrnament(bx, by + bh, 1, -1);
      cornerOrnament(bx + bw, by + bh, -1, -1);

      fillHatch(bPath, bx - 20, by - 20, bw + 40, bh + 40, Math.PI / 4, 5, 3, k_border);
      fillHatch(bPath, bx - 20, by - 20, bw + 40, bh + 40, -Math.PI / 4, 5, 4, k_border * 0.9);

      c.lineWidth = 1.5; c.strokeStyle = p.ink; c.globalAlpha = k_border;
      c.stroke(bPath);
      c.restore();
    }

    const n = p.lines.length, lh = 96, y0 = cy - (n - 1) * lh / 2 - 20;
    const out = K.E(t, 8.8, 9.6, 'in'); 
    
    c.save();
    c.globalAlpha = 1 - out;
    const fQ = K.font(64, 'Big Caslon', 400);
    p.lines.forEach((ln, i) => {
      const k = K.E(t, 0.8 + i * 1.5, 2.8 + i * 1.5, 'out5');
      if (k <= 0) return;
      const w = K.width(c, ln, fQ), x = cx - w / 2, y = y0 + i * lh + (1 - k) * 30;
      c.globalAlpha = k * (1 - out); 
      K.setText(c, fQ, p.ink); 
      c.fillText(ln, x, y);
    });

    const kr = K.E(t, 4.0, 5.5, 'out5');
    if (kr > 0) {
      c.globalAlpha = kr * (1 - out);
      const fR = K.font(48, 'Baskerville', 400, 'italic');
      K.setText(c, fR, p.ink, 4, 'center');
      c.fillText(p.ref, cx, y0 + n * lh + 80 + (1 - kr) * 20);
      
      // Clearer reference line rule above
      const rw = 120;
      c.lineWidth = 1.5;
      c.strokeStyle = p.ink;
      c.beginPath();
      c.moveTo(cx - rw/2, y0 + n * lh + 20 + (1 - kr) * 20);
      c.lineTo(cx + rw/2, y0 + n * lh + 20 + (1 - kr) * 20);
      c.moveTo(cx - rw/2 + 20, y0 + n * lh + 25 + (1 - kr) * 20);
      c.lineTo(cx + rw/2 - 20, y0 + n * lh + 25 + (1 - kr) * 20);
      c.stroke();
    }
    c.restore();

    K.grain(c, t, 0.05); K.vignette(c, 0.25, '43,33,24');
  }
});
