// Local check (fresh local DB, with PUBLISH_CHAT=@my_channel in .dev.vars; the mock plays Telegram): buttons-only menus + two-step publishing (studio ✅ → publisher final ✅ → channel). Mock Telegram, no real posts.
import fs from "node:fs";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 9000, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + String(extra).slice(0, 300) : ""}`); };
const post = (path, u) => fetch(W + path, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });
async function step(path, u) { const n = calls().length; await post(path, u); for (let t = 0; t < 40; t++) { await new Promise((r) => setTimeout(r, 150)); if (calls().length > n) { await new Promise((r) => setTimeout(r, 400)); break; } } return calls().slice(n); }
const msg = (text) => ({ message: { message_id: uid, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text } });
const cb = (data, mid = 77) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id: mid, chat: { id: OWNER }, text: "x" } } });
const api = (p, m = "GET", b) => fetch(W + p, { method: m, headers: { "x-api-key": "test-ingest", "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const btns = (c) => (c.body.reply_markup?.inline_keyboard || []).flat().map((b) => b.text + "|" + b.callback_data);

let r = await step("/tg/studio", msg("/start"));
ok(r[0]?.body.reply_markup?.keyboard?.flat().length === 11 && r[0].body.reply_markup.keyboard.flat().some((b) => b.text === "🔎 سرچ"), "menu has 11 buttons incl. 🎬 ریل‌ها, 🔎 سرچ, ➕ ایده‌ی جدید");
await step("/tg/studio", msg("ایده‌ی تست برای فهرست"));
r = await step("/tg/studio", msg("💡 ایده‌ها"));
ok(btns(r[0]).some((x) => x.includes("|io:")), "idea list = one button per idea", btns(r[0]).join(" "));
const firstIdea = btns(r[0]).find((x) => x.includes("|io:")).split("|io:")[1];
r = await step("/tg/studio", cb("io:" + firstIdea));
ok(new RegExp("ایده #" + new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(firstIdea)).test(r.find((c) => c.method === "sendMessage")?.body.text || "") && btns(r.find((c) => c.method === "sendMessage")).some((x) => x.includes("l:open:0")), "tap idea → its card with ↩️ back");
await api("/api/drafts", "POST", { kind: "telegram", title: "پیش‌نویس فهرست", body: "متن تست" });
r = await step("/tg/studio", msg("📝 پیش‌نویس‌ها"));
ok(btns(r[0]).some((x) => x.includes("|do:")), "draft list = buttons", btns(r[0]).slice(0, 3).join(" "));
r = await step("/tg/studio", msg("🔎 سرچ"));
ok(/دنبال چی بگردم/.test(r[0]?.body.text || "") && btns(r[0]).some((x) => x.includes("x:cancel")), "🔎 asks what to search, with ✖️ cancel");
r = await step("/tg/studio", cb("x:cancel"));
ok(r.some((c) => c.method === "editMessageText"), "✖️ cancels");
r = await step("/tg/studio", msg("➕ ایده‌ی جدید")); r = await step("/tg/studio", msg("ایده‌ی تست: پشت‌صحنه‌ی پخت صبح"));
ok(r.some((c) => /ایده #/.test(c.body.text || "")), "➕ then text → saved idea card");
r = await step("/tg/studio", msg("⚙️ وضعیت"));
const stMsg = r.find((c) => c.method === "sendMessage");
ok(/@my_channel/.test(stMsg?.body.text || "") && btns(stMsg).some((x) => x.includes("stt")), "status shows live channel + 🔄");

// two-step publishing
const d = await api("/api/drafts", "POST", { kind: "telegram", title: "تست", body: "📣 پست تست\n\n➡️ @my_channel" });
await new Promise((r) => setTimeout(r, 400));
r = await step("/tg/studio", cb(`d:pub:${d.id}`));
const pubPreview = r.filter((c) => c.bot === "TEST_PUBLISHER");
ok(pubPreview.length === 2 && pubPreview.every((c) => String(c.body?.chat_id) === String(OWNER)) && btns(pubPreview[1]).some((x) => x.includes(`pf:ok:${d.id}`)), "studio ✅ → publisher bot sends exact preview to the OWNER with ✅/✏️/❌", JSON.stringify(pubPreview.map((c) => c.body?.chat_id)));
ok(!calls().some((c) => c.body?.chat_id === "@my_channel"), "nothing reached the channel yet");
ok((await api("/api/drafts")).find((x) => x.id === d.id).status === "pending_final", "draft is pending_final");
r = await step("/tg/publisher", cb(`pf:edit:${d.id}`));
ok(r.some((c) => /متن کامل جدید/.test(c.body.text || "")), "publisher ✏️ asks for new text");
r = await step("/tg/publisher", msg("📣 پست ویرایش‌شده\n\n➡️ @my_channel"));
ok(r.some((c) => c.bot === "TEST_PUBLISHER" && c.body.text === "📣 پست ویرایش‌شده\n\n➡️ @my_channel"), "edited text → new preview");
r = await step("/tg/publisher", cb(`pf:ok:${d.id}`));
const chan = r.filter((c) => c.body?.chat_id === "@my_channel");
ok(chan.length === 1 && chan[0].body.text === "📣 پست ویرایش‌شده\n\n➡️ @my_channel", "publisher ✅ → posted to @my_channel (mock), exact edited text");
ok((await api("/api/drafts")).find((x) => x.id === d.id).status === "published", "draft published");
r = await step("/tg/publisher", cb(`pf:ok:${d.id}`));
ok(!r.some((c) => c.body?.chat_id === "@my_channel"), "double tap does not post twice");
// scheduled
const d2 = await api("/api/drafts", "POST", { kind: "news", body: "📰 خبر تست" });
await new Promise((r) => setTimeout(r, 400));
r = await step("/tg/studio", cb(`w:${d2.id}:1:20:00`));
ok(r.some((c) => c.bot === "TEST_PUBLISHER" && btns(c).some((x) => x.includes(`pf:ok:${d2.id}`) && x.includes("۲۰:۰۰"))), "picking ⏰ fırda 20:00 → publisher preview says «۲۰:۰۰ بره کانال»");
r = await step("/tg/publisher", cb(`pf:ok:${d2.id}`));
ok((await api("/api/drafts")).find((x) => x.id === d2.id).status === "scheduled" && !r.some((c) => c.body?.chat_id === "@my_channel"), "final ✅ on a future time → scheduled, not posted now");
const d3 = await api("/api/drafts", "POST", { kind: "telegram", body: "پست رد" }); await new Promise((r) => setTimeout(r, 300));
await step("/tg/studio", cb(`d:pub:${d3.id}`)); r = await step("/tg/publisher", cb(`pf:no:${d3.id}`));
ok((await api("/api/drafts")).find((x) => x.id === d3.id).status === "draft" && !r.some((c) => c.body?.chat_id === "@my_channel"), "publisher ❌ → back to draft, nothing posted");
// stranger
r = await step("/tg/publisher", { callback_query: { id: "s", from: { id: 5 }, data: `pf:ok:${d3.id}`, message: { message_id: 1, chat: { id: 5 } } } });
ok(r.length === 0, "stranger can't approve in the publisher bot");
const errs = (fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|publisher error|Uncaught/g) || []);
ok(errs.length === 0, "no errors in worker log", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
