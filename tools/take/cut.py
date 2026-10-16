#!/usr/bin/env python3
"""Cut the pauses of a take (silencedetect -38dB/0.35s, keep 0.12 s each side), snap to frames, retime its SRT.
   python3 tools/take/cut.py <take.MP4> <take.srt> <outdir> [--drop 77.0-78.25 ...]
Writes <outdir>/face-cut.mp4 (1080x1920, 30 fps, AAC 48k), face-cut.srt (retimed; cues inside a --drop span are removed)
and cuts.txt (kept source spans). Prints every jump cut in cut-time: each must end up under b-roll or on a FACE/B-ROLL edge.
The defaults keep a natural pace. Only --drop real retakes; never tighten --min/--pad to hit a length: quality beats length."""
import re, subprocess, sys
from pathlib import Path
import argparse
ap = argparse.ArgumentParser(); ap.add_argument("take"); ap.add_argument("srt"); ap.add_argument("out")
ap.add_argument("--min", type=float, default=.35, help="shortest pause to cut (s)"); ap.add_argument("--pad", type=float, default=.12, help="kept each side (s)")
ap.add_argument("--drop", action="append", default=[], help="source span a-b to remove (a retake)")
A = ap.parse_args(); take, srt, out = A.take, A.srt, Path(A.out)
FPS = 30
log = subprocess.run(["ffmpeg", "-nostats", "-i", take, "-vn", "-af", f"silencedetect=noise=-38dB:d={A.min}", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", take],
                           capture_output=True, text=True).stdout)
def ts(s): h, m, r = s.split(":"); sec, ms = r.split(","); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
cues = re.findall(r"(\d+)\n(\d\d:\d\d:\d\d,\d+) --> (\d\d:\d\d:\d\d,\d+)\n(.+?)(?:\n\n|\n*$)", Path(srt).read_text(encoding="utf-8"), re.S)
first, last = ts(cues[0][1]), ts(cues[-1][2])
snap = lambda t: round(t * FPS) / FPS
keep, cur = [], snap(max(0, first - .12))
for s, e in zip(st, en):
    if e <= first or s >= last: continue
    keep.append((cur, snap(s + A.pad))); cur = snap(e - A.pad)
keep.append((cur, snap(min(dur, last + .15))))
for d in A.drop:   # cut a retake out of the kept segments
    a, b = (float(x) for x in d.split("-")); nk = []
    for x, y in keep:
        if y <= a or x >= b: nk.append((x, y)); continue
        if x < a: nk.append((x, snap(a)))
        if y > b: nk.append((snap(b), y))
    keep = [k for k in nk if k[1] - k[0] > .05]
print("segments", len(keep), "kept", round(sum(b - a for a, b in keep), 3), "of", round(dur, 3))
fc = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:flags=lanczos[v{i}];"
             f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[a{i}];" for i, (a, b) in enumerate(keep))
fc += "".join(f"[v{i}][a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[v][a]"
out.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", take, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                str(out / "face-cut.mp4")], check=True)
def remap(t):
    acc = 0
    for a, b in keep:
        if t < a: return acc
        if t <= b: return acc + (t - a)
        acc += b - a
    return acc
fmt = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
kept = [(a, b, txt) for _, a, b, txt in cues if remap(ts(b)) - remap(ts(a)) > .02]   # a cue inside a dropped retake collapses to 0
lines = [f"{i}\n{fmt(remap(ts(a)))} --> {fmt(remap(ts(b)))}\n{txt.strip()}\n" for i, (a, b, txt) in enumerate(kept, 1)]
(out / "face-cut.srt").write_text("\n".join(lines), encoding="utf-8")
(out / "cuts.txt").write_text("\n".join(f"{a:.3f} {b:.3f}" for a, b in keep), encoding="utf-8")
acc = 0
for a, b in keep[:-1]:
    acc += b - a; print(f"jump cut at {acc:.3f}s (source {b:.3f})")
