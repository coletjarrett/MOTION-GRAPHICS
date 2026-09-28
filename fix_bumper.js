const fs = require('fs');
let file = fs.readFileSync('templates/topo/bumper.js', 'utf8');

// 1. Contours clearly visible
file = file.replace(/c\.strokeStyle = pt\.major \? K\.rgba\(p\.ink, 0\.25\) : K\.rgba\(p\.ink, 0\.1\);/, 
  "c.strokeStyle = pt.major ? K.rgba(p.ink, 0.45) : K.rgba(p.ink, 0.22);");

// 2. Add subtle elevation tint bands in setup()
const setupFind = `    for (let i = -0.6; i <= 0.6; i += 0.04) levels.push(i);\n    p._paths = makeContours(W + 200, H + 200, 12, 42, levels);`;
const setupReplace = `    for (let i = -0.6; i <= 0.6; i += 0.04) levels.push(i);
    p._paths = makeContours(W + 200, H + 200, 12, 42, levels);
    
    // Precompute elevation tint bands
    p._bands = K.cached('topo-bands', W + 200, H + 200, (ctx, w, h) => {
      const cell = 8;
      const cols = Math.ceil(w/cell) + 1, rows = Math.ceil(h/cell) + 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = K.fbm(x * cell * 0.0012, y * cell * 0.0012, 42, 4);
          let alpha = 0;
          if (v > 0.3) alpha = 0.04;
          else if (v > 0.1) alpha = 0.02;
          else if (v > -0.1) alpha = 0.01;
          
          if (alpha > 0) {
            ctx.fillStyle = K.rgba(p.ink, alpha);
            ctx.fillRect(x*cell, y*cell, cell, cell);
          }
        }
      }
    });`;
file = file.replace(setupFind, setupReplace);

// 2b. Draw tint bands
const drawFind = `    // Subtle elevation shading via background gradient
    const g = c.createRadialGradient(cx, cy, 200, cx, cy, W * 0.8);
    g.addColorStop(0, K.rgba(p.ink, 0.03));
    g.addColorStop(1, K.rgba(p.ink, 0.0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);`;
const drawReplace = `    // Subtle elevation shading via background gradient
    const g = c.createRadialGradient(cx, cy, 200, cx, cy, W * 0.8);
    g.addColorStop(0, K.rgba(p.ink, 0.03));
    g.addColorStop(1, K.rgba(p.ink, 0.0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);`; // keep this

const drawClipFind = `    // Draw on wipe
    const clipR = W * 1.5 * K.E(t, 0, 3, 'io5');
    c.beginPath(); c.arc(cx, cy, clipR, 0, K.TAU); c.clip();`;
const drawClipReplace = `    // Draw on wipe
    const clipR = W * 1.5 * K.E(t, 0, 3, 'io5');
    c.beginPath(); c.arc(cx, cy, clipR, 0, K.TAU); c.clip();
    
    if (p._bands) c.drawImage(p._bands, 0, 0);`;
file = file.replace(drawClipFind, drawClipReplace);

// 3. Bolder route line
file = file.replace(/c\.lineWidth = 3;/g, "c.lineWidth = 5;");
file = file.replace(/c\.setLineDash\(\[8, 8\]\);/, "c.setLineDash([12, 12]);");

// 3b. Waypoint markers and labels
const nodeFind = `        c.fillStyle = p.bg;
        c.beginPath(); c.arc(pt[0], pt[1], 8 * nk, 0, K.TAU); c.fill();
        c.lineWidth = 2; c.strokeStyle = p.accent; c.stroke();
        c.fillStyle = p.accent;
        c.beginPath(); c.arc(pt[0], pt[1], 3 * nk, 0, K.TAU); c.fill();`;
const nodeReplace = `        c.fillStyle = p.bg;
        c.beginPath(); c.arc(pt[0], pt[1], 10 * nk, 0, K.TAU); c.fill();
        c.lineWidth = 3; c.strokeStyle = p.accent; c.stroke();
        c.fillStyle = p.accent;
        c.beginPath(); c.arc(pt[0], pt[1], 4 * nk, 0, K.TAU); c.fill();
        
        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.setText(c, K.font(22, 'Avenir Next Condensed', 600), p.ink, 2, 'left', 'middle');
          c.fillText(labels[i], pt[0] + 18, pt[1]);
          c.globalAlpha = 1;
        }`;
file = file.replace(nodeFind, nodeReplace);

fs.writeFileSync('templates/topo/bumper.js', file);
