K.template({
  id: 'letterpress-card',
  title: 'Program Card',
  style: 'Letterpress',
  type: 'Card',
  dur: 8,
  alpha: false,
  fonts: ['400 80px "Bodoni 72"', '500 28px "Copperplate"', '400 36px "Big Caslon"'],
  params: {
    title: 'Special Program',
    time: 'Saturday, 10:00',
    address: 'Kingdom Hall, 24 Maple Street',
    bg: '#f4ece2',
    ink: '#3b1c1c'
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    
    // Paper background
    const paper = K.paper(W, H, 84, p.bg, { blot: 0.35, fibres: 2500 });
    c.drawImage(paper, 0, 0);

    const fT = K.font(80, 'Bodoni 72', 400);
    const fTime = K.font(28, 'Copperplate', 500);
    const fAddr = K.font(36, 'Big Caslon', 400);
    const inkAlpha = K.rgba(p.ink, 0.85);

    function revealDeboss(text, x, y, font, k, mode, dist, stagger, track, isBlind) {
      const opts = { font, track, align: 'center', k, mode, dist, stagger };
      K.reveal(c, text, x + 1.5, y + 1.5, { ...opts, color: 'rgba(255,255,255,0.7)' });
      K.reveal(c, text, x - 1, y - 1, { ...opts, color: 'rgba(0,0,0,0.18)' });
      if (!isBlind) {
        c.globalCompositeOperation = 'multiply';
        K.reveal(c, text, x, y, { ...opts, color: inkAlpha });
        c.globalCompositeOperation = 'source-over';
      }
    }

    c.save();
    c.globalAlpha = 1 - K.E(t, 7.0, 7.7, 'io');

    const kT = K.P(t, 0.4, 2.0);
    const kTime = K.P(t, 0.8, 2.4);
    const kAddr = K.P(t, 1.2, 2.8);

    revealDeboss(p.title, cx, cy - 80, fT, kT, 'rise', 30, 0.5, 2, false);
    
    // Ornamental rule
    const kR = K.E(t, 0.6, 2.0, 'out5');
    if (kR > 0) {
      c.save();
      c.translate(cx, cy - 20);
      c.scale(kR, 1);
      
      const drawRule = (ox, oy, isHighlight, isShadow, isInk) => {
         c.beginPath();
         // draw a decorative line with a diamond in the middle
         c.moveTo(-120 + ox, oy);
         c.lineTo(-10 + ox, oy);
         c.lineTo(0 + ox, -4 + oy);
         c.lineTo(10 + ox, oy);
         c.lineTo(120 + ox, oy);
         c.lineTo(10 + ox, oy);
         c.lineTo(0 + ox, 4 + oy);
         c.lineTo(-10 + ox, oy);
         c.closePath();
         if (isHighlight) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill(); }
         if (isShadow) { c.fillStyle = 'rgba(0,0,0,0.15)'; c.fill(); }
         if (isInk) { 
           c.globalCompositeOperation = 'multiply'; 
           c.fillStyle = inkAlpha; 
           c.fill(); 
           c.globalCompositeOperation = 'source-over'; 
         }
      };
      
      drawRule(1.5, 1.5, true, false, false);
      drawRule(-1, -1, false, true, false);
      drawRule(0, 0, false, false, true); // Ink for rule
      c.restore();
    }

    revealDeboss(p.time.toUpperCase(), cx, cy + 45, fTime, kTime, 'fade', 20, 0.4, 6, false);
    revealDeboss(p.address, cx, cy + 105, fAddr, kAddr, 'fade', 20, 0.4, 1, false);

    c.restore();

    K.vignette(c, 0.18);
  }
});
