#!/usr/bin/env node
// test-fetch.mjs · offline check of tools/assets/fetch.mjs for the keyed sources (Pexels photos + videos, Unsplash): a local
// server answers in the response shapes of the official API docs, and checks the auth headers fetch.mjs sends.
//   node tools/assets/test-fetch.mjs
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${m}`); };
const seen = [];
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46]), MP4 = Buffer.from("....ftypisom-test-video");
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x"), base = `http://127.0.0.1:${server.address().port}`, auth = req.headers.authorization || "";
  seen.push({ path: u.pathname, auth, version: req.headers["accept-version"], q: u.search });
  const json = (o, code = 200) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (u.pathname.startsWith("/img/")) { res.writeHead(200, { "content-type": "image/jpeg" }); return res.end(JPG); }
  if (u.pathname.startsWith("/vid/")) { res.writeHead(200, { "content-type": "video/mp4" }); return res.end(MP4); }
  if (u.pathname === "/v1/search") {   // Pexels photos (api.pexels.com/v1/search)
    if (auth !== "pexels-test-key") return json({ status: 401, code: "Unauthorized" }, 401);
    return json({ page: 1, per_page: 2, photos: [1, 2].map((i) => ({ id: 100 + i, width: 3000, height: 4500, url: `https://www.pexels.com/photo/cake-${100 + i}/`, photographer: `Photographer ${i}`,
      photographer_url: "https://www.pexels.com/@p", alt: `A cake ${i}`, src: { original: `${base}/img/o${i}.jpg`, large2x: `${base}/img/p${i}.jpg`, large: `${base}/img/l${i}.jpg` } })) });
  }
  if (u.pathname === "/videos/search") {   // Pexels videos (api.pexels.com/videos/search)
    if (auth !== "pexels-test-key") return json({ status: 401 }, 401);
    return json({ page: 1, videos: [{ id: 555, url: "https://www.pexels.com/video/bakery-555/", user: { id: 9, name: "Video Maker" }, duration: 12,
      video_files: [{ id: 1, quality: "sd", file_type: "video/mp4", width: 540, height: 960, link: `${base}/vid/sd.mp4` },
        { id: 2, quality: "hd", file_type: "video/mp4", width: 1080, height: 1920, link: `${base}/vid/hd.mp4` },
        { id: 3, quality: "uhd", file_type: "video/mp4", width: 2160, height: 3840, link: `${base}/vid/uhd.mp4` }] }] });
  }
  if (u.pathname === "/search/photos") {   // Unsplash (api.unsplash.com/search/photos)
    if (auth !== "Client-ID unsplash-test-key") return json({ errors: ["OAuth error: The access token is invalid"] }, 401);
    return json({ total: 2, results: [
      { id: "u1", alt_description: "a cake", urls: { raw: `${base}/img/u1.jpg?ixid=abc`, full: `${base}/img/u1.jpg?ixid=abc` }, user: { name: "Una Snap" },
        links: { html: "https://unsplash.com/photos/u1", download: "https://unsplash.com/photos/u1/download", download_location: `${base}/photos/u1/download?ixid=abc` } },
      { id: "u2", alt_description: "bread", urls: { full: `${base}/img/u2.jpg?ixid=def` }, user: { name: "Ben Bake" }, links: { html: "https://unsplash.com/photos/u2", download: "https://unsplash.com/photos/u2/download" } }] });
  }
  if (/^\/photos\/u\d\/download$/.test(u.pathname)) return json({ url: `${base}/img/x.jpg` });
  json({ error: "not found" }, 404);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`, tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fetch-test-"));
const run = (args, extra = {}) => new Promise((resolve) => {
  import("node:child_process").then(({ execFile }) => execFile("node", [path.join(HERE, "fetch.mjs"), ...args], { env: { ...process.env, PEXELS_API_BASE: base, UNSPLASH_API_BASE: base, ...extra } }, (e, out, err) => resolve({ code: e ? e.code : 0, out: out + err })));
});
try {
  let r = await run(["pexels", "birthday cake", "--n", "2", "--portrait", "--out", path.join(tmp, "p")], { PEXELS_API_KEY: "pexels-test-key" });
  const pc = JSON.parse(fs.readFileSync(path.join(tmp, "p/credits.json"), "utf8"));
  ok(r.code === 0 && pc.length === 2 && fs.existsSync(path.join(tmp, "p/pexels-01.jpg")), "pexels photos: 2 files downloaded");
  ok(pc[0].creator === "Photographer 1" && pc[0].licence === "Pexels License" && pc[0].page.includes("pexels.com/photo"), "pexels photos: creator, licence and page recorded");
  ok(seen.some((s) => s.path === "/v1/search" && s.auth === "pexels-test-key" && /orientation=portrait/.test(s.q)), "pexels photos: key in Authorization, portrait filter sent");
  r = await run(["pexels", "bakery", "--type", "video", "--n", "1", "--portrait", "--out", path.join(tmp, "v")], { PEXELS_API_KEY: "pexels-test-key" });
  ok(r.code === 0 && fs.readFileSync(path.join(tmp, "v/pexels-01.mp4")).equals(MP4) && seen.some((s) => s.path === "/vid/hd.mp4"), "pexels video: the 1080×1920 file is chosen and downloaded");
  r = await run(["unsplash", "cake", "--n", "2", "--out", path.join(tmp, "u")], { UNSPLASH_ACCESS_KEY: "unsplash-test-key" });
  const uc = JSON.parse(fs.readFileSync(path.join(tmp, "u/credits.json"), "utf8"));
  ok(r.code === 0 && uc.length === 2 && fs.existsSync(path.join(tmp, "u/unsplash-02.jpg")), "unsplash: 2 files downloaded");
  ok(seen.some((s) => s.path === "/search/photos" && s.auth === "Client-ID unsplash-test-key" && s.version === "v1"), "unsplash: Client-ID header and Accept-Version v1 sent");
  ok(seen.filter((s) => /^\/photos\/u\d\/download$/.test(s.path)).length === 2, "unsplash: a download event registered for every photo (also without download_location)");
  ok(seen.some((s) => s.path === "/img/u1.jpg" && /ixid=abc/.test(s.q)), "unsplash: the ixid parameter is kept on the image URL");
  ok(/Photo by Una Snap on Unsplash/.test(uc[0].ask) && /utm_source=/.test(uc[0].page), "unsplash: attribution text and UTM link recorded");
  ok(/^# Credits/.test(fs.readFileSync(path.join(tmp, "u/CREDITS.md"), "utf8")) && /Una Snap/.test(fs.readFileSync(path.join(tmp, "u/CREDITS.md"), "utf8")), "CREDITS.md written with every file");
  r = await run(["pexels", "x", "--out", path.join(tmp, "nokey")], { PEXELS_API_KEY: "" });
  ok(r.code !== 0 && /PEXELS_API_KEY is not set/.test(r.out), "a missing key stops with a clear message");
  r = await run(["pexels", "x", "--out", path.join(tmp, "bad")], { PEXELS_API_KEY: "wrong" });
  ok(r.code !== 0 && /401/.test(r.out), "a wrong key reports the 401");
} finally { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
