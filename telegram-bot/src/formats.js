// ============================================================================================================
// formats.js · EVERYTHING the bot writes in your name: post format, prompts, story template, comment replies.
// The values below are neutral EXAMPLES in seven languages (LANG). /setup rewrites this file with you: your post
// format, your story look, your words. A bakery, a clinic or a course page each gets its own version.
// index.js holds only the mechanics; nothing personal lives there.
// ============================================================================================================
import { FONT_BLACK, FONT_SEMIBOLD } from "./fonts.js";
import { _, num, lang, langName, rtl, listSep } from "./i18n.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- brand (all from wrangler.jsonc vars) ----------
export const brand = (env) => ({
  name: env.BRAND_NAME || "My Studio",
  ig: env.IG_HANDLE || "",                                   // "@yourhandle"
  chan: env.TG_CHANNEL || String(env.PUBLISH_CHAT || ""),    // "@yourchannel" (the signature under posts)
  creator: env.CREATOR_NAME || _("the page owner"),          // how the prompts call you
  audience: env.AUDIENCE || _("the page's audience"),        // who the page is for, one line
  topic: env.NEWS_TOPIC || _("my field"),                    // what the news digest is about
  note: env.AUDIENCE_NOTE || "",                             // one extra rule for scoring ideas (optional)
  audio: env.AUDIO_NAME || env.BRAND_NAME || "Original audio",
  tz: env.TZ_LABEL || env.TZ_NAME,
});

// ---------- how to write, per language (the prompts below always add the current one) ----------
const STYLE = {
  en: "Conversational, warm and short, like the owner talking to a friend. Plain words, no hype («revolutionary», «game-changer»), no claim without a source.",
  fa: "فارسی محاوره‌ای و خودمونی (مثل «اومد»، «می‌شه»، «واست»)، جمله‌های کوتاه، یک گوینده. بدون کلمه‌های رسمی و خبرگزاری‌ای («توسط»، «رونمایی»، «می‌باشد»، «اعلام کرد که»)، بدون اغراق. نیم‌فاصله‌ی درست، عدد فارسی، «درصد» به‌جای ٪. هر خط با یه کلمه‌ی فارسی شروع بشه (اسم لاتین وسط یا آخر خط)، چون تلگرام جهت خط رو از اولین حرف می‌گیره.",
  ar: "عربية واضحة وودودة وقصيرة، بصوت صاحب الصفحة فقط. بلا مبالغة ولا ادعاء بلا مصدر. ابدأ كل سطر بكلمة عربية (الأسماء اللاتينية في الوسط أو النهاية) لأن تيليغرام يحدد اتجاه السطر من أول حرف.",
  tr: "Samimi, kısa ve sade Türkçe; sayfa sahibinin kendi sesiyle. Abartı yok, kaynağı olmayan iddia yok.",
  de: "Locker, freundlich und kurz, in der Stimme des Inhabers (du-Form, wenn die Seite so spricht). Keine Übertreibungen, keine Behauptung ohne Quelle.",
  fr: "Ton conversationnel, chaleureux et court, à la voix du propriétaire (tutoiement si la page tutoie). Pas d'exagération, aucune affirmation sans source.",
  it: "Tono colloquiale, caldo e breve, con la voce del titolare. Niente esagerazioni, nessuna affermazione senza fonte.",
};
const style = () => STYLE[lang()] || STYLE.en;
const inLang = () => `Write everything in ${langName()}. ${style()}`;

