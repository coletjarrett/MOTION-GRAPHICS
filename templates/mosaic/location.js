const PALETTE = {
  cream: ['#e6dbca', '#d4c6b1', '#f0e8d9', '#dcd0bf', '#e8dfcd'],
  terracotta: ['#c65f46', '#a8452e', '#b65237', '#d16b50'],
  ochre: ['#d8a050', '#b87b32', '#c98e41', '#e3af62'],
  slate: ['#5c636a', '#43484d', '#6d757d', '#50565c'],
  red: ['#8a2522', '#5e1614', '#751d1a', '#9c2f2c'],
};

K.template({
  id: 'mosaic-location', title: 'Location tag', style: 'Ancient Mosaic', type: 'Lower third',
  dur: 7, alpha: true,
  fonts: ['600 56px "Optima"'],
  params: { location: 'Corinth, Greece', x: 200, y: 868 },
  setup(c, p) {
    const tileSize = 10;
    const R = K.rand(777);
    const tiles = [];
    const r = 46;
    const cx = p.x + r;
    const cy = p.y - 35;
    
    for(let y = cy - r; y <= cy + r; y += tileSize) {
      for(let x = cx - r; x <= cx + r; x += tileSize) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist > r) continue;
        
        let type = 'cream';
        if (dist < 14) type = 'red';
        else if (dist < 28) type = 'ochre';
        else type = 'slate';
        
        const colors = PALETTE[type];
        const color = colors[Math.floor(R() * colors.length)];
        const ox = (R() - 0.5) * 2, oy = (R() - 0.5) * 2;
        const w = tileSize - 2 + (R() - 0.5) * 2;
        const h = tileSize - 2 + (R() - 0.5) * 2;
        
        tiles.push({ x: x + ox, y: y + oy, w, h, color, dist });
      }
    }
    p._tiles = tiles;
  },
  draw(c, t, p) {
    const out = 1 - K.E(t, 6.0, 6.8, 'in');
    
    const sc = K.E(t, 0.2, 1.2) * out;
    if (sc > 0) {
      const g = c.createLinearGradient(0, p.y - 120, 0, p.y + 60);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, `rgba(0,0,0,${0.35 * sc})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, p.y - 120, 1200, 180);
    }
    
    const cx = p.x + 46;
    const cy = p.y - 35;
    
    const gScale = K.E(t, 0.1, 0.8, 'outBack') * out;
    if (gScale > 0) {
      c.fillStyle = '#b0a496';
      c.beginPath();
      c.arc(cx, cy, 48 * gScale, 0, K.TAU);
      c.fill();
    }
    
    for(let i = 0; i < p._tiles.length; i++) {
      const tile = p._tiles[i];
      const stagger = tile.dist * 0.015; 
      const k = K.E(t, 0.2 + stagger, 0.2 + stagger + 0.6, 'outBack');
      const alpha = Math.min(k, out);
      if (alpha <= 0) continue;
      
      c.globalAlpha = alpha;
      c.fillStyle = tile.color;
      const yOff = (1 - k) * -25;
      c.fillRect(tile.x - tile.w/2, tile.y + yOff - tile.h/2, tile.w, tile.h);
      
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.fillRect(tile.x - tile.w/2, tile.y + yOff - tile.h/2, tile.w, 1.5);
      c.fillStyle = 'rgba(0,0,0,0.15)';
      c.fillRect(tile.x - tile.w/2, tile.y + yOff + tile.h/2 - 1.5, tile.w, 1.5);
    }
    
    c.globalAlpha = 1;
    
    const fN = K.font(56, 'Optima', 600);
    const txt = (p.location || '').toUpperCase();
    const wN = K.width(c, txt, fN, 2);
    
    c.save(); 
    c.beginPath(); 
    c.rect(cx + 60, p.y - 120, 1500, 200); 
    c.clip();
    
    const kN = K.E(t, 0.6, 1.4, 'out5');
    const oN = (1 - kN) * -(wN + 60) + (1 - out) * -(wN + 60);
    
    c.globalAlpha = out;
    c.shadowColor = 'rgba(0,0,0,0.5)';
    c.shadowBlur = 8;
    c.shadowOffsetY = 2;
    
    K.setText(c, fN, '#fff', 2);
    c.fillText(txt, cx + 75 + oN, p.y - 15);
    
    c.restore();
    
    K.grain(c, t, 0.02);
  }
});
