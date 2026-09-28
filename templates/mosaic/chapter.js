const PALETTE = {
  cream: ['#e6dbca', '#d4c6b1', '#f0e8d9', '#dcd0bf', '#e8dfcd'],
  terracotta: ['#c65f46', '#a8452e', '#b65237', '#d16b50'],
  ochre: ['#d8a050', '#b87b32', '#c98e41', '#e3af62'],
  slate: ['#5c636a', '#43484d', '#6d757d', '#50565c'],
  red: ['#8a2522', '#5e1614', '#751d1a', '#9c2f2c'],
};

K.template({
  id: 'mosaic-chapter', title: 'Chapter card', style: 'Ancient Mosaic', type: 'Card',
  dur: 6, alpha: false,
  fonts: ['600 110px "Optima"', 'italic 400 44px "Optima"'],
  params: { title: 'CHAPTER 4', sub: 'In the Synagogue at Thessalonica' },
  setup(c, p) {
    const W = c.canvas.width, H = c.canvas.height;
    const tileSize = 16;
    const cols = Math.ceil(W / tileSize);
    const rows = Math.ceil(H / tileSize);
    const tiles = [];
    const R = K.rand(12345);
    
    const meander = [
      "XXXXX...",
      "X...X...",
      "X.XXX...",
      "X.X.....",
      "X.XXXXXX"
    ];

    const fT = K.font(110, 'Optima', 600);
    const fS = K.font(44, 'Optima', 600, 'italic');
    const textW = Math.max(
      K.width(c, (p.title || '').toUpperCase(), fT, 12),
      K.width(c, (p.sub || ''), fS, 2)
    );
    const hw = Math.ceil((textW + 160) / 2 / tileSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let type = 'cream';
        if (y >= 4 && y <= 12) {
          if (y === 4 || y === 12) type = 'slate';
          else if (y === 5 || y === 11) type = 'cream';
          else type = (meander[(y - 6) % 5][x % 8] === 'X') ? 'red' : 'cream';
        } else if (y >= rows - 13 && y <= rows - 5) {
          if (y === rows - 13 || y === rows - 5) type = 'slate';
          else if (y === rows - 12 || y === rows - 6) type = 'cream';
          else type = (meander[(y - (rows - 11)) % 5][x % 8] === 'X') ? 'red' : 'cream';
        } else if (x < 4 || x > cols - 5) {
          type = 'slate';
        } else {
          type = 'cream';
        }

        const plaqueY1 = Math.floor(rows / 2) - 10;
        const plaqueY2 = Math.floor(rows / 2) + 12;
        const plaqueX1 = Math.floor(cols / 2) - hw;
        const plaqueX2 = Math.floor(cols / 2) + hw;
        if (y >= plaqueY1 && y <= plaqueY2 && x >= plaqueX1 && x <= plaqueX2) {
          if (y === plaqueY1 || y === plaqueY2 || x === plaqueX1 || x === plaqueX2) {
            type = 'ochre';
          } else if (y === plaqueY1+1 || y === plaqueY2-1 || x === plaqueX1+1 || x === plaqueX2-1) {
            type = 'red';
          } else {
            type = 'slate';
          }
        }

        const colors = PALETTE[type];
        const color = colors[Math.floor(R() * colors.length)];
        const ox = (R() - 0.5) * 2, oy = (R() - 0.5) * 2;
        const w = tileSize - 2 + (R() - 0.5) * 2;
        const h = tileSize - 2 + (R() - 0.5) * 2;
        const wave = K.noise(x * 0.04, y * 0.04, 99); 
        const dist = (x / cols) * 0.7 + (y / rows) * 0.3;
        
        tiles.push({ x: x * tileSize + ox, y: y * tileSize + oy, w, h, color, wave, dist, type });
      }
    }
    p._tiles = tiles;
  },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    
    const bgIn = K.E(t, 0, 1.0, 'out');
    const bgOut = 1 - K.E(t, 5.2, 6.0, 'in');
    c.globalAlpha = Math.min(bgIn, bgOut);
    c.fillStyle = '#c8bba6';
    c.fillRect(0, 0, W, H);
    
    for (let i = 0; i < p._tiles.length; i++) {
      const tile = p._tiles[i];
      const stagger = tile.dist * 0.8 + (Math.abs(tile.wave) * 0.2); 
      const tIn = 0.1 + stagger * 1.5;
      const k = K.E(t, tIn, tIn + 0.4, 'outBack');
      const kOut = 1 - K.E(t, 4.8 + tile.dist * 0.3, 4.8 + tile.dist * 0.3 + 0.5, 'in');
      
      const alpha = Math.min(K.E(t, tIn, tIn + 0.1), kOut);
      if (alpha <= 0) continue;
      
      c.globalAlpha = alpha;
      c.fillStyle = tile.color;
      
      const yOff = (1 - k) * -15 + (1 - kOut) * 15;
      
      c.fillRect(tile.x, tile.y + yOff, tile.w, tile.h);
      
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.fillRect(tile.x, tile.y + yOff, tile.w, 2);
      c.fillStyle = 'rgba(0,0,0,0.15)';
      c.fillRect(tile.x, tile.y + yOff + tile.h - 2, tile.w, 2);
    }
    
    const fT = K.font(110, 'Optima', 600);
    const fS = K.font(44, 'Optima', 600, 'italic');
    const textOut = K.E(t, 4.8, 5.5, 'in');
    
    c.globalAlpha = 1 - textOut;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.8)';
    c.shadowBlur = 12;
    c.shadowOffsetY = 4;
    
    K.reveal(c, (p.title || '').toUpperCase(), W/2, H/2 - 10, {
      font: fT, color: '#ffffff', track: 12, align: 'center', 
      k: K.P(t, 1.2, 2.5), mode: 'fade', stagger: 0.3
    });
    c.restore();
    
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.8)';
    c.shadowBlur = 10;
    c.shadowOffsetY = 2;
    K.reveal(c, p.sub || '', W/2, H/2 + 75, {
      font: fS, color: '#ffffff', track: 2, align: 'center', 
      k: K.P(t, 1.8, 3.0), mode: 'fade', stagger: 0.2
    });
    c.restore();
    
    c.globalAlpha = Math.min(bgIn, bgOut);
    K.vignette(c, 0.4);
    K.grain(c, t, 0.04);
  }
});
