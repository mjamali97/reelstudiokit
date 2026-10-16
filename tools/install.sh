#!/usr/bin/env bash
# install.sh · every tool the studio uses, in one place, pinned. Safe to run again (it skips what is there).
#
#   bash tools/install.sh            # core: checks + render/captions/brand tools (incl. the Python tools) + the bot's packages
#   bash tools/install.sh video      # + HyperFrames engine check, WhisperX, persian-motion-director
#   bash tools/install.sh all        # + HyperFrames skills and the NextWork AI video editor plugin for Claude Code
#   bash tools/install.sh check      # only report what is installed (pieces of a higher level are listed, not counted
#                                    # as missing: `check video` or `check all` to require them)
#
# What each piece is and its licence: tools/STACK.md. Nothing here needs an account or a key.
set -u
cd "$(dirname "$0")/.."
LEVEL=${1:-core}
case "$LEVEL" in core|video|all|check) ;; *) echo "usage: bash tools/install.sh [core|video|all|check [core|video|all]]"; exit 2;; esac
WANT=$LEVEL; [ "$LEVEL" = check ] && WANT=${2:-core}
case "$WANT" in core|video|all) ;; *) echo "usage: bash tools/install.sh check [core|video|all]"; exit 2;; esac
rank() { case "$1" in core) echo 1;; video) echo 2;; *) echo 3;; esac; }
TIER=core   # the level the current section belongs to
ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
no() { # a missing piece counts only up to the level asked for; above it, it is listed as the next step
  if [ "$(rank "$TIER")" -le "$(rank "$WANT")" ]; then printf "  \033[31m✗\033[0m %s\n" "$1"; MISSING=1
  else printf "  \033[90m· %s (not part of %s: bash tools/install.sh %s)\033[0m\n" "$1" "$WANT" "$TIER"; fi
}
info() { printf "\n\033[1m%s\033[0m\n" "$1"; }
MISSING=0
OS=$(uname -s)
# the venv's Python: bin/ on macOS, Linux and WSL; Scripts/ when the venv was made by a Windows Python (Git Bash)
venv_py() { for p in tools/.venv/bin/python tools/.venv/Scripts/python.exe; do [ -x "$p" ] && { echo "$p"; return 0; }; done; return 1; }

info "1 · system"
need() { # name, version command, install hint
  if command -v "$1" >/dev/null 2>&1; then ok "$1 $($2 2>/dev/null | head -1)"; else no "$1 missing → $3"; fi
}
case "$OS" in
  Darwin) PKG="brew install"
    NODE_HINT="brew install node"; PY_HINT="brew install python";;
  Linux) PKG="sudo apt install"   # Linux and WSL2 (Ubuntu/Debian)
    NODE_HINT="Node 20+ from nvm (github.com/nvm-sh/nvm, then: nvm install --lts) or NodeSource (github.com/nodesource/distributions); apt's own nodejs is usually older than 20"
    PY_HINT="sudo apt install python3 python3-venv  (3.11+ ships with Ubuntu 24.04 and Debian 12; on an older release: uv python install 3.12 --default, which puts python3 in ~/.local/bin)";;
  *) PKG="install"   # Git Bash / MSYS on Windows: the kit is made for WSL2
    NODE_HINT="nodejs.org (20 or newer); on Windows the kit runs best in WSL2 (Ubuntu): run this script there"
    PY_HINT="python.org (3.11 or newer); on Windows the kit runs best in WSL2 (Ubuntu)";;
esac
need git "git --version" "$PKG git"
need node "node -v" "$NODE_HINT"
need python3 "python3 --version" "$PY_HINT"
need ffmpeg "ffmpeg -version" "$PKG ffmpeg"
need uv "uv --version" "curl -LsSf https://astral.sh/uv/install.sh | sh"
if [ -d "/Applications/Google Chrome.app" ] || command -v google-chrome >/dev/null 2>&1 || command -v google-chrome-stable >/dev/null 2>&1; then ok "Google Chrome"; else no "Google Chrome missing → google.com/chrome (Playwright drives the installed Chrome)"; fi
if command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -lt 20 ]; then no "node $(node -v) is older than 20 → $NODE_HINT"; fi
if command -v python3 >/dev/null 2>&1 && ! python3 -c 'import sys; sys.exit(sys.version_info < (3, 11))' 2>/dev/null; then no "$(python3 --version 2>&1) is older than 3.11 → $PY_HINT"; fi
[ "$LEVEL" = check ] || { [ $MISSING = 0 ] || { echo; echo "Install the missing pieces above, then run this again."; exit 1; }; }

