// On-device narration with Kokoro-82M: narration.txt -> narration.wav + captions.json + words.json
//   node narrate.mjs [narration.txt] [--voice am_michael] [--speed .92] [--lead 3.0] [--gap .35] [--para 1.1]
// narration.txt: one caption per line (split at punctuation, one to two screen lines each).
//   A blank line is a paragraph pause (--para s). A line "[pause 2.5]" holds silence.
//   Scripture pasted from a study Bible is cleaned: footnote marks (+ *), pronunciation dots and
//   stress marks (Neb·u·chad·nezʹzar -> Nebuchadnezzar) and verse numbers at line starts are removed.
// pron.json (optional): {"Word": "how to say it"} respellings applied to the spoken text only.
// Word times in words.json are spread across each line by character length: good enough for
// ducking sfx and for cueing picture on a phrase, not lip-sync.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const src = args[0] && !args[0].startsWith('--') ? args[0] : 'narration.txt';
const VOICE = opt('voice', 'am_michael'), SPEED = +opt('speed', .92), LEAD = +opt('lead', 3), GAP = +opt('gap', .35), PARA = +opt('para', 1.1);

const req = createRequire(path.join(process.cwd(), 'x.js'));
const { KokoroTTS } = (() => {
  for (const p of [process.env.KOKORO_NODE_MODULES, path.join(process.cwd(), 'node_modules'), path.join(process.env.HOME || '', 'node_modules')].filter(Boolean)) {
    try { return req(path.join(p, 'kokoro-js')); } catch (e) {}
  }
  try { return req('kokoro-js'); } catch (e) { throw Error('kokoro-js not found: npm i kokoro-js, or set KOKORO_NODE_MODULES'); }
})();

const clean = s => s.replace(/[+*]/g, '').replace(/[·ʹ]/g, '').replace(/^\s*\d+\s+/, '').replace(/\s+/g, ' ').trim();
const pron = fs.existsSync('pron.json') ? JSON.parse(fs.readFileSync('pron.json', 'utf8')) : {};
const speakable = s => Object.entries(pron).reduce((a, [w, say]) => a.replace(new RegExp(`\\b${w}\\b`, 'g'), say), s).replace(/[“”"]/g, '').replace(/—/g, ', ');

const items = [];
for (const raw of fs.readFileSync(src, 'utf8').split('\n')) {
  const m = raw.match(/^\s*\[pause\s+([\d.]+)\]\s*$/);
  if (m) items.push({ pause: +m[1] }); else if (!raw.trim()) items.push({ pause: PARA }); else items.push({ text: clean(raw) });
}

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
const SR = 24000, chunks = [new Float32Array(Math.round(LEAD * SR))], captions = [], words = [];
let t = LEAD, prevText = false;
for (const it of items) {
  if (it.pause != null) { chunks.push(new Float32Array(Math.round(it.pause * SR))); t += it.pause; prevText = false; continue; }
  if (prevText) { chunks.push(new Float32Array(Math.round(GAP * SR))); t += GAP; }
  const a = (await tts.generate(speakable(it.text), { voice: VOICE, speed: SPEED })).audio;
  // trim the model's leading/trailing near-silence so gaps are ours
  let i0 = 0, i1 = a.length; while (i0 < i1 && Math.abs(a[i0]) < .004) i0++; while (i1 > i0 && Math.abs(a[i1 - 1]) < .004) i1--;
  i0 = Math.max(0, i0 - 480); i1 = Math.min(a.length, i1 + 1200);
  const seg = a.slice(i0, i1), dur = seg.length / SR;
  chunks.push(seg); captions.push({ a: +t.toFixed(3), b: +(t + dur).toFixed(3), text: it.text });
  const ws = it.text.split(' '), total = ws.reduce((s, w) => s + w.length + 1, 0); let c = 0;
  for (const w of ws) { const s = t + dur * c / total; c += w.length + 1; words.push([w, +s.toFixed(3), +(t + dur * c / total).toFixed(3)]); }
  console.log(`${t.toFixed(2)}-${(t + dur).toFixed(2)}  ${it.text}`);
  t += dur; prevText = true;
}
chunks.push(new Float32Array(Math.round(2 * SR)));

const n = chunks.reduce((s, c) => s + c.length, 0), pcm = Buffer.alloc(44 + n * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + n * 2, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(n * 2, 40);
let o = 44; for (const c of chunks) for (const v of c) { pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), o); o += 2; }
fs.writeFileSync('narration.wav', pcm);
// hold each caption across short gaps so it does not blink off between lines
for (let i = 0; i < captions.length; i++) { const nx = captions[i + 1]; captions[i].b = +(nx && nx.a - captions[i].b < .8 ? nx.a - .02 : captions[i].b + .35).toFixed(3); }
fs.writeFileSync('captions.json', JSON.stringify(captions, null, 1));
fs.writeFileSync('words.json', JSON.stringify(words));
console.log(`narration.wav ${(n / SR).toFixed(2)} s, ${captions.length} lines, voice ${VOICE} @ ${SPEED}`);
