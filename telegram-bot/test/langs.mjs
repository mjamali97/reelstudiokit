// Smoke test of one language against a running worker (LANG in .dev.vars): the menu and the status screen speak it.
// node test/langs.mjs <lang>
import fs from "node:fs";
const L = process.argv[2], W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const d = (await import(`../src/locales/${L}.js`)).default, t = (s) => d[s] ?? s;
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (c, n, e = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${n}${!c && e ? "  → " + e : ""}`); };
const post = (text) => fetch(W + "/tg/studio", { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: Math.floor(Math.random() * 1e9), message: { message_id: 1, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text } }) });
let n = calls().length; await post("/start"); await sleep(1500);
const menu = calls().slice(n).find((c) => c.body?.reply_markup?.keyboard)?.body.reply_markup.keyboard.flat().map((b) => b.text) || [];
ok(menu.includes(t("📊 Dashboard")) && menu.includes(t("💡 Ideas")) && menu.includes(t("💬 Inbox")), `${L}: menu in the language`, menu.join(" | "));
n = calls().length; await post(t("⚙️ Status")); await sleep(1500);
const st = calls().slice(n).find((c) => c.method === "sendMessage")?.body.text || "";
ok(st.includes(t("⚙️ <b>Status</b>")), `${L}: the status button answers in the language`, st.slice(0, 80));
ok(!/NaN|undefined/.test(st) && st.includes(t("off")), `${L}: the schedule shows the news check as off (NEWS_CHECK_AT "off"), never NaN`, st.split("\n").slice(-2).join(" "));
console.log(`${pass} passed, ${fail} failed`);
