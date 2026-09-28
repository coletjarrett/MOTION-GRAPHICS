# Code-Driven Motion Graphics

A deterministic motion-graphics toolkit and a library of 90+ broadcast graphics (lower thirds, bumpers,
timelines, scripture cards, maps, data graphics) in 23 visual styles. Every frame is a pure function of
time and editable text, rendered by headless Chrome and encoded with ffmpeg.

- **Browse:** open `Library.html` (or the GitHub Pages site for this repo)
- **Explainers:** `explainers/01 How it works.mp4`, `02 The cost picture.mp4`, `03 Style reel.mp4`
- **Proposal:** `docs/Proposal - Code-Driven Motion Graphics.pdf`
- **Write a template:** `TEMPLATES.md` · runtime `engine/kit.js`
- **Render:** `python3 engine/build.py [filter]` (needs Node + puppeteer-core, Google Chrome, ffmpeg).
  ProRes 4444 `.mov` masters with alpha are produced locally and are not stored in this repo.
- **Music:** `engine/music.py` synthesizes original, license-free scores; `engine/sound.py` applies them.

All names are fictional sample data. No organisation's branding is used.
