#!/usr/bin/env node
// captions.mjs · burn captions into a finished vertical video, in the brand font, inside Instagram's safe zone.
//
//   node tools/render/captions.mjs <video.mp4> <captions.srt | words.json> <out.mp4> [options]
//
//   --style pill|outline|brand|word   pill: white on a dark pill (default) · outline: white with a dark edge, no box
//                                     brand: brand colours · word: word-by-word highlight (needs word timings, see below)
//   --lang en|fa|ar|tr|de|fr|it       caption language (default: brand.json "lang"); fa/ar are right-to-left
//   --size 58                         font size in px at 1080 wide (keep 50–62)
//   --bottom 1580                     y of the caption block's bottom edge at 1920 tall (under the chin, above Instagram's caption)
//   --chars 26                        max characters per line when words are grouped into cues
//   --font <id>                       a font id from fonts/fonts.json (default: the brand body font, or its fa/ar font)
//   --proof                           proofread the cue texts with Gemini (GEMINI_API_KEY in the environment) before burning
//   --brand brand/brand.json
//
// Inputs: an .srt file (any tool: CapCut, WhisperX, your editor), the kit's words.json (tools/style-reel/srt_words.py:
// [{text,start,end,type}]) or a WhisperX JSON ({segments:[{words:[{word,start,end}]}]}). Word timings give the "word" style.
// The cue texts are saved next to the output as <out>.cues.json; edit that file and run again to fix a word (it is reused).
// Audio is copied untouched. Needs ffmpeg and Playwright with Chrome (npm i in tools/).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadBrand, page, typeFor, RTL, esc } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith("--") && !(i && args[i - 1].startsWith("--") && !["--proof"].includes(args[i - 1])));
if (pos.length < 3) { console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 21).map((l) => l.replace(/^\/\/ ?/, "")).join("\n")); process.exit(pos.length ? 2 : 0); }
const [video, input, out] = pos.map((p) => path.resolve(p));
const brand = loadBrand(opt("--brand", "brand/brand.json"));
const lang = opt("--lang", brand.lang || "en"), rtl = RTL.has(lang), style = opt("--style", "pill");
const SIZE = +opt("--size", 58), BOTTOM = +opt("--bottom", 1580), CHARS = +opt("--chars", rtl ? 24 : 26);
if (opt("--font")) brand.fonts = { ...brand.fonts, body: opt("--font"), [lang]: opt("--font") };

// ---------- read cues ----------
const ts = (s) => { const [h, m, r] = s.trim().replace(",", ".").split(":"); return +h * 3600 + +m * 60 + +r; };
function readSrt(p) {
  return fs.readFileSync(p, "utf8").replace(/^﻿/, "").trim().split(/\r?\n\s*\r?\n/).map((b) => {
    const L = b.split(/\r?\n/).filter((l) => l.trim()), i = L.findIndex((l) => l.includes("-->"));
    if (i < 0) return null;
    const [a, z] = L[i].split("-->");
    return { s: ts(a), e: ts(z), t: L.slice(i + 1).join(" ").trim() };
  }).filter((c) => c && c.t);
}
function readWords(p) {
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const raw = Array.isArray(j) ? j.filter((w) => (w.type || "word") === "word").map((w) => ({ t: w.text, s: w.start, e: w.end }))
    : (j.segments || []).flatMap((s) => (s.words || []).map((w) => ({ t: w.word, s: w.start ?? s.start, e: w.end ?? s.end })));
  return raw.map((w) => ({ ...w, t: String(w.t).trim() })).filter((w) => w.t && Number.isFinite(w.s));
}
// words → cues of at most two lines, broken at pauses and sentence ends
function group(words) {
  const cues = []; let cur = null;
  for (const w of words) {
    const len = cur ? cur.words.reduce((n, x) => n + x.t.length + 1, 0) : 0;
    const brk = !cur || len + w.t.length > CHARS * 2 || w.s - cur.e > 0.6 || /[.!?؟…]$/.test(cur.words.at(-1).t);
    if (brk) { cur = { s: w.s, e: w.e, words: [] }; cues.push(cur); }
    cur.words.push(w); cur.e = w.e;
  }
  return cues.map((c) => ({ ...c, t: c.words.map((w) => w.t).join(" ") }));
}

