import wave
import numpy as np

files = [
    "audio/sting_warm.wav", "audio/sting_bright.wav", "audio/sting_calm.wav",
    "audio/sting_night.wav", "audio/sting_paper.wav", "audio/sting_stately.wav", "audio/bed_warm.wav"
]

for f in files:
    try:
        wf = wave.open(f, 'rb')
        sr = wf.getframerate()
        nframes = wf.getnframes()
        channels = wf.getnchannels()
        data = wf.readframes(nframes)
        
        if wf.getsampwidth() == 2:
            y = np.frombuffer(data, dtype=np.int16)
        else:
            y = np.frombuffer(data, dtype=np.int32)
            
        y = y.reshape(-1, channels)
        y_mono = np.mean(y, axis=1) / 32768.0
        
        rms = np.sqrt(np.mean(y_mono**2))
        db = 20 * np.log10(rms + 1e-9)
        peak = 20 * np.log10(np.max(np.abs(y_mono)) + 1e-9)
        
        print(f"--- {f} ---")
        print(f"RMS: {db:.1f} dB, Peak: {peak:.1f} dB")
        
    except Exception as e:
        print(f"Error: {e}")
