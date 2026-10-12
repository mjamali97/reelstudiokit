// Fake api.telegram.org + fake Zernio (/zernio/*) for local tests: records every call to test/calls.jsonl.
import http from "node:http"; import fs from "node:fs";
const LOG = new URL("./calls.jsonl", import.meta.url); fs.writeFileSync(LOG, "");
let mid = 100, zid = 0;
const json = (res, o, code = 200) => { res.statusCode = code; res.setHeader("content-type", "application/json"); res.end(JSON.stringify(o)); };
const EXTRA = [];   // posts added by a test: POST /__mock/add-post {id, h, views}
http.createServer((req, res) => {
  const chunks = []; req.on("data", (c) => chunks.push(c)); req.on("end", () => {
    const raw = Buffer.concat(chunks), u = req.url;
    if (u.startsWith("/__mock/add-post")) { EXTRA.push(JSON.parse(raw.toString())); return json(res, { ok: true }); }
    if (u.startsWith("/upload/")) { fs.appendFileSync(LOG, JSON.stringify({ zernio: true, method: req.method, path: u, bytes: raw.length }) + "\n"); return json(res, {}); }
    if (u.startsWith("/zernio/")) {
      const path = u.slice(7); let body = {}; try { body = JSON.parse(raw.toString() || "{}"); } catch {}
      fs.appendFileSync(LOG, JSON.stringify({ zernio: true, method: req.method, path, body }) + "\n");
      if (path.startsWith("/accounts")) return json(res, { accounts: [{ _id: "igacc", platform: "instagram", username: "mybrand", profileId: { _id: "prof" }, followersCount: 1000 }, { _id: "ytacc", platform: "youtube" }] });
      if (path.startsWith("/media/presign")) return json(res, { uploadUrl: "http://127.0.0.1:8790/upload/" + (++zid), publicUrl: "https://media.example/" + zid + ".png" });
      if (path.startsWith("/comment-automations") && req.method === "POST") return json(res, { automation: { _id: "auto" + (++zid) } });
      if (path.startsWith("/posts") && req.method === "POST") return json(res, { post: { _id: "zpost" + (++zid) } });
      if (path.startsWith("/posts")) return json(res, { post: { _id: path.split("/")[2] } });
      if (path.startsWith("/analytics/instagram/account-insights")) return json(res, { metrics: { views: { total: 100000 }, reach: { total: 50000 }, accounts_engaged: { total: 9000 }, total_interactions: { total: 20000 } } });
      if (path.startsWith("/analytics/instagram/online-followers")) return json(res, { days: [{ endTime: "2026-10-08T07:00:00+0000", hours: Object.fromEntries([...Array(24)].map((_, h) => [String(h), 500 + h * 10])) }] });
      const ago = (h) => new Date(Date.now() - h * 36e5).toISOString(), day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
      if (path.startsWith("/analytics/instagram/follower-history")) return json(res, { metrics: {
        follower_count: { values: [...Array(20)].map((_, i) => ({ date: day(20 - i), value: 900 + i * 6 })) },
        followers_gained: { values: [...Array(20)].map((_, i) => ({ date: day(20 - i), value: i < 13 ? 4 : 9 })) },
        followers_lost: { values: [...Array(20)].map((_, i) => ({ date: day(20 - i), value: 1 })) } } });
      if (path.startsWith("/analytics/instagram/demographics")) return json(res, { demographics: { city: [{ dimension: "Tehran", value: 500 }, { dimension: "Karaj", value: 80 }], age: [{ dimension: "25-34", value: 400 }, { dimension: "18-24", value: 200 }] } });
      if (path.startsWith("/analytics/best-time")) return json(res, { slots: [{ day_of_week: 1, hour: 15, avg_engagement: 120, post_count: 3 }, { day_of_week: 3, hour: 16, avg_engagement: 90, post_count: 2 }] });
      if (path.startsWith("/analytics?") || path === "/analytics") {
        const reel = (id, h, views, extra = {}) => ({ _id: id, latePostId: "late-" + id, platform: "instagram", content: "ریل تست " + id + "\nخط دوم", publishedAt: ago(h), mediaProductType: "REELS",
          platformPostUrl: "https://www.instagram.com/reel/" + id + "/", analytics: { views, reach: views * .8, likes: views / 40, comments: views / 100, shares: views / 90, saves: views / 30,
            reelsSkipRate: 40, igReelsAvgWatchTime: 14000, videoDurationSeconds: 40, lastUpdated: ago(1), ...extra } });
        const list = [...EXTRA.map((e) => reel(e.id, e.h, e.views)), reel("R25", 25, 18000, { reelsSkipRate: 33 }), reel("R170", 170, 9000), reel("R60", 60, 7000),
          ...[...Array(12)].map((_, i) => reel("old" + i, 400 + i * 48, 5000 + i * 300))];
        return json(res, { posts: list, pagination: { pages: 1 } });
      }
      if (path.startsWith("/comment-automations") && req.method === "GET" && !path.includes("/logs")) return json(res, { automations: [{ id: "autoR25", postId: "late-R25", keywords: ["منو"] }] });
      if (path.includes("/logs")) return json(res, { logs: [{ status: "sent" }, { status: "sent" }, { status: "failed" }], pagination: { total: 3 }, misses: { total: 2 } });
      if (path.startsWith("/webhooks/settings")) return json(res, req.method === "GET" ? { webhooks: [] } : { webhook: { _id: "wh1" } });
      if (path.startsWith("/analytics")) return json(res, { posts: [{ platform: "instagram", content: "یه ریل تستی:\n“تست”", publishedAt: "2026-01-06T17:15:04Z", mediaProductType: "REELS", platformPostUrl: "https://www.instagram.com/reel/TESTCODE1/", analytics: { views: 12345, reach: 11000, likes: 300, comments: 200, shares: 150, saves: 900, igReelsAvgWatchTime: 12000, reelsSkipRate: 40, videoDurationSeconds: 60, engagementRate: 20.3 } }], pagination: { pages: 1 } });
      return json(res, {});
    }
    const [, bot, method] = u.match(/^\/bot([^/]+)\/(\w+)/) || [];
    let body = {}; const ct = req.headers["content-type"] || "";
    if (ct.includes("json")) { try { body = JSON.parse(raw.toString() || "{}"); } catch {} } else if (raw.length) body = { multipart: true, bytes: raw.length };
    fs.appendFileSync(LOG, JSON.stringify({ bot, method, body }) + "\n");
    json(res, { ok: true, result: /^send/.test(method || "") ? { message_id: ++mid } : true });
  });
}).listen(8790, "127.0.0.1", () => console.log("mock telegram + zernio on 8790"));
