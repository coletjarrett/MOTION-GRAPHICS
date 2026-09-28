// BLUEPRINT — infographic. Construction-progress bars and figures that draw like dimension lines.
K.template({ id: 'blueprint-infographic', title: 'Infographic', style: 'Blueprint', type: 'Infographic', dur: 12, alpha: false,
  fonts: ['400 64px "DIN Condensed"', '400 32px "DIN Alternate"', '400 24px "Avenir Next Condensed"'],
  params: { heading: 'EXCAVATION PROGRESS', bg: '#0b284e', ink: '#ffffff', accent: '#4facfe',
    items: [
      { label: 'EARTH MOVED', val: 75, target: 100, unit: ' kYD³' },
      { label: 'PILING DEPTH', val: 120, target: 120, unit: ' FT' },
      { label: 'CONCRETE POURED', val: 450, target: 800, unit: ' YD³' }
    ]
  },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    
    // Background and Grid
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
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

    const out = K.E(t, 11.0, 11.6, 'in');
    
    // Heading
    const fH = K.font(64, 'DIN Condensed', 400);
    c.globalAlpha = 1 - out;
    K.reveal(c, p.heading.toUpperCase(), 150, 150, { font: fH, color: p.ink, track: 3, k: K.P(t, 0.5, 1.5), mode: 'type', stagger: 0.8 });
    K.reveal(c, 'SAMPLE DATA', W - 150, 150, { font: K.font(24, 'Avenir Next Condensed', 400), color: p.accent, track: 2, align: 'right', k: K.P(t, 0.5, 1.5), mode: 'type', stagger: 0.8 });
    
    // Line under heading
    const hLine = K.E(t, 0.8, 1.8, 'io5') * (1 - out);
    if (hLine > 0) {
      c.strokeStyle = p.ink; c.lineWidth = 2;
      K.draw(c, [[150, 175], [W - 150, 175]], hLine);
    }
    
    // Items
    const n = p.items.length;
    const itemH = 180;
    const startY = 320;
    
    p.items.forEach((item, i) => {
      const cy = startY + i * itemH;
      const t0 = 1.0 + i * 0.8;
      
      const itemOut = K.E(t, 10.5 + i*0.2, 11.2 + i*0.2, 'in');
      const gAlpha = (1 - itemOut) * (1 - out);
      if (gAlpha <= 0) return;
      c.globalAlpha = gAlpha;
      
      // Reveal label
      K.reveal(c, item.label, 150, cy, { font: K.font(32, 'DIN Alternate', 400), color: 'rgba(255,255,255,0.7)', track: 2, k: K.P(t, t0, t0 + 1.0), mode: 'type', stagger: 0.8 });
      
      // Dimension lines structure
      const barX = 450, maxBarW = 1000;
      const dimAnim = K.E(t, t0 + 0.5, t0 + 1.5, 'io5');
      if (dimAnim > 0) {
        c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1;
        // End tick marks
        K.draw(c, [[barX, cy - 30], [barX, cy + 30]], dimAnim);
        K.draw(c, [[barX + maxBarW, cy - 30], [barX + maxBarW, cy + 30]], dimAnim);
        // Base dimension line
        K.draw(c, [[barX, cy], [barX + maxBarW, cy]], dimAnim);
        
        // Progress bar
        const progAnim = K.E(t, t0 + 1.5, t0 + 3.0, 'io5');
        const pct = Math.min(1, item.val / item.target);
        const curW = maxBarW * pct * progAnim;
        
        if (curW > 0) {
          c.strokeStyle = p.ink; c.lineWidth = 6;
          c.beginPath(); c.moveTo(barX, cy); c.lineTo(barX + curW, cy); c.stroke();
          
          // Draw arrowhead at end
          if (curW > 10) {
            c.fillStyle = p.ink;
            c.beginPath();
            c.moveTo(barX + curW, cy);
            c.lineTo(barX + curW - 12, cy - 8);
            c.lineTo(barX + curW - 12, cy + 8);
            c.fill();
          }
        }
        
        // Value text tracking the bar
        const curVal = Math.round(item.val * progAnim);
        const valStr = curVal + item.unit;
        c.fillStyle = p.accent; c.font = K.font(32, 'DIN Alternate', 400);
        c.textAlign = 'right'; c.textBaseline = 'middle';
        
        // Only show value if we started progressing
        if (progAnim > 0.05) {
           c.fillText(valStr, barX + curW - 20, cy - 30);
        }
        
        // Target text
        K.reveal(c, 'TARGET: ' + item.target + item.unit, barX + maxBarW + 20, cy, { font: K.font(24, 'Avenir Next Condensed', 400), color: 'rgba(255,255,255,0.5)', align: 'left', k: K.P(t, t0 + 1.0, t0 + 2.0), mode: 'fade' });
      }
    });
    
    c.globalAlpha = 1;
    K.vignette(c, 0.4, '0,10,30');
    K.grain(c, t, 0.05);
  }
});
