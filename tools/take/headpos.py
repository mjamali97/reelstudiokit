#!/usr/bin/env python3
"""Where the speaker's head is in every segment, read from the cutout's alpha (assets/subject.webm).

    tools/py tools/take/headpos.py <project>

Writes <project>/headpos.json and assets/headpos.js (window.HEAD = [...] for the video styles), one entry per segment:
  {"id", "start", "end", "head_top", "head_x": [left, right], "face_bottom", "body": [x0, y0, x1, y1], "moves"}
in the 1080x1920 frame, measured at 20 %, 50 % and 80 % of the segment (head_top = the highest of the three, so a word
placed from it stays clear when the speaker lifts the chin). "moves" is true when the head travels more than ~60 px:
put words in front over the chest there, not behind the head.
Behind-the-head words: for a word of font size S (line-height 0.9) the baseline sits ~0.72*S below its top; put the top
at head_top + 0.15*S - 0.8*S so only the lower ~30 % of the letters hide behind the head and the word still reads.
The chin comes from the face detector the QA uses (YuNet, OpenCV; downloaded once), so a beard, a cap or hair never puts
a line on the face; without a detected face it falls back to the cutout's shape. Run it with tools/py
(OpenCV, Pillow) and an ffmpeg with libvpx (VP9).
"""
import json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

proj = Path(sys.argv[1]).expanduser().resolve()
segs = json.loads((proj / "segments.json").read_text(encoding="utf-8")); sub = proj / "assets" / "subject.webm"
if not sub.exists(): sys.exit("no assets/subject.webm: run tools/take/cutout.py first")
K = 4   # measured at 270x480, reported at 1080x1920
try:
    import cv2, numpy as np, urllib.request
    MODEL = Path.home() / ".cache" / "reel-studio" / "yunet.onnx"
    if not MODEL.exists():
        MODEL.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve("https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx", MODEL)
    DET = cv2.FaceDetectorYN.create(str(MODEL), "", (540, 960), .7)
except Exception as e:
    DET = None; print("no face detector (OpenCV missing?): chin guessed from the cutout shape", e)
AROLL = proj / "assets" / "aroll.mp4"

def chin_at(t):
    """bottom of the largest face at time t (1080x1920 px) + 6 % of the face height (the box ends near the chin; a beard sits inside it)"""
    if DET is None or not AROLL.exists(): return None
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(AROLL), "-frames:v", "1", "-vf", "scale=540:960", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                         capture_output=True).stdout
    if len(raw) != 540 * 960 * 3: return None
    _, faces = DET.detect(np.frombuffer(raw, np.uint8).reshape(960, 540, 3))
    if faces is None or not len(faces): return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])[:4]
    return int((y + h * 1.06) * 2)
tmp = Path(tempfile.mkdtemp()); out = []
for s in segs:
    t0, d = s["frame"] / 30, s["frames"] / 30; probes = []
    for k, f in enumerate((.2, .5, .8)):
        png = tmp / f"{s['id']}_{k}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-c:v", "libvpx-vp9", "-ss", f"{t0 + d * f:.3f}", "-i", str(sub), "-frames:v", "1",
                        "-vf", "alphaextract,scale=270:480", str(png)], check=True)
        im = Image.open(png).convert("L"); w, h = im.size; px = im.load()
        rows = [y for y in range(h) if any(px[x, y] > 128 for x in range(0, w, 2))]
        if not rows: continue
        top = rows[0]
        band = top + int(h * .05)   # a little below the crown: the width of the head
        xs = [x for x in range(w) if px[x, min(h - 1, band)] > 128]
        head_w = (xs[-1] - xs[0]) if xs else w // 5
        bb = im.point(lambda v: 255 if v > 128 else 0).getbbox()
        # the chin: the neck is the narrowest row between the widest part of the head and the shoulders
        def width(y):
            r = [x for x in range(w) if px[x, y] > 128]
            return (r[-1] - r[0]) if r else 0
        rows_w = [(y, width(y)) for y in range(top, min(h, top + int(head_w * 2.4)))]
        widest = max(rows_w[: max(1, int(head_w * 1.1))], key=lambda r: r[1]) if rows_w else (top, head_w)
        after = [r for r in rows_w if r[0] > widest[0] + head_w * .35]
        neck = min(after, key=lambda r: r[1]) if after else None
        chin = neck[0] if neck and neck[1] < widest[1] * .85 else top + int(head_w * 1.5)   # no clear neck (collar, hair): a safe guess
        fc = chin_at(t0 + d * f)
        if fc: chin = fc / K
        probes.append({"top": top, "x": (xs[0], xs[-1]) if xs else (w // 2 - 20, w // 2 + 20), "face_bottom": chin, "body": bb})
    if not probes:
        out.append({"id": s["id"], "start": round(t0, 3), "end": round(t0 + d, 3), "head_top": None}); continue
    tops = [p["top"] for p in probes]
    e = {"id": s["id"], "start": round(t0, 3), "end": round(t0 + d, 3), "head_top": min(tops) * K,
         "head_x": [min(p["x"][0] for p in probes) * K, max(p["x"][1] for p in probes) * K],
         "face_bottom": int(max(p["face_bottom"] for p in probes) * K),
         "body": [min(p["body"][0] for p in probes) * K, min(p["body"][1] for p in probes) * K, max(p["body"][2] for p in probes) * K, max(p["body"][3] for p in probes) * K],
         "moves": (max(tops) - min(tops)) * K > 60}
    out.append(e)
    print(f"{s['id']:12} {t0:6.2f}s  head top {e['head_top']:4d}  head x {e['head_x'][0]}-{e['head_x'][1]}  face to y {e['face_bottom']}  {'MOVES' if e['moves'] else ''}")
(proj / "headpos.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
(proj / "assets").mkdir(exist_ok=True); (proj / "assets" / "headpos.js").write_text("window.HEAD=" + json.dumps(out) + ";\n", encoding="utf-8")
print("→ headpos.json, assets/headpos.js")
