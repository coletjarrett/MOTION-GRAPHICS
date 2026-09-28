const fs = require('fs');
let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');

const labelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
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
const labelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          const lk = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.reveal(c, labels[i], pt[0] + 25, pt[1] + 6, { font: K.font(24, 'Avenir Next Condensed', 600), color: p.ink, align: 'left', k: lk, mode: 'fade' });
        }`;
bumper = bumper.replace(labelFind, labelReplace);
fs.writeFileSync('templates/topo/bumper.js', bumper);

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');
const chapLineFind = `    c.moveTo(0, 500); c.lineTo(1920, 500); c.stroke(); // simple line`;
const chapLineReplace = `    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));`;
chapter = chapter.replace(chapLineFind, chapLineReplace);
fs.writeFileSync('templates/topo/chapter.js', chapter);

