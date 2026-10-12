#!/usr/bin/env bash
# install.sh · every tool the studio uses, in one place, pinned. Safe to run again (it skips what is there).
#
#   bash tools/install.sh            # core: checks + render/captions/brand tools + the bot's packages
#   bash tools/install.sh video      # + Python tools, HyperFrames engine check, WhisperX, persian-motion-director
#   bash tools/install.sh all        # + HyperFrames skills and the NextWork AI video editor plugin for Claude Code
#   bash tools/install.sh check      # only report what is installed
#
# What each piece is and its licence: tools/STACK.md. Nothing here needs an account or a key.
set -u
cd "$(dirname "$0")/.."
LEVEL=${1:-core}
ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
no() { printf "  \033[31m✗\033[0m %s\n" "$1"; MISSING=1; }
info() { printf "\n\033[1m%s\033[0m\n" "$1"; }
MISSING=0
OS=$(uname -s)

info "1 · system"
need() { # name, version command, install hint
  if command -v "$1" >/dev/null 2>&1; then ok "$1 $($2 2>/dev/null | head -1)"; else no "$1 missing → $3"; fi
}
BREW="brew install"; [ "$OS" = Linux ] && BREW="sudo apt install"
need git "git --version" "$BREW git"
need node "node -v" "$BREW node  (version 20 or newer)"
need python3 "python3 --version" "$BREW python  (3.11 or newer)"
need ffmpeg "ffmpeg -version" "$BREW ffmpeg"
need uv "uv --version" "curl -LsSf https://astral.sh/uv/install.sh | sh"
if [ -d "/Applications/Google Chrome.app" ] || command -v google-chrome >/dev/null 2>&1 || command -v google-chrome-stable >/dev/null 2>&1; then ok "Google Chrome"; else no "Google Chrome missing → google.com/chrome (Playwright drives the installed Chrome)"; fi
if command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then no "node is older than 20"; fi
[ "$LEVEL" = check ] || { [ $MISSING = 0 ] || { echo; echo "Install the missing pieces above, then run this again."; exit 1; }; }

info "2 · render, captions, brand tools (Playwright 1.63 + Lucide icons)"
if [ "$LEVEL" = check ]; then [ -d tools/node_modules/playwright ] && ok "tools/node_modules" || no "tools/node_modules (bash tools/install.sh)"
else (cd tools && npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null) && ok "tools/node_modules"; fi

info "3 · Telegram bot packages (wrangler 4)"
if [ "$LEVEL" = check ]; then [ -d telegram-bot/node_modules ] && ok "telegram-bot/node_modules" || no "telegram-bot/node_modules"
else (cd telegram-bot && npm ci --no-audit --no-fund >/dev/null) && ok "telegram-bot/node_modules"; fi

[ "$LEVEL" = core ] && { echo; echo "Core tools ready. Video tools: bash tools/install.sh video"; exit 0; }

info "4 · Python tools (OpenCV face check, Pillow, numpy) in tools/.venv"
if [ "$LEVEL" = check ]; then [ -x tools/.venv/bin/python ] && ok "tools/.venv" || no "tools/.venv"
else [ -x tools/.venv/bin/python ] || python3 -m venv tools/.venv; tools/.venv/bin/pip install -q -r tools/requirements.txt && ok "tools/.venv"; fi

info "5 · HyperFrames 0.8.46 (HTML → MP4 engine of the 13 video styles; Apache-2.0)"
if [ "$LEVEL" = check ]; then ok "run: cd tools/style-reel && npx --yes hyperframes@0.8.46 check"
else
  [ -f tools/style-reel/assets/words.js ] || tools/.venv/bin/python tools/style-reel/make_assets.py >/dev/null
  [ -f tools/style-reel/assets/face.mp4 ] || tools/.venv/bin/python tools/style-reel/make_demo.py >/dev/null
  (cd tools/style-reel && npx --yes hyperframes@0.8.46 check >/dev/null 2>&1) && ok "hyperframes check passed" || no "hyperframes check failed: cd tools/style-reel && npx --yes hyperframes@0.8.46 check"
fi

info "6 · WhisperX (word timings, forced alignment of your own SRT; BSD-2-Clause) · about 2 GB once"
if command -v whisperx >/dev/null 2>&1; then ok "whisperx"
elif [ "$LEVEL" = check ]; then no "whisperx (uv tool install whisperx)"
else uv tool install whisperx >/dev/null 2>&1 && ok "whisperx (uv tool)" || no "whisperx install failed: uv tool install whisperx"; fi

info "7 · persian-motion-director (Persian typography linter + motion skill; MIT) → tools/vendor/"
PMD=tools/vendor/persian-motion-director; PMD_REV=5499640d2dfe5bedd73a8d3f1529847707be7e20
if [ -f $PMD/scripts/lint_persian.py ]; then ok "$PMD"
elif [ "$LEVEL" = check ]; then no "$PMD"
else mkdir -p tools/vendor && git clone -q https://github.com/atmirrr/persian-motion-director $PMD && git -C $PMD checkout -q $PMD_REV && ok "$PMD @ ${PMD_REV:0:7}"; fi

[ "$LEVEL" = video ] && { echo; echo "Video tools ready. Claude Code add-ons: bash tools/install.sh all"; exit 0; }

info "8 · HyperFrames skills for Claude Code (the /hyperframes router and its core skills)"
if [ "$LEVEL" = check ]; then ok "run: npx --yes hyperframes@0.8.46 skills update"
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
[ $MISSING = 0 ] && echo "All set." || { echo "Some pieces are missing (✗ above)."; exit 1; }
