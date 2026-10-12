#!/usr/bin/env python3
"""Brand colours from pictures: a logo, brand-book pages, a screenshot of the Instagram grid, product photos.

    python3 tools/brand/palette.py <image or folder>... [--k 8] [--out palette.json] [--sheet palette.png]

Prints the main colours with the share of pixels they cover, plus a role guess (background, text, accent) that
/brand shows the owner to confirm. A PDF brand book: export its pages as images first (macOS Preview, or
`pdftoppm -png -r 60 book.pdf pages/p`), or let Claude read the PDF and type the hex codes it states.
Needs Pillow and numpy (tools/requirements.txt).
"""
import colorsys, json, sys
from pathlib import Path

import numpy as np
from PIL import Image

args = sys.argv[1:]
def opt(k, d=None):
    return args[args.index(k) + 1] if k in args else d
K = int(opt("--k", 8))
paths = [a for i, a in enumerate(args) if not a.startswith("--") and not (i and args[i - 1] in ("--k", "--out", "--sheet"))]
if not paths:
    print(__doc__); sys.exit(2)
files = []
for p in map(Path, paths):
    files += sorted(f for f in p.rglob("*") if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")) if p.is_dir() else [p]

px = []
for f in files:
    im = Image.open(f)
    im = im.convert("RGBA")
    im.thumbnail((240, 240))
    a = np.asarray(im).reshape(-1, 4)
    px.append(a[a[:, 3] > 200][:, :3])  # transparent logo background is not a brand colour
X = np.concatenate(px).astype(np.float32)
if not len(X):
    sys.exit("no opaque pixels found")

# k-means in RGB, seeded from the most common coarse buckets (stable between runs)
q = (X // 32).astype(int)
keys, counts = np.unique(q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2], return_counts=True)
seeds = []
for kk in keys[np.argsort(-counts)]:
    seeds.append(X[(q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2]) == kk].mean(0))
    if len(seeds) == K:
        break
C = np.array(seeds)
for _ in range(20):
    lab = np.argmin(((X[:, None, :] - C[None]) ** 2).sum(-1), 1)
    C = np.array([X[lab == i].mean(0) if (lab == i).any() else C[i] for i in range(len(C))])
share = np.bincount(lab, minlength=len(C)) / len(X)

def hx(c):
    return "#" + "".join(f"{int(round(v)):02X}" for v in c)
def hls(c):
    h, l, s = colorsys.rgb_to_hls(*(np.array(c) / 255))
    return h, l, s

cols = sorted(({"hex": hx(c), "share": round(float(s), 4), "l": round(hls(c)[1], 3), "s": round(hls(c)[2], 3)}
               for c, s in zip(C, share) if s > 0.003), key=lambda x: -x["share"])
bg = cols[0]
ink = min(cols, key=lambda c: c["l"]) if bg["l"] > 0.5 else max(cols, key=lambda c: c["l"])
ink = ink if abs(ink["l"] - bg["l"]) > 0.55 else {"hex": "#111111" if bg["l"] > 0.5 else "#F5F5F5"}  # no readable text colour in the pictures
vivid = sorted((c for c in cols if c["s"] > 0.3 and 0.18 < c["l"] < 0.85 and c is not bg), key=lambda c: -(c["share"] * c["s"]))
if bg["s"] > 0.3 and 0.18 < bg["l"] < 0.85:  # a logo or a coloured page: its biggest colour IS the brand colour
    vivid = [bg] + vivid
    light = [c for c in cols if c["s"] < 0.15 and c["l"] > 0.9]
    bg, ink = (light[0] if light else {"hex": "#FFFFFF"}), {"hex": "#111111"}
roles = {"bg": bg["hex"], "ink": ink["hex"], "accent": vivid[0]["hex"] if vivid else None, "accent2": vivid[1]["hex"] if len(vivid) > 1 else None}

print(f"{len(files)} image(s), {len(X):,} pixels")
for c in cols:
    print(f"  {c['hex']}  {c['share'] * 100:5.1f}%  {'█' * max(1, int(c['share'] * 60))}")
print("role guess (confirm with the owner):", json.dumps(roles))
if opt("--out"):
    Path(opt("--out")).write_text(json.dumps({"files": [str(f) for f in files], "colors": cols, "roles": roles}, indent=1))
if opt("--sheet"):
    W = 900; S = Image.new("RGB", (W, 160), "white"); x = 0
    for c in cols:
        w = max(8, int(c["share"] * W)); S.paste(Image.new("RGB", (w, 160), c["hex"]), (x, 0)); x += w
    S.save(opt("--sheet"))
