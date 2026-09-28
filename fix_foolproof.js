const fs = require('fs');

let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');

const labelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          const lk = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.reveal(c, labels[i], pt[0] + 25, pt[1] + 6, { font: K.font(24, 'Avenir Next Condensed', 600), color: p.ink, align: 'left', k: lk, mode: 'fade' });
        }`;
const labelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.save();
          c.globalAlpha = 1;
          c.font = '24px Arial';
          c.fillStyle = '#000000';
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText(labels[i], pt[0] + 25, pt[1]);
          c.restore();
        }`;
bumper = bumper.replace(labelFind, labelReplace);
fs.writeFileSync('templates/topo/bumper.js', bumper);

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');
const chapLineFind = `    c.moveTo(0, 500); c.lineTo(1920, 500); c.stroke(); // simple line`;
const chapLineReplace = `    c.beginPath();
    c.moveTo(0, 500); c.lineTo(1920, 500);
    c.strokeStyle = '#d96c42';
    c.lineWidth = 10;
    c.stroke();`;
chapter = chapter.replace(chapLineFind, chapLineReplace);
fs.writeFileSync('templates/topo/chapter.js', chapter);
