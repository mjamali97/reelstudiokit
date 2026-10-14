// Reel Studio bot · Cloudflare Worker (no server, no laptop).
//   /tg/studio     webhook of your Studio bot    (only OWNER_ID is answered)
//   /tg/publisher  webhook of your Publisher bot (posts approved drafts to PUBLISH_CHAT)
// Everything personal (brand, handles, audience, times, colours) comes from wrangler.jsonc → vars; see README.md.
//   /setup?key=    registers both webhooks, commands and the menu (uses the tokens inside the Worker)
//   /api/*         for Claude routines and the laptop: X-Api-Key = INGEST_KEY
//   cron * * * * * runs queued jobs; every 5th minute publishes due drafts; NEWS_CHECK_AT / STORY_IDEA_AT (local time) run the daily jobs
// Safety: PUBLISH_CHAT defaults to the owner's private chat (test) and ZERNIO_DRY_RUN=1 shows Zernio calls without sending.

import puppeteer from "@cloudflare/puppeteer";
import { makeReports } from "./reports.js";
import { FONT_BLACK, FONT_SEMIBOLD } from "./fonts.js";
// formats: the kit's defaults (formats.base.js) with your overrides (formats.js) on top; a missing override falls back
import * as BASE from "./formats.base.js";
import * as YOURS from "./formats.js";
Object.assign(BASE.O, YOURS);
const { brand, NEWS_PROMPT, STORY_PROMPT, SEARCH_PROMPT, RESEARCH_PROMPT, POST_PROMPT, REPLY_PROMPT, storyParts, storyBody, frameHtml, replyPool, tagsDefault } = { ...BASE, ...YOURS };
import { _, _f, num, setLang, lang, listSep, grouped } from "./i18n.js";

const fa = (n) => num(n);   // digits in the bot's language (Persian ۰۱۲, Arabic ٠١٢, Latin elsewhere)
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const now = () => new Date().toISOString();

// "HH:MM" → {H, M, s}; a missing, "off" or malformed value falls back to the default (never NaN:undefined on a screen)
const hm = (v, dflt) => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(v ?? "")), d = /^(\d{1,2}):(\d{2})$/.exec(dflt);
  const [H, M] = (m && +m[1] < 24 && +m[2] < 60 ? m : d).slice(1, 3).map(Number);
  return { H, M, s: `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}` };
};
const hmOrOff = (v, dflt) => (v === "off" ? _("off") : fa(hm(v, dflt).s));   // a daily job's time on a screen
const reelTime = (env) => hm(env.REEL_TIME, "18:30");
const storyTime = (env) => hm(env.STORY_POST_TIME, "10:00");
const newsTime = (env) => hm(env.NEWS_POST_TIME, "20:00");
const tags = (env) => (env.TAGS || tagsDefault()).split(",").map((x) => x.trim()).filter(Boolean);

const MENU = (env = {}) => ({
  keyboard: [
    [{ text: _("🎬 Reels") }, { text: _("📝 Drafts") }],
    [{ text: _("💡 Ideas") }, { text: _("📅 Schedule") }],
    [{ text: _("📸 Stories") }, { text: _("📰 News") }],
    [{ text: _("🔎 Search") }, { text: _("➕ New idea") }],
    [{ text: _("📊 Dashboard") }, { text: _("⚙️ Status") }],
    env.AGENCY === "on" ? [{ text: _("💬 Inbox") }, { text: _("👥 Clients") }] : [{ text: _("💬 Inbox") }],
  ],
  resize_keyboard: true, is_persistent: true, input_field_placeholder: _("Send a link or an idea…"),
});
const KIND_FA = () => ({ youtube: _("YouTube"), instagram: _("Instagram"), x: _("X"), news: _("News"), site: _("Site"), note: _("Note") });
const DRAFT_FA = () => ({ telegram: _("Telegram post"), news: _("Telegram news"), story: _("Auto story"), story_manual: _("Manual story (link/poll)"), reel: _("Reel"), carousel: _("Carousel") });
const STATUS_FA = () => ({ draft: _("Draft"), pending_final: _("Waiting for the final OK in the publisher bot"), scheduled: _("Approved and scheduled"), published: _("Published"), rejected: _("Rejected") });
const MENU_TEXTS = (env) => MENU(env).keyboard.flat().map((b) => b.text);
const KIND_EMOJI = { telegram: "📣", news: "📰", story: "📸", story_manual: "📸", reel: "🎬", carousel: "🖼" };
const cancelKb = () => ({ inline_keyboard: [[{ text: _("✖️ Never mind"), callback_data: "x:cancel" }]] });
const setState = (env, chat, mode, ref = null) => env.DB.prepare("INSERT OR REPLACE INTO state (chat_id, mode, ref) VALUES (?,?,?)").bind(String(chat), mode, ref).run();

// ---------- Telegram ----------
async function tg(env, token, method, body) {
  const r = await fetch(`${env.TG_API}/bot${token}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({ ok: false, description: `HTTP ${r.status}` }));
  if (!j.ok) console.log("tg error", method, j.description);
  return j;
}
const studio = (env, m, b) => tg(env, env.STUDIO_BOT_TOKEN, m, b);
const publisher = (env, m, b) => tg(env, env.PUBLISHER_BOT_TOKEN, m, b);
const sendTo = (env, chat, text, extra = {}) => publisher(env, "sendMessage", { chat_id: chat, text: String(text).slice(0, 4096), parse_mode: "HTML", disable_web_page_preview: true, ...extra });
async function sendDoc(env, chat, bytes, name, caption, viaPublisher = false) {
  const fd = new FormData();
  fd.append("chat_id", String(chat)); fd.append("caption", String(caption || "").slice(0, 1024));
  fd.append("document", new Blob([bytes], { type: "application/pdf" }), name);
  return (await fetch(`${env.TG_API}/bot${viaPublisher ? env.PUBLISHER_BOT_TOKEN : env.STUDIO_BOT_TOKEN}/sendDocument`, { method: "POST", body: fd })).json().catch(() => ({ ok: false }));
}
async function pdf(env, html) {
  if (env.FAKE_SHOTS === "1") return new TextEncoder().encode("%PDF-1.4\n% local test\n");
  if (!env.BROWSER) throw new Error(_("Browser Rendering is not connected to the bot."));
  const b = await puppeteer.launch(env.BROWSER);
  try { const pg = await b.newPage(); await pg.setContent(html, { waitUntil: "load" }); await pg.evaluate(async () => { await document.fonts.ready; }); return await pg.pdf({ format: "A4", printBackground: true }); }
  finally { await b.close(); }
}
async function publisherName(env) {
  const c = (await env.DB.prepare("SELECT v FROM kv WHERE k='pubname'").first())?.v;
  if (c) return c;
  const r = await publisher(env, "getMe", {}), n = r.result?.username;
  if (n) await env.DB.prepare("INSERT OR REPLACE INTO kv (k, v) VALUES ('pubname', ?)").bind(n).run();
  return n || null;
}
const say = (env, text, extra = {}) => studio(env, "sendMessage", { chat_id: env.OWNER_ID, text: String(text).slice(0, 4096), parse_mode: "HTML", disable_web_page_preview: true, ...extra });

// ---------- time (local = TZ_NAME, any IANA zone, DST-safe) ----------
function localParts(d = new Date(), env) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: env.TZ_NAME, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t) => +p.find((x) => x.type === t).value;
  return { y: g("year"), m: g("month"), d: g("day"), H: g("hour") % 24, M: g("minute") };
}
// a wall-clock time in TZ_NAME → UTC ISO
function localToUtc(env, y, m, d, H, M) {
  const want = Date.UTC(y, m - 1, d, H, M);
  const offAt = (t) => { const p = localParts(new Date(t), env); return Date.UTC(p.y, p.m - 1, p.d, p.H, p.M) - t; };
  let t = want - offAt(want);
  t = want - offAt(t);
  return new Date(t).toISOString();
}
function slot(env, dayOffset, H, M) {
  const t = localParts(new Date(Date.now() + dayOffset * 86400000), env);
  return localToUtc(env, t.y, t.m, t.d, H, M);
}
function fmtDate(iso, env) {
  if (!iso) return "—";
  const t = localParts(new Date(iso), env);
  return `${fa(t.y)}-${fa(String(t.m).padStart(2, "0"))}-${fa(String(t.d).padStart(2, "0"))}`;
}
function fmtTime(iso, env) {
  if (!iso) return "—";
  const t = localParts(new Date(iso), env);
  return `${fa(String(t.H).padStart(2, "0"))}:${fa(String(t.M).padStart(2, "0"))}`;
}
const fmtLocal = (iso, env) => (iso ? _f("{0} at {1}", fmtDate(iso, env), fmtTime(iso, env)) : "—");

// ---------- ideas ----------
function kindOf(url) {
  const h = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  if (/(youtube\.com|youtu\.be)$/.test(h)) return "youtube";
  if (/instagram\.com$/.test(h)) return "instagram";
  if (/(x\.com|twitter\.com)$/.test(h)) return "x";
  if (/(news|bbc|reuters|techcrunch|theverge|bloomberg|cnn|nytimes|wsj|ft\.com|zoomit|digiato)/.test(h)) return "news";
  return "site";
}
async function describe(url, kind) {
  try {
    if (kind === "youtube") {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
      if (r.ok) { const j = await r.json(); return { title: j.title, summary: j.author_name }; }
    }
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (reel-studio-bot)" }, redirect: "follow", cf: { cacheTtl: 300 } });
    const html = (await r.text()).slice(0, 300000);
    const meta = (p) => (html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']+)`, "i")) || [])[1];
    const t = meta("og:title") || (html.match(/<title[^>]*>([^<]+)/i) || [])[1];
    return { title: t?.trim().slice(0, 200), summary: (meta("og:description") || meta("description") || "").trim().slice(0, 300) };
  } catch (e) { return { title: null, summary: null }; }
}
function ideaCard(i) {
  const lines = [_f("💡 <b>Idea #{0}</b> · {1}{2}{3}", fa(i.id), KIND_FA()[i.kind] || i.kind, i.starred ? " · ⭐" : "", i.tag ? " · #" + esc(i.tag) : "")];
  if (i.title) lines.push(`<b>${esc(i.title)}</b>`);
  if (i.summary) lines.push(esc(i.summary));
  if (i.hook) lines.push(_f("🎣 Hook: {0}", esc(i.hook)));
  if (i.gate) lines.push(_f("🔑 Gate: {0}", esc(i.gate)));
  if (i.note) lines.push(`📝 ${esc(i.note)}`);
  if (i.score != null) lines.push(_f("🔥 Viral score: {0} of 10", fa(i.score)));
  if (i.tier != null) lines.push(_f("🪜 Distance tier: {0}", fa(i.tier)));
  if (i.source) lines.push(_f("<i>Source: {0}</i>", esc(i.source)));
  if (i.url) lines.push(esc(i.url));
  return lines.join("\n");
}
const ideaKb = (i) => ({ inline_keyboard: [
  [{ text: i.starred ? _("☆ Unstar") : _("⭐ Mark important"), callback_data: `i:star:${i.id}` }, { text: _("🏷 Tag"), callback_data: `i:tags:${i.id}` }],
  [{ text: _("🧠 Research & score"), callback_data: `g:research:${i.id}` }, { text: _("✍️ Write Telegram post"), callback_data: `g:post:${i.id}` }],
  [{ text: _("📝 Note"), callback_data: `i:note:${i.id}` }, { text: _("✅ Mark as made"), callback_data: `i:done:${i.id}` }, { text: _("🗑 Delete"), callback_data: `i:del:${i.id}` }],
  [{ text: _("↩️ Ideas list"), callback_data: "l:open:0" }],
] });
async function saveIdea(env, text) {
  const url = (text.match(/https?:\/\/\S+/) || [])[0];
  const kind = url ? kindOf(url) : "note";
  const d = url ? await describe(url, kind) : { title: text.slice(0, 120), summary: null };
  const note = url ? text.replace(url, "").trim() || null : null;
  const r = await env.DB.prepare("INSERT INTO ideas (url, kind, title, summary, note) VALUES (?,?,?,?,?) RETURNING *").bind(url || null, kind, d.title || null, d.summary || null, note).first();
  await say(env, ideaCard(r), { reply_markup: ideaKb(r) });
}
async function listIdeas(env, page = 0, filter = "open") {
  const per = 8, where = filter === "star" ? "starred=1 AND status!='deleted'" : filter === "done" ? "status='done'" : "status IN ('new','open')";
  const rows = (await env.DB.prepare(`SELECT * FROM ideas WHERE ${where} ORDER BY starred DESC, id DESC LIMIT ? OFFSET ?`).bind(per + 1, page * per).all()).results;
  const more = rows.length > per; const show = rows.slice(0, per);
  const title = { open: _("💡 Open ideas"), star: _("⭐ Important ideas"), done: _("✅ Made ideas") }[filter];
  const body = show.length ? _("Tap an idea to open its card.") : _("Nothing here. Send a link or an idea to save it.");
  const nav = [];
  if (page > 0) nav.push({ text: _("◀️ Previous"), callback_data: `l:${filter}:${page - 1}` });
  if (more) nav.push({ text: _("Next ▶️"), callback_data: `l:${filter}:${page + 1}` });
  const kb = show.map((i) => [{ text: `${i.starred ? "⭐ " : ""}${(i.title || i.url || "").slice(0, 44)}`, callback_data: `io:${i.id}` }]);
  if (nav.length) kb.push(nav);
  kb.push([{ text: _("💡 Open"), callback_data: "l:open:0" }, { text: _("⭐ Important"), callback_data: "l:star:0" }, { text: _("✅ Made"), callback_data: "l:done:0" }]);
  return { text: `<b>${title}</b>\n\n${body}`, reply_markup: { inline_keyboard: kb } };
}

