// BLUEPRINT — timeline. Project milestones on a drafting grid.
K.template({ id: 'blueprint-timeline', title: 'Timeline', style: 'Blueprint', type: 'Timeline', dur: 14, alpha: false,
  fonts: ['400 46px "DIN Condensed"', '400 30px "DIN Alternate"', '400 22px "Avenir Next Condensed"', '400 64px "DIN Condensed"'],
  params: { heading: 'PROJECT TIMELINE', bg: '#0b284e', ink: '#ffffff', accent: '#4facfe', muted: '#a0b0c0',
    items: [
      { date: 'JAN 2026', name: 'Site Clearing', note: 'Phase 1 Complete' },
      { date: 'MAY 2026', name: 'Foundation', note: 'Concrete Poured' },
      { date: 'AUG 2026', name: 'Steel Framing', note: 'Main Structures' },
      { date: 'DEC 2026', name: 'Enclosure', note: 'Weather-tight' }
    ]
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, x0 = 200, x1 = W - 200, y = 540, n = p.items.length, step = 1.75, t0 = 1.5;
    
    // Background and Grid
    c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= W; x += 20) { c.moveTo(x, 0); c.lineTo(x, H); }
    for (let yGrid = 0; yGrid <= H; yGrid += 20) { c.moveTo(0, yGrid); c.lineTo(W, yGrid); }
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1.5;
    c.beginPath();
    for (let x = 0; x <= W; x += 100) { c.moveTo(x, 0); c.lineTo(x, H); }
    for (let yGrid = 0; yGrid <= H; yGrid += 100) { c.moveTo(0, yGrid); c.lineTo(W, yGrid); }
    c.stroke();

    const out = K.E(t, 12.6, 13.6, 'in');
    c.globalAlpha = 1 - out;
    
    // Heading
    K.reveal(c, p.heading.toUpperCase(), 150, 150, { font: K.font(64, 'DIN Condensed', 400), color: p.ink, track: 3, k: K.P(t, 0.3, 1.3), mode: 'type', stagger: 0.8 });
    K.reveal(c, 'SAMPLE DATA', W - 150, 150, { font: K.font(24, 'Avenir Next Condensed', 400), color: p.accent, track: 2, align: 'right', k: K.P(t, 0.3, 1.3), mode: 'type', stagger: 0.8 });

    // Header line
    const hLine = K.E(t, 0.6, 1.6, 'io5') * (1 - out);
    if (hLine > 0) {
      c.strokeStyle = p.ink; c.lineWidth = 2;
      K.draw(c, [[150, 175], [W - 150, 175]], hLine);
    }
    
    // Axis line
    const ax = K.E(t, 0.6, 2.0, 'io5');
    if (ax > 0) {
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2;
      K.draw(c, [[x0, y], [x1, y]], ax);
    }
    
    const X = i => K.mix(x0 + 100, x1 - 100, i / (n - 1));
    
    // Progress line (animated solid white)
    let prog = x0; 
    for (let i = 0; i < n; i++) prog = K.mix(prog, X(i), K.E(t, t0 + i * step - 0.5, t0 + i * step, 'io'));
    
    if (prog > x0) {
      c.strokeStyle = p.ink; c.lineWidth = 4;
      c.beginPath(); c.moveTo(x0, y); c.lineTo(prog, y); c.stroke();
    }
    
    // Milestones
    p.items.forEach((it, i) => {
      const ti = t0 + i * step, k = K.E(t, ti, ti + 0.6, 'outBack'), x = X(i); 
      
      // Node point
      if (t > ti - 0.5 && k > 0) {
        // Outer ring
        c.strokeStyle = p.ink; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, 12 * Math.min(1, k), 0, K.TAU); c.stroke();
        // Inner fill
        c.fillStyle = p.accent;
        c.beginPath(); c.arc(x, y, 6 * Math.min(1, k), 0, K.TAU); c.fill();
        
        // Target crosshairs
        if (k > 0.8) {
          const chAnim = K.E(t, ti + 0.5, ti + 1.0, 'out5');
          if (chAnim > 0) {
            c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(x - 20*chAnim, y); c.lineTo(x - 14, y); c.stroke();
            c.beginPath(); c.moveTo(x + 14, y); c.lineTo(x + 20*chAnim, y); c.stroke();
            c.beginPath(); c.moveTo(x, y - 20*chAnim); c.lineTo(x, y - 14); c.stroke();
            c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x, y + 20*chAnim); c.stroke();
          }
        }
      }
      
      // Vertical leader line (alternating up and down)
      const isUp = i % 2 === 0;
      const dir = isUp ? -1 : 1;
      const tLen = 120;
      
      const leaderAnim = K.E(t, ti + 0.1, ti + 0.6, 'out5');
      if (leaderAnim > 0) {
        c.strokeStyle = p.ink; c.lineWidth = 1;
        K.draw(c, [[x, y + dir*20], [x, y + dir*tLen]], leaderAnim);
      }
      
      // Text block
      const ty = y + dir * tLen + (isUp ? -30 : 30);
      K.reveal(c, it.date, x, isUp ? ty - 70 : ty, { font: K.font(46, 'DIN Condensed', 400), color: p.ink, align: 'center', k: K.P(t, ti + 0.2, ti + 0.9), mode: 'type', stagger: 0.8 });
      K.reveal(c, it.name.toUpperCase(), x, isUp ? ty - 30 : ty + 30, { font: K.font(30, 'DIN Alternate', 400), color: p.accent, align: 'center', k: K.P(t, ti + 0.4, ti + 1.1), mode: 'type', stagger: 0.8 });
      K.reveal(c, it.note.toUpperCase(), x, isUp ? ty : ty + 60, { font: K.font(22, 'Avenir Next Condensed', 400), color: p.muted, align: 'center', k: K.P(t, ti + 0.6, ti + 1.3), mode: 'type', stagger: 0.8 });
    });
    
    c.globalAlpha = 1;
    K.vignette(c, 0.4, '0,10,30');
    K.grain(c, t, 0.05);
  }
});
