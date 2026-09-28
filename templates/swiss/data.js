// SWISS GRID — bar chart. Title and full-measure rule, a SAMPLE DATA tag, a value axis with hairline gridlines,
// and five bars that grow on the grid (two columns each), values counting up above them; the largest bar
// takes the accent. Data-driven: pass {label, value} rows and the axis max. Figures are sample data.
(() => {
  const M = 150, GUT = 24, CW = (1920 - 2 * M - 11 * GUT) / 12;
  const col = i => M + i * (CW + GUT), span = n => n * CW + (n - 1) * GUT, EDGE = col(11) + CW;
  const lift = (c, s, x, y, font, color, size, k, o = 0, track = 0, align = 'left') => {
    if (k <= 0 || o >= 1) return; c.save(); c.beginPath(); c.rect(x - 2000, y - size * 1.05, 4000, size * 1.35); c.clip();
    K.setText(c, font, color, track, align); c.fillText(s, x, y + (1 - K.ease.out5(k)) * size * 1.15 - K.ease.in5(o) * size * 1.2); c.restore();
  };

  K.template({ id: 'swiss-data', title: 'Bar chart', style: 'Swiss Grid', type: 'Data / chart', dur: 10, alpha: false,
    fonts: ['700 60px "Helvetica Neue"', '500 26px "Helvetica Neue"', '500 20px "Helvetica Neue"', '700 44px "Helvetica Neue"', '500 22px "Helvetica Neue"'],
    params: { title: 'Publications printed by region (sample)', unit: 'Millions of copies · illustrative figures', tag: 'Sample data', source: 'Source: sample', max: 80, ticks: 4, suffix: 'M',
      rows: [{ label: 'Africa', value: 42 }, { label: 'Americas', value: 68 }, { label: 'Asia', value: 55 }, { label: 'Europe', value: 31 }, { label: 'Oceania', value: 9 }],
      bg: '#efece6', ink: '#222222', accent: '#c8452f', paper: '#f7f5f0', muted: '#7a7772' },
    draw(c, t, p) {
      const W = K.W, H = K.H;
      c.fillStyle = p.bg; c.fillRect(0, 0, W, H);
      const X = K.P(t, 9.2, 9.8);   // exit
      // header
      lift(c, p.title, col(0) - 3, 232, K.font(60, 'Helvetica Neue', 700), p.ink, 60, K.P(t, .3, 1.1), K.P(t, 9.3, 9.8), -1.5);
      lift(c, p.unit, col(0), 282, K.font(26, 'Helvetica Neue', 500), p.muted, 26, K.P(t, .6, 1.3), K.P(t, 9.2, 9.7));
      // SAMPLE DATA tag: a red block flush right on the grid
      const fTag = K.font(20, 'Helvetica Neue', 500), tw = K.width(c, p.tag.toUpperCase(), fTag, 2) + 36;
      const tk = K.E(t, .5, 1.0, 'out5') * (1 - K.E(t, 9.3, 9.7, 'in5'));
      if (tk > 0) { c.fillStyle = p.accent; c.fillRect(EDGE - tw * tk, 150, tw * tk, 40); c.save(); c.beginPath(); c.rect(EDGE - tw * tk, 150, tw, 40); c.clip();
        K.setText(c, fTag, p.paper, 2, 'right'); c.fillText(p.tag.toUpperCase(), EDGE - 18, 177); c.restore(); }
      const lk = K.E(t, .4, 1.2, 'io5'), lo = K.E(t, 9.3, 9.9, 'io5');
      c.fillStyle = p.ink; c.fillRect(col(0) + (EDGE - col(0)) * lo, 318, (EDGE - col(0)) * (lk - lo), 3);
      // axis & gridlines — plot area spans columns 3–12
      const y0 = 830, y1 = 400, px0 = col(2) - GUT, n = p.ticks, fA = K.font(22, 'Helvetica Neue', 500);
      for (let i = 0; i <= n; i++) {
        const gy = K.mix(y0, y1, i / n), gk = K.E(t, 1.0 + i * .08, 1.7 + i * .08, 'io5') * (1 - K.E(t, 9.0, 9.6, 'io5'));
        c.fillStyle = K.rgba(p.ink, i === 0 ? 1 : .18); c.fillRect(px0, gy - (i === 0 ? 1 : 0), (EDGE - px0) * gk, i === 0 ? 2 : 1);
        lift(c, String(Math.round(p.max * i / n)), col(1) + CW, gy + 8, fA, p.muted, 22, K.P(t, 1.1 + i * .08, 1.6 + i * .08), K.P(t, 9.1, 9.5), 0, 'right');
      }
      // source note in the empty first columns, aligned to the label baseline
      lift(c, p.source, col(0), y0 + 80, K.font(20, 'Helvetica Neue', 500), p.muted, 20, K.P(t, 2.4, 3.0), K.P(t, 9.1, 9.5), .3);
      c.fillStyle = p.accent; const sk = K.E(t, 2.3, 2.8, 'out5') * (1 - K.E(t, 9.1, 9.5, 'in5')); c.fillRect(col(0), y0 + 34, 32 * sk, 4);
      // bars: two columns each, starting at column 3
      const big = Math.max(...p.rows.map(r => r.value));
      p.rows.forEach((r, i) => {
        const bx = col(2 + i * 2), bw = span(2) - CW * .6, ti = 2.0 + i * .28;
        const g = K.E(t, ti, ti + 1.2, 'out5') * (1 - K.E(t, 8.9 + i * .05, 9.5 + i * .05, 'in5'));
        const h = (y0 - y1) * K.clamp(r.value / p.max) * g, top = y0 - h;
        c.fillStyle = r.value === big ? p.accent : p.ink; c.fillRect(bx, top, bw, h);
        // value counting up, riding the top of the bar
        const vk = K.P(t, ti + .1, ti + .6), vo = K.P(t, 8.8 + i * .05, 9.2 + i * .05);
        lift(c, Math.round(r.value * K.ease.out5(K.P(t, ti, ti + 1.2))) + p.suffix, bx, top - 18, K.font(44, 'Helvetica Neue', 700), p.ink, 44, vk, vo, -1);
        // index number + label under the baseline, flush-left with the bar
        const ck = K.P(t, 1.5 + i * .1, 2.1 + i * .1), co = K.P(t, 9.1, 9.5);
        lift(c, String(i + 1).padStart(2, '0'), bx, y0 + 40, K.font(20, 'Helvetica Neue', 500), p.muted, 20, ck, co, 1);
        lift(c, r.label, bx, y0 + 80, K.font(26, 'Helvetica Neue', 500), p.ink, 26, K.P(t, 1.6 + i * .1, 2.2 + i * .1), co);
      });
    } });
})();
