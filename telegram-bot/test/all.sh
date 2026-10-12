#!/usr/bin/env bash
# Every local check, in the three configurations the bot runs in. Mock Telegram + mock Zernio on 127.0.0.1:8790:
# nothing here reaches Telegram, Zernio, Gemini or your Cloudflare account.   Run from telegram-bot/:  bash test/all.sh
set -u
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm ci --no-audit --no-fund >/dev/null
W="npx -y wrangler@4"
stop() { pkill -f "wrangler.*dev --local --port 8787" 2>/dev/null; pkill -f "test/mock-telegram.mjs" 2>/dev/null; sleep 1; }
start() {
  stop; rm -rf .wrangler
  $W d1 migrations apply reel-studio-bot --local >/dev/null 2>&1
  (node test/mock-telegram.mjs > test/mock.log 2>&1 &)
  ($W dev --local --port 8787 --test-scheduled > test/dev.log 2>&1 &)
  for _ in $(seq 1 60); do curl -s http://127.0.0.1:8787/ | grep -q "bot" && return; sleep 1.5; done
  echo "worker did not start; see test/dev.log"; exit 1
}
total=0
suite() { echo "== $1"; out=$(node "test/$1" 2>&1); echo "$out" | grep -E "❌|passed"; echo "$out" | grep -q " 0 failed" || total=1; }

cp .dev.vars.example .dev.vars;                                                start; suite run.mjs
cp .dev.vars.example .dev.vars; echo "ZERNIO_DRY_RUN=0" >> .dev.vars;           start; suite publish.mjs; suite story.mjs; suite reports.mjs
cp .dev.vars.example .dev.vars; sed -i.bak 's/^PUBLISH_CHAT=.*/PUBLISH_CHAT=@my_channel/' .dev.vars; start; suite flow.mjs
cp .dev.vars.example .dev.vars; sed -i.bak 's/^LANG=.*/LANG=en/' .dev.vars; echo "ZERNIO_DRY_RUN=0" >> .dev.vars; start; suite features.mjs
cp .dev.vars.example .dev.vars; sed -i.bak 's/^LANG=.*/LANG=en/' .dev.vars; printf "ZERNIO_DRY_RUN=0\nAGENCY=on\n" >> .dev.vars; start; suite agency.mjs
stop; rm -f .dev.vars .dev.vars.bak
[ $total = 0 ] && echo "ALL GREEN" || { echo "SOME CHECKS FAILED"; exit 1; }