// ---------- drafts ----------
function draftCard(d, env) {
  const head = `📝 <b>${DRAFT_FA()[d.kind] || d.kind} #${fa(d.id)}</b> · ${STATUS_FA()[d.status] || d.status}`;
  const when = d.scheduled_for ? `\n⏰ ${fmtLocal(d.scheduled_for, env)}` : "";
  const media = d.media_url ? `\n🖼 ${esc(d.media_url)}` : "";
  const manual = d.kind === "story_manual" || d.kind === "story"
    ? (d.kind === "story" && d.status === "scheduled"
      ? _f("\n\n🤖 This story has no sticker; the images went to Zernio and it posts itself at {0}.", fmtLocal(d.scheduled_for, env))
      : d.result === "imgs"
      ? _("\n\n🖼 The images are ready. After you post it on Instagram (with the sticker), tap «✅ I posted it».")
      : _("\n\n👆 Text first: if it's fine, tap «✅ Text is OK»; you can ✏️ each frame separately. The images are made after your OK."))
    : "";
  const note = d.note ? `\n\n<i>📎 ${esc(d.note)}</i>` : "";
  return `${head}${when}${media}\n\n${esc(d.body || "")}${manual}${note}`;
}
function draftKb(d) {
  const back = [{ text: _("↩️ Drafts"), callback_data: "dl" }];
  if (d.status === "published" && d.result === "manual") return { inline_keyboard: [[{ text: _("↩️ My mistake, back to draft"), callback_data: `d:undo:${d.id}` }], back] };
  if (d.status === "rejected") return { inline_keyboard: [[{ text: _("↩️ Back to draft"), callback_data: `d:undo:${d.id}` }], back] };
  if (d.status === "published") return { inline_keyboard: [back] };
  if (d.status === "pending_final") return { inline_keyboard: [[{ text: _("📣 Send to the publisher bot again"), callback_data: `d:pub:${d.id}` }], [{ text: _("❌ Reject"), callback_data: `d:rej:${d.id}` }], back] };
  if (d.kind === "story" && d.status === "scheduled") return { inline_keyboard: [[{ text: _("❌ Cancel auto story"), callback_data: `stc:${d.id}` }], back] };
  if (d.kind === "story_manual" || d.kind === "story") {
    const n = storyParts(d).frames.length, imgs = d.result === "imgs";
    const frameBtns = Array.from({ length: n }, (_, i) => ({ text: _f("✏️ Story {0}", fa(i + 1)), callback_data: `sf:${d.id}:${i}` }));
    const rows = [];
    if (!imgs) rows.push([{ text: _("✅ Text is OK, make the images"), callback_data: `g:storyimg:${d.id}` }]);
    else rows.push([{ text: _("✅ I posted it"), callback_data: `d:done:${d.id}` }, { text: _("🖼 Make again"), callback_data: `g:storyimg:${d.id}` }]);
    for (let i = 0; i < frameBtns.length; i += 3) rows.push(frameBtns.slice(i, i + 3));
    rows.push([{ text: _("✏️ Whole text"), callback_data: `d:edit:${d.id}` }, { text: _("❌ Reject"), callback_data: `d:rej:${d.id}` }], back);
    return { inline_keyboard: rows };
  }
  const tgKind = d.kind === "telegram" || d.kind === "news";
  const pub = tgKind ? (d.scheduled_for && new Date(d.scheduled_for) > new Date() ? _("✅ Approve for this time") : _("✅ Ready, send for the final OK")) : _("✅ Approve and send to Zernio");
  return { inline_keyboard: [
    [{ text: pub, callback_data: `d:pub:${d.id}` }],
    [{ text: _("⏰ Schedule"), callback_data: `d:when:${d.id}` }, { text: _("✏️ Edit"), callback_data: `d:edit:${d.id}` }, { text: _("❌ Reject"), callback_data: `d:rej:${d.id}` }],
    back,
  ] };
}
const whenKb = (env, id) => {
  const r = reelTime(env), n = newsTime(env), st = storyTime(env), b = (day, t) => ({ text: `${day ? _("Tomorrow") : _("Today")} ${fa(t.s)}`, callback_data: `w:${id}:${day}:${t.H}:${t.M}` });
  return { inline_keyboard: [[b(0, r), b(0, n)], [b(1, st), b(1, r), b(1, n)],
    [{ text: _("⏹ Unschedule"), callback_data: `w:${id}:x` }, { text: _("↩️ Back"), callback_data: `d:show:${id}` }]] };
};
async function getDraft(env, id) { return env.DB.prepare("SELECT * FROM drafts WHERE id=?").bind(id).first(); }
async function setDraft(env, id, fields) {
  const keys = Object.keys(fields);
  await env.DB.prepare(`UPDATE drafts SET ${keys.map((k) => `${k}=?`).join(",")}, updated_at=datetime('now') WHERE id=?`).bind(...keys.map((k) => fields[k]), id).run();
  return getDraft(env, id);
}
async function listDrafts(env, kinds) {
  const ks = kinds.map(() => "?").join(",");
  return (await env.DB.prepare(`SELECT * FROM drafts WHERE status IN ('draft','pending_final','scheduled') AND kind IN (${ks}) ORDER BY COALESCE(scheduled_for, created_at) LIMIT 20`).bind(...kinds).all()).results;
}
// a list screen: the text says what it is, every draft is a button that opens its card
function draftList(rows, title, note = "", extra = []) {
  const text = `<b>${title}</b>\n\n${rows.length ? _("Tap one to open its card.") : _("Nothing waiting.")}${note ? "\n\n" + note : ""}`;
  const kb = rows.map((d) => [{ text: `${KIND_EMOJI[d.kind] || "📝"} ${d.status === "scheduled" ? "⏰ " : d.status === "pending_final" ? "📣 " : ""}${(d.title || d.body || "").replace(/\s+/g, " ").slice(0, 40)}`, callback_data: `do:${d.id}` }]);
  return { text, reply_markup: { inline_keyboard: [...kb, ...extra] } };
}
const ALL_KINDS = ["telegram", "news", "story", "story_manual", "reel", "carousel"];
// a draft's media is a video when its url is an mp4 (Telegram fetches up to 20 MB by url), otherwise a photo
const tgMedia = (d) => /\.(mp4|mov)(\?|$)/i.test(d.media_url || "") ? ["sendVideo", { video: d.media_url, supports_streaming: true }] : ["sendPhoto", { photo: d.media_url }];
async function publishTelegram(env, d) {
  const live = String(env.PUBLISH_CHAT).startsWith("@") || String(env.PUBLISH_CHAT).startsWith("-100");
  const text = live ? d.body : _f("🧪 [Test, only you see this] Preview of the channel post:\n\n{0}", d.body);
  const r = d.media_url
    ? await publisher(env, tgMedia(d)[0], { chat_id: env.PUBLISH_CHAT, ...tgMedia(d)[1], caption: text.slice(0, 1024) })
    : await publisher(env, "sendMessage", { chat_id: env.PUBLISH_CHAT, text, disable_web_page_preview: false });
  if (!r.ok) return { ok: false, msg: r.description || _("Error") };
  return { ok: true, msg: live ? _f("Published in {0}", env.PUBLISH_CHAT) : _("Test mode: the preview was sent to you, not the channel.") };
}

// ---------- final approval: the publisher bot shows the post exactly as the channel will, the owner approves there ----------
const pubToOwner = (env, method, body) => publisher(env, method, { chat_id: env.OWNER_ID, ...body });
async function sendForFinal(env, d) {
  const future = d.scheduled_for && new Date(d.scheduled_for) > new Date();
  const kb = { inline_keyboard: [
    [{ text: future ? _f("✅ Approve, post at {0}", fmtTime(d.scheduled_for, env)) : _("✅ Approve, post now"), callback_data: `pf:ok:${d.id}` }],
    [{ text: _("✏️ Edit"), callback_data: `pf:edit:${d.id}` }, { text: _("❌ Don't send"), callback_data: `pf:no:${d.id}` }],
  ] };
  await pubToOwner(env, "sendMessage", { parse_mode: "HTML", text: _f("📣 <b>Final approval</b> · {0} #{1}\nTo: {2} · {3}\nThe post goes out exactly like this 👇", DRAFT_FA()[d.kind], fa(d.id), esc(env.PUBLISH_CHAT), future ? "⏰ " + fmtLocal(d.scheduled_for, env) : _("right now")) });
  const r = d.media_url
    ? await pubToOwner(env, tgMedia(d)[0], { ...tgMedia(d)[1], caption: (d.body || "").slice(0, 1024), reply_markup: kb })
    : await pubToOwner(env, "sendMessage", { text: d.body || "", disable_web_page_preview: false, reply_markup: kb });
  if (!r.ok) return { ok: false, msg: _("The publisher bot couldn't send the preview. Tap /start once in the publisher bot. (") + (r.description || "") + ")" };
  await setDraft(env, d.id, { status: "pending_final" });
  return { ok: true, msg: _("📣 Sent to the publisher bot; give the final OK there to post it to the channel.") };
}
async function onPublisher(env, u) {
  const m = u.message, q = u.callback_query;
  const chat = String(m?.chat?.id ?? q?.message?.chat?.id ?? "");
  // a client opening their invite link (t.me/<publisher>?start=c_<code>) links their Telegram to their reports
  const startCode = (m?.text || "").match(/^\/start c_([a-f0-9]+)/);
  if (startCode && env.AGENCY === "on") {
    const c = await R.linkClient(env, startCode[1], chat);
    if (!c) return publisher(env, "sendMessage", { chat_id: chat, text: _("This invite link is not valid any more. Ask for a new one.") });
    await publisher(env, "sendMessage", { chat_id: chat, text: _f("✅ Connected. {0}'s daily report, a report after every post and a monthly PDF will arrive here.", c.name) });
    return say(env, _f("🔗 <b>{0}</b> linked their Telegram; their reports now go to them too.", esc(c.name)));
  }
  if (chat !== String(env.OWNER_ID) || String(m?.from?.id ?? q?.from?.id) !== String(env.OWNER_ID)) return;
  const key = "pub:" + chat;
  if (m) {
    const st = await env.DB.prepare("SELECT * FROM state WHERE chat_id=?").bind(key).first();
    if (st?.mode === "pfedit" && m.text && !m.text.startsWith("/")) {
      await env.DB.prepare("DELETE FROM state WHERE chat_id=?").bind(key).run();
      const d = await setDraft(env, st.ref, { body: m.text });
      await say(env, _f("✏️ Post #{0} was edited in the publisher bot.", fa(d.id)));
      return sendForFinal(env, d);
    }
    return pubToOwner(env, "sendMessage", { text: _("✅ The publisher bot is ready.\nPosts you approve in the Studio come here first with a «✅ Approve» button; they go to the channel only after your OK.") });
  }
  const [, a, idS] = (q.data || "").split(":");
  const id = +idS, d = await getDraft(env, id);
  const toast = (text) => publisher(env, "answerCallbackQuery", { callback_query_id: q.id, text });
  const clear = () => publisher(env, "editMessageReplyMarkup", { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } });
  if (!d) return toast(_("Not found"));
  if (d.status !== "pending_final") { await clear(); return toast(_("This one is already decided")); }
  if (a === "edit") { await setState(env, key, "pfedit", id); await toast(""); return pubToOwner(env, "sendMessage", { text: _("✏️ Send the full new text here; a new preview follows."), reply_markup: { inline_keyboard: [[{ text: _("✖️ Never mind"), callback_data: `pf:back:${id}` }]] } }); }
  if (a === "back") { await env.DB.prepare("DELETE FROM state WHERE chat_id=?").bind(key).run(); await clear(); return toast(_("OK")); }
  if (a === "no") { await setDraft(env, id, { status: "draft" }); await clear(); await toast(_("Not sent")); await pubToOwner(env, "sendMessage", { text: _("❌ Not sent. The draft is still in the Studio.") }); return say(env, _f("❌ Post #{0} was rejected in the publisher bot; it's still in drafts.", fa(id))); }
  if (a === "ok") {
    await clear();
    if (d.scheduled_for && new Date(d.scheduled_for) > new Date()) {
      await setDraft(env, id, { status: "scheduled" }); await toast(_("Scheduled ⏰"));
      await pubToOwner(env, "sendMessage", { text: _f("⏰ Approved; it goes to {1} at {0}.", fmtLocal(d.scheduled_for, env), env.PUBLISH_CHAT) });
      return say(env, _f("⏰ Post #{0} has its final OK and goes out at {1}.", fa(id), fmtLocal(d.scheduled_for, env)));
    }
    const r = await publishTelegram(env, d);
    await setDraft(env, id, { status: r.ok ? "published" : "pending_final", result: r.msg });
    await toast(r.ok ? _("Sent ✅") : _("Error"));
    await pubToOwner(env, "sendMessage", { text: (r.ok ? "✅ " : "⚠️ ") + r.msg });
    return say(env, _f("{0} Post #{1}: {2}", r.ok ? "✅" : "⚠️", fa(id), esc(r.msg)));
  }
  return toast("");
}

