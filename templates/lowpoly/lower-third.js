// LOW POLY — lower third.
K.template({
  id: 'lowpoly-lower-third',
  title: 'Lower third',
  style: 'Low Poly',
  type: 'Lower third',
  dur: 7,
  alpha: true,
  fonts: ['600 60px "Avenir Next"', '400 34px "Avenir Next"'],
  params: {
    name: 'Ana Silva',
    role: 'Biologist, Brazil',
    lightDir: [0.5, -0.8, 0.6],
    panelColor: '#2b4438',
    accent: '#d4b89e'
  },
  setup(c, p) {
    const R = K.rand(999);
    
    c.font = K.font(60, 'Avenir Next', 600);
    let wN = c.measureText(p.name).width;
    c.font = K.font(34, 'Avenir Next', 400);
    let wR = c.measureText(p.role).width;
    let wMax = Math.max(wN, wR) + 120;
    
    this.wMax = wMax;
    
    let h = 160;
    
    let nx = Math.ceil(wMax / 60) + 1;
    let ny = 4; 
    
    this.pts = [];
    for(let y=0; y<ny; y++) {
      let row = [];
      for(let x=0; x<nx; x++) {
        let px = x * 60;
        let py = y * (h / (ny-1));
        if (x > 0 && x < nx-1) px += (R()-0.5) * 30;
        if (y > 0 && y < ny-1) py += (R()-0.5) * 20;
        
        let dx = Math.abs(x - nx/2) / (nx/2);
        let dy = Math.abs(y - ny/2) / (ny/2);
        let d = Math.max(dx, dy); 
        
        let pz = (1 - d) * 30 + R() * 10;
        if (y===0 || y===ny-1 || x===0 || x===nx-1) pz = 0; 
        
        row.push([px, py, pz]);
      }
      this.pts.push(row);
    }
    
    this.tris = [];
    for(let y=0; y<ny-1; y++) {
      for(let x=0; x<nx-1; x++) {
        let p00 = this.pts[y][x], p10 = this.pts[y][x+1], p01 = this.pts[y+1][x], p11 = this.pts[y+1][x+1];
        if ((x+y)%2 === 0) {
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
    
    let xOffset = 150;
    let yOffset = 820;
    
    let drawList = [];
    
    for (let tri of this.tris) {
      let [A, B, C] = tri;
      
      let ux = B[0]-A[0], uy = B[1]-A[1], uz = B[2]-A[2];
      let vx = C[0]-A[0], vy = C[1]-A[1], vz = C[2]-A[2];
      let nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
      let len = Math.hypot(nx, ny, nz) || 1;
      let norm = [nx/len, ny/len, nz/len];
      
      let dot = norm[0]*this.L[0] + norm[1]*this.L[1] + norm[2]*this.L[2];
      let light = K.clamp(0.4 + 0.6 * dot);
      
      let colA = K.rgb('#111a15'), colB = K.rgb(p.panelColor);
      let baseRgb = colA.map((v, i) => K.mix(v, colB[i], light));
      let col = `rgb(${Math.round(baseRgb[0])},${Math.round(baseRgb[1])},${Math.round(baseRgb[2])})`;
      
      let cx = (A[0]+B[0]+C[0])/3;
      let cy = (A[1]+B[1]+C[1])/3;
      let cz = (A[2]+B[2]+C[2])/3;
      
      let delay = K.clamp(cx / this.wMax);
      let kIn = K.E(t, delay * 0.8 + 0.2, delay * 0.8 + 1.2, 'outBack');
      let kOut = 1 - K.E(t, 5.8 + delay * 0.4, 6.4 + delay * 0.4, 'in5');
      let kScale = kIn * kOut;
      
      if (kScale <= 0.001) continue;
      
      let rot = (1 - kIn) * Math.PI * 2;
      
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
      
      let pA = transform(A);
      let pB = transform(B);
      let pC = transform(C);
      
      drawList.push({ pA, pB, pC, col, z: cz });
    }
    
    drawList.sort((a, b) => a.z - b.z);
    
    c.save();
    c.translate(xOffset, yOffset);
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
      
      c.strokeStyle = 'rgba(255,255,255,0.1)';
      c.stroke();
    }
    c.restore();
    
    let fN = K.font(60, 'Avenir Next', 600);
    let fR = K.font(34, 'Avenir Next', 400);
    
    let textOut = 1 - K.E(t, 6.0, 6.6, 'in');
    
    if (textOut > 0) {
      c.globalAlpha = textOut;
      c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 10; c.shadowOffsetY = 2;
      
      c.save();
      c.beginPath(); c.rect(xOffset, yOffset - 40, this.wMax + 100, 110); c.clip();
      K.reveal(c, p.name, xOffset + 50, yOffset + 65, { font: fN, color: '#ffffff', track: 1, k: K.P(t, 0.8, 1.6), mode: 'rise', dist: 40, stagger: 0.3 });
      c.restore();
      
      c.save();
      c.beginPath(); c.rect(xOffset, yOffset + 75, this.wMax + 100, 100); c.clip();
      K.reveal(c, p.role, xOffset + 52, yOffset + 115, { font: fR, color: p.accent, track: 2, k: K.P(t, 1.2, 2.0), mode: 'track', stagger: 0.2 });
      c.restore();
    }
  }
});
