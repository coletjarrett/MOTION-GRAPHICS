const fs = require('fs');
let file = fs.readFileSync('templates/topo/chapter.js', 'utf8');

// 1. Raise contour visibility
file = file.replace(/c\.strokeStyle = pt\.major \? K\.rgba\(p\.ink, 0\.18\) : K\.rgba\(p\.ink, 0\.07\);/,
  "c.strokeStyle = pt.major ? K.rgba(p.ink, 0.35) : K.rgba(p.ink, 0.15);");

// 2. Add drawn-on accent contour
const drawContourFind = `    p._paths.forEach(pt => {
      c.strokeStyle = pt.major ? K.rgba(p.ink, 0.18) : K.rgba(p.ink, 0.07);
      c.lineWidth = pt.major ? 1.5 : 1;
      c.stroke(pt.path);
    });`;
const drawContourReplace = `    p._paths.forEach((pt, i) => {
      c.strokeStyle = pt.major ? K.rgba(p.ink, 0.35) : K.rgba(p.ink, 0.15);
      c.lineWidth = pt.major ? 1.5 : 1;
      c.stroke(pt.path);
      
      // Add drawn-on accent contour
      if (i === Math.floor(p._paths.length / 2)) {
        c.save();
        c.strokeStyle = p.accent;
        c.lineWidth = 2.5;
        const dashLen = 12000;
        c.setLineDash([dashLen, dashLen]);
        c.lineDashOffset = dashLen * (1 - K.E(t, 0.5, 5.0, 'io'));
        c.stroke(pt.path);
        c.restore();
      }
    });`;
file = file.replace(drawContourFind, drawContourReplace);

fs.writeFileSync('templates/topo/chapter.js', file);
