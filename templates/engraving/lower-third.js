// ENGRAVING — lower third.
K.template({
  id: 'engraving-lower-third', title: 'Lower third', style: 'Engraving', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['400 80px "Big Caslon"', 'italic 44px "Baskerville"'],
  params: { name: 'William Tyndale', role: 'Bible translator, 1494–1536', ink: '#2b2118', bg: '#efe3c8', x: 170, y: 840 },
  setup(c, p) {},
  draw(c, t, p) {
    const W = K.W, H = K.H, x = p.x, y = p.y;
    const out = 1 - K.E(t, 5.7, 6.5, 'in');

    const fN = K.font(80, 'Big Caslon', 400);
    const fR = K.font(44, 'Baskerville', 400, 'italic');
    const wN = K.width(c, p.name, fN, 1);
    const wR = K.width(c, p.role, fR, 2);
    const rw = Math.max(wN, wR) + 120; // ribbon width

    // Ribbon path animation
    const k_unfurl = K.E(t, 0.4, 1.4, 'out5') * out;
    const k_tails = K.E(t, 0.8, 1.6, 'out5') * out;

    if (k_unfurl > 0) {
      c.save();
      // Drop shadow for the whole ribbon
      c.shadowColor = 'rgba(0,0,0,0.3)';
      c.shadowBlur = 15;
      c.shadowOffsetY = 10;

      // Unfurled width
      const curW = rw * k_unfurl;
      const rh = 160; // ribbon height
      const fold = 48; // fold size

      // Build the paths
      const mainPath = new Path2D();
      mainPath.rect(x, y, curW, rh);

      const tailL = new Path2D();
      const lx = x + 30; // tucked in slightly
      tailL.moveTo(lx, y + rh);
      tailL.lineTo(lx, y + rh + fold);
      tailL.lineTo(lx - 60, y + rh + fold - 20); // fishtail
      tailL.lineTo(lx - 30, y + rh / 2 + fold);
      tailL.lineTo(lx - 70, y + fold + 10);
      tailL.lineTo(lx + 20, y + fold);
      tailL.closePath();

      // We only want the tail if it's animating in
      const paperCv = K.paper(W, H, 456, p.bg, { blot: 0.6, fibres: 1000 });
      
      const drawHatch = (path, px, py, pw, ph, angle, pitch, seed, progress) => {
        c.save(); c.clip(path); c.translate(px + pw/2, py + ph/2); c.rotate(angle);
        const diag = Math.hypot(pw, ph), startY = -diag/2, endY = diag/2;
        c.strokeStyle = p.ink; c.lineCap = 'round';
        const seg = 10;
        for (let yi = startY; yi < endY; yi += pitch) {
          const drawProg = K.clamp(progress * 1.5 - K.hash(yi, seed) * 0.5); 
          if (drawProg <= 0) continue;
          const l_start = -diag/2, l_end = -diag/2 + diag * drawProg;
          for (let xi = l_start; xi < l_end; xi += seg) {
             const wx = px + pw/2 + xi * Math.cos(angle) - yi * Math.sin(angle);
             const wy = py + ph/2 + xi * Math.sin(angle) + yi * Math.cos(angle);
             const n = K.noise(wx * 0.005, wy * 0.005, seed);
             if (n > 0.1) {
               c.lineWidth = Math.min(1.5, n * 2.5);
               c.beginPath(); c.moveTo(xi, yi); c.lineTo(xi + seg + 0.5, yi); c.stroke();
             }
          }
        }
        c.restore();
      };

      // Draw left tail
      if (k_tails > 0) {
        c.save();
        // Scale from fold point
        c.translate(lx, y + rh); c.scale(k_tails, k_tails); c.translate(-lx, -(y + rh));
        c.fillStyle = p.bg; c.fill(tailL);
        c.save(); c.clip(tailL); c.drawImage(paperCv, 0, 0); c.restore();
        c.lineWidth = 1.5; c.strokeStyle = p.ink; c.stroke(tailL);
        // Hatch the tail for shadow
        drawHatch(tailL, lx - 70, y + fold, 100, rh, Math.PI / 4, 4, 1, k_tails);
        c.restore();
      }

      // Draw right tail (only if unfurled enough)
      const rx = x + curW - 30;
      if (k_tails > 0 && curW > rw * 0.8) {
        const k_rt = K.clamp((curW/rw - 0.8) / 0.2) * k_tails;
        const tailR = new Path2D();
        tailR.moveTo(rx, y + rh);
        tailR.lineTo(rx, y + rh + fold);
        tailR.lineTo(rx + 60, y + rh + fold - 20);
        tailR.lineTo(rx + 30, y + rh / 2 + fold);
        tailR.lineTo(rx + 70, y + fold + 10);
        tailR.lineTo(rx - 20, y + fold);
        tailR.closePath();
        
        c.save();
        c.translate(rx, y + rh); c.scale(k_rt, k_rt); c.translate(-rx, -(y + rh));
        c.fillStyle = p.bg; c.fill(tailR);
        c.save(); c.clip(tailR); c.drawImage(paperCv, 0, 0); c.restore();
        c.lineWidth = 1.5; c.strokeStyle = p.ink; c.stroke(tailR);
        drawHatch(tailR, rx - 20, y + fold, 100, rh, -Math.PI / 4, 4, 2, k_rt);
        c.restore();
      }

      // Draw main ribbon
      c.fillStyle = p.bg; c.fill(mainPath);
      c.save(); c.clip(mainPath); c.drawImage(paperCv, 0, 0); c.restore();
      c.lineWidth = 1.5; c.strokeStyle = p.ink; c.stroke(mainPath);

      // Shadow under the top fold
      const shadowPath = new Path2D();
      shadowPath.rect(x, y, curW, 15);
      drawHatch(shadowPath, x, y, curW, 15, Math.PI / 2, 4, 3, k_unfurl);
      
      // Bottom fold shading
      const bShadow = new Path2D();
      bShadow.rect(x, y + rh - 15, curW, 15);
      drawHatch(bShadow, x, y + rh - 15, curW, 15, -Math.PI / 2, 4, 4, k_unfurl);

      c.restore();

      // Text
      c.save();
      c.beginPath(); c.rect(x, y, curW, rh); c.clip();
      const kN = K.E(t, 1.0, 2.0, 'out5');
      if (kN > 0) {
        c.globalAlpha = kN * out;
        K.setText(c, fN, p.ink, 1, 'left');
        c.fillText(p.name, x + 60, y + 80 + (1 - kN) * 20);
      }
      const kR = K.E(t, 1.4, 2.4, 'out5');
      if (kR > 0) {
        c.globalAlpha = kR * out;
        K.setText(c, fR, p.ink, 2, 'left');
        c.fillText(p.role, x + 60, y + 130 + (1 - kR) * 20);
      }
      c.restore();
    }
  }
});
