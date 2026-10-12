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
    // ---- demo mode (bash demo/demo.sh): the Telegram viewer page and its buttons ----
    if (u === "/" || u.startsWith("/viewer")) { res.setHeader("content-type", "text/html; charset=utf-8"); return res.end(fs.readFileSync(new URL("../demo/viewer.html", import.meta.url))); }
    if (u.startsWith("/__mock/calls")) return json(res, fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)));
    if (u.startsWith("/__mock/send") || u.startsWith("/__mock/press")) {
      const b = JSON.parse(raw.toString() || "{}"), OWNER = +(process.env.OWNER_ID || 100000001), id = Date.now() % 1e9;
      const update = u.startsWith("/__mock/send") ? { message: { message_id: id, date: 0, chat: { id: OWNER, type: "private" }, from: { id: OWNER }, text: b.text } }
        : { callback_query: { id: "q" + id, from: { id: OWNER }, data: b.data, message: { message_id: b.message_id, chat: { id: OWNER }, text: b.text || "", ...(b.photo ? { photo: [{}] } : {}) } } };
      return fetch(`http://127.0.0.1:8787/tg/${b.bot === "publisher" ? "publisher" : "studio"}`, { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": process.env.WEBHOOK_SECRET || "test-secret" }, body: JSON.stringify({ update_id: id, ...update }) })
        .then((r) => json(res, { status: r.status }), (e) => json(res, { error: e.message }, 502));
    }
    // ---- fake Gemini (GEMINI_API=http://127.0.0.1:8790/gemini): canned answers in the demo's shape, no AI involved ----
    if (u.startsWith("/gemini/")) {
      const prompt = (() => { try { return JSON.parse(raw.toString()).contents[0].parts[0].text; } catch { return ""; } })();
      fs.appendFileSync(LOG, JSON.stringify({ gemini: true, prompt }) + "\n");
      const text = /"frames"/.test(prompt) ? JSON.stringify({ title: "Pumpkin spice is back", frames: ["Our pumpkin spice cake is back from today →", "Only 12 a day, until November.\nWhich size do you want?"], sticker: "poll", poll: ["Small", "Party size"], why: "first cold week of autumn (demo answer)" })
        : /"summary"/.test(prompt) ? JSON.stringify({ summary: "A 5-step guide to storing cream cakes at home. Demo answer: in the real bot Gemini reads the link and writes this from the page.", hook: "Your cake is melting in the car? Do this.", gate: "STORE", score: 7.5, tier: 1, weak: "needs a real shot of the fridge step", avoid: "do not promise it keeps a week" })
        : /reply text/.test(prompt) ? "We're open every day 8:00–19:00. See you soon! 🎂"
        : /post text/.test(prompt) ? "🎂 How to keep a cream cake fresh at home:\n\nThe full guide (one page):\nhttps://example.com/storage\n\n🔴 Tip: never leave it in a warm car.\n\n💬 #store\n\n➡️ @my_channel"
        : "1. Cream cakes keep 2 days in the fridge, covered.\nhttps://example.com/storage\n2. Take them out 30 minutes before serving.\nhttps://example.com/serving\n\n🎬 Hook: “Your cake melts in the car? Do this.” (demo answer)";
      return json(res, { candidates: [{ content: { parts: [{ text }] }, groundingMetadata: { groundingChunks: [{ web: { uri: "https://example.com/storage", title: "Storage guide" } }] } }] });
    }
    if (u.startsWith("/upload/")) { fs.appendFileSync(LOG, JSON.stringify({ zernio: true, method: req.method, path: u, bytes: raw.length }) + "\n"); return json(res, {}); }
    if (u.startsWith("/zernio/")) {
      const path = u.slice(7); let body = {}; try { body = JSON.parse(raw.toString() || "{}"); } catch {}
      fs.appendFileSync(LOG, JSON.stringify({ zernio: true, method: req.method, path, body }) + "\n");
      if (/^\/accounts\/[^/]+\/instagram\/business-discovery/.test(path)) {
        const u = new URL("http://x" + path).searchParams.get("username");
        if (u === "nobody") return json(res, { error: "not a business account" }, 404);
        const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
        return json(res, { profile: { id: "c-" + u, username: u, name: u, followersCount: 4200, followsCount: 300, mediaCount: 210 },
          media: [...Array(12)].map((_, i) => ({ id: "m" + i, caption: "post " + i, mediaProductType: "REELS", timestamp: ago(i * 2), permalink: "https://www.instagram.com/p/" + u + i + "/", likeCount: 100 + i * 10, commentsCount: 5 + i })) });
      }
      if (path.startsWith("/accounts")) return json(res, { accounts: [{ _id: "igacc", platform: "instagram", username: "mybrand", profileId: { _id: "prof" }, followersCount: 1000 },
        { _id: "igB", platform: "instagram", username: "photolab", profileId: { _id: "profB" }, followersCount: 2500 }, { _id: "ytacc", platform: "youtube" }] });
      if (path.startsWith("/profiles")) return json(res, { profiles: [{ _id: "prof", name: "Sweet Corner", accountUsernames: ["mybrand"] }, { _id: "profB", name: "Photo Lab", accountUsernames: ["photolab"] }] });
      if (path.startsWith("/inbox/") && req.method === "POST") return json(res, { success: true });
      if (path.startsWith("/posts?status=scheduled")) return json(res, { posts: [{ _id: "s1", content: "Next reel: the autumn menu", platforms: [{ platform: "instagram", accountId: "igacc", scheduledFor: new Date(Date.now() + 2 * 864e5).toISOString() }] }] });
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
        const reel = (id, h, views, extra = {}) => ({ _id: id, latePostId: "late-" + id, platform: "instagram", content: "Test reel " + id + "\nsecond line", publishedAt: ago(h), mediaProductType: "REELS",
          platformPostUrl: "https://www.instagram.com/reel/" + id + "/", analytics: { views, reach: views * .8, likes: views / 40, comments: views / 100, shares: views / 90, saves: views / 30,
            reelsSkipRate: 40, igReelsAvgWatchTime: 14000, videoDurationSeconds: 40, lastUpdated: ago(1), ...extra } });
        const list = [...EXTRA.map((e) => reel(e.id, e.h, e.views)), reel("R25", 25, 18000, { reelsSkipRate: 33 }), reel("R170", 170, 9000), reel("R60", 60, 7000),
          ...[...Array(12)].map((_, i) => reel("old" + i, 400 + i * 48, 5000 + i * 300))];
        return json(res, { posts: list, pagination: { pages: 1 } });
      }
      if (path.startsWith("/comment-automations") && req.method === "GET" && !path.includes("/logs")) return json(res, { automations: [{ id: "autoR25", postId: "late-R25", keywords: ["منو"] }] });
      if (path.includes("/logs")) return json(res, { logs: [{ status: "sent" }, { status: "sent" }, { status: "failed" }], pagination: { total: 3 }, misses: { total: 2 } });
      if (path.startsWith("/webhooks/settings")) return json(res, req.method === "GET" ? { webhooks: [] } : { webhook: { _id: "wh1" } });
      if (path.startsWith("/analytics")) return json(res, { posts: [{ platform: "instagram", content: "A test reel:\n“test”", publishedAt: "2026-01-06T17:15:04Z", mediaProductType: "REELS", platformPostUrl: "https://www.instagram.com/reel/TESTCODE1/", analytics: { views: 12345, reach: 11000, likes: 300, comments: 200, shares: 150, saves: 900, igReelsAvgWatchTime: 12000, reelsSkipRate: 40, videoDurationSeconds: 60, engagementRate: 20.3 } }], pagination: { pages: 1 } });
      return json(res, {});
    }
    const [, bot, method] = u.match(/^\/bot([^/]+)\/(\w+)/) || [];
    let body = {}; const ct = req.headers["content-type"] || "";
    if (ct.includes("json")) { try { body = JSON.parse(raw.toString() || "{}"); } catch {} }
    else if (raw.length) {
      const t = raw.toString("utf8"), field = (n) => (t.match(new RegExp(`name="${n}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`)) || [])[1];
      body = { multipart: true, bytes: raw.length, chat_id: field("chat_id"), filename: (t.match(/filename="([^"]+)"/) || [])[1], caption: field("caption") };
      try { const rm = field("reply_markup"); if (rm) body.reply_markup = JSON.parse(rm); } catch {}
    }
    const sent = /^send/.test(method || "") ? ++mid : null;
    fs.appendFileSync(LOG, JSON.stringify({ bot, method, body, ...(sent ? { mid: sent } : {}), t: Date.now() }) + "\n");
    json(res, { ok: true, result: method === "getMe" ? { username: bot === "TEST_PUBLISHER" ? "test_publisher_bot" : "test_studio_bot" } : sent ? { message_id: sent } : true });
  });
}).listen(8790, "127.0.0.1", () => console.log("mock telegram + zernio on 8790"));