// ---------- Zernio ----------
async function zernio(env, method, path, body) {
  if (!env.ZERNIO_API_KEY) return { ok: false, error: _("ZERNIO_API_KEY is not set") };
  const r = await fetch(`${env.ZERNIO_API || "https://zernio.com/api/v1"}${path}`, { method, headers: { authorization: `Bearer ${env.ZERNIO_API_KEY}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j };
}
async function sendToZernio(env, d) {
  const acc = await zernio(env, "GET", "/accounts");
  const list = acc.data?.accounts || acc.data?.data || (Array.isArray(acc.data) ? acc.data : []);
  const ig = list.find((a) => (a.platform || "").toLowerCase() === "instagram");
  const yt = list.find((a) => (a.platform || "").toLowerCase() === "youtube");
  const platforms = [];
  if (d.kind === "story" && ig) platforms.push({ platform: "instagram", accountId: ig._id || ig.id, platformSpecificData: { storyType: "story" } });
  if (d.kind === "reel") {
    if (ig) platforms.push({ platform: "instagram", accountId: ig._id || ig.id });
    if (yt) platforms.push({ platform: "youtube", accountId: yt._id || yt.id, platformSpecificData: { videoType: "reel" } });
  }
  const body = { content: d.body, platforms, ...(d.scheduled_for ? { scheduledFor: d.scheduled_for, timezone: "UTC" } : { publishNow: true }) };
  if (d.media_url) body.mediaItems = [{ type: d.kind === "story" && /\.(jpe?g|png|webp)(\?|$)/i.test(d.media_url) ? "image" : "video", url: d.media_url }];
  if (env.ZERNIO_DRY_RUN !== "0") return { ok: true, dry: true, msg: _f("🧪 Zernio test mode (ZERNIO_DRY_RUN=1). This request was built but not sent:\n<pre>{0}</pre>", esc(JSON.stringify(body, null, 1)).slice(0, 2500)) };
  if (!platforms.length) return { ok: false, msg: _("No Instagram/YouTube account found in Zernio.") };
  const r = await zernio(env, "POST", "/posts", body);
  return { ok: r.ok, msg: r.ok ? _("Sent to Zernio ✅") : _f("Zernio error ({0}): {1}", r.status, esc(JSON.stringify(r.data).slice(0, 300))) };
}

// ---------- screens ----------
async function status(env) {
  const c = async (q) => (await env.DB.prepare(q).first())?.n ?? 0;
  const ideas = await c("SELECT COUNT(*) n FROM ideas WHERE status IN ('new','open')");
  const drafts = await c("SELECT COUNT(*) n FROM drafts WHERE status IN ('draft','scheduled')");
  const live = String(env.PUBLISH_CHAT).startsWith("@") || String(env.PUBLISH_CHAT).startsWith("-100");
  let z = _("not set");
  if (env.ZERNIO_API_KEY) {
    const a = await zernio(env, "GET", "/accounts");
    const list = a.data?.accounts || a.data?.data || (Array.isArray(a.data) ? a.data : []);
    z = a.ok ? (list.length ? list.map((x) => `${x.platform}${x.username ? " (" + esc(x.username) + ")" : ""}`).join(_(", ")) : _("connected, but no account is linked")) : _f("error {0}", a.status);
  }
  return [
    _("⚙️ <b>Status</b>"),
    _f("💡 Open ideas: {0} · 📝 Waiting drafts: {1}", fa(ideas), fa(drafts)),
    _f("📣 Telegram publishing: {0}", live ? _("live in ") + esc(env.PUBLISH_CHAT) : _("🧪 Test mode (only you)")),
    `📲 Zernio: ${z}${env.ZERNIO_DRY_RUN !== "0" ? _(" · 🧪 sending off") : ""}`,
    _f("🤖 Publisher bot: {0}", env.PUBLISHER_BOT_TOKEN ? _("token set") : _("no token")),
    "",
    _f("Schedule: reels {0} · story idea {1} (posted {2}) · news every three days {3} (posted {4}), {5} time.", fa(reelTime(env).s), hmOrOff(env.STORY_IDEA_AT, "08:30"), fa(storyTime(env).s), hmOrOff(env.NEWS_CHECK_AT, "18:00"), fa(newsTime(env).s), esc(brand(env).tz)),
    _("Every Telegram post needs a final OK in the publisher bot first."),
  ].join("\n");
}
async function schedule(env) {
  const local = (await env.DB.prepare("SELECT * FROM drafts WHERE status='scheduled' ORDER BY scheduled_for LIMIT 15").all()).results;
  let z = "";
  if (env.ZERNIO_API_KEY) {
    const r = await zernio(env, "GET", "/posts?status=scheduled&limit=10");
    const posts = r.data?.posts || r.data?.data || [];
    z = r.ok ? (posts.length ? posts.map((p) => `• ${fmtLocal(p.scheduledFor, env)} · ${(p.platforms || []).map((x) => x.platform).join("+")} · ${esc((p.content || "").slice(0, 40))}`).join("\n") : _("Nothing scheduled in Zernio.")) : _f("Zernio error ({0}).", r.status);
  } else z = _("The Zernio key is not set yet.");
  const l = local.length ? local.map((d) => `• ${fmtLocal(d.scheduled_for, env)} · ${DRAFT_FA()[d.kind]} · ${esc((d.title || d.body || "").slice(0, 30))}`).join("\n") : _("Nothing.");
  return { text: _f("📅 <b>Schedule</b>\n\n<b>Telegram:</b>\n{0}\n\n<b>Instagram and YouTube (Zernio):</b>\n{1}", l, z),
    reply_markup: { inline_keyboard: [...local.map((d) => [{ text: `⏰ ${fmtTime(d.scheduled_for, env)} · ${(d.title || d.body || "").slice(0, 30)}`, callback_data: `do:${d.id}` }]), [{ text: _("🔄 Refresh"), callback_data: "sc" }]] } };
}
// ---------- inbox, competitors, clients screens ----------
async function inboxList(env) {
  const rows = (await env.DB.prepare("SELECT * FROM inbox WHERE status='carded' ORDER BY id DESC LIMIT 15").all()).results;
  const text = `<b>${_("💬 Inbox")}</b>\n\n${rows.length ? _("Comments and DMs waiting for an answer. Tap one to open it.") : _("Nothing waiting. New comments and DMs arrive here with a suggested reply.")}${env.INBOX_ASSIST === "off" ? "\n\n" + _("(The inbox assistant is off: INBOX_ASSIST.)") : ""}`;
  return { text, reply_markup: { inline_keyboard: rows.map((r) => [{ text: `${r.kind === "dm" ? "✉️" : "💬"} @${r.author}: ${String(r.text).replace(/\s+/g, " ")}`.slice(0, 60), callback_data: `ibo:${r.id}` }]) } };
}
async function competitorsScreen(env, clientId) {
  const list = await R.competitorsOf(env, clientId), cl = clientId ? await R.clientById(env, clientId) : null;
  const text = `<b>${_("🥊 Competitors")}</b>${cl ? " · " + esc(cl.name) : ""}\n\n${list.length ? _("Public numbers of business/creator accounts, checked every Monday with the daily report. Tap 🗑 to remove one.") : _("No competitors yet. Add up to 10 similar pages (same city or niche).")}`;
  return { text, reply_markup: { inline_keyboard: [...list.map((c) => [{ text: `@${c.username}`, url: `https://instagram.com/${c.username}` }, { text: "🗑", callback_data: `cp:rm:${c.id}` }]),
    [{ text: _("➕ Add competitor"), callback_data: `cp:add:${clientId || 0}` }, ...(list.length ? [{ text: _("📊 Compare now"), callback_data: `cp:run:${clientId || 0}` }] : [])],
    ...(cl ? [[{ text: _("↩️ Back"), callback_data: `clo:${cl.id}` }]] : [])] } };
}
async function clientsScreen(env) {
  const cs = await R.clientsAll(env), url = await R.dashLink(env);
  const text = `<b>${_("👥 Clients")}</b>\n\n${cs.length ? _("Each client is a Zernio profile with its own Instagram. Tap one for its card.") : _("No clients yet. In Zernio, create one profile per client and connect their Instagram there; then tap ➕.")}`;
  return { text, reply_markup: { inline_keyboard: [...cs.map((c) => [{ text: `${c.chat_id ? "🔗 " : ""}${c.name}`.slice(0, 50), callback_data: `clo:${c.id}` }]),
    [{ text: _("➕ Add client"), callback_data: "cl:new" }, ...(url ? [{ text: _("📊 Agency dashboard"), url }] : [])]] } };
}
async function clientCard(env, id) {
  const c = await R.clientById(env, id);
  if (!c) return { text: _("Not found."), reply_markup: { inline_keyboard: [[{ text: _("↩️ Back"), callback_data: "cl:list" }]] } };
  const t = await R.targetFor(env, id), url = await R.dashLink(env, c), pub = await publisherName(env);
  const invite = pub ? `https://t.me/${pub}?start=c_${c.join_code}` : null;
  const L = [`👤 <b>${esc(c.name)}</b>`, t ? `📸 @${esc(t.acc.username || "")} · ${fa(t.acc.followersCount ?? "—")}` : _("⚠️ No Instagram account in this Zernio profile yet."),
    c.chat_id ? _("🔗 Telegram linked: the client gets their own reports.") : _("🔗 Telegram not linked yet: send the client the invite link; one tap and their reports go to them too."),
    _f("🔔 Daily and post reports to the client: {0}", c.reports ? _("on") : _("off")), _f("📄 Monthly PDF to the client: {0}", c.monthly ? _("on") : _("off"))];
  return { text: L.join("\n"), reply_markup: { inline_keyboard: [
    [...(url ? [{ text: _("📊 Dashboard"), url }] : []), ...(invite ? [{ text: _("🔗 Invite link"), url: invite }] : [])],
    [{ text: _("📈 Report now"), callback_data: `cl:daily:${c.id}` }, { text: _("📄 Monthly PDF"), callback_data: `cl:pdf:${c.id}` }],
    [{ text: _("🥊 Competitors"), callback_data: `cpm:${c.id}` }],
    [{ text: c.reports ? _("🔔 Client reports: on") : _("🔕 Client reports: off"), callback_data: `cl:rep:${c.id}` }, { text: c.monthly ? _("📄 Client PDF: on") : _("📄 Client PDF: off"), callback_data: `cl:mon:${c.id}` }],
    [{ text: _("🗑 Remove"), callback_data: `cl:del:${c.id}` }, { text: _("↩️ Clients"), callback_data: "cl:list" }]] } };
}

const HELP = (env) => [
  _f("👋 <b>{0} Studio</b>", esc(brand(env).name)),
  "",
  _("Everything works with buttons:"),
  _("💡 Ideas · 📝 Drafts · 🔎 Search · 📅 Schedule · 📸 Stories · 📰 News · ➕ New idea · ⚙️ Status"),
  "",
  _("• Any link or text you send is saved as an idea."),
  _("• On each idea card: 🧠 Research & score · ✍️ Telegram post."),
  _("• Telegram posts: ✅ here first, then the final OK in the publisher bot, then the channel."),
].join("\n");


