#!/usr/bin/env bash
# Audio for Instagram/YouTube: measure first, then do as little as possible. The work is in audio.py (same on Windows).
#   bash tools/take/audio.sh measure <in.mp4>  |  gentle <in.mp4> <out.mp4>  |  lift <in.mp4> <out.mp4>
D=$(cd "$(dirname "$0")" && pwd)
exec "$D/../py" "$D/audio.py" "$@"
