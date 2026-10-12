// Local check (ZERNIO_DRY_RUN=0 in .dev.vars; the mock plays Telegram + Zernio): daily report, 24 h / 7 d post reports,
// dashboard page, Zernio webhooks, the 📊 button.
import fs from "node:fs"; import crypto from "node:crypto";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 50000, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + String(extra).slice(0, 400) : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = (p, m = "GET", b) => fetch(W + p, { method: m, headers: { "x-api-key": "test-ingest", "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const msgs = (from) => calls().slice(from).filter((c) => c.method === "sendMessage").map((c) => c.body);
async function job(type) {
  const n = calls().length; await api("/api/job", "POST", { type });
  await fetch(W + "/__scheduled?cron=" + encodeURIComponent("* * * * *"));
  for (let i = 0; i < 40; i++) { await sleep(500); if ((await api("/api/jobs")).every((j) => j.status !== "queued" && j.status !== "running")) break; }
  await sleep(300); return n;
}
const hook = (u) => fetch(W + "/tg/studio", { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });

// setup registers the Zernio webhook (origin stored for links)
await fetch(W + "/setup?key=test-setup");
await sleep(400);
ok(calls().some((c) => c.zernio && c.method === "POST" && c.path === "/webhooks/settings" && c.body.events.includes("account.disconnected") && c.body.secret === "test-secret"), "/setup registers the Zernio webhook with a secret");

// dashboard
const tok = crypto.createHash("sha256").update("test-ingest:dashboard").digest("hex").slice(0, 40);
ok((await fetch(W + "/dashboard?k=nope")).status === 403, "dashboard refuses a wrong token");
const html = await (await fetch(W + "/dashboard?k=" + tok)).text();
ok(/داشبورد/.test(html) && /امتیاز پیج/.test(html) && /Tehran/.test(html) && /<svg/.test(html) && /Test reel R25/.test(html), "dashboard: KPIs, charts, audience, posts table", html.slice(0, 200));
ok(!/NaN|undefined/.test(html.replace(/<script[\s\S]*<\/script>/, "")), "dashboard has no NaN/undefined");

// daily report
let n = await job("daily");
let m = msgs(n).find((b) => /<b>گزارش روزانه<\/b>/.test(b.text || ""));
ok(m && /فالوور/.test(m.text) && /۷ روز اخیر/.test(m.text) && /امتیاز پیج/.test(m.text), "daily report: followers, 7-day trend, page score", m?.text);
ok(m && /(دیروز|آخرین روز ثبت‌شده)/.test(m.text) && /اومد/.test(m.text), "daily report names the day and its gained/lost followers", m?.text);
ok(m && m.reply_markup?.inline_keyboard?.[0]?.[0]?.url?.includes("/dashboard?k="), "daily report links the dashboard");
ok(m && !/NaN|undefined|null/.test(m.text), "daily report has no NaN/undefined/null", m?.text);
const snaps = (await (await fetch(W + "/api/dashboard?k=" + tok)).json()).followers;
ok(Array.isArray(snaps) && snaps.length >= 1, "daily report stores a snapshot");

// post reports: first run marks old posts silently, then a new post 25 h old gets its 24 h report
n = await job("postreports");
ok(!msgs(n).some((b) => /گزارش ۲۴ ساعته/.test(b.text || "")), "first run: existing posts are marked, no flood of reports");
await fetch("http://127.0.0.1:8790/__mock/add-post", { method: "POST", body: JSON.stringify({ id: "NEW24", h: 25, views: 30000 }) });
await fetch("http://127.0.0.1:8790/__mock/add-post", { method: "POST", body: JSON.stringify({ id: "NEW7D", h: 169, views: 12000 }) });
n = await job("postreports");
const r24 = msgs(n).find((b) => /گزارش ۲۴ ساعته/.test(b.text || "") && /NEW24/.test(b.text));
ok(r24 && /بازدید/.test(r24.text) && /رتبه ۱ از/.test(r24.text) && /میانه/.test(r24.text), "24 h report: views, rank among reels, vs median", r24?.text);
ok(r24 && /قوی‌ترین/.test(r24.text) && /(ضعیف‌ترین|هیچ بخشی زیر میانه نبود)/.test(r24.text), "24 h report: strongest and weakest vs the page's medians");
ok(r24 && /فالوور کل پیج/.test(r24.text), "24 h report: followers gained on the publish day");
ok(r24 && !/NaN|undefined|null/.test(r24.text), "24 h report has no NaN/undefined/null", r24?.text);
const r7 = msgs(n).find((b) => /گزارش ۷ روزه/.test(b.text || "") && /NEW7D/.test(b.text));
ok(!!r7, "7-day report for a week-old post", msgs(n).map((b) => (b.text || "").slice(0, 40)).join(" | "));
n = await job("postreports");
ok(!msgs(n).some((b) => /گزارش (۲۴ ساعته|۷ روزه)/.test(b.text || "")), "each report is sent once");

// Zernio webhooks
const wtok = crypto.createHash("sha256").update("test-secret:zernio").digest("hex").slice(0, 32);
const body = JSON.stringify({ id: "ev1", event: "account.disconnected", account: { platform: "instagram", username: "mybrand" } });
const sig = crypto.createHmac("sha256", "test-secret").update(body).digest("hex");
const wh = (k, b, s) => fetch(W + "/zernio/webhook?k=" + k, { method: "POST", headers: { "content-type": "application/json", ...(s ? { "x-zernio-signature": s } : {}) }, body: b });
ok((await wh("nope", body, sig)).status === 403, "webhook refuses a wrong URL token");
ok((await wh(wtok, body, "deadbeef")).status === 401, "webhook refuses a bad signature");
n = calls().length; ok((await wh(wtok, body, sig)).status === 200, "webhook accepts a signed event");
await sleep(400);
ok(msgs(n).some((b) => /قطع شد/.test(b.text || "")), "account.disconnected → alert in Telegram");
n = calls().length; await wh(wtok, body, sig); await sleep(400);
ok(!msgs(n).some((b) => /قطع شد/.test(b.text || "")), "the same event id is not alerted twice");
const pub = JSON.stringify({ id: "ev2", event: "post.platform.published", platform: "instagram", platformPostUrl: "https://www.instagram.com/reel/X1/" });
n = calls().length; await wh(wtok, pub, crypto.createHmac("sha256", "test-secret").update(pub).digest("hex")); await sleep(400);
ok(msgs(n).some((b) => /منتشر شد/.test(b.text || "") && /X1/.test(b.text)), "post.platform.published → «منتشر شد» with the link");

// 📊 button
n = calls().length;
await hook({ message: { message_id: uid, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text: "📊 داشبورد" } }); await sleep(800);
const b = msgs(n)[0];
ok(b && b.reply_markup.inline_keyboard.flat().some((x) => x.url && x.url.includes("/dashboard?k=")) && b.reply_markup.inline_keyboard.flat().some((x) => x.callback_data === "g:daily"), "📊 sends the dashboard link + «report now»");

const errs = (fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|reports |Uncaught/g) || []);
ok(errs.length === 0, "no errors in worker log", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
