// End-to-end local test against wrangler dev + mock Telegram. Run: node test/run.mjs
import fs from "node:fs";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let uid = 1, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + extra : ""}`); };
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
async function hook(path, update, secret = "test-secret") {
  return fetch(W + path, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": secret }, body: JSON.stringify({ update_id: uid++, ...update }) });
}
async function step(update, wait = 1200, from = OWNER) {
  const n = calls().length; await hook("/tg/studio", update); 
  for (let t = 0; t < wait / 100 + 60; t++) { await sleep(100); if (calls().length > n) { await sleep(300); break; } }
  return calls().slice(n);
}
const msg = (text, from = OWNER) => ({ message: { message_id: uid, date: 0, chat: { id: from, type: "private" }, from: { id: from }, text } });
const cb = (data, message_id = 101) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id, chat: { id: OWNER }, text: "x" } } });
const api = (path, method = "GET", body, key = "test-ingest") => fetch(W + path, { method, headers: { "x-api-key": key, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
const txt = (cs) => cs.map((c) => c.body.text || c.body.caption || "").join("\n---\n");

// security
ok((await hook("/tg/studio", msg("/start"), "wrong")).status === 403, "webhook with wrong secret → 403");
ok((await fetch(W + "/setup?key=nope")).status === 403, "/setup with wrong key → 403");
ok((await api("/api/drafts", "GET", null, "nope")).status === 401, "API with wrong key → 401");
let r = await step(msg("/start", 999), 800, 999);
ok(r.length === 0, "stranger (not owner) gets no answer");

// setup
const su = await (await fetch(W + "/setup?key=test-setup")).json();
ok(su.studio?.ok && su.publisher?.ok && su.commands?.ok, "/setup registers both webhooks + commands");
const wh = calls().filter((c) => c.method === "setWebhook");
ok(wh.some((c) => c.body.url.endsWith("/tg/studio") && c.body.secret_token === "test-secret") && wh.some((c) => c.bot === "TEST_PUBLISHER"), "webhooks carry the secret, one per bot");

// menu
r = await step(msg("/start"));
ok(r[0]?.body.reply_markup?.keyboard?.flat().length === 10, "/start shows the 10-button menu", JSON.stringify(r[0]?.body.reply_markup));
ok(/My Studio/.test(r[0]?.body.text || ""), "help text carries BRAND_NAME");
for (const b of ["📊 داشبورد", "🎬 ریل‌ها", "💡 ایده‌ها", "📝 پیش‌نویس‌ها", "📅 برنامه", "📸 استوری", "📰 خبر", "⚙️ وضعیت"]) {
  r = (await step(msg(b))).filter((c) => c.bot); ok(r.length === 1 && r[0].method === "sendMessage" && !/خطا/.test(txt(r)), `menu button ${b} answers`, txt(r).slice(0, 120));
}
ok(/حالت تست/.test(txt(await step(msg("⚙️ وضعیت")))), "status says test mode (not live)");

// ideas
r = await step(msg("https://example.com برای ریل منو"), 8000);
ok(/ایده #۱/.test(txt(r)) && /سایت/.test(txt(r)), "site link saved as idea #1", txt(r).slice(0, 200));
console.log("   card:", txt(r).split("\n").slice(0, 3).join(" | "));
r = await step(msg("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), 8000);
ok(/ایده #۲/.test(txt(r)) && /یوتیوب/.test(txt(r)), "YouTube link saved as idea #2", txt(r).slice(0, 200));
r = await step(msg("ریل درباره‌ی کیک تولد سه طبقه"));
ok(/ایده #۳/.test(txt(r)) && /یادداشت/.test(txt(r)), "plain text saved as note idea #3");
r = await step(cb("i:star:1")); ok(r.some((c) => c.method === "editMessageText" && /⭐/.test(c.body.text)), "⭐ star toggles");
r = await step(cb("i:tags:1")); ok(r.some((c) => c.body.reply_markup?.inline_keyboard?.flat().length === 8), "🏷 shows 8 tags");
r = await step(cb("t:1:محصول")); ok(r.some((c) => /#محصول/.test(c.body.text || "")), "tag #محصول set");
r = await step(cb("i:note:3")); r = await step(msg("با قیمت‌های جدید پاییز"));
ok(/پاییز/.test(txt(r)), "📝 note flow saves the next message as note");
r = await step(cb("i:done:2")); ok(r.some((c) => c.method === "answerCallbackQuery" && /ساخته/.test(c.body.text)), "✅ done marks idea built");
const ids = (c) => (c?.body.reply_markup?.inline_keyboard || []).flat().map((b) => b.callback_data).filter((x) => /^io:/.test(x));
r = await step(msg("💡 ایده‌ها")); ok(ids(r[0])[0] === "io:1" && ids(r[0]).includes("io:3") && !ids(r[0]).includes("io:2"), "idea list: open ones only, starred first", ids(r[0]).join(","));
r = await step(cb("l:done:0")); ok(r.some((c) => ids(c).includes("io:2")), "filter ✅ ساخته‌شده shows #2");
r = await step(msg("/i۱")); ok(/ایده #۱/.test(txt(r)), "/i۱ with Persian digits opens card");
r = await step(cb("i:del:3")); ok(r.some((c) => /حذف/.test(c.body.text || "")), "🗑 deletes");
// API reads ideas (routine side)
const ideas = await (await api("/api/ideas?status=new")).json();
ok(Array.isArray(ideas) && ideas.some((i) => i.id === 1), "API GET /api/ideas");
const pi = await (await api("/api/ideas/1", "PATCH", { score: 10, summary: "قیمت کیلویی، سه طعم" })).json();
ok(pi.score === 10, "API PATCH idea score");

// drafts: Telegram post
let n0 = calls().length;
let d = await (await api("/api/drafts", "POST", { kind: "telegram", title: "تست", body: "🧪 این یه پست تستیه\n➡️ @my_channel" })).json();
await sleep(500);
ok(d.id === 1 && calls().slice(n0).some((c) => /پیش‌نویس جدید/.test(c.body.text || "") && (c.body.reply_markup?.inline_keyboard || []).flat().some((b) => b.callback_data === "d:pub:1")), "API draft → card with ✅/⏰/✏️/❌ in studio");
r = await step(cb("d:edit:1")); r = await step(msg("متن ویرایش‌شده‌ی پست\n➡️ @my_channel"));
ok(/ویرایش ذخیره شد/.test(txt(r)) && /ویرایش‌شده/.test(txt(r)), "✏️ edit replaces body");
r = await step(cb("d:pub:1"));
let pubs = r.filter((c) => c.bot === "TEST_PUBLISHER");
ok(pubs.length >= 1 && pubs.every((c) => String(c.body.chat_id) === String(OWNER)) && pubs.some((c) => (c.body.reply_markup?.inline_keyboard || []).flat().some((b) => b.callback_data === "pf:ok:1")), "studio ✅ → preview in the publisher bot with a final ✅ (owner only)");
const pcb = (data) => ({ callback_query: { id: "p" + uid, from: { id: OWNER }, data, message: { message_id: 55, chat: { id: OWNER }, text: "x" } } });
const pstep = async (u) => { const n = calls().length; await hook("/tg/publisher", u); for (let t = 0; t < 40; t++) { await sleep(150); if (calls().length > n) { await sleep(500); break; } } return calls().slice(n); };
r = await pstep(pcb("pf:ok:1")); pubs = r.filter((c) => c.bot === "TEST_PUBLISHER" && /تست، فقط برای تو/.test(c.body.text || ""));
ok(pubs.length === 1 && String(pubs[0].body.chat_id) === String(OWNER), "final ✅ in test mode posts to the OWNER only, marked as test");
ok(r.some((c) => /حالت تست/.test(c.body.text || "")), "studio is told it was test mode");

// drafts: scheduled news + cron
d = await (await api("/api/drafts", "POST", { kind: "news", body: "📰 خبر تست" })).json();
r = await step(cb(`d:when:${d.id}`)); ok(r.some((c) => c.body.reply_markup?.inline_keyboard?.flat().length === 7), "⏰ shows time options");
r = await step(cb(`w:${d.id}:1:20:0`)); ok(r.some((c) => c.bot === "TEST_PUBLISHER" && (c.body.reply_markup?.inline_keyboard || []).flat().some((b) => b.callback_data === `pf:ok:${d.id}`)), "picking a time sends news to the publisher bot for the final ✅");
r = await pstep(pcb(`pf:ok:${d.id}`)); ok(r.some((c) => /تأیید نهایی شد/.test(c.body.text || "")), "final ✅ on a future time → scheduled");
r = await step(cb(`w:${d.id}:0:00:01`)); ok(r.some((c) => /گذشته/.test(c.body.text || "")), "past time is refused");
const sch = await (await api("/api/drafts")).json(); const nd = sch.find((x) => x.id === d.id);
ok(nd.status === "scheduled" && nd.scheduled_for > new Date().toISOString() && /T16:30:00/.test(nd.scheduled_for), "news row scheduled 20:00 Asia/Tehran = 16:30 UTC (" + nd.scheduled_for + ")");
r = await step(msg("📅 برنامه")); ok(/۲۰:۰۰/.test(txt(r)), "📅 برنامه lists it at 20:00 local (TZ_NAME)", txt(r).slice(0, 200));
// cron: nothing due yet
n0 = calls().length; await fetch(W + "/__scheduled?cron=*/5+*+*+*+*"); await sleep(800);
ok(calls().slice(n0).filter((c) => c.bot === "TEST_PUBLISHER").length === 0, "cron: future post not published early");
// make it due: schedule a draft 1 min ago through the API
d = await (await api("/api/drafts", "POST", { kind: "telegram", body: "⏰ پست زمان‌بندی‌شده", scheduled_for: new Date(Date.now() - 60000).toISOString() })).json();
await step(cb(`d:pub:${d.id}`)); // past time → publishes now
const dueDraft = await (await api("/api/drafts", "POST", { kind: "telegram", body: "cron test" })).json();
// simulate a due scheduled row by scheduling then back-dating via PATCH is not exposed; use publish-now path count instead
n0 = calls().length;
// the due-post cron path: back-date a row with `wrangler d1 execute --local` and hit /__scheduled

// stories / reels → Zernio dry run
d = await (await api("/api/drafts", "POST", { kind: "story", body: "استوری تست", media_url: "https://example.com/s.jpg" })).json();
r = await step(cb(`d:pub:${d.id}`)); ok(r.some((c) => /حالت تست Zernio/.test(c.body.text || "")), "story → Zernio dry run (not sent)", txt(r).slice(0, 200));
d = await (await api("/api/drafts", "POST", { kind: "story_manual", body: "استوری با نظرسنجی: کدوم؟" })).json();
await sleep(400); ok(calls().slice(-1)[0].body.reply_markup.inline_keyboard[0][0].text.includes("متن اوکیه"), "manual story card asks to approve the text first");
r = await step(cb(`d:done:${d.id}`)); ok(r.some((c) => /مطمئنی|واقعاً/.test(c.body.text || "")), "«منتشر کردم» asks for confirmation");
r = await step(cb(`d:done2:${d.id}`)); ok((await (await api("/api/drafts")).json()).find((x) => x.id === d.id).status === "published", "manual story marked posted after the confirm");
d = await (await api("/api/drafts", "POST", { kind: "reel", body: "کپشن ریل", media_url: "https://example.com/r.mp4" })).json();
await step(cb(`w:${d.id}:1:18:30`)); r = await step(cb(`d:pub:${d.id}`));
ok(r.some((c) => /scheduledFor/.test(c.body.text || "")), "reel → Zernio dry run carries scheduledFor");
r = await step(cb(`d:rej:${dueDraft.id}`)); r = await step(cb(`d:rej2:${dueDraft.id}`)); ok(r.some((c) => c.method === "answerCallbackQuery" && /رد شد/.test(c.body.text || "")), "❌ reject (after the confirm)");

// global guarantee
const all = calls();
const leaked = all.filter((c) => ["sendMessage", "sendPhoto"].includes(c.method) && String(c.body.chat_id) !== String(OWNER));
ok(leaked.length === 0, "NOTHING was sent to any chat except the owner (no channel posts)", JSON.stringify(leaked[0]));
ok(!all.some((c) => JSON.stringify(c).includes("my_channel\"") && c.body.chat_id === "@my_channel"), "no call targeted @my_channel");
const errs = fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|tg error|Uncaught/g) || [];
ok(errs.length === 0, "worker log has no handler errors", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