// ---------- Gemini: news digest, story idea, search, research, post writer (free key: GEMINI_API_KEY) ----------
async function gemini(env, prompt, { search = false, url = false } = {}) {
  if (!env.GEMINI_API_KEY) throw new Error(_("The Gemini key is not added in Cloudflare yet (GEMINI_API_KEY)."));
  const tools = [];
  if (search) tools.push({ google_search: {} });
  if (url) tools.push({ url_context: {} });
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4 }, ...(tools.length ? { tools } : {}) };
  for (const model of ["gemini-flash-latest", "gemini-2.5-flash"]) {
    const r = await fetch(`${env.GEMINI_API || "https://generativelanguage.googleapis.com"}/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 404) continue;
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(j.error?.message || "").slice(0, 160)}`);
    const c = j.candidates?.[0];
    const text = (c?.content?.parts || []).map((x) => x.text || "").join("").trim();
    const sources = (c?.groundingMetadata?.groundingChunks || []).map((g) => g.web).filter((w) => w?.uri).map((w) => ({ title: w.title || "", uri: w.uri }));
    if (!text) throw new Error(_("Gemini returned an empty answer; try again."));
    return { text, sources };
  }
  throw new Error(_("Gemini model not found."));
}
const parseJson = (t) => { const m = t.replace(/```json|```/g, "").match(/\{[\s\S]*\}/); try { return m ? JSON.parse(m[0]) : null; } catch { return null; } };
const stripFence = (t) => t.replace(/^```[a-z]*\n?|\n?```$/g, "").trim();
async function checkLinks(text) {
  const urls = [...new Set(text.match(/https?:\/\/[^\s)»"']+/g) || [])].slice(0, 12), bad = [];
  await Promise.all(urls.map(async (u) => {
    try {
      const r = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (reel-studio-bot link check)" }, signal: AbortSignal.timeout(8000) });
      if (r.status >= 400 && ![401, 403, 429].includes(r.status)) bad.push(u);
    } catch { bad.push(u); }
  }));
  return bad;
}
// Gemini sometimes guesses a URL slug. Search results carry redirect links to the real pages: resolve them and swap a broken
// link for the real page on the same site.
async function fixLinks(body, sources) {
  let bad = await checkLinks(body);
  if (!bad.length || !sources.length) return { body, bad };
  const real = (await Promise.all(sources.slice(0, 10).map(async (s) => {
    try { const r = await fetch(s.uri, { redirect: "manual", signal: AbortSignal.timeout(6000) }); return r.headers.get("location") || null; } catch { return null; }
  }))).filter(Boolean);
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
  for (const u of bad) {
    const hit = real.find((r) => host(r) === host(u)) || real.find((r) => host(r).endsWith(host(u)) || host(u).endsWith(host(r)));
    if (hit) body = body.split(u).join(hit.split("#")[0]);
  }
  bad = await checkLinks(body);
  return { body, bad };
}
const linkNote = (bad, sources) => _f("Made with Gemini{0} · {1}", sources.length ? _f(" + Google Search ({0} sources)", fa(sources.length)) : "", bad.length ? _("⚠️ These links didn't open, check before publishing: ") + bad.join(" ") : _("All links open ✓"));
const isoDay = (env, offset = 0) => { const t = localParts(new Date(Date.now() + offset * 864e5), env); return `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`; };
async function newDraft(env, f) {
  return env.DB.prepare("INSERT INTO drafts (kind, title, body, media_url, scheduled_for, note, source) VALUES (?,?,?,?,?,?,?) RETURNING *")
    .bind(f.kind, f.title || null, f.body, f.media_url || null, f.scheduled_for || null, f.note || null, f.source || null).first();
}

async function makeNews(env) {
  const from = isoDay(env, -3), today = isoDay(env);
  const { text, sources } = await gemini(env, NEWS_PROMPT(env, { today, from, recent: (await usedTopics(env)).titles.slice(-60) }), { search: true });
  const { body, bad } = await fixLinks(stripFence(text), sources);
  const t = localParts(new Date(), env);
  const nt = newsTime(env), at = t.H * 60 + t.M < nt.H * 60 + nt.M - 30 ? slot(env, 0, nt.H, nt.M) : slot(env, 1, nt.H, nt.M);
  const d = await newDraft(env, { kind: "news", title: _f("News digest {0}", today), body, scheduled_for: at, note: linkNote(bad, sources), source: "gemini" });
  await say(env, (_("📰 News digest of the last three days. Tap «✅ Publish» and it goes out by itself at its time:\n\n") + draftCard(d, env)).slice(0, 4000), { reply_markup: draftKb(d) });
}
async function newsIfDue(env) {
  const last = await env.DB.prepare("SELECT MAX(created_at) m FROM drafts WHERE kind='news' AND source='gemini'").first();
  if (!last?.m || Date.now() - Date.parse(last.m.replace(" ", "T") + "Z") > 2.5 * 864e5) await makeNews(env);
}

// Never suggest twice. Everything already suggested, posted, rejected, in the idea
// bank or deleted from it is listed for Gemini, and a reply whose site or tool matches one of them is refused and retried.
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
async function usedTopics(env) {
  const drafts = (await env.DB.prepare("SELECT kind, title, body FROM drafts WHERE kind IN ('story','story_manual','news','telegram') AND created_at > datetime('now','-120 days')").all()).results;
  const ideas = (await env.DB.prepare("SELECT title, url FROM ideas").all()).results;
  const titles = [...drafts.map((d) => d.title), ...ideas.map((i) => i.title)].filter(Boolean).map((t) => t.slice(0, 70));
  const hosts = new Set([...drafts.filter((d) => d.kind !== "news").flatMap((d) => (d.body || "").match(/https?:\/\/[^\s)»"']+/g) || []), ...ideas.map((i) => i.url).filter(Boolean)].map(hostOf).filter((h) => h && !/^(t\.me|x\.com|twitter\.com|github\.com|youtube\.com|youtu\.be|instagram\.com|medium\.com|huggingface\.co|(\w+\.)?(google|anthropic|claude|openai|chatgpt)\.(com|ai))$/.test(h)));
  return { titles: [...new Set(titles)].slice(-150), hosts };
}
const isRepeat = (used, title, link) => (link && used.hosts.has(hostOf(link))) || used.titles.some((t) => {
  const words = (title || "").split(/[\s:،,]+/).filter((w) => /^[A-Za-z][A-Za-z0-9.+-]{2,}$/.test(w));  // tool names in Latin
  return words.some((w) => t.toLowerCase().includes(w.toLowerCase()) && !/^(Instagram|Google|Telegram|YouTube|Online|Shop|Cafe|Studio)$/i.test(w));
});

async function makeStory(env) {
  const today = isoDay(env);
  const used = await usedTopics(env);
  const avoid = _f("\n\nThese were already suggested, published or are in the idea bank; don't suggest any of them (or any tool or site from them) again:\n{0}\nSites already used: {1}", used.titles.slice(-80).map((t) => "- " + t).join("\n"), [...used.hosts].slice(-80).join(_(", ")));
  let text, sources, j;
  for (let attempt = 0; attempt < 3; attempt++) {
    ({ text, sources } = await gemini(env, STORY_PROMPT(env, { today }) + avoid
      + (attempt ? _f("\n\nYour previous suggestion («{0}») was a repeat; find something completely different.", j?.title || "") : ""), { search: true }));
    j = parseJson(text);
    if (!j?.frames?.length) throw new Error(_("The story suggestion wasn't built correctly; tap again."));
    if (!isRepeat(used, j.title, j.link)) break;
    if (attempt === 2) throw new Error(_f("Gemini suggested repeats three times («{0}»); tap «✨» again later.", j.title));
  }
  const sticker = j.sticker === "none" ? "" : j.sticker === "poll" ? _f("📊 Poll: {0}", (j.poll || []).join(" / ")) : j.sticker === "question" ? _f("❓ Question box: {0}", j.question || "") : _f("🔗 Link sticker: {0}", j.link || "");
  const body = storyBody({ frames: j.frames, sticker });
  const bad = j.link ? await checkLinks(j.link) : [];
  const d = await newDraft(env, { kind: sticker ? "story_manual" : "story", title: j.title, body, scheduled_for: (() => { const st = storyTime(env), t = localParts(new Date(), env); return slot(env, t.H * 60 + t.M < st.H * 60 + st.M ? 0 : 1, st.H, st.M); })(),
    note: `${j.why ? _("Why today: ") + j.why + " · " : ""}${linkNote(bad, sources)}`, source: "gemini" });
  await say(env, (_f("📸 Today's story suggestion (at {0}). Check the text first:\n\n", fa(storyTime(env).s)) + draftCard(d, env)).slice(0, 4000), { reply_markup: draftKb(d) });

}

async function search(env, q) {
  if (!q.trim()) return say(env, _("After «search» write what to look for. For example:\nsearch this month's trends in my field"));
  const { text, sources } = await gemini(env, SEARCH_PROMPT(env, q), { search: true });
  const { body, bad } = await fixLinks(stripFence(text), sources);
  const i = await env.DB.prepare("INSERT INTO ideas (kind, title, summary, status, source, note) VALUES ('note', ?, ?, 'search', ?, ?) RETURNING *")
    .bind(q.slice(0, 200), body.slice(0, 3000), _("Search"), bad.length ? _("⚠️ Links that didn't open: ") + bad.join(" ") : null).first();
  const src = sources.length ? _f("\n\n<i>Sources: {0}</i>", esc(sources.slice(0, 6).map((x) => x.title).join(_(", ")))) : "";
  const warn = bad.length ? _f("\n⚠️ These links didn't open: {0}", esc(bad.join(" "))) : "";
  const html = esc(body).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#+\s*/gm, "");
  await say(env, (`🔎 <b>${esc(q)}</b>\n\n${html}${src}${warn}`).slice(0, 4000), { reply_markup: { inline_keyboard: [
    [{ text: _("💡 Save as idea"), callback_data: `g:ssave:${i.id}` }, { text: _("✍️ Make a Telegram post from it"), callback_data: `g:post:${i.id}` }],
    [{ text: _("🧠 Score it"), callback_data: `g:research:${i.id}` }],
  ] } });
}

async function researchIdea(env, id) {
  const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first();
  if (!i) return say(env, _("Idea not found."));
  const { text } = await gemini(env, RESEARCH_PROMPT(env, i), { search: true, url: !!i.url });
  const j = parseJson(text);
  if (!j) throw new Error(_("The research came back broken; tap again."));
  const note = [i.note, j.weak ? _("Weakest part: ") + j.weak : null, j.avoid ? _("Don't say: ") + j.avoid : null].filter(Boolean).join(" · ");
  await env.DB.prepare("UPDATE ideas SET summary=?, hook=?, gate=?, score=?, tier=?, note=?, status=CASE WHEN status='search' THEN 'open' ELSE status END, updated_at=datetime('now') WHERE id=?")
    .bind(j.summary || i.summary, j.hook || null, j.gate || null, Number(j.score) || null, Number.isFinite(+j.tier) ? +j.tier : null, note || null, id).run();
  const r = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first();
  await say(env, _("🧠 Researched:\n\n") + ideaCard(r), { reply_markup: ideaKb(r) });
}

async function postFromIdea(env, id) {
  const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first();
  if (!i) return say(env, _("Idea not found."));
  const { text, sources } = await gemini(env, POST_PROMPT(env, i), { search: true, url: !!i.url });
  const { body, bad } = await fixLinks(stripFence(text), sources);
  const d = await newDraft(env, { kind: "telegram", title: i.title, body, note: linkNote(bad, sources), source: "gemini" });
  await say(env, (_("✍️ The Telegram post is ready:\n\n") + draftCard(d, env)).slice(0, 4000), { reply_markup: draftKb(d) });
}

// ---------- story frames: rendered in Cloudflare Browser Rendering (real Chrome → correct Persian shaping), brand template ----------
async function renderStory(env, d) {
  if (env.FAKE_SHOTS === "1") return { shots: storyParts(d).frames.map(() => new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), sticker: storyParts(d).sticker };  // local tests only
  if (!env.BROWSER) throw new Error(_("Browser Rendering is not connected to the bot."));
  const { frames, sticker, pill } = storyParts(d);
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    const shots = [];
    for (let i = 0; i < frames.length; i++) {
      await page.setContent(frameHtml(env, { title: i === 0 ? d.title : "", text: frames[i], i, n: frames.length, pill, roomForSticker: !!sticker && i === frames.length - 1 }), { waitUntil: "load" });
      await page.evaluate(async () => { await document.fonts.ready; window.fit(); });
      shots.push(await page.screenshot({ type: "png" }));
    }
    return { shots, sticker };
  } finally { await browser.close(); }
}
async function sendStoryImages(env, id) {
  const d = await getDraft(env, id);
  if (!d) return say(env, _("Story not found."));
  const { shots, sticker } = await renderStory(env, d);
  const fd = new FormData();
  fd.append("chat_id", String(env.OWNER_ID));
  const cap = _f("📸 {0} · {1} frames, full quality (1080×1920){2}", d.title || _("Story"), fa(shots.length), sticker ? "\n" + sticker + _("\nThe sticker space at the bottom of the last frame is free.") : "");
  let method;
  if (shots.length === 1) { method = "sendDocument"; fd.append("document", new Blob([shots[0]], { type: "image/png" }), `story-${id}-1.png`); fd.append("caption", cap); }
  else {
    method = "sendMediaGroup";
    fd.append("media", JSON.stringify(shots.map((_, i) => ({ type: "document", media: `attach://f${i}`, ...(i === shots.length - 1 ? { caption: cap } : {}) }))));
    shots.forEach((b, i) => fd.append(`f${i}`, new Blob([b], { type: "image/png" }), `story-${id}-${i + 1}.png`));
  }
  const r = await (await fetch(`${env.TG_API}/bot${env.STUDIO_BOT_TOKEN}/${method}`, { method: "POST", body: fd })).json().catch(() => ({ ok: false }));
  if (!r.ok) throw new Error(_("Telegram didn't accept the images: ") + (r.description || ""));
  console.log("story images sent", id, shots.length);
  let d2 = await setDraft(env, id, { result: "imgs" });
  if (d2.kind === "story") d2 = await scheduleAutoStory(env, d2, shots);
  await say(env, draftCard(d2, env), { reply_markup: draftKb(d2) });
}


// ---------- reel publish packages: Claude uploads to Zernio as a DRAFT only after the owner approved the render;
// the card here sets the time and options; one ✅ schedules Instagram + YouTube, arms the gate DM, and sends the
// Telegram post to the publisher bot for the final ✅ ----------
// public replies under a matching comment, in the creator's voice; Zernio rotates 1 + 5 variations per automation, so each reel gets
// a random 6 of these 12 (identical replies everywhere look like spam to Instagram)
const pickReplies = (n = 6) => [...replyPool()].sort(() => Math.random() - 0.5).slice(0, n);
const PK_FIELDS = ["ig_caption", "yt_title", "yt_desc", "dm", "telegram", "comment_reply"];
const PK_FA = () => ({ ig_caption: _("Instagram caption"), yt_title: _("YouTube title"), yt_desc: _("YouTube description"), dm: _("Gate DM text"), telegram: _("Telegram post"), comment_reply: _("Reply under comments") });
async function zAccounts(env) {
  const a = await zernio(env, "GET", "/accounts");
  const list = a.data?.accounts || [];
  const ig = list.find((x) => x.platform === "instagram"), yt = list.find((x) => x.platform === "youtube");
  return { ig, yt, profileId: ig?.profileId?._id || ig?.profileId };
}
const getPkg = (env, id) => env.DB.prepare("SELECT * FROM packages WHERE id=?").bind(id).first();
async function setPkg(env, id, f) {
  const k = Object.keys(f);
  await env.DB.prepare(`UPDATE packages SET ${k.map((x) => `${x}=?`).join(",")}, updated_at=datetime('now') WHERE id=?`).bind(...k.map((x) => f[x]), id).run();
  return getPkg(env, id);
}
// Cadence: REEL_DAYS (0 = Sunday … 6 = Saturday) at REEL_TIME local, never two Instagram posts on one day. A day is taken when a
// package or ANY scheduled Instagram post on Zernio is on it. Each ready package gets its own next free reel day, in order.
// Pick the days from your own audience data (Zernio → analytics → online followers / best time).
const cadenceDays = (env) => (env.REEL_DAYS || "0,2,4").split(",").map(Number);
const WEEKDAY_FA_ALL = () => [_("Sunday"), _("Monday"), _("Tuesday"), _("Wednesday"), _("Thursday"), _("Friday"), _("Saturday")];
const cadenceLabel = (env) => cadenceDays(env).map((d) => WEEKDAY_FA_ALL()[d]).join(listSep());
const rtCode = (env) => `${String(reelTime(env).H).padStart(2, "0")}${String(reelTime(env).M).padStart(2, "0")}`;
const tDay = (env, iso) => fmtDate(iso, env);
function weekdayLocal(env, iso) { const t = localParts(new Date(iso), env); return new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay(); }
const ymd = (env, iso) => { const t = localParts(new Date(iso), env); return `${t.y}${String(t.m).padStart(2, "0")}${String(t.d).padStart(2, "0")}`; };
async function takenDays(env, exceptPkg = null) {
  const set = new Set();
  for (const r of (await env.DB.prepare("SELECT id, scheduled_for, zernio_post_id FROM packages WHERE status='scheduled' AND scheduled_for IS NOT NULL").all()).results)
    if (r.id !== exceptPkg) set.add(tDay(env, r.scheduled_for));
  const own = exceptPkg ? (await env.DB.prepare("SELECT zernio_post_id FROM packages WHERE id=?").bind(exceptPkg).first())?.zernio_post_id : null;
  const z = await zernio(env, "GET", "/posts?status=scheduled&limit=100");
  // only Instagram counts: two YouTube uploads on one day are fine
  for (const x of z.data?.posts || []) {
    if (x._id && x._id === own) continue;
    for (const pl of x.platforms || []) if (pl.platform === "instagram" && (pl.scheduledFor || x.scheduledFor)) set.add(tDay(env, pl.scheduledFor || x.scheduledFor));
  }
  return set;
}
function freeReelDays(env, n, taken, from = 1) {
  const out = [];
  for (let day = from; day < 120 && out.length < n; day++) {
    const iso = slot(env, day, reelTime(env).H, reelTime(env).M);
    if (cadenceDays(env).includes(weekdayLocal(env, iso)) && !taken.has(tDay(env, iso))) out.push({ day, iso });
  }
  return out;
}
async function suggestSlot(env, p = null, taken = null) {
  taken = taken || await takenDays(env, p?.id);
  const ready = (await env.DB.prepare("SELECT id FROM packages WHERE status='ready' ORDER BY id").all()).results.map((r) => r.id);
  const idx = Math.max(0, ready.indexOf(p?.id ?? -1));
  const slots = freeReelDays(env, idx + 1, taken);
  return slots[idx] || slots[slots.length - 1] || { day: 1, iso: slot(env, 1, reelTime(env).H, reelTime(env).M) };
}
function dayDate(env, iso) {
  const t = localParts(new Date(iso), env);
  return `${WEEKDAY_FA_ALL()[new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay()]} ${fa(t.d)}/${fa(t.m)}`;
}
const dayLabel = (env, iso) => _f("{0} at {1}", dayDate(env, iso), fmtTime(iso, env));
async function pkgCard(env, p) {
  const sug = p.status === "scheduled" ? null : await suggestSlot(env, p);
  const first = (x, n) => esc((x || "").split("\n").filter(Boolean).slice(0, n).join("\n"));
  const lines = [
    `🎬 <b>${esc(p.title)}</b>`,
    p.status === "scheduled" ? _f("✅ <b>Scheduled: {0}</b>", dayLabel(env, p.scheduled_for)) : p.status === "published" ? _("✅ Published") : _f("⏰ Suggested: <b>{0}</b>", dayLabel(env, sug.iso)),
    "",
    _f("📸 <b>Instagram</b>\n{0}…", first(p.ig_caption, 3)),
    _f("▶️ <b>YouTube</b>: {0}", esc(p.yt_title || "—")),
    p.gate ? _f("💬 <b>Auto DM</b>: anyone who comments «{0}» gets the DM (no follow required)", esc(p.gate)) : _("💬 Auto DM: this reel has no gate"),
    p.telegram ? _("📣 <b>Telegram post</b>: ready; at the same time, after your final OK in the publisher bot") : _("📣 Telegram post: none"),
    _f("🧪 Trial: {0} · 🎵 Audio name: {1}", p.trial ? _("on (non-followers first)") : _("off"), p.audio_name ? esc(brand(env).audio) : "Original audio"),
  ];
  const kb = [];
  if (p.status === "scheduled") kb.push(p.automation_id ? [{ text: _("💬 DM report"), callback_data: `pk:dm:${p.id}` }, { text: _("↩️ Unschedule"), callback_data: `pk:un:${p.id}` }] : [{ text: _("↩️ Unschedule"), callback_data: `pk:un:${p.id}` }]);
  else if (p.status === "published" && p.automation_id) kb.push([{ text: _("💬 DM report"), callback_data: `pk:dm:${p.id}` }]);
  else if (p.status !== "published") {
    kb.push([{ text: _f("✅ Publish {0}", dayLabel(env, sug.iso)), callback_data: `pk:s:${p.id}:${ymd(env, sug.iso)}:${rtCode(env)}` }]);
    kb.push([{ text: _("⏰ Another day"), callback_data: `pk:days:${p.id}` }]);
    kb.push([{ text: p.trial ? _("🧪 Trial: on") : _("🧪 Trial: off"), callback_data: `pk:trial:${p.id}` }, { text: p.audio_name ? _f("🎵 Audio: {0}", brand(env).audio).slice(0, 40) : _("🎵 Audio: Original"), callback_data: `pk:audio:${p.id}` }]);
  }
  kb.push(PK_FIELDS.filter((f) => p[f]).slice(0, 3).map((f) => ({ text: `👀 ${PK_FA()[f].split(" ")[0]} ${PK_FA()[f].split(" ")[1] || ""}`.trim(), callback_data: `pkv:${p.id}:${PK_FIELDS.indexOf(f)}` })));
  kb.push(PK_FIELDS.filter((f) => p[f]).slice(3).map((f) => ({ text: `👀 ${PK_FA()[f].split(" ")[0]} ${PK_FA()[f].split(" ")[1] || ""}`.trim(), callback_data: `pkv:${p.id}:${PK_FIELDS.indexOf(f)}` })));
  kb.push([{ text: _("↩️ Reels"), callback_data: "pkl" }]);
  return { caption: lines.join("\n").slice(0, 1024), reply_markup: { inline_keyboard: kb.filter((r) => r.length) } };
}
async function showPkg(env, p, q) {
  const c = await pkgCard(env, p);
  if (q && q.message?.photo) return studio(env, "editMessageCaption", { chat_id: q.message.chat.id, message_id: q.message.message_id, caption: c.caption, parse_mode: "HTML", reply_markup: c.reply_markup });
  if (p.cover_url) return studio(env, "sendPhoto", { chat_id: env.OWNER_ID, photo: p.cover_url, caption: c.caption, parse_mode: "HTML", reply_markup: c.reply_markup });
  return say(env, c.caption, { reply_markup: c.reply_markup });
}
async function pkgList(env) {
  const rows = (await env.DB.prepare("SELECT * FROM packages WHERE status IN ('ready','scheduled') ORDER BY COALESCE(scheduled_for, '9999'), id").all()).results;
  const ready = rows.filter((p) => p.status === "ready");
  const free = ready.length ? freeReelDays(env, ready.length, await takenDays(env)) : [];
  const sugOf = Object.fromEntries(ready.map((p, i) => [p.id, free[i]]));
  return { text: _f("🎬 <b>Reels</b> · {0} at {1}\n\n{2}", cadenceLabel(env), fa(reelTime(env).s), rows.length ? _("⏰ = scheduled · 💡 = suggested day. Tap one to open its card.") : _("No reel is ready. When you approve a render, it appears here.")),
    reply_markup: { inline_keyboard: rows.map((p) => [{ text: `${p.status === "scheduled" ? "⏰ " + dayDate(env, p.scheduled_for) : sugOf[p.id] ? "💡 " + dayDate(env, sugOf[p.id].iso) : "🎬"} · ${p.title}`.slice(0, 64), callback_data: `pko:${p.id}` }]) } };
}
async function schedulePkg(env, p, iso) {
  const { ig, yt, profileId } = await zAccounts(env);
  if (!ig) throw new Error(_("No Instagram account found in Zernio."));
  const platforms = [{ platform: "instagram", accountId: ig._id, customContent: p.ig_caption,
    platformSpecificData: { shareToFeed: true, ...(p.cover_url ? { instagramThumbnail: p.cover_url } : {}),
      ...(p.trial ? { trialParams: { graduationStrategy: "SS_PERFORMANCE" } } : {}), ...(p.audio_name ? { audioName: brand(env).audio } : {}) } }];
  if (yt && p.yt_url) platforms.push({ platform: "youtube", accountId: yt._id, customContent: p.yt_desc || p.ig_caption,
    customMedia: [{ type: "video", url: p.yt_url, ...(p.cover_url ? { thumbnail: p.cover_url } : {}) }],
    platformSpecificData: { title: (p.yt_title || p.title).slice(0, 100), visibility: "public", madeForKids: false, categoryId: "27", containsSyntheticMedia: false } });
  const put = await zernio(env, "PUT", `/posts/${p.zernio_post_id}`, { isDraft: false, scheduledFor: iso, timezone: "UTC", content: p.ig_caption,
    mediaItems: [{ type: "video", url: p.video_url, ...(p.cover_url ? { thumbnail: p.cover_url } : {}) }], platforms });
  if (!put.ok) throw new Error(_f("Zernio rejected the schedule ({0}): {1}", put.status, JSON.stringify(put.data).slice(0, 300)));
  let automation_id = null;
  if (p.gate && p.dm) {
    const a = await zernio(env, "POST", "/comment-automations", { profileId, accountId: ig._id, postId: p.zernio_post_id, name: _f("Gate {0} · {1}", p.gate, p.title).slice(0, 80),
      keywords: [p.gate], matchMode: "contains", dmMessage: p.dm.slice(0, 1000), ...(p.dm_media ? { dmMedia: { type: "image", url: p.dm_media } } : {}),
      ...(() => { const r = p.comment_reply ? [p.comment_reply, ...pickReplies(5)] : pickReplies(6); return { commentReply: r[0], commentReplyVariations: r.slice(1, 6) }; })(),
      publicReplyPolicy: "after_dm", alsoMatchInDms: true, repeatPolicy: { mode: "once" } });
    if (!a.ok) await say(env, _f("⚠️ The reel is scheduled but the auto DM wasn't created ({0}): {1}", a.status, esc(JSON.stringify(a.data).slice(0, 200))));
    automation_id = a.data?.automation?.id || a.data?.automation?._id || a.data?.id || a.data?._id || null;
  }
  let telegram_draft_id = p.telegram_draft_id;
  if (p.telegram) {
    const d = telegram_draft_id ? await setDraft(env, telegram_draft_id, { body: p.telegram, scheduled_for: iso, status: "draft" })
      : await newDraft(env, { kind: "telegram", title: p.title, body: p.telegram, scheduled_for: iso, source: "pkg:" + p.slug });
    telegram_draft_id = d.id;
    await sendForFinal(env, d);
  }
  return setPkg(env, p.id, { status: "scheduled", scheduled_for: iso, automation_id, telegram_draft_id });
}
async function unschedulePkg(env, p) {
  const r = await zernio(env, "PUT", `/posts/${p.zernio_post_id}`, { isDraft: true });
  if (!r.ok) throw new Error(_f("Zernio rejected the cancel ({0}).", r.status));
  if (p.automation_id) await zernio(env, "DELETE", `/comment-automations/${p.automation_id}`);
  if (p.telegram_draft_id) await setDraft(env, p.telegram_draft_id, { status: "draft", scheduled_for: null });
  return setPkg(env, p.id, { status: "ready", scheduled_for: null, automation_id: null });
}
async function onPkgCallback(env, q, t, a, b, c) {
  const toast = (text) => studio(env, "answerCallbackQuery", { callback_query_id: q.id, text });
  if (t === "pkl") { const o = await pkgList(env); await toast(""); return say(env, o.text, { reply_markup: o.reply_markup }); }
  if (t === "pko") { const p = await getPkg(env, +a); await toast(""); return p ? showPkg(env, p) : say(env, _("Not found.")); }
  if (t === "pkv") {
    const p = await getPkg(env, +a), f = PK_FIELDS[+b]; await toast("");
    if (!p || !p[f]) return say(env, _("No text."));
    await say(env, `👀 <b>${PK_FA()[f]}</b> · ${esc(p.title)}`, { reply_markup: { inline_keyboard: [[{ text: _("✏️ Change it"), callback_data: `pke:${p.id}:${b}` }]] } });
    return studio(env, "sendMessage", { chat_id: env.OWNER_ID, text: p[f], disable_web_page_preview: true });
  }
  if (t === "pke") { await setState(env, q.message.chat.id, "pkedit", +a * 10 + +b); await toast(""); return say(env, _f("✏️ Send the full new «{0}» (copy the message above and change it).", PK_FA()[PK_FIELDS[+b]]), { reply_markup: cancelKb() }); }
  const p = await getPkg(env, +b);
  if (!p) return toast(_("Not found"));
  if (a === "trial") { await showPkg(env, await setPkg(env, p.id, { trial: p.trial ? 0 : 1 }), q); return toast(p.trial ? _("Trial off") : _("Trial on")); }
  if (a === "audio") { await showPkg(env, await setPkg(env, p.id, { audio_name: p.audio_name ? 0 : 1 }), q); return toast(""); }
  if (a === "days") {
    const free = freeReelDays(env, 9, await takenDays(env, p.id));
    const kb = [];
    for (let i = 0; i < free.length; i += 3) kb.push(free.slice(i, i + 3).map((f) => ({ text: dayDate(env, f.iso), callback_data: `pk:s:${p.id}:${ymd(env, f.iso)}:${rtCode(env)}` })));
    const tonight = slot(env, 0, 20, 30), taken = await takenDays(env, p.id);
    if (new Date(tonight) > new Date(Date.now() + 15 * 60000) && !taken.has(tDay(env, tonight))) kb.unshift([{ text: _("🌙 Tonight 20:30"), callback_data: `pk:s:${p.id}:${ymd(env, tonight)}:2030` }]);
    kb.push([{ text: _("↩️ Back"), callback_data: `pko:${p.id}` }]);
    await toast(""); return say(env, _f("⏰ When should <b>{0}</b> go out?\nFree reel days ({1}) at {2}; days that already have a post are left out.", esc(p.title), cadenceLabel(env), fa(reelTime(env).s)), { reply_markup: { inline_keyboard: kb } });
  }
  if (a === "t") return toast(_("This card is old; open it again from «🎬 Reels»"));
  if (a === "dm") {
    if (!p.automation_id) return toast(_("This reel has no auto DM"));
    const r = await zernio(env, "GET", `/comment-automations/${p.automation_id}/logs?limit=100`);
    const logs = r.data?.logs || [], by = {};
    for (const l of logs) by[l.status] = (by[l.status] || 0) + 1;
    const last = logs.slice(0, 8).map((l) => `• ${esc(l.commenterUsername ? "@" + l.commenterUsername : l.commenterName || "—")} · ${l.status === "sent" ? _("✅ sent") : l.status === "failed" ? _("⚠️ not sent") : esc(l.status)}`).join("\n");
    await toast("");
    return say(env, _f("💬 <b>Gate DM «{0}»</b> · {1}\n✅ Sent: {2} · ⚠️ Not sent: {3} · ⏳ Queued: {4}{5}{6}\n\n{7}", esc(p.gate), esc(p.title), fa(by.sent || 0), fa(by.failed || 0), fa(by.pending || 0), r.data?.pagination?.total ? _f(" · total: {0}", fa(r.data.pagination.total)) : "", r.data?.misses?.total ? _f("\n🔎 Comments without the word: {0}", fa(r.data.misses.total)) : "", last || _("Nobody has commented yet.")));
  }
  if (a === "s") {
    const [, , , dS, hhmm] = q.data.split(":");
    const iso = localToUtc(env, +dS.slice(0, 4), +dS.slice(4, 6), +dS.slice(6, 8), Math.floor(+hhmm / 100), +hhmm % 100);
    if (new Date(iso) < new Date(Date.now() + 10 * 60000)) return toast(_("This time is too close or already past"));
    if ((await takenDays(env, p.id)).has(tDay(env, iso))) { await toast(_("This day is full; pick another")); return showPkg(env, await getPkg(env, p.id)); }
    await toast(_("⏳ Scheduling…"));
    const p2 = await schedulePkg(env, p, iso);
    await say(env, _f("✅ <b>{0}</b> scheduled: {1}\nInstagram + YouTube (Zernio){2}{3}", esc(p.title), dayLabel(env, iso), p.gate ? _f(" · the «{0}» DM gets switched on", esc(p.gate)) : "", p.telegram ? _("\n📣 Its Telegram post went to the publisher bot; give the final OK there.") : ""));
    return showPkg(env, p2);
  }
  if (a === "un") {
    await studio(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: _("✅ Yes, cancel"), callback_data: `pk:un2:${p.id}` }, { text: _("↩️ No"), callback_data: `pko:${p.id}` }]] } });
    return toast(_("Sure?"));
  }
  if (a === "un2") { const p2 = await unschedulePkg(env, p); await toast(_("Cancelled")); return showPkg(env, p2); }
  return toast("");
}

// ---------- auto stories (no sticker): approved text → frames → Zernio, scheduled at the draft's time ----------
async function zUpload(env, bytes, name, type) {
  const pre = await zernio(env, "POST", "/media/presign", { filename: name, contentType: type, size: bytes.byteLength });
  if (!pre.ok) throw new Error(_("Zernio refused the upload: ") + JSON.stringify(pre.data).slice(0, 160));
  const put = await fetch(pre.data.uploadUrl, { method: "PUT", headers: { "content-type": type }, body: bytes });
  if (!put.ok) throw new Error(_("Image upload to Zernio failed: ") + put.status);
  return pre.data.publicUrl;
}
async function scheduleAutoStory(env, d, shots) {
  const { ig } = await zAccounts(env);
  if (!ig) throw new Error(_("No Instagram account found in Zernio."));
  const start = Math.max(Date.parse(d.scheduled_for || 0) || 0, Date.now() + 10 * 60000);
  const ids = [];
  for (let i = 0; i < shots.length; i++) {
    const url = await zUpload(env, shots[i], `story-${d.id}-${i + 1}.png`, "image/png");
    const r = await zernio(env, "POST", "/posts", { content: "", mediaItems: [{ type: "image", url }], scheduledFor: new Date(start + i * 60000).toISOString(), timezone: "UTC",
      platforms: [{ platform: "instagram", accountId: ig._id, platformSpecificData: { contentType: "story" } }] });
    if (!r.ok) throw new Error(_f("Zernio rejected story {0} ({1}): {2}", i + 1, r.status, JSON.stringify(r.data).slice(0, 200)));
    ids.push(r.data?.post?._id || r.data?._id);
  }
  return setDraft(env, d.id, { status: "scheduled", scheduled_for: new Date(start).toISOString(), ext: JSON.stringify(ids) });
}
async function cancelAutoStory(env, d) {
  for (const id of JSON.parse(d.ext || "[]")) if (id) await zernio(env, "DELETE", `/posts/${id}`);
  return setDraft(env, d.id, { status: "draft", ext: null });
}

// ---------- dashboard feed: everything the Dashboard artifact shows, built from Zernio + D1 (read by a daily routine) ----------
async function dashToken(env) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode((env.INGEST_KEY || "") + ":dashboard"));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}
async function snapshot(env) {
  const { ig } = await zAccounts(env);
  if (!ig) return;
  const ins = await zernio(env, "GET", `/analytics/instagram/account-insights?accountId=${ig._id}`);
  const m = ins.data?.metrics || {};
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare("INSERT INTO snapshots (date, followers, views30, reach30, engaged30, interactions30) VALUES (?,?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET followers=excluded.followers, views30=excluded.views30, reach30=excluded.reach30, engaged30=excluded.engaged30, interactions30=excluded.interactions30")
    .bind(day, ig.followersCount ?? null, m.views?.total ?? null, m.reach?.total ?? null, m.accounts_engaged?.total ?? null, m.total_interactions?.total ?? null).run();
}
// optional: labels for posts made before the bot, keyed by the Instagram shortcode: {"<code>": {"t": "short title", "topic": "Tool", "gate": "word"}}
const KNOWN_POSTS = {};
const clean = (t) => String(t || "").replace(/[\u200e\u200f\u2066-\u2069\u202a-\u202e]/g, "").trim();
async function dashboardData(env) {
  const today = new Date().toISOString().slice(0, 10);
  if (!(await env.DB.prepare("SELECT 1 FROM snapshots WHERE date=? AND reach30 IS NOT NULL").bind(today).first())) await snapshot(env).catch(() => {});
  const { ig } = await zAccounts(env);
  const posts = [];
  for (let page = 1; page < 6; page++) {
    const r = await zernio(env, "GET", `/analytics?limit=50&page=${page}${ig ? "&accountId=" + ig._id : ""}`);
    for (const x of r.data?.posts || []) {
      if (x.platform && x.platform !== "instagram") continue;
      const a = x.analytics || {}, kind = x.mediaProductType === "FEED" ? "Carousel" : "Reel";
      const watch = a.igReelsAvgWatchTime ? Math.round(a.igReelsAvgWatchTime / 100) / 10 : null, dur = a.videoDurationSeconds || null;
      const code = (x.platformPostUrl || "").replace(/\/$/, "").split("/").pop(), kn = KNOWN_POSTS[code] || {};
      const pkg = await env.DB.prepare("SELECT title, gate FROM packages WHERE zernio_post_id=?").bind(x._id || "").first();
      posts.push({ code, title: kn.t || pkg?.title || clean((x.content || "").split("\n").find((l) => clean(l)) || code).slice(0, 40), kind, topic: kn.topic || "—",
        gate: kn.gate || pkg?.gate || (x.content || "").match(/“([^”]+)”/)?.[1] || "—",
        posted: (x.publishedAt || "").slice(0, 10), views: a.views ?? null, reach: a.reach ?? null, likes: a.likes ?? null, comments: a.comments ?? null, shares: a.shares ?? null, saves: a.saves ?? null,
        savesPer1k: a.views ? Math.round(a.saves * 10000 / a.views) / 10 : null, sharesPer1k: a.views ? Math.round(a.shares * 10000 / a.views) / 10 : null,
        avgWatchSec: watch, duration: dur, watchPct: watch && dur && kind === "Reel" ? Math.round(1000 * watch / dur) / 10 : null, skipRate: kind === "Reel" ? a.reelsSkipRate ?? null : null,
        engagementRate: a.engagementRate ?? null, followsManual: kn.fm ?? null, url: x.platformPostUrl || "", updated: (a.lastUpdated || "").slice(0, 16), hook: (x.content || "").split("\n")[0].slice(0, 140), note: "" });
    }
    if (page >= (r.data?.pagination?.pages || 1)) break;
  }
  const snaps = (await env.DB.prepare("SELECT * FROM snapshots ORDER BY date").all()).results;
  const followers = snaps.filter((x) => x.followers).map((x) => ({ date: x.date, followers: x.followers, source: "snapshot" }));
  const last = [...snaps].reverse().find((x) => x.views30) || {};
  const account30 = [["views30", "Views"], ["reach30", "Reach"], ["engaged30", "Accounts engaged"], ["interactions30", "Interactions"]]
    .map(([k, label]) => ({ metric: k, label, value: last[k] ?? null, asOf: last.date || null }));
  // online followers: Meta's hour keys are read as Pacific time, then shown in your TZ_NAME
  const active = [];
  if (ig) {
    const on = await zernio(env, "GET", `/analytics/instagram/online-followers?accountId=${ig._id}`);
    const sum = {}, cnt = {}, DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const dd of on.data?.days || []) {
      // endTime is the END of the day at Pacific midnight (07:00 UTC in summer), so hour h of that day = endTime - 24h + h
      const base = Date.parse(dd.endTime) - 86400000;
      for (const [h, v] of Object.entries(dd.hours || {})) {
        const lp = localParts(new Date(base + +h * 3600000), env), wd = new Date(Date.UTC(lp.y, lp.m - 1, lp.d)).getUTCDay();
        const key = DN[wd] + "@" + (Math.floor((lp.H + lp.M / 60) / 3) * 3 + 1.5);
        sum[key] = (sum[key] || 0) + v; cnt[key] = (cnt[key] || 0) + 1;
      }
    }
    for (const k of Object.keys(sum)) { const [day, hour] = k.split("@"); active.push({ day, dayKey: day.toLowerCase(), hour: +hour, online: Math.round(sum[k] / cnt[k]) }); }
  }
  const drafts = (await env.DB.prepare("SELECT * FROM drafts WHERE status IN ('draft','pending_final','scheduled') ORDER BY id").all()).results;
  const pk = (await env.DB.prepare("SELECT * FROM packages WHERE status IN ('ready','scheduled')").all()).results;
  const KIND_EN = { telegram: "Telegram post", news: "Telegram news", story: "Story (auto)", story_manual: "Story (manual)", reel: "Reel", carousel: "Carousel" };
  const ST_EN = { draft: "Draft", pending_final: "Waiting final OK", scheduled: "Scheduled" };
  const pipeline = [...pk.map((p) => ({ id: "pkg-" + p.id, title: p.title, kind: "Reel", status: p.status === "scheduled" ? "Scheduled" : "Ready to post", when: p.scheduled_for || "", where: "Zernio" })),
    ...drafts.filter((d) => !(d.kind === "reel" || (d.source || "").startsWith("pkg:"))).map((d) => ({ id: "bot-" + d.id, title: (d.title || d.body || "").slice(0, 60), kind: KIND_EN[d.kind] || d.kind, status: ST_EN[d.status] || d.status, when: d.scheduled_for || "", where: "Telegram bot" }))];
  const TOPIC_EN = {};   // dashboard topic labels come straight from the tag
  const ideas = (await env.DB.prepare("SELECT * FROM ideas WHERE status IN ('new','open','done') ORDER BY id DESC").all()).results.map((i) => ({
    id: "bot-" + i.id, title: i.title || i.url || i.note || "", topic: TOPIC_EN[i.tag] || i.tag || "—", tier: i.tier, score: i.score,
    status: { new: "New", open: "Open", done: "Made" }[i.status], source: i.source || "Studio bot", url: i.url || "", added: (i.created_at || "").slice(0, 10),
    gate: i.gate || "", hook: i.hook || "", evidence: i.summary || "", note: i.note || "" }));
  const news = (await env.DB.prepare("SELECT * FROM drafts WHERE kind='news' ORDER BY id DESC LIMIT 30").all()).results.map((d) => ({
    id: "news-" + d.id, date: (d.created_at || "").slice(0, 10), title: (d.title || "").slice(0, 80), why: (d.body || "").split("\n").filter(Boolean).slice(1, 2).join(" ").slice(0, 200),
    source: "Gemini + Google", url: ((d.body || "").match(/https?:\/\/\S+/) || [""])[0], used: d.status === "published" ? "Yes" : "No", summary: d.body || "", storyTitle: "", frames: "" }));
  return { generatedAt: new Date().toISOString(), posts, followers, account30, active, pipeline, ideas, news };
}

