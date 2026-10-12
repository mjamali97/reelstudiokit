#!/usr/bin/env node
// client.mjs · agency mode: one folder per client, one active client at a time. The root profile/, brand/ and reels/ are
// links into clients/<active>/, so every skill, renderer and tool works unchanged for whichever client is active.
//
//   node tools/client.mjs list                         # every client, the active one marked
//   node tools/client.mjs init <slug>                  # first time: move today's profile/ brand/ reels/ into clients/<slug>/
//   node tools/client.mjs new <slug> ["Client name"]   # a new client from templates/client/
//   node tools/client.mjs use <slug>                   # make <slug> the active client
//   node tools/client.mjs sync <slug> --id <n>         # send the client's voice, facts and handle to the agency bot
//                                                      # (<n> = the client's number in the bot: 👥 Clients, or GET /api/clients)
// Windows without symlink rights: run the terminal as administrator once, or enable Developer Mode.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["profile", "brand", "reels"], C = path.join(ROOT, "clients");
const [cmd, slug, ...rest] = process.argv.slice(2);
const p = (...a) => path.join(ROOT, ...a);
const isLink = (d) => { try { return fs.lstatSync(p(d)).isSymbolicLink(); } catch { return false; } };
const active = () => (isLink("profile") ? path.basename(path.dirname(fs.readlinkSync(p("profile")))) : null);
const check = (s) => { if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(s || "")) { console.error("slug: lowercase letters, digits and dashes, e.g. sweet-corner"); process.exit(2); } };
const link = (s) => {
  for (const d of DIRS) {
    if (fs.existsSync(p(d)) && !isLink(d)) { console.error(`${d}/ is a real folder; run \`node tools/client.mjs init <slug>\` first so it is not lost`); process.exit(1); }
    if (isLink(d)) fs.unlinkSync(p(d));
    fs.symlinkSync(path.join("clients", s, d), p(d), "dir");
  }
};
const copyDir = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const f of fs.readdirSync(a, { withFileTypes: true })) f.isDirectory() ? copyDir(path.join(a, f.name), path.join(b, f.name)) : fs.copyFileSync(path.join(a, f.name), path.join(b, f.name)); };

if (cmd === "list" || !cmd) {
  const list = fs.existsSync(C) ? fs.readdirSync(C).filter((d) => fs.existsSync(path.join(C, d, "profile"))) : [];
  if (!list.length) console.log("no clients yet: `node tools/client.mjs init <slug>` turns the current brand into the first client");
  for (const d of list) {
    let name = d; try { name = JSON.parse(fs.readFileSync(path.join(C, d, "brand/brand.json"), "utf8")).name; } catch {}
    const st = (fs.readFileSync(path.join(C, d, "profile/CREATOR.md"), "utf8").match(/STATUS:\s*([^\n<]+)/) || [])[1]?.trim();
    console.log(`${d === active() ? "▶" : " "} ${d.padEnd(24)} ${name.padEnd(28)} ${st || ""}`);
  }
} else if (cmd === "init") {
  check(slug);
  if (active()) { console.log(`already in agency mode (active: ${active()})`); process.exit(0); }
  const dst = path.join(C, slug);
  if (fs.existsSync(dst)) { console.error(`clients/${slug} exists`); process.exit(1); }
  fs.mkdirSync(dst, { recursive: true });
  for (const d of DIRS) fs.existsSync(p(d)) ? fs.renameSync(p(d), path.join(dst, d)) : fs.mkdirSync(path.join(dst, d));
  link(slug);
  console.log(`clients/${slug} holds the current brand and is active. Add clients with \`new\`.`);
} else if (cmd === "new") {
  check(slug);
  const dst = path.join(C, slug);
  if (fs.existsSync(dst)) { console.error(`clients/${slug} exists`); process.exit(1); }
  if (!active() && DIRS.some((d) => fs.existsSync(p(d)))) { console.error("first run `node tools/client.mjs init <slug-of-the-current-brand>` so today's profile/ and brand/ are kept"); process.exit(1); }
  copyDir(p("templates/client"), dst); fs.mkdirSync(path.join(dst, "reels"), { recursive: true });
  const name = rest.join(" ").trim();
  if (name) { const f = path.join(dst, "brand/brand.json"), b = JSON.parse(fs.readFileSync(f, "utf8")); Object.assign(b, { name, nameLocal: name, mast: name.toUpperCase() }); fs.writeFileSync(f, JSON.stringify(b, null, 2)); }
  console.log(`clients/${slug} created. Make it active with \`node tools/client.mjs use ${slug}\`, then run /setup for it.`);
} else if (cmd === "use") {
  check(slug);
  if (!fs.existsSync(path.join(C, slug, "profile"))) { console.error(`no client ${slug} (see \`list\`)`); process.exit(1); }
  link(slug);
  console.log(`active client: ${slug}. Run \`node tools/brand/apply.mjs\` only for a single-brand bot; the agency bot keeps every client's voice itself (sync).`);
} else if (cmd === "sync") {
  check(slug);
  const id = rest[rest.indexOf("--id") + 1];
  if (!id || rest.indexOf("--id") < 0) { console.error("sync needs --id <n> (the client's number in the bot)"); process.exit(2); }
  const env = Object.fromEntries((fs.existsSync(p(".env")) ? fs.readFileSync(p(".env"), "utf8") : "").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.split("=")[0], l.slice(l.indexOf("=") + 1).trim()]));
  if (!env.BOT_URL || !env.INGEST_KEY) { console.error("BOT_URL and INGEST_KEY must be in .env"); process.exit(1); }
  const dir = path.join(C, slug), rd = (f) => fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : "";
  const section = (md, h) => (md.match(new RegExp(`## ${h}[^\\n]*\\n+([\\s\\S]*?)(\\n## |$)`)) || [])[1]?.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>\n]*…[^>\n]*>/g, "").trim() || "";
  const voice = section(rd("profile/VOICE.md"), "For the bot").replace(/\s+/g, " ");
  // only filled lines: no template placeholders, no table header or empty "label:" lines
  const facts = section(rd("profile/CREATOR.md"), "Offer").split("\n").map((l) => l.replace(/<[^>\n]*>/g, "").replace(/^-\s*/, "").replace(/\s*·\s*$/, "").trim())
    .filter((l) => l && !/^\|[-\s|]+\|$/.test(l) && !/product or service/.test(l) && !/^\|[\s|]*\|$/.test(l) && !/:\s*$/.test(l) && !/:\s*·/.test(l))
    .map((l) => l.replace(/^\|\s*|\s*\|$/g, "").replace(/\s*\|\s*/g, ", ")).join("; ").replace(/\s+/g, " ").slice(0, 1500);
  let handle = ""; try { handle = JSON.parse(rd("brand/brand.json")).handle || ""; } catch {}
  const r = await fetch(env.BOT_URL.replace(/\/$/, "") + "/api/clients", { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.INGEST_KEY }, body: JSON.stringify({ id: +id, voice, facts, handle }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { console.error("bot:", r.status, j.error || ""); process.exit(1); }
  console.log(`synced ${slug} → bot client #${id} (${j.name}): voice ${voice.length} chars, facts ${facts.length} chars, handle ${handle || "-"}`);
} else { console.error("commands: list · init <slug> · new <slug> [name] · use <slug> · sync <slug> --id <n>"); process.exit(2); }