info "2 · render, captions, brand tools (Playwright 1.63 + Lucide icons)"
if [ "$LEVEL" = check ]; then [ -d tools/node_modules/playwright ] && ok "tools/node_modules" || no "tools/node_modules (bash tools/install.sh)"
else (cd tools && npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null) && ok "tools/node_modules" || no "tools/node_modules: npm install failed (cd tools && npm install)"; fi

info "2b · Noto Color Emoji (Google, OFL; COLRv1 so Chrome draws it) → tools/vendor/noto-emoji/"
EMO=tools/vendor/noto-emoji; EMO_TAG=v2.051
if [ -f $EMO/Noto-COLRv1.ttf ]; then ok "$EMO"
elif [ "$LEVEL" = check ]; then no "$EMO (bash tools/install.sh)"
else mkdir -p $EMO && curl -sfL -o $EMO/Noto-COLRv1.ttf "https://raw.githubusercontent.com/googlefonts/noto-emoji/$EMO_TAG/fonts/Noto-COLRv1.ttf" \
  && curl -sfL -o $EMO/OFL.txt "https://raw.githubusercontent.com/googlefonts/noto-emoji/$EMO_TAG/fonts/LICENSE" \
  && printf '@font-face{font-family:"Noto Color Emoji";src:url("Noto-COLRv1.ttf") format("truetype");font-display:block}\n' > $EMO/font.css \
  && ok "$EMO @ $EMO_TAG" || no "Noto emoji download failed (renders still work, emoji fall back to the system font)"; fi

info "3 · Telegram bot packages (wrangler 4)"
if [ "$LEVEL" = check ]; then [ -d telegram-bot/node_modules ] && ok "telegram-bot/node_modules" || no "telegram-bot/node_modules"
else (cd telegram-bot && npm ci --no-audit --no-fund >/dev/null) && ok "telegram-bot/node_modules" || no "telegram-bot/node_modules: npm ci failed (cd telegram-bot && npm ci)"; fi

info "4 · Python tools in tools/.venv (Pillow, numpy: contact sheets, palettes; OpenCV: the face check of video QA)"
# skills and docs run them with tools/py, which picks this venv; the system python3 has no PIL
if [ "$LEVEL" = check ]; then
  PY=$(venv_py) && "$PY" -c "import PIL, numpy, cv2" 2>/dev/null && ok "tools/.venv ($("$PY" --version 2>&1))" || no "tools/.venv with Pillow, numpy, OpenCV (bash tools/install.sh)"
else
  PY=$(venv_py) && "$PY" -m pip --version >/dev/null 2>&1 || { rm -rf tools/.venv   # none yet, or a venv made without pip
    uv venv -q --seed --python ">=3.11" tools/.venv >/dev/null 2>&1 || python3 -m venv tools/.venv; PY=$(venv_py); }
  [ -n "${PY:-}" ] && "$PY" -m pip install -q -r tools/requirements.txt && "$PY" -c "import PIL, numpy, cv2" \
    && ok "tools/.venv ($("$PY" --version 2>&1))" || no "tools/.venv: could not install tools/requirements.txt (see the error above)"
fi

[ "$LEVEL" = core ] && { echo; [ $MISSING = 0 ] && echo "Core tools ready. Video tools: bash tools/install.sh video" || { echo "Some core pieces failed (✗ above); fix them and run this again."; exit 1; }; exit 0; }

TIER=video
info "5 · HyperFrames 0.8.46 (HTML → MP4 engine of the 14 video styles; Apache-2.0)"
if [ "$LEVEL" = check ]; then
  HFV=$(cd tools/style-reel && npx --no -- hyperframes@0.8.46 --version 2>/dev/null </dev/null | tail -1)
  [ "$HFV" = 0.8.46 ] && ok "hyperframes $HFV" || no "hyperframes 0.8.46 (bash tools/install.sh video)"
