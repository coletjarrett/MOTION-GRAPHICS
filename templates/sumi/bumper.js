// SUMI — program bumper
K.template({ id: 'sumi-bumper', title: 'Program bumper', style: 'Ink Wash', type: 'Bumper / open', dur: 8, alpha: false,
  fonts: ['400 75px "GB"', '400 32px "GB"', '400 40px "Hiragino Mincho ProN"'],
  params: { title: 'Lessons From Creation', sub: 'Part 6 · Mountains', bg: '#efece4', ink: '#1c1e21', seal: '#ba362a' },
  setup(c, p) {
    K.paper(K.W, K.H, 42, p.bg, { blot: 0.7, fibres: K.W * K.H / 700 });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    
    // Draw background
    c.drawImage(K.paper(W, H, 42, p.bg), 0, 0);
    
    const out = K.E(t, 7.0, 7.8, 'in5');
    c.globalAlpha = Math.max(0, 1 - out);

    // Misty mountains using K.wash layered ink washes
    const mk = K.E(t, 0, 3, 'out5');
    if (mk > 0) {
      K.wash(c, cx - 500, cy + 300, 600, 'rgba(40,43,46,0.3)', mk, 42, { sx: 1.8, sy: 0.7, blend: 'multiply', edge: 0.1 });
      K.wash(c, cx + 400, cy + 350, 500, 'rgba(60,63,66,0.35)', K.E(t, 0.3, 3.3, 'out5'), 43, { sx: 1.6, sy: 0.8, blend: 'multiply', edge: 0.15 });
      K.wash(c, cx - 100, cy + 450, 700, 'rgba(20,23,26,0.5)', K.E(t, 0.6, 3.6, 'out5'), 44, { sx: 2.1, sy: 0.6, blend: 'multiply', edge: 0.2 });
    }

    // Single brush stroke crossing behind the text, lowered slightly so it sits between title and sub
    const bk = K.E(t, 1.0, 2.5, 'io5');
    if (bk > 0) {
      const R = K.rand(100);
      c.save();
      c.globalCompositeOperation = 'multiply';
      const pts = K.catmull([ [cx - 800, cy + 20], [cx - 300, cy - 10], [cx + 300, cy + 10], [cx + 800, cy - 20] ]);
      for (let i = 0; i < 60; i++) {
        c.lineWidth = 1 + R() * 2;
        c.strokeStyle = `rgba(30,32,35,${0.03 + R() * 0.15})`;
        const w1 = 50 * (1 - R() * 0.5);
        const w2 = 25 * (1 - R() * 0.5);
        const p2 = pts.map((p, i) => {
          const k = i / pts.length;
          const w = K.mix(w1, w2, k);
          return [p[0] + (R() - 0.5) * w, p[1] + (R() - 0.5) * w * 2];
        });
        K.draw(c, K.wobble(p2, 3, 100 + i, 15), bk);
      }
      c.restore();
    }

    // Text - moved sub text slightly lower and out of the black stroke for legibility
    const fT = K.font(75, 'GB', 400);
    const fS = K.font(32, 'GB', 400);
    
    K.reveal(c, p.title, cx - 350, cy - 35, { font: fT, color: p.ink, track: 2, align: 'left', k: K.P(t, 1.5, 3.5), mode: 'blur', stagger: 0.5 });
    
    // Sub text
    // A lighter color for contrast over the wash
    K.reveal(c, p.sub.toUpperCase(), cx - 345, cy + 50, { font: fS, color: '#e8e5dc', track: 6, align: 'left', k: K.P(t, 2.0, 4.0), mode: 'fade', stagger: 0.3 });

    // Seal
    const sk = K.E(t, 2.0, 2.8, 'outBack');
    if (sk > 0) {
      c.save();
      // place seal next to the title
      const tw = K.width(c, p.title, fT, 2);
      c.translate(cx - 350 + tw + 65, cy - 65);
      c.scale(sk, sk);
      
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = p.seal;
      c.globalAlpha = 0.9;
      
      // organic square
      c.beginPath();
      const R = K.rand(200);
      const sr = 30;
      const j = () => (R() - 0.5) * 5;
      c.moveTo(-sr + j(), -sr + j());
      c.lineTo(sr + j(), -sr + j());
      c.lineTo(sr + j(), sr + j());
      c.lineTo(-sr + j(), sr + j());
      c.fill();
      
      // simple geometric mark
      c.globalCompositeOperation = 'destination-out';
      c.globalAlpha = 1;
      c.strokeStyle = '#000';
      c.lineWidth = 3.5;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(-12, -12); c.lineTo(12, -12);
      c.moveTo(0, -12); c.lineTo(0, 12);
      c.moveTo(-10, 4); c.lineTo(10, 4);
      c.stroke();
      c.restore();
    }

    c.globalAlpha = 1;
    K.vignette(c, 0.15, '0,0,0');
  }
});
