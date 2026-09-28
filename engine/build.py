"""Render the whole library (or a filter) in parallel.  python3 engine/build.py [substring ...]
Env: WORKERS (3), FORCE=1 to re-render everything.  Jobs = every templates/<pack>/<file>.js with default params,
plus variants.json (the same template with other params).  Output: out/<pack>/<id>.mp4 (+ .mov alpha, .jpg poster)."""
import glob, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
PLATES = ['plates/plate_warm.png', 'plates/plate_studio.png', 'plates/plate_garden.png', 'plates/plate_sky.png']
jobs = []
for f in sorted(glob.glob('templates/*/*.js')):
    pack, name = f.split('/')[1], os.path.basename(f)[:-3]
    if pack == 'plates' or name.startswith('_'): continue
    jobs.append({'id': f'{pack}-{name}', 'tpl': f, 'dir': f'out/{pack}', 'plate': PLATES[hash(pack) % 4 if False else sum(map(ord, pack)) % 4]})
if os.path.exists('variants.json'):
    for v in json.load(open('variants.json')):
        jobs.append({'dir': 'out/' + v.get('pack', 'variants'), 'plate': v.get('plate', 'plates/plate_warm.png'), **v})
filt = sys.argv[1:]
if filt: jobs = [j for j in jobs if any(s in j['id'] for s in filt)]
def stale(j):
    out = os.path.join(j['dir'], j['id'] + '.mp4')
    if os.environ.get('FORCE') or not os.path.exists(out): return True
    return os.path.getmtime(out) < max(os.path.getmtime(j['tpl']), os.path.getmtime('engine/kit.js'), os.path.getmtime('variants.json') if 'params' in j else 0)
jobs = [j for j in jobs if stale(j)]
N = min(int(os.environ.get('WORKERS', '3')), max(1, len(jobs)))
print(f'{len(jobs)} jobs on {N} workers'); os.makedirs('qa', exist_ok=True)
json.dump(jobs, open('qa/jobs.json', 'w'), indent=1)
T = time.time()
def work(w): return subprocess.run(['node', 'engine/render.js', 'batch', 'qa/jobs.json', str(w), str(N)]).returncode
if jobs:
    with ThreadPoolExecutor(N) as ex: list(ex.map(work, range(N)))
print(f'ALL DONE {len(jobs)} jobs in {time.time() - T:.0f}s')