// ---------- Telegram channel post ----------
// Your Telegram post format. Change the template and the rules here (and playbook/TELEGRAM-POST.md) to match your channel.
export const TG_FORMAT = (env) => `Telegram post format for ${brand(env).chan} (exactly this structure, labels in ${langName()}):
[topic emoji] [one intro line, with a number if there is one]:

[label of link 1]:
[link 1]

[label of link 2]:
[link 2]

🔴 [the word for "Tip" in ${langName()}]: [one useful tip or an honest warning]

💬 #[one word]

➡️ ${brand(env).chan}

Rules: ${inLang()} Only one speaker: ${brand(env).creator}. Links on their own line, a blank line between label/link pairs.
Emoji only in those four places. No markdown (no ** or # headings). Never claim the owner did something ("I built", "I tested")
unless the information says so; an "angle" or an "idea" means it has not been done yet.`;
const EXAMPLES = {
  en: "🎂 This week's cakes are in:\n\nThe full menu with prices:\nhttps://example.com/menu\n\nOrder a birthday cake (two days ahead):\nhttps://example.com/order\n\n🔴 Tip: keep a cream cake in the fridge until you serve it.\n\n💬 #menu",
  fa: "🎂 کیک‌های این هفته رسید:\n\nمنوی کامل با قیمت:\nhttps://example.com/menu\n\nسفارش کیک تولد (دو روز زودتر):\nhttps://example.com/order\n\n🔴 نکته: کیک خامه‌ای رو تا رسیدن به خونه بیرون یخچال نذار.\n\n💬 #منو",
  ar: "🎂 وصلت كعكات هذا الأسبوع:\n\nالقائمة الكاملة مع الأسعار:\nhttps://example.com/menu\n\nاطلب كعكة عيد ميلاد (قبل يومين):\nhttps://example.com/order\n\n🔴 نصيحة: احفظ كعكة الكريمة في الثلاجة حتى التقديم.\n\n💬 #القائمة",
  tr: "🎂 Bu haftanın pastaları geldi:\n\nFiyatlarıyla tüm menü:\nhttps://example.com/menu\n\nDoğum günü pastası siparişi (iki gün önceden):\nhttps://example.com/order\n\n🔴 İpucu: kremalı pastayı servise kadar buzdolabında tut.\n\n💬 #menü",
  de: "🎂 Die Torten dieser Woche sind da:\n\nDie ganze Karte mit Preisen:\nhttps://example.com/menu\n\nGeburtstagstorte bestellen (zwei Tage vorher):\nhttps://example.com/order\n\n🔴 Tipp: Sahnetorte bis zum Servieren im Kühlschrank lassen.\n\n💬 #karte",
  fr: "🎂 Les gâteaux de la semaine sont arrivés :\n\nLa carte complète avec les prix :\nhttps://example.com/menu\n\nCommander un gâteau d'anniversaire (deux jours avant) :\nhttps://example.com/order\n\n🔴 Astuce : garde un gâteau à la crème au frais jusqu'au service.\n\n💬 #carte",
  it: "🎂 Sono arrivate le torte della settimana:\n\nIl menù completo con i prezzi:\nhttps://example.com/menu\n\nOrdina una torta di compleanno (due giorni prima):\nhttps://example.com/order\n\n🔴 Consiglio: tieni la torta alla panna in frigo fino al momento di servirla.\n\n💬 #menu",
};
export const TG_EXAMPLE = (env) => `A correct example post:\n${EXAMPLES[lang()] || EXAMPLES.en}\n\n➡️ ${brand(env).chan}`;
export const SCORE_RULES = (env) => `Viral score out of 10 (page ${brand(env).ig}, audience: ${brand(env).audience}):
distance 3 (the subject is something the viewer touches in daily life: their money, city, food, looks, family, phone; tier 0 is
closest, 4 farthest), hook 2 (a number or a contrast in the first second), proof 2 (a real page, product, result or source),
reward 1 (what commenting the gate word gets them), novelty 1 (rarely covered in ${langName()} for this audience), length 1
(fits under 60 seconds).${brand(env).note ? " " + brand(env).note : ""}`;

// ---------- news digest (every ~3 days; NEWS_CHECK_AT="off" disables it, e.g. for a shop that has no "news") ----------
export const NEWS_PROMPT = (env, { today, from, recent }) => `Today is ${today}. With Google Search, find the most important news about
${brand(env).topic} from the last three days (${from} to ${today}) that is useful for the audience of ${brand(env).ig} (${brand(env).audience}).
3 to 5 items, only news really published in this window, each with the original link (the official page or a reputable outlet;
never a Google or vertexaisearch link). Do not repeat topics already covered: ${recent.join(" | ")}

${TG_FORMAT(env)}

Each item: at most two short sentences and 35 words: first what happened, then who it helps.
Fill the format like this: the first line is a 📰 headline for "this week's news about ${brand(env).topic}", then the items as
label/link pairs, then the 🔴 tip, then 💬 #news (the word "news" in ${langName()}), then ➡️ ${brand(env).chan}.

${TG_EXAMPLE(env)}

Return only the post text, nothing else.`;

