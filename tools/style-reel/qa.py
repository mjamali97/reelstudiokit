#!/usr/bin/env python3
"""Motion QA for a rendered reel. Run it on every render before anyone sees it.

    tools/py tools/style-reel/qa.py <video.mp4> [--plan plan.json] [--sheet out.jpg]

plan.json (optional): {"face": [[0, 2.07], [5.68, 7.81], ...]}, the windows where your face is meant to be on
screen. Everywhere else is full-screen b-roll and must show no face.

Checks (each prints PASS or FAIL with times):
  face      a face is on screen exactly where the plan says (YuNet, every 0.1 s; tiny faces under 2% of
            the frame are ignored only if the plan allows a thumbnail, which it never does by default)
  frozen    no stretch of 1.0 s or longer where the picture barely changes (mean frame difference < 0.35)
  dead      no frame that is almost one flat colour (luma std < 6), e.g. an empty transition frame
  first     frame 0 already carries content (luma std >= 20), never a fade from blank
  sheet     a 3 fps contact sheet with timestamps and the Instagram safe zone outlined in red, for the eye pass
Exit 1 on any FAIL.
"""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw

# YuNet face detector (OpenCV Zoo, MIT). Downloaded once to ~/.cache/reel-studio/ on first use.
MODEL_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
MODEL = str(Path.home() / ".cache" / "reel-studio" / "yunet.onnx")


def ensure_model():
    if not Path(MODEL).exists():
        import urllib.request
        Path(MODEL).parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL)


def frames(path, fps, w, h):
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    p = subprocess.run(cmd, capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, h, w, 3)


def runs(flags, step, min_len):
    out, start = [], None
    for i, f in enumerate(list(flags) + [False]):
        if f and start is None: start = i
        if not f and start is not None:
            if (i - start) * step >= min_len: out.append((round(start * step, 2), round(i * step, 2)))
            start = None
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--plan"); ap.add_argument("--sheet")
    a = ap.parse_args(); bad = 0
    F = frames(a.video, 10, 270, 480); step = .1; n = len(F)
    gray = F.mean(axis=3)
    # face
    ensure_model()
    det = cv2.FaceDetectorYN.create(MODEL, "", (270, 480), .7)
    face = []
    for fr in F:
        _, d = det.detect(fr)
        face.append(d is not None and any(b[2] * b[3] >= .02 * 270 * 480 for b in d))
    if a.plan:
        plan = json.load(open(a.plan))["face"]
        want = [any(s <= i * step < e for s, e in plan) for i in range(n)]
        # allow 0.2 s at every boundary for transitions
        allow = json.load(open(a.plan)).get("allow", [])   # b-roll windows that show a real photo of someone else
        def near(i): return any(abs(i * step - x) <= .2 for s, e in plan for x in (s, e)) or any(s <= i * step < e for s, e in allow)
        extra = runs([f and not w and not near(i) for i, (f, w) in enumerate(zip(face, want))], step, .2)
        miss = runs([w and not f and not near(i) for i, (f, w) in enumerate(zip(face, want))], step, .3)
        ok = not extra and not miss; bad += not ok
        print(("PASS" if ok else "FAIL"), "face   ", f"on screen {sum(face) * step:.1f}s of {n * step:.1f}s;",
              "face in b-roll:", extra or "none", "| face missing:", miss or "none")
    else:
        print("INFO", "face   ", f"on screen {sum(face) * step:.1f}s of {n * step:.1f}s", runs(face, step, .3))
    # frozen: mean abs difference between consecutive 0.1 s samples
    diff = np.abs(np.diff(gray, axis=0)).mean(axis=(1, 2))
    frozen = runs(list(diff < .35), step, 1.0); bad += bool(frozen)
    print(("FAIL" if frozen else "PASS"), "frozen ", frozen or "none")
    std = gray.std(axis=(1, 2))
    dead = runs(list(std < 6), step, .05); bad += bool(dead)
    print(("FAIL" if dead else "PASS"), "dead   ", dead or "none")
    ok = std[0] >= 20; bad += not ok
    print(("PASS" if ok else "FAIL"), "first  ", f"frame 0 luma std {std[0]:.1f}")
    if a.sheet:
        S = frames(a.video, 3, 200, 356); cols = 11; rows = (len(S) + cols - 1) // cols
        im = Image.new("RGB", (cols * 200, rows * 356), "black"); dr = ImageDraw.Draw(im)
        for i, fr in enumerate(S):
            x, y = (i % cols) * 200, (i // cols) * 356
            im.paste(Image.fromarray(fr[:, :, ::-1]), (x, y))
            # Instagram safe zone (1080x1920): header y<250, caption/username y>1580, button rail x>940 & y>1100
            k = 200 / 1080
            for box in ((0, 0, 1080, 250), (0, 1580, 1080, 1920), (940, 1100, 1080, 1580)):
                dr.rectangle([x + box[0] * k, y + box[1] * k, x + box[2] * k - 1, y + box[3] * k - 1], outline=(255, 40, 40), width=1)
            dr.rectangle([x, y, x + 52, y + 18], fill="black"); dr.text((x + 3, y + 3), f"{(i + .5) / 3:.1f}s", fill="yellow")
        im.save(a.sheet, quality=82); print("SHEET  ", a.sheet)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
