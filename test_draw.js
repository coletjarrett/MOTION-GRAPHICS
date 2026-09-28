const fs = require('fs');

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');
chapter = chapter.replace(`K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));`, `c.moveTo(0, 500); c.lineTo(1920, 500); c.stroke();`);
fs.writeFileSync('templates/topo/chapter.js', chapter);

let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');
bumper = bumper.replace(/K\.font\(24, 'Avenir Next Condensed', 600\)/, `'24px Arial'`);
fs.writeFileSync('templates/topo/bumper.js', bumper);