// ---------- job queue (webhook background work is cut at ~30 s; Gemini + search + link checks take 20-90 s) ----------
const JOBS = { daily: (a) => (a ? _f("Daily report of client #{0}", fa(a)) : _("Daily page report")), monthly: () => _("Monthly PDF report"), competitors: () => _("Competitors report"), postreports: () => _("24-hour and 7-day post reports"), news: () => _("News digest of the last three days"), story: () => _("Story suggestion"), search: (a) => _f("Search «{0}»", a),
  research: (a) => _f("Research of idea #{0}", fa(a)), post: (a) => _f("Telegram post from idea #{0}", fa(a)), storyimg: (a) => _f("Story images #{0}", fa(a)) };
async function enqueue(env, type, arg = null) {
  const dup = await env.DB.prepare("SELECT id FROM jobs WHERE type=? AND IFNULL(arg,'')=IFNULL(?,'') AND status IN ('queued','running')").bind(type, arg).first();
  if (!dup) await env.DB.prepare("INSERT INTO jobs (type, arg) VALUES (?,?)").bind(type, arg).run();
  return say(env, _f("⏳ {0} is queued; the answer arrives here within a minute or two.", esc(JOBS[type](arg))));
}
async function runJobs(env) {
  // stale "running" rows (a crashed run) go back to the queue after 20 minutes
  await env.DB.prepare("UPDATE jobs SET status='queued' WHERE status='running' AND updated_at < datetime('now','-20 minutes')").run();
  const rows = (await env.DB.prepare("SELECT * FROM jobs WHERE status='queued' ORDER BY id LIMIT 3").all()).results;
  for (const j of rows) {
    const claim = await env.DB.prepare("UPDATE jobs SET status='running', updated_at=datetime('now') WHERE id=? AND status='queued'").bind(j.id).run();
    if (!claim.meta?.changes) continue;
    try {
      if (j.type === "daily") await R.dailyReport(env, j.arg ? +j.arg : null);
      else if (j.type === "monthly") await R.monthlyReport(env, j.arg ? +j.arg : null);
      else if (j.type === "competitors") await R.competitorsReport(env, j.arg ? +j.arg : null);
      else if (j.type === "postreports") await R.checkPostReports(env);
      else if (j.type === "news") await makeNews(env);
      else if (j.type === "story") await makeStory(env);
      else if (j.type === "search") await search(env, j.arg || "");
      else if (j.type === "research") await researchIdea(env, +j.arg);
      else if (j.type === "post") await postFromIdea(env, +j.arg);
      else if (j.type === "storyimg") await sendStoryImages(env, +j.arg);
      await env.DB.prepare("UPDATE jobs SET status='done', updated_at=datetime('now') WHERE id=?").bind(j.id).run();
    } catch (e) {
      await env.DB.prepare("UPDATE jobs SET status='error', result=?, updated_at=datetime('now') WHERE id=?").bind(String(e?.message || e).slice(0, 500), j.id).run();
      await say(env, _f("⚠️ {0} failed: {1}\nTap again; if it repeats, tell Claude.", esc(JOBS[j.type](j.arg)), esc(String(e?.message || e))));
    }
  }
}

