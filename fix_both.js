const fs = require('fs');

// BUMPER
let bumper = fs.readFileSync('templates/topo/bumper.js', 'utf8');

// Fix label rendering
const labelFind = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.E(t, nodeStart + 0.4, nodeStart + 1.2, 'out');
          K.setText(c, K.font(28, 'Avenir Next Condensed', 600), p.ink, 2, 'left', 'middle');
          c.fillText(labels[i], pt[0] + 20, pt[1] + 2);
          c.globalAlpha = 1;
        }`;
const labelReplace = `        const labels = ['CAMP 1', 'RIVER CROSSING', 'SUMMIT'];
        if (labels[i]) {
          c.globalAlpha = K.clamp((t - (nodeStart + 0.4)) / 0.8);
          c.font = '600 24px "Avenir Next Condensed"';
          c.fillStyle = p.ink;
          c.textAlign = 'left';
          c.textBaseline = 'middle';
          c.fillText(labels[i], pt[0] + 24, pt[1]);
          c.globalAlpha = 1;
        }`;
bumper = bumper.replace(labelFind, labelReplace);

// Increase band visibility slightly
bumper = bumper.replace(/ctx\.fillStyle = K\.rgba\(p\.ink, 0\.04\);/, "ctx.fillStyle = K.rgba(p.ink, 0.06);");
fs.writeFileSync('templates/topo/bumper.js', bumper);


// CHAPTER
let chapter = fs.readFileSync('templates/topo/chapter.js', 'utf8');

// Increase contour visibility
chapter = chapter.replace(/c\.strokeStyle = pt\.major \? K\.rgba\(p\.ink, 0\.35\) : K\.rgba\(p\.ink, 0\.15\);/, 
  "c.strokeStyle = pt.major ? K.rgba(p.ink, 0.55) : K.rgba(p.ink, 0.25);");

// Change accent contour index to 22 (since K.fbm is 0..1, levels below 0 are empty)
chapter = chapter.replace(/i === Math\.floor\(p\._paths\.length \/ 2\)/, "i === 22");

// Wait, the drawn-on accent needs to be visible!
// Let's make sure the path length isn't causing it to draw weirdly.
// Canvas setLineDash works perfectly for this.

fs.writeFileSync('templates/topo/chapter.js', chapter);
