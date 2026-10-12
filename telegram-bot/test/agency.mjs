// Local check, AGENCY mode in English (AGENCY=on, LANG=en, ZERNIO_DRY_RUN=0): clients from Zernio profiles, the client's
// invite link, reports to the owner (summary) and to the linked client, client dashboards, monthly PDF to both.
import fs from "node:fs"; import crypto from "node:crypto";
const W = "http://127.0.0.1:8787", OWNER = 100000001, CLIENT_CHAT = 555000555, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 90000, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + String(extra).slice(0, 400) : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = (p, m = "GET", b) => fetch(W + p, { method: m, headers: { "x-api-key": "test-ingest", "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const tick = () => fetch(W + "/__scheduled?cron=" + encodeURIComponent("* * * * *"));
async function job(type, arg) {
  const n = calls().length; await api("/api/job", "POST", { type, arg });
  for (let i = 0; i < 40; i++) { await tick(); await sleep(500); if ((await api("/api/jobs")).every((j) => j.status !== "queued" && j.status !== "running")) break; }
  await sleep(300); return n;
}
const post = (path, u) => fetch(W + path, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });
const msg = (text, from = OWNER) => ({ message: { message_id: uid, chat: { id: from, type: "private" }, from: { id: from }, text } });
const cb = (data) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id: 7, chat: { id: OWNER }, text: "x" } } });
async function step(u, path = "/tg/studio") { const n = calls().length; await post(path, u); for (let t = 0; t < 40; t++) { await sleep(150); if (calls().length > n) { await sleep(600); break; } } return calls().slice(n); }
const btns = (b) => (b?.reply_markup?.inline_keyboard || []).flat();
const sends = (from, chat) => calls().slice(from).filter((c) => c.method === "sendMessage" && String(c.body.chat_id) === String(chat)).map((c) => c.body);

await fetch(W + "/setup?key=test-setup"); await sleep(300);
let r = await step(msg("/start"));
const kb = r.find((c) => c.method === "sendMessage")?.body.reply_markup?.keyboard?.flat().map((b) => b.text) || [];
ok(kb.includes("👥 Clients") && kb.includes("💬 Inbox"), "agency menu has 👥 Clients", kb.join(" | "));
r = await step(msg("👥 Clients"));
ok(r.some((c) => btns(c.body).some((b) => b.callback_data === "cl:new")), "clients screen with ➕ Add client");
r = await step(cb("cl:new"));
const pick = r.find((c) => btns(c.body).some((b) => /^cl:addp:/.test(b.callback_data)))?.body;
ok(pick && btns(pick).some((b) => b.callback_data === "cl:addp:prof") && btns(pick).some((b) => b.callback_data === "cl:addp:profB"), "➕ lists the free Zernio profiles");
r = await step(cb("cl:addp:prof"));
const card = r.find((c) => /Sweet Corner/.test(c.body?.text || ""))?.body;
const invite = btns(card).find((b) => /t\.me\/test_publisher_bot\?start=c_/.test(b.url || ""))?.url;
ok(card && invite && btns(card).some((b) => /\/c\/[a-f0-9]{40}$/.test(b.url || "")), "client card: dashboard link + invite link", JSON.stringify(btns(card)));
await step(cb("cl:addp:profB"));
const clients = await api("/api/clients");
ok(clients.length === 2 && clients.every((c) => c.token && c.join_code), "two clients with tokens and join codes");

// the client taps the invite link → the publisher bot links their chat
const code = invite.split("start=c_")[1];
let n = calls().length;
await step(msg("/start c_" + code, CLIENT_CHAT), "/tg/publisher");
ok(sends(n, CLIENT_CHAT).some((b) => /Connected/.test(b.text)) && sends(n, OWNER).some((b) => /linked their Telegram/.test(b.text)), "invite: client connected, owner told");
ok((await api("/api/clients")).find((c) => c.profile_id === "prof").chat_id === String(CLIENT_CHAT), "client chat id stored");
n = calls().length; await step(msg("/start c_deadbeef", 777), "/tg/publisher");
ok(sends(n, 777).some((b) => /not valid/.test(b.text)), "a wrong code is refused");

