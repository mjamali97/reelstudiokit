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
python3 tools/take/cut.py reels/<slug>/take/take.mov reels/<slug>/take/take.srt reels/<slug>/take [--drop 77.0-78.25]
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
