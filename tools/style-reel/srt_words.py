#!/usr/bin/env python3
"""The speaker's own SRT as the transcript: words.raw.json without any ASR.

    python srt_words.py <media> <subs.srt> <out.json> [--lang fa]

Run it with a Python that has whisperx (only its forced aligner is used, no
transcription, no API). Each SRT cue's text is aligned to the audio inside the
cue's own time range, so the words are the speaker's text and the times come
from the audio. A word the aligner cannot place (Latin words in a Persian take,
digits) gets a time shared out evenly between its placed neighbours.

Output is the Transcription shape in docs/CONTRACTS.md.
"""
import argparse
import json
import re
import sys
from pathlib import Path


def parse_srt(path):
    cues = []
    for block in re.split(r"\n\s*\n", Path(path).read_text(encoding="utf-8-sig").strip()):
        lines = block.strip().splitlines()
        m = next((re.match(r"(\S+)\s*-->\s*(\S+)", l) for l in lines if "-->" in l), None)
        if not m:
            continue
        i = next(i for i, l in enumerate(lines) if "-->" in l)
        text = " ".join(l.strip() for l in lines[i + 1:] if l.strip())
        cues.append({"start": ts(m.group(1)), "end": ts(m.group(2)), "text": text})
    return cues


def ts(s):
    h, m, rest = s.replace(",", ".").split(":")
    return int(h) * 3600 + int(m) * 60 + float(rest)


def fill(words, start, end):
    """Give unplaced words times between their placed neighbours."""
    i = 0
    while i < len(words):
        if "start" in words[i]:
            i += 1
            continue
        j = i
        while j < len(words) and "start" not in words[j]:
            j += 1
        a = words[i - 1]["end"] if i else start
        b = words[j]["start"] if j < len(words) else end
        step = max(b - a, 0.06 * (j - i)) / (j - i)
        for k in range(i, j):
            words[k]["start"] = round(a + step * (k - i), 3)
            words[k]["end"] = round(a + step * (k - i + 1), 3)
        i = j
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("media")
    ap.add_argument("srt")
    ap.add_argument("out")
    ap.add_argument("--lang", default="fa")
    a = ap.parse_args()

    import whisperx
    cues = parse_srt(a.srt)
    audio = whisperx.load_audio(a.media)
    model, meta = whisperx.load_align_model(language_code=a.lang, device="cpu")
    res = whisperx.align([dict(c) for c in cues], model, meta, audio, "cpu")

    out = []
    for cue, seg in zip(cues, res["segments"]):
        ws = [{"text": w["word"], **({"start": round(w["start"], 3), "end": round(w["end"], 3)}
                                     if "start" in w else {})} for w in seg.get("words", [])]
        if [w["text"] for w in ws] != cue["text"].split():
            print(f"warn: cue at {cue['start']:.2f} came back re-split", file=sys.stderr)
        for w in fill(ws, cue["start"], cue["end"]):
            if out and w["start"] - out[-1]["end"] > 0.001:
                out.append({"text": " ", "start": out[-1]["end"], "end": w["start"], "type": "spacing"})
            out.append({"text": w["text"], "start": w["start"], "end": w["end"], "type": "word"})

    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{sum(w['type'] == 'word' for w in out)} words from {len(cues)} cues -> {a.out}")


if __name__ == "__main__":
    main()
