#!/usr/bin/env bash
# Audio for Instagram/YouTube: MEASURE the take first, then do as little as possible.
# Instagram normalises every reel to about -14 LUFS anyway; what you control is headroom and noise.
#   bash tools/take/audio.sh measure <in.mp4>             → integrated LUFS, LRA, true peak
#   bash tools/take/audio.sh gentle  <in.mp4> <out.mp4>   → take already within ~2 dB of -14 LUFS: only a -1 dBFS peak ceiling
#   bash tools/take/audio.sh lift    <in.mp4> <out.mp4>   → quiet take: two-pass loudnorm to -14 LUFS, TP -1.5, then the ceiling
# Never put a compressor on a good take: it raises the room noise between words by ~10 dB and flattens the voice.
# After any change, measure again and compare the noise floor between words with the source, not just the LUFS number.
set -euo pipefail
cmd=$1; in=$2; out=${3:-}
measure() { ffmpeg -hide_banner -nostdin -i "$1" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:" | grep -E "I:|LRA:|Peak:"; }
case $cmd in
  measure) measure "$in" ;;
  gentle)
    ffmpeg -hide_banner -v error -nostdin -i "$in" -map 0:v -map 0:a -c:v copy \
      -af "alimiter=limit=0.891:attack=5:release=60:level=0,aresample=48000" \
      -c:a aac -b:a 256k -ar 48000 -movflags +faststart -y "$out"
    measure "$out" ;;
  lift)
    j=$(ffmpeg -hide_banner -nostdin -i "$in" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
    g() { echo "$j" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
    ffmpeg -hide_banner -v error -nostdin -i "$in" -map 0:v -map 0:a -c:v copy \
      -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.891:attack=5:release=60:level=0,aresample=48000" \
      -c:a aac -b:a 256k -ar 48000 -movflags +faststart -y "$out"
    measure "$out" ;;
  *) echo "usage: audio.sh measure|gentle|lift <in> [out]"; exit 2 ;;
esac
