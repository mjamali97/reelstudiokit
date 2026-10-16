#!/usr/bin/env python3
"""Intake for a reel filmed as several raw clips (a line repeated until it lands, different angles, a 4K phone).

    tools/py tools/take/intake.py <project> <clip or folder>... [--newest 5] [--lang en] [--names "Sweet Corner, Pistachio Crown"]

For each clip (oldest first) it writes into <project>:
  sources.json          {"c1": "/abs/path/IMG_0412.MOV", ...}   the originals are only read, never changed
  work/sheet_cN.jpg     8 frames across the clip; work/sheets.jpg stacks every clip (angles, framing, light)
  words_cN.json         word timings (WhisperX; --names are passed as hotwords so brand and product names come out right)
  transcript.md         per clip: the spoken lines with times, the speech regions (silencedetect), and REPEATS:
                        lines said more than once across the clips, with the last full take marked (usually the best)
Next: pick the takes into <project>/edl.json (playbook/TAKE.md), then tools/take/assemble.py.
Needs ffmpeg and WhisperX (`uv tool install whisperx`, or set WHISPERX=/path/to/whisperx). Pillow for the sheets.
"""
import argparse, difflib, json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

VIDEO = (".mp4", ".mov", ".m4v", ".mkv")
ap = argparse.ArgumentParser()
ap.add_argument("project"); ap.add_argument("inputs", nargs="+")
ap.add_argument("--newest", type=int, default=0, help="only the N newest video files of a folder")
ap.add_argument("--lang", default="en"); ap.add_argument("--names", default="", help="brand, product and people names to hear right")
ap.add_argument("--model", default=None, help="WhisperX model (default: small; large-v3 for Persian and Arabic, where small mishears)")
A = ap.parse_args()
A.model = A.model or ("large-v3" if A.lang in ("fa", "ar") else "small")
proj = Path(A.project).expanduser().resolve(); (proj / "work").mkdir(parents=True, exist_ok=True)
WX = os.environ.get("WHISPERX") or shutil.which("whisperx") or str(Path.home() / ".local/bin/whisperx")

files = []
for i in A.inputs:
    p = Path(i).expanduser()
    if p.is_dir():
        vids = sorted((f for f in p.iterdir() if f.suffix.lower() in VIDEO), key=lambda f: f.stat().st_mtime)
        files += vids[-A.newest:] if A.newest else vids
    elif p.suffix.lower() in VIDEO: files.append(p)
files = sorted({f.resolve() for f in files}, key=lambda f: f.stat().st_mtime)
if not files: sys.exit("no video files found")
src = {f"c{i + 1}": str(f) for i, f in enumerate(files)}
(proj / "sources.json").write_text(json.dumps(src, indent=1))

def probe(f):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
                                   "-of", "json", f], capture_output=True, text=True).stdout)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    return float(j["format"]["duration"]), v["width"], v["height"], v.get("r_frame_rate", "30/1")

def speech(f, dur):
    log = subprocess.run(["ffmpeg", "-nostats", "-i", f, "-vn", "-af", "silencedetect=noise=-38dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    regions, cur = [], 0.0
    for s, e in zip(st, en + [dur] * (len(st) - len(en))):
        if s - cur > 0.15: regions.append((round(cur, 2), round(s, 2)))
        cur = e
    if dur - cur > 0.15: regions.append((round(cur, 2), round(dur, 2)))
    return regions

def sheet(f, dur, out):
    from PIL import Image, ImageDraw
    tmp = Path(tempfile.mkdtemp()); ims = []
    for k in range(8):
        t = dur * (k + .5) / 8; p = tmp / f"{k}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", f, "-frames:v", "1", "-vf", "scale=180:-2", p], check=True)
        im = Image.open(p).convert("RGB"); ImageDraw.Draw(im).text((6, 6), f"{t:.1f}s", fill="yellow"); ims.append(im)
    w, h = ims[0].size; S = Image.new("RGB", (w * 8 + 70, h), "black"); ImageDraw.Draw(S).text((8, h // 2), out.stem.split("_")[-1], fill="white")
    for k, im in enumerate(ims): S.paste(im, (70 + k * w, 0))
    S.save(out, quality=80); shutil.rmtree(tmp); return S

def transcribe(f, cid):
    out = proj / "work" / f"wx_{cid}"; out.mkdir(exist_ok=True)
    cmd = [WX, f, "--model", A.model, "--language", A.lang, "--output_format", "json", "--output_dir", str(out), "--compute_type", "int8", "--device", "cpu"]
    if A.names: cmd += ["--hotwords", A.names, "--initial_prompt", f"Names in this video: {A.names}."]
    r = subprocess.run(cmd, capture_output=True, text=True)
    js = next(out.glob("*.json"), None)
    if r.returncode or not js: sys.exit(f"WhisperX failed on {f}:\n{r.stderr[-800:]}")
    segs = json.loads(js.read_text())["segments"]
    words = [{"t": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)} for s in segs for w in s.get("words", []) if "start" in w]
    lines = [{"text": s["text"].strip(), "s": round(s["start"], 2), "e": round(s["end"], 2)} for s in segs]
    return words, lines

norm = lambda t: re.sub(r"[^\w\s]", "", t.lower()).strip()
sheets, report, all_lines = [], [], []
for cid, f in src.items():
    dur, w, h, fr = probe(f)
    print(f"{cid}: {Path(f).name}  {w}x{h}  {dur:.1f}s  {fr} fps", flush=True)
    sheets.append(sheet(f, dur, proj / "work" / f"sheet_{cid}.jpg"))
    words, lines = transcribe(f, cid)
    (proj / f"words_{cid}.json").write_text(json.dumps(words, ensure_ascii=False, indent=0))
    regions = speech(f, dur)
    report.append(f"## {cid} · {Path(f).name} · {w}x{h} · {dur:.1f}s{'  (4K: punch-ins stay sharp up to ~1.9x)' if min(w, h) >= 2000 else ''}\n")
    report += [f"- {l['s']:7.2f}–{l['e']:7.2f}  {l['text']}" for l in lines]
    report.append("\nspeech: " + "  ".join(f"{a}–{b}" for a, b in regions) + "\n")
    all_lines += [{**l, "clip": cid} for l in lines]
# repeated lines across all clips: the same sentence said again is a retake; the last full one is usually the keeper
groups = []
for l in all_lines:
    g = next((g for g in groups if difflib.SequenceMatcher(None, norm(g[0]["text"]), norm(l["text"])).ratio() > .72), None)
    (g.append(l) if g else groups.append([l]))
rep = [g for g in groups if len(g) > 1]
report.append("## Repeats (retakes of the same line)\n" + ("\n".join(
    "- " + " | ".join(f"{x['clip']} {x['s']:.2f}–{x['e']:.2f}{' ← last' if x is g[-1] else ''}" for x in g) + f"\n  «{g[-1]['text']}»" for g in rep) or "- none"))
(proj / "transcript.md").write_text("# Transcript\n\n" + "\n".join(report) + "\n")
from PIL import Image
W = max(s.width for s in sheets); S = Image.new("RGB", (W, sum(s.height for s in sheets)), "black"); y = 0
for s in sheets: S.paste(s, (0, y)); y += s.height
S.save(proj / "work" / "sheets.jpg", quality=80)
print(f"→ {proj}/transcript.md ({len(all_lines)} lines, {len(rep)} repeated), work/sheets.jpg, words_c*.json")
