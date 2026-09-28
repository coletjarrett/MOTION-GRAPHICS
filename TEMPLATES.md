# Writing a motion-kit template

A template is one JavaScript file that registers itself with `K.template({...})`. The page gives it a
canvas (1920×1080 unless `size` says otherwise) and calls `draw(c, t, p)` for every frame, with `t` in
seconds. **Every pixel must be a pure function of `t` and `p`.** No `Math.random()`, no `Date`, no state
carried between frames. That is what makes renders parallel, repeatable and re-editable. Use `K.rand(seed)`
(which returns a seeded generator) or `K.noise`/`K.fbm` for variation.

```js
K.template({
  id: 'paper-l3', title: 'Lower third', style: 'Paper Cut', type: 'Lower third',
  dur: 7,            // seconds
  alpha: true,       // true → transparent background, delivered as ProRes 4444 .mov (overlay for editors)
                     // false → you paint the whole frame yourself (bumpers, cards, timelines)
  fonts: ['600 60px "Avenir Next"'],   // every font spec you use, so it is loaded before frame 0
  params: { name: 'Daniel Mensah', role: 'Construction volunteer' },   // all editable text/colours live here
  setup(c, p) { /* optional one-time precompute (layouts, seeded shapes) */ },
  draw(c, t, p) { /* paint frame t */ },
});
```

Test it from the library root:

```
node engine/render.js stills templates/<pack>/<file>.js 0.5,1,2,4,6.5      # → qa/stills/<file>_<pack>_<t>.png
engine/sheet.sh qa/mysheet.jpg 3 plates/plate_warm.png qa/stills/<file>_<pack>_*.png   # contact sheet
```

## Runtime (`engine/kit.js`, global `K`)

| Area | Functions |
|---|---|
| Time | `K.P(t,a,b)` 0..1 clamp · `K.E(t,a,b,'out')` eased window · `K.env(t,a,b,c,d)` in-hold-out · `K.bell(t,a,b,c,d)` · `K.mix` `K.clamp` |
| Easings (`K.ease`) | `lin in out io in5 out5 io5 outExpo ioExpo outBack sine spring` |
| Random | `K.rand(seed)()` · `K.hash(x,y,s)` · `K.noise(x,y,s)` · `K.fbm(x,y,s,oct)` |
| Colour | `K.rgba('#hex', a)` · `K.lerpc(h1,h2,k,a)` · `K.rgb('#hex')` |
| Shapes | `K.rr(c,x,y,w,h,r)` round-rect path · `K.line(c,pts)` · `K.draw(c,pts,k,k0)` stroke a polyline drawn on to k · `K.bez` `K.catmull` `K.circle` `K.wobble(pts,amp,seed)` hand-drawn jitter · `K.len` `K.at` `K.sub` |
| Text | `K.font(size,family,weight,style)` · `K.setText(c,font,color,track,align)` · `K.width(c,s,font,track)` · `K.wrap(c,s,font,maxW)` · `K.reveal(c,s,x,y,{font,color,track,align,k,mode,stagger,dist,by,shadow})` modes `rise fade blur type wipe scale track`, `by:'word'` · `K.para(c,lines,x,y,lh,opts,k)` |
| Textures | `K.paper(w,h,seed,base)` cached paper canvas · `K.grain(c,t,amt)` · `K.vignette(c,amt)` · `K.wash(c,x,y,r,col,k,seed,{alpha,sx,sy})` watercolour bloom · `K.cached(key,w,h,fn)` |
| Canvas | `K.W`, `K.H` canvas size |

Canvas 2D features that work well here: `c.filter = 'blur(8px)'`, `c.letterSpacing`,
`globalCompositeOperation` (`multiply`, `screen`, `soft-light`, `destination-in`), gradients, `shadowBlur`,
clipping and `Path2D`.

## Fonts available (macOS system and bundled)

Sans: `Avenir Next`, `Avenir Next Condensed`, `Helvetica Neue`, `Futura`, `Gill Sans`, `Optima`, `DIN Alternate`, `DIN Condensed`, `Inter` (bundled).
Serif: `Baskerville`, `Didot`, `Bodoni 72`, `Big Caslon`, `Hoefler Text`, `Iowan Old Style`, `Charter`, `Georgia`, `Palatino`, `Cochin`, `Athelas`, `New York`, `GB` (bundled EB Garamond, 400/700/italic).
Hand/other: `Bradley Hand`, `Noteworthy`, `Snell Roundhand`, `American Typewriter`, `Copperplate`, `Menlo`, `Mono` (bundled).
Non-Latin: `Hiragino Sans`, `Apple SD Gothic Neo`, `PingFang SC`, `Geeza Pro` (Arabic), `Kohinoor Devanagari`.

## House rules (the audience is Jehovah's Witnesses' video teams)

- **Modest and practical.** Calm, warm, legible, dignified. No flashy glitch, no neon, no aggressive
  flashes, no trendy "hype" motion, no religious iconography such as crosses, halos or stained glass, and no
  depictions of God. No logos or branding of any real organisation.
- **Broadcast-safe.** Keep text inside title-safe (≈ 150 px from the edges at 1080p). Hold text on screen
  long enough to read twice. Nothing flashes more than 3 times a second.
- **Motion with purpose.** Ease everything (usually `out5`, `io`), overlap entrances slightly, and give a
  clean exit before the end. Lower thirds take about 1 s in, then hold, then 0.8 s out, and are fully clear on the last frame.
- **Sample text only.** Use fictional names. For scripture, use *references* ("Daniel 2:44") or the
  Daniel 2 lines in `explainers/daniel2_lines.txt`. Mark sample numbers as sample data.
- **Everything editable lives in `params`**: names, titles, dates and colours. One template renders many clips.
