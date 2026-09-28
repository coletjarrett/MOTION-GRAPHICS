#!/bin/zsh
# Overnight finisher: waits for the AI workers, renders everything, scores it, renders the explainers, and builds the catalog.
cd ~/Projects/jw-motion-library
sleep 2400
[ -f templates/l3/_variants.json ] && python3 -c "
import json;a=json.load(open('variants.json'));b=json.load(open('templates/l3/_variants.json'));ids={x['id'] for x in a};json.dump(a+[x for x in b if x['id'] not in ids],open('variants.json','w'),indent=1)"
WORKERS=3 python3 engine/build.py > qa/build_final.log 2>&1
python3 engine/sound.py >> qa/build_final.log 2>&1
python3 explainers/stats.py; python3 explainers/posters.py
for e in e1_how e2_cost; do
  ffmpeg -v error -y -i explainers/$e/narration.wav -i audio/bed_warm.wav -filter_complex "[0]aresample=48000,volume=1.0[n];[1]volume=0.12,afade=t=out:st=100:d=5[m];[n][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5" -ar 48000 explainers/$e/mix.wav
done
cat > qa/exp_jobs.json <<J
[{"id":"01 How it works","tpl":"explainers/e1_how/e1.js","libs":["explainers/xlib.js"],"dir":"explainers","audio":"explainers/e1_how/mix.wav"},
 {"id":"02 The cost picture","tpl":"explainers/e2_cost/e2.js","libs":["explainers/xlib.js"],"dir":"explainers","audio":"explainers/e2_cost/mix.wav"}]
J
node engine/render.js batch qa/exp_jobs.json 0 2 > qa/exp0.log 2>&1 & node engine/render.js batch qa/exp_jobs.json 1 2 > qa/exp1.log 2>&1; wait
python3 catalog/build_catalog.py
echo FINISHED $(date) >> qa/build_final.log