else
  PY=$(venv_py)
  [ -f tools/style-reel/assets/words.js ] || "$PY" tools/style-reel/make_assets.py >/dev/null
  [ -f tools/style-reel/assets/face.mp4 ] || "$PY" tools/style-reel/make_demo.py >/dev/null
  HFV=$(cd tools/style-reel && npx --yes -- hyperframes@0.8.46 --version 2>/dev/null </dev/null | tail -1)
  if [ "$HFV" != 0.8.46 ]; then no "hyperframes 0.8.46 did not start (got \"$HFV\"): cd tools/style-reel && npx --yes hyperframes@0.8.46 --version"
  else (cd tools/style-reel && npx --yes hyperframes@0.8.46 check >/dev/null 2>&1) && ok "hyperframes $HFV, check passed" || no "hyperframes check failed: cd tools/style-reel && npx --yes hyperframes@0.8.46 check"; fi
fi

info "6 · WhisperX (word timings, forced alignment of your own SRT; BSD-2-Clause) · about 2 GB once"
# new_reel.py runs the Python of the uv tool directly, so it counts even when ~/.local/bin is not on PATH
if command -v whisperx >/dev/null 2>&1 || [ -x "$HOME/.local/share/uv/tools/whisperx/bin/python" ]; then ok "whisperx"
elif [ "$LEVEL" = check ]; then no "whisperx (uv tool install whisperx)"
else uv tool install whisperx >/dev/null 2>&1 && ok "whisperx (uv tool)" || no "whisperx install failed: uv tool install whisperx"; fi

info "7 · persian-motion-director (Persian typography linter + motion skill; MIT) → tools/vendor/"
PMD=tools/vendor/persian-motion-director; PMD_REV=5499640d2dfe5bedd73a8d3f1529847707be7e20
if [ -f $PMD/scripts/lint_persian.py ]; then ok "$PMD"
elif [ "$LEVEL" = check ]; then no "$PMD"
else mkdir -p tools/vendor && git clone -q https://github.com/atmirrr/persian-motion-director $PMD && git -C $PMD checkout -q $PMD_REV && ok "$PMD @ ${PMD_REV:0:7}"; fi

[ "$LEVEL" = video ] && { echo; [ $MISSING = 0 ] && echo "Video tools ready. Claude Code add-ons: bash tools/install.sh all" || { echo "Some video pieces failed (✗ above); fix them and run this again."; exit 1; }; exit 0; }

TIER=all
info "8 · HyperFrames skills for Claude Code (the /hyperframes router and its core skills)"
if [ "$LEVEL" = check ]; then [ -f "$HOME/.claude/skills/hyperframes/SKILL.md" ] && ok "hyperframes skills (~/.claude/skills/hyperframes)" || no "hyperframes skills (npx --yes hyperframes@0.8.46 skills update)"
else npx --yes hyperframes@0.8.46 skills update >/dev/null 2>&1 && ok "hyperframes core skills" || no "npx --yes hyperframes@0.8.46 skills update"; fi

info "9 · NextWork AI video editor plugin (cut retakes and dead air, style edit; MIT)"
if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -q "ai-editor"; then ok "ai-editor plugin"
  elif [ "$LEVEL" = check ]; then no "ai-editor plugin"
  else claude plugin marketplace add nextwork-projects/ai-video-editor >/dev/null 2>&1; claude plugin install ai-editor@nextwork >/dev/null 2>&1 && ok "ai-editor plugin (say \"set up the editor\" in Claude Code once)" || no "claude plugin install ai-editor@nextwork"; fi
else no "Claude Code CLI not found (the plugin installs from inside Claude Code: /plugin marketplace add nextwork-projects/ai-video-editor)"; fi

echo
echo "Optional, not installed by this script (see tools/STACK.md): OmniVoice (voice cloning of YOUR OWN voice; Apache-2.0),"
echo "OpenMontage and Recordly (AGPL-3.0: used as separate apps, never copied into this repo)."
if [ $MISSING = 0 ]; then [ "$LEVEL" = check ] && echo "Everything for the $WANT level is installed." || echo "All set."
else echo "Some pieces are missing (✗ above)."; exit 1; fi
