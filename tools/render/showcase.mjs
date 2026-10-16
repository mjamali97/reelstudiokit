#!/usr/bin/env node
// showcase.mjs · rebuild the images in docs/showcase/ that the README shows: the 14 video styles, the 10 carousel templates,
// the story templates, highlight covers. Run it before a release when anything visual changed.
//
//   node tools/render/showcase.mjs [--only styles,carousels,stories,highlights]
//
// Inputs: tools/style-reel (stills.mjs seeks each style), examples/bakery/ renders (run render.mjs on the specs first).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";

const OUT = path.join(ROOT, "docs/showcase"); fs.mkdirSync(OUT, { recursive: true });
const only = (process.argv[process.argv.indexOf("--only") + 1] || "styles,carousels,stories,highlights").split(",");
const url = (p) => pathToFileURL(p).href;
const STYLES = [["clean", 8.6], ["vogue", 8.6], ["luxe", 8.9], ["vox", 8.6], ["swiss", 8.6], ["brutal", 10.4], ["pop", 10.6],
  ["retro", 8.6], ["neon", 8.9], ["chalk", 8.9], ["receipt", 10.4], ["hud", 8.6], ["doodle", 8.6], ["depth", 8.9]];

async function sheet(name, cells, { cols, w, title }) {
  const h = Math.round(w * cells[0].ratio);
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:28px;background:#111;font:600 18px/1.2 system-ui;color:#eee;width:${cols * (w + 16) + 40}px">
${title ? `<div style="font-size:24px;margin:0 0 18px 4px">${title}</div>` : ""}<div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:16px">
${cells.map((c) => `<figure style="margin:0"><img src="${url(c.file)}" style="width:${w}px;height:${h}px;object-fit:cover;border-radius:12px;display:block">
<figcaption style="margin-top:8px;color:#bbb">${c.label}</figcaption></figure>`).join("")}</div></body>`;
  const tmp = path.join(OUT, `.${name}.html`); fs.writeFileSync(tmp, html);
  const { chromium } = await import("playwright");
  const b = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome" }).catch(() => chromium.launch());
  try { const pg = await b.newPage({ viewport: { width: 800, height: 400 } }); await pg.goto(url(tmp)); await pg.waitForLoadState("load");
    await pg.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }); } finally { await b.close(); fs.unlinkSync(tmp); }
  console.log(path.join(OUT, `${name}.png`));
}

if (only.includes("styles")) {
  const dir = path.join(ROOT, "tools/style-reel/renders/showcase");
  for (const [s, t] of STYLES) execFileSync("node", [path.join(ROOT, "tools/style-reel/stills.mjs"), s, "--t", String(t), "--out", dir], { stdio: "ignore" });
  await sheet("styles", STYLES.map(([s, t]) => ({ file: path.join(dir, `${s}-${String(t).replace(".", "_")}.png`), label: `/${s}`, ratio: 1920 / 1080 })), { cols: 7, w: 230, title: "14 video styles · the same reel, 14 looks" });
}
if (only.includes("carousels")) {
  const base = path.join(ROOT, "examples/bakery/carousels");
  const decks = ["tips", "steps", "myth-fact", "before-after", "price-menu", "faq", "comparison", "testimonial", "checklist", "showcase"];
  const cells = decks.flatMap((d) => [1, 2].map((n) => ({ file: path.join(base, d, `slide-0${n}.png`), label: n === 1 ? d : "", ratio: 1350 / 1080 })));
  await sheet("carousels", cells, { cols: 10, w: 200, title: "10 carousel templates · cover + first slide, in the example brand" });
}
if (only.includes("stories")) {
  const dir = path.join(ROOT, "examples/bakery/stories/stories");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  await sheet("stories", files.map((f) => ({ file: path.join(dir, f), label: f.replace(/^story-\d+-|\.png$/g, ""), ratio: 1920 / 1080 })), { cols: 10, w: 170, title: "10 story templates · stickers are placed in the Instagram app" });
}
if (only.includes("highlights")) {
  const cells = ["solid", "soft", "outline"].flatMap((st) => { const dir = path.join(ROOT, `examples/bakery/stories/highlights-${st}`);
    return fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort().map((f, i) => ({ file: path.join(dir, f), label: i ? "" : st, ratio: 1 })); });
  await sheet("highlights", cells, { cols: 8, w: 120, title: "Highlight covers · 4 sets × 3 styles" });
}
