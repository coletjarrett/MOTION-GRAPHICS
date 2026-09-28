import wave
import contextlib

def get_duration(filename):
    with contextlib.closing(wave.open(filename,'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)
        return duration

files = [
    "audio/sting_warm.wav", "audio/sting_bright.wav", "audio/sting_calm.wav", 
    "audio/sting_night.wav", "audio/sting_paper.wav", "audio/sting_stately.wav", "audio/bed_warm.wav"
]

for file in files:
    try:
        dur = get_duration(file)
        print(f"{file}: {dur} seconds")
    except Exception as e:
        print(f"Error reading {file}: {e}")
