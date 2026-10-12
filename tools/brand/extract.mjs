#!/usr/bin/env node
// extract.mjs · read a business's brand from its website: colours (weighted by how much of the page they cover),
// fonts, logo and icons, social links, name, language. Used by /setup and /brand; nothing is guessed, everything is measured.
//
//   node tools/brand/extract.mjs <https://site> [--out brand/extracted] [--pages 3]
//
// Writes brand/extracted/<domain>/: report.json, report.md (what was found, to confirm with the owner), desktop.png,
// mobile.png, logo/icon files, and brand.draft.json (a brand.json proposal; /brand shows it and writes brand.json only
// after the owner confirms). Fonts that are not in fonts/fonts.json are reported with the closest library font, because
// a website's paid font may not be licensed for social media graphics.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../render/lib.mjs";

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const site = args.find((a) => /^https?:\/\//.test(a));
if (!site) { console.log("usage: node tools/brand/extract.mjs <https://site> [--out brand/extracted] [--pages 3]"); process.exit(2); }
const host = new URL(site).hostname.replace(/^www\./, "");
const outDir = path.resolve(ROOT, opt("--out", "brand/extracted"), host);
fs.mkdirSync(outDir, { recursive: true });
const LIB = JSON.parse(fs.readFileSync(path.join(ROOT, "fonts/fonts.json"), "utf8"));

// ---------- colour helpers ----------
const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hsl = (h) => {
  const [r, g, b] = rgbOf(h).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
};
const lum = (h) => { const c = rgbOf(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const dist = (a, b) => { const [p, q] = [rgbOf(a), rgbOf(b)]; return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
// merge near-identical colours (antialiasing, hover shades) into one swatch
function merge(m) {
  const out = [];
  for (const [c, w] of [...m.entries()].sort((a, b) => b[1] - a[1])) {
    const near = out.find((o) => dist(o.hex, c) < 18);
    near ? (near.w += w) : out.push({ hex: c, w });
  }
  const tot = out.reduce((n, o) => n + o.w, 0) || 1;
  return out.map((o) => ({ hex: o.hex, share: +(o.w / tot).toFixed(4) }));
}

// ---------- collect from the live page ----------
const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome", headless: true }).catch(() => chromium.launch({ headless: true }));
const report = { site, host, fetched: new Date().toISOString(), pages: [] };
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" });
  const pg = await ctx.newPage();
  const seen = new Set(), queue = [site], bg = new Map(), fg = new Map(), btn = new Map(), fonts = new Map();
  const maxPages = +opt("--pages", 3);
  while (queue.length && report.pages.length < maxPages) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    try { await pg.goto(url, { waitUntil: "networkidle", timeout: 45000 }); } catch { try { await pg.goto(url, { waitUntil: "load", timeout: 45000 }); } catch (e) { console.warn("skip", url, e.message); continue; } }
    await pg.waitForTimeout(1200);
    // close the most common cookie banners so they do not dominate the colours
    for (const t of ["Accept", "Accept all", "Agree", "OK", "Got it", "قبول", "Akzeptieren", "Accepter", "Accetta", "Kabul et"]) await pg.getByRole("button", { name: t, exact: true }).first().click({ timeout: 400 }).catch(() => {});
    if (!report.pages.length) await pg.screenshot({ path: path.join(outDir, "desktop.png") });
    const d = await pg.evaluate(() => {
      const rgb = (s) => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return a < 0.5 ? null : [r, g, b]; };
      const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.1 ? r : null; };
      const H = Math.max(document.documentElement.scrollHeight, innerHeight), bg = [], fg = [], btn = [], fonts = [];
      for (const el of document.querySelectorAll("body, body *")) {
        const r = vis(el); if (!r) continue;
        const cs = getComputedStyle(el), area = Math.min(r.width, innerWidth) * Math.min(r.height, H);
        const b = rgb(cs.backgroundColor); if (b) bg.push([b, area]);
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        if (own.length) {
          const c = rgb(cs.color); if (c) fg.push([c, own.length * parseFloat(cs.fontSize)]);
          const tag = el.tagName.toLowerCase(), role = /^h[1-3]$/.test(tag) ? "heading" : tag === "button" || tag === "a" ? "link" : "body";
          fonts.push([cs.fontFamily, role, own.length * parseFloat(cs.fontSize), cs.fontWeight]);
        }
        if (el.matches("button, a[class*=btn], a[class*=button], [role=button], input[type=submit], .btn, .button")) { const b2 = rgb(cs.backgroundColor); if (b2) btn.push([b2, area]); const c2 = rgb(cs.color); if (c2 && !b2) btn.push([c2, 50]); }
        const bc = cs.borderTopWidth !== "0px" && rgb(cs.borderTopColor); if (bc && r.width > 40) btn.push([bc, 10]);
      }
      const docBg = rgb(getComputedStyle(document.body).backgroundColor) || rgb(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
      const meta = (s) => document.querySelector(s)?.getAttribute("content") || null;
      const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
      const icons = [...document.querySelectorAll("link[rel~=icon], link[rel=apple-touch-icon], link[rel=mask-icon]")].map((l) => ({ rel: l.rel, href: abs(l.getAttribute("href")), sizes: l.sizes?.value || "" }));
      const logos = [...document.querySelectorAll("img, svg")].filter((e) => {
        const s = ((e.getAttribute("src") || "") + " " + (e.getAttribute("alt") || "") + " " + (e.className?.baseVal ?? e.className ?? "") + " " + (e.id || "") + " " + (e.closest("a")?.getAttribute("href") || "")).toLowerCase();
        const r = e.getBoundingClientRect(); return r.top < 250 && r.width > 20 && (/logo|brand/.test(s) || e.closest("header, nav, [class*=logo]"));
      }).slice(0, 4).map((e) => e.tagName === "IMG" ? { type: "img", src: abs(e.currentSrc || e.src), w: e.naturalWidth } : { type: "svg", svg: e.outerHTML.length < 60000 ? e.outerHTML : null });
      const links = [...document.querySelectorAll("a[href]")].map((a) => a.href);
      const social = {};
      for (const [k, re] of Object.entries({ instagram: /instagram\.com\/([A-Za-z0-9_.]+)/, telegram: /t\.me\/([A-Za-z0-9_]+)/, tiktok: /tiktok\.com\/@([A-Za-z0-9_.]+)/, youtube: /youtube\.com\/(@?[A-Za-z0-9_.-]+)/, whatsapp: /(wa\.me|api\.whatsapp\.com)\/([0-9+]+)?/, facebook: /facebook\.com\/([A-Za-z0-9_.]+)/, linkedin: /linkedin\.com\/(company|in)\/([A-Za-z0-9_-]+)/ })) { const l = links.find((x) => re.test(x)); if (l) social[k] = l; }
      const fontLinks = [...document.querySelectorAll("link[href*='fonts.googleapis'], link[href*='typekit'], link[href*='fonts.bunny']")].map((l) => l.href);
      const faces = [...document.fonts].map((f) => f.family.replace(/["']/g, "")).filter((v, i, a) => a.indexOf(v) === i);
      const sameSite = links.filter((h) => { try { const u = new URL(h); return u.hostname === location.hostname && !/\.(pdf|jpg|png|zip)$/i.test(u.pathname) && !u.hash; } catch { return false; } });
      return { bg, fg, btn, fonts, docBg, icons, logos, social, fontLinks, faces, title: document.title, lang: document.documentElement.lang || null, dir: document.documentElement.dir || getComputedStyle(document.body).direction,
        name: meta("meta[property='og:site_name']") || meta("meta[name='application-name']"), description: meta("meta[name=description]") || meta("meta[property='og:description']"),
        ogImage: abs(meta("meta[property='og:image']") || ""), themeColor: meta("meta[name=theme-color]"), sameSite: [...new Set(sameSite)].slice(0, 30) };
    });
    const add = (m, list) => list.forEach(([c, w]) => { const h = hex(...c); m.set(h, (m.get(h) || 0) + w); });
    add(bg, d.bg); add(fg, d.fg); add(btn, d.btn);
    bg.set(hex(...d.docBg), (bg.get(hex(...d.docBg)) || 0) + 1440 * 900);
    for (const [fam, role, w, weight] of d.fonts) { const first = fam.split(",")[0].replace(/["']/g, "").trim(); const key = `${first}|${role}`; const f = fonts.get(key) || { family: first, stack: fam, role, w: 0, weights: new Set() }; f.w += w; f.weights.add(weight); fonts.set(key, f); }
    report.pages.push({ url, title: d.title });
    if (report.pages.length === 1) Object.assign(report, { name: d.name, title: d.title, description: d.description, lang: d.lang, dir: d.dir, ogImage: d.ogImage, themeColor: d.themeColor, icons: d.icons, logos: d.logos, social: d.social, fontLinks: d.fontLinks, faces: d.faces });
    else for (const [k, v] of Object.entries(d.social)) report.social[k] ??= v;
    // next pages: about / menu / shop / products are the most "on brand"
    const pri = d.sameSite.filter((h) => /about|menu|shop|product|service|collection|درباره|منو|محصول/i.test(h));
    queue.push(...pri.slice(0, 4), ...d.sameSite.slice(0, 4));
  }
  // mobile view of the home page, how most Instagram visitors see it
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const mp = await m.newPage();
  await mp.goto(site, { waitUntil: "load", timeout: 45000 }).then(() => mp.waitForTimeout(1200)).then(() => mp.screenshot({ path: path.join(outDir, "mobile.png") })).catch(() => {});

  report.colors = { backgrounds: merge(bg).slice(0, 8), text: merge(fg).slice(0, 6), actions: merge(btn).slice(0, 6) };
  report.fonts = [...fonts.values()].sort((a, b) => b.w - a.w).slice(0, 8).map((f) => ({ family: f.family, role: f.role, weights: [...f.weights].sort(), stack: f.stack }));

  // ---------- save logo and icon files ----------
  report.files = [];
  const save = async (url, name) => {
    try {
      const r = await ctx.request.get(url, { timeout: 20000 }); if (!r.ok()) return;
      const type = r.headers()["content-type"] || "", ext = /svg/.test(type) ? "svg" : /png/.test(type) ? "png" : /jpe?g/.test(type) ? "jpg" : /webp/.test(type) ? "webp" : /icon/.test(type) ? "ico" : (url.split("?")[0].split(".").pop() || "bin").slice(0, 4);
      const f = `${name}.${ext}`; fs.writeFileSync(path.join(outDir, f), await r.body()); report.files.push(f);
    } catch {}
  };
  for (const [i, l] of (report.logos || []).entries()) l.type === "img" && l.src ? await save(l.src, `logo-${i + 1}`) : l.svg && (fs.writeFileSync(path.join(outDir, `logo-${i + 1}.svg`), l.svg), report.files.push(`logo-${i + 1}.svg`));
  const bigIcon = (report.icons || []).sort((a, b) => (parseInt(b.sizes) || (b.rel.includes("apple") ? 180 : 0)) - (parseInt(a.sizes) || (a.rel.includes("apple") ? 180 : 0)))[0];
  if (bigIcon?.href) await save(bigIcon.href, "icon");
  if (report.ogImage) await save(report.ogImage, "og-image");
  for (const l of report.logos || []) delete l.svg;
  // colours inside the pictures (hero photos, og-image, logo): many brands carry their colour there, not in CSS
  const sample = report.files.filter((f) => /^(logo|og-image|icon)/.test(f) && !/\.ico$/.test(f)).concat(["desktop.png", "mobile.png"]).filter((f) => fs.existsSync(path.join(outDir, f)));
  const pp = await ctx.newPage(), counts = new Map();
  for (const f of sample) {
    const type = f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : f.endsWith(".webp") ? "image/webp" : "image/jpeg";
    const data = `data:${type};base64,${fs.readFileSync(path.join(outDir, f)).toString("base64")}`;
    const px = await pp.evaluate(async (src) => {
      const im = new Image(); im.src = src; await im.decode().catch(() => {}); if (!im.width) return [];
      const w = 160, h = Math.max(1, Math.round((im.height / im.width) * 160)), c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d"); g.drawImage(im, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data, out = {};
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; const k = [0, 1, 2].map((j) => (d[i + j] >> 3) << 3 | 4).join(","); out[k] = (out[k] || 0) + 1; }
      return Object.entries(out);
    }, data).catch(() => []);
    const wt = f.startsWith("logo") || f.startsWith("icon") ? 6 : 1; // a logo pixel says more about the brand than a photo pixel
    for (const [k, n] of px) { const h = hex(...k.split(",").map(Number)); counts.set(h, (counts.get(h) || 0) + n * wt); }
  }
  report.colors.images = merge(counts).slice(0, 10);
} finally { await browser.close(); }

// ---------- propose brand.json ----------
const bgs = report.colors.backgrounds, txt = report.colors.text;
const pageBg = bgs[0]?.hex || "#FFFFFF";
const ink = txt.find((c) => contrast(c.hex, pageBg) >= 7)?.hex || (lum(pageBg) > 0.4 ? "#111111" : "#F5F5F5");
const colourful = (c) => hsl(c.hex).s > 0.28 && hsl(c.hex).l > 0.18 && hsl(c.hex).l < 0.82;
const pool = [...report.colors.actions, ...bgs.slice(1), ...txt].filter(colourful);
const imgPool = (report.colors.images || []).filter((c) => colourful(c) && c.share > 0.004);
const accentFrom = report.themeColor && /^#[0-9a-f]{6}$/i.test(report.themeColor) && colourful({ hex: report.themeColor.toUpperCase() }) ? "theme-color" : pool[0] ? "buttons and links" : imgPool[0] ? "logo and photos" : "none";
const accent = { "theme-color": report.themeColor?.toUpperCase(), "buttons and links": pool[0]?.hex, "logo and photos": imgPool[0]?.hex, none: lum(pageBg) > 0.4 ? ink : "#FFFFFF" }[accentFrom];
const soft = (c) => hsl(c.hex).s > 0.18 && hsl(c.hex).l > 0.15 && hsl(c.hex).l < 0.93; // a pastel second colour is fine
const accent2 = [...pool, ...imgPool, ...bgs.filter(soft), ...(report.colors.images || []).filter(soft)].find((c) => dist(c.hex, accent) > 90)?.hex || null;
const muted = txt.find((c) => c.hex !== ink && contrast(c.hex, pageBg) >= 3 && contrast(c.hex, pageBg) < 7)?.hex || null;
const surface = bgs.find((c) => c.hex !== pageBg && dist(c.hex, pageBg) < 60 && contrast(c.hex, ink) >= 7)?.hex || (lum(pageBg) > 0.5 ? "#FFFFFF" : pageBg);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const libMatch = (fam) => LIB.find((f) => norm(f.name) === norm(fam) || norm(f.id) === norm(fam));
const head = report.fonts.find((f) => f.role === "heading") || report.fonts[0], body = report.fonts.find((f) => f.role === "body") || report.fonts[0];
const pick = (f, fallback) => { if (!f) return { use: fallback, note: "no text found" }; const m = libMatch(f.family); return m ? { use: m.id, note: `${f.family} is in the library` } : { use: fallback, note: `${f.family} is not in the library (check its licence before using it on social media; add it as {name, css} if you have one). Closest library choice: ${fallback}` }; };
const serif = (f) => /serif/.test(f?.stack || "") && !/sans-serif/.test(f?.stack || "");
const dPick = pick(head, serif(head) ? "fraunces" : "bricolage-grotesque"), bPick = pick(body, serif(body) ? "fraunces" : "inter");
const lang = (report.lang || "en").slice(0, 2).toLowerCase();
const ig = report.social?.instagram?.match(/instagram\.com\/([A-Za-z0-9_.]+)/)?.[1];
const draft = {
  _comment: `Draft from ${site} (tools/brand/extract.mjs, ${report.fetched.slice(0, 10)}). Confirm with the owner, then save as brand/brand.json.`,
  name: report.name || report.title?.split(/[|·–-]/)[0].trim() || host, handle: ig ? `@${ig}` : "", lang: ["en", "fa", "ar", "tr", "de", "fr", "it"].includes(lang) ? lang : "en",
  colors: { bg: pageBg, ink, accent, muted: muted || (lum(pageBg) > 0.4 ? "#777777" : "#AAAAAA"), surface, accent2: accent2 || accent },
  fonts: { display: dPick.use, body: bPick.use, fa: "vazirmatn", ar: "cairo", mono: "jetbrains-mono" },
  logo: report.files.find((f) => f.startsWith("logo")) ? path.relative(ROOT, path.join(outDir, report.files.find((f) => f.startsWith("logo")))) : null,
  radius: 24, footer: [host, ig && `@${ig}`].filter(Boolean).join(" · "),
};
report.proposal = { brand: draft, notes: { display: dPick.note, body: bPick.note, accent: accentFrom === "none" ? "no brand colour found on the site: ask the owner for it" : `accent read from ${accentFrom}`, contrast: `ink on bg ${contrast(ink, pageBg).toFixed(1)}:1 · white on accent ${contrast("#FFFFFF", accent).toFixed(1)}:1${contrast("#FFFFFF", accent) < 4.5 ? " (under 4.5: set surface dark or use the accent only for shapes, not small text)" : ""}` } };
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 1));
fs.writeFileSync(path.join(outDir, "brand.draft.json"), JSON.stringify(draft, null, 1));
const sw = (l) => l.map((c) => `\`${c.hex}\` ${(c.share * 100).toFixed(0)}%`).join(" · ");
fs.writeFileSync(path.join(outDir, "report.md"), `# Brand read from ${site}

Pages read: ${report.pages.map((p) => p.url).join(", ")}

**Name** ${draft.name} · **language** ${report.lang || "?"} (${report.dir}) · **Instagram** ${ig ? "@" + ig : "not linked on the site"}
${report.description ? `\n> ${report.description}\n` : ""}
## Colours (share of the page they cover)
- Backgrounds: ${sw(report.colors.backgrounds)}
- Text: ${sw(report.colors.text)}
- Buttons and links: ${sw(report.colors.actions) || "none found"}
- Inside logo and photos: ${sw(report.colors.images || [])}
- theme-color: ${report.themeColor || "not set"}

## Fonts
${report.fonts.map((f) => `- ${f.family} (${f.role}, weights ${f.weights.join("/")})`).join("\n") || "- none found"}
${report.fontLinks?.length ? `\nFont services: ${report.fontLinks.join(", ")}` : ""}

## Files saved here
${report.files.map((f) => `- ${f}`).join("\n") || "- no logo found; ask the owner for the logo file"}
- desktop.png, mobile.png (screenshots)

## Social links found
${Object.entries(report.social || {}).map(([k, v]) => `- ${k}: ${v}`).join("\n") || "- none"}

## Proposed brand.json (brand.draft.json)
- bg ${draft.colors.bg} · ink ${draft.colors.ink} · accent ${draft.colors.accent} · accent2 ${draft.colors.accent2} · muted ${draft.colors.muted} · surface ${draft.colors.surface}
- display font: ${draft.fonts.display} (${dPick.note})
- body font: ${draft.fonts.body} (${bPick.note})
- ${report.proposal.notes.accent}
- ${report.proposal.notes.contrast}
`);
console.log(`${outDir}\n  colours: bg ${draft.colors.bg}, ink ${draft.colors.ink}, accent ${draft.colors.accent} (${accentFrom}), accent2 ${draft.colors.accent2}\n  fonts: ${report.fonts.slice(0, 3).map((f) => f.family).join(", ") || "-"} → ${draft.fonts.display} / ${draft.fonts.body}\n  files: ${report.files.join(", ") || "none"}\n  instagram: ${ig ? "@" + ig : "-"}`);
