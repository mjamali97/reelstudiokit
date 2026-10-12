#!/usr/bin/env node
// fetch.mjs · photos, videos, music and sound effects that a business may use, with the licence of every file recorded.
//
//   node tools/assets/fetch.mjs <source> "<query>" [--type image|video|audio|music|sfx] [--n 6] [--out reels/<slug>/stock] [--allow-by] [--portrait]
//
//   source      key needed (in .env)        what                         licence
//   openverse   none                        images, audio (music, sfx)   CC0 / public domain (CC BY with --allow-by)
//   commons     none                        images (Wikimedia Commons)   CC0 / public domain (CC BY with --allow-by)
//   pexels      PEXELS_API_KEY (free)       photos, videos               Pexels License (new keys were paused on 2026-10-12)
//   pixabay     PIXABAY_API_KEY (free)      photos, videos               Pixabay Content License (tested 2026-10-12)
//   unsplash    UNSPLASH_ACCESS_KEY (free)  photos                       Unsplash License
//
// Writes the files, credits.json and CREDITS.md (creator, source page, licence, what the licence asks) into --out.
// Never share-alike (BY-SA) or non-commercial (NC) material. Stock sites forbid re-selling the files or collecting them into
// a rival library, so files stay in the reel's folder (videos and big files are git-ignored), never in the kit.
// Recognisable people, logos and private property in stock media may need their own permission for ads: check before an ad.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [source, query] = args.filter((a, i) => !a.startsWith("--") && !(i && ["--type", "--n", "--out"].includes(args[i - 1])));
if (!source || !query) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 19).map((l) => l.replace(/^\/\/ ?/, "")).join("\n")); process.exit(2); }
const type = opt("--type", "image"), N = +opt("--n", 6), allowBy = args.includes("--allow-by"), portrait = args.includes("--portrait");
const out = path.resolve(opt("--out", path.join(ROOT, "reels/_stock", `${source}-${query.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 40)}`)));
const env = { ...Object.fromEntries((fs.existsSync(path.join(ROOT, ".env")) ? fs.readFileSync(path.join(ROOT, ".env"), "utf8") : "").split("\n").filter((l) => /^[A-Z_]+=./.test(l)).map((l) => [l.split("=")[0], l.slice(l.indexOf("=") + 1).trim()])), ...process.env };
const need = (k) => { if (!env[k]) { console.error(`${k} is not set: get a free key (see the table above) and add ${k}=… to .env yourself`); process.exit(1); } return env[k]; };
const UA = "ReelStudio/2 (+https://github.com/mjamali97/reelstudiokit)";
const get = async (url, headers = {}) => { const r = await fetch(url, { headers: { "User-Agent": UA, ...headers } }); if (!r.ok) throw new Error(`${new URL(url).host} ${r.status}: ${(await r.text()).slice(0, 200)}`); return r.json(); };
const SAFE = (l) => /^(cc0|pdm|public ?domain|pd)/i.test(l) || (allowBy && /^(cc[- ]?)?by( |-)?\d?(\.\d)?$/i.test(l.replace(/^cc /i, "cc-")));

