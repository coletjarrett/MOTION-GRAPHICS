// SUMI — lower third
K.template({ id: 'sumi-lower-third', title: 'Lower third', style: 'Ink Wash', type: 'Lower third', dur: 7, alpha: true,
  fonts: ['400 65px "GB"', 'italic 400 36px "GB"'],
  params: { name: 'Kenji Watanabe', role: 'Circuit overseer, Japan', ink: '#16181a', text: '#fcfcfc', accent: '#ba362a', x: 180, y: 880 },
  draw(c, t, p) {
    const W = K.W, { x, y } = p;
    const out = 1 - K.E(t, 5.7, 6.5, 'in5');
    c.globalAlpha = Math.max(0, out);

    // Dry brush stroke sweeps behind
    const bk = K.E(t, 0.2, 1.2, 'io5');
    if (bk > 0) {
      const R = K.rand(200);
      c.save();
      const nW = K.width(c, p.name, K.font(65, 'GB', 400), 1);
      const rW = K.width(c, p.role, K.font(36, 'GB', 400, 'italic'), 1);
      const wMax = Math.max(nW, rW) + 200; // extended length
      
      c.lineCap = 'round';
      c.lineJoin = 'round';
      
      // We want the stroke to perfectly cover from x-50 to x+wMax
      // and y-70 to y+60 vertically.
      const pts = K.catmull([ [x - 120, y + 20], [x + wMax * 0.3, y + 10], [x + wMax * 0.7, y], [x + wMax + 80, y - 10] ]);
      for (let i = 0; i < 100; i++) {
        c.lineWidth = 1 + R() * 3;
        c.strokeStyle = `rgba(20,22,25,${0.05 + R() * 0.15})`;
        const w1 = 90 * (1 - R() * 0.4);
        const w2 = 45 * (1 - R() * 0.4);
        const p2 = pts.map((pt, idx) => {
          const k = idx / pts.length;
          const w = K.mix(w1, w2, k);
          return [pt[0] + (R() - 0.5) * w, pt[1] + (R() - 0.5) * w * 1.5];
        });
        K.draw(c, K.wobble(p2, 3, 200 + i, 20), bk);
      }
      c.restore();
    }
    
    // Accent seal (small)
    const sk = K.E(t, 0.6, 1.2, 'outBack');
    if (sk > 0) {
      c.save();
      c.translate(x - 55, y - 40);
      c.scale(sk, sk);
      c.fillStyle = p.accent;
      c.beginPath();
      const R = K.rand(250);
      const sr = 14;
      const j = () => (R() - 0.5) * 3;
      c.moveTo(-sr + j(), -sr + j()); c.lineTo(sr + j(), -sr + j());
      c.lineTo(sr + j(), sr + j()); c.lineTo(-sr + j(), sr + j());
      c.fill();
      c.restore();
    }

    // Text
    const fN = K.font(65, 'GB', 400);
    const fR = K.font(36, 'GB', 400, 'italic');
    // Drop shadow to ensure legibility over bright video
    const sh = ['rgba(0,0,0,0.6)', 12, 2];
    K.reveal(c, p.name, x, y - 10, { font: fN, color: p.text, track: 1, align: 'left', k: K.P(t, 0.5, 1.5), mode: 'blur', stagger: 0.4, shadow: sh });
    K.reveal(c, p.role, x + 2, y + 40, { font: fR, color: 'rgba(230,230,230,0.9)', track: 1, align: 'left', k: K.P(t, 0.8, 1.8), mode: 'fade', stagger: 0.3, shadow: sh });
  }
});
