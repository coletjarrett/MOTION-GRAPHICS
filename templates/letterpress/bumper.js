K.template({
  id: 'letterpress-bumper',
  title: 'Bumper',
  style: 'Letterpress',
  type: 'Bumper / open',
  dur: 7,
  alpha: false,
  fonts: ['400 90px "Bodoni 72"', '500 36px "Copperplate"'],
  params: {
    title: 'Words of Encouragement',
    sub: 'Issue 12 · Patience',
    bg: '#f4ece2',
    ink: '#1a2436'
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    
    // Paper background
    const paper = K.paper(W, H, 42, p.bg, { blot: 0.4, fibres: 3000 });
    c.drawImage(paper, 0, 0);

    const fT = K.font(90, 'Bodoni 72', 400);
    const fS = K.font(36, 'Copperplate', 500);
    const inkAlpha = K.rgba(p.ink, 0.85);

    function revealDeboss(text, x, y, font, k, mode, dist, stagger, track, isBlind) {
      const opts = { font, track, align: 'center', k, mode, dist, stagger };
      // Highlight (bottom-right)
      K.reveal(c, text, x + 1.5, y + 1.5, { ...opts, color: 'rgba(255,255,255,0.7)' });
      // Shadow (top-left)
      K.reveal(c, text, x - 1, y - 1, { ...opts, color: 'rgba(0,0,0,0.18)' });
      
      if (!isBlind) {
        c.globalCompositeOperation = 'multiply';
        K.reveal(c, text, x, y, { ...opts, color: inkAlpha });
        c.globalCompositeOperation = 'source-over';
      }
    }

    c.save();
    // Fade out at the end
    c.globalAlpha = 1 - K.E(t, 6.0, 6.7, 'io');

    const kT = K.P(t, 0.5, 2.5);
    const kS = K.P(t, 1.0, 3.0);

    revealDeboss(p.title, cx, cy - 25, fT, kT, 'rise', 40, 0.5, 2, false);
    revealDeboss(p.sub.toUpperCase(), cx, cy + 65, fS, kS, 'fade', 20, 0.5, 8, false);

    // Ornament (blind emboss)
    const kR = K.E(t, 0.8, 2.0, 'out5');
    if (kR > 0) {
      c.save();
      c.translate(cx, cy + 15);
      c.scale(kR, 1);
      
      const drawRule = (ox, oy, isHighlight, isShadow, isInk) => {
         c.beginPath();
         c.moveTo(-80 + ox, oy);
         c.lineTo(0 + ox, -4 + oy);
         c.lineTo(80 + ox, oy);
         c.lineTo(0 + ox, 4 + oy);
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
      c.restore();
    }

    c.restore();

    K.vignette(c, 0.15);
  }
});
