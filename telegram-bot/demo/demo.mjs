// demo.mjs · try the whole bot without any account: it runs on this computer with fake Telegram, Instagram (Zernio) and
// Gemini, and a browser page plays Telegram (three panes: Studio bot, Publisher bot, your channel). Nothing leaves the
// machine. Same on macOS, Linux and Windows.
//
//   node telegram-bot/demo/demo.mjs [en|fa|ar|tr|de|fr|it]        # stop with Ctrl-C   (bash telegram-bot/demo/demo.sh runs this)
//
// Needs node ≥ 20 (wrangler is fetched by npx). Your own telegram-bot/.dev.vars, if any, is put back when the demo stops.
import { createHash, createHmac } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BOT, devVars, start, stop, cleanup } from "../test/local.mjs";

const L = process.argv[2] || "en";
if (!["en", "fa", "ar", "tr", "de", "fr", "it"].includes(L)) { console.log("language: en fa ar tr de fr it"); process.exit(2); }
if (!fs.existsSync(path.join(BOT, "node_modules"))) {
  console.log("installing the bot's packages (once)…");
  spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: BOT, stdio: "ignore", shell: process.platform === "win32" });
}
const mine = path.join(BOT, ".dev.vars.mine"), vars = path.join(BOT, ".dev.vars");
if (fs.existsSync(vars)) fs.renameSync(vars, mine);
let tick;
async function quit(code = 0) {
  clearInterval(tick); await stop(); cleanup();
  if (fs.existsSync(mine)) fs.renameSync(mine, vars);
  console.log("\ndemo stopped"); process.exit(code);
}
process.on("SIGINT", () => quit()); process.on("SIGTERM", () => quit());

// the demo's sample brand, post and comment: in Persian for fa, in English for the other languages
const FA = L === "fa";
const S = FA ? {
  facts: "هر روز از ساعت ۸ تا ۱۹ بازیم. کیک تولد رو دو روز زودتر سفارش بدید. سفارش از دایرکت یا example.com/order.",
  voice: "گرم و کوتاه، مثل خود ما پشت پیشخون. حداکثر یه ایموجی.",
  draft: { kind: "telegram", title: "منوی پاییزی", body: "🎂 منوی پاییزی رسید:\n\nمنوی کامل با قیمت‌ها:\nhttps://example.com/menu\n\n🔴 نکته: کیک تولد رو دو روز زودتر سفارش بدید.\n\n💬 #منو\n\n➡️ @my_channel" },
  comment: "یکشنبه‌ها ساعت چند باز می‌کنید؟", post: "کیک‌های پاییزی رسیدن",
} : {
  facts: "Open every day 8:00-19:00. Birthday cakes need two days' notice. Order by DM or at example.com/order.",
  voice: "Warm and short, like the owner at the counter. One emoji at most.",
  draft: { kind: "telegram", title: "Autumn menu", body: "🎂 The autumn menu is here:\n\nFull menu with prices:\nhttps://example.com/menu\n\n🔴 Tip: order birthday cakes two days ahead.\n\n💬 #menu\n\n➡️ @my_channel" },
  comment: "What time do you open on Sunday?", post: "Autumn cakes are here",
};
// NEWS_CHECK_AT is "off" in wrangler.jsonc until the owner picks a news topic; the demo shows it on, at 18:00
devVars({ LANG: L, PUBLISH_CHAT: "@my_channel", ZERNIO_DRY_RUN: 0, GEMINI_API_KEY: "demo", GEMINI_API: "http://127.0.0.1:8790/gemini",
  NEWS_CHECK_AT: "18:00", BUSINESS_FACTS: S.facts, BRAND_VOICE: S.voice });

process.stdout.write("starting the bot… ");
if (!(await start({ tries: 80 }))) { console.log("the bot did not start; see telegram-bot/test/dev.log"); await quit(1); }
console.log("up");

const W = "http://127.0.0.1:8787", sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const J = { "content-type": "application/json" }, K = { ...J, "x-api-key": "test-ingest" };
const go = (u, o) => fetch(W + u, o).catch(() => {});
// the clock: the real bot gets a cron tick every minute; here every 10 seconds so queued answers arrive quickly
tick = setInterval(() => go("/__scheduled?cron=*+*+*+*+*"), 10000);

// a little history so the screens are not empty
await go("/setup?key=test-setup");
const post = async (b) => { await go("/tg/studio", { method: "POST", headers: { ...J, "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify(b) }); await sleep(1000); };
const msg = (id, text) => ({ update_id: id, message: { message_id: id, chat: { id: 100000001, type: "private" }, from: { id: 100000001 }, text } });
await post(msg(1, "/start"));
await go("/api/drafts", { method: "POST", headers: K, body: JSON.stringify(S.draft) });
await post(msg(2, "https://example.com/cake-storage-guide"));
const t = createHash("sha256").update("test-secret:zernio").digest("hex").slice(0, 32);
const ev = JSON.stringify({ id: "demo1", event: "comment.received",
  comment: { id: "cm1", postId: "zp1", platformPostId: "ig1", text: S.comment, author: { username: "alice", isOwnAccount: false } },
  post: { content: S.post, permalink: "https://www.instagram.com/p/demo/" }, account: { accountId: "igacc", platform: "instagram" } });
await go(`/zernio/webhook?k=${t}`, { method: "POST", headers: { ...J, "x-zernio-signature": createHmac("sha256", "test-secret").update(ev).digest("hex") }, body: ev });
await go("/api/job", { method: "POST", headers: K, body: JSON.stringify({ type: "daily" }) });

const URL_ = "http://127.0.0.1:8790/viewer";
console.log(`\n  Demo running (${L}): ${URL_}`);
console.log("  Try: the menu buttons · ✅ on the draft (then the final ✅ in the Publisher pane) · 📊 Dashboard · send any link");
console.log("  Stop with Ctrl-C.");
if (!process.env.NO_OPEN) {
  const [cmd, args] = process.platform === "darwin" ? ["open", [URL_]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", URL_]] : ["xdg-open", [URL_]];
  try { spawn(cmd, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref(); } catch {}
}
setInterval(() => {}, 1 << 30);   // keep running until Ctrl-C
