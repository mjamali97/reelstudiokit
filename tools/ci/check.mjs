#!/usr/bin/env node
// check.mjs · static checks that keep the kit consistent (CI runs it on every push; contributors run it before a PR).
//   node tools/ci/check.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const ex = (p) => fs.existsSync(path.join(ROOT, p));
let fail = 0, pass = 0;
const ok = (c, msg) => { c ? pass++ : fail++; if (!c) console.log("❌", msg); };

// 1 · skills: frontmatter name = folder, a description that says when to use it
const skills = fs.readdirSync(path.join(ROOT, ".claude/skills")).filter((d) => ex(`.claude/skills/${d}/SKILL.md`));
for (const d of skills) {
  const s = rd(`.claude/skills/${d}/SKILL.md`), fm = s.match(/^---\n([\s\S]*?)\n---/);
  ok(fm && new RegExp(`^name: ${d}$`, "m").test(fm[1]), `skill ${d}: frontmatter name must be "${d}"`);
  ok(fm && /^description: .{40,}/m.test(fm[1]) && /Use when/i.test(fm[1]), `skill ${d}: description must say what it does and "Use when …"`);
}

// 2 · video styles: every styles/*.js is registered in index.html (option + script) and has a skill
const html = rd("tools/style-reel/index.html");
for (const f of fs.readdirSync(path.join(ROOT, "tools/style-reel/styles")).filter((f) => f.endsWith(".js"))) {
  const s = f.replace(/\.js$/, "");
  ok(html.includes(`"value":"${s}"`), `style ${s}: missing from the style enum in index.html`);
  ok(html.includes(`styles/${s}.js`), `style ${s}: script tag missing in index.html`);
  ok(skills.includes(s), `style ${s}: no /${s} skill`);
  ok(rd(`tools/style-reel/styles/${f}`).includes(`window.STYLES.${s} =`), `style ${s}: must register window.STYLES.${s}`);
}

// 3 · fonts: every library font has its css, its files and its licence
const fonts = JSON.parse(rd("fonts/fonts.json"));
for (const f of fonts) {
  ok(ex(f.css), `font ${f.id}: ${f.css} missing`);
  ok(ex(path.join(path.dirname(f.css), "OFL.txt")), `font ${f.id}: OFL.txt missing`);
  ok(/^OFL/.test(f.license), `font ${f.id}: licence must be OFL (got ${f.license})`);
  if (ex(f.css)) for (const u of rd(f.css).matchAll(/url\("([^"]+)"\)/g)) ok(ex(path.join(path.dirname(f.css), u[1])), `font ${f.id}: ${u[1]} missing`);
}

// 3b · a font count written in the docs is the real one (fonts/fonts.json); the safest is to write none
const digits = (x) => Number(x.replace(/[۰-۹]/g, (c) => c.charCodeAt(0) - 0x6f0).replace(/[٠-٩]/g, (c) => c.charCodeAt(0) - 0x660));
const docs = ["README.md", "CLAUDE.md", "tools/STACK.md", ...fs.readdirSync(path.join(ROOT, "docs/guide")).map((f) => `docs/guide/${f}`),
  ...skills.map((d) => `.claude/skills/${d}/SKILL.md`)];
for (const p of docs) for (const m of rd(p).matchAll(/(?<![\d۰-۹٠-٩.])([\d۰-۹٠-٩]+)\s+(?:open-licence\s+|Open-Licence-)?(?:fonts?\b|font famil|families|polices?\b|Schrift|فونت)/gi))
  ok(digits(m[1]) === fonts.length, `${p}: says "${m[0]}" but fonts/fonts.json has ${fonts.length} fonts`);

// 4 · brand files point at real fonts
for (const p of ["brand/brand.json", "templates/client/brand/brand.json"]) {
  const b = JSON.parse(rd(p));
  for (const [role, id] of Object.entries(b.fonts || {})) if (typeof id === "string") ok(fonts.some((f) => f.id === id), `${p}: fonts.${role} "${id}" is not in fonts/fonts.json`);
}

// 5 · example specs parse and use known templates
const C = rd("tools/render/carousels.mjs"), S = rd("tools/render/stories.mjs");
const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk("examples").filter((f) => f.endsWith(".json"))) {
  let j; try { j = JSON.parse(rd(f)); } catch { ok(false, `${f}: invalid JSON`); continue; }
  if (j.type === "carousel") ok(new RegExp(`^  "?${j.template}"?: \\{`, "m").test(C), `${f}: unknown carousel template ${j.template}`);
  if (j.type === "story") for (const fr of j.frames) ok(new RegExp(`^  "?${fr.template}"?: \\{`, "m").test(S), `${f}: unknown story template ${fr.template}`);
}

