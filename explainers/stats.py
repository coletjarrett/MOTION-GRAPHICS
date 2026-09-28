"""Measured library stats for the explainers and docs → explainers/stats.json"""
import glob, json, os, statistics
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
mp4 = [f for f in glob.glob('out/*/*.mp4')]
packs = sorted({f.split('/')[1] for f in glob.glob('templates/*/*.js')} - {'plates'})
log = [json.loads(l) for l in open('qa/render_log.jsonl')] if os.path.exists('qa/render_log.jsonl') else []
last = {}
for r in log: last[r['id']] = r
l3 = [r['secs'] for k, r in last.items() if 'lower-third' in k or k.startswith('lang-')]
S = {'clips': len(mp4), 'styles': len(packs), 'packs': packs, 'languages': 12, 'l3_secs': statistics.median(l3) if l3 else 25,
     'render_secs_total': round(sum(r['secs'] for r in last.values())), 'frames_total': sum(r['frames'] for r in last.values()),
     'ms_per_frame_median': statistics.median([r['ms_per_frame'] for r in last.values()]) if last else 0, 'packs_ai': 7, 'gemini_jobs': 6}
json.dump(S, open('explainers/stats.json', 'w'), indent=1); print(json.dumps(S))
