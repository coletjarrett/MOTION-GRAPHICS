// BLUEPRINT — program bumper. Drafting-table title block that draws itself.
K.template({ id: 'blueprint-bumper', title: 'Program bumper', style: 'Blueprint', type: 'Bumper / open', dur: 7, alpha: false,
  fonts: ['400 90px "DIN Condensed"', '400 36px "DIN Alternate"', '400 24px "Avenir Next Condensed"'],
  params: { title: 'CONSTRUCTION UPDATE', sub: 'Branch Office Expansion · Phase 2', date: '2026-10-15', bg: '#0b284e', ink: '#ffffff', accent: '#4facfe' },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    
    // Background
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    
    // Grid
    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= W; x += 20) { c.moveTo(x, 0); c.lineTo(x, H); }
    for (let y = 0; y <= H; y += 20) { c.moveTo(0, y); c.lineTo(W, y); }
    c.stroke();
    
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1.5;
    c.beginPath();
    for (let x = 0; x <= W; x += 100) { c.moveTo(x, 0); c.lineTo(x, H); }
    for (let y = 0; y <= H; y += 100) { c.moveTo(0, y); c.lineTo(W, y); }
    c.stroke();
    
    const cx = W / 2, cy = H / 2;
    
    // Title block border animating in
    const borderOut = K.E(t, 6.2, 6.8, 'in');
    const borderAnim = K.E(t, 0.2, 1.2, 'out5') * (1 - borderOut);
    
    if (borderAnim > 0) {
      const fT = K.font(90, 'DIN Condensed', 400);
      const fS = K.font(36, 'DIN Alternate', 400);
      const fM = K.font(24, 'Avenir Next Condensed', 400);

      const wT = K.width(c, p.title.toUpperCase(), fT, 3);
      const subW = K.width(c, p.sub.toUpperCase(), fS, 2);
      const dateW = K.width(c, 'DATE: ' + p.date, fM, 1);
      
      const bw = Math.max(wT + 120, subW + dateW + 160, 800);
      const bh = 240;
      const bx = cx - bw/2, by = cy - bh/2;
      
      const divX = bw - dateW - 80;

      c.strokeStyle = p.ink; c.lineWidth = 3;
      // Draw outer box
      const pts = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by]];
      K.draw(c, pts, borderAnim);
      
      // Draw inner lines
      const lineAnim = K.E(t, 0.6, 1.5, 'io5') * (1 - borderOut);
      if (lineAnim > 0) {
        K.draw(c, [[bx, by + bh - 70], [bx + bw, by + bh - 70]], lineAnim);
        K.draw(c, [[bx + divX, by + bh - 70], [bx + divX, by + bh]], lineAnim);
      }
      
      // Add corners
      c.fillStyle = p.ink;
      if (borderAnim > 0.8) {
        const s = 6;
        c.globalAlpha = (borderAnim - 0.8) * 5;
        c.fillRect(bx - s/2, by - s/2, s, s);
        c.fillRect(bx + bw - s/2, by - s/2, s, s);
        c.fillRect(bx - s/2, by + bh - s/2, s, s);
        c.fillRect(bx + bw - s/2, by + bh - s/2, s, s);
        c.globalAlpha = 1;
      }
      
      c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip();
      K.reveal(c, p.title.toUpperCase(), cx, by + 115, { font: fT, color: p.ink, track: 3, align: 'center', k: K.P(t, 1.0, 1.8), mode: 'type', stagger: 0.8 });
      K.reveal(c, p.sub.toUpperCase(), bx + 40, by + bh - 25, { font: fS, color: 'rgba(255,255,255,0.75)', track: 2, k: K.P(t, 1.5, 2.2), mode: 'type', stagger: 0.8 });
      K.reveal(c, 'DATE: ' + p.date, bx + divX + 30, by + bh - 28, { font: fM, color: 'rgba(255,255,255,0.5)', track: 1, k: K.P(t, 1.8, 2.3), mode: 'type', stagger: 0.8 });
      c.restore();
    }
    
    K.vignette(c, 0.4, '0,10,30');
    K.grain(c, t, 0.05);
  }
});
