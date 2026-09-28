K.template({
  id: 'letterpress-lower-third',
  title: 'Lower Third',
  style: 'Letterpress',
  type: 'Lower third',
  dur: 7,
  alpha: true,
  fonts: ['400 54px "Bodoni 72"', '400 30px "Big Caslon"'],
  params: {
    name: 'Rachel Adeyemi',
    role: 'Speaker, Lagos, Nigeria',
    bg: '#f4ece2',
    ink: '#1a2436',
    x: 170,
    y: 860
  },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    
    const fN = K.font(54, 'Bodoni 72', 400);
    const fR = K.font(30, 'Big Caslon', 400);
    const inkAlpha = K.rgba(p.ink, 0.85);

    const wN = K.width(c, p.name, fN, 1);
    const wR = K.width(c, p.role, fR, 0);
    const cardW = Math.max(wN, wR) + 120;
    const cardH = 140;
    const { x, y } = p;
    
    // Animation
    const kIn = K.E(t, 0.3, 1.3, 'out5');
    const kOut = K.E(t, 5.8, 6.5, 'in5');
    const out = 1 - kOut;
    
    if (out <= 0) return;

    c.save();
    
    // Card slides up from bottom, slightly rotating or just sliding
    const cardY = y - 100 + (1 - kIn) * 60 + kOut * 60;
    c.globalAlpha = kIn * out;
    
    // Drop shadow
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.2)';
    c.shadowBlur = 24;
    c.shadowOffsetY = 12;
    K.rr(c, x, cardY, cardW, cardH, 4);
    c.fillStyle = '#000';
    c.fill();
    c.restore();

    // Clip to card
    c.save();
    K.rr(c, x, cardY, cardW, cardH, 4);
    c.clip();

    // Paper texture sticks to the card
    c.save();
    c.translate(0, cardY - y);
    const paper = K.paper(W, H, 12, p.bg, { blot: 0.35, fibres: 2000 });
    c.drawImage(paper, 0, 0);
    c.restore();

    // Subtle lighting gradient
    const g = c.createLinearGradient(x, cardY, x + cardW, cardY + cardH);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0.05)');
    c.fillStyle = g;
    c.fill();

    // Blind emboss border
    c.beginPath();
    K.rr(c, x + 10, cardY + 10, cardW - 20, cardH - 20, 2);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5; c.stroke();
    c.translate(-1, -1);
    c.strokeStyle = 'rgba(0,0,0,0.15)'; c.stroke();
    c.translate(1, 1);

    // Debossed text
    function drawDeboss(text, tx, ty, font, track) {
      K.setText(c, font, '', track, 'left');
      
      // Highlight
      c.fillStyle = 'rgba(255,255,255,0.8)';
      c.fillText(text, tx + 1.5, ty + 1.5);
      
      // Shadow
      c.fillStyle = 'rgba(0,0,0,0.18)';
      c.fillText(text, tx - 1, ty - 1);
      
      // Ink
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = inkAlpha;
      c.fillText(text, tx, ty);
      c.globalCompositeOperation = 'source-over';
    }

    drawDeboss(p.name, x + 60, cardY + 74, fN, 1);
    drawDeboss(p.role, x + 60, cardY + 114, fR, 0);

    c.restore(); // end clip
    c.restore(); // end alpha
  }
});
