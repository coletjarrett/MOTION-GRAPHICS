"""Give every opaque clip an original score matched to its style (alpha overlays stay silent for editors).
python3 engine/sound.py [substring ...]   — idempotent: skips clips already scored (unless FORCE=1)."""
import glob, json, os, subprocess, sys, zlib
import soundfile as sf
sys.path.insert(0, os.path.dirname(__file__)); import music
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MOOD = {'minimal': 'calm', 'editorial': 'warm', 'kinetic': 'bright', 'paper': 'paper', 'watercolor': 'calm', 'botanical': 'warm', 'maps': 'stately',
        'nightsky': 'night', 'blueprint': 'bright', 'riso': 'paper', 'mosaic': 'stately', 'engraving': 'stately', 'isometric': 'bright', 'topo': 'calm',
        'chalk': 'warm', 'sketch': 'bright', 'light': 'calm', 'swiss': 'bright', 'archive': 'warm', 'infographic': 'bright', 'sumi': 'night',
        'lowpoly': 'calm', 'letterpress': 'warm'}
filt = sys.argv[1:]; os.makedirs('audio/clips', exist_ok=True)
for mp4 in sorted(glob.glob('out/*/*.mp4')):
    pack, vid = mp4.split('/')[1], os.path.basename(mp4)[:-4]
    if pack in ('relief', 'variants') or os.path.exists(mp4[:-4] + '.mov') or (filt and not any(s in vid for s in filt)): continue
    has_audio = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip()
    if has_audio and not os.environ.get('FORCE'): continue
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout)
    mood = MOOD.get(pack, 'warm'); wav = f'audio/clips/{vid}.wav'
    sf.write(wav, music.compose(d, mood, zlib.crc32(vid.encode()) % 1000, sting=d <= 12), music.SR, subtype='PCM_16')
    tmp = mp4[:-4] + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-af', 'loudnorm=I=-20:TP=-2:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, mp4); print('scored', vid, mood, round(d, 1))
