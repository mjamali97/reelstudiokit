#!/usr/bin/env node
// stills.mjs · frames of a style without rendering the video: opens index.html in Chrome, seeks the timeline, screenshots.
// For quick looks while building a style, and for the showcase images.
//
//   node tools/style-reel/stills.mjs <style> [--t 1,3.5,8,15,22,27] [--out renders/stills] [--sheet] [--w 270]
//
// Writes <out>/<style>-<t>.png, and with --sheet one row <out>/<style>-sheet.png. The face video is a still here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const style = args[0];
if (!style || style.startsWith("--")) { console.log("usage: node tools/style-reel/stills.mjs <style> [--t 1,3.5,8] [--out dir] [--sheet]"); process.exit(2); }
const times = opt("--t", "1,3.6,8.4,10.4,15.2,17.2,19.6,21.2,23.4,25.5,27.4,29.5").split(",").map(Number);
const out = path.resolve(opt("--out", path.join(HERE, "renders/stills"))); fs.mkdirSync(out, { recursive: true });
const { chromium } = await import("playwright");
const b = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome", headless: true, args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });
const files = [];
try {
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(pathToFileURL(path.join(HERE, "index.html")).href + "?style=" + encodeURIComponent(style));
  for (let i = 0; i < 100 && !(await pg.evaluate(() => !!(window.__timelines && window.__timelines.main))); i++) await pg.waitForTimeout(150);
  await pg.evaluate(() => document.fonts.ready);
  if (errs.length) throw new Error("page errors: " + errs.join(" | "));
  for (const t of times) {
    await pg.evaluate((t) => { window.__timelines.main.seek(t, false); const v = document.getElementById("face"); if (v) v.currentTime = Math.min(t, (v.duration || 30) - .05); }, t);
    await pg.waitForTimeout(120);
    const f = path.join(out, `${style}-${String(t).replace(".", "_")}.png`); await pg.screenshot({ path: f }); files.push([t, f]);
  }
  if (args.includes("--sheet")) {
    const w = +opt("--w", 270), h = Math.round(w * 1920 / 1080);
    const html = `<body style="margin:0;background:#222;display:flex;gap:8px;padding:8px;font:600 16px system-ui;color:#ddd">${files.map(([t, f]) =>
      `<div><img src="${pathToFileURL(f).href}" style="width:${w}px;height:${h}px;display:block;border-radius:6px"><div style="padding:4px 2px">${t}s</div></div>`).join("")}</body>`;
    fs.writeFileSync(path.join(out, ".sheet.html"), html);
    await pg.setViewportSize({ width: files.length * (w + 8) + 8, height: h + 44 });
    await pg.goto(pathToFileURL(path.join(out, ".sheet.html")).href); await pg.waitForLoadState("load");
    await pg.screenshot({ path: path.join(out, `${style}-sheet.png`) }); fs.unlinkSync(path.join(out, ".sheet.html"));
    console.log(path.join(out, `${style}-sheet.png`));
  } else console.log(`${files.length} stills → ${out}`);
} finally { await b.close(); }