const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString();
const [W, H] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", video]).toString().trim().split("x").map(Number);
const side = out.replace(/\.[^.]+$/, "") + ".cues.json";
let cues;
if (fs.existsSync(side)) { cues = JSON.parse(fs.readFileSync(side, "utf8")); console.log(`reusing ${path.basename(side)} (delete it to start from the input again)`); }
else {
  cues = input.endsWith(".json") ? group(readWords(input)) : readSrt(input);
  cues = cues.filter((c) => c.s < dur - 0.05).map((c) => ({ ...c, e: Math.min(c.e, dur) }));
  if (args.includes("--proof")) cues = await proofread(cues);
  fs.writeFileSync(side, JSON.stringify(cues, null, 1));
}
// Persian: the persian-motion-director linter (tools/install.sh video) flags Arabic ي/ك, wrong digits, missing half-spaces
if (lang === "fa") {
  // always safe in Persian text: Arabic yeh/kaf and Arabic-Indic digits → Persian
  const norm = (t) => t.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[٠-٩]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d.charCodeAt(0) - 0x660]);
  cues = cues.map((c) => ({ ...c, t: norm(c.t), ...(c.words ? { words: c.words.map((w) => ({ ...w, t: norm(w.t) })) } : {}) }));
  const lint = path.join(path.dirname(new URL(import.meta.url).pathname), "../vendor/persian-motion-director/scripts/lint_persian.py");
  if (fs.existsSync(lint)) {
    const f = path.join(os.tmpdir(), `cues-${process.pid}.txt`); fs.writeFileSync(f, cues.map((c) => c.t).join("\n"));
    try { execFileSync("python3", ["-I", lint, "copy", f], { stdio: "pipe" }); console.log("persian lint: clean"); }
    catch (e) { console.warn(`persian lint (fix in ${path.basename(side)} and run again if needed):\n${String(e.stdout || e.message).trim().split("\n").slice(0, 12).join("\n")}`); }
    fs.rmSync(f, { force: true });
  }
}
if (style === "word" && !cues.every((c) => c.words?.length)) { console.error("--style word needs word timings: give a words.json or WhisperX JSON, not an .srt"); process.exit(2); }
if (!cues.length) { console.error("no captions found in the input"); process.exit(2); }

// ---------- optional proofreading (same cue count, the speaker's wording kept) ----------
async function proofread(cs) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { console.warn("--proof: GEMINI_API_KEY is not set; captions kept as they are"); return cs; }
  if (cs.some((c) => c.words)) { console.warn("--proof: skipped for word-timed captions (fix words in the .cues.json instead)"); return cs; }
  const texts = cs.map((c) => c.t);
  const prompt = `These are consecutive caption chunks (language: ${lang}) of one spoken short video, from automatic transcription. ` +
    `Fix spelling and obvious mishearings (brand and product names especially). ${lang === "fa" ? "Add the Persian half-space (U+200C) where standard (می‌، ‌ها، ‌ام). " : ""}` +
    `Keep the spoken, informal style exactly; do not formalise or rewrite. Never merge or split chunks; keep each word in its chunk. ` +
    `Return ONLY a JSON array of ${texts.length} strings, same order.\n\n${JSON.stringify(texts)}`;
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }),
    });
    const fixed = JSON.parse((await r.json()).candidates[0].content.parts[0].text);
    if (fixed.length !== cs.length) { console.warn(`--proof returned ${fixed.length} of ${cs.length} chunks; originals kept`); return cs; }
    return cs.map((c, i) => ({ ...c, t: String(fixed[i]).trim() || c.t }));
  } catch (e) { console.warn("--proof failed, originals kept:", e.message); return cs; }
}