// each source returns items: { url, ext, creator, page, licence, licenceUrl, ask, title }
const SOURCES = {
  async openverse() {
    const kind = type === "image" ? "images" : "audio";
    if (type === "video") throw new Error("Openverse has images and audio; use pexels or pixabay for video");
    const lic = allowBy ? "cc0,pdm,by" : "cc0,pdm";
    const j = await get(`https://api.openverse.org/v1/${kind}/?q=${encodeURIComponent(query)}&license=${lic}&license_type=commercial,modification&page_size=${Math.min(N * 2, 20)}${type === "music" ? "&category=music" : type === "sfx" ? "&category=sound_effect" : ""}`);
    return (j.results || []).filter((r) => SAFE(r.license === "by" ? "by" : r.license)).map((r) => ({ url: r.url, ext: (r.filetype || (kind === "images" ? "jpg" : "mp3")).replace("jpeg", "jpg"),
      creator: r.creator || "unknown", page: r.foreign_landing_url, licence: `${r.license.toUpperCase()} ${r.license_version || ""}`.trim(), licenceUrl: r.license_url,
      ask: r.license === "by" ? `credit: ${r.attribution}` : "nothing (public domain); a credit is still kind", title: r.title }));
  },
  async commons() {
    if (type !== "image") throw new Error("commons: images only here");
    const j = await get(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=${Math.min(N * 4, 40)}&gsrsearch=${encodeURIComponent(query + " filetype:bitmap")}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=2160`);
    return Object.values(j.query?.pages || {}).map((p) => { const ii = p.imageinfo?.[0] || {}, m = ii.extmetadata || {}, lic = m.LicenseShortName?.value || "";
      return { lic, url: ii.thumburl || ii.url, ext: (ii.mime || "image/jpeg").split("/")[1].replace("jpeg", "jpg"), creator: (m.Artist?.value || "unknown").replace(/<[^>]+>/g, "").trim(),
        page: ii.descriptionurl, licence: lic, licenceUrl: m.LicenseUrl?.value || "", ask: /^(cc0|public domain|pd)/i.test(lic) ? "nothing (public domain); a credit is still kind" : `credit: ${(m.Artist?.value || "").replace(/<[^>]+>/g, "").trim()} / Wikimedia Commons / ${lic}`, title: p.title };
    }).filter((x) => SAFE(x.lic) && !/sa|nc|nd/i.test(x.lic.replace(/^cc0/i, "")));
  },
  async pexels() {
    const key = need("PEXELS_API_KEY"), h = { Authorization: key };
    if (type === "video") {
      const j = await get(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${N}${portrait ? "&orientation=portrait" : ""}`, h);
      return (j.videos || []).map((v) => { const f = v.video_files.filter((x) => x.file_type === "video/mp4").sort((a, b) => Math.abs((a.height || 0) - 1920) - Math.abs((b.height || 0) - 1920))[0];
        return { url: f?.link, ext: "mp4", creator: v.user?.name, page: v.url, licence: "Pexels License", licenceUrl: "https://www.pexels.com/license/", ask: "nothing required; a credit is appreciated; do not resell unaltered", title: `pexels-${v.id}` }; });
    }
    const j = await get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${N}${portrait ? "&orientation=portrait" : ""}`, h);
    return (j.photos || []).map((p) => ({ url: p.src.large2x, ext: "jpg", creator: p.photographer, page: p.url, licence: "Pexels License", licenceUrl: "https://www.pexels.com/license/", ask: "nothing required; a credit is appreciated; do not resell unaltered", title: p.alt || `pexels-${p.id}` }));
  },
  async pixabay() {
    const key = need("PIXABAY_API_KEY");
    if (type === "video") {
      const j = await get(`https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query)}&per_page=${Math.max(N, 3)}&safesearch=true`);
      return (j.hits || []).map((v) => ({ url: (v.videos.large?.url || v.videos.medium?.url), ext: "mp4", creator: v.user, page: v.pageURL, licence: "Pixabay Content License", licenceUrl: "https://pixabay.com/service/license-summary/", ask: "nothing required; do not sell unaltered or as stock", title: `pixabay-${v.id}` }));
    }
    const j = await get(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&per_page=${Math.max(N, 3)}&safesearch=true&image_type=photo${portrait ? "&orientation=vertical" : ""}`);
    return (j.hits || []).map((p) => ({ url: p.largeImageURL, ext: "jpg", creator: p.user, page: p.pageURL, licence: "Pixabay Content License", licenceUrl: "https://pixabay.com/service/license-summary/", ask: "nothing required; do not sell unaltered or as stock", title: p.tags }));
  },
  async unsplash() {
    const key = need("UNSPLASH_ACCESS_KEY"), h = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
    const j = await get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${N}${portrait ? "&orientation=portrait" : ""}`, h);
    const items = [];
    for (const p of j.results || []) {
      await get(p.links.download_location, h).catch(() => {});   // the API guidelines require registering every download
      items.push({ url: p.urls.full + "&w=2160&fm=jpg&q=85", ext: "jpg", creator: p.user?.name, page: p.links.html + "?utm_source=reel_studio&utm_medium=referral", licence: "Unsplash License", licenceUrl: "https://unsplash.com/license", ask: `credit "Photo by ${p.user?.name} on Unsplash" where possible; do not sell unaltered or build a rival library`, title: p.alt_description || p.id });
    }
    return items;
  },
};
if (!SOURCES[source]) { console.error(`unknown source "${source}": ${Object.keys(SOURCES).join(", ")}`); process.exit(2); }

const items = (await SOURCES[source]()).filter((x) => x.url).slice(0, N);
if (!items.length) { console.log(`nothing found for "${query}" with a safe licence on ${source}${allowBy ? "" : " (try --allow-by for CC BY, which needs a credit line)"}`); process.exit(0); }
fs.mkdirSync(out, { recursive: true });
const credits = [];
for (const [i, it] of items.entries()) {
  const file = `${source}-${String(i + 1).padStart(2, "0")}.${it.ext}`;
  const r = await fetch(it.url, { headers: { "User-Agent": UA } });
  if (!r.ok) { console.warn(`skip ${it.page}: ${r.status}`); continue; }
  fs.writeFileSync(path.join(out, file), Buffer.from(await r.arrayBuffer()));
  credits.push({ file, ...it, fetched: new Date().toISOString().slice(0, 10), query });
  console.log(`${file}  ${it.licence}  ${it.creator}  ${it.page}`);
}
const prev = fs.existsSync(path.join(out, "credits.json")) ? JSON.parse(fs.readFileSync(path.join(out, "credits.json"), "utf8")) : [];
const all = [...prev.filter((p) => !credits.some((c) => c.file === p.file)), ...credits];
fs.writeFileSync(path.join(out, "credits.json"), JSON.stringify(all, null, 1));
fs.writeFileSync(path.join(out, "CREDITS.md"), `# Credits\n\n| file | creator | licence | what it asks | source |\n|---|---|---|---|---|\n${all.map((c) => `| ${c.file} | ${String(c.creator).replace(/\|/g, "/")} | [${c.licence}](${c.licenceUrl}) | ${c.ask} | ${c.page} |`).join("\n")}\n`);
console.log(`${credits.length} files → ${out} (CREDITS.md lists who and which licence)`);
