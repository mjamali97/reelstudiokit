#!/usr/bin/env node
// preview.mjs · the brand applied to real frames: a carousel cover and slide, two story frames, highlight covers and a
// caption, on one sheet. /setup and /brand show it to the owner before anything is saved; with several brand files it
// puts the directions side by side so they can pick or mix.
//
//   node tools/brand/preview.mjs [brand/brand.json ...] [--lang fa] [--out brand/preview] [--text sample.json]
//
// Sample texts are neutral; pass --text with {"kicker","title","sub","tip","tipText","story","storyText","price","caption"}
// in the owner's own words to see their real content. Output: <out>/<brand-file-name>.png and <out>/sheet.png.
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadBrand, page, typeFor, shoot, esc } from "../render/lib.mjs";
import * as C from "../render/carousels.mjs";
import * as S from "../render/stories.mjs";

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const files = args.filter((a, i) => a.endsWith(".json") && !(i && ["--text"].includes(args[i - 1])));
if (!files.length) files.push("brand/brand.json");
const out = path.resolve(ROOT, opt("--out", "brand/preview"));
const SAMPLE = {
  en: { kicker: "Tips", title: "3 things to know before you order", sub: "Save this for later", tip: "Order two days ahead", tipText: "Fresh things take time; we plan every order the day before.", story: "Fresh today", storyText: "Out of the oven at 8. Limited.", price: "$24", caption: "This is how your captions will look" },
  fa: { kicker: "نکته", title: "۳ نکته قبل از سفارش", sub: "سیوش کن واسه بعد", tip: "دو روز زودتر سفارش بده", tipText: "چیزای تازه وقت می‌بره؛ هر سفارش رو از روز قبل برنامه می‌ریزیم.", story: "تازه‌ی امروز", storyText: "ساعت ۸ از فر اومد بیرون. تعدادش کمه.", price: "۲۴۰ هزار تومن", caption: "زیرنویس‌هات این شکلی می‌شن" },
  ar: { kicker: "نصائح", title: "٣ أشياء قبل أن تطلب", sub: "احفظها لوقت لاحق", tip: "اطلب قبل يومين", tipText: "الأشياء الطازجة تحتاج وقتاً؛ نخطط لكل طلب من اليوم السابق.", story: "طازج اليوم", storyText: "خرج من الفرن الساعة ٨. الكمية محدودة.", price: "٢٤ دولار", caption: "هكذا ستبدو الترجمة على الفيديو" },
  tr: { kicker: "İpuçları", title: "Sipariş vermeden önce 3 şey", sub: "Sonrası için kaydet", tip: "İki gün önceden sipariş ver", tipText: "Taze şeyler zaman ister; her siparişi bir gün önceden planlıyoruz.", story: "Bugün taze", storyText: "Saat 8'de fırından çıktı. Sınırlı.", price: "₺240", caption: "Altyazıların böyle görünecek" },
  de: { kicker: "Tipps", title: "3 Dinge vor deiner Bestellung", sub: "Speicher dir das", tip: "Zwei Tage vorher bestellen", tipText: "Frisches braucht Zeit; wir planen jede Bestellung am Vortag.", story: "Heute frisch", storyText: "Um 8 aus dem Ofen. Nur wenige.", price: "24 €", caption: "So sehen deine Untertitel aus" },
  fr: { kicker: "Astuces", title: "3 choses à savoir avant de commander", sub: "Enregistre-le pour plus tard", tip: "Commande deux jours avant", tipText: "Le frais prend du temps ; on prépare chaque commande la veille.", story: "Frais du jour", storyText: "Sorti du four à 8 h. Quantité limitée.", price: "24 €", caption: "Voici à quoi ressembleront tes sous-titres" },
  it: { kicker: "Consigli", title: "3 cose da sapere prima di ordinare", sub: "Salvalo per dopo", tip: "Ordina due giorni prima", tipText: "Le cose fresche richiedono tempo; pianifichiamo ogni ordine il giorno prima.", story: "Fresco di oggi", storyText: "Sfornato alle 8. Pochi pezzi.", price: "24 €", caption: "Ecco come saranno i tuoi sottotitoli" },
};
const photo = path.join(ROOT, "examples/bakery/media/photo-2.jpg");
const sheets = [];
for (const f of files) {
  const brand = loadBrand(f), lang = opt("--lang", brand.lang || "en");
  const T = { ...(SAMPLE[lang] || SAMPLE.en), ...(opt("--text") ? JSON.parse(fs.readFileSync(opt("--text"), "utf8")) : {}) };
  const ctx = { brand, lang, base: ROOT, labels: false }, fonts = typeFor(brand, lang).check, name = path.basename(f, ".json");
  const dir = path.join(out, name);
  const deck = C.build({ template: "tips", cover: { kicker: T.kicker, title: T.title, sub: T.sub }, items: [{ title: T.tip, text: T.tipText }] }, ctx);
  const pages = [
    ...deck.map((body, i) => ({ name: `carousel-${i + 1}`, fonts, size: C.SIZE, html: page({ brand, lang, ...C.SIZE, css: C.CSS, body }) })),
    { name: "story-1", fonts, size: S.SIZE, html: page({ brand, lang, ...S.SIZE, css: S.CSS, body: S.TEMPLATES.special.frame({ chip: T.story, image: photo, title: T.tip, text: T.storyText, price: T.price }, ctx) }) },
    { name: "story-2", fonts, size: S.SIZE, html: page({ brand, lang, ...S.SIZE, css: S.CSS, body: S.TEMPLATES.tip.frame({ chip: T.kicker, n: 1, title: T.tip, text: T.tipText }, ctx) }) },
    ...["solid", "soft", "outline"].map((st, i) => ({ name: `highlight-${st}`, fonts, size: S.HL_SIZE, html: page({ brand, lang, ...S.HL_SIZE, css: S.HL_CSS, body: S.highlight({ icon: ["star", "tag", "map-pin"][i] }, ctx, st) }) })),
    { name: "caption", fonts, size: { w: 1080, h: 1920 }, html: page({ brand, lang, w: 1080, h: 1920, css: `body{background:url('${pathToUrl(photo)}') center/cover}#t{position:absolute;left:0;right:0;bottom:340px;display:flex;justify-content:center}#t span{font:700 58px/1.42 var(--body);color:#fff;background:rgba(0,0,0,.6);padding:10px 30px 14px;border-radius:22px;max-width:900px;text-align:center}`, body: `<div id="t"><span>${esc(T.caption)}</span></div>` }) },
  ];
  for (const sz of [C.SIZE, S.SIZE, S.HL_SIZE]) await shoot(pages.filter((p) => p.size.w === sz.w && p.size.h === sz.h), dir, sz);
  sheets.push({ name, brand, dir });
}
function pathToUrl(p) { return "file://" + p.split(path.sep).map(encodeURIComponent).join("/"); }

