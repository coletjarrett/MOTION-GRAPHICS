const fs = require('fs');

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');

// 1. Generate an accent route in setup
const setupFind = `    p._paths = makeContours(W + 200, H + 200, 12, 10, levels);`;
const setupReplace = `    p._paths = makeContours(W + 200, H + 200, 12, 10, levels);
    
    // Generate accent path
    const R = K.rand(12);
    const pts = [];
    let rx = -100, ry = H * 0.3;
    for (let i=0; i<8; i++) {
      pts.push([rx, ry]);
      rx += W * 0.2 + R() * 100;
      ry += (R() - 0.5) * 300;
    }
    p._accentPts = K.catmull(pts, 20);`;
chapter = chapter.replace(setupFind, setupReplace);

// 2. Remove the i===22 hack and draw the accent path
const drawFind = `      // Add drawn-on accent contour
      if (i === 22) {
        c.save();
        c.strokeStyle = p.accent;
        c.lineWidth = 2.5;
        const dashLen = 12000;
        c.setLineDash([dashLen, dashLen]);
        c.lineDashOffset = dashLen * (1 - K.E(t, 0.5, 5.0, 'io'));
        c.stroke(pt.path);
        c.restore();
      }`;
const drawReplace = ``;
chapter = chapter.replace(drawFind, drawReplace);

const restoreFind = `    c.restore();

    // Typography`;
const restoreReplace = `    c.restore();
    
    // Drawn-on accent contour
    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 2.5;
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();

    // Typography`;
chapter = chapter.replace(restoreFind, restoreReplace);

fs.writeFileSync('templates/topo/chapter.js', chapter);


// BUMPER
let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');

// Add 24px font to fonts array
bumper = bumper.replace(/'600 90px "Avenir Next Condensed"', 'italic 400 40px "Iowan Old Style"'/, 
  `'600 90px "Avenir Next Condensed"', 'italic 400 40px "Iowan Old Style"', '600 24px "Avenir Next Condensed"'`);

// Fix labels to use fillText correctly, without K.setText (which might be bugged)
const bumperLabelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.clamp((t - (nodeStart + 0.4)) / 0.8);
          c.font = '600 24px "Avenir Next Condensed"';
          c.fillStyle = p.ink;
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText(labels[i], pt[0] + 24, pt[1]);
          c.globalAlpha = 1;
        }`;
const bumperLabelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.save();
          c.globalAlpha = K.clamp((t - (nodeStart + 0.4)) / 0.8);
          c.font = '600 24px "Avenir Next Condensed"';
          c.fillStyle = p.ink;
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText(labels[i], pt[0] + 25, pt[1] + 2);
          c.restore();
        }`;
bumper = bumper.replace(bumperLabelFind, bumperLabelReplace);

fs.writeFileSync('templates/topo/bumper.js', bumper);
