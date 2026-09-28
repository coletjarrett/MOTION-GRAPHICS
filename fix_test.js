const fs = require('fs');

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');

const chapterFind = `    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 2.5;
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();`;
const chapterReplace = `    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 4.0; // make it extremely thick to see
    c.beginPath();
    c.moveTo(0, 500); c.lineTo(1920, 500); c.stroke(); // simple line
    c.restore();`;
chapter = chapter.replace(chapterFind, chapterReplace);

fs.writeFileSync('templates/topo/chapter.js', chapter);
