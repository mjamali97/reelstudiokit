#!/usr/bin/env python3
"""Cut the reel from the original clips by an edit list: the chosen take of every line, punch-ins, a clean 30 fps file.

    tools/py tools/take/assemble.py <project>

Reads <project>/sources.json (tools/take/intake.py) and <project>/edl.json:
  [{"id": "hook", "clip": "c2", "in": 12.66, "out": 15.72, "line": "…"},
   {"id": "why",  "clip": "c1", "in": 3.10,  "out": 7.40,  "zoom": 1.5, "cx": 0.5, "cy": 0.42}]
  line      what is said (optional: left out, it is taken from words_<clip>.json; proofread assets/aroll.srt either way)
  in/out    seconds in the original; start ~0.06 s before the first word, end where the silence after the last word starts
  zoom      >1 punches in (crop from the original: sharp up to ~1.9x on a 4K clip, ~1.3x on 1080p); cx, cy = the crop
            centre as fractions of the frame (cy ~0.4 keeps the face in the upper third)
Writes <project>/assets/aroll.mp4 (1080x1920, constant 30 fps from frame 0, AAC 48 kHz), assets/aroll.srt (one cue per
segment with its "line", for new_reel.py) and segments.json: each segment's
first frame in the cut and its length in frames, which every overlay and every cut check uses. Each segment's audio gets
an 8 ms fade at both ends, so joins never click. Landscape or 4:5 sources are centre-cropped to 9:16 first.
Constant frame rate matters: a variable one makes a later background removal (cutout.py) drift off the speaker.
"""
import json, subprocess, sys
from pathlib import Path

FPS, W, H = 30, 1080, 1920
proj = Path(sys.argv[1]).expanduser().resolve()
src = json.loads((proj / "sources.json").read_text(encoding="utf-8"))
edl = json.loads((proj / "edl.json").read_text(encoding="utf-8"))
(proj / "assets").mkdir(exist_ok=True)

def size(f):
    w, h, rot = (subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation",
                                 "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip().replace("\n", ",").split(",") + ["0"])[:3]
    w, h = int(w), int(h)
    return (h, w) if rot.strip().lstrip("-") in ("90", "270") else (w, h)   # phone clips are often stored sideways with a rotation flag

parts, segs, frame = [], [], 0
for i, s in enumerate(edl):
    f = src[s["clip"]]; sw, sh = size(f)
    n = max(1, round((s["out"] - s["in"]) * FPS)); dur = n / FPS     # whole frames, so every later timing is exact
    # the largest 9:16 window of the source, shrunk by zoom, centred on (cx, cy) and kept inside the frame
    bw, bh = (sh * 9 / 16, sh) if sw / sh > 9 / 16 else (sw, sw * 16 / 9)
    z = max(1.0, float(s.get("zoom", 1))); cw, ch = int(bw / z) // 2 * 2, int(bh / z) // 2 * 2
    x = min(max(0, s.get("cx", .5) * sw - cw / 2), sw - cw); y = min(max(0, s.get("cy", .5) * sh - ch / 2), sh - ch)
    if (cw < W * .95 or ch < H * .95) and z > 1:
        sharp = round(min(bw / W, bh / H) * 1.05, 2)
        print(f"note: '{s['id']}' punch-in {z}x upscales a {sw}x{sh} source (crop {cw}x{ch}); "
              + (f"keep it under {sharp}x for full sharpness" if sharp > 1 else "its 9:16 area is already under 1080x1920, so any punch-in softens it"))
    out = proj / "work" / f"seg_{i:02d}.mp4"; out.parent.mkdir(exist_ok=True)
    # tpad repeats the last frame if the clip ends a frame early, so every segment has exactly n frames
    vf = f"setpts=PTS-STARTPTS,crop={cw}:{ch}:{int(x)}:{int(y)},scale={W}:{H}:flags=lanczos,fps={FPS},setsar=1,tpad=stop_mode=clone:stop_duration=0.5"
    af = f"asetpts=PTS-STARTPTS,aresample=48000,apad=whole_dur={dur:.4f},atrim=0:{dur:.4f},afade=t=in:d=0.008,afade=t=out:st={dur - 0.008:.3f}:d=0.008"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s['in']:.3f}", "-i", f, "-t", f"{dur + 0.5:.4f}", "-vf", vf, "-af", af,
                    "-frames:v", str(n), "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p",
                    "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", out.with_suffix(".mov")], check=True)
    parts.append(out.with_suffix(".mov"))
    line = s.get("line", "")
    wf = proj / f"words_{s['clip']}.json"   # no line in the EDL: the words intake.py heard inside in/out (proofread the SRT after)
    if not line and wf.exists():
        line = " ".join(w["t"] for w in json.loads(wf.read_text(encoding="utf-8")) if s["in"] - .05 <= w["s"] < s["out"])
    segs.append({"id": s["id"], "clip": s["clip"], "frame": frame, "frames": n, "start": round(frame / FPS, 3), "line": line})
    frame += n
lst = proj / "work" / "segments.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
# one re-encode with timestamps rebuilt from the frame count: no start offset, no gaps, constant 30 fps
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", f"setpts=N/{FPS}/TB", "-fps_mode", "cfr", "-r", str(FPS),
                "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                "-movflags", "+faststart", proj / "assets" / "aroll.mp4"], check=True)
got = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0",
                      proj / "assets" / "aroll.mp4"], capture_output=True, text=True).stdout.strip()
(proj / "segments.json").write_text(json.dumps(segs, ensure_ascii=False, indent=1), encoding="utf-8")
# one cue per segment with its line: the SRT new_reel.py aligns the words to
ts = lambda f: f"{int(f / FPS // 3600):02d}:{int(f / FPS % 3600 // 60):02d}:{int(f / FPS % 60):02d},{round(f / FPS % 1 * 1000) % 1000:03d}"
(proj / "assets" / "aroll.srt").write_text("".join(f"{i + 1}\n{ts(s['frame'])} --> {ts(s['frame'] + s['frames'])}\n{s['line']}\n\n"
                                                   for i, s in enumerate(segs) if s["line"].strip()), encoding="utf-8")
print(f"aroll.mp4: {len(segs)} segments, {frame} frames ({frame / FPS:.2f}s), file has {got} frames {'OK' if str(frame) == got else 'MISMATCH'}")
for s in segs: print(f"  {s['id']:12} {s['clip']}  from {s['start']:6.2f}s  {s['frames']:4d} frames  {s['line'][:50]}")
