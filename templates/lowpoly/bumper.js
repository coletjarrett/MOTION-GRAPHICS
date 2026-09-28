// LOW POLY — program bumper.
K.template({
  id: 'lowpoly-bumper',
  title: 'Program bumper',
  style: 'Low Poly',
  type: 'Bumper / open',
  dur: 8,
  alpha: false,
  fonts: ['600 88px "Avenir Next"', '500 32px "Avenir Next"'],
  params: {
    title: 'Lessons From Creation',
    sub: 'Part 7 · Forests',
    bgTop: '#f4e3d3',
    bgBottom: '#a9b8c2',
    lightDir: [0.3, -0.8, 0.6],
    textInk: '#1a2b21'
  },
  setup(c, p) {
    const R = K.rand(1234);
    const size = 120;
    const nx = 40, ny = 30;
    const pts = [];
    
    for (let y = 0; y < ny; y++) {
      const row = [];
      for (let x = 0; x < nx; x++) {
        let jx = (x - nx/2) * size + (R() - 0.5) * size * 0.8;
        let jy = (y - ny/2) * size + (R() - 0.5) * size * 0.8;
        let dist = Math.hypot(x - nx/2, y - ny/2);
        let z = K.fbm(x * 0.15, y * 0.15, 1, 3) * 350;
        row.push([jx, jy, z]);
      }
      pts.push(row);
    }
    
    const tris = [];
    for (let y = 0; y < ny - 1; y++) {
      for (let x = 0; x < nx - 1; x++) {
        let p00 = pts[y][x], p10 = pts[y][x+1], p01 = pts[y+1][x], p11 = pts[y+1][x+1];
        if ((x + y) % 2 === 0) {
          tris.push([p00, p10, p01]);
          tris.push([p10, p11, p01]);
        } else {
          tris.push([p00, p10, p11]);
          tris.push([p00, p11, p01]);
        }
      }
    }
    
    for(let i=0; i<40; i++) {
      let tx = Math.floor(R() * (nx-4)) + 2;
      let ty = Math.floor(R() * (ny-4)) + 2;
      let p0 = pts[ty][tx];
      let h = 100 + R() * 150;
      let w = 30 + R() * 30;
      let basez = p0[2];
      let ptTop = [p0[0], p0[1], basez + h];
      let pt1 = [p0[0] + w, p0[1] + w, basez];
      let pt2 = [p0[0] - w, p0[1] + w, basez];
      let pt3 = [p0[0] - w, p0[1] - w, basez];
      let pt4 = [p0[0] + w, p0[1] - w, basez];
      tris.push([pt1, pt2, ptTop, true]);
      tris.push([pt2, pt3, ptTop, true]);
      tris.push([pt3, pt4, ptTop, true]);
      tris.push([pt4, pt1, ptTop, true]);
    }
    
    this.facets = tris.map(t => {
      let [A, B, C, isTree] = t;
      let ux = B[0]-A[0], uy = B[1]-A[1], uz = B[2]-A[2];
      let vx = C[0]-A[0], vy = C[1]-A[1], vz = C[2]-A[2];
      let nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
      let len = Math.hypot(nx, ny, nz) || 1;
      let norm = [nx/len, ny/len, nz/len];
      
      let cx = (A[0]+B[0]+C[0])/3;
      let cy = (A[1]+B[1]+C[1])/3;
      let cz = (A[2]+B[2]+C[2])/3;
      
      let baseRgb;
      if (isTree) {
        let rr = R();
        let A = K.rgb('#1b3626'), B = K.rgb('#32543e');
        baseRgb = A.map((v, i) => K.mix(v, B[i], rr));
      } else {
        let k = K.clamp((cz + 150) / 400);
        let A = K.rgb('#2d4a3e'), B = K.rgb('#7b9e83');
        baseRgb = A.map((v, i) => K.mix(v, B[i], k));
      }
      
      return { A, B, C, norm, cx, cy, cz, baseRgb, isTree };
    });
    
    let [lx, ly, lz] = p.lightDir;
    let llen = Math.hypot(lx, ly, lz);
    this.L = [lx/llen, ly/llen, lz/llen];
  },
  draw(c, t, p) {
    const W = K.W, H = K.H;
    
    let bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, p.bgTop);
    bg.addColorStop(1, p.bgBottom);
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    
    let camRy = K.mix(0.15, -0.15, t / this.dur);
    let camRx = -0.45; 
    let camZ = 1200;
    let fov = 1600;
    
    function proj(pt) {
      let x = pt[0], y = pt[1], z = pt[2];
      let x1 = x * Math.cos(camRy) - z * Math.sin(camRy);
      let z1 = x * Math.sin(camRy) + z * Math.cos(camRy);
      let y2 = y * Math.cos(camRx) - z1 * Math.sin(camRx);
      let z2 = y * Math.sin(camRx) + z1 * Math.cos(camRx);
      
      z2 += camZ;
      y2 += 400; 
      
      let f = fov / (fov + z2);
      return [x1 * f + W/2, y2 * f + H/2, z2];
    }
    
    let drawList = [];
    let logOnce = true;
    
    for (let f of this.facets) {
      let dist = Math.hypot(f.cx, f.cy);
      let delay = K.clamp(dist / 2000); 
      let kIn = K.E(t, delay * 2.5, delay * 2.5 + 2.0, 'outBack');
      let kOut = 1 - K.E(t, 6.5 + delay*0.5, 7.5 + delay*0.5, 'in5');
      let kScale = kIn * kOut;
      
      if (kScale <= 0.001) continue;
      
      let rot = (1 - kIn) * Math.PI * 1.5; 
      
      let transform = (pt) => {
        let dx = pt[0] - f.cx;
        let dy = pt[1] - f.cy;
        let dz = pt[2] - f.cz;
        let dy2 = dy * Math.cos(rot) - dz * Math.sin(rot);
        let dz2 = dy * Math.sin(rot) + dz * Math.cos(rot);
        return [
          f.cx + dx * kScale,
          f.cy + dy2 * kScale,
          f.cz + dz2 * kScale
        ];
      };
      
      let pA = proj(transform(f.A));
      let pB = proj(transform(f.B));
      let pC = proj(transform(f.C));
      
      let dot = f.norm[0]*this.L[0] + f.norm[1]*this.L[1] + f.norm[2]*this.L[2];
      let light = K.clamp(0.25 + 0.75 * dot); 
      let col = `rgb(${Math.round(f.baseRgb[0]*light)},${Math.round(f.baseRgb[1]*light)},${Math.round(f.baseRgb[2]*light)})`;
      
      let cProj = proj([f.cx, f.cy, f.cz]);
      // let wind = (pB[0]-pA[0])*(pC[1]-pA[1]) - (pB[1]-pA[1])*(pC[0]-pA[0]);
      // if (wind > 0) continue; 
      
      drawList.push({ pA, pB, pC, col, z: cProj[2] });
    }
    
    drawList.sort((a, b) => b.z - a.z);
    
    c.lineJoin = 'round';
    for (let d of drawList) {
      c.fillStyle = d.col;
      c.strokeStyle = d.col; 
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(d.pA[0], d.pA[1]);
      c.lineTo(d.pB[0], d.pB[1]);
      c.lineTo(d.pC[0], d.pC[1]);
      c.closePath();
      c.fill();
      c.stroke();
      
      c.strokeStyle = 'rgba(255,255,255,0.06)';
      c.stroke();
    }
    
    const cx = W / 2, cy = H / 2 - 120; 
    let textOut = 1 - K.E(t, 7.2, 7.8, 'in');
    
    if (textOut > 0) {
      c.save();
      c.beginPath(); c.rect(0, 0, W, cy + 20); c.clip();
      K.reveal(c, p.title, cx, cy, { font: K.font(88, 'Avenir Next', 600), color: p.textInk, align: 'center', k: K.P(t, 1.5, 3.0), mode: 'rise', dist: 80, stagger: 0.4 });
      c.restore();
      
      c.save();
      c.beginPath(); c.rect(0, cy + 30, W, H); c.clip();
      K.reveal(c, p.sub.toUpperCase(), cx, cy + 80, { font: K.font(32, 'Avenir Next', 500), color: p.textInk, track: 6, align: 'center', k: K.P(t, 2.0, 3.5), mode: 'track', stagger: 0.2 });
      c.restore();
    }
    
    K.grain(c, t, 0.04);
  }
});
