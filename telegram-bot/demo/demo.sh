#!/usr/bin/env bash
# Try the whole bot without any account: it runs on this computer with fake Telegram, Instagram (Zernio) and Gemini,
# and a browser page plays Telegram (three panes: Studio bot, Publisher bot, your channel). Nothing leaves the machine.
#
#   bash telegram-bot/demo/demo.sh [en|fa|ar|tr|de|fr|it]        # stop with Ctrl-C
#
# Needs node ≥ 20 (wrangler is fetched by npx). Your own telegram-bot/.dev.vars, if any, is put back when the demo stops.
set -u
cd "$(dirname "$0")/.."
L=${1:-en}
case $L in en|fa|ar|tr|de|fr|it) ;; *) echo "language: en fa ar tr de fr it"; exit 2 ;; esac
[ -d node_modules ] || { echo "installing the bot's packages (once)…"; npm ci --no-audit --no-fund >/dev/null; }
W="npx -y wrangler@4"
[ -f .dev.vars ] && mv .dev.vars .dev.vars.mine
stop() {
  pkill -f "wrangler.*dev --local --port 8787" 2>/dev/null; pkill -f "test/mock-telegram.mjs" 2>/dev/null; [ -n "${TICK:-}" ] && kill "$TICK" 2>/dev/null
  rm -f .dev.vars .dev.vars.bak; [ -f .dev.vars.mine ] && mv .dev.vars.mine .dev.vars; true
}
trap 'stop; echo; echo "demo stopped"; exit 0' INT TERM
pkill -f "wrangler.*dev --local --port 8787" 2>/dev/null; pkill -f "test/mock-telegram.mjs" 2>/dev/null; sleep 1
# the demo's sample brand, post and comment: in Persian for fa, in English for the other languages
if [ "$L" = fa ]; then
  FACTS="هر روز از ساعت ۸ تا ۱۹ بازیم. کیک تولد رو دو روز زودتر سفارش بدید. سفارش از دایرکت یا example.com/order."
  VOICE="گرم و کوتاه، مثل خود ما پشت پیشخون. حداکثر یه ایموجی."
  DRAFT='{"kind":"telegram","title":"منوی پاییزی","body":"🎂 منوی پاییزی رسید:\n\nمنوی کامل با قیمت‌ها:\nhttps://example.com/menu\n\n🔴 نکته: کیک تولد رو دو روز زودتر سفارش بدید.\n\n💬 #منو\n\n➡️ @my_channel"}'
  COMMENT="یکشنبه‌ها ساعت چند باز می‌کنید؟"; SAMPLE_POST="کیک‌های پاییزی رسیدن"
else
  FACTS="Open every day 8:00-19:00. Birthday cakes need two days' notice. Order by DM or at example.com/order."
  VOICE="Warm and short, like the owner at the counter. One emoji at most."
  DRAFT='{"kind":"telegram","title":"Autumn menu","body":"🎂 The autumn menu is here:\n\nFull menu with prices:\nhttps://example.com/menu\n\n🔴 Tip: order birthday cakes two days ahead.\n\n💬 #menu\n\n➡️ @my_channel"}'
  COMMENT="What time do you open on Sunday?"; SAMPLE_POST="Autumn cakes are here"
fi
cp .dev.vars.example .dev.vars
sed -i.bak "s/^LANG=.*/LANG=$L/; s/^PUBLISH_CHAT=.*/PUBLISH_CHAT=@my_channel/" .dev.vars
# NEWS_CHECK_AT is "off" in wrangler.jsonc until the owner picks a news topic; the demo shows it on, at 18:00
cat >> .dev.vars <<VARS
ZERNIO_DRY_RUN=0
GEMINI_API_KEY=demo
GEMINI_API=http://127.0.0.1:8790/gemini
NEWS_CHECK_AT=18:00
BUSINESS_FACTS=$FACTS
BRAND_VOICE=$VOICE
VARS
rm -rf .wrangler
$W d1 migrations apply reel-studio-bot --local >/dev/null 2>&1
(node test/mock-telegram.mjs > test/mock.log 2>&1 &)
($W dev --local --port 8787 --test-scheduled > test/dev.log 2>&1 &)
printf "starting the bot"
for _ in $(seq 1 80); do curl -s http://127.0.0.1:8787/ | grep -q "bot" && break; printf "."; sleep 1.5; done; echo
curl -s http://127.0.0.1:8787/ | grep -q "bot" || { echo "the bot did not start; see telegram-bot/test/dev.log"; stop; exit 1; }

# the clock: the real bot gets a cron tick every minute; here every 10 seconds so queued answers arrive quickly
( while true; do curl -s "http://127.0.0.1:8787/__scheduled?cron=*+*+*+*+*" >/dev/null; sleep 10; done ) & TICK=$!

# a little history so the screens are not empty
K="x-api-key: test-ingest"; J="content-type: application/json"
curl -s "http://127.0.0.1:8787/setup?key=test-setup" >/dev/null
post() { curl -s -X POST -H "$J" -H "x-telegram-bot-api-secret-token: test-secret" -d "$1" http://127.0.0.1:8787/tg/studio >/dev/null; sleep 1; }
post '{"update_id":1,"message":{"message_id":1,"chat":{"id":100000001,"type":"private"},"from":{"id":100000001},"text":"/start"}}'
curl -s -X POST -H "$K" -H "$J" -d "$DRAFT" http://127.0.0.1:8787/api/drafts >/dev/null
post '{"update_id":2,"message":{"message_id":2,"chat":{"id":100000001,"type":"private"},"from":{"id":100000001},"text":"https://example.com/cake-storage-guide"}}'
COMMENT="$COMMENT" SAMPLE_POST="$SAMPLE_POST" node -e '
const c=require("crypto"),t=c.createHash("sha256").update("test-secret:zernio").digest("hex").slice(0,32);
const e={id:"demo1",event:"comment.received",comment:{id:"cm1",postId:"zp1",platformPostId:"ig1",text:process.env.COMMENT,author:{username:"alice",isOwnAccount:false}},post:{content:process.env.SAMPLE_POST,permalink:"https://www.instagram.com/p/demo/"},account:{accountId:"igacc",platform:"instagram"}};
const b=JSON.stringify(e);fetch("http://127.0.0.1:8787/zernio/webhook?k="+t,{method:"POST",headers:{"content-type":"application/json","x-zernio-signature":c.createHmac("sha256","test-secret").update(b).digest("hex")},body:b});'
curl -s -X POST -H "$K" -H "$J" -d '{"type":"daily"}' http://127.0.0.1:8787/api/job >/dev/null

URL=http://127.0.0.1:8790/viewer
echo
echo "  Demo running ($L): $URL"
echo "  Try: the menu buttons · ✅ on the draft (then the final ✅ in the Publisher pane) · 📊 Dashboard · send any link"
echo "  Stop with Ctrl-C."
[ -n "${NO_OPEN:-}" ] || (command -v open >/dev/null && open "$URL") || (command -v xdg-open >/dev/null && xdg-open "$URL") || true
wait