// ---------- update handlers ----------
async function onMessage(env, m) {
  if (String(m.chat?.id) !== String(env.OWNER_ID)) return; // private bot
  const text = (m.text || m.caption || "").trim();
  const st = await env.DB.prepare("SELECT * FROM state WHERE chat_id=?").bind(String(m.chat.id)).first();
  if (st?.mode && (text.startsWith("/") || MENU_TEXTS(env).includes(text))) await env.DB.prepare("DELETE FROM state WHERE chat_id=?").bind(String(m.chat.id)).run();
  else if (st?.mode) {
    await env.DB.prepare("DELETE FROM state WHERE chat_id=?").bind(String(m.chat.id)).run();
    if (st.mode === "search") return text ? enqueue(env, "search", text) : say(env, _("You didn't send any text."));
    if (st.mode === "idea") return text ? saveIdea(env, text) : say(env, _("You didn't send any text."));
    if (st.mode === "edit") { const d0 = await getDraft(env, st.ref); const d = await setDraft(env, st.ref, { body: m.text || "", ...(d0?.result === "imgs" ? { result: null } : {}) }); return say(env, _("✏️ Edit saved:\n\n") + draftCard(d, env), { reply_markup: draftKb(d) }); }
    if (st.mode === "pkedit") {
      const id = Math.floor(st.ref / 10), f = PK_FIELDS[st.ref % 10];
      if (!text) return say(env, _("You didn't send any text."));
      const p0 = await setPkg(env, id, { [f]: m.text });
      if (p0.status === "scheduled" && f !== "telegram") await say(env, _("⚠️ This reel is scheduled now; to apply the change, tap «↩️ Unschedule» and ✅ again."));
      if (p0.status === "scheduled" && f === "telegram" && p0.telegram_draft_id) { const d = await setDraft(env, p0.telegram_draft_id, { body: m.text }); await sendForFinal(env, d); }
      await say(env, _f("✏️ «{0}» changed.", PK_FA()[f]));
      return showPkg(env, p0);
    }
    if (st.mode === "sframe") {
      const id = Math.floor(st.ref / 100), i = st.ref % 100, d0 = await getDraft(env, id);
      if (!d0 || !text) return say(env, _("Not found."));
      const parts = storyParts(d0); parts.frames[i] = text;
      const d = await setDraft(env, id, { body: storyBody(parts), result: null });
      return say(env, _f("✏️ Story {0} changed:\n\n", fa(i + 1)) + draftCard(d, env), { reply_markup: draftKb(d) });
    }
    if (st.mode === "ibedit") { if (!text) return say(env, _("You didn't send any text.")); const c = await R.inboxSetReply(env, st.ref, m.text); return say(env, c.text, { reply_markup: c.kb }); }
    if (st.mode === "cpadd") { if (!text) return say(env, _("You didn't send any text.")); const r = await R.addCompetitor(env, st.ref, text.split(/\s+/)[0]); await say(env, r.msg); return screen(await competitorsScreen(env, st.ref)); }
    if (st.mode === "note") { await env.DB.prepare("UPDATE ideas SET note=?, updated_at=datetime('now') WHERE id=?").bind(text, st.ref).run(); const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(st.ref).first(); return say(env, ideaCard(i), { reply_markup: ideaKb(i) }); }
  }
  const cmd = text.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  const screen = (o) => say(env, o.text, { reply_markup: o.reply_markup });
  if (cmd === "/start" || cmd === "/help") return say(env, HELP(env), { reply_markup: MENU(env) });
  if (cmd === "/news") return enqueue(env, "news");
  if (cmd === "/search" || text === _("🔎 Search")) { await setState(env, m.chat.id, "search"); return say(env, _("🔎 What should I look for? Write it, for example:\nthis month's trends in my field"), { reply_markup: cancelKb() }); }
  if (text === _("➕ New idea")) { await setState(env, m.chat.id, "idea"); return say(env, _("➕ Send the link or the text of the idea."), { reply_markup: cancelKb() }); }
  if (cmd === "/ideas" || text === _("💡 Ideas")) return screen(await listIdeas(env));
  if (text === _("🎬 Reels")) return screen(await pkgList(env));
  if (cmd === "/drafts" || text === _("📝 Drafts")) return screen(draftList(await listDrafts(env, ALL_KINDS), _("📝 Waiting drafts")));
  if (cmd === "/schedule" || text === _("📅 Schedule")) return screen(await schedule(env));
  if (text === _("📸 Stories")) return screen(draftList(await listDrafts(env, ["story", "story_manual"]), _("📸 Story drafts"), _("Every morning a story suggestion with its images arrives (for its posting time)."), [[{ text: _("✨ Suggest a story now"), callback_data: "g:story" }]]));
  if (text === _("📰 News")) return screen(draftList(await listDrafts(env, ["news"]), _("📰 Telegram news"), _("Every three days a digest of the last three days arrives in your voice, for the evening."), [[{ text: _("🔄 Make a news digest now"), callback_data: "g:news" }]]));
  if (/^(\/search|🔎|سرچ|جستجو|بگرد|search|ابحث|ara|suche|recherche|cerca)/i.test(text)) {
    const q = text.replace(/^(\/search|🔎|سرچ کن|سرچ|جستجو کن|جستجو|بگرد|search|ابحث|ara|suche|recherche|cerca)\s*/i, "");
    return q.trim() ? enqueue(env, "search", q) : search(env, "");
  }
  if (cmd === "/dashboard" || text === _("📊 Dashboard")) {
    const url = await R.dashLink(env);
    return say(env, url ? _("📊 Your dashboard (a private link, don't share it). It refreshes from Zernio every time you open it.") : _("The dashboard isn't ready yet: open /setup once."),
      { reply_markup: { inline_keyboard: [...(url ? [[{ text: _("📊 Open dashboard"), url }]] : []), [{ text: _("📈 Send today's report now"), callback_data: "g:daily" }, { text: _("📄 Monthly PDF now"), callback_data: "g:monthly" }],
        ...(env.AGENCY === "on" ? [] : [[{ text: _("🥊 Competitors"), callback_data: "cpm:0" }]])] } });
  }
  if (cmd === "/inbox" || text === _("💬 Inbox")) return screen(await inboxList(env));
  if (env.AGENCY === "on" && (cmd === "/clients" || text === _("👥 Clients"))) return screen(await clientsScreen(env));
  if (cmd === "/status" || text === _("⚙️ Status")) return say(env, await status(env), { reply_markup: { inline_keyboard: [[{ text: _("🔄 Refresh"), callback_data: "stt" }]] } });
  let mm;
  if ((mm = cmd.match(/^\/i(\d+)/))) { const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(+mm[1]).first(); return i ? say(env, ideaCard(i), { reply_markup: ideaKb(i) }) : say(env, _("Not found.")); }
  if ((mm = cmd.match(/^\/d(\d+)/))) { const d = await getDraft(env, +mm[1]); return d ? say(env, draftCard(d, env), { reply_markup: draftKb(d) }) : say(env, _("Not found.")); }
  if (text.startsWith("/")) return say(env, _("Use the buttons below 👇"), { reply_markup: MENU(env) });
  if (text) return saveIdea(env, text);
}