// daily: owner gets one agency summary, the linked client gets their full report
n = await job("daily");
const sum = sends(n, OWNER).find((b) => /Agency report/.test(b.text));
ok(sum && /Sweet Corner/.test(sum.text) && /Photo Lab/.test(sum.text) && btns(sum).some((b) => b.callback_data === "cl:daily:1"), "owner: one agency summary with every client", sum?.text);
const cr = sends(n, CLIENT_CHAT).find((b) => /Daily report/.test(b.text));
ok(cr && /Page score|Followers/.test(cr.text) && !/Photo Lab/.test(cr.text), "linked client: only their own full daily report", cr?.text);
ok(!calls().slice(n).some((c) => c.method === "sendMessage" && /Photo Lab/.test(c.body.text || "") && String(c.body.chat_id) === String(CLIENT_CHAT)), "a client never sees another client");
n = await job("daily", "2");
ok(sends(n, OWNER).some((b) => /Photo Lab/.test(b.text) && /Daily report/.test(b.text)), "📈 per client: the full report to the owner on demand");

// post reports go to owner (labelled) and to the linked client
await job("postreports");
await fetch("http://127.0.0.1:8790/__mock/add-post", { method: "POST", body: JSON.stringify({ id: "AG24", h: 25, views: 22000 }) });
n = await job("postreports");
ok(sends(n, OWNER).some((b) => /Sweet Corner/.test(b.text) && /24-hour report/.test(b.text) && /AG24/.test(b.text)) && sends(n, CLIENT_CHAT).some((b) => /24-hour report/.test(b.text) && /AG24/.test(b.text)), "24-hour report: owner (labelled) + client");

// monthly PDF to the owner and the client
n = await job("monthly", "1");
const docs = calls().slice(n).filter((c) => c.method === "sendDocument");
ok(docs.some((c) => String(c.body.chat_id) === String(OWNER) && c.bot === "TEST_STUDIO") && docs.some((c) => String(c.body.chat_id) === String(CLIENT_CHAT) && c.bot === "TEST_PUBLISHER"), "monthly PDF: owner via Studio, client via Publisher", JSON.stringify(docs.map((d) => d.body)));

// turning client reports off
await step(cb("cl:rep:1"));
n = await job("daily");
ok(!sends(n, CLIENT_CHAT).length, "🔕 client reports off → nothing to the client");

// dashboards
const c1 = (await api("/api/clients")).find((c) => c.profile_id === "prof");
let html = await (await fetch(W + "/c/" + c1.token)).text();
ok(/Sweet Corner/.test(html) && /Page score/.test(html) && !/Photo Lab/.test(html), "client dashboard /c/<token> shows only that client");
ok((await fetch(W + "/c/nope")).status === 404, "unknown client token → 404");
const tok = crypto.createHash("sha256").update("test-ingest:dashboard").digest("hex").slice(0, 40);
html = await (await fetch(W + "/dashboard?k=" + tok)).text();
ok(/Agency dashboard/.test(html) && /Sweet Corner/.test(html) && /Photo Lab/.test(html), "owner dashboard = agency overview of every client");

// competitors per client
const res = await api("/api/competitors", "POST", { clientId: 1, username: "rival_bakery" });
ok(res.ok, "competitor added for one client");
n = await job("competitors", "1");
ok(sends(n, OWNER).some((b) => /Sweet Corner/.test(b.text) && /rival_bakery/.test(b.text)), "competitors report labelled with the client");

const fa = calls().filter((c) => c.body && typeof c.body.text === "string" && /[؀-ۿ]/.test(c.body.text));
ok(fa.length === 0, "no Persian text in the English agency bot", fa.map((c) => c.body.text.slice(0, 80)).join(" | "));
const errs = (fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|publisher error|Uncaught/g) || []);
ok(errs.length === 0, "no errors in worker log", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
