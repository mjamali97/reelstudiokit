// ============================================================================================================
// formats.js · EVERYTHING the bot writes in your name: post format, prompts, story template, comment replies.
// The values below are neutral EXAMPLES. /setup rewrites this file with you: your post
// format, your story look, your words. A bakery, a clinic or a course page each gets its own version.
// index.js holds only the mechanics; nothing personal lives there.
// ============================================================================================================
import { FONT_BLACK, FONT_SEMIBOLD } from "./fonts.js";

const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (n) => String(n).replace(/\d/g, (d) => FA[d]);
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- brand (all from wrangler.jsonc vars) ----------
export const brand = (env) => ({
  name: env.BRAND_NAME || "My Studio",
  ig: env.IG_HANDLE || "",                                   // "@yourhandle"
  chan: env.TG_CHANNEL || String(env.PUBLISH_CHAT || ""),    // "@yourchannel" (the signature under posts)
  creator: env.CREATOR_NAME || "سازنده‌ی پیج",              // how the prompts call you
  audience: env.AUDIENCE || "مخاطب فارسی‌زبان",             // who the page is for, one line
  topic: env.NEWS_TOPIC || "حوزه‌ی کار من",                     // what the news digest is about
  note: env.AUDIENCE_NOTE || "",                             // one extra rule for scoring ideas (optional)
  audio: env.AUDIO_NAME || env.BRAND_NAME || "Original audio",
  tz: env.TZ_LABEL || env.TZ_NAME,
});

// ---------- Telegram channel post ----------
// Your Telegram post format. Change the template and the rules here (and playbook/TELEGRAM-POST.md) to match your channel.
export const TG_FORMAT = (env) => `قالب پست تلگرام ${brand(env).chan} (دقیقاً همین ساختار):
[ایموجی موضوع] [یه خط معرفی، با عدد اگه داره]:

[برچسب فارسی لینک ۱]:
[لینک ۱]

[برچسب فارسی لینک ۲]:
[لینک ۲]

🔴 نکته: [یه نکته‌ی کاربردی یا هشدار صادقانه]

💬 #[یک کلمه]

➡️ ${brand(env).chan}

لحن و قانون‌ها: فارسی محاوره‌ای، کوتاه و خودمونی (مثل «اومد»، «می‌شه»، «واست»)، فقط یک گوینده (خود ${brand(env).creator})، بدون کلمه‌های رسمی مثل «توسط»، «رونمایی»، «می‌باشد»،
بدون اغراق و کلمه‌هایی مثل «انقلابی» یا «باورنکردنی»، بدون ادعایی که منبع نداره. هر خط با یه کلمه‌ی فارسی شروع می‌شه
(اسم انگلیسی وسط یا آخر خط بیاد) و لینک‌ها خط خودشون رو دارن. ایموجی فقط همین چهار جا. نیم‌فاصله‌ی درست، عدد فارسی، «درصد» به‌جای ٪.
هیچ ادعایی درباره‌ی کاری که ${brand(env).creator} کرده («خودم ساختم»، «تست کردم») ننویس، مگر صریحاً توی اطلاعات گفته شده انجام شده؛ «زاویه» و «ایده» یعنی هنوز انجام نشده. بدون مارک‌داون (** یا #تیتر).`;
export const TG_EXAMPLE = (env) => `نمونه‌ی یه پست درست:
🎂 کیک‌های این هفته رسید:

منوی کامل با قیمت:
https://example.com/menu

سفارش کیک تولد (دو روز زودتر):
https://example.com/order

🔴 نکته: کیک خامه‌ای رو تا رسیدن به خونه بیرون یخچال نذار.

💬 #منو

➡️ ${brand(env).chan}`;
export const SCORE_RULES = (env) => `امتیاز وایرال از ۱۰ (پیج ${brand(env).ig}، مخاطب: ${brand(env).audience}):
فاصله ۳ (موضوع چیزیه که بیننده خودش دستش بهش می‌رسه: زندگی روزمره‌ش، پولش، شهرش، چیزی که می‌خوره یا می‌خره؛ پله‌ی ۰ نزدیک‌ترین، ۴ دورترین)،
هوک ۲ (عدد یا تضاد توی ثانیه‌ی اول)، اثبات ۲ (صفحه‌ی واقعی، ستاره، مقاله)، جایزه ۱ (چیزی که با کامنت گیت می‌گیره)،
تازگی ۱ (به زبان این مخاطب کم گفته شده)، طول ۱ (زیر ۶۰ ثانیه جا می‌شه).${brand(env).note ? " " + brand(env).note : ""}`;


