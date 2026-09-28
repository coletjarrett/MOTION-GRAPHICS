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
            
        # Reshape to (frames, channels)
        y = y.reshape(-1, channels)
        
        # Take the mean across channels to get mono
        y_mono = np.mean(y, axis=1)
        y_mono = y_mono / np.max(np.abs(y_mono)) # normalize
        
        # Find clicks
        diff = np.abs(np.diff(y_mono))
        threshold = 0.5
        clicks = np.where(diff > threshold)[0]
        
        click_times = []
        if len(clicks) > 0:
            for click in clicks:
                time_sec = click / sr
                # group clicks within 0.1s
                if not click_times or time_sec - click_times[-1] > 0.1:
                    click_times.append(time_sec)
        
        print(f"--- {f} ---")
        if click_times:
            for t in click_times:
                print(f"Click at: {t:.3f}s")
        else:
            print("No clicks detected.")
            
    except Exception as e:
        print(f"Error analyzing {f}: {e}")

