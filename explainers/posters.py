"""List poster jpgs for the explainers: opaque graphics first (they read best as thumbnails), one per template."""
import glob, json, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
jp = [f for f in sorted(glob.glob('out/*/*.jpg')) if '/variants/' not in f]
opaque = [f for f in jp if not os.path.exists(f[:-4] + '.mov')]; alpha = [f for f in jp if f not in opaque]
# interleave packs so neighbours differ
by = {}
for f in opaque + alpha: by.setdefault(f.split('/')[1], []).append(f)
out = []
while any(by.values()):
    for k in list(by):
        if by[k]: out.append(by[k].pop(0))
out += ['explainers/assets/' + os.path.basename(f) for f in sorted(glob.glob('explainers/assets/daniel_*.jpg'))]
json.dump(['/' + f for f in out], open('explainers/posters.json', 'w'), indent=0); print(len(out), 'posters')
