// lib.mjs · shared pieces of the renderer: brand loading, fonts, direction, the page shell, Playwright rendering.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const RTL = new Set(["fa", "ar"]);
const FONTS = JSON.parse(fs.readFileSync(path.join(ROOT, "fonts/fonts.json"), "utf8"));
const EMOJI_CSS = path.join(ROOT, "tools/vendor/noto-emoji/font.css");   // written by tools/install.sh (Noto Color Emoji, OFL)

// a font reference from brand.json: a library id ("estedad") or { name, css } for your own licensed font
function fontRef(ref) {
  if (!ref) return null;
  if (typeof ref === "object") return { name: ref.name, css: path.resolve(ROOT, ref.css) };
  const f = FONTS.find((x) => x.id === ref);
  if (!f) throw new Error(`font "${ref}" is not in fonts/fonts.json`);
  return { name: f.name, css: path.join(ROOT, f.css) };
}
export function loadBrand(p = "brand/brand.json", over = {}) {
  const b = { ...JSON.parse(fs.readFileSync(path.resolve(ROOT, p), "utf8")), ...over };
  b.colors = { bg: "#FFFFFF", ink: "#111111", accent: "#E4572E", muted: "#777777", surface: "#FFFFFF", accent2: "#F2C14E", ...(b.colors || {}) };
  b.fonts = b.fonts || {};
  return b;
}
// which faces to load and the CSS stacks, for the content language
export function typeFor(brand, lang) {
  const script = lang === "fa" ? brand.fonts.fa || "vazirmatn" : lang === "ar" ? brand.fonts.ar || "cairo" : null;
  const faces = [fontRef(brand.fonts.display || "inter"), fontRef(brand.fonts.body || "inter"), fontRef(brand.fonts.mono || "jetbrains-mono"), script && fontRef(script)].filter(Boolean);
  const S = script ? `'${fontRef(script).name}', ` : "";
  // emoji come from Noto Color Emoji (OFL, COLRv1, downloaded by tools/install.sh) when installed, so every render has the same
  // licensed emoji on any computer; not in "check" because it only loads for emoji characters
  const E = fs.existsSync(EMOJI_CSS) ? `, 'Noto Color Emoji'` : "";
  return {
    faces: [...faces, ...(E ? [{ name: "Noto Color Emoji", css: EMOJI_CSS }] : [])], check: [...new Set(faces.map((f) => f.name))],
    display: `${S}'${fontRef(brand.fonts.display || "inter").name}'${E}, sans-serif`,
    body: `${S}'${fontRef(brand.fonts.body || "inter").name}'${E}, sans-serif`,
    mono: `'${fontRef(brand.fonts.mono || "jetbrains-mono").name}', monospace`,
  };
}
// latin digits → the language's digits (Persian / Arabic-Indic), for numbers set in text
export const digits = (s, lang) => { const d = lang === "fa" ? "۰۱۲۳۴۵۶۷۸۹" : lang === "ar" ? "٠١٢٣٤٥٦٧٨٩" : null; return d ? String(s).replace(/\d/g, (x) => d[x]) : String(s); };
export const img = (p, base) => (!p ? "" : /^(https?:|data:|file:)/.test(p) ? p : pathToFileURL(path.resolve(base || ROOT, p)).href);

// the page shell: brand tokens as CSS variables, fonts, direction; the template supplies css + body
export function page({ brand, lang, w, h, css = "", body = "" }) {
  const T = typeFor(brand, lang), c = brand.colors, rtl = RTL.has(lang);
  return `<!doctype html><html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8">
${T.faces.map((f) => `<link rel="stylesheet" href="${pathToFileURL(f.css).href}">`).join("\n")}
<style>
:root{--bg:${c.bg};--ink:${c.ink};--accent:${c.accent};--accent2:${c.accent2};--muted:${c.muted};--surface:${c.surface};--r:${brand.radius ?? 28}px;
--display:${T.display};--body:${T.body};--mono:${T.mono};--start:${rtl ? "right" : "left"};--end:${rtl ? "left" : "right"}}
*{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:clip;position:relative}
body{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.d{font-family:var(--display)}.m{font-family:var(--mono)}bdi{unicode-bidi:isolate}
.fit{text-wrap:balance}
${css}
</style></head><body>${body}
<script>window.__fit=()=>{document.querySelectorAll('[data-fit]').forEach((el)=>{let s=parseFloat(getComputedStyle(el).fontSize);const min=+el.dataset.fit||28;
const mh=parseFloat(getComputedStyle(el).maxHeight);const over=()=>el.scrollWidth>el.clientWidth+4||(Number.isFinite(mh)&&el.scrollHeight>mh+s*0.25);
while(over()&&s>min){s-=2;el.style.fontSize=s+'px'}})}</script></body></html>`;
}

