// BIBLE MAPS — journey. A parchment map of the north-east Mediterranean (Asia Minor, Cyprus, Syria). The route of
// Paul's first missionary journey (Acts 13–14) inks itself on, a marker travels it, each city is dotted and
// named as it is reached, and the camera gently follows before pulling back to the whole journey.
// Geography is hand-authored lon/lat, projected equirectangular (x scaled by cos φ0). The static base map
// (paper, sea hatching, coast water-lines, relief, lakes, rivers, coast ink) is painted once and cached.
(() => {
  const LON0 = 33, LAT0 = 36.3, S = 230, COS = Math.cos(LAT0 * Math.PI / 180);
  const PX = (lon, lat) => [(lon - LON0) * S * COS, (LAT0 - lat) * S];
  // base-map extent in world px and its render resolution (so camera push-ins stay crisp)
  const X0 = -1210, Y0 = -830, BW = 2480, BH = 1690, RES = 1.5;

  // ---------------- geography (approximate, lon/lat) ----------------
  // Mainland: Aegean coast → south coast of Asia Minor (Gulf of Antalya, Cilicia, Gulf of Iskenderun) → Levant to Tyre.
  const COAST = [[26.62, 39.95], [26.75, 39.35], [26.95, 38.95], [26.85, 38.65], [27.1, 38.45], [26.75, 38.42], [26.4, 38.32], [26.55, 38.12],
    [27.0, 38.03], [27.27, 37.88], [27.2, 37.6], [27.42, 37.36], [27.25, 37.07], [27.6, 37.02], [28.05, 37.04], [28.32, 37.03], [27.95, 36.93],
    [27.45, 36.7], [27.75, 36.63], [28.1, 36.73], [28.28, 36.84], [28.6, 36.78], [28.88, 36.64], [29.1, 36.62], [29.3, 36.33], [29.64, 36.18],
    [30.0, 36.24], [30.15, 36.3], [30.42, 36.2], [30.53, 36.45], [30.58, 36.66], [30.66, 36.86], [30.85, 36.86], [31.12, 36.83], [31.42, 36.76],
    [31.75, 36.62], [32.0, 36.53], [32.3, 36.33], [32.56, 36.12], [32.83, 36.02], [33.12, 36.08], [33.42, 36.15], [33.7, 36.18], [33.95, 36.3],
    [34.18, 36.47], [34.42, 36.66], [34.64, 36.79], [34.92, 36.73], [35.17, 36.62], [35.38, 36.55], [35.56, 36.62], [35.8, 36.77], [36.05, 36.88],
    [36.2, 36.79], [36.16, 36.6], [36.0, 36.5], [35.88, 36.4], [35.84, 36.25], [35.9, 36.12], [35.86, 35.98], [35.8, 35.85], [35.88, 35.7],
    [35.77, 35.52], [35.9, 35.37], [35.94, 35.18], [35.88, 34.92], [35.96, 34.72], [35.84, 34.46], [35.66, 34.26], [35.64, 34.12], [35.52, 33.94],
    [35.47, 33.88], [35.4, 33.7], [35.37, 33.56], [35.21, 33.28], [35.1, 33.03], [35.07, 32.92], [34.96, 32.83], [34.9, 32.45], [34.8, 32.05], [34.7, 31.6]];
  const MAIN_CLOSE = [[42, 31.6], [42, 41.5], [25, 41.5], [25, 39.95]];
  const CYPRUS = [[32.28, 35.1], [32.32, 34.95], [32.41, 34.77], [32.62, 34.67], [32.84, 34.63], [32.95, 34.57], [33.04, 34.67], [33.3, 34.71],
    [33.58, 34.82], [33.66, 34.82], [33.75, 34.94], [33.95, 34.97], [34.08, 34.97], [33.97, 35.07], [33.94, 35.2], [33.96, 35.33], [34.15, 35.43],
    [34.37, 35.56], [34.59, 35.69], [34.45, 35.67], [34.22, 35.56], [33.97, 35.45], [33.72, 35.38], [33.33, 35.34], [33.02, 35.37], [32.93, 35.4],
    [32.86, 35.26], [32.88, 35.18], [32.7, 35.18], [32.47, 35.14], [32.4, 35.05], [32.3, 35.1]];
  const ISLANDS = [
    [[27.72, 36.16], [27.95, 36.33], [28.23, 36.45], [28.2, 36.3], [28.08, 36.1], [27.86, 35.9], [27.7, 35.95]],            // Rhodes
    [[26.97, 36.86], [27.3, 36.91], [27.35, 36.78], [27.05, 36.8]],                                                       // Kos
    [[27.1, 35.9], [27.24, 35.78], [27.2, 35.45], [27.1, 35.42], [27.06, 35.7]],                                            // Karpathos
    [[26.6, 37.7], [26.82, 37.8], [27.06, 37.72], [26.95, 37.64], [26.7, 37.63]],                                          // Samos
  ];
  const LAKES = [
    [[31.36, 37.84], [31.52, 37.93], [31.7, 37.8], [31.72, 37.65], [31.58, 37.56], [31.44, 37.63]],                        // Beyşehir
    [[30.86, 38.06], [30.9, 38.2], [30.95, 38.3], [30.88, 38.28], [30.83, 38.15], [30.82, 38.05]],                           // Eğirdir
    [[33.2, 38.9], [33.45, 39.02], [33.62, 38.8], [33.55, 38.62], [33.33, 38.62], [33.2, 38.72]],                          // Tuz
  ];
  const RIVERS = [
    [[36.72, 34.6], [36.62, 35.1], [36.56, 35.5], [36.42, 35.88], [36.36, 36.18], [36.2, 36.21], [36.05, 36.13], [35.93, 36.06]],   // Orontes
    [[30.98, 37.62], [30.92, 37.25], [30.88, 37.0], [30.86, 36.87]],                                                          // Cestrus
    [[35.1, 37.6], [34.95, 37.25], [34.9, 36.95], [34.9, 36.74]],                                                              // Cydnus
    [[35.75, 37.9], [35.6, 37.3], [35.5, 36.9], [35.55, 36.63]],                                                               // Sarus
  ];
  // mountain ridges for the relief heightfield: [amp, width°, pts]
  const RIDGES = [
    [1.0, .38, [[29.2, 36.95], [30.1, 37.25], [30.9, 37.35], [31.7, 37.15], [32.5, 36.9], [33.4, 36.88], [34.2, 37.2], [35.0, 37.55], [35.8, 37.95], [36.6, 38.3]]],
    [.75, .25, [[29.2, 36.45], [29.8, 36.65], [30.35, 36.95]]],
    [.7, .2, [[36.05, 36.3], [36.3, 36.8], [36.6, 37.25]]],
    [.6, .2, [[36.1, 35.95], [36.2, 35.3], [36.25, 34.8]]],
    [.85, .22, [[35.95, 34.55], [35.85, 34.1], [35.62, 33.5]]],
    [.6, .22, [[36.5, 34.15], [36.0, 33.45]]],
    [.8, .2, [[32.65, 34.92], [32.95, 34.94], [33.15, 34.9]]],
    [.45, .07, [[32.98, 35.3], [33.5, 35.3], [34.05, 35.36]]],
    [.45, .5, [[29.0, 38.2], [30.2, 38.8], [31.3, 38.95]]],
  ];

  // route geography: via-points per leg (lon/lat), sea legs curved
  const VIA = {
    'sel>sal': { sea: 1, bulge: -.12 }, 'sal>pap': { via: [[33.62, 34.93], [33.12, 34.74], [32.75, 34.7]] },
    'pap>per': { sea: 1, bulge: .1 }, 'per>antP': { via: [[30.95, 37.35], [30.86, 37.78], [31.02, 38.12]] },
    'antP>ico': { via: [[31.75, 38.15], [32.15, 38.0]] }, 'lys>der': { via: [[32.85, 37.46]] },
    'att>antS': { sea: 1, via: [[31.3, 36.42], [32.5, 35.92], [33.8, 35.84], [35.0, 35.96], [35.88, 36.11]] },
  };

  const smooth = (P, n) => K.catmull(P, n);
  const toB = ([x, y]) => [(x - X0) * RES, (y - Y0) * RES];
  const path2d = (pts, close = true) => { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); if (close) p.closePath(); return p; };
  const segDist = (px, py, pts) => { let best = 1e9; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let u = ((px - ax) * dx + (py - ay) * dy) / l2; u = u < 0 ? 0 : u > 1 ? 1 : u; const ex = ax + u * dx - px, ey = ay + u * dy - py; const d = ex * ex + ey * ey; if (d < best) best = d; } return Math.sqrt(best); };

  function paintBase(c, w, h, p) {
    const ink = p.ink;
    // parchment
    c.drawImage(K.paper(w, h, 21, p.paper, { blot: .6 }), 0, 0);
    // land polygons in base coordinates, smoothed then lightly hand-wobbled
    const hand = (lonlat, seed, closeExtra) => { let pts = smooth(lonlat, 6).map(q => PX(...q)); pts = K.wobble(K.wobble(pts, 2.6, seed, 10), 1.0, seed + 50, 4).map(toB); if (closeExtra) pts = pts.concat(closeExtra.map(q => toB(PX(...q)))); return pts; };
    const mainPts = hand(COAST, 3, MAIN_CLOSE), cyPts = hand(CYPRUS.concat([CYPRUS[0]]), 5), isl = ISLANDS.map((I, i) => hand(I.concat([I[0]]), 9 + i));
    const land = new Path2D(); [mainPts, cyPts, ...isl].forEach(P => land.addPath(path2d(P)));
    const sea = new Path2D(); sea.rect(0, 0, w, h); sea.addPath(land);
    // sea tint + wave-line hatching
    c.save(); c.clip(sea, 'evenodd');
    c.globalCompositeOperation = 'multiply'; c.fillStyle = p.seaTint; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over';
    c.strokeStyle = ink; c.lineWidth = 1.1;
    const gap = 11 * RES;
    for (let row = 0, y = gap / 2; y < h; y += gap, row++) {
      let seg = [];
      for (let x = -10, j = 0; x < w + 20; x += 14, j++) {
        const yy = y + Math.sin(x * .018 + row * 1.7) * 2.2 + (K.noise(x * .004, row * .5, 4) - .5) * 5;
        seg.push([x, yy]);
        if (seg.length === 7) { const a = K.noise(x * .0025, row * .09, 8); c.globalAlpha = Math.max(0, a - .28) * .5; K.line(c, seg); c.stroke(); seg = [[x, yy]]; }
      }
    }
    c.restore();
    // coastal water-lines (engraved rings following the coast outwards)
    const ring = document.createElement('canvas'); ring.width = w; ring.height = h; const r = ring.getContext('2d');
    r.lineJoin = 'round';
    [[10, .5], [20, .34], [32, .22], [47, .13], [66, .07]].forEach(([d, a]) => {
      const lw = d * 2 * RES; r.globalCompositeOperation = 'source-over'; r.strokeStyle = K.rgba(ink, a); r.lineWidth = lw; r.stroke(land);
      r.globalCompositeOperation = 'destination-out'; r.strokeStyle = '#000'; r.lineWidth = lw - 2.2; r.stroke(land);
    });
    r.globalCompositeOperation = 'destination-out'; r.fill(land);
    c.drawImage(ring, 0, 0);
    // land tint + relief
    c.save(); c.clip(land);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = p.landTint; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over';
    const g = 6, gw = Math.ceil(w / g) + 2, gh = Math.ceil(h / g) + 2, H = new Float32Array(gw * gh);
    const ridges = RIDGES.map(([amp, wd, pts]) => [amp, wd, pts.map(([lo, la]) => [lo * COS, la])]);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = (i * g) / RES + X0, y = (j * g) / RES + Y0, lon = x / (S * COS) + LON0, lat = LAT0 - y / S;
      let v = .2 * K.fbm(lon * 2.3, lat * 2.3, 7, 5);
      const det = .6 + .65 * K.fbm(lon * 5, lat * 5, 11, 4);
      for (const [amp, wd, pts] of ridges) { const d = segDist(lon * COS, lat, pts) / wd; if (d < 3) v += amp * Math.exp(-d * d) * det; }
      H[j * gw + i] = v;
    }
    const img = c.createImageData(gw, gh), tint = c.createImageData(gw, gh);
    for (let j = 1; j < gh - 1; j++) for (let i = 1; i < gw - 1; i++) {
      const k = j * gw + i, gx = (H[k + 1] - H[k - 1]) / 2, gy = (H[k + gw] - H[k - gw]) / 2;
      const lit = K.clamp((gx + gy) * 14, -1, 1), o = k * 4;
      if (lit < 0) { img.data[o] = 96; img.data[o + 1] = 66; img.data[o + 2] = 38; img.data[o + 3] = -lit * 105; }
      else { img.data[o] = 255; img.data[o + 1] = 250; img.data[o + 2] = 232; img.data[o + 3] = lit * 85; }
      tint.data[o] = 128; tint.data[o + 1] = 92; tint.data[o + 2] = 52; tint.data[o + 3] = K.clamp(H[k] - .3, 0, 1.2) * 45;
    }
    const tc = document.createElement('canvas'); tc.width = gw; tc.height = gh; const tx = tc.getContext('2d');
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    tx.putImageData(tint, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(tc, 0, 0, gw * g, gh * g);
    tx.clearRect(0, 0, gw, gh); tx.putImageData(img, 0, 0); c.globalCompositeOperation = 'source-over'; c.drawImage(tc, 0, 0, gw * g, gh * g);
    // rivers
    c.strokeStyle = K.rgba(p.water, .75); c.lineWidth = 1.6 * RES; c.lineCap = 'round'; c.lineJoin = 'round';
    RIVERS.forEach((R, i) => { K.line(c, K.wobble(smooth(R, 8).map(q => PX(...q)), 1.4, 40 + i, 5).map(toB)); c.stroke(); });
    // lakes
    LAKES.forEach((L, i) => { const P = path2d(hand(L.concat([L[0]]), 30 + i)); c.fillStyle = p.lake; c.fill(P); c.strokeStyle = K.rgba(ink, .7); c.lineWidth = 1.4 * RES; c.stroke(P); });
    c.restore();
    // coastline ink: a firm line plus a faint second pass for a hand-inked feel
    c.lineJoin = 'round'; c.strokeStyle = K.rgba(ink, .85); c.lineWidth = 2.1 * RES; c.stroke(land);
    const ink2 = new Path2D(); [hand(COAST, 71), hand(CYPRUS.concat([CYPRUS[0]]), 73), ...ISLANDS.map((I, i) => hand(I.concat([I[0]]), 80 + i))].forEach(P => ink2.addPath(path2d(P, false)));
    c.strokeStyle = K.rgba(ink, .28); c.lineWidth = 1.1 * RES; c.stroke(ink2);
  }

  K.template({
    id: 'maps-journey', title: 'Journey map', style: 'Bible Maps', type: 'Map', dur: 18, alpha: false,
    fonts: ['400 44px GB', '700 44px GB', 'italic 400 30px GB', 'italic 500 30px GB'],
    params: {
      title: 'Paul’s First Missionary Journey', ref: 'Acts 13–14',
      paper: '#efe3c6', seaTint: '#dfe2d6', landTint: '#f7ecd2', ink: '#4a3826', routeCol: '#9a3322', water: '#6f8a8c', lake: '#cfd5c6',
      cities: {
        antS: { name: 'Antioch', note: 'of Syria', lon: 36.16, lat: 36.20, dx: 16, dy: 6, align: 'left' },
        sel: { name: 'Seleucia', lon: 35.93, lat: 36.12, dx: -14, dy: -12, align: 'right' },
        sal: { name: 'Salamis', lon: 33.90, lat: 35.18, dx: 16, dy: 8, align: 'left' },
        pap: { name: 'Paphos', lon: 32.41, lat: 34.76, dx: -14, dy: 24, align: 'right' },
        per: { name: 'Perga', lon: 30.85, lat: 36.96, dx: 16, dy: -8, align: 'left' },
        att: { name: 'Attalia', lon: 30.70, lat: 36.88, dx: -14, dy: 22, align: 'right' },
        antP: { name: 'Antioch', note: 'of Pisidia', lon: 31.19, lat: 38.31, dx: 0, dy: -40, align: 'center' },
        ico: { name: 'Iconium', lon: 32.49, lat: 37.87, dx: 16, dy: 2, align: 'left' },
        lys: { name: 'Lystra', lon: 32.35, lat: 37.58, dx: -14, dy: 14, align: 'right' },
        der: { name: 'Derbe', lon: 33.36, lat: 37.35, dx: 16, dy: 8, align: 'left' },
      },
      route: ['antS', 'sel', 'sal', 'pap', 'per', 'antP', 'ico', 'lys', 'der', 'lys', 'ico', 'antP', 'per', 'att', 'antS'],
      turn: 'der',   // the leg after this city is drawn as the return journey
      regions: [
        { text: 'GALATIA', lon: 32.25, lat: 38.62 }, { text: "PAMPHYLIA", lon: 32.15, lat: 36.95 }, { text: 'CILICIA', lon: 34.55, lat: 37.15 },
        { text: 'SYRIA', lon: 36.85, lat: 35.35 }, { text: 'CYPRUS', lon: 33.08, lat: 35.06 }, { text: 'Mediterranean Sea', lon: 30.55, lat: 35.25, italic: true },
      ],
    },
    setup(c, p) {
      K.cached('maps-journey-base', Math.round(BW * RES), Math.round(BH * RES), (cx, w, h) => paintBase(cx, w, h, p));
      const C = {}; for (const k in p.cities) C[k] = { ...p.cities[k], w: PX(p.cities[k].lon, p.cities[k].lat) };
      // legs
      const legs = []; let ret = false;
      for (let i = 0; i < p.route.length - 1; i++) {
        const a = p.route[i], b = p.route[i + 1], A = C[a].w, B = C[b].w;
        const key = `${a}>${b}`, rkey = `${b}>${a}`; let v = VIA[key], rev = false; if (!v && VIA[rkey] && !VIA[rkey].sea) { v = VIA[rkey]; rev = true; }
        let pts;
        if (v && v.via) { const via = v.via.map(q => PX(...q)); pts = K.catmull([A, ...(rev ? via.reverse() : via), B], 10); }
        else if (v && v.sea) { const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1]; const L = Math.hypot(dx, dy), b2 = v.bulge * L; const cp = [mx - dy / L * b2, my + dx / L * b2]; pts = Array.from({ length: 41 }, (_, j) => { const u = j / 40, q = 1 - u; return [q * q * A[0] + 2 * q * u * cp[0] + u * u * B[0], q * q * A[1] + 2 * q * u * cp[1] + u * u * B[1]]; }); }
        else pts = K.catmull([A, B], 10);
        if (ret) { // offset the return trip so it reads beside the outbound line
          pts = pts.map((q, j) => { const q0 = pts[Math.max(0, j - 1)], q1 = pts[Math.min(pts.length - 1, j + 1)], dx = q1[0] - q0[0], dy = q1[1] - q0[1], L = Math.hypot(dx, dy) || 1, f = Math.min(1, j / 6, (pts.length - 1 - j) / 6); return [q[0] - dy / L * 7 * f, q[1] + dx / L * 7 * f]; });
        }
        legs.push({ a, b, pts, L: K.len(pts), sea: !!(v && v.sea), ret });
        if (b === p.turn) ret = true;
      }
      // timing: 2.0 s → 15.4 s, each leg weighted by length^0.65, with a short dwell at each city
      const T0 = 2.0, T1 = 15.0, dwell = .28, wsum = legs.reduce((s, l) => s + Math.pow(l.L, .65), 0), move = T1 - T0 - dwell * (legs.length - 1);
      let tt = T0; legs.forEach(l => { l.t0 = tt; l.t1 = tt + move * Math.pow(l.L, .65) / wsum; tt = l.t1 + dwell; });
      // when is each city first reached
      C[p.route[0]].tin = T0 - .5; legs.forEach(l => { if (C[l.b].tin == null) C[l.b].tin = l.t1; });
      // overview framing: bbox of the route
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; legs.forEach(l => l.pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
      p._m = { C, legs, over: [(x0 + x1) / 2 + 30, (y0 + y1) / 2 - 18] };
    },
    draw(c, t, p) {
      const W = K.W, H = K.H, { C, legs, over } = p._m;
      const base = K.cached('maps-journey-base', 0, 0, () => { });
      // marker world position at time t
      const mpos = tt => { let l = legs[0]; if (tt <= l.t0) return K.at(l.pts, 0); for (const L of legs) { l = L; if (tt < L.t1) break; } if (tt >= l.t1) return K.at(l.pts, l.L); if (tt < l.t0) return K.at(l.pts, 0); return K.at(l.pts, l.L * K.ease.io(K.P(tt, l.t0, l.t1))); };
      // camera: overview → follow the marker (smoothed over a time window) → overview
      let fx = 0, fy = 0, ws = 0; for (let i = -6; i <= 6; i++) { const s = i * .15, w = 1 - Math.abs(i) / 7, q = mpos(t + s); fx += q[0] * w; fy += q[1] * w; ws += w; } fx /= ws; fy /= ws;
      const f = K.E(t, 1.2, 3.4, 'io') * (1 - K.E(t, 14.7, 16.5, "io"));
      const z = K.mix(K.mix(.97, .88, K.E(t, 14, 17, "io")), 1.36, f) + .02 * K.E(t, 0, 1.8, "out");
      let cx = K.mix(over[0], fx, f), cy = K.mix(over[1], fy + 20, f);
      const hw = W / 2 / z, hh = H / 2 / z; cx = K.clamp(cx, X0 + hw, X0 + BW - hw); cy = K.clamp(cy, Y0 + hh, Y0 + BH - hh);
      const SX = ([x, y]) => [(x - cx) * z + W / 2, (y - cy) * z + H / 2];
      const ink = p.ink, fade = K.E(t, 0, 1.2, 'out');
      // base map
      c.fillStyle = p.paper; c.fillRect(0, 0, W, H);
      c.save(); c.globalAlpha = fade; c.setTransform(z / RES, 0, 0, z / RES, W / 2 - (cx - X0) * z, H / 2 - (cy - Y0) * z);
      c.imageSmoothingQuality = 'high'; c.drawImage(base, 0, 0); c.restore();
      const q = Math.pow(z, .45);   // text/marker size follows zoom, gently
      // region labels
      const label = (s, x, y, font, col, a, track, align = 'center') => { if (a <= 0) return; c.save(); c.globalAlpha = a; K.setText(c, font, col, track, align); c.lineJoin = 'round'; c.strokeStyle = K.rgba(p.paper, .75); c.lineWidth = 5; c.strokeText(s, x, y); c.fillText(s, x, y); c.restore(); };
      p.regions.forEach((r, i) => {
        const [x, y] = SX(PX(r.lon, r.lat)), a = K.E(t, .8 + i * .12, 2.0 + i * .12, 'out') * .8;
        if (r.italic) label(r.text, x, y, K.font(34 * q, 'GB', 400, 'italic'), K.rgba(p.water, 1), a * 1.1, 2 * q);
        else label(r.text, x, y, K.font(21 * q, "GB", 400), K.rgba(ink, .8), a, 9 * q);
      });
      // route (world space so the dash pattern never crawls while the camera moves)
      c.save(); c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z); c.lineCap = 'round'; c.lineJoin = 'round';
      legs.forEach(l => {
        const k = K.P(t, l.t0, l.t1); if (k <= 0) return; const kk = K.ease.io(k);
        c.strokeStyle = K.rgba(p.paper, .55); c.lineWidth = 7 / z; c.setLineDash([]); K.draw(c, l.pts, kk);
        c.strokeStyle = p.routeCol; c.globalAlpha = .92;
        if (l.ret) { c.lineWidth = 3.4 / Math.sqrt(z); c.setLineDash([.1, 7]); }
        else { c.lineWidth = 2.6 / Math.sqrt(z); c.setLineDash(l.sea ? [12, 7] : [8, 5]); }
        K.draw(c, l.pts, kk); c.globalAlpha = 1;
      });
      c.restore();
      // cities
      const fN = s => K.font(27 * q * s, 'GB', 700), fI = K.font(20 * q, 'GB', 400, 'italic');
      Object.values(C).forEach(ct => {
        if (ct.tin == null || t < ct.tin - .05) return;
        const [x, y] = SX(ct.w), k = K.E(t, ct.tin - .05, ct.tin + .45, 'outBack'), la = K.E(t, ct.tin + .05, ct.tin + .7, 'out');
        const pulse = K.P(t, ct.tin, ct.tin + 1.1);
        if (pulse > 0 && pulse < 1) { c.strokeStyle = K.rgba(p.routeCol, .5 * (1 - pulse)); c.lineWidth = 2; c.beginPath(); c.arc(x, y, (8 + 26 * K.ease.out(pulse)) * q, 0, K.TAU); c.stroke(); }
        c.fillStyle = p.paper; c.beginPath(); c.arc(x, y, 7.5 * q * k, 0, K.TAU); c.fill();
        c.strokeStyle = ink; c.lineWidth = 2; c.stroke();
        c.fillStyle = ink; c.beginPath(); c.arc(x, y, 3.4 * q * k, 0, K.TAU); c.fill();
        const lx = x + ct.dx * q, ly = y + ct.dy * q + (1 - la) * 8;
        label(ct.name, lx, ly + (ct.align === 'center' ? 0 : 9 * q), fN(1), ink, la, .4 * q, ct.align);
        if (ct.note) label(ct.note, lx, ly + (ct.align === 'center' ? 21 : 30) * q, fI, K.rgba(ink, .85), la, .3 * q, ct.align);
      });
      // travelling marker
      const mv = K.E(t, 1.5, 2.0) * (1 - K.E(t, 15.3, 16.0));
      if (mv > 0) {
        const [mx, my] = SX(mpos(t));
        c.fillStyle = K.rgba(p.routeCol, .18 * mv); c.beginPath(); c.arc(mx, my, 17 * q, 0, K.TAU); c.fill();
        c.fillStyle = p.routeCol; c.strokeStyle = p.paper; c.lineWidth = 3; c.globalAlpha = mv; c.beginPath(); c.arc(mx, my, 7.5 * q, 0, K.TAU); c.fill(); c.stroke(); c.globalAlpha = 1;
      }
      // cartouche (screen space, top right)
      const ck = K.E(t, .4, 1.6, "out5") * (1 - K.E(t, 3.0, 3.7, "io")) + K.E(t, 15.2, 16.2, "out5");
      if (ck > 0) {
        const fT = K.font(46, 'GB', 400), fR = K.font(30, 'GB', 400, 'italic');
        const tw = K.width(c, p.title, fT, .5), bw = tw + 96, bh = 168, bx = W - 150 - bw, by = 112 + (1 - ck) * -14;
        c.save(); c.globalAlpha = ck;
        c.shadowColor = 'rgba(60,40,20,.22)'; c.shadowBlur = 18; c.shadowOffsetY = 4;
        c.fillStyle = p.paper; c.fillRect(bx, by, bw, bh); c.shadowColor = 'transparent';
        c.globalCompositeOperation = 'multiply'; c.drawImage(K.paper(bw | 0, bh, 5, '#f7efdc'), bx, by); c.globalCompositeOperation = 'source-over';
        c.strokeStyle = K.rgba(ink, .8); c.lineWidth = 2; c.strokeRect(bx + 8, by + 8, bw - 16, bh - 16);
        c.strokeStyle = K.rgba(ink, .45); c.lineWidth = 1; c.strokeRect(bx + 14, by + 14, bw - 28, bh - 28);
        K.reveal(c, p.title, bx + bw / 2, by + 78, { font: fT, color: ink, track: .5, align: 'center', k: K.P(t, .6, 1.9) + K.P(t, 15.4, 16.4), mode: "fade", stagger: .5 });
        const rl = 60 * Math.max(K.E(t, 1.0, 1.8, "out5") * (t < 10 ? 1 : 0), K.E(t, 15.6, 16.4, "out5")); c.fillStyle = p.routeCol; c.fillRect(bx + bw / 2 - rl, by + 98, rl * 2, 1.5);
        K.reveal(c, p.ref, bx + bw / 2, by + 138, { font: fR, color: p.routeCol, track: 1, align: 'center', k: K.P(t, 1.2, 2.2) + K.P(t, 15.8, 16.8), mode: 'fade', stagger: .4 });
        c.restore();
      }
      K.vignette(c, .28, '70,45,20');
      K.grain(c, t, .03);
      // clean exit to parchment
      const ex = K.E(t, 17.1, 17.95, 'io'); if (ex > 0) { c.globalAlpha = ex; c.fillStyle = p.paper; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    },
  });
})();