// ---------- daily story idea ----------
// what kind of thing a good story for this page is about (STORY_IDEA_KIND var; a bakery: "a seasonal cake, a storage tip, a poll")
const STORY_IDEA_KIND = (env) => env.STORY_IDEA_KIND || "a product or service of the day, a practical tip, or a question for a poll";
const STORY_RULES = () => "Story rules: very short, at most 4 short lines per frame, 2 or 3 frames, one speaker, use → to point to the next frame.";
export const STORY_PROMPT = (env, { today }) => `Today is ${today}. For today's Instagram story of ${brand(env).ig} (audience: ${brand(env).audience}),
use Google Search to find one fresh, real thing about ${brand(env).topic} that is useful for this audience (${STORY_IDEA_KIND(env)}). Only one.
${STORY_RULES()} ${inLang()} If the story needs a sticker, suggest it: a link (to the order page, the product or the source), a poll
(two options) or a question box; if it is complete without one (a news item or a tip), set sticker to "none" so it posts by itself.
Return only JSON: {"title": "...", "frames": ["...", "..."], "sticker": "link|poll|question|none", "link": "https://...", "poll": ["...", "..."], "question": "...", "why": "why today"}`;

// ---------- the other prompts (search, idea research, post from an idea, replies) ----------
export const SEARCH_PROMPT = (env, q) => `A question from ${brand(env).creator} (owner of ${brand(env).ig}): «${q}»
Search with Google Search and answer short: 3 to 6 concrete items, each with one line of explanation and its original link (own line).
Only things with a source; if unsure, say so. End with one line starting with 🎬 and a short hook for an Instagram reel. No intro.
${inLang()}`;
export const RESEARCH_PROMPT = (env, i) => `Review this Instagram reel idea${i.url ? " (open and read its page)" : ""}:
Title: ${i.title || "—"}
Link: ${i.url || "—"}
Note: ${i.note || "—"} ${i.summary ? "\nCurrent summary: " + i.summary.slice(0, 1200) : ""}

${SCORE_RULES(env)}

Only write facts you saw on the page or in search (numbers, prices, whether it is free, what it needs).
${inLang()}
Return only JSON: {"summary": "two or three short, conversational sentences with the real numbers", "hook": "the first-second hook in ${brand(env).creator}'s voice", "gate": "one word to comment", "score": 0-10, "tier": 0-4, "weak": "the weakest part in one sentence", "avoid": "what not to say"}`;
export const POST_PROMPT = (env, i) => `Write a post for the Telegram channel ${brand(env).chan} about:
Title: ${i.title || "—"}
Link: ${i.url || "—"}
Information: ${(i.summary || "").slice(0, 2500)}
${i.note ? "Note: " + i.note : ""}
${i.url ? "Read the linked page and use only real links from that page or the official site." : "Find the official links with Google Search."}

${TG_FORMAT(env)}

${TG_EXAMPLE(env)}

Return only the post text.`;
// a suggested answer to an Instagram comment or DM (the owner approves it in the Studio bot before it is sent)
export const REPLY_PROMPT = (env, { kind, text, from, post }) => `You answer ${kind === "dm" ? "a direct message" : "a comment"} on Instagram for ${brand(env).ig}
(${brand(env).audience}), in the voice of ${brand(env).creator}.
${post ? `The post: «${String(post).slice(0, 400)}»\n` : ""}From @${from || "someone"}: «${text}»
Write ONE reply, at most two short sentences, helpful and warm. If they ask a price, hours, an address or how to order and the
information below does not say it, ${kind === "dm" ? "say you will check and answer soon" : "say you sent it in the DM"}; never invent a price or a fact.
${env.BUSINESS_FACTS ? "Facts you may use: " + env.BUSINESS_FACTS : ""}
${inLang()} Return only the reply text.`;

// ---------- stories ----------
// the label chip on top of every story frame
export const storyPill = (d, sticker) => sticker.startsWith("📊") ? _("Poll") : sticker.startsWith("❓") ? _("Question") : _("Today's pick");
// A story draft's body is "Story 1:\n…\n\nStory 2:\n…" (the word in the bot's language), optionally ending with a sticker line.
const FRAME_WORDS = ["Story", "استوری", "قصة", "Hikaye", "Storia", "Histoire"];
export function storyParts(d) {
  const body = d.body || "";
  const stickerM = body.match(/\n\n((?:🔗|📊|❓)[^\n]*)\s*$/);
  const sticker = stickerM ? stickerM[1] : "";
  const main = stickerM ? body.slice(0, stickerM.index) : body;
  const words = [...new Set([_("Story"), ...FRAME_WORDS])].join("|");
  let frames = main.split(new RegExp(`(?:^|\\n\\n)(?:${words})\\s*[0-9۰-۹٠-٩]+\\s*:\\s*\\n`, "i")).map((x) => x.trim()).filter(Boolean);
  if (!frames.length) frames = [main.trim()];
  const pill = storyPill(d, sticker);
  return { frames, sticker, pill };
}
export const storyBody = ({ frames, sticker }) => frames.map((f, i) => `${_("Story")} ${num(i + 1)}:\n${f}`).join("\n\n") + (sticker ? `\n\n${sticker}` : "");

