#!/usr/bin/env python3
"""Start a styled motion reel from your take: copy the template, cut the face clip, word-align your SRT.

    python3 tools/style-reel/new_reel.py --take <face-cut.mov> --srt <take.srt> --out reels/<slug>/motion \
        [--start 0] [--dur 30] [--style swiss] [--lang fa]

--take   your take with the pauses already cut (playbook/TAKE.md), and --srt timed to that file.
--style  any style in tools/style-reel/styles/ (vogue, vox, swiss, hud, doodle, clean, neon, retro, brutal, luxe, pop,
         chalk, receipt): the default the render uses; any can still be rendered. `--help` lists the ones installed.
--lang   language of the take for the aligner (fa, en, de…); the Persian proofreading runs only for fa.

Writes <out>/assets/face.mp4, <out>/assets/words.js (your SRT words on the audio, no ASR; Persian proofread) and
prints the word table to plan the beats on. Then follow playbook/STYLE-REEL.md.
"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
# every style module in styles/ is a valid --style (check.mjs keeps them registered in index.html and as a skill)
STYLES = sorted(p.stem for p in (HERE / "styles").glob("*.js"))
# the Python that has whisperx (`uv tool install whisperx` puts it here); override with WHISPERX_PY=/path/to/python
import os
WHISPERX_PY = Path(os.environ.get("WHISPERX_PY", Path.home() / ".local/share/uv/tools/whisperx/bin/python"))
Z = "‌"
STEMS = ("کن|شو|خواه|ده|دون|تون|گیر|رو|ساز|نویس|گ|گوی|بین|دان|رس|زن|خور|مون|کش|فرست|خون|پرس|یار|آر|بر|دار|ذار|گذار|"
         "یاب|پذیر|ترس|خند|گرد|افت|اندیش|خوا|شه|ره|زنه|بینه|سازه|کنه|دونه|خوای|خوام|بینی|سازی|کنی")
FIXES = {"دقیقا": "دقیقاً", "اصلا": "اصلاً", "حتما": "حتماً", "واقعا": "واقعاً", "تقریبا": "تقریباً", "معمولا": "معمولاً", "فعلا": "فعلاً"}
FA_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def proof(t):
    core = t.rstrip(".,،!؟?")
    tail = t[len(core):]
    core = FIXES.get(core, core)
    core = re.sub(rf"^(ن?می)(?=(?:{STEMS}))", rf"\1{Z}", core) if Z not in core else core
    if re.fullmatch(r"\d+", core):
        core = core.translate(FA_DIGITS)
    return core + tail


def main():
    ap = argparse.ArgumentParser(description="Start a styled motion reel from your take (playbook/STYLE-REEL.md).")
    ap.add_argument("--take", required=True); ap.add_argument("--srt", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--start", type=float, default=0.0); ap.add_argument("--dur", type=float, default=30.0)
    ap.add_argument("--style", default="swiss", choices=STYLES, metavar="STYLE",
                    help="the style the render uses by default: " + ", ".join(STYLES) + " (default: swiss)")
    ap.add_argument("--lang", default="fa")
    a = ap.parse_args()
    out = Path(a.out)
    if out.exists() and any(out.iterdir()):
        sys.exit(f"{out} is not empty; pick a new folder (nothing is overwritten).")
    shutil.copytree(HERE, out, ignore=shutil.ignore_patterns("new_reel.py", "make_assets.py", "make_demo.py", "reference", "__pycache__", "renders", "qa", "node_modules"), dirs_exist_ok=True)
    (out / "renders").mkdir(exist_ok=True); (out / "qa").mkdir(exist_ok=True)

    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(a.start), "-i", a.take, "-t", str(a.dur),
                    "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k",
                    str(out / "assets/face.mp4")], check=True)

    raw = out / "qa/words.raw.json"
    if not WHISPERX_PY.exists():
        sys.exit(f"whisperx Python not found at {WHISPERX_PY}: run `uv tool install whisperx` or set WHISPERX_PY")
    subprocess.run([str(WHISPERX_PY), str(HERE / "srt_words.py"), a.take, a.srt, str(raw), "--lang", a.lang], check=True,
                   stderr=subprocess.DEVNULL)
    words = [w for w in json.loads(raw.read_text()) if w["type"] == "word" and a.start <= w["start"] < a.start + a.dur]
    out_w = [{"t": proof(w["text"]) if a.lang == "fa" else w["text"], "s": round(w["start"] - a.start, 3), "e": round(w["end"] - a.start, 3)} for w in words]
    (out / "assets/words.js").write_text("window.WORDS=" + json.dumps(out_w, ensure_ascii=False) + ";")

    html = (out / "index.html").read_text()
    html = re.sub(r'"default":"[a-z]+"', f'"default":"{a.style}"', html, count=1)
    html = html.replace('data-duration="30"', f'data-duration="{a.dur:g}"')
    (out / "index.html").write_text(html)

    print(f"{len(out_w)} words -> {out}/assets/words.js   (style default: {a.style}, {a.dur:g} s)\n")
    for w in out_w:
        print(f"{w['s']:7.2f}  {w['t']}")
    print("\nNext: playbook/STYLE-REEL.md step 4 (beats), then edit index.html T/FACE/cues and styles/<style>.js scenes.")


if __name__ == "__main__":
    main()
