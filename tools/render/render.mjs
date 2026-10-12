#!/usr/bin/env node
// render.mjs · carousels, stories and highlight covers from a JSON spec, in the brand (brand/brand.json), with the installed Chrome.
//
//   node tools/render/render.mjs <spec.json> [--out <dir>] [--brand brand/brand.json]
//   node tools/render/render.mjs --list                       # every template with the shape of its data
//
// spec: { "type": "carousel" | "story" | "highlights", "template": "<name>", "lang": "en|fa|ar|tr|de|fr|it", ... }
//   carousel:   { cover: {kicker, title, sub, image}, items: [...], cta: {title, text, word, save, share}, + template words }
//   story:      { frames: [ { template: "special", ...data }, ... ] }          (each frame picks its own template)
//   highlights: { set: "food|shop|service|creator" or items: [{icon, label}], style: "solid|soft|outline", labels: false }
// "illustration": "doodle:<name>" or "peep:<seed>" (CC0, recoloured to the brand) on a cover, a cta, a tips item, a tip or question story.
// Images are paths relative to the spec file. Output: PNG files in --out (default: next to the spec, <name>/).
import fs from "node:fs";
import path from "node:path";
import { loadBrand, page, typeFor, shoot } from "./lib.mjs";
import * as C from "./carousels.mjs";
import * as S from "./stories.mjs";
import { resolveIllustrations } from "./illustrations.mjs";
import { resolveMaps } from "./maps.mjs";

const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
if (args[0] === "--list" || !args[0]) {
  console.log("CAROUSELS (1080×1350): cover → items → cta");
  for (const [k, t] of Object.entries(C.TEMPLATES)) console.log(`  ${k.padEnd(14)} ${t.about}\n  ${"".padEnd(14)} item: ${t.item}`);
  console.log("\nSTORIES (1080×1920): frames[], each { template, ...data }");
  for (const [k, t] of Object.entries(S.TEMPLATES)) console.log(`  ${k.padEnd(14)} ${t.about}\n  ${"".padEnd(14)} data: ${t.data}`);
  console.log("\nHIGHLIGHT COVERS (1080×1080): sets", Object.keys(S.HL_SETS).join(", "), "· styles", S.HL_STYLES.join(", "));
  process.exit(0);
}
const specPath = path.resolve(args[0]), spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const lang = spec.lang || "en", brand = loadBrand(opt("--brand") || spec.brand || "brand/brand.json");
const ctx = { brand, lang, base: path.dirname(specPath), labels: !!spec.labels };
const out = path.resolve(opt("--out") || path.join(path.dirname(specPath), path.basename(specPath, ".json")));
const fonts = typeFor(brand, lang).check;
await resolveIllustrations(spec, brand);   // "illustration": "doodle:coffee" | "peep:sara" … → recoloured SVG
if (spec.type === "story") await resolveMaps(spec, brand);   // "location" frames: a map drawn from OpenStreetMap data, cached
let pages, size;
if (spec.type === "carousel") {
  size = C.SIZE;
  pages = C.build(spec, ctx).map((body, i) => ({ name: `slide-${String(i + 1).padStart(2, "0")}`, fonts, html: page({ brand, lang, ...size, css: C.CSS, body }) }));
} else if (spec.type === "story") {
  size = S.SIZE;
  pages = spec.frames.map((f, i) => {
    const t = S.TEMPLATES[f.template];
    if (!t) throw new Error(`unknown story template "${f.template}"`);
    return { name: `story-${String(i + 1).padStart(2, "0")}-${f.template}`, fonts, html: page({ brand, lang, ...size, css: S.CSS, body: t.frame(f, ctx) }) };
  });
} else if (spec.type === "highlights") {
  size = S.HL_SIZE;
  const items = spec.items || (S.HL_SETS[spec.set] || S.HL_SETS.service).map(([icon, label]) => ({ icon, label }));
  pages = items.map((d, i) => ({ name: `highlight-${String(i + 1).padStart(2, "0")}-${d.icon}`, fonts, html: page({ brand, lang, ...size, css: S.HL_CSS, body: S.highlight(d, ctx, spec.style || "solid") }) }));
} else throw new Error(`spec.type must be carousel, story or highlights`);
const files = await shoot(pages, out, size);
console.log(`${files.length} images → ${out}`);
