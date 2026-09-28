const fs = require('fs');

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');

chapter = chapter.replace(/    c\.lineWidth = 4\.0; \/\/ make it extremely thick to see\n    c\.beginPath\(\);\n    c\.moveTo\(0, 500\); c\.lineTo\(1920, 500\); c\.stroke\(\);\n    c\.restore\(\);/g, `    c.lineWidth = 2.5;
    c.beginPath();
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();`);

fs.writeFileSync('templates/topo/chapter.js', chapter);
