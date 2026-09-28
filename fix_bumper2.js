const fs = require('fs');
let file = fs.readFileSync('templates/topo/bumper.js', 'utf8');

// Increase band opacity
file = file.replace(/if \(v > 0\.3\) alpha = 0\.04;/g, "if (v > 0.3) alpha = 0.12;");
file = file.replace(/else if \(v > 0\.1\) alpha = 0\.02;/g, "else if (v > 0.1) alpha = 0.08;");
file = file.replace(/else if \(v > -0\.1\) alpha = 0\.01;/g, "else if (v > -0.1) alpha = 0.04;");

// Labels styling
const labelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.setText(c, K.font(22, 'Avenir Next Condensed', 600), p.ink, 2, 'left', 'middle');
          c.fillText(labels[i], pt[0] + 18, pt[1]);
          c.globalAlpha = 1;
        }`;
const labelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.setText(c, K.font(28, 'Avenir Next Condensed', 600), p.ink, 2, 'left', 'middle');
          c.fillText(labels[i], pt[0] + 20, pt[1] + 2);
          c.globalAlpha = 1;
        }`;
file = file.replace(labelFind, labelReplace);

fs.writeFileSync('templates/topo/bumper.js', file);