async function onCallback(env, q) {
  const screen = (o) => say(env, o.text, { reply_markup: o.reply_markup });
  if (String(q.from?.id) !== String(env.OWNER_ID)) return;
  const [t, a, b, c, e] = (q.data || "").split(":");
  const edit = (text, reply_markup) => studio(env, "editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup });
  const toast = (text) => studio(env, "answerCallbackQuery", { callback_query_id: q.id, text });
  if (t === "l") { const l = await listIdeas(env, +b, a); await edit(l.text, l.reply_markup); return toast(""); }
  if (t === "x") { await env.DB.prepare("DELETE FROM state WHERE chat_id=?").bind(String(q.message.chat.id)).run(); await edit(_("OK, never mind."), { inline_keyboard: [] }); return toast(""); }
  if (["pk", "pko", "pkl", "pkv", "pke"].includes(t)) return onPkgCallback(env, q, t, a, b, c);
  if (t === "stc") { const d = await getDraft(env, +a); await studio(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: _("✅ Yes, cancel it"), callback_data: `stc2:${a}` }, { text: _("↩️ No"), callback_data: `d:show:${a}` }]] } }); return toast(d ? _("Sure?") : ""); }
  if (t === "stc2") { const d = await cancelAutoStory(env, await getDraft(env, +a)); await edit(draftCard(d, env) + _("\n\n↩️ Auto story cancelled."), draftKb(d)); return toast(_("Cancelled")); }
  if (t === "io2") { const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(+a).first(); await edit(ideaCard(i), ideaKb(i)); return toast(""); }
  if (t === "sf") {
    const d = await getDraft(env, +a), i = +b, { frames } = storyParts(d || {});
    if (!d || !frames[i]) return toast(_("Not found"));
    await setState(env, q.message.chat.id, "sframe", +a * 100 + i);
    await toast("");
    await say(env, _f("✏️ The current text of story {0} is below; copy it, change it and send it:", fa(i + 1)), { reply_markup: cancelKb() });
    return studio(env, "sendMessage", { chat_id: env.OWNER_ID, text: frames[i] });
  }
  if (t === "io") { const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(+a).first(); await toast(""); return i ? say(env, ideaCard(i), { reply_markup: ideaKb(i) }) : say(env, _("Not found.")); }
  if (t === "do") { const d = await getDraft(env, +a); await toast(""); return d ? say(env, draftCard(d, env), { reply_markup: draftKb(d) }) : say(env, _("Not found.")); }
  if (t === "dl") { const o = draftList(await listDrafts(env, ALL_KINDS), _("📝 Waiting drafts")); await edit(o.text, o.reply_markup); return toast(""); }
  if (t === "sc") { const o = await schedule(env); await edit(o.text, o.reply_markup); return toast(_("Refreshed")); }
  if (t === "stt") { await edit(await status(env), { inline_keyboard: [[{ text: _("🔄 Refresh"), callback_data: "stt" }]] }); return toast(_("Refreshed")); }
  if (t === "i") {
    const id = +b;
    if (a === "star") await env.DB.prepare("UPDATE ideas SET starred=1-starred WHERE id=?").bind(id).run();
    if (a === "done") await env.DB.prepare("UPDATE ideas SET status='done' WHERE id=?").bind(id).run();
    if (a === "del") { const i0 = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first(); await edit(ideaCard(i0) + _("\n\n❓ <b>Delete it?</b>"), { inline_keyboard: [[{ text: _("🗑 Yes, delete"), callback_data: `i:del2:${id}` }, { text: _("↩️ No"), callback_data: `io2:${id}` }]] }); return toast(""); }
    if (a === "del2") { await env.DB.prepare("UPDATE ideas SET status='deleted' WHERE id=?").bind(id).run(); await edit(_("🗑 Deleted."), { inline_keyboard: [] }); return toast(_("Deleted")); }
    if (a === "note") { await setState(env, q.message.chat.id, "note", id); await say(env, _("📝 Send your note for this idea."), { reply_markup: cancelKb() }); return toast(""); }
    if (a === "tags") { const i0 = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first(); await edit(ideaCard(i0) + _("\n\n🏷 Pick a tag:"), { inline_keyboard: [tags(env).slice(0, 4).map((x) => ({ text: x, callback_data: `t:${id}:${x}` })), tags(env).slice(4, 8).map((x) => ({ text: x, callback_data: `t:${id}:${x}` }))].filter((r) => r.length) }); return toast(""); }
    const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(id).first();
    await edit(ideaCard(i), ideaKb(i)); return toast(a === "done" ? _("Made ✅") : "");
  }
  if (t === "t") { await env.DB.prepare("UPDATE ideas SET tag=? WHERE id=?").bind(b, +a).run(); const i = await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(+a).first(); await edit(ideaCard(i), ideaKb(i)); return toast("#" + b); }
  if (t === "d") {
    const id = +b; let d = await getDraft(env, id);
    if (!d) return toast(_("Not found"));
    if (a === "show") return edit(draftCard(d, env), draftKb(d));
    if (a === "edit") { await setState(env, q.message.chat.id, "edit", id); await say(env, _f("✏️ Send the new text of draft #{0} (the whole text, exactly as it should be published).", fa(id)), { reply_markup: cancelKb() }); return toast(""); }
    const sure = (yes, label) => edit(draftCard(d, env) + `\n\n❓ <b>${label}</b>`, { inline_keyboard: [[{ text: _("✅ Yes"), callback_data: `d:${yes}:${id}` }, { text: _("↩️ No"), callback_data: `d:show:${id}` }]] });
    if (a === "rej") { await sure("rej2", _("Reject it?")); return toast(""); }
    if (a === "done") { await sure("done2", _("Did you really post it on Instagram?")); return toast(""); }
    if (a === "rej2") { d = await setDraft(env, id, { status: "rejected" }); await edit(draftCard(d, env), draftKb(d)); return toast(_("Rejected ✓")); }
    if (a === "done2") { d = await setDraft(env, id, { status: "published", result: "manual" }); await edit(draftCard(d, env), draftKb(d)); return toast(_("Saved ✅")); }
    if (a === "undo") { d = await setDraft(env, id, { status: "draft" }); await edit(draftCard(d, env), draftKb(d)); return toast(_("Back to draft")); }
    if (a === "when") return edit(draftCard(d, env) + _f("\n\n⏰ When should it go out? ({0} time)", esc(brand(env).tz)), whenKb(env, id));
    if (a === "pub") {
      if (d.kind === "telegram" || d.kind === "news") {
        const r = await sendForFinal(env, d);
        d = await getDraft(env, id);
        await edit(draftCard(d, env) + `\n\n${esc(r.msg)}`, draftKb(d)); return toast(r.ok ? _("Sent for the final OK") : _("Error"));
      }
      const r = await sendToZernio(env, d);
      if (r.ok && !r.dry) d = await setDraft(env, id, { status: d.scheduled_for ? "scheduled" : "published", result: "zernio" });
      await edit(draftCard(d, env) + `\n\n${r.msg}`, draftKb(d)); return toast(r.ok ? _("Done") : _("Error"));
    }
  }
  if (t === "ib") {
    if (a === "send") { const r = await R.inboxSend(env, +b); if (r.ok) await studio(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }); await toast(r.ok ? _("Sent ✅") : _("Error")); return say(env, esc(r.msg)); }
    if (a === "edit") { await setState(env, q.message.chat.id, "ibedit", +b); await toast(""); return say(env, _("✏️ Send your reply (it replaces the suggestion; you'll confirm it with ✅)."), { reply_markup: cancelKb() }); }
    if (a === "no") { await R.inboxIgnore(env, +b); await studio(env, "editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }); return toast(_("Ignored")); }
  }
  if (t === "ibo") { const c = await R.inboxShow(env, +a); await toast(""); return c ? say(env, c.text, { reply_markup: c.kb }) : say(env, _("Not found.")); }
  if (t === "cpm") { await toast(""); return screen(await competitorsScreen(env, +a)); }
  if (t === "cp") {
    if (a === "add") { await setState(env, q.message.chat.id, "cpadd", +b); await toast(""); return say(env, _("🥊 Send the competitor's Instagram @username (a business or creator account)."), { reply_markup: cancelKb() }); }
    if (a === "rm") { const c = await env.DB.prepare("SELECT * FROM competitors WHERE id=?").bind(+b).first(); await env.DB.prepare("DELETE FROM competitors WHERE id=?").bind(+b).run(); await toast(_("Deleted")); return screen(await competitorsScreen(env, c?.client_id || 0)); }
    if (a === "run") { await toast(_("⏳ Queued")); return enqueue(env, "competitors", +b || null); }
  }
  if (t === "cl" && env.AGENCY === "on") {
    if (a === "list") { await toast(""); return screen(await clientsScreen(env)); }
    if (a === "new") {
      const free = await R.freeProfiles(env); await toast("");
      if (!free.length) return say(env, _("Every Zernio profile is already a client. Create a profile in Zernio (one per client), connect their Instagram there, then come back."));
      return say(env, _("➕ Which Zernio profile is the new client?"), { reply_markup: { inline_keyboard: [...free.slice(0, 20).map((p) => [{ text: `${p.name}${p.accountUsernames?.length ? " · " + p.accountUsernames.join(", ") : ""}`.slice(0, 60), callback_data: `cl:addp:${p._id}` }]), [{ text: _("↩️ Back"), callback_data: "cl:list" }]] } });
    }
    if (a === "addp") { const c = await R.addClient(env, b); await toast(c ? _("Saved") : _("Not found")); return c ? screen(await clientCard(env, c.id)) : null; }
    if (a === "daily") { await toast(_("⏳ Queued")); return enqueue(env, "daily", String(+b)); }
    if (a === "pdf") { await toast(_("⏳ Queued")); return enqueue(env, "monthly", String(+b)); }
    if (a === "rep" || a === "mon") { const col = a === "rep" ? "reports" : "monthly"; await env.DB.prepare(`UPDATE clients SET ${col}=1-${col} WHERE id=?`).bind(+b).run(); await toast(""); return screen(await clientCard(env, +b)); }
    if (a === "del") { await toast(""); return say(env, _("🗑 Remove this client? Their Zernio profile and posts are not touched."), { reply_markup: { inline_keyboard: [[{ text: _("🗑 Yes, delete"), callback_data: `cl:del2:${b}` }, { text: _("↩️ No"), callback_data: `clo:${b}` }]] } }); }
    if (a === "del2") { await env.DB.prepare("DELETE FROM clients WHERE id=?").bind(+b).run(); await toast(_("Deleted")); return screen(await clientsScreen(env)); }
  }
  if (t === "clo") { await toast(""); return screen(await clientCard(env, +a)); }
  if (t === "g") {
    if (a === "ssave") { await env.DB.prepare("UPDATE ideas SET status='open' WHERE id=?").bind(+b).run(); await toast(_("Saved")); return say(env, _("💡 Added to ideas.")); }
    if (!JOBS[a]) return toast("");
    await toast(_("⏳ Queued"));
    return enqueue(env, a, b || null);
  }
  if (t === "w") {
    const id = +a;
    const iso = b === "x" ? null : slot(env, +b, +c, +e);
    if (iso && new Date(iso) < new Date()) return toast(_("This time has passed; pick another"));
    const d0 = await getDraft(env, id); const tgKind = d0.kind === "telegram" || d0.kind === "news";
    // Telegram drafts: the time goes with the final approval in the publisher bot. Zernio drafts: the time goes with «✅ تأیید و ارسال».
    let d = await setDraft(env, id, { scheduled_for: iso, status: "draft" });
    let hint = "";
    if (iso && tgKind) { const r = await sendForFinal(env, d); d = await getDraft(env, id); hint = "\n\n" + esc(r.msg); }
    else if (iso) hint = _("\n\nNow tap «✅ Approve and send to Zernio» to send it with this time.");
    await edit(draftCard(d, env) + hint, draftKb(d)); return toast(iso ? _("Time saved") : _("Cancelled"));
  }
  return toast("");
}

