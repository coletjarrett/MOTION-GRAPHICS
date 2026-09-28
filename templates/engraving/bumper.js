// ENGRAVING — program bumper.
K.template({
  id: 'engraving-bumper', title: 'Program bumper', style: 'Engraving', type: 'Bumper / open', dur: 8, alpha: false,
  fonts: ['400 104px "Big Caslon"', 'italic 44px "Baskerville"', '400 30px "Hoefler Text"'],
  params: { title: 'Voices From History', sub: 'Part 1 · The Printing Press', ink: '#2b2118', bg: '#efe3c8' },
  setup(c, p) {},
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    c.drawImage(K.paper(W, H, 123, p.bg, { blot: 0.6, fibres: 2000 }), 0, 0);

    const k_vig = K.E(t, 0.5, 3.0, 'out5') * (1 - K.E(t, 7.0, 7.5, 'in5'));
    
    const fillHatch = (path, px, py, pw, ph, angle, pitch, seed, progress) => {
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
           const n = K.noise(wx * 0.006, wy * 0.006, seed);
           if (n > 0.1) {
             c.lineWidth = Math.min(1.8, n * 2.5);
             c.beginPath(); c.moveTo(xi, yi); c.lineTo(xi + seg + 0.5, yi); c.stroke();
           }
        }
      }
      c.restore();
    };

    if (k_vig > 0) {
      c.save(); c.translate(cx, cy - 200); // move higher for larger vignette and title
      const vPath = new Path2D();
      
      // Open book ~460px wide
      const bW = 460, bH = 160;
      // Right page
      vPath.moveTo(0, bH/2 - 20);
      vPath.quadraticCurveTo(bW/4, bH/2 + 20, bW/2, bH/2);
      vPath.lineTo(bW/2, -bH/2);
      vPath.quadraticCurveTo(bW/4, -bH/2 + 20, 0, -bH/2 - 20);
      vPath.closePath();
      // Left page
      vPath.moveTo(0, bH/2 - 20);
      vPath.quadraticCurveTo(-bW/4, bH/2 + 20, -bW/2, bH/2);
      vPath.lineTo(-bW/2, -bH/2);
      vPath.quadraticCurveTo(-bW/4, -bH/2 + 20, 0, -bH/2 - 20);
      vPath.closePath();
      
      // Pages thickness
      vPath.moveTo(-bW/2, bH/2);
      vPath.lineTo(-bW/2 + 10, bH/2 + 15);
      vPath.quadraticCurveTo(-bW/4 + 5, bH/2 + 35, 0, bH/2 - 5);
      vPath.quadraticCurveTo(bW/4 - 5, bH/2 + 35, bW/2 - 10, bH/2 + 15);
      vPath.lineTo(bW/2, bH/2);
      
      // Spine center line
      vPath.moveTo(0, bH/2 - 20);
      vPath.lineTo(0, -bH/2 - 20);

      // Add some olive leaves crossing the book
      const addLeaf = (x, y, dx, dy, b) => {
        const l = Math.hypot(dx, dy), nx = -dy/l*b, ny = dx/l*b;
        vPath.moveTo(x, y);
        vPath.quadraticCurveTo(x + dx/2 + nx, y + dy/2 + ny, x + dx, y + dy);
        vPath.quadraticCurveTo(x + dx/2 - nx, y + dy/2 - ny, x, y);
      };
      // Branch across the book
      vPath.moveTo(-150, 40);
      vPath.quadraticCurveTo(0, 100, 150, 40); // stem
      
      addLeaf(-120, 52, -40, -30, 18);
      addLeaf(-60, 75, -30, -40, 15);
      addLeaf(0, 85, 0, -45, 15);
      addLeaf(60, 75, 30, -40, 15);
      addLeaf(120, 52, 40, -30, 18);

      // Engraved rule
      const ruleY = 220;
      const ruleW = 600;
      vPath.rect(-ruleW/2, ruleY - 1, ruleW, 2);
      vPath.rect(-ruleW/2 + 60, ruleY + 8, ruleW - 120, 1.5);
      vPath.rect(-ruleW/2 + 60, ruleY - 10, ruleW - 120, 1.5);

      fillHatch(vPath, -300, -150, 600, 400, Math.PI / 6, 4.5, 1, k_vig);
      fillHatch(vPath, -300, -150, 600, 400, -Math.PI / 4, 4.5, 2, k_vig * 0.85);

      c.lineWidth = 1.2; c.strokeStyle = p.ink; c.globalAlpha = k_vig; c.stroke(vPath);
      c.restore();
    }

    const k_text = K.E(t, 1.5, 3.5, 'out5') * (1 - K.E(t, 6.8, 7.3, 'in5'));
    if (k_text > 0) {
      c.save(); c.globalAlpha = k_text;
      K.setText(c, K.font(104, 'Big Caslon', 400), p.ink, 2, 'center');
      c.fillText(p.title, cx, cy + 120);
      K.setText(c, K.font(44, 'Baskerville', 400, 'italic'), p.ink, 4, 'center');
      c.fillText(p.sub, cx, cy + 200);
      c.restore();
    }

    K.grain(c, t, 0.05); K.vignette(c, 0.25, '43,33,24');
  }
});
