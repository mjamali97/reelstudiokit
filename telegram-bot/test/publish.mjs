// Local check (run with ZERNIO_DRY_RUN=0 in .dev.vars; the mock plays Zernio): reel publish card, scheduling (Zernio + DM automation + Telegram), cancel, edits, dashboard feed, auto story.
import fs from "node:fs"; import crypto from "node:crypto";
const W = "http://127.0.0.1:8787", OWNER = 100000001, LOG = new URL("./calls.jsonl", import.meta.url);
const calls = () => fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
let uid = 30000, pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}${!c && extra ? "  → " + String(extra).slice(0, 400) : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (path, u) => fetch(W + path, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "test-secret" }, body: JSON.stringify({ update_id: uid++, ...u }) });
async function step(u, path = "/tg/studio", wait = 1500) { const n = calls().length; await post(path, u); for (let t = 0; t < 40; t++) { await sleep(150); if (calls().length > n) { await sleep(wait); break; } } return calls().slice(n); }
const msg = (text) => ({ message: { message_id: uid, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text } });
const cb = (data, photo = false) => ({ callback_query: { id: "q" + uid, from: { id: OWNER }, data, message: { message_id: 9, chat: { id: OWNER }, ...(photo ? { photo: [{}] } : { text: "x" }) } } });
const api = (p, m = "GET", b) => fetch(W + p, { method: m, headers: { "x-api-key": "test-ingest", "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then((r) => r.json());
const btns = (c) => (c?.body?.reply_markup?.inline_keyboard || []).flat().map((b) => b.text + "|" + b.callback_data);

let n0 = calls().length;
const p = await api("/api/packages", "POST", { slug: "cake", folder: "reels/draft-cake", title: "کیک‌های هفته، با قیمت", zernio_post_id: "zdraft1",
  video_url: "https://media.example/cake.mp4", yt_url: "https://media.example/cake-yt.mp4", cover_url: "https://media.example/cake.jpg",
  ig_caption: "کیک‌های این هفته:\n\nexample.com/menu", yt_title: "منوی کیک این هفته", yt_desc: "توضیحات", gate: "منو", dm: "سلام! اینم لینک‌ها 🙌", dm_media: "https://media.example/gate.jpg", telegram: "🎂 کیک‌های این هفته\n\n➡️ @my_channel" });
await sleep(800);
const card = calls().slice(n0).find((c) => c.method === "sendPhoto");
ok(card && card.body.photo === "https://media.example/cake.jpg" && /پیشنهاد/.test(card.body.caption), "package → card with the cover photo and a suggested time", JSON.stringify(calls().slice(n0)).slice(0, 300));
ok(btns(card).some((x) => x.startsWith("✅") && x.includes(`pk:s:${p.id}:`)) && btns(card).some((x) => x.includes(`pk:trial:${p.id}`)) && btns(card).some((x) => x.includes(`pk:audio:${p.id}`)), "card: ✅ suggested time, 🧪 trial, 🎵 audio buttons");
ok(!/فالو کن/.test(card.body.caption) && /بدون شرط فالو/.test(card.body.caption), "card says DM goes to everyone (no follow gate)");
const old = (await api("/api/drafts")).filter((d) => d.source === "reels/draft-cake");
ok(old.every((d) => d.status === "rejected"), "imported cake reel/telegram drafts replaced by the package", old.map((d) => d.status).join(","));
let r = await step(cb(`pk:trial:${p.id}`, true));
ok(r.some((c) => c.method === "editMessageCaption" && /تریال: روشن/.test(c.body.caption)), "🧪 toggles trial on the same card");
r = await step(cb(`pkv:${p.id}:3`));
ok(r.some((c) => c.body.text === "سلام! اینم لینک‌ها 🙌"), "👀 shows the full DM text alone");
await step(cb(`pke:${p.id}:3`)); r = await step(msg("سلام رفیق! اینم لینک‌هایی که گفتم 🙌"));
ok((await api("/api/packages")).find((x) => x.id === p.id).dm === "سلام رفیق! اینم لینک‌هایی که گفتم 🙌", "✏️ edits the DM text");
n0 = calls().length;
const btn = btns(card).find((x) => x.startsWith("✅")).split("|")[1];
r = await step(cb(btn, true), "/tg/studio", 2500);
const z = calls().slice(n0).filter((c) => c.zernio);
const put = z.find((c) => c.method === "PUT" && c.path === "/posts/zdraft1");
ok(put && put.body.isDraft === false && put.body.scheduledFor, "✅ → Zernio post promoted from draft to scheduled", JSON.stringify(put?.body).slice(0, 200));
const igp = put?.body.platforms.find((x) => x.platform === "instagram"), ytp = put?.body.platforms.find((x) => x.platform === "youtube");
ok(igp?.platformSpecificData.instagramThumbnail === "https://media.example/cake.jpg" && igp.platformSpecificData.audioName === "My Studio" && igp.platformSpecificData.trialParams, "Instagram: cover, audio name = BRAND_NAME, trial");
ok(ytp?.customMedia[0].url === "https://media.example/cake-yt.mp4" && ytp.customMedia[0].thumbnail && ytp.platformSpecificData.title === "منوی کیک این هفته", "YouTube: own cut, cover as thumbnail, title");
const auto = z.find((c) => c.method === "POST" && c.path === "/comment-automations");
ok(auto && auto.body.keywords[0] === "منو" && auto.body.postId === "zdraft1" && !auto.body.audience && !auto.body.followGate && auto.body.dmMessage.startsWith("سلام رفیق"), "gate DM automation: keyword MIT, bound to the post, NO follow gate", JSON.stringify(auto?.body).slice(0, 250));
ok(calls().slice(n0).some((c) => c.bot === "TEST_PUBLISHER" && c.body.text === "🎂 کیک‌های این هفته\n\n➡️ @my_channel"), "Telegram post → publisher bot for the final ✅ (not the channel)");
ok(!calls().slice(n0).some((c) => c.body?.chat_id === "@my_channel"), "nothing reached the channel");
const sp = (await api("/api/packages")).find((x) => x.id === p.id);
ok(sp.status === "scheduled" && sp.automation_id && sp.telegram_draft_id, "package scheduled, automation + telegram draft linked");
n0 = calls().length;
await step(cb(`pk:un:${p.id}`, true)); r = await step(cb(`pk:un2:${p.id}`, true), "/tg/studio", 2000);
const z2 = calls().slice(n0).filter((c) => c.zernio);
ok(z2.some((c) => c.method === "PUT" && c.body.isDraft === true) && z2.some((c) => c.method === "DELETE" && c.path.startsWith("/comment-automations/")), "↩️ cancel (after «آره») → Zernio back to draft, automation deleted");
ok((await api("/api/packages")).find((x) => x.id === p.id).status === "ready", "package back to ready");
r = await step(msg("🎬 ریل‌ها"));
const lst = r.find((c) => c.method === "sendMessage");
ok(btns(lst).some((x) => x.includes(`pko:${p.id}`)) && /💡/.test(btns(lst).join(" ")), "🎬 ریل‌ها lists packages as buttons with the suggested day");
// cadence: two more ready packages get different reel days (Sun/Tue/Thu), never the same
const p2 = await api("/api/packages", "POST", { slug: "t2", title: "تست ۲", zernio_post_id: "zd2", video_url: "https://m/2.mp4", silent: true });
const p3 = await api("/api/packages", "POST", { slug: "t3", title: "تست ۳", zernio_post_id: "zd3", video_url: "https://m/3.mp4", silent: true });
r = await step(msg("🎬 ریل‌ها"));
const days = btns(r.find((c) => c.method === "sendMessage")).filter((x) => x.startsWith("💡")).map((x) => x.split(" · ")[0]);
ok(days.length >= 3 && new Set(days).size === days.length && days.every((d) => /یکشنبه|سه‌شنبه|پنجشنبه/.test(d)), "each ready reel gets its own reel day (REEL_DAYS default Sun/Tue/Thu)", days.join(" | "));
r = await step(cb(`pk:t:${p2.id}:1:1830`, true));
ok(r.some((c) => c.method === "answerCallbackQuery" && /قدیمیه/.test(c.body.text)), "old-format buttons are refused");
// dashboard feed
const tok = crypto.createHash("sha256").update("test-ingest:dashboard").digest("hex").slice(0, 40);
ok((await fetch(W + "/api/dashboard?k=nope")).status === 401, "dashboard feed refuses a wrong token");
const dsh = await (await fetch(W + "/api/dashboard?k=" + tok)).json();
ok(["posts", "followers", "account30", "active", "pipeline", "ideas", "news"].every((k) => Array.isArray(dsh[k])) && dsh.posts[0]?.views > 0 && dsh.active.length > 0, "dashboard feed: 7 datasets from Zernio + bot", Object.keys(dsh).join(","));
ok(dsh.pipeline.some((x) => x.title === "کیک‌های هفته، با قیمت"), "pipeline includes the reel package");
// auto story (no sticker)
const st = await api("/api/drafts", "POST", { kind: "story", title: "خبر تست", body: "استوری ۱:\nفریم یک\n\nاستوری ۲:\nفریم دو", scheduled_for: new Date(Date.now() + 3600e3).toISOString() });
await sleep(500);
n0 = calls().length;
await step(cb(`g:storyimg:${st.id}`));
await fetch(W + "/__scheduled?cron=" + encodeURIComponent("* * * * *"));
for (let i = 0; i < 90 && !(await api("/api/drafts")).find((x) => x.id === st.id && x.status === "scheduled"); i++) await sleep(1000);
const zs = calls().slice(n0).filter((c) => c.zernio && c.method === "POST" && c.path === "/posts");
ok(zs.length === 2 && zs.every((c) => c.body.platforms[0].platformSpecificData.contentType === "story"), "no-sticker story: 2 frames uploaded and scheduled as Instagram stories", zs.length);
const sd = (await api("/api/drafts")).find((x) => x.id === st.id);
ok(sd.status === "scheduled" && JSON.parse(sd.ext).length === 2, "story draft scheduled with its Zernio ids");
const errs = (fs.readFileSync(new URL("./dev.log", import.meta.url), "utf8").match(/handler error|publisher error|Uncaught/g) || []);
ok(errs.length === 0, "no errors in worker log", errs.join(","));
console.log(`\n${pass} passed, ${fail} failed`);
