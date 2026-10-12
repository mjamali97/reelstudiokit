#!/usr/bin/env bash
# Pull the latest kit into your copy without touching your own files (.gitattributes lists them).
#   bash tools/update.sh            (or just type /update in Claude Code)
# Your repo keeps its own history; the kit is the remote "upstream".
set -euo pipefail
cd "$(dirname "$0")/.."
UP=${KIT_UPSTREAM:-https://github.com/mjamali97/reelstudiokit.git}
[ -d .git ] || { echo "Not a git repo yet: run  git init && git add -A && git commit -m 'my studio'  first."; exit 1; }
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UP"
git config merge.ours.driver true
[ -z "$(git status --porcelain)" ] || { echo "You have uncommitted changes. Commit them first (git add -A && git commit -m 'my changes')."; exit 1; }
old=$(cat VERSION 2>/dev/null || echo "0")
git fetch -q upstream
base=$(git merge-base HEAD upstream/main 2>/dev/null || true)
new=$(git show upstream/main:VERSION 2>/dev/null || echo "?")
if [ -n "$base" ] && [ "$(git rev-parse upstream/main)" = "$base" ]; then echo "Already on the latest kit ($old)."; exit 0; fi
# yours: files upstream changed that you also own; you keep yours, Claude can port the improvement by hand
yours=$(git diff --name-only ${base:-upstream/main} upstream/main -- $(sed -n 's/^\([^#[:space:]][^[:space:]]*\)[[:space:]].*merge=ours.*/\1/p' .gitattributes | sed 's/\*\*//') 2>/dev/null || true)
if [ -n "$base" ]; then git merge --no-edit -m "Update kit $old → $new" upstream/main
else git merge --no-edit --allow-unrelated-histories -X ours -m "Update kit $old → $new" upstream/main; fi
echo "Kit updated: $old → $new"
echo "--- what's new (CHANGELOG.md) ---"; awk "/^## /{n++} n>=1 && /^## $old/{exit} n>=1{print}" CHANGELOG.md | head -60
[ -n "$yours" ] && { echo "--- the kit changed these files that are yours (you kept your version; ask Claude to port the change): ---"; echo "$yours"; }
echo "Next: bash telegram-bot/test/all.sh, then git push (deploys your bot)."
