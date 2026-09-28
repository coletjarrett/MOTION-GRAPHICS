const fs = require('fs');

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');

chapter = chapter.replace(/    c\.beginPath\(\);\n    c\.moveTo\(0, 500\); c\.lineTo\(1920, 500\);\n    c\.strokeStyle = '#d96c42';\n    c\.lineWidth = 10;\n    c\.stroke\(\);/g, `    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 2.5;
    c.beginPath();
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();`);

fs.writeFileSync('templates/topo/chapter.js', chapter);