// one sheet: a row per brand file, so 2–3 directions read side by side
const row = (s) => {
  const im = (n, w) => `<img src="${pathToUrl(path.join(s.dir, n + ".png"))}" style="width:${w}px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.18)">`;
  const c = s.brand.colors;
  return `<section><h2>${s.name} <small>${s.brand.name} · ${Object.values(s.brand.fonts).filter((x) => typeof x === "string").slice(0, 2).join(" + ")}</small></h2>
<div class="sw">${Object.entries(c).map(([k, v]) => `<span><i style="background:${v}"></i>${k} ${v}</span>`).join("")}</div>
<div class="r">${im("carousel-1", 300)}${im("carousel-2", 300)}${im("story-1", 210)}${im("story-2", 210)}<div class="hl">${im("highlight-solid", 120)}${im("highlight-soft", 120)}${im("highlight-outline", 120)}</div>${im("caption", 210)}</div></section>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:40px;background:#ECEAE6;font:15px system-ui;color:#222;width:1620px}
section{background:#fff;border-radius:20px;padding:26px 30px;margin-bottom:28px}h2{margin:0 0 10px;font-size:22px}small{color:#777;font-weight:400;margin-left:10px}
.sw{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;color:#555}.sw i{display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:-4px;margin-right:6px;border:1px solid #0002}
.r{display:flex;gap:18px;align-items:flex-start}.hl{display:grid;gap:12px}.hl img{border-radius:50%!important}</style>${sheets.map(row).join("")}`;
fs.writeFileSync(path.join(out, ".sheet.html"), html);
const { chromium } = await import("playwright");
const b = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome", headless: true }).catch(() => chromium.launch({ headless: true }));
try {
  const pg = await b.newPage({ viewport: { width: 1700, height: 300 } });
  await pg.goto(pathToUrl(path.join(out, ".sheet.html")));
  await pg.waitForLoadState("load");
  await pg.screenshot({ path: path.join(out, "sheet.png"), fullPage: true });
} finally { await b.close(); fs.unlinkSync(path.join(out, ".sheet.html")); }
console.log(`${path.join(out, "sheet.png")} (${sheets.length} direction${sheets.length > 1 ? "s" : ""})`);
