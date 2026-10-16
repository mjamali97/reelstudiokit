#!/usr/bin/env python3
"""Audio for Instagram/YouTube: MEASURE the take first, then do as little as possible. Same on macOS, Linux and Windows.

    tools/py tools/take/audio.py measure <in.mp4>             → integrated LUFS, LRA, true peak
    tools/py tools/take/audio.py gentle  <in.mp4> <out.mp4>   → take already within ~2 dB of -14 LUFS: only a -1 dBFS peak ceiling
    tools/py tools/take/audio.py lift    <in.mp4> <out.mp4>   → quiet take: two-pass loudnorm to -14 LUFS, TP -1.5, then the ceiling

Instagram normalises every reel to about -14 LUFS anyway; what you control is headroom and noise. Never put a compressor on
a good take: it raises the room noise between words by ~10 dB and flattens the voice. After any change, measure again and
compare the noise floor between words with the source, not just the LUFS number. (bash tools/take/audio.sh … runs this.)
"""
import json, re, subprocess, sys

CEIL = "alimiter=limit=0.891:attack=5:release=60:level=0,aresample=48000"
ENC = ["-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-y"]


def ff(*a):   # ffmpeg's report goes to stderr
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", *a], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr


def measure(f):
    summary = ff("-i", f, "-af", "ebur128=peak=true", "-f", "null", "-").split("Summary:")[-1]
    for line in summary.splitlines():
        if re.search(r"\b(I|LRA|Peak):", line): print(line.rstrip())


def render(src, out, af):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-nostdin", "-i", src, "-map", "0:v", "-map", "0:a", "-c:v", "copy", "-af", af, *ENC, out])
    if r.returncode: sys.exit(r.returncode)


if len(sys.argv) < 3 or sys.argv[1] not in ("measure", "gentle", "lift") or (sys.argv[1] != "measure" and len(sys.argv) < 4):
    sys.exit("usage: audio.py measure|gentle|lift <in> [out]")
cmd, src = sys.argv[1], sys.argv[2]
if cmd == "measure":
    measure(src)
elif cmd == "gentle":
    render(src, sys.argv[3], CEIL); measure(sys.argv[3])
else:
    rep = ff("-i", src, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-")
    m = json.loads(rep[rep.rindex("{"):rep.rindex("}") + 1])
    render(src, sys.argv[3], f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
                             f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,{CEIL}")
    measure(sys.argv[3])
