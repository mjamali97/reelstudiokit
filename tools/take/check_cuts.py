#!/usr/bin/env python3
"""Frame-exact cut check on a FINISHED render, plus a phone copy to watch it the way viewers will.

    tools/py tools/take/check_cuts.py <project> <render.mp4> [--phone]

For every cut in <project>/segments.json it takes the last frame before and the first frame after, straight from the
render (preview snapshots seek approximately and can lie by a frame), and lays the pairs side by side in
work/cut_check.jpg, each pair labelled with its time. Look at it: every "after" frame shows the new shot cleanly, with no
caption, card or cutout left over from the shot before.
--phone writes <render>-phone.mp4: 720x1280, small enough to send to a phone or a chat.
"""
import json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw

proj, render = Path(sys.argv[1]).expanduser().resolve(), Path(sys.argv[2]).expanduser().resolve()
segs = json.loads((proj / "segments.json").read_text())
tmp = Path(tempfile.mkdtemp()); tiles = []
for s in segs[1:]:
    pair = []
    for n in (s["frame"] - 1, s["frame"]):
        p = tmp / f"f{n}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(render), "-vf", f"select=eq(n\\,{n}),scale=180:-2", "-vsync", "0", "-frames:v", "1", str(p)], check=True)
        pair.append(Image.open(p).convert("RGB"))
    w, h = pair[0].size; t = Image.new("RGB", (w * 2 + 6, h + 22), "black"); d = ImageDraw.Draw(t)
    t.paste(pair[0], (0, 22)); t.paste(pair[1], (w + 6, 22)); d.text((4, 4), f"{s['id']} @ {s['frame'] / 30:.2f}s  before | after", fill="yellow")
    tiles.append(t)
if tiles:
    cols = 4; tw, th = tiles[0].size; rows = (len(tiles) + cols - 1) // cols
    S = Image.new("RGB", (cols * (tw + 10), rows * (th + 10)), (30, 30, 30))
    for i, t in enumerate(tiles): S.paste(t, ((i % cols) * (tw + 10), (i // cols) * (th + 10)))
    (proj / "work").mkdir(exist_ok=True); S.save(proj / "work" / "cut_check.jpg", quality=85)
    print(f"{len(tiles)} cuts → {proj / 'work' / 'cut_check.jpg'}")
else: print("no cuts (one segment)")
if "--phone" in sys.argv:
    out = render.with_name(render.stem + "-phone.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(render), "-vf", "scale=720:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "27",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(out)], check=True)
    print(f"phone copy → {out} ({out.stat().st_size / 1e6:.1f} MB)")
