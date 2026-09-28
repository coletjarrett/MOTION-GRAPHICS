const fs = require('fs');

let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');
const labelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
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
const labelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.save();
          c.globalAlpha = K.clamp((t - (nodeStart + 0.4)) / 0.8);
          c.font = K.font(24, 'Avenir Next Condensed', 600);
          c.fillStyle = p.ink;
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText(labels[i], pt[0] + 25, pt[1] + 2);
          c.restore();
        }`;
bumper = bumper.replace(labelFind, labelReplace);
fs.writeFileSync('templates/topo/bumper.js', bumper);

let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');
const chapLineFind = `    c.beginPath();
    c.moveTo(0, 500); c.lineTo(1920, 500);
    c.strokeStyle = '#d96c42';
    c.lineWidth = 10;
    c.stroke();`;
const chapLineReplace = `    c.save();
    c.strokeStyle = p.accent;
    c.lineWidth = 2.5;
    c.beginPath();
    K.draw(c, p._accentPts, K.E(t, 1.0, 5.5, 'io'));
    c.restore();`;
chapter = chapter.replace(chapLineFind, chapLineReplace);
fs.writeFileSync('templates/topo/chapter.js', chapter);
