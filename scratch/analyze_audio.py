import sys
import numpy as np
import scipy.io.wavfile as wavfile

def analyze(filename):
    sr, data = wavfile.read(filename)
    if data.ndim > 1:
        data = data.mean(axis=1) # mix to mono
    
    # check for clipping
    max_val = np.max(np.abs(data))
    if max_val >= 32767:
        print(f"Clipping detected in {filename}")

    # let's detect sharp clicks by looking at high derivative
    diff = np.abs(np.diff(data))
    threshold = 10000
    clicks = np.where(diff > threshold)[0]
    if len(clicks) > 0:
        times = clicks / sr
        print(f"Potential clicks in {filename} at times: {times[:5]}")
        
analyze("audio/sting_warm.wav")
analyze("audio/sting_bright.wav")
analyze("audio/sting_calm.wav")
analyze("audio/sting_night.wav")
analyze("audio/sting_paper.wav")
analyze("audio/sting_stately.wav")
analyze("audio/bed_warm.wav")
