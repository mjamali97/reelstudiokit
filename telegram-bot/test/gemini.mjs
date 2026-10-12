// Local check of the Gemini features against mock Telegram, with YOUR real GEMINI_API_KEY in .dev.vars. Prints what the bot would send.
// node test/gemini.mjs news|story|search|research <ideaId>|post <ideaId>
import fs from "node:fs";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 5000;
const hook = (u) => fetch(W + "/tg/studio", { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });
const cb = (data) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id: 1, chat: { id: OWNER }, text: "x" } } });
const msg = (text) => ({ message: { message_id: uid, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text } });
async function run(name, update, until) {
  const n = calls().length; await hook(update);
  for (let t = 0; t < 120; t++) { await new Promise((r) => setTimeout(r, 1000)); const c = calls().slice(n).filter((x) => x.method === "sendMessage"); if (c.some(until)) break; }
  const out = calls().slice(n).filter((x) => x.method === "sendMessage").map((x) => x.body.text);
  console.log(`\n######## ${name}\n` + out.join("\n------\n"));
}
const which = process.argv[2] || "all", IDEA = process.argv[3] || "1";
if (which === "all" || which === "menu") { await run("ideas list", msg("💡 ایده‌ها"), () => true); await run("drafts", msg("📝 پیش‌نویس‌ها"), () => true); }
if (which === "all" || which === "news") await run("news", cb("g:news"), (c) => /خلاصه‌ی خبرهای سه روز|⚠️ خطا/.test(c.body.text));
if (which === "all" || which === "story") await run("story", cb("g:story"), (c) => /پیشنهاد استوری|⚠️ خطا/.test(c.body.text));
if (which === "all" || which === "search") await run("search", msg("سرچ کن ترندهای کیک تولد امسال"), (c) => /🔎 <b>|⚠️ خطا/.test(c.body.text));
if (which === "all" || which === "research") await run(`research idea ${IDEA}`, cb(`g:research:${IDEA}`), (c) => /بررسی شد|⚠️ خطا/.test(c.body.text));
if (which === "all" || which === "post") await run(`post from idea ${IDEA}`, cb(`g:post:${IDEA}`), (c) => /پست تلگرام آماده|⚠️ خطا/.test(c.body.text));
