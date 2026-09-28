"""music.py — gentle, original, license-free music synthesized in code (deterministic).

    python3 engine/music.py sting OUT.wav DUR MOOD [SEED]        # a short bumper sting, e.g. 8 s
    python3 engine/music.py bed   OUT.wav DUR MOOD [SEED]        # an underscore bed for narration
MOODS: warm (piano + pad), bright (plucks + bells), calm (strings pad), night (bells + pad, minor-ish),
       paper (marimba-ish plucks), stately (low strings + soft brass-like pad)
Output: 48 kHz stereo WAV, peak-normalised to -3 dBFS (final loudness is set when mixing)."""
import sys, math
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env(n, a, d, s=0.0, r=None):
    """attack a s, exponential decay d (time-constant), sustain level s, release r at end"""
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-np.maximum(0, t - a) / d))
    if r: m = int(r * SR); e[-m:] *= np.linspace(1, 0, m) ** 2
    return e
def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR / 2.2) / (SR / 2), 'low'); return signal.lfilter(b, a, x, axis=0)

def piano(f, dur, vel=.7, rng=None):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, amp in enumerate([1, .55, .32, .2, .12, .08, .05], 1):
        inh = f * k * math.sqrt(1 + .0004 * k * k); x += amp * np.sin(2 * math.pi * inh * t) * np.exp(-t * (1.1 + k * .55))
    x += .004 * lp(rng.standard_normal(n), 1800, 4) * np.exp(-t * 90)   # soft felt hammer, band-limited (no click)
    return lp(x * env(n, .03, 9, 0, .25) * vel, 3600)
def pluck(f, dur, vel=.6, rng=None, bright=.5):                  # additive nylon-ish pluck: exactly in tune
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(1, 9):
        if f * k > 9000: break
        x += (1 / k ** (1.6 - bright * .6)) * np.sin(2 * math.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.1))
    return x * vel * env(n, .006, 30, 0, .1)
def marimba(f, dur, vel=.6, rng=None):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * math.pi * f * t) * np.exp(-t * 3.2) + .35 * np.sin(2 * math.pi * f * 3.93 * t) * np.exp(-t * 12) + .15 * np.sin(2 * math.pi * f * 9.2 * t) * np.exp(-t * 30)
    return x * vel * env(n, .005, 10, 0, .08)
def bell(f, dur, vel=.4, rng=None):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for r, a, d in [(1, 1, 2.4), (2.0, .35, 1.6), (3.0, .12, .9), (4.01, .06, .5)]:   # near-harmonic: sweet, no clash
        x += a * np.sin(2 * math.pi * f * r * t) * np.exp(-t / d)
    return x * vel * env(n, .002, 30, 0, .2)
def pad(f, dur, vel=.25, rng=None, bright=900, att=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for dt in (-.07, 0, .06):                                     # three detuned soft saws
        ph = 2 * math.pi * f * (1 + dt / 100) * t + rng.uniform(0, 6.28)
        x += sum(np.sin(k * ph) / (k * k) for k in range(1, 7))
    # a slowly breathing filter: crossfade a darker and a brighter version with a gentle LFO
    lfo = .5 + .5 * np.sin(2 * math.pi * .11 * t + rng.uniform(0, 6.28))
    x = (lp(x, bright * .6, 2) * (1 - lfo) + lp(x, bright * 1.5, 2) * lfo) * (1 + .06 * np.sin(2 * math.pi * .23 * t))
    return x * vel / 3 * env(n, att, 99, 1.0, min(1.5, dur * .4))
def strings(f, dur, vel=.25, rng=None): return pad(f, dur, vel, rng, bright=1500, att=1.8) * (1 + .03 * np.sin(2 * math.pi * 5.2 * np.arange(int(dur * SR)) / SR))
def bass(f, dur, vel=.4, rng=None):
    n = int(dur * SR); t = np.arange(n) / SR; return (np.sin(2 * math.pi * f * t) + .25 * np.sin(4 * math.pi * f * t)) * vel * env(n, .02, 3, .3, .4)

def reverb(x, secs=2.6, wet=.28, seed=3):
    r = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)], 1) * np.exp(-t / (secs / 6.9))[:, None]
    ir = lp(ir, 5200); ir /= np.sqrt((ir ** 2).sum(0))
    b, a = signal.butter(2, 260 / (SR / 2), 'high'); xin = signal.lfilter(b, a, x, axis=0)   # keep lows out of the verb
    y = np.stack([signal.fftconvolve(xin[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet * 1.6

# chord progressions (MIDI roots and voicings), all diatonic and consonant
KEYS = {'warm': 57, 'bright': 65, 'calm': 60, 'night': 57, 'paper': 67, 'stately': 58}
PROG = {'warm': [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]],      # Imaj7 vi IV V
        'bright': [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]],                    # I V vi IV
        'calm': [[0, 7, 16], [5, 12, 16], [9, 16, 19], [7, 14, 17]],
        'night': [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]],        # i iv VII III
        'paper': [[0, 4, 7], [5, 9, 12], [0, 4, 7], [7, 11, 14]],
        'stately': [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]]}