// ---------- API (routines, laptop) ----------
async function api(req, env, path) {
  if (path === "/api/dashboard") {
    if (!env.INGEST_KEY || new URL(req.url).searchParams.get("k") !== await dashToken(env)) return Response.json({ error: "unauthorized" }, { status: 401 });
    return Response.json(await dashboardData(env));
  }
  if (!env.INGEST_KEY || req.headers.get("x-api-key") !== env.INGEST_KEY) return Response.json({ error: "unauthorized" }, { status: 401 });
  let pm;
  if ((pm = path.match(/^\/api\/packages\/(\d+)\/schedule$/)) && req.method === "POST") {
    // Claude schedules a package when you asked in chat for a specific time (same effect as your ✅ on the card)
    const b = await req.json(), p = await getPkg(env, +pm[1]);
    if (!p) return Response.json({ error: "not found" }, { status: 404 });
    if (p.status === "scheduled") return Response.json({ error: "already scheduled" }, { status: 409 });
    if (!b.at || new Date(b.at) < new Date(Date.now() + 10 * 60000)) return Response.json({ error: "time too close or past" }, { status: 400 });
    if ((await takenDays(env, p.id)).has(tDay(env, b.at))) return Response.json({ error: "day taken on Instagram" }, { status: 409 });
    const p2 = await schedulePkg(env, p, b.at);
    await say(env, _f("✅ <b>{0}</b> scheduled: {1}\nInstagram + YouTube (Zernio){2}{3}", esc(p.title), dayLabel(env, b.at), p.gate ? _f(" · the «{0}» DM gets switched on", esc(p.gate)) : "", p.telegram ? _("\n📣 Its Telegram post went to the publisher bot; give the final OK there so it posts at the same time.") : ""));
    await showPkg(env, p2);
    return Response.json(p2);
  }
  if (path === "/api/packages/list" && req.method === "POST") { const o = await pkgList(env); await say(env, o.text, { reply_markup: o.reply_markup }); return Response.json({ ok: true }); }
  if (path === "/api/packages" && req.method === "GET") return Response.json((await env.DB.prepare("SELECT * FROM packages ORDER BY id").all()).results);
  if (path === "/api/packages" && req.method === "POST") {
    // Claude calls this after the owner approved a render and the Zernio DRAFT exists (never before)
    const b = await req.json();
    const cols = ["slug", "title", "zernio_post_id", "video_url", "yt_url", "cover_url", "ig_caption", "yt_title", "yt_desc", "gate", "dm", "dm_media", "comment_reply", "telegram", "note"];
    if (!b.slug || !b.title || !b.zernio_post_id || !b.video_url) return Response.json({ error: "slug, title, zernio_post_id, video_url required" }, { status: 400 });
    const old = await env.DB.prepare("SELECT id, status FROM packages WHERE slug=?").bind(b.slug).first();
    if (old && old.status === "scheduled") return Response.json({ error: "scheduled; unschedule first" }, { status: 409 });
    const k = cols.filter((c) => b[c] !== undefined);
    if (old) await env.DB.prepare(`UPDATE packages SET ${k.map((c) => `${c}=?`).join(",")}, status='ready', updated_at=datetime('now') WHERE id=?`).bind(...k.map((c) => b[c]), old.id).run();
    else await env.DB.prepare(`INSERT INTO packages (${k.join(",")}) VALUES (${k.map(() => "?").join(",")})`).bind(...k.map((c) => b[c])).run();
    const p = await env.DB.prepare("SELECT * FROM packages WHERE slug=?").bind(b.slug).first();
    // the imported reel + Telegram drafts of this folder are replaced by the package
    if (b.folder) await env.DB.prepare("UPDATE drafts SET status='rejected', result='replaced by package' WHERE source=? AND kind IN ('reel','telegram') AND status IN ('draft','pending_final')").bind(b.folder).run();
    if (!b.silent) { await say(env, _("🎬 New reel ready to schedule:")); await showPkg(env, p); }
    return Response.json(p);
  }
  if (path === "/api/drafts" && req.method === "POST") {
    const b = await req.json();
    if (!DRAFT_FA()[b.kind] || !b.body) return Response.json({ error: "kind + body required" }, { status: 400 });
    const d = await env.DB.prepare("INSERT INTO drafts (kind, title, body, media_url, scheduled_for) VALUES (?,?,?,?,?) RETURNING *").bind(b.kind, b.title || null, b.body, b.media_url || null, b.scheduled_for || null).first();
    await say(env, _("🆕 New draft to approve:\n\n") + draftCard(d, env), { reply_markup: draftKb(d) });
    return Response.json(d);
  }
  if (path === "/api/drafts" && req.method === "GET") return Response.json((await env.DB.prepare("SELECT * FROM drafts ORDER BY id DESC LIMIT 50").all()).results);
  if (path === "/api/ideas" && req.method === "GET") {
    const s = new URL(req.url).searchParams.get("status") || "new";
    return Response.json((await env.DB.prepare("SELECT * FROM ideas WHERE status=? ORDER BY id DESC LIMIT 100").bind(s).all()).results);
  }
  let m;
  if ((m = path.match(/^\/api\/ideas\/(\d+)$/)) && req.method === "PATCH") {
    const b = await req.json(); const allowed = ["summary", "note", "tag", "score", "status", "title"];
    const keys = Object.keys(b).filter((k) => allowed.includes(k));
    if (!keys.length) return Response.json({ error: "nothing to update" }, { status: 400 });
    await env.DB.prepare(`UPDATE ideas SET ${keys.map((k) => `${k}=?`).join(",")}, updated_at=datetime('now') WHERE id=?`).bind(...keys.map((k) => b[k]), +m[1]).run();
    return Response.json(await env.DB.prepare("SELECT * FROM ideas WHERE id=?").bind(+m[1]).first());
  }
  if (path === "/api/job" && req.method === "POST") { const b = await req.json(); if (!JOBS[b.type]) return Response.json({ error: "type" }, { status: 400 }); await enqueue(env, b.type, b.arg ?? null); return Response.json({ ok: true }); }
  if (path === "/api/jobs" && req.method === "GET") return Response.json((await env.DB.prepare("SELECT * FROM jobs ORDER BY id DESC LIMIT 20").all()).results);
  if (path === "/api/clients" && req.method === "GET") return Response.json(await R.clientsAll(env));
  if (path === "/api/clients" && req.method === "POST") {
    const b = await req.json();
    if (b.id) { const c = await R.updateClient(env, +b.id, b); return c ? Response.json(c) : Response.json({ error: "client not found" }, { status: 404 }); }
    const c = b.profileId && await R.addClient(env, b.profileId); return c ? Response.json(c) : Response.json({ error: "profileId not found in Zernio" }, { status: 404 });
  }
  if (path === "/api/inbox" && req.method === "GET") return Response.json((await env.DB.prepare("SELECT * FROM inbox ORDER BY id DESC LIMIT 50").all()).results);
  if (path === "/api/competitors" && req.method === "POST") { const b = await req.json(); return Response.json(await R.addCompetitor(env, b.clientId || 0, b.username || "")); }
  if (path === "/api/notify" && req.method === "POST") { const b = await req.json(); await say(env, b.text || ""); return Response.json({ ok: true }); }
  return Response.json({ error: "not found" }, { status: 404 });
}

async function setup(env, origin) {
  const out = {};
  await env.DB.prepare("INSERT OR REPLACE INTO kv (k, v) VALUES ('origin', ?)").bind(origin).run();
  for (const [name, token, path] of [["studio", env.STUDIO_BOT_TOKEN, "/tg/studio"], ["publisher", env.PUBLISHER_BOT_TOKEN, "/tg/publisher"]]) {
    if (!token) { out[name] = "token missing"; continue; }
    out[name] = await tg(env, token, "setWebhook", { url: origin + path, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
  }
  if (env.STUDIO_BOT_TOKEN) {
    out.commands = await studio(env, "setMyCommands", { commands: [{ command: "start", description: _("Menu and buttons") }] });
    out.desc = await studio(env, "setMyDescription", { description: _f("{0} content studio: send a link or an idea to save it; drafts arrive here for your approval.", brand(env).name) });
    out.short = await studio(env, "setMyShortDescription", { short_description: _f("Ideas and drafts of {0}", brand(env).name).slice(0, 120) });
  }
  if (env.PUBLISHER_BOT_TOKEN) {
    out.pubdesc = await publisher(env, "setMyShortDescription", { short_description: _f("Publisher of {0}; final approval of posts", brand(env).chan).slice(0, 120) });
    out.pubcmd = await publisher(env, "setMyCommands", { commands: [{ command: "start", description: _("Start") }] });
  }
  out.zernioWebhook = await R.registerWebhook(env, origin).catch((e) => "error: " + e.message);
  return out;
}

// Telegram sometimes fails to resolve the workers.dev host when a webhook is set.
// Every cron run checks the Studio webhook and sets it again until Telegram accepts it, then says so once.
async function healWebhook(env) {
  if (!env.STUDIO_BOT_TOKEN) return;
  const info = await studio(env, "getWebhookInfo", {});
  if (info.result?.url) return;
  const origin = (await env.DB.prepare("SELECT v FROM kv WHERE k='origin'").first())?.v;
  if (!origin) return;
  const r = await studio(env, "setWebhook", { url: origin + "/tg/studio", secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"] });
  if (r.ok) await say(env, _("✅ The Studio is connected again. Tap /start for the menu."));
}

async function publishDue(env) {
  const due = (await env.DB.prepare("SELECT * FROM drafts WHERE status='scheduled' AND kind IN ('telegram','news') AND scheduled_for <= ?").bind(now()).all()).results;
  for (const d of due) {
    const r = await publishTelegram(env, d);
    await setDraft(env, d.id, { status: r.ok ? "published" : "scheduled", result: r.msg });
    await say(env, _f("{0} Scheduled draft #{1}: {2}", r.ok ? "✅" : "⚠️", fa(d.id), esc(r.msg)));
  }
}

// daily report, post reports, dashboard, Zernio webhooks (src/reports.js)
const R = makeReports({ zernio, say, sendTo, sendDoc, gemini, pdf, fa, esc, localParts, fontBlack: FONT_BLACK, fontSemi: FONT_SEMIBOLD, prompts: { REPLY_PROMPT } });

export default {
  async fetch(req, env, ctx) {
    setLang(env.LANG || "en");
    const url = new URL(req.url); const path = url.pathname;
    if (path === "/tg/studio" || path === "/tg/publisher") {
      if (req.headers.get("x-telegram-bot-api-secret-token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const u = await req.json();
      if (path === "/tg/publisher") {
        ctx.waitUntil(onPublisher(env, u).catch((e) => { console.log("publisher error", e?.stack || e); return pubToOwner(env, "sendMessage", { text: _("⚠️ Error: ") + String(e?.message || e) }).catch(() => {}); }));
        return new Response("ok");
      }
      ctx.waitUntil((async () => {
        try { if (u.message) await onMessage(env, u.message); else if (u.callback_query) await onCallback(env, u.callback_query); }
        catch (e) { console.log("handler error", e?.stack || e); await say(env, _("⚠️ Error: ") + esc(String(e?.message || e))).catch(() => {}); }
      })());
      return new Response("ok");
    }
    if (path === "/setup") {
      if (!env.SETUP_KEY || url.searchParams.get("key") !== env.SETUP_KEY) return new Response("forbidden", { status: 403 });
      if (url.searchParams.get("info")) {
        const w = async (t) => { const r = await tg(env, t, "getWebhookInfo", {}); const x = r.result || r; return { url: x.url, pending: x.pending_update_count, last_error: x.last_error_message, last_error_at: x.last_error_date } };
        return Response.json({ studio: await w(env.STUDIO_BOT_TOKEN), publisher: await w(env.PUBLISHER_BOT_TOKEN) });
      }
      return Response.json(await setup(env, url.origin));
    }
    if (path === "/dashboard") return R.serveDashboard(env, req);
    if (path.startsWith("/c/")) return R.serveClientDashboard(env, path.slice(3));
    if (path === "/zernio/webhook" && req.method === "POST") return R.onZernioWebhook(env, req);
    if (path.startsWith("/api/")) return api(req, env, path);
    return new Response(`${brand(env).name} bot ✓`);
  },
  async scheduled(event, env, ctx) {
    setLang(env.LANG || "en");
    const safe = (fn) => fn().catch((e) => say(env, _("⚠️ A scheduled job failed: ") + esc(String(e?.message || e))));
    // one trigger, every minute; the daily jobs fire at a local wall-clock time (TZ_NAME), so DST and any time zone just work
    const t = localParts(new Date(event.scheduledTime), env), at = (v, d) => { const x = hm(v, d); return t.H === x.H && t.M === x.M; };
    const minute = new Date(event.scheduledTime).getUTCMinutes();
    ctx.waitUntil(Promise.all([
      runJobs(env),
      R.tick(env, new Date(event.scheduledTime)).catch((e) => console.log("reports", e?.message)),
      minute % 5 === 0 ? publishDue(env) : null,
      minute % 5 === 0 ? healWebhook(env).catch((e) => console.log("heal", e?.message)) : null,
      env.NEWS_CHECK_AT !== "off" && at(env.NEWS_CHECK_AT, "18:00") ? safe(() => newsIfDue(env)) : null,
      env.STORY_IDEA_AT !== "off" && at(env.STORY_IDEA_AT, "08:30") ? safe(() => makeStory(env)) : null,
      at(env.STORY_IDEA_AT === "off" ? "08:30" : env.STORY_IDEA_AT, "08:30") ? snapshot(env).catch((e) => console.log("snapshot", e?.message)) : null,
    ]));
  },
};
