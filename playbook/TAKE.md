# The take · record, cut, SRT, audio

## Record (the creator)
- Vertical 9:16, full frame, lens at eye level, their own words (the script is a guide, not a teleprompter).
- Clean sound: a clip-on mic or the phone close, no music bed, no echoing room.
- Export an SRT with the take (CapCut, the Edits app, or any captioning app; or WhisperX). The SRT is the timing reference
  and the spelling reference for the words.
- Batch filming: note the outfit of each take (it matters for scheduling, `PUBLISH.md`).
- Folder: `reels/<slug>/take/` (git-ignored media).

## Cut the pauses and retime the SRT
```bash
tools/py tools/take/cut.py reels/<slug>/take/take.mov reels/<slug>/take/take.srt reels/<slug>/take [--drop 77.0-78.25]
```
silencedetect −38 dB / 0.35 s, 0.12 s kept each side, whole frames at 30 fps. Writes `face-cut.mp4`, `face-cut.srt`
(retimed) and `cuts.txt`, and prints every jump cut in cut time: each must end up under b-roll or on a FACE/B-ROLL edge.
`--drop` only real retakes; never tighten the pause settings to hit a length.

- Takes from editing apps arrive with their own cuts: detect them as frame-difference spikes and put each one under b-roll.
- **They may say something different from the written script.** Map b-roll to the words they actually said (the aligned
  SRT), never to the script.
- WhisperX can fail to align a stretch: use the SRT times there.
- Every timeline is in integer frames. Decimal-second overlays drop one or two frames at each switch (face flashes).

## Audio · measure first, then do as little as possible
```bash
bash tools/take/audio.sh measure reels/<slug>/take/face-cut.mp4
```
- Instagram normalises reels to about −14 LUFS whatever you upload, and adds no limiter of its own: a quiet upload gets
  boosted and can clip.
- Within ~2 dB of −14 LUFS: `audio.sh gentle` only (a −1 dBFS peak ceiling). No EQ, no compressor, no gain.
- A quiet take: `audio.sh lift` (two-pass loudnorm to −14 LUFS, true peak −1.5, then the ceiling).
- Never a compressor on a good take: it raised the room noise between words by 11 dB once, and the creator heard it at once.
- After any change compare the noise floor between words with the source, not only the LUFS number.
- Apply the audio pass to the final render (the motion render carries the take's audio plus the cues).

## Several clips · pick the takes, cut by an edit list
For a reel filmed as many raw clips (a line repeated until it lands, two angles, a 4K phone). The originals are only read.
```bash
tools/py tools/take/intake.py reels/<slug>/take <clips or folder> [--newest 5] --lang fa --names "Brand, Product"
```
- Look at `work/sheets.jpg` (angles, framing, light) and read `transcript.md`: every line with times, and REPEATS (a line
  said more than once, the last full take marked; usually the best, check it).
- Write `reels/<slug>/take/edl.json`, one entry per kept line, in reel order:
  `{"id": "hook", "clip": "c2", "in": 12.66, "out": 15.72, "zoom": 1.3, "cx": 0.5, "cy": 0.4}`.
  `in` ~0.06 s before the first word, `out` where the silence after the last word starts (never on a word: `stumbles.py`
  logic applies). `zoom` > 1 punches in; vary it between neighbouring segments from the same angle so a cut never looks
  like a jump. `line` is optional (taken from the clip's words).
```bash
tools/py tools/take/assemble.py reels/<slug>/take       # assets/aroll.mp4 (CFR 30, 1080x1920), aroll.srt, segments.json
tools/py tools/take/cutout.py   reels/<slug>/take       # assets/subject.webm: the speaker cut out (local, no upload)
tools/py tools/take/headpos.py reels/<slug>/take   # assets/headpos.js: head top, chin, MOVES per segment
```
- `assemble.py` prints `OK` only when the file has exactly the planned frames. A mismatch breaks every overlay: fix it first.
- Proofread `assets/aroll.srt` (the words the ASR heard, `PERSIAN.md`), then start the edit from `aroll.mp4` + `aroll.srt`
  with `new_reel.py` (`STYLE-REEL.md` step 3); it copies `subject.webm` and `headpos.js` along (the `/depth` style needs both).
- `cutout.py` and `headpos.py` only when the style puts words behind the speaker (`/depth`). A busy background or a head
  that moves a lot (headpos says `MOVES`) → words in front for that segment.
- After the render: `tools/py tools/take/check_cuts.py reels/<slug>/take <render.mp4> --phone`: the frame before and after
  every cut, side by side (`work/cut_check.jpg`), and a 720p copy to watch on a phone before anyone else sees it.
- The grade: `index.html`'s `grade` variable (`auto` = the style's own, or `natural`, `warm`, `editorial`, `bright`); preview
  with `stills.mjs <style> --grade warm`. Grade the face and the cutout together, never one of them.
