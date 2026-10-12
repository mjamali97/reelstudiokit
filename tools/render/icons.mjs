#!/usr/bin/env node
// icons.mjs · find an icon in the four bundled sets (Lucide ISC, Tabler MIT, Phosphor MIT, Heroicons MIT).
//   node tools/render/icons.mjs <word> [--sheet out.png]     e.g. node tools/render/icons.mjs cake --sheet /tmp/cakes.png
// Use the printed reference in a spec: "icon": "tabler:cake", "phosphor:cake:duotone", "hero:cake:solid" or plain "cake" (Lucide).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, icon } from "./lib.mjs";

const word = process.argv[2], sheetAt = process.argv.indexOf("--sheet");
if (!word) { console.log("usage: node tools/render/icons.mjs <word> [--sheet out.png]"); process.exit(2); }
const N = path.join(ROOT, "tools/node_modules");
const sets = [["lucide", "lucide-static/icons", (f) => f], ["tabler", "@tabler/icons/icons/outline", (f) => f], ["tabler", "@tabler/icons/icons/filled", (f) => f + ":filled"],
  ["phosphor", "@phosphor-icons/core/assets/regular", (f) => f], ["hero", "heroicons/24/outline", (f) => f], ["hero", "heroicons/24/solid", (f) => f + ":solid"]];
const hits = [];
for (const [set, dir, ref] of sets) {
  if (!fs.existsSync(path.join(N, dir))) continue;
  for (const f of fs.readdirSync(path.join(N, dir))) if (f.endsWith(".svg") && f.includes(word)) hits.push(`${set === "lucide" ? "" : set + ":"}${ref(f.replace(/\.svg$/, ""))}`);
}
console.log(hits.length ? hits.join("\n") : `no icon contains "${word}"`);
if (sheetAt > 0 && hits.length) {
  const html = `<body style="margin:0;padding:20px;font:12px system-ui;display:grid;grid-template-columns:repeat(8,120px);gap:10px">${hits.slice(0, 96).map((h) =>
    `<div style="text-align:center">${icon(h, "#222", 56)}<div style="margin-top:6px;word-break:break-all">${h}</div></div>`).join("")}</body>`;
  const tmp = path.join(ROOT, ".icons-sheet.html"); fs.writeFileSync(tmp, html);
  const { chromium } = await import("playwright");
  const b = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome" }).catch(() => chromium.launch());
  try { const pg = await b.newPage({ viewport: { width: 1100, height: 200 } }); await pg.goto(pathToFileURL(tmp).href); await pg.screenshot({ path: process.argv[sheetAt + 1], fullPage: true }); }
  finally { await b.close(); fs.unlinkSync(tmp); }
  console.log("sheet →", process.argv[sheetAt + 1]);
}