// render HTML pages to PNG files with the installed Chrome; fails when a brand font did not load (a silent fallback is a bug)
export async function shoot(pages, outDir, { w, h, transparent = false } = {}) {
  const { chromium } = await import("playwright");
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome", headless: true }).catch(() => chromium.launch({ headless: true }));
  const out = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    for (const p of pages) {
      const tmp = path.join(outDir, `.${p.name}.html`);
      fs.writeFileSync(tmp, p.html);
      await pg.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
      await pg.evaluate(async (names) => {
        await document.fonts.ready;
        for (const n of names) for (const wt of [400, 700, 900]) await document.fonts.load(`${wt} 40px '${n}'`, "aبکA").catch(() => {});
        await document.fonts.load("40px 'Noto Color Emoji'", document.body.innerText).catch(() => {});   // only the emoji chunks this page uses
        await document.fonts.ready;
        window.__fit && window.__fit();
      }, p.fonts);
      const missing = await pg.evaluate((names) => names.filter((n) => !document.fonts.check(`40px '${n}'`, "aA")), p.fonts);
      if (missing.length) throw new Error(`font(s) not loaded: ${missing.join(", ")} (${p.name})`);
      const file = path.join(outDir, `${p.name}.png`);
      await pg.screenshot({ path: file, omitBackground: transparent });
      fs.unlinkSync(tmp);
      out.push(file);
    }
  } finally { await browser.close(); }
  return out;
}

// small shared components
// icons from four open sets, all bundled through tools/package.json:
//   "cake" or "lucide:cake"            Lucide (ISC)            lucide.dev
//   "tabler:cake" / "tabler:cake:filled"   Tabler Icons (MIT)  tabler.io/icons
//   "phosphor:cake[:bold|fill|duotone|light|thin]"  Phosphor (MIT)  phosphoricons.com
//   "hero:cake[:solid]"                Heroicons (MIT)          heroicons.com
const ICON_DIR = path.join(ROOT, "tools/node_modules");
export function iconPath(ref) {
  const [a, b, c] = String(ref).split(":"), set = b ? a : "lucide", name = b || a, v = c || "";
  const p = {
    lucide: `lucide-static/icons/${name}.svg`,
    tabler: `@tabler/icons/icons/${v === "filled" ? "filled" : "outline"}/${name}.svg`,
    phosphor: v && v !== "regular" ? `@phosphor-icons/core/assets/${v}/${name}-${v}.svg` : `@phosphor-icons/core/assets/regular/${name}.svg`,
    hero: `heroicons/24/${v === "solid" ? "solid" : "outline"}/${name}.svg`,
  }[set];
  return p ? path.join(ICON_DIR, p) : null;
}
export const icon = (name, color = "currentColor", size = 64) => {
  const p = iconPath(name);
  if (!p || !fs.existsSync(p)) { console.warn(`icon not found: ${name} (sets: lucide, tabler, phosphor, hero; node tools/render/icons.mjs <word> searches them)`); return ""; }
  // every set draws in currentColor (stroke or fill), so the colour is set once on the svg
  return fs.readFileSync(p, "utf8").replace(/<!--.*?-->/gs, "")
    .replace(/<svg\b([^>]*)>/, (m, attrs) => `<svg${attrs.replace(/\s(width|height|class)="[^"]*"/g, "")} width="${size}" height="${size}" style="color:${color};flex:none">`);
};
// Instagram carousels always advance from the right, in every language: the arrow points right and sits bottom-right
export const swipe = () => `<div class="swipe">→</div>`;
