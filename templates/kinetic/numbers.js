// KINETIC TYPE — stat reveal. A heading sets on the grid with a clearly marked SAMPLE DATA tag; three columns
// open one after another, each numeral rising into its mask and counting up to its value, underlined by a short
// accent bar, with its label following. Columns slide away in order at the end.
(() => {
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  K.template({ id: 'kinetic-numbers', title: 'Stat reveal', style: 'Kinetic Type', type: 'Data', dur: 9, alpha: false,
    fonts: ['700 250px "DIN Condensed"', '700 58px "Avenir Next"', '600 40px "Avenir Next"', '700 24px "DIN Condensed"'],
    params: { title: 'Building together', tag: 'Sample data',
      stats: [{ value: 240, suffix: '', label: 'volunteers' }, { value: 18, suffix: '', label: 'months' }, { value: 1, suffix: '', label: 'new Kingdom Hall' }],
      bg: '#efebe3', ink: '#15181d', accent: '#e2a33a' },
    draw(c, t, p) {
      const W = K.W, H = K.H, x0 = 190, x1 = W - 190, n = p.stats.length, colW = (x1 - x0) / n;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H); K.vignette(c, .12);
      
      // heading, masked rise
      const yT = 338, fT = K.font(58, 'Avenir Next', 700);
      const hk = K.E(t, .3, 1.0, 'out5'), ho = K.E(t, 7.8, 8.4, 'in');
      c.save(); c.beginPath(); c.rect(0, yT - 70, W, 88); c.clip();
      K.setText(c, fT, p.ink, -.5); c.fillText(p.title, x0, yT + (1 - hk) * 100 - ho * 100); c.restore();

      // SAMPLE DATA tag (outlined pill, right-aligned on the heading's cap line)
      const tagA = K.E(t, .6, 1.2) * (1 - K.E(t, 7.9, 8.4));
      if (tagA > 0) {
        const fG = K.font(24, 'DIN Condensed', 700), s = p.tag.toUpperCase(), tw = K.width(c, s, fG, 4), pw = tw + 36, ph = 38;
        c.globalAlpha = tagA; c.strokeStyle = K.rgba(p.ink, .55); c.lineWidth = 1.5; K.rr(c, x1 - pw, yT - 42, pw, ph, 19); c.stroke();
        K.setText(c, fG, K.rgba(p.ink, .75), 4); c.fillText(s, x1 - pw + 18, yT - 42 + 27); c.globalAlpha = 1;
      }

      // rule under the heading
      const rk = K.E(t, .5, 1.5, 'io5'), ro = K.E(t, 7.9, 8.6, 'io5');
      c.fillStyle = p.ink; const rx0 = x0 + (x1 - x0) * ro, rx1 = x0 + (x1 - x0) * rk; if (rx1 > rx0) c.fillRect(rx0, yT + 34, rx1 - rx0, 2);

      // columns
      const fN = K.font(250, 'DIN Condensed', 700), fL = K.font(40, 'Avenir Next', 600), yN = 690;
      p.stats.forEach((st, i) => {
        const t0 = 1.2 + i * .5, cx0 = x0 + i * colW + (i ? 56 : 0), oT = 7.7 + i * .12;
        // divider
        if (i) { const dk = K.E(t, t0 - .3, t0 + .4, 'io5') * (1 - K.E(t, oT, oT + .5, 'io5')); c.fillStyle = K.rgba(p.ink, .2); c.fillRect(x0 + i * colW, 468, 1.5, 380 * dk); }
        // numeral: masked rise + count
        const k = K.E(t, t0, t0 + .7, 'out5'), cnt = K.E(t, t0 + .05, t0 + 2.0, 'out5'), o = K.E(t, oT, oT + .55, 'in');
        const v = Math.round(st.value * cnt);
        c.save(); c.beginPath(); c.rect(cx0 - 10, yN - 200, colW, 212); c.clip();
        K.setText(c, fN, p.ink, 1); c.fillText(fmt(v) + (st.suffix || ''), cx0, yN + (1 - k) * 210 + o * 210); c.restore();
        // accent bar
        const bk = K.E(t, t0 + .5, t0 + 1.2, 'io5'), bo = K.E(t, oT - .05, oT + .4, 'io5'), bw = 96;
        if (bk > bo) { c.fillStyle = p.accent; c.fillRect(cx0 + bw * bo, yN + 30, bw * (bk - bo), 10); }
        // label
        const lk = K.E(t, t0 + .6, t0 + 1.3, 'out5'), lo = K.E(t, oT + .05, oT + .5, 'in');
        c.save(); c.beginPath(); c.rect(cx0 - 10, yN + 58, colW, 70); c.clip();
        K.setText(c, fL, p.ink, 0); c.fillText(st.label, cx0, yN + 106 + (1 - lk) * 60 - lo * 60); c.restore();
      });
      c.globalAlpha = 1;
    } });
})();
