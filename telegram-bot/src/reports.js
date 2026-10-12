// reports.js · the page's numbers, delivered.
//   - a daily Telegram report (followers, trend, page score) at DAILY_REPORT_AT
//   - a report 24 h and 7 days after every post
//   - a monthly PDF report (day 1, for each page / client)
//   - competitors: public numbers of rival business accounts (Instagram business discovery via Zernio), weekly
//   - the inbox assistant: new comments and DMs arrive in the Studio bot with a suggested reply (✅ send / ✏️ / ❌)
//   - private dashboards: /dashboard (owner; in agency mode an overview of every client) and /c/<token> (one client)
//   - Zernio webhooks (post published or failed, account disconnected, comment and message received)
// AGENCY="on": every client is a Zernio profile; reports go to the owner and, when the client linked their Telegram, to them.
// Mechanics only, no personal data. Data comes from Zernio and the bot's own snapshots; nothing here is estimated.

import { _, _f, lang, rtl, listSep, grouped, dec as idec } from "./i18n.js";

export function makeReports({ zernio, say, sendTo, sendDoc, gemini, pdf, fa, esc, localParts, fontBlack = "", fontSemi = "", prompts = {} }) {
  // ---------- small helpers ----------
  const kvGet = async (env, k) => (await env.DB.prepare("SELECT v FROM kv WHERE k=?").bind(k).first())?.v ?? null;
  const kvSet = (env, k, v) => env.DB.prepare("INSERT OR REPLACE INTO kv (k, v, updated_at) VALUES (?, ?, datetime('now'))").bind(k, String(v)).run();
  const pad = (n) => String(n).padStart(2, "0");
  const localDate = (env, offsetDays = 0) => { const t = localParts(new Date(Date.now() + offsetDays * 864e5), env); return `${t.y}-${pad(t.m)}-${pad(t.d)}`; };
  const median = (a) => { const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const avg = (a) => { const s = a.filter(Number.isFinite); return s.length ? s.reduce((x, y) => x + y, 0) / s.length : null; };
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
  const rnd = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const norm = (s) => String(s || "").toLowerCase().replace(/[\s.!،,؟?«»"'#@]/g, "");

  // ---------- accounts, clients, targets ----------
  const agency = (env) => env.AGENCY === "on";
  const profileOf = (a) => a?.profileId?._id || a?.profileId || null;
  async function accountsList(env) { return (await zernio(env, "GET", "/accounts")).data?.accounts || []; }
  async function ig(env) { return (await accountsList(env)).find((x) => x.platform === "instagram") || null; }
  const clientsAll = async (env) => (await env.DB.prepare("SELECT * FROM clients ORDER BY id").all()).results;
  const clientById = (env, id) => env.DB.prepare("SELECT * FROM clients WHERE id=?").bind(id).first();
  // a target = one Instagram account to report on: { acc, client (row or null), label }
  async function targets(env) {
    const list = await accountsList(env);
    if (!agency(env)) { const acc = list.find((x) => x.platform === "instagram"); return acc ? [{ acc, client: null, label: "" }] : []; }
    return (await clientsAll(env)).map((c) => ({ client: c, label: c.name, acc: list.find((a) => a.platform === "instagram" && profileOf(a) === c.profile_id) || null })).filter((t) => t.acc);
  }
  async function targetFor(env, clientId) {
    const all = await targets(env);
    return clientId ? all.find((t) => t.client?.id === +clientId) || null : all[0] || null;
  }
  // owner always; the client's own Telegram (via the publisher bot) when they linked it and their reports are on
  async function deliver(env, t, text, buttons = []) {
    const extra = buttons.length ? { reply_markup: { inline_keyboard: [buttons] } } : {};
    await say(env, (t.label ? `👤 <b>${esc(t.label)}</b>\n` : "") + text, extra);
    if (t.client?.chat_id && t.client.reports) await sendTo(env, t.client.chat_id, text, extra);
  }

  // ---------- Zernio reads ----------
  async function followerSeries(env, acc, days = 60, until = null) {
    days = Math.min(days, 85);   // Zernio: "Date range cannot exceed 88 days"
    const to = until || localDate(env), from = new Date(Date.parse(to) - days * 864e5).toISOString().slice(0, 10);
    const r = await zernio(env, "GET", `/analytics/instagram/follower-history?accountId=${acc._id}&metricType=time_series&since=${from}&until=${to}`);
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

  // ---------- snapshots (one row per day and account; the single-page bot also keeps the original table) ----------
  async function saveSnap(env, t, row) {
    await env.DB.prepare("INSERT OR REPLACE INTO acct_snapshots (date, account_id, followers, views30, reach30, engaged30, interactions30, score) VALUES (?,?,?,?,?,?,?,?)")
      .bind(row.date, t.acc._id, row.followers, row.views30, row.reach30, row.engaged30, row.interactions30, row.score).run();
    if (!t.client) await env.DB.prepare("INSERT OR REPLACE INTO snapshots (date, followers, views30, reach30, engaged30, interactions30, score) VALUES (?,?,?,?,?,?,?)")
      .bind(row.date, row.followers, row.views30, row.reach30, row.engaged30, row.interactions30, row.score).run();
  }
  async function snaps(env, t) {
    const a = (await env.DB.prepare("SELECT * FROM acct_snapshots WHERE account_id=? ORDER BY date").bind(t.acc._id).all()).results;
    if (a.length || t.client) return a;
    return (await env.DB.prepare("SELECT * FROM snapshots ORDER BY date").all()).results;
  }

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
  async function buildDaily(env, t) {
    const acc = t.acc;
    const [series, ps, ins] = await Promise.all([followerSeries(env, acc, 45), posts(env, acc, 2), zernio(env, "GET", `/analytics/instagram/account-insights?accountId=${acc._id}`)]);
    const yday = localDate(env, -1), gIdx = series.gained.findIndex((x) => x.date === yday);
    const gDay = gIdx >= 0 ? series.gained[gIdx] : series.gained[series.gained.length - 1];
    const lDay = series.lost.find((x) => x.date === gDay?.date);
    const g = series.gained.map((x) => x.value), sum = (a) => a.reduce((x, y) => x + y, 0);
    const g7 = sum(g.slice(-7)), p7 = g.length >= 14 ? sum(g.slice(-14, -7)) : null;
    const counts = series.counts.slice(-14).map((x) => x.value);
    const met = ins.data?.metrics || {}, views30 = met.views?.total ?? null, reach30 = met.reach?.total ?? null;
    const hist = await snaps(env, t), today = localDate(env);
    const weekAgo = [...hist].reverse().find((s) => s.date <= localDate(env, -7) && s.views30 != null);
    const prev = [...hist].reverse().find((s) => s.date < today && s.score != null);
    const sc = score(env, ps, series);
    await saveSnap(env, t, { date: today, followers: acc.followersCount ?? null, views30, reach30, engaged30: met.accounts_engaged?.total ?? null, interactions30: met.total_interactions?.total ?? null, score: sc.total });
    const week = ps.filter((p) => hoursSince(p.publishedAt) <= 7 * 24);
    const best = [...week].sort((a, b) => n0(m(b).views) - n0(m(a).views))[0];
    const L = [_f("📊 <b>Daily report</b> · {0}", fa(today)), ""];
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
    const delta = gDay ? gDay.value - n0(lDay?.value) : null;
    return { text: L.join("\n").slice(0, 3900), score: sc.total, prevScore: prev?.score ?? null, followers: acc.followersCount, delta, best };
  }
  async function dailyReportFor(env, t) {
    const d = await buildDaily(env, t), url = await dashLink(env, t.client);
    await deliver(env, t, d.text, url ? [{ text: _("📊 Full dashboard"), url }] : []);
    return d;
  }
  // single page: the full report. Agency: every client's report goes to that client (if linked) and the owner gets one summary.
  async function dailyReport(env, clientId = null) {
    if (!agency(env) || clientId) {
      const t = await targetFor(env, clientId);
      if (!t) return say(env, _("📊 Daily report: no Instagram account found in Zernio (maybe disconnected; reconnect it in Zernio)."));
      if (agency(env)) { const d = await buildDaily(env, t), url = await dashLink(env, t.client); return say(env, `👤 <b>${esc(t.label)}</b>\n${d.text}`, url ? { reply_markup: { inline_keyboard: [[{ text: _("📊 Full dashboard"), url }]] } } : {}); }
      return dailyReportFor(env, t);
    }
    const ts = await targets(env);
    if (!ts.length) return say(env, _("📊 Agency report: no client with an Instagram account yet. Add one with «👥 Clients»."));
    const lines = [_f("📊 <b>Agency report</b> · {0}", fa(localDate(env))), ""], kb = [];
    for (const t of ts) {
      try {
        const d = await buildDaily(env, t);
        if (t.client.chat_id && t.client.reports) { const url = await dashLink(env, t.client); await sendTo(env, t.client.chat_id, d.text, url ? { reply_markup: { inline_keyboard: [[{ text: _("📊 Full dashboard"), url }]] } } : {}); }
        lines.push(_f("👤 <b>{0}</b> · {1} {2} · {3}", esc(t.label), big(d.followers), d.delta != null ? `(${signed(d.delta)})` : "", d.score != null ? _f("score {0}{1}", fa(d.score), d.prevScore != null ? ` ${d.score >= d.prevScore ? "▲" : "▼"}${fa(Math.abs(d.score - d.prevScore))}` : "") : _("score —")));
        if (d.best) lines.push(_f("   ⭐ «{0}» · {1} views", esc(firstLine(d.best.content)).slice(0, 40), big(m(d.best).views)));
        kb.push([{ text: _f("📈 {0}", t.label).slice(0, 40), callback_data: `cl:daily:${t.client.id}` }, ...(await dashLink(env, t.client) ? [{ text: _("📊 Dashboard"), url: await dashLink(env, t.client) }] : [])]);
      } catch (e) { lines.push(_f("👤 <b>{0}</b> · ⚠️ {1}", esc(t.label), esc(String(e.message || e).slice(0, 80)))); }
    }
    const url = await dashLink(env);
    if (url) kb.push([{ text: _("📊 Agency dashboard"), url }]);
    return say(env, lines.join("\n").slice(0, 4000), { reply_markup: { inline_keyboard: kb } });
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
  async function postReport(env, p, hours, ps, series, t = { client: null, label: "" }) {
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
    const day = (o) => { const tt = localParts(new Date(Date.parse(p.publishedAt) + o * 864e5), env); return `${tt.y}-${pad(tt.m)}-${pad(tt.d)}`; };
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
        if (lo[0] === _("Viewer retention") || lo[0] === _("watch %")) L.push(_("   ← Make the first seconds stronger: show the result from frame one."));
        else if (lo[0] === _("saves")) L.push(_("   ← Give something worth keeping (a list, prices, a guide) and say «save it»."));
        else if (lo[0] === _("shares")) L.push(_("   ← Say who to send it to («send it to someone who…»)."));
        else if (lo[0] === _("views")) L.push(_("   ← Was the topic close to the viewer? Compare the first-second hook with your most-viewed reels."));
      }
    }
    if (x.updated) L.push(_f("<i>Zernio stats: {0} UTC</i>", esc(String(x.updated).slice(0, 16))));
    const url = await dashLink(env, t.client);
    await deliver(env, t, L.join("\n").slice(0, 3900), [...(p.platformPostUrl ? [{ text: _("▶️ Post"), url: p.platformPostUrl }] : []), ...(url ? [{ text: _("📊 Dashboard"), url }] : [])]);
    if (hours < 160) await kvSet(env, `rep24v:${p._id}`, n0(x.views));
  }
  // hourly: every post gets one report at 24 h and one at 7 days. On the first run, older posts are marked done silently.
  async function checkPostReports(env) {
    const init = await kvGet(env, "rep:init");
    for (const t of await targets(env)) {
      const ps = await posts(env, t.acc, 1);
      let series = null;
      for (const p of ps) {
        const h = hoursSince(p.publishedAt);
        for (const [mark, at, until] of [["rep24", 24, 6 * 24], ["rep168", 7 * 24, 10 * 24]]) {
          if (h < at || h > until || await kvGet(env, `${mark}:${p._id}`)) continue;
          await kvSet(env, `${mark}:${p._id}`, new Date().toISOString());
          if (!init) continue;
          series = series || await followerSeries(env, t.acc, 30);
          await postReport(env, p, at, ps, series, t);
        }
      }
    }
    if (!init) await kvSet(env, "rep:init", new Date().toISOString());
  }

  // ---------- monthly PDF report (day 1 at DAILY_REPORT_AT, for the month that just ended; on demand from the bot) ----------
  function lastMonth(env) {
    const t = localParts(new Date(), env), y = t.m === 1 ? t.y - 1 : t.y, mo = t.m === 1 ? 12 : t.m - 1;
    const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    return { y, mo, from: `${y}-${pad(mo)}-01`, to: `${y}-${pad(mo)}-${pad(days)}`, label: `${y}-${pad(mo)}` };
  }
  async function monthlyHtml(env, t) {
    const mo = lastMonth(env), acc = t.acc;
    const [series, ps, ins, dem] = await Promise.all([followerSeries(env, acc, 40, mo.to), posts(env, acc, 3),
      zernio(env, "GET", `/analytics/instagram/account-insights?accountId=${acc._id}&since=${mo.from}&until=${mo.to}`),
      zernio(env, "GET", `/analytics/instagram/demographics?accountId=${acc._id}&metric=follower_demographics`)]);
    const inMonth = ps.filter((p) => { const d = String(p.publishedAt).slice(0, 10); return d >= mo.from && d <= mo.to; });
    const counts = series.counts.filter((x) => x.date >= mo.from && x.date <= mo.to), gained = series.gained.filter((x) => x.date >= mo.from && x.date <= mo.to);
    const lost = series.lost.filter((x) => x.date >= mo.from && x.date <= mo.to);
    const start = counts[0]?.value ?? null, end = counts[counts.length - 1]?.value ?? acc.followersCount ?? null;
    const gIn = gained.reduce((a, b) => a + b.value, 0), lOut = lost.reduce((a, b) => a + b.value, 0);
    const met = ins.data?.metrics || {}, top = [...inMonth].sort((a, b) => n0(m(b).views) - n0(m(a).views)).slice(0, 5);
    const sc = score(env, ps, series), weak = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts)[0];
    const D = dem.data?.demographics || {}, cities = (D.city || []).slice().sort((a, b) => b.value - a.value).slice(0, 5);
    const hist = (await snaps(env, t)).filter((s) => s.date >= mo.from && s.date <= mo.to && s.score != null);
    const name = t.client?.name || env.BRAND_NAME || acc.username || "";
    const AC = t.client?.accent || env.STORY_ACCENT || "#E8B04B", BG = "#FFFFFF", INK = "#16181C";
    const kpi = (k, v) => `<div class="k"><span>${k}</span><b>${v}</b></div>`;
    const sparkSvg = (vals) => { const v = vals.filter(Number.isFinite); if (v.length < 2) return ""; const lo = Math.min(...v), hi = Math.max(...v), W = 640, H = 120;
      const d = v.map((y, i) => `${i ? "L" : "M"}${(i * (W - 10) / (v.length - 1) + 5).toFixed(1)},${(H - 10 - (hi === lo ? .5 : (y - lo) / (hi - lo)) * (H - 20)).toFixed(1)}`).join("");
      return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><path d="${d}" fill="none" stroke="${AC}" stroke-width="3"/></svg>`; };
    return `<!doctype html><html lang="${lang()}" dir="${rtl() ? "rtl" : "ltr"}"><head><meta charset="utf-8"><style>
${fontBlack ? `@font-face{font-family:FB;src:url(data:font/woff2;base64,${fontBlack}) format("woff2")}` : ""}${fontSemi ? `@font-face{font-family:FS;src:url(data:font/woff2;base64,${fontSemi}) format("woff2")}` : ""}
@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;font:12.5px/1.6 FS,Vazirmatn,Helvetica,Arial,sans-serif;color:${INK};background:${BG}}
h1{font:30px/1.2 FB,FS,sans-serif;margin:0}h2{font:16px/1.3 FB,FS,sans-serif;margin:22px 0 8px;padding-bottom:4px;border-bottom:2px solid ${AC}}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:6px solid ${AC};padding-bottom:10px}.muted{color:#5D6470}
.ks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.k{border:1px solid #E3E1DA;border-radius:10px;padding:8px 10px}.k span{display:block;color:#5D6470;font-size:11px}.k b{font:20px/1.2 FB,FS,sans-serif}
table{width:100%;border-collapse:collapse}td,th{padding:6px 4px;border-bottom:1px solid #E3E1DA;text-align:start;vertical-align:top}th{color:#5D6470;font-weight:400}
.note{background:color-mix(in srgb,${AC} 12%,#fff);border-radius:10px;padding:10px 12px}
</style></head><body>
<div class="top"><div><h1>${esc(name)}</h1><div class="muted">${esc(acc.username ? "@" + acc.username : "")}</div></div><div style="text-align:end"><b>${_("Monthly report")}</b><br><span class="muted">${fa(mo.label)}</span></div></div>
<h2>${_("The month in numbers")}</h2>
<div class="ks">${kpi(_("Followers at the end"), big(end))}${kpi(_("New followers"), start != null && end != null ? signed(end - start) : gained.length ? signed(gIn - lOut) : "—")}${kpi(_("Gained / lost"), gained.length ? `+${fa(gIn)} / −${fa(lOut)}` : "—")}
${kpi(_("Views"), big(met.views?.total ?? null))}${kpi(_("Reach"), big(met.reach?.total ?? null))}${kpi(_("Posts"), fa(inMonth.length))}</div>
${counts.length >= 2 ? `<h2>${_("Followers through the month")}</h2>${sparkSvg(counts.map((x) => x.value))}` : ""}
<h2>${_("Top posts")}</h2>${top.length ? `<table><tr><th>${_("Date")}</th><th>${_("First line")}</th><th>${_("views")}</th><th>${_("saves")}</th><th>${_("shares")}</th></tr>
${top.map((p) => `<tr><td>${fa(String(p.publishedAt).slice(0, 10))}</td><td>${esc(firstLine(p.content))}</td><td>${big(m(p).views)}</td><td>${big(m(p).saves)}</td><td>${big(m(p).shares)}</td></tr>`).join("")}</table>` : `<p class="muted">${_("No posts this month.")}</p>`}
<h2>${_("Page score")}</h2><p><b style="font:22px FB,FS,sans-serif;color:${AC}">${sc.total != null ? fa(sc.total) + _(" / 100") : "—"}</b> ${hist.length >= 2 ? `<span class="muted">(${fa(hist[0].score)} → ${fa(hist[hist.length - 1].score)})</span>` : ""}</p>
${sc.parts.filter((p) => p.pts != null).map((p) => `<div>${esc(p.label)}: <b>${fa(p.pts)}/20</b></div>`).join("")}
${cities.length ? `<h2>${_("Followers' cities")}</h2>${cities.map((c) => `<div>${esc(c.dimension)}: ${fa(c.value)}</div>`).join("")}` : ""}
<h2>${_("Focus for next month")}</h2><div class="note">${weak ? _f("Strengthen «{0}». {1}", esc(weak.short), esc(advice(weak.key))) : _("Keep posting on the planned days; the score needs a few more weeks of data.")}</div>
<p class="muted" style="margin-top:18px">${_("Source: Zernio (Instagram data). Generated by Reel Studio.")}</p>
</body></html>`;
  }
  const advice = (key) => ({
    growth: _("Close every reel with a clear reason to follow and post on the best days."),
    reach: _("Lead with the result in the first second and pick topics close to the viewer."),
    value: _("Give something worth keeping (a list, prices, a guide) and ask people to save and send it."),
    retention: _("Cut the first two seconds harder: no greeting, show the payoff on frame one."),
    consistency: _("Batch-film once a week so every planned day has a reel ready."),
  }[key] || "");
  async function monthlyReport(env, clientId = null) {
    const ts = clientId ? [await targetFor(env, clientId)].filter(Boolean) : await targets(env);
    for (const t of ts) {
      const html = await monthlyHtml(env, t), bytes = await pdf(env, html), mo = lastMonth(env);
      const fname = `${(t.client?.name || env.BRAND_NAME || "report").replace(/[^\w؀-ۿ-]+/g, "-")}-${mo.label}.pdf`;
      const cap = _f("📄 Monthly report {0}{1}", fa(mo.label), t.label ? ` · ${t.label}` : "");
      await sendDoc(env, env.OWNER_ID, bytes, fname, cap, false);
      if (t.client?.chat_id && t.client.monthly) await sendDoc(env, t.client.chat_id, bytes, fname, cap, true);
    }
  }

  // ---------- competitors (Instagram business discovery: public numbers of business/creator accounts) ----------
  const competitorsOf = async (env, clientId) => (await env.DB.prepare("SELECT * FROM competitors WHERE IFNULL(client_id,0)=? ORDER BY id").bind(+clientId || 0).all()).results;
  async function discover(env, acc, username) {
    const r = await zernio(env, "GET", `/accounts/${acc._id}/instagram/business-discovery?username=${encodeURIComponent(username.replace(/^@/, ""))}&limit=12`);
    if (!r.ok || !r.data?.profile) return null;
    const media = r.data.media || [], since7 = Date.now() - 7 * 864e5, since30 = Date.now() - 30 * 864e5;
    return { username: r.data.profile.username, name: r.data.profile.name, followers: r.data.profile.followersCount ?? null, mediaCount: r.data.profile.mediaCount ?? null,
      avgLikes: avg(media.map((x) => x.likeCount)), avgComments: avg(media.map((x) => x.commentsCount)),
      posts7: media.filter((x) => Date.parse(x.timestamp) >= since7).length, posts30: media.filter((x) => Date.parse(x.timestamp) >= since30).length,
      top: [...media].sort((a, b) => n0(b.likeCount) - n0(a.likeCount))[0] || null };
  }
  async function addCompetitor(env, clientId, username) {
    const t = await targetFor(env, clientId);
    if (!t) return { ok: false, msg: _("No Instagram account found in Zernio.") };
    const d = await discover(env, t.acc, username);
    if (!d) return { ok: false, msg: _f("@{0} was not found, or it is not a business/creator account (only those are public to the API).", esc(username.replace(/^@/, ""))) };
    await env.DB.prepare("INSERT OR IGNORE INTO competitors (client_id, username) VALUES (?, ?)").bind(+clientId || 0, d.username).run();
    const c = await env.DB.prepare("SELECT * FROM competitors WHERE IFNULL(client_id,0)=? AND username=?").bind(+clientId || 0, d.username).first();
    await saveCompStat(env, c.id, d);
    return { ok: true, msg: _f("🥊 Added @{0}: {1} followers, {2} posts, ~{3} likes per post.", esc(d.username), big(d.followers), big(d.mediaCount), big(Math.round(n0(d.avgLikes)))) };
  }
  const saveCompStat = (env, id, d) => env.DB.prepare("INSERT OR REPLACE INTO competitor_stats (date, competitor_id, followers, media_count, avg_likes, avg_comments, posts_7d, posts_30d) VALUES (?,?,?,?,?,?,?,?)")
    .bind(new Date().toISOString().slice(0, 10), id, d.followers, d.mediaCount, d.avgLikes, d.avgComments, d.posts7, d.posts30).run();
  async function competitorsReport(env, clientId = null, { silentIfNone = false } = {}) {
    const t = await targetFor(env, clientId); if (!t) return;
    const list = await competitorsOf(env, clientId);
    if (!list.length) { if (!silentIfNone) await say(env, _("🥊 No competitors yet. Tap «➕ Add competitor» and send their @username.")); return; }
    const own = await posts(env, t.acc, 1), recent = own.slice(0, 12);
    const me = { followers: t.acc.followersCount, avgLikes: avg(recent.map((p) => m(p).likes)), avgComments: avg(recent.map((p) => m(p).comments)),
      posts7: own.filter((p) => hoursSince(p.publishedAt) <= 168).length };
    const L = [_f("🥊 <b>Competitors</b> · {0}", fa(localDate(env))), "", _f("<b>You</b> · {0} followers · {1} posts/week · ~{2} likes · ~{3} comments", big(me.followers), fa(me.posts7), big(Math.round(n0(me.avgLikes))), big(Math.round(n0(me.avgComments)))), ""];
    for (const c of list) {
      const d = await discover(env, t.acc, c.username).catch(() => null);
      if (!d) { L.push(_f("@{0} · ⚠️ not available now", esc(c.username))); continue; }
      const old = await env.DB.prepare("SELECT * FROM competitor_stats WHERE competitor_id=? AND date<=? ORDER BY date DESC LIMIT 1").bind(c.id, new Date(Date.now() - 6.5 * 864e5).toISOString().slice(0, 10)).first();
      await saveCompStat(env, c.id, d);
      L.push(_f("@{0} · {1} followers{2} · {3} posts/week · ~{4} likes · ~{5} comments", esc(d.username), big(d.followers), old?.followers != null ? ` (${signed(d.followers - old.followers)} ${_("in 7 days")})` : "", fa(d.posts7), big(Math.round(n0(d.avgLikes))), big(Math.round(n0(d.avgComments)))));
      if (d.top?.permalink) L.push(_f("   ⭐ their top recent post: {0} likes · {1}", big(d.top.likeCount), esc(d.top.permalink)));
    }
    const lead = list.length ? "" : "";
    await deliver(env, t, L.join("\n").slice(0, 3900) + lead);
  }

  // ---------- inbox assistant: comments and DMs → a suggested reply → ✅ send from the Studio bot ----------
  async function gateWords(env) {
    const cached = await kvGet(env, "gatewords"), at = Number(await kvGet(env, "gatewords:at") || 0);
    if (cached && Date.now() - at < 36e5) return JSON.parse(cached);
    const w = new Set((await env.DB.prepare("SELECT gate FROM packages WHERE gate IS NOT NULL").all()).results.map((r) => norm(r.gate)));
    const a = await zernio(env, "GET", "/comment-automations?limit=100");
    for (const x of a.data?.automations || []) for (const k of x.keywords || []) w.add(norm(k));
    const arr = [...w].filter(Boolean); await kvSet(env, "gatewords", JSON.stringify(arr)); await kvSet(env, "gatewords:at", Date.now());
    return arr;
  }
  async function clientOfAccount(env, accId) {
    if (!agency(env) || !accId) return null;
    const a = (await accountsList(env)).find((x) => x._id === accId);
    return a ? (await env.DB.prepare("SELECT * FROM clients WHERE profile_id=?").bind(profileOf(a)).first()) : null;
  }
  async function inboxIngest(env, e) {
    if (env.INBOX_ASSIST === "off") return;
    if (e.event === "comment.received") {
      const c = e.comment || {};
      if (c.author?.isOwnAccount || !c.text) return;
      if ((await gateWords(env)).includes(norm(c.text))) return;   // gate words are answered by the DM automation
      const accId = e.account?.accountId || e.account?.id || null, cl = await clientOfAccount(env, accId);
      await env.DB.prepare("INSERT OR IGNORE INTO inbox (ev, kind, account_id, client_id, post_id, comment_id, author, text, post_text, permalink) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .bind(e.id, "comment", accId, cl?.id || null, c.postId || c.platformPostId || e.post?.id || e.post?.platformPostId || null, c.id, c.author?.username || c.author?.name || "", c.text, e.post?.content || "", e.post?.permalink || "").run();
    } else if (e.event === "message.received") {
      const msg = e.message || {};
      if (msg.direction && msg.direction !== "incoming") return;
      if (msg.automationId || !msg.text) return;
      const accId = e.account?.accountId || e.account?.id || null, cl = await clientOfAccount(env, accId);
      await env.DB.prepare("INSERT OR IGNORE INTO inbox (ev, kind, account_id, client_id, conversation_id, author, text) VALUES (?,?,?,?,?,?,?)")
        .bind(e.id, "dm", accId, cl?.id || null, msg.conversationId || e.conversation?.id, e.conversation?.participantUsername || msg.sender?.username || msg.sender?.name || "", msg.text).run();
    }
  }
  const inboxCard = (r, clientName) => {
    const head = r.kind === "dm" ? _f("✉️ <b>New DM</b> from @{0}", esc(r.author)) : _f("💬 <b>New comment</b> from @{0}", esc(r.author));
    return [clientName ? `👤 <b>${esc(clientName)}</b>` : null, head, r.post_text ? `<i>«${esc(firstLine(r.post_text)).slice(0, 80)}»</i>` : null, "", `“${esc(r.text).slice(0, 900)}”`, "",
      r.reply ? _f("✏️ <b>Your reply</b>:\n{0}", esc(r.reply)) : r.suggestion ? _f("🤖 <b>Suggested reply</b>:\n{0}", esc(r.suggestion)) : _("🤖 No suggestion (add GEMINI_API_KEY); tap ✏️ to write a reply.")].filter((x) => x != null).join("\n");
  };
  const inboxKb = (r) => ({ inline_keyboard: [[...(r.reply || r.suggestion ? [{ text: _("✅ Send"), callback_data: `ib:send:${r.id}` }] : []), { text: _("✏️ Write my own"), callback_data: `ib:edit:${r.id}` }, { text: _("❌ Ignore"), callback_data: `ib:no:${r.id}` }],
    ...(r.permalink ? [[{ text: _("▶️ Post"), url: r.permalink }]] : [])] });
  async function processInbox(env) {
    const rows = (await env.DB.prepare("SELECT * FROM inbox WHERE status='new' ORDER BY id LIMIT 3").all()).results;
    for (const r of rows) {
      const claim = await env.DB.prepare("UPDATE inbox SET status='work' WHERE id=? AND status='new'").bind(r.id).run();
      if (!claim.meta?.changes) continue;
      let suggestion = null;
      const cl = r.client_id ? await clientById(env, r.client_id) : null;
      // agency: the client's own name, handle, voice and facts, never the agency's
      const as = cl ? { ...env, BRAND_NAME: cl.name, IG_HANDLE: cl.handle || "", BRAND_VOICE: cl.voice || "", BUSINESS_FACTS: cl.facts || "", CREATOR_NAME: cl.name, AUDIENCE: cl.name } : env;
      if (env.GEMINI_API_KEY && prompts.REPLY_PROMPT) {
        try { suggestion = (await gemini(env, prompts.REPLY_PROMPT(as, { kind: r.kind, text: r.text, from: r.author, post: r.post_text }))).text.replace(/^["“«]|["”»]$/g, "").trim().slice(0, 900); } catch (e) { suggestion = null; }
      }
      await env.DB.prepare("UPDATE inbox SET suggestion=?, status='carded' WHERE id=?").bind(suggestion, r.id).run();
      const r2 = { ...r, suggestion };
      await say(env, inboxCard(r2, cl?.name), { reply_markup: inboxKb(r2) });
    }
  }
  async function inboxSend(env, id, text = null) {
    const r = await env.DB.prepare("SELECT * FROM inbox WHERE id=?").bind(id).first();
    if (!r) return { ok: false, msg: _("Not found.") };
    if (r.status === "sent") return { ok: false, msg: _("Already answered.") };
    const reply = text || r.reply || r.suggestion;
    if (!reply) return { ok: false, msg: _("No text.") };
    const res = r.kind === "dm"
      ? await zernio(env, "POST", `/inbox/conversations/${encodeURIComponent(r.conversation_id)}/messages`, { accountId: r.account_id, message: reply })
      : await zernio(env, "POST", `/inbox/comments/${encodeURIComponent(r.post_id)}`, { accountId: r.account_id, message: reply, commentId: r.comment_id });
    if (!res.ok) return { ok: false, msg: _f("Zernio error ({0}): {1}", res.status, esc(JSON.stringify(res.data).slice(0, 200))) };
    await env.DB.prepare("UPDATE inbox SET reply=?, status='sent' WHERE id=?").bind(reply, id).run();
    return { ok: true, msg: _("✅ Reply sent.") };
  }
  async function inboxSetReply(env, id, text) { await env.DB.prepare("UPDATE inbox SET reply=? WHERE id=?").bind(text, id).run(); const r = await env.DB.prepare("SELECT * FROM inbox WHERE id=?").bind(id).first(); return { text: inboxCard(r, r.client_id ? (await clientById(env, r.client_id))?.name : null), kb: inboxKb(r) }; }
  async function inboxShow(env, id) { const r = await env.DB.prepare("SELECT * FROM inbox WHERE id=?").bind(id).first(); return r ? { text: inboxCard(r, r.client_id ? (await clientById(env, r.client_id))?.name : null), kb: r.status === "sent" ? { inline_keyboard: [] } : inboxKb(r) } : null; }
  async function inboxIgnore(env, id) { await env.DB.prepare("UPDATE inbox SET status='ignored' WHERE id=?").bind(id).run(); }

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
    const cl = await clientOfAccount(env, e.account?.accountId || e.account?.id || e.post?.accountId).catch(() => null), who = cl ? `👤 <b>${esc(cl.name)}</b>\n` : "";
    if (e.event === "account.disconnected") await say(env, who + _f("🚨 <b>The {0} account was disconnected from Zernio</b>{1}.\nUntil you reconnect it nothing gets published and no stats arrive: Zernio → Accounts → Reconnect.", esc(e.account?.platform || ""), e.account?.username ? " (" + esc(e.account.username) + ")" : ""));
    else if (e.event === "post.platform.failed") await say(env, who + _f("⚠️ Publishing on {0} failed: {1}", esc(e.platform || e.post?.platform || ""), esc(String(e.error || e.post?.error || "").slice(0, 200))));
    else if (e.event === "post.platform.published" || e.event === "post.external.created") {
      const url = e.platformPostUrl || e.post?.platformPostUrl || (e.post?.platforms || []).find((x) => x.platformPostUrl)?.platformPostUrl || "";
      await say(env, who + _f("✅ Published{0}\nIts 24-hour report arrives tomorrow at this time.", url ? ": " + esc(url) : ""));
    } else if (e.event === "comment.received" || e.event === "message.received") await inboxIngest(env, { ...e, id: id || e.id });
    return new Response("ok");
  }
  const WEBHOOK_EVENTS = ["post.platform.published", "post.platform.failed", "post.external.created", "account.disconnected", "comment.received", "message.received"];
  async function registerWebhook(env, origin) {
    if (!env.ZERNIO_API_KEY || !env.WEBHOOK_SECRET) return "skipped (no ZERNIO_API_KEY or WEBHOOK_SECRET)";
    const url = `${origin}/zernio/webhook?k=${await webhookToken(env)}`;
    const cur = await zernio(env, "GET", "/webhooks/settings");
    const list = cur.data?.webhooks || cur.data?.data || (Array.isArray(cur.data) ? cur.data : []);
    const mine = list.find((w) => (w.url || "").startsWith(origin + "/zernio/webhook"));
    if (mine) {
      if (WEBHOOK_EVENTS.every((ev) => (mine.events || []).includes(ev))) return "already registered";
      const r = await zernio(env, "PUT", "/webhooks/settings", { _id: mine._id, id: mine._id, name: mine.name || "reel-studio-bot", url, secret: env.WEBHOOK_SECRET, events: WEBHOOK_EVENTS });
      return r.ok ? "updated" : `update failed ${r.status}`;
    }
    const r = await zernio(env, "POST", "/webhooks/settings", { name: "reel-studio-bot", url, secret: env.WEBHOOK_SECRET, events: WEBHOOK_EVENTS });
    return r.ok ? "registered" : `failed ${r.status}`;
  }

  // ---------- dashboards: /dashboard (owner; agency overview) and /c/<token> (one client) ----------
  async function dashToken(env) {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode((env.INGEST_KEY || "") + ":dashboard"));
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
  }
  async function dashLink(env, client = null) {
    const origin = await kvGet(env, "origin");
    if (!origin) return null;
    if (client) return `${origin}/c/${client.token}`;
    return env.INGEST_KEY ? `${origin}/dashboard?k=${await dashToken(env)}` : null;
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
  const page = (env, title, body, accent) => `<!doctype html><html lang="${lang()}" dir="${rtl() ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="robots" content="noindex"><style>
${fontBlack ? `@font-face{font-family:FB;src:url(data:font/woff2;base64,${fontBlack}) format("woff2")}` : ""}${fontSemi ? `@font-face{font-family:FS;src:url(data:font/woff2;base64,${fontSemi}) format("woff2")}` : ""}
:root{--bg:${env.STORY_BG || "#101418"};--ink:${env.STORY_INK || "#F2F0EA"};--accent:${accent || env.STORY_ACCENT || "#E8B04B"};--muted:${env.STORY_MUTED || "#A9B0B8"};--card:color-mix(in srgb,var(--ink) 6%,var(--bg));--line:color-mix(in srgb,var(--ink) 14%,transparent);--good:#3FB97A;--bad:#E5484D}
@media (prefers-color-scheme: light){:root{--bg:#F6F5F1;--ink:#16181C;--card:#FFFFFF;--muted:#5D6470;--line:#E3E1DA}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 FS,Vazirmatn,system-ui,Tahoma,sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font:28px/1.3 FB,FS,sans-serif;margin:4px 0}h2{font:18px/1.4 FB,FS,sans-serif;margin:0 0 10px}
.muted{color:var(--muted)}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.two{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}.kpi b{display:block;font:26px/1.2 FB,FS,sans-serif}.kpi span{color:var(--muted);font-size:13px}
.chart{width:100%;height:auto}.ax{fill:var(--muted);font-size:11px;direction:ltr}.bars .br{display:grid;grid-template-columns:110px 1fr 60px;gap:8px;align-items:center;margin:4px 0}
.bt{background:var(--line);border-radius:6px;height:10px;overflow:hidden}.bt i{display:block;height:100%;background:var(--accent);border-radius:6px}.bv{text-align:end;color:var(--muted)}
ul{margin:6px 0;padding-inline-start:18px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:start;white-space:nowrap}
th{cursor:pointer;color:var(--muted);font-weight:400}td.hook{white-space:normal;min-width:180px}td.hi{color:var(--good);font-weight:700}td.lo{color:var(--bad)}a{color:inherit}.tw{overflow-x:auto}
.day{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)}.tag{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:0 8px;margin-inline-end:6px;font-size:12px;color:var(--muted)}
</style></head><body><main>${body}</main><script>
document.querySelectorAll("table.sort").forEach((t)=>t.querySelectorAll("th").forEach((th,i)=>th.addEventListener("click",()=>{const tb=t.tBodies[0],r=[...tb.rows],d=th.dataset.d=th.dataset.d==="1"?"0":"1";
r.sort((a,b)=>{const x=a.cells[i],y=b.cells[i],vx=x.dataset.v??x.textContent,vy=y.dataset.v??y.textContent;return (isNaN(vx)?String(vx).localeCompare(vy):vx-vy)*(d==="1"?-1:1)});r.forEach((x)=>tb.appendChild(x))})));
</script></body></html>`;
  async function calendarHtml(env, t) {
    const z = await zernio(env, "GET", "/posts?status=scheduled&limit=100");
    const items = [];
    for (const p of z.data?.posts || []) for (const pl of p.platforms || [{ platform: p.platform, accountId: p.accountId }]) {
      if (t && pl.accountId && (pl.accountId._id || pl.accountId) !== t.acc._id && pl.platform === "instagram") continue;
      const when = pl.scheduledFor || p.scheduledFor; if (!when) continue;
      items.push({ when, what: pl.platform || "post", text: firstLine(p.content) });
    }
    if (!t?.client) {
      for (const d of (await env.DB.prepare("SELECT * FROM drafts WHERE status='scheduled' AND scheduled_for IS NOT NULL").all()).results) items.push({ when: d.scheduled_for, what: d.kind, text: firstLine(d.title || d.body) });
    }
    const soon = items.filter((x) => Date.parse(x.when) >= Date.now() - 36e5 && Date.parse(x.when) <= Date.now() + 31 * 864e5).sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
    if (!soon.length) return `<p class="muted">${_("Nothing scheduled in the next 30 days.")}</p>`;
    const byDay = {};
    for (const x of soon) { const lp = localParts(new Date(x.when), env), k = `${lp.y}-${pad(lp.m)}-${pad(lp.d)}`; (byDay[k] = byDay[k] || []).push({ ...x, hm: `${pad(lp.H)}:${pad(lp.M)}` }); }
    return Object.entries(byDay).map(([d, xs]) => `<div class="day"><b>${fa(d)}</b><div>${xs.map((x) => `<div><span class="tag">${fa(x.hm)}</span><span class="tag">${esc(x.what)}</span>${esc(x.text)}</div>`).join("")}</div></div>`).join("");
  }
  async function competitorsHtml(env, clientId) {
    const list = await competitorsOf(env, clientId);
    if (!list.length) return `<p class="muted">${_("No competitors yet. Add them from the Studio bot (🥊).")}</p>`;
    const rows = [];
    for (const c of list) {
      const s = await env.DB.prepare("SELECT * FROM competitor_stats WHERE competitor_id=? ORDER BY date DESC LIMIT 1").bind(c.id).first();
      const o = await env.DB.prepare("SELECT * FROM competitor_stats WHERE competitor_id=? ORDER BY date ASC LIMIT 1").bind(c.id).first();
      rows.push(`<tr><td><a href="https://instagram.com/${esc(c.username)}" target="_blank" rel="noopener">@${esc(c.username)}</a></td><td data-v="${n0(s?.followers)}">${big(s?.followers)}</td><td>${s && o && s.date !== o.date ? signed(s.followers - o.followers) : "—"}</td><td>${fa(n0(s?.posts_7d))}</td><td>${big(Math.round(n0(s?.avg_likes)))}</td><td>${big(Math.round(n0(s?.avg_comments)))}</td><td>${fa(s?.date || "—")}</td></tr>`);
    }
    return `<div class="tw"><table class="sort"><thead><tr><th>${_("Account")}</th><th>${_("Followers")}</th><th>${_("Since added")}</th><th>${_("Posts/week")}</th><th>${_("Avg likes")}</th><th>${_("Avg comments")}</th><th>${_("Checked")}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  async function dashboardHtml(env, t) {
    if (!t) return page(env, _("Dashboard"), _f("<p>No Instagram account found in Zernio.</p>"));
    const acc = t.acc;
    const [series, ps, dem, bt] = await Promise.all([followerSeries(env, acc, 85), posts(env, acc, 2),
      zernio(env, "GET", `/analytics/instagram/demographics?accountId=${acc._id}&metric=follower_demographics`), zernio(env, "GET", `/analytics/best-time?accountId=${acc._id}`)]);
    const sc = score(env, ps, series), hist = await snaps(env, t);
    const followerPts = series.counts.length >= 2 ? series.counts.map((x) => ({ x: x.date, y: x.value })) : hist.filter((s) => s.followers).map((s) => ({ x: s.date, y: s.followers }));
    const scorePts = hist.filter((s) => s.score != null).map((s) => ({ x: s.date, y: s.score }));
    const g = series.gained.map((x) => x.value), g7 = g.slice(-7).reduce((a, b) => a + b, 0);
    const last = [...hist].reverse().find((s) => s.views30) || {};
    const D = dem.data?.demographics || {}, top = (k, n = 6) => { const a = (D[k] || []).slice().sort((x, y) => y.value - x.value).slice(0, n); const mx = Math.max(1, ...a.map((x) => x.value)); return a.map((x) => [x.dimension, x.value, mx]); };
    const DN = [_("Monday"), _("Tuesday"), _("Wednesday"), _("Thursday"), _("Friday"), _("Saturday"), _("Sunday")];
    const slots = (bt.data?.slots || []).filter((s) => s.post_count > 0).sort((a, b) => b.avg_engagement - a.avg_engagement).slice(0, 5).map((s) => {
      const tt = new Date(Date.UTC(2024, 0, 1 + s.day_of_week, s.hour)), lp = localParts(tt, env), wd = (new Date(Date.UTC(lp.y, lp.m - 1, lp.d)).getUTCDay() + 6) % 7;
      return _f("<li>{0} at {1}:{2} · average engagement {3} ({4} posts)</li>", DN[wd], fa(pad(lp.H)), fa(pad(lp.M)), fa(Math.round(s.avg_engagement)), fa(s.post_count)); }).join("");
    const reels = ps.slice(0, 30), medV = median(reelsOnly(ps).map((p) => m(p).views));
    const rows = reels.map((p) => { const x = m(p); return `<tr><td>${fa(String(p.publishedAt).slice(0, 10))}</td><td class="hook">${p.platformPostUrl ? `<a href="${esc(p.platformPostUrl)}" target="_blank" rel="noopener">${esc(firstLine(p.content))}</a>` : esc(firstLine(p.content))}</td>
<td data-v="${n0(x.views)}" class="${medV && x.views > medV * 1.5 ? "hi" : medV && x.views < medV * .5 ? "lo" : ""}">${big(x.views)}</td><td data-v="${n0(x.savesK)}">${x.savesK != null ? dec(x.savesK) : "—"}</td><td data-v="${n0(x.sharesK)}">${x.sharesK != null ? dec(x.sharesK) : "—"}</td><td data-v="${n0(x.skip)}">${x.skip != null ? fa(Math.round(x.skip)) : "—"}</td><td data-v="${n0(x.watchPct)}">${x.watchPct != null ? fa(Math.round(x.watchPct)) : "—"}</td></tr>`; }).join("");
    const weak = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts), strong = [...weak].reverse();
    const brandName = t.client?.name || env.BRAND_NAME || acc.username || "";
    const body = `<p class="muted">${esc(acc.username ? "@" + acc.username : "")} ${_("· updated:")} ${fa(localDate(env))} ${_("· source: Zernio (daily followers can be up to 24 hours old)")}</p>
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
${weak.length && weak[0].pts < 14 ? `<p>💡 ${esc(advice(weak[0].key))}</p>` : ""}
${t.client ? "" : `<p class="muted">${_("For a full audit with advice (bio, highlights, competitors, a two-week plan), type this in Claude Code:")} <b>/page-audit</b>.</p>`}</div>
</div>
<div class="card"><h2>${_("Content calendar (next 30 days)")}</h2>${await calendarHtml(env, t.client ? t : null)}</div>
<div class="card"><h2>${_("Competitors")}</h2>${await competitorsHtml(env, t.client?.id || 0)}</div>
<div class="two">
<div class="card"><h2>${_("Followers' cities")}</h2>${hbars(top("city"))}</div>
<div class="card"><h2>${_("Followers' ages")}</h2>${hbars(top("age", 7))}</div>
</div>
<div class="card"><h2>${_("Best times (from your own posts, local time)")}</h2>${slots ? `<ul>${slots}</ul>` : _("<p class=muted>Not enough posts yet.</p>")}</div>
<div class="card"><h2>${_("Posts")}</h2><p class="muted">${_("Green: above 1.5× the median · Red: below half. Tap a column header to sort.")}</p><div class="tw"><table id="t" class="sort"><thead><tr>
<th>${_("Date")}</th><th>${_("First line")}</th><th>${_("views")}</th><th>${_("Saves/1k")}</th><th>${_("Shares/1k")}</th><th>${_("Skip %")}</th><th>${_("Watch %")}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    return page(env, `${_("Dashboard")} ${brandName}`, body, t.client?.accent);
  }
  async function agencyHtml(env) {
    const ts = await targets(env), rows = [];
    for (const t of ts) {
      const h = await snaps(env, t), last = [...h].reverse().find((s) => s.score != null) || {}, prev7 = [...h].reverse().find((s) => s.date <= localDate(env, -7) && s.followers) || {};
      rows.push(`<tr><td><a href="/c/${esc(t.client.token)}">${esc(t.client.name)}</a></td><td>${esc(t.acc.username ? "@" + t.acc.username : "")}</td><td data-v="${n0(t.acc.followersCount)}">${big(t.acc.followersCount)}</td><td>${prev7.followers ? signed(t.acc.followersCount - prev7.followers) : "—"}</td><td data-v="${n0(last.score)}">${last.score != null ? fa(last.score) : "—"}</td><td>${big(last.views30)}</td><td>${t.client.chat_id ? "✅" : "—"}</td></tr>`);
    }
    const body = `<p class="muted">${_("· updated:")} ${fa(localDate(env))}</p><h1>${_("Agency dashboard")}</h1>
<div class="card"><h2>${_("Clients")}</h2>${rows.length ? `<div class="tw"><table class="sort"><thead><tr><th>${_("Client")}</th><th>${_("Account")}</th><th>${_("Followers")}</th><th>${_("7 days")}</th><th>${_("Page score")}</th><th>${_("30-day views")}</th><th>${_("Telegram linked")}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : `<p class="muted">${_("No clients yet. Add them in the Studio bot: 👥 Clients → ➕.")}</p>`}</div>
<div class="card"><h2>${_("Content calendar (next 30 days)")}</h2>${await calendarHtml(env, null)}</div>`;
    return page(env, _("Agency dashboard"), body);
  }
  const html = (s) => new Response(s, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" } });
  async function serveDashboard(env, req) {
    if (!env.INGEST_KEY || new URL(req.url).searchParams.get("k") !== await dashToken(env)) return new Response("forbidden", { status: 403 });
    if (agency(env)) return html(await agencyHtml(env));
    return html(await dashboardHtml(env, await targetFor(env, null)));
  }
  async function serveClientDashboard(env, token) {
    const c = token && await env.DB.prepare("SELECT * FROM clients WHERE token=?").bind(token).first();
    if (!c) return new Response("not found", { status: 404 });
    return html(await dashboardHtml(env, await targetFor(env, c.id)));
  }

  // ---------- clients (agency mode): each client = a Zernio profile ----------
  async function freeProfiles(env) {
    const p = (await zernio(env, "GET", "/profiles")).data?.profiles || [];
    const used = new Set((await clientsAll(env)).map((c) => c.profile_id));
    return p.filter((x) => !used.has(x._id));
  }
  async function addClient(env, profileId) {
    const p = ((await zernio(env, "GET", "/profiles")).data?.profiles || []).find((x) => x._id === profileId);
    if (!p) return null;
    await env.DB.prepare("INSERT OR IGNORE INTO clients (profile_id, name, token, join_code) VALUES (?,?,?,?)").bind(p._id, p.name || "Client", rnd(20), rnd(6)).run();
    return env.DB.prepare("SELECT * FROM clients WHERE profile_id=?").bind(p._id).first();
  }
  // voice, facts and handle per client (tools/client.mjs sync, or POST /api/clients {id, voice, facts, handle})
  async function updateClient(env, id, { voice, facts, handle } = {}) {
    const c = await clientById(env, id);
    if (!c) return null;
    await env.DB.prepare("UPDATE clients SET voice=COALESCE(?,voice), facts=COALESCE(?,facts), handle=COALESCE(?,handle) WHERE id=?").bind(voice ?? null, facts ?? null, handle ?? null, id).run();
    return clientById(env, id);
  }
  async function linkClient(env, code, chatId) {
    const c = await env.DB.prepare("SELECT * FROM clients WHERE join_code=?").bind(code).first();
    if (!c) return null;
    await env.DB.prepare("UPDATE clients SET chat_id=? WHERE id=?").bind(String(chatId), c.id).run();
    return { ...c, chat_id: String(chatId) };
  }

  // ---------- cron entry: call every minute from scheduled() ----------
  async function tick(env, when) {
    const t = localParts(when, env), [H, M] = String(env.DAILY_REPORT_AT || "09:00").split(":").map(Number), today = localDate(env);
    const jobs = [processInbox(env).catch((e) => console.log("inbox", e?.message))];
    const atReport = env.DAILY_REPORT_AT !== "off" && t.H === H && t.M === M;
    if (atReport && await kvGet(env, "daily:last") !== today) jobs.push(kvSet(env, "daily:last", today).then(() => dailyReport(env)));
    const wd = new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay();
    if (atReport && wd === 1 && await kvGet(env, "weekly:last") !== today) jobs.push(kvSet(env, "weekly:last", today).then(async () => {
      if (agency(env)) for (const c of await clientsAll(env)) await competitorsReport(env, c.id, { silentIfNone: true });
      else await competitorsReport(env, null, { silentIfNone: true });
    }));
    const month = today.slice(0, 7);
    if (atReport && t.d === 1 && env.MONTHLY_REPORT !== "off" && await kvGet(env, "monthly:last") !== month) jobs.push(kvSet(env, "monthly:last", month).then(() => monthlyReport(env)));
    if (env.POST_REPORTS !== "off" && t.M === 17) jobs.push(checkPostReports(env));   // hourly, off the busy minutes
    return Promise.all(jobs);
  }

  return { dailyReport, checkPostReports, postReport, monthlyReport, monthlyHtml, competitorsReport, addCompetitor, competitorsOf,
    processInbox, inboxSend, inboxSetReply, inboxIgnore, inboxShow, onZernioWebhook, registerWebhook, serveDashboard, serveClientDashboard,
    dashLink, dashToken, score, tick, targets, targetFor, clientsAll, clientById, freeProfiles, addClient, updateClient, linkClient, agency };
}
