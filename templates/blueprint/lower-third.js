// BLUEPRINT — lower third. A technical callout with a leader line and label box.
K.template({ id: 'blueprint-lower-third', title: 'Lower third', style: 'Blueprint', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['400 54px "DIN Condensed"', '400 32px "DIN Alternate"'],
  params: { name: 'David Walker', role: 'Structural Engineer', x: 250, y: 800, ink: '#ffffff', bg: '#0b284e', accent: '#4facfe' },
  draw(c, t, p) {
    const { x, y } = p, out = 1 - K.E(t, 6.0, 6.6, 'in');
    if (out <= 0) return;
    
    // Helper for grid inside the box
    const drawGrid = (cx, cy, cw, ch) => {
      c.save(); c.beginPath(); c.rect(cx, cy, cw, ch); c.clip();
      c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1;
      for (let i = 0; i < cw; i += 15) { c.beginPath(); c.moveTo(cx + i, cy); c.lineTo(cx + i, cy + ch); c.stroke(); }
      for (let j = 0; j < ch; j += 15) { c.beginPath(); c.moveTo(cx, cy + j); c.lineTo(cx + cw, cy + j); c.stroke(); }
      c.restore();
    };

    const fN = K.font(54, 'DIN Condensed', 400);
    const fR = K.font(32, 'DIN Alternate', 400);
    const wN = K.width(c, p.name.toUpperCase(), fN, 2);
    const wR = K.width(c, p.role.toUpperCase(), fR, 1.5);
    const boxW = Math.max(wN, wR) + 120, boxH = 130;
    
    // Leader line
    const l1 = K.E(t, 0.2, 0.6, 'out5');
    const l2 = K.E(t, 0.6, 1.0, 'io5');
    
    c.globalAlpha = out;
    c.strokeStyle = p.ink; c.lineWidth = 2;
    // Draw target marker (crosshair and circle)
    if (l1 > 0) {
      const tx = x - 120, ty = y;
      c.beginPath(); c.arc(tx, ty, 15 * l1, 0, K.TAU); c.stroke();
      c.beginPath(); c.moveTo(tx - 25*l1, ty); c.lineTo(tx + 25*l1, ty); c.stroke();
      c.beginPath(); c.moveTo(tx, ty - 25*l1); c.lineTo(tx, ty + 25*l1); c.stroke();
    }
    
    // Draw leader line from target to box
    if (l2 > 0) {
      const pts = [[x - 120, y], [x - 60, y - boxH/2 + 20], [x, y - boxH/2 + 20]];
      K.draw(c, pts, l2);
    }
    
    // Box
    const boxReveal = K.E(t, 0.8, 1.4, 'out5');
    const by = y - boxH + 20;
    if (boxReveal > 0) {
      c.save();
      c.translate(x, by);
      c.beginPath(); c.rect(0, 0, boxW * boxReveal, boxH);
      c.fillStyle = K.rgba(p.bg, 0.95); c.fill();
      drawGrid(0, 0, boxW * boxReveal, boxH);
      c.strokeStyle = p.ink; c.lineWidth = 2;
      c.beginPath(); c.rect(0, 0, boxW * boxReveal, boxH); c.stroke();
      
      // Box accent corners
      c.fillStyle = p.ink;
      if (boxReveal > 0.5) {
        c.fillRect(-3, -3, 6, 6);
        c.fillRect(boxW * boxReveal - 3, -3, 6, 6);
        c.fillRect(-3, boxH - 3, 6, 6);
        c.fillRect(boxW * boxReveal - 3, boxH - 3, 6, 6);
      }
      
      c.restore();
    }
    
    // Text
    c.save(); c.beginPath(); c.rect(x, by, boxW, boxH); c.clip();
    K.reveal(c, p.name.toUpperCase(), x + 40, by + 55, { font: fN, color: p.ink, track: 2, k: K.P(t, 1.1, 1.8), mode: 'type', stagger: 0.8 });
    K.reveal(c, p.role.toUpperCase(), x + 40, by + 100, { font: fR, color: 'rgba(255,255,255,0.7)', track: 1.5, k: K.P(t, 1.4, 2.1), mode: 'type', stagger: 0.8 });
    c.restore();
  }
});