// ---------- story frame template (1080×1920, rendered by Cloudflare Browser Rendering) ----------
// Text aligned to the reading side, vertically centred; content between y 250 and 1670 (Instagram safe zone).
// Colours come from STORY_BG / STORY_INK / STORY_ACCENT / STORY_MUTED (your design system).
export function frameHtml(env, { title, text, i, n, pill, roomForSticker }) {
  const e = (x) => esc(x).replace(/\n/g, "<br>");
  const BG = env.STORY_BG || "#101418", INK = env.STORY_INK || "#F2F0EA", AC = env.STORY_ACCENT || "#E8B04B", MU = env.STORY_MUTED || "#A9B0B8", b = brand(env);
  const dir = rtl() ? "rtl" : "ltr", align = rtl() ? "right" : "left";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:LB;src:url(data:font/woff2;base64,${FONT_BLACK}) format("woff2")}
@font-face{font-family:LS;src:url(data:font/woff2;base64,${FONT_SEMIBOLD}) format("woff2")}
html,body{margin:0;width:1080px;height:1920px;background:${BG};overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(900px 760px at 88% 12%,color-mix(in srgb,${AC} 13%,transparent),transparent 70%),radial-gradient(700px 600px at 0% 100%,color-mix(in srgb,${AC} 6%,transparent),transparent 70%),${BG}}
.top{position:absolute;top:250px;right:96px;left:96px;display:flex;justify-content:space-between;align-items:center;direction:${dir}}
.pill{font:36px/1 LB;color:${BG};background:${AC};border-radius:999px;padding:16px 34px 20px}
.num{font:34px/1 LS;color:${MU}}
.box{position:absolute;top:400px;bottom:${roomForSticker ? 520 : 380}px;right:96px;left:96px;display:flex;flex-direction:column;justify-content:center;direction:${dir};text-align:${align}}
h1{font:92px/1.32 LB;color:${INK};margin:0 0 44px}
.rule{width:120px;height:8px;background:${AC};border-radius:4px;margin:0 0 44px}
p{font:62px/1.72 LS;color:${INK};margin:0}
.foot{position:absolute;top:1600px;right:96px;left:96px;display:flex;justify-content:space-between;direction:${dir};font:34px/1 LS;color:${MU}}
.foot b{font-family:LB;color:${AC};font-weight:400}
</style></head><body><div class="bg"></div>
<div class="top"><span class="pill">${esc(pill)}</span><span class="num">${num(i + 1)} / ${num(n)}</span></div>
<div class="box" id="box">${title ? `<h1>${e(title)}</h1><div class="rule"></div>` : ""}<p id="p">${e(text).replace(/(→)/g, `<span style="color:${AC}">$1</span>`)}</p></div>
<div class="foot"><span><b>${esc(b.name)}</b></span><span dir="ltr">${esc(b.ig)}</span></div>
<script>window.fit=()=>{const b=document.getElementById("box"),p=document.getElementById("p");let s=62;while((b.scrollHeight>b.clientHeight+2)&&s>40){s-=2;p.style.fontSize=s+"px"}}</script>
</body></html>`;
}

// ---------- public replies under a gate comment (Zernio rotates 1 + 5 per reel; identical replies look like spam) ----------
const REPLIES = {
  en: ["Sent it, check your DMs 🙌", "It's in your DMs 📩", "Check your DMs, I sent it ✌️", "Sent 🙌 if it's not there, look in your message Requests",
    "Look at your DMs 😉", "It's in your DMs, save it so you don't lose it!", "Sent ✅ open your DMs", "Sent 📩 ask me there if you have a question",
    "Sent it, enjoy 🔥", "Sent! If it helps, share it with a friend 🙌", "Got it? Check your DMs 📩", "Link's in your DMs ✌️"],
  fa: ["فرستادم، دایرکتت رو چک کن 🙌", "رفت تو دایرکتت 📩", "چک کن دایرکتتو، برات فرستادم ✌️", "فرستادمش 🙌 اگه نیومد، پوشه‌ی Requests دایرکت رو ببین",
    "دایرکتتو ببین 😉", "تو دایرکتته، سیوش کن گمش نکنی!", "ارسال شد ✅ دایرکتتو باز کن", "فرستادم 📩 سوالی داشتی همون‌جا بپرس", "برات فرستادم، استفاده کن لذت ببر 🔥",
    "فرستادم! اگه به کارت اومد برا دوستات هم بفرست 🙌", "رسید دستت؟ دایرکتتو چک کن 📩", "لینکش رو فرستادم تو دایرکت ✌️"],
  ar: ["أرسلته، تفقّد رسائلك 🙌", "وصلك على الخاص 📩", "شوف رسائلك، أرسلته ✌️", "أرسلته 🙌 إذا ما وصلك، شوف طلبات الرسائل",
    "تفقّد الخاص 😉", "موجود في رسائلك، احفظه حتى لا يضيع!", "تم الإرسال ✅ افتح رسائلك", "أرسلته 📩 وإذا عندك سؤال اسألني هناك",
    "أرسلته لك، استمتع 🔥", "أرسلته! إذا أفادك شاركه مع أصحابك 🙌", "وصلك؟ تفقّد الخاص 📩", "الرابط في رسائلك ✌️"],
  tr: ["Gönderdim, DM'lerine bak 🙌", "DM'ne geldi 📩", "DM'ini kontrol et, gönderdim ✌️", "Gönderdim 🙌 gelmediyse mesaj isteklerine bak",
    "DM'lerine bir bak 😉", "DM'inde, kaybetmemek için kaydet!", "Gönderildi ✅ DM'lerini aç", "Gönderdim 📩 sorun olursa oradan yaz",
    "Gönderdim, keyfini çıkar 🔥", "Gönderdim! İşine yararsa arkadaşlarınla paylaş 🙌", "Ulaştı mı? DM'lerine bak 📩", "Link DM'inde ✌️"],
  de: ["Hab's geschickt, schau in deine DMs 🙌", "Ist in deinen DMs 📩", "Schau in deine Nachrichten, hab's geschickt ✌️", "Geschickt 🙌 falls nicht da, schau in die Nachrichtenanfragen",
    "Schau mal in deine DMs 😉", "Ist in deinen DMs, speicher es dir!", "Gesendet ✅ öffne deine DMs", "Geschickt 📩 Fragen gern dort",
    "Hab's dir geschickt, viel Spaß 🔥", "Geschickt! Wenn's hilft, teil es mit Freunden 🙌", "Angekommen? Schau in deine DMs 📩", "Der Link ist in deinen DMs ✌️"],
  fr: ["Envoyé, regarde tes DM 🙌", "C'est dans tes DM 📩", "Regarde tes messages, je l'ai envoyé ✌️", "Envoyé 🙌 si tu ne le vois pas, regarde dans les demandes de messages",
    "Jette un œil à tes DM 😉", "C'est dans tes DM, enregistre-le !", "Envoyé ✅ ouvre tes DM", "Envoyé 📩 pose tes questions là-bas",
    "Je te l'ai envoyé, profite 🔥", "Envoyé ! Si ça t'aide, partage-le à un ami 🙌", "Bien reçu ? Regarde tes DM 📩", "Le lien est dans tes DM ✌️"],
  it: ["Inviato, controlla i DM 🙌", "È nei tuoi DM 📩", "Controlla i messaggi, te l'ho mandato ✌️", "Inviato 🙌 se non lo vedi, guarda nelle richieste di messaggi",
    "Dai un'occhiata ai DM 😉", "È nei tuoi DM, salvalo!", "Inviato ✅ apri i DM", "Inviato 📩 se hai domande scrivimi lì",
    "Te l'ho mandato, goditelo 🔥", "Inviato! Se ti è utile condividilo con un amico 🙌", "Arrivato? Controlla i DM 📩", "Il link è nei tuoi DM ✌️"],
};
export const replyPool = () => REPLIES[lang()] || REPLIES.en;
export const tagsDefault = () => [_("Product"), _("Behind the scenes"), _("Customer question"), _("How-to"), _("Price"), _("Occasion"), _("Review"), _("News")].join(",");
export { listSep };
