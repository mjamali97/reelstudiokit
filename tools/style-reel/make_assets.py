#!/usr/bin/env python3
"""Paper textures and every sound cue of the style kit, all generated from code (no third-party files, no licence questions).

    tools/.venv/bin/python tools/style-reel/make_assets.py

Writes assets/paper-{cream,tan,white}.jpg and assets/sfx/{whoosh-in,whoosh-out,pop,hit,tick,zoom,shutter,swish}.wav.
Swap any of them for your own (same names) when your design system has its own sounds or textures.
"""
import wave
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
A = HERE / "assets"
(A / "sfx").mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(11)
SR = 48000


def paper(rgb, name):
    n = rng.normal(0, 1, (480, 270))
    img = Image.fromarray(np.uint8(np.clip(128 + n * 22, 0, 255))).resize((1080, 1920), Image.BICUBIC)
    n2 = np.asarray(img, dtype=float) / 255 - .5
    arr = np.ones((1920, 1080, 3)) * np.array(rgb, dtype=float)
    arr += n2[..., None] * 18
    arr += rng.normal(0, 1, (1920, 1080))[..., None] * 6
    Image.fromarray(np.uint8(np.clip(arr, 0, 255))).save(A / f"{name}.jpg", quality=90)


def save(name, x, peak=.5):
    x = x / max(1e-9, np.max(np.abs(x))) * peak
    fade = min(len(x), int(.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(str(A / "sfx" / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(sec):
    return np.arange(int(sec * SR)) / SR


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


def sweep_noise(sec, f0, f1, rise):
    """Band-limited noise whose brightness glides from f0 to f1, with an attack/decay envelope peaking at `rise` (0..1)."""
    tt = t(sec); n = rng.standard_normal(len(tt))
    out = np.zeros_like(n)
    for k in (3, 6, 12, 24, 48):                       # a few lowpass layers, mixed by the glide
        out += lowpass(n, k) * np.interp(tt / sec, [0, 1], [f0, f1]) ** (1 / k)
    env = np.where(tt / sec < rise, (tt / sec / rise) ** 2, np.exp(-(tt / sec - rise) / (1 - rise) * 5))
    return out * env


paper((244, 239, 230), "paper-cream"); paper((201, 187, 156), "paper-tan"); paper((250, 248, 243), "paper-white")

save("whoosh-in", sweep_noise(.68, .2, 1.0, .29))      # peaks at 0.195 s: the cue starts 0.195 s before the cut
save("whoosh-out", sweep_noise(.6, 1.0, .2, .75))      # peaks late: the cue starts 0.45 s before the return to face
tt = t(.3); save("pop", np.sin(2 * np.pi * (520 + 380 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 28), .45)
tt = t(.7); save("hit", (np.sin(2 * np.pi * (55 + 90 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 6)
                         + rng.standard_normal(len(tt)) * np.exp(-tt * 45) * .6), .55)
tt = t(.05); save("tick", (rng.standard_normal(len(tt)) * .6 + np.sin(2 * np.pi * 1800 * tt)) * np.exp(-tt * 140))
tt = t(.55); save("zoom", np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / tt[-1]) ** 2) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2 * .6
                  + sweep_noise(.55, .3, 1, .8) * .4)
tt = t(.18); save("shutter", np.concatenate([rng.standard_normal(len(tt)) * np.exp(-tt * 60), rng.standard_normal(len(tt)) * np.exp(-tt * 45) * .7]))
tt = t(.45); save("swish", lowpass(rng.standard_normal(len(tt)) * np.sin(np.pi * tt / tt[-1]) ** 2, 12))
print("assets ok:", ", ".join(sorted(p.name for p in (A / "sfx").glob("*.wav"))))