// ---------- news digest (every ~3 days; NEWS_CHECK_AT="off" disables it, e.g. for a shop that has no "news") ----------
const NEWS_EXAMPLE = (env) => `نمونه‌ی یه خبر به لحن درست:
[چی شد، در یه جمله‌ی کوتاه و خودمونی]؛ [به درد کی می‌خوره]:
[لینک اصلی خبر]`;
export const NEWS_PROMPT = (env, { today, from, recent }) => `امروز ${today} است. با Google Search مهم‌ترین خبرهای ${brand(env).topic} سه روز گذشته (${from} تا ${today}) رو پیدا کن
که برای مخاطب پیج ${brand(env).ig} (${brand(env).audience}) کاربردی باشن.
۳ تا ۵ خبر، فقط خبرهایی که واقعاً توی همین بازه منتشر شدن، هر کدوم با لینک اصلی خود خبر (صفحه‌ی رسمی یا رسانه‌ی معتبر؛ لینک گوگل یا vertexaisearch نه).
خبرهایی که توی خلاصه‌های قبلی یا استوری‌ها اومدن رو تکرار نکن: ${recent.join(" | ")}

${TG_FORMAT(env)}

لحن خبرها مثل حرف زدن ${brand(env).creator} با دوستش: جمله‌های کوتاه (هر خبر حداکثر دو جمله و ۳۵ کلمه)، اول بگو چی شد، بعد بگو به درد کی می‌خوره.
کلمه‌های رسمی و خبرگزاری‌ای ممنوع: «توسط»، «رونمایی»، «امکانِ»، «معرفی کرد»، «اعلام کرد که»، «می‌باشد»، «حسابی»، «شرکت X». فعل محاوره‌ای: «داد بیرون»، «اومد»، «می‌شه»، «رایگانه».
${NEWS_EXAMPLE(env)}

برای خلاصه‌ی خبر، قالب رو این‌جوری پر کن:
📰 خلاصه‌ی خبرهای ${brand(env).topic} این سه روز:

[خبر ۱ در یک یا دو جمله‌ی کوتاه: چی شد و به درد کی می‌خوره]:
[لینک]

[خبر ۲ …]:
[لینک]

🔴 نکته: [یه نکته‌ی کاربردی از این خبرها]

💬 #خبر

➡️ ${brand(env).chan}

${TG_EXAMPLE(env)}

فقط متن پست رو برگردون، بدون هیچ توضیح دیگه.`;

// ---------- daily story idea ----------
// what kind of thing a good story for this page is about (a bakery: "یه شیرینی فصلی، یه نکته‌ی نگهداری کیک، یه سؤال برای نظرسنجی")
const STORY_IDEA_KIND = (env) => env.STORY_IDEA_KIND || "یه محصول یا خدمت امروز، یه نکته‌ی کاربردی، یا یه سؤال برای نظرسنجی";
const STORY_RULES = (env) => `قانون‌های استوری: خیلی کوتاه، هر فریم حداکثر ۴ خط کوتاه، ۲ یا ۳ فریم، محاوره‌ای و یک گوینده، «درصد» نه ٪، برای اشاره از → استفاده کن.`;
export const STORY_PROMPT = (env, { today }) => `امروز ${today} است. برای استوری امروز اینستاگرام ${brand(env).ig} (مخاطب: ${brand(env).audience})
با Google Search یه چیز تازه و واقعی درباره‌ی ${brand(env).topic} پیدا کن که به درد این مخاطب بخوره (${STORY_IDEA_KIND(env)}). فقط یکی.
${STORY_RULES(env)} اگه استوری به استیکر نیاز داره پیشنهادش بده: لینک (به صفحه‌ی سفارش، محصول یا منبع)، نظرسنجی (دو گزینه) یا سؤال؛
اگه بدون استیکر هم کامله (مثلاً یه خبر یا نکته)، sticker رو "none" بذار تا خودکار منتشر بشه.
فقط JSON برگردون: {"title": "...", "frames": ["...", "..."], "sticker": "link|poll|question|none", "link": "https://...", "poll": ["...", "..."], "question": "...", "why": "چرا امروز"}`;
// the label chip on top of every story frame
export const storyPill = (d, sticker) => sticker.startsWith("📊") ? "نظرسنجی" : sticker.startsWith("❓") ? "سؤال" : d.title && /خبر|اومد|معرفی/.test(d.title) ? "خبر" : "پیشنهاد امروز";

