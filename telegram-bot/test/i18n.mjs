// Translation check (no server): every string the code uses exists in every locale (or is the same word on purpose),
// with the same {0} placeholders and HTML tags. Run: node test/i18n.mjs
import fs from "node:fs";
const src = ["index.js", "reports.js", "formats.js"].map((f) => fs.readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8")).join("\n");
const keys = [...new Set([...src.matchAll(/\b_f?\(("(?:[^"\\\n]|\\.)*")/g)].map((m) => JSON.parse(m[1])))];
let pass = 0, fail = 0;
const ok = (c, name, extra = "") => { c ? pass++ : fail++; if (!c) console.log(`❌ ${name}${extra ? "  → " + extra : ""}`); };
const ph = (s) => (s.match(/\{\d+\}/g) || []).sort().join(","), tags = (s) => (s.match(/<\/?[a-z]+[^>]*>/g) || []).sort().join(",");
for (const lang of ["fa", "ar", "tr", "de", "fr", "it"]) {
  const d = (await import(`../src/locales/${lang}.js`)).default;
  const missing = keys.filter((k) => !(k in d));
  ok(missing.length === 0, `${lang}: every string translated`, missing.slice(0, 5).join(" | "));
  const badPh = Object.entries(d).filter(([k, v]) => ph(k) !== ph(v)).map(([k]) => k);
  ok(badPh.length === 0, `${lang}: placeholders match`, badPh.slice(0, 3).join(" | "));
  const badTags = Object.entries(d).filter(([k, v]) => tags(k) !== tags(v)).map(([k]) => k);
  ok(badTags.length === 0, `${lang}: HTML tags match`, badTags.slice(0, 3).join(" | "));
  const stale = Object.keys(d).filter((k) => !keys.includes(k));
  ok(stale.length === 0, `${lang}: no stale keys`, stale.slice(0, 3).join(" | "));
}
console.log(`${keys.length} strings × 6 languages\n${pass} passed, ${fail} failed`);
