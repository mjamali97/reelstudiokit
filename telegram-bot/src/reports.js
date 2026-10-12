// reports.js · the page's numbers, delivered: a daily Telegram report (followers, trend, page score), a report 24 h and
// 7 days after every post, a private dashboard page, and Zernio webhooks (post published, account disconnected).
// Mechanics only, no personal data. index.js wires it: makeReports({ zernio, say, fa, esc, localParts, fontBlack, fontSemi }).
//
// Data: Zernio. Follower history is a daily snapshot on Zernio's side ("up to 24 hours old"), so the daily report names
// the day each number belongs to. Nothing here is estimated: a part without data is left out of the score and said so.

import { _, _f, lang, rtl, listSep, grouped, dec as idec } from "./i18n.js";

export function makeReports({ zernio, say, fa, esc, localParts, fontBlack = "", fontSemi = "" }) {
  // ---------- small helpers ----------
  const kvGet = async (env, k) => (await env.DB.prepare("SELECT v FROM kv WHERE k=?").bind(k).first())?.v ?? null;
  const kvSet = (env, k, v) => env.DB.prepare("INSERT OR REPLACE INTO kv (k, v, updated_at) VALUES (?, ?, datetime('now'))").bind(k, String(v)).run();
  const pad = (n) => String(n).padStart(2, "0");
  const localDate = (env, offsetDays = 0) => { const t = localParts(new Date(Date.now() + offsetDays * 864e5), env); return `${t.y}-${pad(t.m)}-${pad(t.d)}`; };
  const median = (a) => { const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const n0 = (x) => (Number.isFinite(x) ? x : 0);
  const dec = (x, d = 1) => idec(x, d);
  const big = (n) => { if (!Number.isFinite(n)) return "—"; const a = Math.abs(n);
    return a >= 1e6 ? _f("{0}M", dec(n / 1e6).replace(/[.,٫][0۰٠]$/, "")) : a >= 1e4 ? _f("{0}K", fa(Math.round(n / 1e3))) : grouped(n); };
  const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + big(Math.abs(n));
  const ratio = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : null);
  const times = (r) => (r == null ? "" : r >= 1 ? _f("{0}×", dec(r)) : _f("{0}% of", fa(Math.round(r * 100))));
  const spark = (vals) => { const v = vals.filter(Number.isFinite); if (v.length < 2) return ""; const lo = Math.min(...v), hi = Math.max(...v), b = "▁▂▃▄▅▆▇█";
    return v.map((x) => b[hi === lo ? 3 : Math.round((x - lo) / (hi - lo) * 7)]).join(""); };
  const firstLine = (t) => String(t || "").split("\n").map((l) => l.trim()).find(Boolean)?.slice(0, 70) || "—";
  const hoursSince = (iso) => (Date.now() - Date.parse(iso)) / 36e5;

  // ---------- Zernio reads ----------
  async function ig(env) {
    const a = await zernio(env, "GET", "/accounts");
    return (a.data?.accounts || []).find((x) => x.platform === "instagram") || null;
  }
  async function followerSeries(env, acc, days = 60) {
    days = Math.min(days, 85);   // Zernio: "Date range cannot exceed 88 days"
    const r = await zernio(env, "GET", `/analytics/instagram/follower-history?accountId=${acc._id}&metricType=time_series&since=${localDate(env, -days)}&until=${localDate(env)}`);
    const m = r.data?.metrics || {};
    return { counts: m.follower_count?.values || [], gained: m.followers_gained?.values || [], lost: m.followers_lost?.values || [] };
  }
  async function posts(env, acc, pages = 2) {
    const out = [];
    for (let page = 1; page <= pages; page++) {
      const r = await zernio(env, "GET", `/analytics?limit=50&page=${page}&accountId=${acc._id}`);
      out.push(...(r.data?.posts || []).filter((p) => !p.platform || p.platform === "instagram"));
      if (page >= (r.data?.pagination?.pages || 1)) break;
    }
    return out.filter((p) => p.publishedAt).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  function m(p) {
    const a = p.analytics || {}, v = a.views ?? null;
    const watch = a.igReelsAvgWatchTime ? a.igReelsAvgWatchTime / 1000 : null, dur = a.videoDurationSeconds || null;
    return { views: v, reach: a.reach ?? null, likes: a.likes ?? null, comments: a.comments ?? null, shares: a.shares ?? null, saves: a.saves ?? null,
      follows: a.follows ?? null, profileViews: a.profileViews || null,
      savesK: v ? 1000 * n0(a.saves) / v : null, sharesK: v ? 1000 * n0(a.shares) / v : null, valueK: v ? 1000 * (n0(a.saves) + n0(a.shares)) / v : null,
      skip: a.reelsSkipRate ?? null, watch, dur, watchPct: watch && dur ? 100 * watch / dur : null, updated: a.lastUpdated || null,
      reel: p.mediaProductType === "REELS" };
  }
  const reelsOnly = (ps) => ps.filter((p) => p.mediaProductType === "REELS");

  // ---------- the page score (0–100): five parts, each 0–20, each against the page's OWN baseline ----------
  // r = recent ÷ before: 1 → 10 points, 2× → 20, half → 0. Consistency: posts this week ÷ the target (REEL_DAYS).
  const pts = (r) => (r == null ? null : Math.max(0, Math.min(20, Math.round(10 + 10 * Math.log2(Math.max(r, 1e-3))))));
  function score(env, ps, series) {
    const now = Date.now(), d = (p) => (now - Date.parse(p.publishedAt)) / 864e5;
    const reels = reelsOnly(ps), recent = reels.filter((p) => d(p) <= 14 && d(p) >= 1), before = reels.filter((p) => d(p) > 14).slice(0, 10);
    const g = series.gained.map((x) => x.value), g7 = g.slice(-7), p7 = g.slice(-14, -7);
    const target = (env.REEL_DAYS || "0,2,4").split(",").length;
    const parts = [
      { key: "growth", short: _("Follower growth"), label: _("Follower growth (7 days vs the 7 before)"), r: g.length >= 10 ? ratio(g7.reduce((a, b) => a + b, 0), Math.max(1, p7.reduce((a, b) => a + b, 0))) : null },
      { key: "reach", short: _("Reel views"), label: _("Views of the last 2 weeks' reels vs earlier ones"), r: ratio(median(recent.map((p) => m(p).views)), median(before.map((p) => m(p).views))) },
      { key: "value", short: _("Saves & shares"), label: _("Saves and shares per 1,000 views"), r: ratio(median(recent.map((p) => m(p).valueK)), median(before.map((p) => m(p).valueK))) },
      { key: "retention", short: _("Viewer retention"), label: _("Viewer retention (fewer skips)"), r: ratio(median(before.map((p) => m(p).skip)), median(recent.map((p) => m(p).skip))) },
      { key: "consistency", short: _("Posting consistency"), label: _f("Posting consistency (goal: {0} a week)", fa(target)), r: null, fixed: Math.round(20 * Math.min(1, ps.filter((p) => d(p) <= 7).length / target)) },
    ].map((x) => ({ ...x, pts: x.fixed ?? pts(x.r) }));
    const have = parts.filter((x) => x.pts != null);
    const total = have.length ? Math.round(100 * have.reduce((a, b) => a + b.pts, 0) / (have.length * 20)) : null;
    return { total, parts, missing: parts.filter((x) => x.pts == null).map((x) => x.label) };
  }
  const bar = (p) => "■".repeat(Math.round(p / 4)) + "□".repeat(5 - Math.round(p / 4));

  // ---------- daily report ----------
  async function dailyReport(env) {
    const acc = await ig(env);
    if (!acc) return say(env, _("📊 Daily report: no Instagram account found in Zernio (maybe disconnected; reconnect it in Zernio)."));
    const [series, ps, ins] = await Promise.all([followerSeries(env, acc, 45), posts(env, acc, 2), zernio(env, "GET", `/analytics/instagram/account-insights?accountId=${acc._id}`)]);
    const yday = localDate(env, -1), gIdx = series.gained.findIndex((x) => x.date === yday);
    const gDay = gIdx >= 0 ? series.gained[gIdx] : series.gained[series.gained.length - 1];
    const lDay = series.lost.find((x) => x.date === gDay?.date);
    const g = series.gained.map((x) => x.value), sum = (a) => a.reduce((x, y) => x + y, 0);
    const g7 = sum(g.slice(-7)), p7 = g.length >= 14 ? sum(g.slice(-14, -7)) : null;
    const counts = series.counts.slice(-14).map((x) => x.value);
    const met = ins.data?.metrics || {}, views30 = met.views?.total ?? null, reach30 = met.reach?.total ?? null;
    const weekAgo = await env.DB.prepare("SELECT * FROM snapshots WHERE date <= ? AND views30 IS NOT NULL ORDER BY date DESC LIMIT 1").bind(localDate(env, -7)).first();
    const sc = score(env, ps, series);
    const prev = await env.DB.prepare("SELECT score FROM snapshots WHERE date < ? AND score IS NOT NULL ORDER BY date DESC LIMIT 1").bind(localDate(env)).first();
    await env.DB.prepare("INSERT OR REPLACE INTO snapshots (date, followers, views30, reach30, engaged30, interactions30, score) VALUES (?,?,?,?,?,?,?)")
      .bind(localDate(env), acc.followersCount ?? null, views30, reach30, met.accounts_engaged?.total ?? null, met.total_interactions?.total ?? null, sc.total).run();
    const week = ps.filter((p) => hoursSince(p.publishedAt) <= 7 * 24);
    const best = [...week].sort((a, b) => n0(m(b).views) - n0(m(a).views))[0];
    const L = [_f("📊 <b>Daily report</b> · {0}", fa(localDate(env))), ""];
    L.push(_f("👥 Followers: <b>{0}</b>", big(acc.followersCount)));
    if (gDay) L.push(_f("   {0}: <b>{1}</b> ({2} in, {3} out)", gDay.date === yday ? _("Yesterday") : _("last recorded day (") + fa(gDay.date) + ")", signed(gDay.value - n0(lDay?.value)), fa(gDay.value), fa(n0(lDay?.value))));
    else L.push(_("   Daily followers aren't recorded yet (Zernio takes one snapshot a day; it starts tomorrow)."));
    if (g.length && g.length < 7) L.push(_f("📈 Last {0} days (since Zernio started recording daily followers): <b>{1}</b>", fa(g.length), signed(sum(g))));
    if (g.length >= 7) L.push(_f("📈 Last 7 days: <b>{0}</b>{1}", signed(g7), p7 != null ? _f(" · the week before {0}{1}", signed(p7), p7 > 0 ? ` (${times(g7 / p7)})` : "") : ""));
    if (counts.length >= 3) L.push(_f("   {0}  ({1} days)", spark(counts), fa(counts.length)));
    if (views30 != null) L.push(_f("👀 30-day views: <b>{0}</b>{1} · reach: {2}", big(views30), weekAgo?.views30 ? _f(" (a week ago {0}, {1})", big(weekAgo.views30), signed(views30 - weekAgo.views30)) : "", big(reach30)));
    L.push(_f("📝 Posts this week: {0}", fa(week.length)));
    if (sc.total != null) {
      L.push("", _f("🏆 <b>Page score: {0} of 100</b>{1}", fa(sc.total), prev?.score != null ? _f(" (yesterday {0}, {1} {2})", fa(prev.score), sc.total >= prev.score ? "▲" : "▼", fa(Math.abs(sc.total - prev.score))) : ""));
      for (const p of sc.parts) if (p.pts != null) L.push(_f("{0} {1}/20 · {2}", bar(p.pts), fa(p.pts), p.label));
      if (sc.missing.length) L.push(_f("<i>No data yet: {0}</i>", sc.missing.join(listSep())));
      const weakest = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts)[0];
      if (weakest && weakest.pts < 10) L.push(_f("🎯 Weakest part: {0}", weakest.label));
    }
    if (best) L.push("", _f("⭐ Best post of the week: «{0}» · {1} views{2}", esc(firstLine(best.content)), big(m(best).views), best.platformPostUrl ? `\n${esc(best.platformPostUrl)}` : ""));
    const url = await dashLink(env);
    return say(env, L.join("\n").slice(0, 4000), url ? { reply_markup: { inline_keyboard: [[{ text: _("📊 Full dashboard"), url }]] } } : {});
  }

  // ---------- 24 h and 7-day post reports ----------
  async function gateStats(env, p) {
    const r = await zernio(env, "GET", "/comment-automations?limit=100");
    const a = (r.data?.automations || []).find((x) => x.postId && (x.postId === p._id || x.postId === p.latePostId));
    if (!a) return null;
    const l = await zernio(env, "GET", `/comment-automations/${a.id || a._id}/logs?limit=100`);
    const by = {}; for (const x of l.data?.logs || []) by[x.status] = (by[x.status] || 0) + 1;
    return { word: (a.keywords || []).join(listSep()), sent: by.sent || 0, failed: by.failed || 0, total: l.data?.pagination?.total ?? (l.data?.logs || []).length, misses: l.data?.misses?.total ?? null };
  }
  async function postReport(env, p, hours, ps, series) {
    const x = m(p), others = reelsOnly(ps).filter((q) => q._id !== p._id && Date.parse(q.publishedAt) < Date.parse(p.publishedAt)).slice(0, 20);
    const med = (k) => median(others.map((q) => m(q)[k]));
    const rank = 1 + others.filter((q) => n0(m(q).views) > n0(x.views)).length;
    const kind = x.reel ? _("Reel") : _("post");
    const L = [_f("🎬 <b>{0} report of the {1}</b>", hours >= 160 ? _("7-day") : _("24-hour"), kind), `«${esc(firstLine(p.content))}»`, ""];
    L.push(_f("👀 Views: <b>{0}</b>{1}{2}", big(x.views), med("views") ? _f(" · {0} your reels' median", times(ratio(x.views, med("views")))) : "", others.length ? _f(" · rank {0} of {1}", fa(rank), fa(others.length + 1)) : ""));
    if (hours >= 160) { const v24 = await kvGet(env, `rep24v:${p._id}`); if (v24) L.push(_f("   Since the 24-hour report: {0} more views", signed(n0(x.views) - Number(v24)))); }
    L.push(_f("📣 Reach: {0} · ❤️ {1} · 💬 {2} · 🔁 {3} · 🔖 {4}", big(x.reach), big(x.likes), big(x.comments), big(x.shares), big(x.saves)));
    if (x.views) L.push(_f("   Per 1,000 views: {0} saves{1} · {2} shares{3}", dec(x.savesK), med("savesK") != null ? _f(" (median {0})", dec(med("savesK"))) : "", dec(x.sharesK), med("sharesK") != null ? _f(" (median {0})", dec(med("sharesK"))) : ""));
    if (x.reel && (x.skip != null || x.watchPct != null)) L.push(`⏱ ${x.skip != null ? _f("skipped {0}%{1}", fa(Math.round(x.skip)), med("skip") != null ? _f(" (median {0})", fa(Math.round(med("skip")))) : "") : ""}${x.watchPct != null ? _f(" · average watch {0} of {1} seconds ({2}%)", dec(x.watch), fa(Math.round(x.dur)), fa(Math.round(x.watchPct))) : ""}`);
    if (x.follows != null) L.push(_f("➕ Followers from this post: <b>{0}</b>", fa(x.follows)));
    const day = (o) => { const t = localParts(new Date(Date.parse(p.publishedAt) + o * 864e5), env); return `${t.y}-${pad(t.m)}-${pad(t.d)}`; };
    const gd = [0, 1].map((o) => series.gained.find((v) => v.date === day(o))?.value).filter(Number.isFinite);
    if (gd.length) L.push(_f("👥 Page followers on the publish day{0}: <b>+{1}</b>", gd.length > 1 ? _(" and the next day") : "", fa(gd.reduce((a, b) => a + b, 0))));
    if (x.profileViews) L.push(_f("👤 Profile visits from this post: {0}", big(x.profileViews)));
    const gate = await gateStats(env, p).catch(() => null);
    if (gate) L.push(_f("🔑 Gate «{0}»: {1} comments · ✅ {2} DMs sent{3}{4}", esc(gate.word), fa(gate.total), fa(gate.sent), gate.failed ? _f(" · ⚠️ {0} not sent", fa(gate.failed)) : "", gate.misses ? _f(" · {0} comments without the word", fa(gate.misses)) : ""));
    // strengths and weaknesses against the page's own medians
    const cmp = [[_("views"), ratio(x.views, med("views"))], [_("saves"), ratio(x.savesK, med("savesK"))], [_("shares"), ratio(x.sharesK, med("sharesK"))],
      [_("Viewer retention"), ratio(med("skip"), x.skip)], [_("watch %"), ratio(x.watchPct, med("watchPct"))]].filter(([, r]) => r != null);
    if (cmp.length >= 2) {
      const s = [...cmp].sort((a, b) => b[1] - a[1]), lo = s[s.length - 1];
      L.push("", s[0][1] >= 1.1 ? _f("✅ Strongest: {0} ({1} median)", s[0][0], times(s[0][1])) : _("✅ No part was clearly above your reels' median."));
      if (lo[1] > 0.9) L.push(_("⚠️ No part was below the median."));
      else {
      L.push(_f("⚠️ Weakest: {0} ({1} median)", lo[0], times(lo[1])));
      if (s[s.length - 1][0] === _("Viewer retention") || s[s.length - 1][0] === _("watch %")) L.push(_("   ← Make the first seconds stronger: show the result from frame one."));
      else if (s[s.length - 1][0] === _("saves")) L.push(_("   ← Give something worth keeping (a list, prices, a guide) and say «save it»."));
      else if (s[s.length - 1][0] === _("shares")) L.push(_("   ← Say who to send it to («send it to someone who…»)."));
      else if (s[s.length - 1][0] === _("views")) L.push(_("   ← Was the topic close to the viewer? Compare the first-second hook with your most-viewed reels."));
      }
    }
    if (x.updated) L.push(_f("<i>Zernio stats: {0} UTC</i>", esc(String(x.updated).slice(0, 16))));
    const url = await dashLink(env);
    await say(env, L.join("\n").slice(0, 4000), { reply_markup: { inline_keyboard: [[...(p.platformPostUrl ? [{ text: _("▶️ Post"), url: p.platformPostUrl }] : []), ...(url ? [{ text: _("📊 Dashboard"), url }] : [])]] } });
    if (hours < 160) await kvSet(env, `rep24v:${p._id}`, n0(x.views));
  }
  // hourly: every post gets one report at 24 h and one at 7 days. On the first run, older posts are marked done silently.
  async function checkPostReports(env) {
    const acc = await ig(env); if (!acc) return;
    const ps = await posts(env, acc, 1), init = await kvGet(env, "rep:init");
    let series = null;
    for (const p of ps) {
      const h = hoursSince(p.publishedAt);
      for (const [mark, at, until] of [["rep24", 24, 6 * 24], ["rep168", 7 * 24, 10 * 24]]) {
        if (h < at || h > until || await kvGet(env, `${mark}:${p._id}`)) continue;
        await kvSet(env, `${mark}:${p._id}`, new Date().toISOString());
        if (!init) continue;
        series = series || await followerSeries(env, acc, 30);
        await postReport(env, p, at, ps, series);
      }
    }
    if (!init) await kvSet(env, "rep:init", new Date().toISOString());
  }

  // ---------- Zernio webhooks (registered by /setup; URL carries a token, body signed with HMAC-SHA256) ----------
  async function hmacHex(secret, body) {
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return [...new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body)))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function webhookToken(env) {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode((env.WEBHOOK_SECRET || "") + ":zernio"));
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  }
  async function onZernioWebhook(env, req) {
    if (!env.WEBHOOK_SECRET || new URL(req.url).searchParams.get("k") !== await webhookToken(env)) return new Response("forbidden", { status: 403 });
    const raw = await req.text(), sig = (req.headers.get("x-zernio-signature") || "").replace(/^sha256=/, "");
    if (sig && sig !== await hmacHex(env.WEBHOOK_SECRET, raw)) return new Response("bad signature", { status: 401 });
    let e = {}; try { e = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
    const id = e.id || req.headers.get("x-zernio-event-id");
    if (id && await kvGet(env, "zwh:" + id)) return new Response("dup");
    if (id) await kvSet(env, "zwh:" + id, e.event || "");
    if (e.test) { await say(env, _f("🔔 The Zernio webhook is connected (test: {0}).", esc(e.event || ""))); return new Response("ok"); }
    if (e.event === "account.disconnected") await say(env, _f("🚨 <b>The {0} account was disconnected from Zernio</b>{1}.\nUntil you reconnect it nothing gets published and no stats arrive: Zernio → Accounts → Reconnect.", esc(e.account?.platform || ""), e.account?.username ? " (" + esc(e.account.username) + ")" : ""));
    else if (e.event === "post.platform.failed") await say(env, _f("⚠️ Publishing on {0} failed: {1}", esc(e.platform || e.post?.platform || ""), esc(String(e.error || e.post?.error || "").slice(0, 200))));
    else if (e.event === "post.platform.published" || e.event === "post.external.created") {
      const url = e.platformPostUrl || e.post?.platformPostUrl || (e.post?.platforms || []).find((x) => x.platformPostUrl)?.platformPostUrl || "";
      await say(env, _f("✅ Published{0}\nIts 24-hour report arrives tomorrow at this time.", url ? ": " + esc(url) : ""));
    }
    return new Response("ok");
  }
  async function registerWebhook(env, origin) {
    if (!env.ZERNIO_API_KEY || !env.WEBHOOK_SECRET) return "skipped (no ZERNIO_API_KEY or WEBHOOK_SECRET)";
    const url = `${origin}/zernio/webhook?k=${await webhookToken(env)}`;
    const cur = await zernio(env, "GET", "/webhooks/settings");
    const list = cur.data?.webhooks || cur.data?.data || (Array.isArray(cur.data) ? cur.data : []);
    if (list.some((w) => (w.url || "").startsWith(origin + "/zernio/webhook"))) return "already registered";
    const r = await zernio(env, "POST", "/webhooks/settings", { name: "reel-studio-bot", url, secret: env.WEBHOOK_SECRET,
      events: ["post.platform.published", "post.platform.failed", "post.external.created", "account.disconnected"] });
    return r.ok ? "registered" : `failed ${r.status}`;
  }

  // ---------- the dashboard page (private link, live from Zernio + the bot's daily snapshots) ----------
  async function dashToken(env) {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode((env.INGEST_KEY || "") + ":dashboard"));
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
  }
  async function dashLink(env) {
    const origin = await kvGet(env, "origin");
    return origin && env.INGEST_KEY ? `${origin}/dashboard?k=${await dashToken(env)}` : null;
  }
  function line(points, w = 640, h = 160, color = "var(--accent)") {
    const v = points.filter((p) => Number.isFinite(p.y)); if (v.length < 2) return _f("<p class=\"muted\">Not enough data yet.</p>");
    const lo = Math.min(...v.map((p) => p.y)), hi = Math.max(...v.map((p) => p.y)), X = (i) => 8 + i * (w - 16) / (v.length - 1), Y = (y) => h - 18 - (hi === lo ? .5 : (y - lo) / (hi - lo)) * (h - 36);
    const d = v.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img"><path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
${v.map((p, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5" fill="${color}"><title>${esc(p.x)}: ${p.y}</title></circle>`).join("")}
<text x="8" y="${h - 2}" class="ax">${esc(v[0].x)}</text><text x="${w - 8}" y="${h - 2}" class="ax" text-anchor="end">${esc(v[v.length - 1].x)}</text>
<text x="${w - 8}" y="14" class="ax" text-anchor="end">${hi.toLocaleString("en-US")}</text><text x="${w - 8}" y="${h - 22}" class="ax" text-anchor="end">${lo.toLocaleString("en-US")}</text></svg>`;
  }
  const hbars = (rows) => rows.length ? `<div class="bars">${rows.map(([k, v, max]) => `<div class="br"><span class="bk">${esc(k)}</span><span class="bt"><i style="width:${Math.max(2, 100 * v / max).toFixed(1)}%"></i></span><span class="bv">${fa(v)}</span></div>`).join("")}</div>` : _f("<p class=\"muted\">No data.</p>");
  async function dashboardHtml(env) {
    const acc = await ig(env);
    if (!acc) return _f("<p>No Instagram account found in Zernio.</p>");
    const [series, ps, dem, bt] = await Promise.all([followerSeries(env, acc, 90), posts(env, acc, 2),
      zernio(env, "GET", `/analytics/instagram/demographics?accountId=${acc._id}&metric=follower_demographics`), zernio(env, "GET", `/analytics/best-time?accountId=${acc._id}`)]);
    const sc = score(env, ps, series);
    const snaps = (await env.DB.prepare("SELECT * FROM snapshots ORDER BY date").all()).results;
    const followerPts = series.counts.length >= 2 ? series.counts.map((x) => ({ x: x.date, y: x.value })) : snaps.filter((s) => s.followers).map((s) => ({ x: s.date, y: s.followers }));
    const scorePts = snaps.filter((s) => s.score != null).map((s) => ({ x: s.date, y: s.score }));
    const g = series.gained.map((x) => x.value), g7 = g.slice(-7).reduce((a, b) => a + b, 0);
    const last = [...snaps].reverse().find((s) => s.views30) || {};
    const D = dem.data?.demographics || {}, top = (k, n = 6) => { const a = (D[k] || []).slice().sort((x, y) => y.value - x.value).slice(0, n); const mx = Math.max(1, ...a.map((x) => x.value)); return a.map((x) => [x.dimension, x.value, mx]); };
    const DN = [_("Monday"), _("Tuesday"), _("Wednesday"), _("Thursday"), _("Friday"), _("Saturday"), _("Sunday")];
    const slots = (bt.data?.slots || []).filter((s) => s.post_count > 0).sort((a, b) => b.avg_engagement - a.avg_engagement).slice(0, 5).map((s) => {
      const t = new Date(Date.UTC(2024, 0, 1 + s.day_of_week, s.hour)), lp = localParts(t, env), wd = (new Date(Date.UTC(lp.y, lp.m - 1, lp.d)).getUTCDay() + 6) % 7;
      return _f("<li>{0} at {1}:{2} · average engagement {3} ({4} posts)</li>", DN[wd], fa(pad(lp.H)), fa(pad(lp.M)), fa(Math.round(s.avg_engagement)), fa(s.post_count)); }).join("");
    const reels = ps.slice(0, 30), medV = median(reelsOnly(ps).map((p) => m(p).views));
    const rows = reels.map((p) => { const x = m(p); return `<tr><td>${fa(String(p.publishedAt).slice(0, 10))}</td><td class="hook">${p.platformPostUrl ? `<a href="${esc(p.platformPostUrl)}" target="_blank" rel="noopener">${esc(firstLine(p.content))}</a>` : esc(firstLine(p.content))}</td>
<td data-v="${n0(x.views)}" class="${medV && x.views > medV * 1.5 ? "hi" : medV && x.views < medV * .5 ? "lo" : ""}">${big(x.views)}</td><td data-v="${n0(x.savesK)}">${x.savesK != null ? dec(x.savesK) : "—"}</td><td data-v="${n0(x.sharesK)}">${x.sharesK != null ? dec(x.sharesK) : "—"}</td><td data-v="${n0(x.skip)}">${x.skip != null ? fa(Math.round(x.skip)) : "—"}</td><td data-v="${n0(x.watchPct)}">${x.watchPct != null ? fa(Math.round(x.watchPct)) : "—"}</td></tr>`; }).join("");
    const weak = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts), strong = [...weak].reverse();
    const brandName = env.BRAND_NAME || acc.username || "";
    return `<!doctype html><html lang="${lang()}" dir="${rtl() ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${_("Dashboard")} ${esc(brandName)}</title>
<meta name="robots" content="noindex"><style>
${fontBlack ? `@font-face{font-family:FB;src:url(data:font/woff2;base64,${fontBlack}) format("woff2")}` : ""}${fontSemi ? `@font-face{font-family:FS;src:url(data:font/woff2;base64,${fontSemi}) format("woff2")}` : ""}
:root{--bg:${env.STORY_BG || "#101418"};--ink:${env.STORY_INK || "#F2F0EA"};--accent:${env.STORY_ACCENT || "#E8B04B"};--muted:${env.STORY_MUTED || "#A9B0B8"};--card:color-mix(in srgb,var(--ink) 6%,var(--bg));--line:color-mix(in srgb,var(--ink) 14%,transparent);--good:#3FB97A;--bad:#E5484D}
@media (prefers-color-scheme: light){:root{--bg:#F6F5F1;--ink:#16181C;--card:#FFFFFF;--muted:#5D6470;--line:#E3E1DA}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 FS,Vazirmatn,Tahoma,sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font:28px/1.3 FB,FS,sans-serif;margin:4px 0}h2{font:18px/1.4 FB,FS,sans-serif;margin:0 0 10px}
.muted{color:var(--muted)}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.two{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}.kpi b{display:block;font:26px/1.2 FB,FS,sans-serif}.kpi span{color:var(--muted);font-size:13px}
.chart{width:100%;height:auto}.ax{fill:var(--muted);font-size:11px;direction:ltr}.bars .br{display:grid;grid-template-columns:110px 1fr 60px;gap:8px;align-items:center;margin:4px 0}
.bt{background:var(--line);border-radius:6px;height:10px;overflow:hidden}.bt i{display:block;height:100%;background:var(--accent);border-radius:6px}.bv{text-align:end;color:var(--muted)}
.score{font:46px/1 FB,FS,sans-serif;color:var(--accent)}ul{margin:6px 0;padding-inline-start:18px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:start;white-space:nowrap}th{cursor:pointer;color:var(--muted);font-weight:400}
td.hook{white-space:normal;min-width:180px}td.hi{color:var(--good);font-weight:700}td.lo{color:var(--bad)}a{color:inherit}.tw{overflow-x:auto}
</style></head><body><main>
<p class="muted">${esc(acc.username ? "@" + acc.username : "")} ${_("· updated:")} ${fa(localDate(env))} ${_("· source: Zernio (daily followers can be up to 24 hours old)")}</p>
<h1>${_("Dashboard")} ${esc(brandName)}</h1>
<div class="grid">
<div class="card kpi"><span>${_("Followers")}</span><b>${big(acc.followersCount)}</b></div>
<div class="card kpi"><span>${g.length && g.length < 7 ? fa(g.length) + _(" recent days") : _("Last 7 days")}</span><b>${g.length ? signed(g7) : "—"}</b></div>
<div class="card kpi"><span>${_("30-day views")}</span><b>${big(last.views30)}</b></div>
<div class="card kpi"><span>${_("30-day reach")}</span><b>${big(last.reach30)}</b></div>
<div class="card kpi"><span>${_("Page score")}</span><b>${sc.total != null ? fa(sc.total) + _(" / 100") : "—"}</b></div>
</div>
<div class="two">
<div class="card"><h2>${_("Followers")}</h2>${line(followerPts)}</div>
<div class="card"><h2>${_("Page score over time")}</h2>${line(scorePts)}</div>
</div>
<div class="two">
<div class="card"><h2>${_("Score, part by part")}</h2>${hbars(sc.parts.filter((p) => p.pts != null).map((p) => [p.short, p.pts, 20]))}
${sc.missing.length ? _f("<p class=\"muted\">No data yet: {0}</p>", sc.missing.join(listSep())) : ""}<p class="muted">${_("Each part against the page's own median: 10 means as before, 20 means twice as good.")}</p></div>
<div class="card"><h2>${_("Strengths and weaknesses")}</h2>${strong.length ? _f("<p>✅ <b>Strongest:</b> {0} ({1}/20)</p><p>⚠️ <b>Weakest:</b> {2} ({3}/20)</p>", esc(strong[0].label), fa(strong[0].pts), esc(weak[0].label), fa(weak[0].pts)) : _("<p class=muted>Not enough data.</p>")}
<p class="muted">${_("For a full audit with advice (bio, highlights, competitors, a two-week plan), type this in Claude Code:")} <b>/page-audit</b>.</p></div>
</div>
<div class="two">
<div class="card"><h2>${_("Followers' cities")}</h2>${hbars(top("city"))}</div>
<div class="card"><h2>${_("Followers' ages")}</h2>${hbars(top("age", 7))}</div>
</div>
<div class="card"><h2>${_("Best times (from your own posts, local time)")}</h2>${slots ? `<ul>${slots}</ul>` : _("<p class=muted>Not enough posts yet.</p>")}</div>
<div class="card"><h2>${_("Posts")}</h2><p class="muted">${_("Green: above 1.5× the median · Red: below half. Tap a column header to sort.")}</p><div class="tw"><table id="t"><thead><tr>
<th>${_("Date")}</th><th>${_("First line")}</th><th>${_("views")}</th><th>${_("Saves/1k")}</th><th>${_("Shares/1k")}</th><th>${_("Skip %")}</th><th>${_("Watch %")}</th></tr></thead><tbody>${rows}</tbody></table></div></div>
</main><script>
document.querySelectorAll("#t th").forEach((th,i)=>th.addEventListener("click",()=>{const tb=document.querySelector("#t tbody"),r=[...tb.rows],d=th.dataset.d=th.dataset.d==="1"?"0":"1";
r.sort((a,b)=>{const x=a.cells[i],y=b.cells[i],vx=x.dataset.v??x.textContent,vy=y.dataset.v??y.textContent;return (isNaN(vx)?String(vx).localeCompare(vy):vx-vy)*(d==="1"?-1:1)});r.forEach((x)=>tb.appendChild(x))}));
</script></body></html>`;
  }
  async function serveDashboard(env, req) {
    if (!env.INGEST_KEY || new URL(req.url).searchParams.get("k") !== await dashToken(env)) return new Response("forbidden", { status: 403 });
    return new Response(await dashboardHtml(env), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" } });
  }

  // ---------- cron entry: call every minute from scheduled() ----------
  async function tick(env, when) {
    const t = localParts(when, env), [H, M] = String(env.DAILY_REPORT_AT || "09:00").split(":").map(Number), today = localDate(env);
    const jobs = [];
    if (env.DAILY_REPORT_AT !== "off" && t.H === H && t.M === M && await kvGet(env, "daily:last") !== today)
      jobs.push(kvSet(env, "daily:last", today).then(() => dailyReport(env)));
    if (env.POST_REPORTS !== "off" && t.M === 17) jobs.push(checkPostReports(env));   // hourly, off the busy minutes
    return Promise.all(jobs);
  }

  return { dailyReport, checkPostReports, postReport, onZernioWebhook, registerWebhook, serveDashboard, dashLink, dashToken, score, tick };
}