// 6 · the guide exists in every language and links the others
const LANGS = ["en", "fa", "ar", "tr", "de", "fr", "it"];
for (const l of LANGS) {
  ok(ex(`docs/guide/${l}.md`), `docs/guide/${l}.md missing`);
  if (ex(`docs/guide/${l}.md`)) { const g = rd(`docs/guide/${l}.md`); for (const o of LANGS) if (o !== l) ok(g.includes(`(${o}.md)`), `docs/guide/${l}.md does not link ${o}.md`); }
}
for (const l of LANGS) ok(rd("README.md").includes(`docs/guide/${l}.md`), `README.md does not link the ${l} guide`);

// 7 · bot locales: same keys as the source strings (the bot's own test checks values)
const loc = (l) => Object.keys((rd(`telegram-bot/src/locales/${l}.js`).match(/"((?:[^"\\]|\\.)*)"\s*:/g) || []).reduce((o, k) => ({ ...o, [k]: 1 }), {})).length;
const counts = LANGS.filter((l) => l !== "en").map((l) => [l, loc(l)]);
ok(new Set(counts.map(([, n]) => n)).size === 1, `bot locales have different key counts: ${counts.map(([l, n]) => `${l} ${n}`).join(", ")}`);

// 8 · no personal data in the public kit (the maintainer's own brand, ids, addresses)
const BANNED = [/bizbymo/i, /mojamali\.com/i, /76mohammad97/i, /business in minutes/i, /\bLahzeh\b/, /mjamali97\/(?!reelstudiokit)/i];
const SKIP = /(^|\/)(node_modules|\.git|\.wrangler|tools\/vendor|tools\/\.venv)(\/|$)|\.(png|jpe?g|woff2?|ttf|mp4|wav|onnx|ico)$|^tools\/ci\/check\.mjs$/;
const files = (() => { const out = []; const go = (d) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
  const p = d ? `${d}/${e.name}` : e.name; if (SKIP.test(p) || e.isSymbolicLink()) continue; e.isDirectory() ? go(p) : out.push(p); } }; go(""); return out; })();
for (const f of files) { const t = rd(f); for (const re of BANNED) if (re.test(t)) ok(false, `${f}: contains ${re} (personal data must not ship in the kit)`); }

// 8b · licence: BSL 1.1 with the parameters filled, the version and Change Date current
const L = rd("LICENSE");
ok(/Business Source License 1\.1/.test(L) && /^Additional Use Grant:/m.test(L) && /^Change License:\s+Apache License, Version 2\.0/m.test(L), "LICENSE must be the BSL 1.1 with an Additional Use Grant and Apache-2.0 as Change License");
const cd = (L.match(/^Change Date:\s+(\d{4}-\d{2}-\d{2})/m) || [])[1];
ok(cd && new Date(cd) > new Date(), `LICENSE Change Date must be in the future (got ${cd})`);
for (const p of [".claude-plugin/marketplace.json", "plugins/reel-studio/.claude-plugin/plugin.json"]) ok(!/"license":\s*"MIT"/.test(rd(p)), `${p}: licence must be BUSL-1.1`);

// 9 · versions agree
const v = rd("VERSION").trim();
ok(/^\d+\.\d+\.\d+$/.test(v), "VERSION must be x.y.z");
ok(new RegExp(`^## ${v.replace(/\./g, "\\.")}\\b`, "m").test(rd("CHANGELOG.md")), `CHANGELOG.md has no "## ${v}" entry`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
