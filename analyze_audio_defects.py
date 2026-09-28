import wave
import numpy as np

files = [
    "audio/sting_warm.wav", "audio/sting_bright.wav", "audio/sting_calm.wav",
    "audio/sting_night.wav", "audio/sting_paper.wav", "audio/sting_stately.wav", "audio/bed_warm.wav"
]

def analyze_file(f):
    try:
        wf = wave.open(f, 'rb')
        sr = wf.getframerate()
        nframes = wf.getnframes()
        channels = wf.getnchannels()
        data = wf.readframes(nframes)
        
        y = np.frombuffer(data, dtype=np.int16).reshape(-1, channels)
        y = np.mean(y, axis=1) / 32768.0
        
        # We will split the audio into 0.5 second chunks and analyze them
        chunk_size = sr // 2
        
        print(f"--- {f} ---")
        
        for i in range(0, len(y), chunk_size):
            chunk = y[i:i+chunk_size]
            if len(chunk) < chunk_size:
                break
                
            time_start = i / sr
            
            # Simple FFT
            fft = np.abs(np.fft.rfft(chunk))
            freqs = np.fft.rfftfreq(len(chunk), 1/sr)
            
            # Sub-bands
            mud_band = np.sum(fft[(freqs > 200) & (freqs < 500)])
            harsh_band = np.sum(fft[(freqs > 2000) & (freqs < 5000)])
            
            # Dissonance/roughness (simplified: lots of close peaks)
            # Just print the stats to let us see where the peaks are
            print(f"[{time_start:.1f}s] Mud: {mud_band:.1f}, Harsh: {harsh_band:.1f}, MaxAbs: {np.max(np.abs(chunk)):.3f}")
            
    except Exception as e:
        print(f"Error: {e}")

for f in files:
    analyze_file(f)