def compose(dur, mood, seed=1, sting=False):
    """Sparse, gentle arrangement: a soft sustained pad, a quiet sub under it, and a few melody notes.
    No pulsing bass, no busy ostinato. Stings resolve on a final chord that has room to ring out."""
    rng = np.random.default_rng(seed); n = int((dur + 4) * SR); mix = np.zeros((n, 2))
    key = KEYS[mood]; prog = PROG[mood]
    bar = max(1.8, min(3.0, (dur - 3.4) / 2)) if sting else 4.0
    def put(sig, t0, pan=0, db=0):
        i = max(0, int(t0 * SR)); j = min(n, i + len(sig)); g = 10 ** (db / 20)
        if i >= n or j <= i: return
        mix[i:j, 0] += sig[: j - i] * g * math.cos((pan + 1) * math.pi / 4); mix[i:j, 1] += sig[: j - i] * g * math.sin((pan + 1) * math.pi / 4)
    lead = {'warm': piano, 'calm': piano, 'stately': piano, 'bright': pluck, 'paper': marimba, 'night': bell}[mood]
    nb = max(2, int((dur - 3.4) / bar) + 1) if sting else int(math.ceil(dur / bar))
    for b in range(nb):
        last = sting and b == nb - 1
        ch = prog[0] if last else prog[b % len(prog)]
        t0 = b * bar; L = bar * (3.0 if last else 1.35)
        for v in ch[:3]: put((strings if mood == 'stately' else pad)(midi(key + v - 12 - 5 * 0), L + .8, .10, rng, **({} if mood == 'stately' else {'att': 1.6})), t0, rng.uniform(-.4, .4), -6)
        sub = np.sin(2 * math.pi * midi(key + ch[0] - 24) * np.arange(int(L * SR)) / SR) * env(int(L * SR), .8, 99, 1, min(1.2, L * .4))
        put(sub * .22, t0, 0, -16)
        if last:   # a soft rolled resolution
            for k, v in enumerate(ch + [ch[0] + 12]): put(lead(midi(key + v), 5.0, .26, rng), t0 + k * .12, (k - 2) * .25, -8)
            continue
        steps = 2 if sting else 3
        for k in range(steps):
            if not sting and k and rng.random() < .35: continue
            v = ch[(k * 2 + b) % len(ch)] + (12 if k % 2 == 0 else 0)
            put(lead(midi(key + v), 4.0, .30 + .06 * (k == 0), rng), t0 + k * bar / steps + .02 * rng.standard_normal() + .05, (k - 1) * .3, -8)
    mix = lp(mix, 4800)
    hb, ha = signal.butter(2, 90 / (SR / 2), 'high'); mix = signal.lfilter(hb, ha, mix, axis=0)   # no boom
    out = reverb(mix, 3.2 if mood in ('night', 'calm') else 2.6, .26)
    out = out[: int(dur * SR)]
    fo = int((2.4 if sting else 3.5) * SR); out[-fo:] *= (.5 + .5 * np.cos(np.linspace(0, math.pi, fo)))[:, None]
    fi = int(.05 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
    return out / (np.abs(out).max() + 1e-9) * 10 ** (-3 / 20)

if __name__ == '__main__':
    kind, out, dur, mood = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
    seed = int(sys.argv[5]) if len(sys.argv) > 5 else 1
    sf.write(out, compose(dur, mood, seed, kind == 'sting'), SR, subtype='PCM_16'); print('wrote', out, dur, mood)