// ---------- story frame template (1080×1920, rendered by Cloudflare Browser Rendering) ----------
// Story layout: text right-aligned, vertically centred; content between y 250 and 1670 (Instagram safe zone).
// Colours come from STORY_BG / STORY_INK / STORY_ACCENT / STORY_MUTED (your design system).
export function storyParts(d) {
  const body = d.body || "";
  const stickerM = body.match(/\n\n((?:🔗|📊|❓)[^\n]*)\s*$/);
  const sticker = stickerM ? stickerM[1] : "";
  const main = stickerM ? body.slice(0, stickerM.index) : body;
  let frames = main.split(/(?:^|\n\n)استوری\s*[0-9۰-۹]+\s*:\s*\n/).map((x) => x.trim()).filter(Boolean);
  if (!frames.length) frames = [main.trim()];
  const pill = storyPill(d, sticker);
  return { frames, sticker, pill };
}
export const storyBody = ({ frames, sticker }) => frames.map((f, i) => `استوری ${fa(i + 1)}:\n${f}`).join("\n\n") + (sticker ? `\n\n${sticker}` : "");
export function frameHtml(env, { title, text, i, n, pill, roomForSticker }) {
  const e = (x) => esc(x).replace(/\n/g, "<br>");
  const BG = env.STORY_BG || "#101418", INK = env.STORY_INK || "#F2F0EA", AC = env.STORY_ACCENT || "#E8B04B", MU = env.STORY_MUTED || "#A9B0B8", b = brand(env);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:LB;src:url(data:font/woff2;base64,${FONT_BLACK}) format("woff2")}
@font-face{font-family:LS;src:url(data:font/woff2;base64,${FONT_SEMIBOLD}) format("woff2")}
html,body{margin:0;width:1080px;height:1920px;background:${BG};overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(900px 760px at 88% 12%,color-mix(in srgb,${AC} 13%,transparent),transparent 70%),radial-gradient(700px 600px at 0% 100%,color-mix(in srgb,${AC} 6%,transparent),transparent 70%),${BG}}
.top{position:absolute;top:250px;right:96px;left:96px;display:flex;justify-content:space-between;align-items:center;direction:rtl}
.pill{font:36px/1 LB;color:${BG};background:${AC};border-radius:999px;padding:16px 34px 20px}
.num{font:34px/1 LS;color:${MU}}
.box{position:absolute;top:400px;bottom:${roomForSticker ? 520 : 380}px;right:96px;left:96px;display:flex;flex-direction:column;justify-content:center;direction:rtl;text-align:right}
h1{font:92px/1.32 LB;color:${INK};margin:0 0 44px}
.rule{width:120px;height:8px;background:${AC};border-radius:4px;margin:0 0 44px}
p{font:62px/1.72 LS;color:${INK};margin:0}
.foot{position:absolute;top:1600px;right:96px;left:96px;display:flex;justify-content:space-between;direction:rtl;font:34px/1 LS;color:${MU}}
.foot b{font-family:LB;color:${AC};font-weight:400}
</style></head><body><div class="bg"></div>
<div class="top"><span class="pill">${esc(pill)}</span><span class="num">${fa(i + 1)} / ${fa(n)}</span></div>
<div class="box" id="box">${title ? `<h1>${e(title)}</h1><div class="rule"></div>` : ""}<p id="p">${e(text).replace(/(→)/g, `<span style="color:${AC}">$1</span>`)}</p></div>
<div class="foot"><span><b>${esc(b.name)}</b></span><span dir="ltr">${esc(b.ig)}</span></div>
<script>window.fit=()=>{const b=document.getElementById("box"),p=document.getElementById("p");let s=62;while((b.scrollHeight>b.clientHeight+2)&&s>40){s-=2;p.style.fontSize=s+"px"}}</script>
</body></html>`;
}

// ---------- public replies under a gate comment (Zernio rotates 1 + 5 per reel; identical replies look like spam) ----------
export const REPLY_POOL = ["فرستادم، دایرکتت رو چک کن 🙌", "رفت تو دایرکتت 📩", "چک کن دایرکتتو، برات فرستادم ✌️", "فرستادمش 🙌 اگه نیومد، پوشه‌ی Requests دایرکت رو ببین",
  "دایرکتتو ببین 😉", "تو دایرکتته، سیوش کن گمش نکنی!", "ارسال شد ✅ دایرکتتو باز کن", "فرستادم 📩 سوالی داشتی همون‌جا بپرس", "برات فرستادم، استفاده کن لذت ببر 🔥",
  "فرستادم! اگه به کارت اومد برا دوستات هم بفرست 🙌", "رسید دستت؟ دایرکتتو چک کن 📩", "لینکش رو فرستادم تو دایرکت ✌️"];
