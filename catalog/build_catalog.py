"""Build the offline catalog page: Library.html at the library root (opens by double-click, no server needed).
Scans out/<pack>/*.mp4, reads each template's metadata and source, embeds everything as JSON."""
import glob, html, json, os, re
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

STYLE_NOTES = {
 'minimal': 'Hairlines, generous space, one warm accent. The house default.',
 'editorial': 'Magazine elegance: Garamond and Didot, gold hairlines, italics.',
 'kinetic': 'Calm typographic motion: words build meaning one at a time.',
 'paper': 'Layered cut paper with real fibre texture and soft shadows.',
 'watercolor': 'Pigment blooms and dries on cold-press paper.',
 'botanical': 'Engraved vines and leaves that grow and unfurl.',
 'maps': 'Bible-lands maps with routes that draw themselves.',
 'nightsky': 'Creation themes: dusk to starlight, constellations trace.',
 'blueprint': 'Construction updates drawn like a drafting table.',
 'riso': 'Two-ink risograph print: halftones and overprint.',
 'mosaic': 'Ancient tesserae for Bible-history segments.',
 'isometric': 'Friendly isometric scenes that assemble block by block.',
 'topo': 'Survey-map contour lines for journeys and places.',
 'engraving': 'Steel-engraving hatch lines on antique paper.',
 'chalk': 'Slate and chalk for family and children’s lessons.',
 'sketch': 'Notebook sketch-notes with marker highlights.',
 'light': 'Soft cinematic light, bokeh and frosted glass.',
 'swiss': 'International Typographic Style: grid, blocks, precision.',
 'archive': 'Aged paper, typewriters and index cards for history.',
 'infographic': 'Clear data stories with icons and counting numbers.',
 'relief': 'Gilded relief film engine (the Daniel 2 film) — WebGL materials.',
 'variants': 'The same lower third, rendered from a spreadsheet of names.',
 'explainers': 'Narrated explainers about this approach.',
}
NAMES = {'variants': 'One template · 12 languages', 'relief': 'Gilded Relief', 'explainers': 'Explainers'}

def meta(tpl):
    s = open(tpl, encoding='utf-8').read()
    g = lambda k: (re.search(k + r"\s*:\s*'([^']*)'", s) or re.search(k + r'\s*:\s*"([^"]*)"', s) or [None, ''])[1]
    return {'style': g('style'), 'type': g('type'), 'title': g('title'), 'src': s}

def dur(mp4):
    import subprocess
    try: return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip())
    except Exception: return 0

variants = {v['id']: v for v in json.load(open('variants.json'))} if os.path.exists('variants.json') else {}
items = []
for mp4 in sorted(glob.glob('out/*/*.mp4')):
    pack = mp4.split('/')[1]; vid = os.path.basename(mp4)[:-4]
    tpl = f'templates/{pack}/{vid[len(pack) + 1:]}.js'
    m = {'style': NAMES.get(pack, pack.title()), 'type': '', 'title': vid, 'src': ''}
    if os.path.exists(tpl): m = meta(tpl)
    if vid in variants: v = variants[vid]; m = meta(v['tpl']); m['title'] = v['params'].get('lang', vid); m['style'] = 'One template · 12 languages'; m['params'] = v['params']
    if pack == 'relief': m = {'style': 'Gilded Relief', 'type': 'Film excerpt', 'title': vid.replace('relief-', '').replace('-', ' ').capitalize(), 'src': '// Excerpt from the Daniel 2 film (relief-film engine: WebGL height/metal materials, ~1,400 lines of scene code).'}
    items.append({'pack': pack, 'id': vid, 'mp4': mp4, 'jpg': mp4[:-4] + '.jpg', 'alpha': os.path.exists(mp4[:-4] + '.mov'), 'mov': mp4[:-4] + '.mov',
                  'dur': round(dur(mp4), 1), **m})
exp = [{'id': os.path.basename(f)[:-4], 'mp4': f, 'jpg': f[:-4] + '.jpg'} for f in sorted(glob.glob('explainers/*.mp4'))]
stats = json.load(open('explainers/stats.json')) if os.path.exists('explainers/stats.json') else {}
order = ['explainers', 'minimal', 'editorial', 'kinetic', 'light', 'swiss', 'paper', 'watercolor', 'botanical', 'nightsky', 'maps', 'topo', 'mosaic', 'engraving', 'archive', 'blueprint', 'isometric', 'infographic', 'riso', 'chalk', 'sketch', 'relief', 'variants']
packs = sorted({i['pack'] for i in items}, key=lambda p: order.index(p) if p in order else 99)
data = {'items': items, 'packs': [{'id': p, 'name': next((i['style'] for i in items if i['pack'] == p), p), 'note': STYLE_NOTES.get(p, '')} for p in packs], 'explainers': exp, 'stats': stats}
page = open('catalog/template.html', encoding='utf-8').read().replace('/*DATA*/', 'const DATA = ' + json.dumps(data).replace('</', '<\\/') + ';')
open('Library.html', 'w', encoding='utf-8').write(page)
print(f'Library.html: {len(items)} clips, {len(packs)} packs, {len(exp)} explainers')
