#!/usr/bin/env python3
"""Contact sheet of rendered images, to look at a whole deck at once.
    tools/py tools/render/sheet.py <dir-or-images...> <out.jpg> [--cols 5] [--w 300]
"""
import sys
from pathlib import Path
from PIL import Image
args = sys.argv[1:]; cols = int(args[args.index("--cols") + 1]) if "--cols" in args else 5; tw = int(args[args.index("--w") + 1]) if "--w" in args else 300
args = [a for i, a in enumerate(args) if not a.startswith("--") and not (i and args[i - 1] in ("--cols", "--w"))]
out = args[-1]; files = []
for a in args[:-1]:
    p = Path(a); files += sorted(p.glob("*.png")) if p.is_dir() else [p]
ims = [Image.open(f).convert("RGB") for f in files]
th = max(int(im.height * tw / im.width) for im in ims); rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th + 10) + 10), (40, 40, 40))
for i, im in enumerate(ims):
    S.paste(im.resize((tw, int(im.height * tw / im.width))), (10 + (i % cols) * (tw + 10), 10 + (i // cols) * (th + 10)))
S.save(out, quality=85); print(out, len(ims), "images")
