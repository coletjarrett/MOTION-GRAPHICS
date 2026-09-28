// LOW POLY — chapter title.
K.template({
  id: 'lowpoly-chapter',
  title: 'Chapter title',
  style: 'Low Poly',
  type: 'Title card',
  dur: 6,
  alpha: false,
  fonts: ['600 96px "Avenir Next"', '400 48px "Avenir Next"'],
  params: {
    chapter: 'Chapter 3',
    title: 'The Life in the Forest',
    bgTop: '#f4e3d3',
    bgBottom: '#a9b8c2',
    lightDir: [0.3, -0.8, 0.6],
    textInk: '#1a2b21'
  },
  setup(c, p) {
    const R = K.rand(5678);
    const size = 180;
    const nx = 18, ny = 14;
    this.pts = [];
    
    for (let y = 0; y < ny; y++) {
      const row = [];
      for (let x = 0; x < nx; x++) {
        let jx = (x - nx/2) * size + (R() - 0.5) * size * 0.6;
        let jy = (y - ny/2) * size + (R() - 0.5) * size * 0.6;
        let phase = R() * K.TAU;
        row.push({ x: jx, y: jy, phase, cx: x, cy: y });
      }
      this.pts.push(row);
    }
    
    this.tris = [];
    for (let y = 0; y < ny - 1; y++) {
      for (let x = 0; x < nx - 1; x++) {
        let p00 = this.pts[y][x], p10 = this.pts[y][x+1], p01 = this.pts[y+1][x], p11 = this.pts[y+1][x+1];
        if ((x + y) % 2 === 0) {
          this.tris.push([p00, p10, p01]);
          this.tris.push([p10, p11, p01]);
        } else {
          this.tris.push([p00, p10, p11]);
          this.tris.push([p00, p11, p01]);
        }
      }
    }
    
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
    
    let p3d = new Map();
    for(let r of this.pts) {
      for(let pt of r) {
        let wave = Math.sin(t * 1.5 + pt.phase) * 30 + K.fbm(pt.cx * 0.3, pt.cy * 0.3, 1, 2) * 150;
        p3d.set(pt, [pt.x, pt.y, wave]);
      }
    }
    
    let camRy = K.mix(0.05, -0.05, t / this.dur);
    let camRx = -0.15; 
    let camZ = 1200;
    let fov = 2000;
    
    function proj(pt) {
      let x = pt[0], y = pt[1], z = pt[2];
      let x1 = x * Math.cos(camRy) - z * Math.sin(camRy);
      let z1 = x * Math.sin(camRy) + z * Math.cos(camRy);
      let y2 = y * Math.cos(camRx) - z1 * Math.sin(camRx);
      let z2 = y * Math.sin(camRx) + z1 * Math.cos(camRx);
      
      z2 += camZ;
      let f = fov / (fov + z2);
      return [x1 * f + W/2, y2 * f + H/2, z2];
    }
    
    let drawList = [];
    
    for (let tri of this.tris) {
      let A = p3d.get(tri[0]);
      let B = p3d.get(tri[1]);
      let C = p3d.get(tri[2]);
      
      let ux = B[0]-A[0], uy = B[1]-A[1], uz = B[2]-A[2];
      let vx = C[0]-A[0], vy = C[1]-A[1], vz = C[2]-A[2];
      let nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
      let len = Math.hypot(nx, ny, nz) || 1;
      let norm = [nx/len, ny/len, nz/len];
      
      let dot = norm[0]*this.L[0] + norm[1]*this.L[1] + norm[2]*this.L[2];
      let light = K.clamp(0.3 + 0.7 * dot);
      
      let cz = (A[2]+B[2]+C[2])/3;
      let kCol = K.clamp((cz + 100) / 250);
      let colA = K.rgb('#4f7564'), colB = K.rgb('#a1bfa8');
      let baseRgb = colA.map((v, i) => K.mix(v, colB[i], kCol));
      let col = `rgb(${Math.round(baseRgb[0]*light)},${Math.round(baseRgb[1]*light)},${Math.round(baseRgb[2]*light)})`;
      
      let cx = (A[0]+B[0]+C[0])/3;
      let cy = (A[1]+B[1]+C[1])/3;
      
      let dist = Math.hypot(cx, cy);
      let delay = K.clamp(dist / 1400); 
      let kIn = K.E(t, delay * 1.5, delay * 1.5 + 1.5, 'outBack');
      let kOut = 1 - K.E(t, 4.5 + delay*0.5, 5.5 + delay*0.5, 'in5');
      let kScale = kIn * kOut;
      
      if (kScale <= 0.001) continue;
      
      let rot = (1 - kIn) * Math.PI; 
      
      let transform = (pt) => {
        let dx = pt[0] - cx;
        let dy = pt[1] - cy;
        let dz = pt[2] - cz;
        let dy2 = dy * Math.cos(rot) - dz * Math.sin(rot);
        let dz2 = dy * Math.sin(rot) + dz * Math.cos(rot);
        return [
          cx + dx * kScale,
          cy + dy2 * kScale,
          cz + dz2 * kScale
        ];
      };
      
      let pA = proj(transform(A));
      let pB = proj(transform(B));
      let pC = proj(transform(C));
      
      let cProj = proj([cx, cy, cz]);
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
      
      c.strokeStyle = 'rgba(255,255,255,0.08)';
      c.stroke();
    }
    
    const ctxX = W / 2, ctxY = H / 2 - 20; 
    let textOut = 1 - K.E(t, 5.2, 5.8, 'in');
    
    if (textOut > 0) {
      c.save();
      c.beginPath(); c.rect(0, 0, W, ctxY + 20); c.clip();
      K.reveal(c, p.chapter, ctxX, ctxY, { font: K.font(48, 'Avenir Next', 400), color: p.textInk, align: 'center', track: 4, k: K.P(t, 1.0, 2.5), mode: 'track', stagger: 0.2 });
      c.restore();
      
      c.save();
      c.beginPath(); c.rect(0, ctxY + 30, W, H); c.clip();
      K.reveal(c, p.title, ctxX, ctxY + 110, { font: K.font(96, 'Avenir Next', 600), color: p.textInk, align: 'center', k: K.P(t, 1.3, 2.8), mode: 'rise', dist: 60, stagger: 0.3 });
      c.restore();
    }
    
    K.grain(c, t, 0.04);
  }
});
