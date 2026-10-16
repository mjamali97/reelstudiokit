#!/usr/bin/env python3
"""Cut the speaker out of the background: <project>/assets/subject.webm (VP9 with alpha), for words BEHIND the head.

    tools/py tools/take/cutout.py <project> [--device auto|cpu|coreml|cuda] [--quality balanced|best]

Runs HyperFrames' local background removal (no upload, no account) on assets/aroll.mp4 (tools/take/assemble.py), then
checks that the cutout has exactly as many frames as aroll.mp4: one frame more or less and the cutout slides off the
speaker by the end of the reel. Speed: a few seconds per second of video on Apple Silicon, slower on a CPU; the first run
downloads the segmentation model once. One cutout at a time (it needs about 1.5 GB of memory).
"""
import argparse, shutil, subprocess, sys, time
from pathlib import Path

ap = argparse.ArgumentParser(); ap.add_argument("project")
ap.add_argument("--device", default="auto"); ap.add_argument("--quality", default="balanced")
A = ap.parse_args()
proj = Path(A.project).expanduser().resolve(); src, out = proj / "assets" / "aroll.mp4", proj / "assets" / "subject.webm"
if not src.exists(): sys.exit("no assets/aroll.mp4: run tools/take/assemble.py first")
frames = lambda f, extra=(): subprocess.run(["ffprobe", "-v", "error", *extra, "-count_frames", "-select_streams", "v:0", "-show_entries",
                                             "stream=nb_read_frames", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout.strip().split(",")[0]
t0 = time.time()
NPX = shutil.which("npx") or "npx"   # npx.cmd on Windows, which subprocess does not find by the bare name
r = subprocess.run([NPX, "--yes", "hyperframes@0.8.46", "remove-background", str(src), "-o", str(out), "--device", A.device, "--quality", A.quality],
                   capture_output=True, text=True)
if r.returncode or not out.exists(): sys.exit(f"remove-background failed:\n{(r.stderr or r.stdout)[-1200:]}")
a, b = frames(src), frames(out, ("-c:v", "libvpx-vp9"))
print(f"subject.webm in {time.time() - t0:.0f}s · frames: aroll {a}, cutout {b} · {'OK' if a == b else 'MISMATCH: re-run assemble.py, then this'}")
sys.exit(0 if a == b else 1)
