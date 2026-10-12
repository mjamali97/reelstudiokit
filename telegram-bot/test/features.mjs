// Local check, single page in ENGLISH (LANG=en, ZERNIO_DRY_RUN=0; the mock plays Telegram + Zernio):
// competitors, inbox assistant (comments + DMs), monthly PDF, dashboard calendar + competitors, and no Persian anywhere.
import fs from "node:fs"; import crypto from "node:crypto";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 70000, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + String(extra).slice(0, 400) : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = (p, m = "GET", b) => fetch(W + p, { method: m, headers: { "x-api-key": "test-ingest", "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const msgs = (from) => calls().slice(from).filter((c) => c.method === "sendMessage").map((c) => c.body);
const tick = () => fetch(W + "/__scheduled?cron=" + encodeURIComponent("* * * * *"));
async function job(type, arg) {
  const n = calls().length; await api("/api/job", "POST", { type, arg });
  for (let i = 0; i < 40; i++) { await tick(); await sleep(500); if ((await api("/api/jobs")).every((j) => j.status !== "queued" && j.status !== "running")) break; }
  await sleep(300); return n;
}
const post = (path, u) => fetch(W + path, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });
const msg = (text) => ({ message: { message_id: uid, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text } });
const cb = (data) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id: 7, chat: { id: OWNER }, text: "x" } } });
async function step(u) { const n = calls().length; await post("/tg/studio", u); for (let t = 0; t < 40; t++) { await sleep(150); if (calls().length > n) { await sleep(500); break; } } return calls().slice(n); }
const wtok = crypto.createHash("sha256").update("test-secret:zernio").digest("hex").slice(0, 32);
const hook = (e) => { const b = JSON.stringify(e); return fetch(W + "/zernio/webhook?k=" + wtok, { method: "POST", headers: { "content-type": "application/json", "x-zernio-signature": crypto.createHmac("sha256", "test-secret").update(b).digest("hex") }, body: b }); };
const btns = (b) => (b?.reply_markup?.inline_keyboard || []).flat();

await fetch(W + "/setup?key=test-setup"); await sleep(300);
ok(calls().some((c) => c.zernio && c.path === "/webhooks/settings" && c.method === "POST" && c.body.events.includes("comment.received") && c.body.events.includes("message.received")), "/setup subscribes to comments and DMs too");

// menu in English, with 💬 Inbox
let r = await step(msg("/start"));
const kb = r.find((c) => c.method === "sendMessage")?.body.reply_markup?.keyboard?.flat().map((b) => b.text) || [];
ok(kb.includes("💬 Inbox") && kb.includes("📊 Dashboard") && kb.length === 11, "English menu with 💬 Inbox", kb.join(" | "));

// competitors
let res = await api("/api/competitors", "POST", { username: "@rival_bakery" });
ok(res.ok && /rival_bakery/.test(res.msg) && /4,200/.test(res.msg), "add competitor via business discovery", JSON.stringify(res));
res = await api("/api/competitors", "POST", { username: "nobody" });
ok(!res.ok && /not found|business/.test(res.msg), "a non-business account is refused with a reason", res.msg);
r = await step(cb("cpm:0"));
ok(r.some((c) => /Competitors/.test(c.body?.text || "") && btns(c.body).some((b) => b.callback_data === "cp:add:0")), "🥊 screen lists competitors with ➕");
let n = await job("competitors");
const comp = msgs(n).find((b) => /<b>Competitors<\/b>/.test(b.text || ""));
ok(comp && /@rival_bakery/.test(comp.text) && /You/.test(comp.text) && /likes/.test(comp.text), "competitors report: you vs them", comp?.text);

