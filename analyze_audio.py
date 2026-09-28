import wave
import numpy as np
import os

files = [
    "audio/sting_warm.wav", "audio/sting_bright.wav", "audio/sting_calm.wav",
    "audio/sting_night.wav", "audio/sting_paper.wav", "audio/sting_stately.wav", "audio/bed_warm.wav"
]

for f in files:
    try:
        wf = wave.open(f, 'rb')
        sr = wf.getframerate()
        nframes = wf.getnframes()
        data = wf.readframes(nframes)
        
        # Convert to numpy array
        if wf.getsampwidth() == 2:
            y = np.frombuffer(data, dtype=np.int16)
        else:
            y = np.frombuffer(data, dtype=np.int32)
            
        y = y / np.max(np.abs(y)) # normalize
        
        print(f"--- {f} ---")
        print(f"Duration: {nframes/sr:.2f}s, SR: {sr}, Channels: {wf.getnchannels()}")
        
        # Detect clicks (sudden large jumps)
        diff = np.abs(np.diff(y))
        threshold = 0.5
        clicks = np.where(diff > threshold)[0]
        if len(clicks) > 0:
            for click in clicks[:5]:
                print(f"Potential click at: {click/sr:.3f}s")
    except Exception as e:
        print(f"Error analyzing {f}: {e}")