// ---------- render one transparent PNG per caption state ----------
const k = W / 1080, T = typeFor(brand, lang), C = brand.colors;
const box = {
  pill: `color:#fff;background:rgba(0,0,0,.6);padding:${10 * k}px ${30 * k}px ${14 * k}px;border-radius:${22 * k}px`,
  outline: `color:#fff;-webkit-text-stroke:${7 * k}px rgba(0,0,0,.85);paint-order:stroke fill;text-shadow:0 ${4 * k}px ${18 * k}px rgba(0,0,0,.45)`,
  brand: `color:${C.surface};background:${C.accent};padding:${10 * k}px ${30 * k}px ${14 * k}px;border-radius:${22 * k}px`,
  word: `color:#fff;-webkit-text-stroke:${7 * k}px rgba(0,0,0,.85);paint-order:stroke fill;text-shadow:0 ${4 * k}px ${18 * k}px rgba(0,0,0,.45)`,
}[style];
if (!box) { console.error(`unknown --style ${style}`); process.exit(2); }
const css = `html,body{background:transparent!important}
#c{position:absolute;left:0;right:0;bottom:${H - BOTTOM * (H / 1920)}px;display:flex;justify-content:center}
#t{font:700 ${SIZE * k}px/1.42 var(--body);text-align:center;max-width:${900 * k}px;unicode-bidi:plaintext;text-wrap:balance;${box}}
#t b{font-weight:inherit;color:${C.accent2 || C.accent};-webkit-text-stroke:inherit}`;
// split long text into two balanced lines ourselves, so every renderer breaks the same way
const lines = (t) => {
  if (t.length <= CHARS) return esc(t);
  const w = t.split(" "); let best = 1, diff = 1e9;
  for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length); if (d < diff) { diff = d; best = i; } }
  return `${esc(w.slice(0, best).join(" "))}<br>${esc(w.slice(best).join(" "))}`;
};
const states = []; // { html, s, e }
for (const c of cues) {
  if (style !== "word") { states.push({ s: c.s, e: c.e, html: lines(c.t) }); continue; }
  c.words.forEach((w, i) => {
    const e = i + 1 < c.words.length ? c.words[i + 1].s : c.e;
    const marked = c.words.map((x, j) => (j === i ? `\u0000${x.t}\u0001` : x.t)).join(" ");
    states.push({ s: i ? w.s : c.s, e, html: lines(marked).replace("\u0000", "<b>").replace("\u0001", "</b>") });
  });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "captions-"));
const { chromium } = await import("playwright");
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome", headless: true }).catch(() => chromium.launch({ headless: true }));
try {
  const pg = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
  fs.writeFileSync(path.join(tmp, "p.html"), page({ brand, lang, w: W, h: H, css, body: `<div id="c"><div id="t"></div></div>` }));
  await pg.goto(pathToFileURL(path.join(tmp, "p.html")).href);
  await pg.evaluate(async (names) => { await document.fonts.ready; for (const n of names) await document.fonts.load(`700 40px '${n}'`, "aبکA").catch(() => {}); }, T.check);
  const missing = await pg.evaluate((names) => names.filter((n) => !document.fonts.check(`700 40px '${n}'`, "aA")), T.check);
  if (missing.length) throw new Error(`font(s) not loaded: ${missing.join(", ")}`);
  const allText = states.map((st) => st.html.replace(/<[^>]+>/g, "")).join(" ");
  await pg.evaluate(async (t) => { await document.fonts.load("40px 'Noto Color Emoji'", t).catch(() => {}); await document.fonts.ready; }, allText);
  await pg.evaluate(() => { document.getElementById("t").style.visibility = "hidden"; });
  await pg.screenshot({ path: path.join(tmp, "blank.png"), omitBackground: true });
  await pg.evaluate(() => { document.getElementById("t").style.visibility = "visible"; });
  for (const [i, st] of states.entries()) {
    await pg.evaluate((h) => { document.getElementById("t").innerHTML = h; }, st.html);
    await pg.screenshot({ path: path.join(tmp, `c${i}.png`), omitBackground: true });
  }
} finally { await browser.close(); }

// ---------- one overlay stream: the caption PNGs and blank gaps, with their durations ----------
const list = []; let t = 0;
const add = (f, d) => { if (d > 0.001) { list.push(`file '${f}'`, `duration ${d.toFixed(3)}`); t += d; } };
states.forEach((st, i) => { add(path.join(tmp, "blank.png"), st.s - t); add(path.join(tmp, `c${i}.png`), Math.min(st.e, states[i + 1]?.s ?? st.e) - Math.max(st.s, t)); });
add(path.join(tmp, "blank.png"), dur - t + 0.5);
list.push(`file '${path.join(tmp, "blank.png")}'`); // the concat demuxer drops the last duration without this
fs.writeFileSync(path.join(tmp, "list.txt"), list.join("\n"));
const hasAudio = execFileSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", video]).toString().trim() !== "";
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"),
  "-filter_complex", "[1:v]format=rgba,setpts=PTS-STARTPTS[c];[0:v][c]overlay=0:0:eof_action=pass:shortest=0[v]",
  "-map", "[v]", ...(hasAudio ? ["-map", "0:a", "-c:a", "copy"] : []), "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", "-t", String(dur), out], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out}: ${cues.length} captions, ${states.length} frames, style ${style}, ${lang}${rtl ? " (rtl)" : ""}`);
