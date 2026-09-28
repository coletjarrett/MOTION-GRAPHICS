// SUMI — scripture callout
K.template({ id: 'sumi-scripture', title: 'Scripture callout', style: 'Ink Wash', type: 'Scripture card', dur: 6, alpha: false,
  fonts: ['400 110px "GB"', '400 30px "GB"'],
  params: { kicker: 'Please open your Bible to', ref: 'Psalm 104:24', bg: '#efece4', ink: '#1c1e21', accent: '#ba362a' },
  setup(c, p) {
    K.paper(K.W, K.H, 42, p.bg, { blot: 0.7, fibres: K.W * K.H / 700 });
  },
  draw(c, t, p) {
    const W = K.W, H = K.H, cx = W / 2, cy = H / 2;
    
    // Draw background
    c.drawImage(K.paper(W, H, 42, p.bg), 0, 0);
    
    const out = K.E(t, 5.0, 5.8, 'in5');
    c.globalAlpha = Math.max(0, 1 - out);

    // Enso-like calm brush ring
    const bk = K.E(t, 0.2, 1.8, 'io5');
    if (bk > 0) {
      const R = K.rand(300);
      c.save();
      c.globalCompositeOperation = 'multiply';
      c.lineCap = 'round';
      c.lineJoin = 'round';
      // define an open circle
      const pts = [];
      const r = 360;
      for (let a = -Math.PI*0.35; a < Math.PI * 1.45; a += 0.08) {
        // slightly imperfect radius based on angle
        const r_mod = r + Math.sin(a * 3) * 10 + (R() - 0.5) * 5;
        pts.push([cx + Math.cos(a)*r_mod, cy + Math.sin(a)*r_mod]);
      }
      for (let i = 0; i < 90; i++) {
        c.lineWidth = 1 + R() * 2.5;
        c.strokeStyle = `rgba(28,30,33,${0.03 + R() * 0.15})`;
        const p2 = pts.map((pt, idx) => {
          // taper heavily at both ends
          const k = idx / pts.length;
          const w = 50 * Math.sin(k * Math.PI) * (1 - R()*0.4);
          return [pt[0] + (R() - 0.5) * w, pt[1] + (R() - 0.5) * w];
        });
        K.draw(c, K.wobble(p2, 3, 300 + i, 15), bk);
      }
      c.restore();
    }
    
    // Tiny seal accent inside or near the circle
    const sk = K.E(t, 1.0, 1.6, 'outBack');
    if (sk > 0) {
      c.save();
      c.translate(cx + 90, cy + 130);
      c.scale(sk, sk);
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = p.accent;
      c.globalAlpha = 0.85;
      c.beginPath();
      const R = K.rand(350);
      const sr = 18;
      const j = () => (R() - 0.5) * 4;
      c.moveTo(-sr + j(), -sr + j()); c.lineTo(sr + j(), -sr + j());
      c.lineTo(sr + j(), sr + j()); c.lineTo(-sr + j(), sr + j());
      c.fill();
      
      // small geometric interior mark
      c.globalCompositeOperation = 'destination-out';
      c.globalAlpha = 1;
      c.strokeStyle = '#000';
      c.lineWidth = 2.5;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(-7, -7); c.lineTo(7, -7);
      c.moveTo(0, -7); c.lineTo(0, 7);
      c.stroke();
      c.restore();
    }

    // Text
    const fR = K.font(110, 'GB', 400);
    const fK = K.font(30, 'GB', 400);
    K.reveal(c, p.kicker.toUpperCase(), cx, cy - 100, { font: fK, color: '#666', track: 6, align: 'center', k: K.P(t, 0.4, 1.4), mode: 'fade', stagger: 0.3 });
    K.reveal(c, p.ref, cx, cy + 30, { font: fR, color: p.ink, track: 2, align: 'center', k: K.P(t, 0.8, 1.8), mode: 'blur', stagger: 0.4 });

    c.globalAlpha = 1;
    K.vignette(c, 0.12, '0,0,0');
  }
});
