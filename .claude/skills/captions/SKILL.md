---
name: captions
description: Burn subtitles into a finished vertical video in the brand font, inside Instagram's safe zone, from an SRT, the kit's words.json or WhisperX output; styles pill, outline, brand colours or word-by-word highlight; right-to-left for Persian and Arabic; optional proofreading. Use when they type /captions, ask for subtitles, «زیرنویس», «کپشن روی ویدیو», "Untertitel", "sous-titres", "sottotitoli", "altyazı".
---

# /captions · subtitles on the video

1. **Words**: their own SRT (best: their exact words) or a transcript. No SRT: `whisperx <video> --language <lang>
   --output_format all` (or `--output_format srt`), or align their script/SRT to the audio with
   `tools/style-reel/srt_words.py` for word timings. Read the transcript once: names of products, prices, the brand name.
2. **Style** from `brand/formats/captions.json` if saved, else ask once (pill · outline · brand · word-by-word).
3. **Burn**: `node tools/render/captions.mjs <video> <srt|words.json> <out.mp4> --style <s> --lang <lang>` (`--proof` with
   GEMINI_API_KEY in the environment fixes spelling and mishearings without rewriting). The cue texts are saved as
   `<out>.cues.json`: fix a word there and run again.
4. **Check**: extract three frames (`ffmpeg -ss <t> -i out.mp4 -frames:v 1 f.png`) at a long line, a Latin word inside RTL text,
   and the last cue; the block sits under the chin, above Instagram's caption area (bottom edge y ≈ 1580), never over the
   face; then watch it once at full speed. Audio is copied untouched.
