// Stand-in "footage" plates for previewing overlay graphics: soft-focus scenes drawn procedurally.
K.template({ id: 'plate', title: 'Preview plate', dur: 1, alpha: false, params: { kind: 'warm' },
  draw(c, t, p) {
    const W = K.W, H = K.H, R = K.rand(7);
    const bokeh = (n, cols, rmin, rmax, a, seed, yb = [0, 1]) => { const R = K.rand(seed); for (let i = 0; i < n; i++) { const x = R() * W, y = K.mix(yb[0], yb[1], R()) * H, r = K.mix(rmin, rmax, R()); const g = c.createRadialGradient(x, y, 0, x, y, r); const col = cols[(R() * cols.length) | 0]; g.addColorStop(0, K.rgba(col, a * (.5 + R() * .5))); g.addColorStop(.75, K.rgba(col, a * .35)); g.addColorStop(1, K.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, K.TAU); c.fill(); } };
    if (p.kind === 'warm') {        // a living room / hall interior out of focus
      let g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6b4a33'); g.addColorStop(.5, '#3a2a22'); g.addColorStop(1, '#1d1714'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      g = c.createRadialGradient(W * .78, H * .3, 0, W * .78, H * .3, W * .6); g.addColorStop(0, 'rgba(255,214,160,.55)'); g.addColorStop(1, 'rgba(255,214,160,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.filter = 'blur(40px)'; c.fillStyle = 'rgba(40,30,26,.8)'; c.fillRect(W * .05, H * .15, W * .18, H * .9); c.fillStyle = 'rgba(120,90,70,.5)'; c.fillRect(W * .3, H * .55, W * .5, H * .5); c.filter = 'none';
      c.globalCompositeOperation = 'screen'; bokeh(38, ['#ffd9a0', '#ffc27a', '#fff0d0'], 20, 90, .5, 3, [0, .6]); c.globalCompositeOperation = 'source-over';
    } else if (p.kind === 'garden') {
      let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#b9d4d9'); g.addColorStop(.45, '#7fa36a'); g.addColorStop(1, '#3d5a2f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.filter = 'blur(50px)'; for (let i = 0; i < 26; i++) { c.fillStyle = K.rgba(['#4f7a3a', '#6d9449', '#2f4e27', '#98b86a'][i % 4], .7); c.beginPath(); c.ellipse(R() * W, H * (.35 + R() * .5), 120 + R() * 220, 80 + R() * 160, 0, 0, K.TAU); c.fill(); } c.filter = 'none';
      c.globalCompositeOperation = 'screen'; bokeh(50, ['#fff6d8', '#e8f5c8', '#ffffff'], 12, 60, .45, 11, [0, .7]); c.globalCompositeOperation = 'source-over';
    } else if (p.kind === 'studio') {
      let g = c.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .5, W * .75); g.addColorStop(0, '#3b4a5c'); g.addColorStop(1, '#0e1319'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'screen'; bokeh(24, ['#7fa7d6', '#c6d8ee', '#f2d7a6'], 30, 110, .25, 21, [.05, .7]); c.globalCompositeOperation = 'source-over';
    } else if (p.kind === 'sky') {
      let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5b86b5'); g.addColorStop(.55, '#f1c894'); g.addColorStop(.7, '#e3a06c'); g.addColorStop(1, '#3c3a44'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.filter = 'blur(6px)'; [['#6f6b80', .62, 90], ['#4d4a5a', .7, 60], ['#2f2d38', .8, 40]].forEach(([col, y0, amp], k) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * y0 - amp * K.fbm(x / 400, k, 40 + k, 4) * 2 + amp); c.lineTo(W, H); c.fill(); }); c.filter = 'none';
      g = c.createRadialGradient(W * .68, H * .56, 0, W * .68, H * .56, 360); g.addColorStop(0, 'rgba(255,240,210,.95)'); g.addColorStop(.2, 'rgba(255,220,170,.5)'); g.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    K.vignette(c, .35); K.grain(c, 0, .06);
  } });