// inbox: a comment → card → ✏️ my own reply → ✅ send
n = calls().length;
await hook({ id: "c1", event: "comment.received", comment: { id: "cm1", postId: "zp1", platformPostId: "ig1", text: "What are your opening hours?", author: { username: "alice", isOwnAccount: false } }, post: { content: "Autumn cakes are here", permalink: "https://www.instagram.com/p/ig1/" }, account: { accountId: "igacc", platform: "instagram" } });
await hook({ id: "c2", event: "comment.received", comment: { id: "cm2", postId: "zp1", text: "منو", author: { username: "bob" } }, account: { accountId: "igacc" } });
await hook({ id: "c3", event: "comment.received", comment: { id: "cm3", postId: "zp1", text: "thanks!", author: { username: "mybrand", isOwnAccount: true } }, account: { accountId: "igacc" } });
await tick(); await sleep(1200);
let cards = msgs(n).filter((b) => /New comment/.test(b.text || ""));
ok(cards.length === 1 && /alice/.test(cards[0].text) && /opening hours/.test(cards[0].text), "a real comment → one card (gate word and own comment skipped)", cards.map((c) => c.text.slice(0, 60)).join(" | "));
const inboxId = btns(cards[0]).find((b) => /^ib:edit:/.test(b.callback_data))?.callback_data.split(":")[2];
ok(inboxId && btns(cards[0]).some((b) => b.callback_data === `ib:no:${inboxId}`), "card has ✏️ and ❌ (no Gemini key → no suggestion)");
await step(cb(`ib:edit:${inboxId}`)); r = await step(msg("We're open 9 to 21 every day 🙂"));
const card2 = r.find((c) => c.method === "sendMessage")?.body;
ok(card2 && /We're open 9 to 21/.test(card2.text) && btns(card2).some((b) => b.callback_data === `ib:send:${inboxId}`), "✏️ my reply → card with ✅ Send");
n = calls().length; await step(cb(`ib:send:${inboxId}`));
const sent = calls().slice(n).find((c) => c.zernio && c.method === "POST" && c.path.startsWith("/inbox/comments/"));
ok(sent && sent.path === "/inbox/comments/zp1" && sent.body.commentId === "cm1" && sent.body.accountId === "igacc" && /9 to 21/.test(sent.body.message), "✅ → Zernio comment reply with the right post, comment and account", JSON.stringify(sent));
r = await step(cb(`ib:send:${inboxId}`));
ok(r.some((c) => /Already answered/.test(c.body?.text || "")), "a second ✅ does not reply twice");
// a DM
n = calls().length;
await hook({ id: "d1", event: "message.received", message: { id: "mm1", conversationId: "conv9", direction: "incoming", text: "Do you deliver to Karaj?", sender: { username: "carol" } }, conversation: { id: "conv9", participantUsername: "carol" }, account: { accountId: "igacc" } });
await hook({ id: "d2", event: "message.received", message: { id: "mm2", conversationId: "conv9", direction: "outgoing", text: "auto", automationId: "a1" }, account: { accountId: "igacc" } });
await tick(); await sleep(1200);
cards = msgs(n).filter((b) => /New DM/.test(b.text || ""));
ok(cards.length === 1 && /carol/.test(cards[0].text), "an incoming DM → one card (outgoing/automation skipped)");
r = await step(msg("💬 Inbox"));
ok(r.some((c) => btns(c.body).some((b) => /^ibo:/.test(b.callback_data))), "💬 Inbox lists the waiting items");
const dmId = btns(cards[0]).find((b) => /^ib:edit:/.test(b.callback_data)).callback_data.split(":")[2];
await step(cb(`ib:no:${dmId}`));
ok((await api("/api/inbox")).find((x) => x.id === +dmId).status === "ignored", "❌ ignores the DM");

// monthly PDF
n = await job("monthly");
const doc = calls().slice(n).find((c) => c.method === "sendDocument");
ok(doc && doc.bot === "TEST_STUDIO" && String(doc.body.chat_id) === String(OWNER) && /\.pdf$/.test(doc.body.filename || ""), "monthly PDF sent to the owner as a document", JSON.stringify(doc?.body));

// dashboard with calendar and competitors
const tok = crypto.createHash("sha256").update("test-ingest:dashboard").digest("hex").slice(0, 40);
const html = await (await fetch(W + "/dashboard?k=" + tok)).text();
ok(/Content calendar/.test(html) && /Next reel: the autumn menu/.test(html) && /@rival_bakery/.test(html) && /dir="ltr"/.test(html), "dashboard: calendar + competitors, left-to-right in English");

// English means English: no Persian in anything the bots sent in this suite
const fa = calls().filter((c) => c.body && typeof c.body.text === "string" && /[؀-ۿ]/.test(c.body.text.replace(/«منو»|منو/g, "")));
ok(fa.length === 0, "no Persian text leaked into the English bot", fa.map((c) => c.body.text.slice(0, 80)).join(" | "));
const errs = (fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|publisher error|Uncaught/g) || []);
ok(errs.length === 0, "no errors in worker log", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
