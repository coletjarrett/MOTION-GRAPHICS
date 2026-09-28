// BIBLE CHRONOLOGY — scrolling timeline. A long parchment chart that the camera glides along: era bands in soft
// tints, fine gold rules, a year ruler that runs from B.C.E. into C.E., and dated events that mark themselves on
// the axis as the camera reaches them. It ends by pulling back to show the whole span, then fades clean.
//
// DATES: the sample dates follow those commonly given in Jehovah's Witnesses' publications. The team should
// verify every date and wording against current publications before use.
//
// Editing: items[].y is the year as a signed number (negative = B.C.E., positive = C.E.); items[].date is the
// label shown. eras[] use the same convention. Labels are laid out automatically into lanes so they never
// overlap, whatever dates are supplied.
(() => {
  const S = 5;                 // world pixels per year at 1× zoom
  const AX = 620;              // axis y
  const UP = [520, 410, 300], DN = [648, 752];   // label-block tops for lanes above / below the axis
  const BAND0 = 232, BAND1 = 858;
  let L = null;                // layout computed in setup

  const uOf = y => y < 0 ? y + .5 : y - .5;       // signed year → continuous axis coordinate (0 = B.C.E./C.E.)
  const smooth = x => { x = K.clamp(x); return x * x * (3 - 2 * x); };

  // monotone cubic (Fritsch–Carlson) through camera keys — smooth glide that never overshoots
  const hermite = (T, X) => {
    const n = T.length, d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((X[i + 1] - X[i]) / (T[i + 1] - T[i]));
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
    return t => {
      if (t <= T[0]) return X[0]; if (t >= T[n - 1]) return X[n - 1];
      let i = 0; while (t > T[i + 1]) i++;
      const h = T[i + 1] - T[i], u = (t - T[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * X[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * X[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  };

  K.template({ id: 'chronology-scroll', title: 'Scrolling timeline', style: 'Bible Chronology', type: 'Timeline', dur: 32, alpha: false,
    fonts: ['700 36px GB', 'italic 400 30px GB', '400 24px GB', '400 20px GB', 'italic 400 64px GB', '400 30px GB'],
    params: {
      heading: 'Bible Chronology', sub: 'From the Flood to the completion of the Bible',
      items: [
        { y: -2370, date: '2370 B.C.E.', note: 'The Flood' },
        { y: -1943, date: '1943 B.C.E.', note: 'Abraham crosses the Euphrates' },
        { y: -1513, date: '1513 B.C.E.', note: 'The Exodus from Egypt' },
        { y: -1117, date: '1117 B.C.E.', note: 'Saul anointed king' },
        { y: -1027, date: '1027 B.C.E.', note: 'Solomon completes the temple' },
        { y: -607, date: '607 B.C.E.', note: 'Jerusalem destroyed' },
        { y: -537, date: '537 B.C.E.', note: 'The Jews return' },
        { y: -2, date: '2 B.C.E.', note: 'Jesus born' },
        { y: 29, date: '29 C.E.', note: 'Jesus baptized' },
        { y: 33, date: '33 C.E.', note: 'Jesus’ death and resurrection' },
        { y: 70, date: '70 C.E.', note: 'Jerusalem destroyed by Rome' },
        { y: 98, date: 'c. 98 C.E.', note: 'John completes the Bible' },
      ],
      eras: [
        { name: 'Patriarchs', from: -2370, to: -1728, tint: '#9fae86' },
        { name: 'Israel in Egypt', from: -1728, to: -1513, tint: '#c9a05f' },
        { name: 'Judges & Kings', from: -1513, to: -607, tint: '#8fa3b0' },
        { name: 'Exile', from: -607, to: -537, tint: '#b88a7a' },
        { name: 'Return & Restoration', from: -537, to: -2, tint: '#a9a27a' },
        { name: 'First Century', from: -2, to: 100, tint: '#b39a6a' },
      ],
      bg: '#ecdfc2', ink: '#3a2a1a', gold: '#a57b3c', muted: '#7a6448',
    },
    setup(c, p) {
      const W = 1920, fD = K.font(36, 'GB', 700), fN = K.font(30, 'GB', 400, 'italic');
      const U0 = Math.min(...p.items.map(i => uOf(i.y)), ...p.eras.map(e => uOf(e.from))) - 90;
      const U1 = Math.max(...p.items.map(i => uOf(i.y)), ...p.eras.map(e => uOf(e.to))) + 40;
      const wx = u => (u - U0) * S;
      const ev = p.items.map((it, i) => ({ ...it, i, u: uOf(it.y) })).sort((a, b) => a.u - b.u);
      ev.forEach(e => { e.x = wx(e.u); e.w = Math.max(K.width(c, e.date, fD), K.width(c, e.note, fN)) + 18; });

      // lane solver: labels hang to the right of their stem; a stem may not pass through an earlier label.
      const opts = [['a', 0, 0], ['b', 0, .9], ['a', 1, 1.3], ['b', 1, 2.2], ['a', 2, 2.6]], gap = 34;
      let best = null, bestCost = 1e9, nodes = 0; const cur = [];
      const dfs = (i, cost) => {
        if (cost >= bestCost || ++nodes > 200000) return;
        if (i === ev.length) { bestCost = cost; best = cur.slice(); return; }
        for (const o of opts) {
          let ok = true;
          for (let j = 0; j < i && ok; j++) { const q = cur[j]; if (q[0] !== o[0]) continue; if (ev[j].x + ev[j].w + gap > ev[i].x && q[1] <= o[1]) ok = false; }
          if (!ok) continue; cur.push(o); dfs(i + 1, cost + o[2]); cur.pop();
        }
      };
      dfs(0, 0);
      ev.forEach((e, i) => { const o = best ? best[i] : ['a', i % 3]; e.side = o[0]; e.lane = o[1]; e.top = e.side === 'a' ? UP[e.lane] : DN[e.lane]; });

      // camera keys: event reaches ~42% of frame width; time per hop = fixed beat + share of distance
      const tA = 4.4, tB = 23.2, beat = 1.05, target = e => e.x + W * .08;
      const D = ev.reduce((a, e, i) => a + (i ? target(e) - target(ev[i - 1]) : 0), 0);
      const b = (tB - tA - beat * (ev.length - 1)) / Math.max(1, D);
      const T = [3.0], X = [ev[0].x - W * .25]; let tt = tA;
      ev.forEach((e, i) => { if (i) tt += beat + b * (target(e) - target(ev[i - 1])); T.push(tt); X.push(target(e)); });
      T.push(tt + 1.4); X.push(X[X.length - 1] + 60);
      const travel = hermite(T, X), tEnd = T[T.length - 1];
      // reveal: when an event crosses 68% of the frame (sampled, deterministic)
      ev.forEach(e => { let r = null; for (let f = 0; f <= tEnd * 30 + 1; f++) { const tq = f / 30; if (W / 2 + (e.x - travel(tq)) <= W * .68) { r = tq; break; } } e.r = Math.max(3.3, r ?? tEnd); });
      const span = (U1 - U0) * S, zxo = (W - 300) / span, cxo = span / 2;
      L = { U0, U1, wx, ev, travel, tEnd, zxo, cxo };
    },
    draw(c, t, p) {
      const W = K.W, H = K.H, { wx, ev, travel, tEnd, zxo, cxo } = L;
      const pb0 = tEnd - .2, pb1 = pb0 + 3.4;
      // ---- camera ----
      const cam = tq => { const e = K.E(tq, pb0, pb1, 'io'); const zx = Math.exp(Math.log(zxo) * e); return { cx: K.mix(travel(Math.min(tq, pb0)), cxo, e), zx }; };
      const { cx, zx } = cam(t);
      const speed = Math.abs(travel(t + 1 / 30) - travel(t - 1 / 30)) * 15;
      const z = K.mix(1.035 - .06 * smooth(speed / 1400), 1, K.E(t, pb0, pb1 - 1));
      const X = w => W / 2 + (w - cx) * zx;

      const fin = K.E(t, 30.7, 31.8, 'io'), alive = 1 - fin;
      const intro = K.E(t, .2, 1.6, 'out');

      // ---- parchment (slow parallax) ----
      const PW = 3000, pap = K.paper(PW, H, 21, p.bg, { blot: .5, fibres: 5200 });
      const px = -((cx * zx * .12) % (PW - W));
      c.drawImage(pap, Math.round(px), 0);
      const g = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * .72); g.addColorStop(0, 'rgba(255,248,230,.22)'); g.addColorStop(1, 'rgba(90,60,20,.16)'); c.fillStyle = g; c.fillRect(0, 0, W, H);

      c.save();
      c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
      c.globalAlpha = intro * alive;

      // ---- era bands ----
      const fE = K.font(24, 'GB', 400);
      p.eras.forEach((e, i) => {
        const x0 = X(wx(uOf(e.from))), x1 = X(wx(uOf(e.to))); if (x1 < -40 || x0 > W + 40) return;
        c.save(); c.globalCompositeOperation = 'multiply';
        const gb = c.createLinearGradient(0, BAND0, 0, BAND1); gb.addColorStop(0, K.rgba(e.tint, .30)); gb.addColorStop(.5, K.rgba(e.tint, .16)); gb.addColorStop(1, K.rgba(e.tint, .26));
        c.fillStyle = gb; c.fillRect(x0, BAND0, x1 - x0, BAND1 - BAND0); c.restore();
        c.fillStyle = K.rgba(p.gold, .55); c.fillRect(Math.round(x0) - .5, BAND0, 1, BAND1 - BAND0);
        if (i === p.eras.length - 1) c.fillRect(Math.round(x1) - .5, BAND0, 1, BAND1 - BAND0);
        // name: sticky horizontal while there is room, turns vertical in narrow bands (overview)
        const name = e.name.toUpperCase(), nw = K.width(c, name, fE, 5), bw = x1 - x0;
        const hk = K.clamp((bw - nw - 44) / 60);
        if (hk > 0) {
          const nx = K.clamp(Math.max(x0 + 24, 172), x0 + 24, x1 - nw - 24);
          c.save(); c.globalAlpha *= hk; K.setText(c, fE, K.lerpc(e.tint, p.ink, .62), 5); c.fillText(name, nx, 204); c.restore();
        }
        const vk = (1 - hk) * K.E(t, pb1 - 1.2, pb1);
        if (vk > 0) {
          c.save(); c.globalAlpha *= vk; c.translate((x0 + x1) / 2 + 8, BAND1 - 18); c.rotate(-Math.PI / 2);
          K.setText(c, K.font(20, 'GB', 400), K.lerpc(e.tint, p.ink, .62), 4); c.fillText(name, 0, 0); c.restore();
        }
      });

      // ---- gold rules ----
      c.fillStyle = K.rgba(p.gold, .85);
      c.fillRect(0, BAND0 - 5, W, 1); c.fillRect(0, BAND0 - 1, W, 2);
      c.fillRect(0, BAND1, W, 2); c.fillRect(0, BAND1 + 4, W, 1);

      // ---- B.C.E. / C.E. boundary ----
      const xb = X(wx(0));
      if (xb > -100 && xb < W + 100) {
        c.save(); c.strokeStyle = K.rgba(p.gold, .9); c.lineWidth = 1.5; c.setLineDash([2, 6]);
        c.beginPath(); c.moveTo(xb, BAND0 + 6); c.lineTo(xb, BAND1 - 4); c.stroke(); c.setLineDash([]);
        c.fillStyle = p.gold; c.fillRect(xb - 1, BAND1, 2, 34);
        c.translate(xb, BAND1 + 17); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore();
        const fB = K.font(20, 'GB', 700);
        K.setText(c, fB, p.ink, 3, 'right'); c.fillText('B.C.E.  ‹', xb - 14, BAND1 + 58);
        K.setText(c, fB, p.ink, 3, 'left'); c.fillText('›  C.E.', xb + 14, BAND1 + 58);
      }

      // ---- ruler ----
      const pxYear = S * zx, fR = K.font(20, 'GB', 400);
      const uL = L.U0 + (cx - W / 2 / zx) / S - 20, uR = L.U0 + (cx + W / 2 / zx) / S + 20;
      const levels = [[10, 7], [50, 11], [100, 16], [500, 22], [1000, 26]];
      for (let li = 0; li < levels.length; li++) {
        const [st, len] = levels[li], a = K.clamp((st * pxYear - 7) / 10); if (a <= 0) continue;
        c.fillStyle = K.rgba(p.muted, .75 * a);
        for (let u = Math.ceil(uL / st) * st; u <= uR; u += st) {
          if (li < levels.length - 1 && levels.slice(li + 1).some(([s2]) => u % s2 === 0 && K.clamp((s2 * pxYear - 7) / 10) >= 1)) continue;
          if (u === 0) continue; const x = X(wx(u)); c.fillRect(x - .6, BAND1 + 6, 1.2, len);
        }
      }
      for (const st of [100, 500, 1000]) {
        const a = K.clamp((st * pxYear - 190) / 80); if (a <= 0) continue;
        for (let u = Math.ceil(uL / st) * st; u <= uR; u += st) {
          if (u === 0) continue;
          const higher = [500, 1000].filter(s2 => s2 > st && u % s2 === 0 && K.clamp((s2 * pxYear - 190) / 80) >= 1); if (higher.length) continue;
          const x = X(wx(u)); if (Math.abs(x - xb) < 150) continue;
          c.save(); c.globalAlpha *= a; K.setText(c, fR, p.muted, 1.5, 'center'); c.fillText(u < 0 ? `${-u} B.C.E.` : `${u} C.E.`, x, BAND1 + 58); c.restore();
        }
      }

      // ---- axis ----
      c.fillStyle = K.rgba(p.gold, .9); c.fillRect(0, AX - 1, W, 2);
      c.fillStyle = K.rgba(p.gold, .4); c.fillRect(0, AX + 4, W, 1);

      // ---- events ----
      const lab = 1 - K.E(t, pb0 + .1, pb0 + 1.0, 'io');
      const fD = K.font(36, 'GB', 700), fN = K.font(30, 'GB', 400, 'italic');
      ev.forEach(e => {
        const k = t - e.r; if (k < 0) return; const x = X(e.x);
        if (x < -500 || x > W + 60) return;
        const mk = K.ease.outBack(K.P(k, 0, .5));
        // stem
        const sk = K.E(k, .15, .75, 'out5') * lab;
        if (sk > 0) {
          c.fillStyle = K.rgba(p.ink, .5);
          if (e.side === 'a') { const y1 = e.top + 4; c.fillRect(x - .6, AX - 10 - (AX - 10 - y1) * sk, 1.2, (AX - 10 - y1) * sk); }
          else { const y1 = e.top + 76; c.fillRect(x - .6, AX + 10, 1.2, (y1 - AX - 10) * sk); }
        }
        // marker
        c.save(); c.translate(x, AX); c.scale(mk, mk);
        c.fillStyle = p.bg; c.beginPath(); c.arc(0, 0, 10, 0, K.TAU); c.fill();
        c.strokeStyle = p.gold; c.lineWidth = 2; c.stroke();
        c.fillStyle = p.ink; c.beginPath(); c.arc(0, 0, 4.2, 0, K.TAU); c.fill();
        c.restore();
        const halo = [p.bg, 14];
        // date + note
        if (lab > 0) {
          const tx = x + 16;
          c.save(); c.globalAlpha *= lab;
          K.reveal(c, e.date, tx, e.top + 32, { font: fD, color: p.ink, k: K.P(k, .35, 1.05), mode: 'rise', dist: 14, stagger: .35, shadow: halo });
          K.reveal(c, e.note, tx, e.top + 70, { font: fN, color: p.muted, k: K.P(k, .6, 1.5), mode: 'fade', stagger: .45, shadow: halo });
          c.restore();
        }
      });
      c.restore();

      // ---- title: intro and overview ----
      const tIn = K.env(t, .5, 1.6, 2.7, 3.5, 'out', 'io'), tOv = K.E(t, pb1 - .6, pb1 + .8, 'out') * alive;
      [[tIn, 0], [tOv, 1]].forEach(([k, ov]) => {
        if (k <= 0) return;
        const y = ov ? 420 : 420;
        c.save(); c.globalAlpha = k;
        const halo = [K.rgba(p.bg, .95), 26];
        c.shadowColor = halo[0]; c.shadowBlur = halo[1];
        K.setText(c, K.font(30, 'GB', 400), p.gold, 10, 'center'); c.fillText(p.heading.toUpperCase(), W / 2 + 5, y - 70 + (1 - k) * 10);
        K.setText(c, K.font(64, 'GB', 400, 'italic'), p.ink, 0, 'center'); c.fillText(p.sub, W / 2, y + 10 + (1 - k) * 14);
        c.shadowBlur = 0; c.fillStyle = p.gold; const rw = 120 * k; c.fillRect(W / 2 - rw / 2, y + 44, rw, 1.5);
        c.restore();
      });

      // ---- clean fade to plain parchment ----
      if (fin > 0) { c.globalAlpha = fin; c.drawImage(pap, Math.round(px), 0); c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
      K.grain(c, t, .025);
    } });
})();
