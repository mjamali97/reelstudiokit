#!/usr/bin/env python3
"""Abstract placeholder 'photos' for the examples (generated, no licence questions). Replace them with your own photos.
    tools/py tools/render/make_placeholders.py examples/bakery/media
"""
import sys, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
PAL = [((242, 193, 78), (228, 87, 46)), ((246, 214, 189), (190, 110, 90)), ((214, 236, 222), (90, 160, 120)), ((240, 200, 210), (200, 90, 120)), ((220, 210, 240), (110, 90, 180)), ((250, 230, 200), (170, 120, 70))]
for i, (a, b) in enumerate(PAL):
    rnd = random.Random(i); W, H = 1080, 1350
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; d.line([(0, y), (W, y)], fill=tuple(int(a[k] * (1 - t) + b[k] * t) for k in range(3)))
    for _ in range(7):
        r = rnd.randint(120, 380); x, y = rnd.randint(0, W), rnd.randint(0, H)
        c = tuple(min(255, int(v * rnd.uniform(.85, 1.15))) for v in (a if rnd.random() < .5 else b))
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    im = im.filter(ImageFilter.GaussianBlur(40))
    d = ImageDraw.Draw(im); cx, cy = W // 2, H // 2 + 60   # a simple 'cake' silhouette so it reads as a product shot
    d.rounded_rectangle([cx - 300, cy - 40, cx + 300, cy + 260], 40, fill=tuple(int(v * .92) for v in a))
    d.rounded_rectangle([cx - 230, cy - 230, cx + 230, cy - 20], 36, fill=tuple(min(255, int(v * 1.05)) for v in a))
    d.ellipse([cx - 40, cy - 330, cx + 40, cy - 250], fill=b)
    im.save(out / f"photo-{i + 1}.jpg", quality=86)
print("placeholders →", out)
