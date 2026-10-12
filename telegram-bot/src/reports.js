// reports.js · the page's numbers, delivered: a daily Telegram report (followers, trend, page score), a report 24 h and
// 7 days after every post, a private dashboard page, and Zernio webhooks (post published, account disconnected).
// Mechanics only, no personal data. index.js wires it: makeReports({ zernio, say, fa, esc, localParts, fontBlack, fontSemi }).
//
// Data: Zernio. Follower history is a daily snapshot on Zernio's side ("up to 24 hours old"), so the daily report names
// the day each number belongs to. Nothing here is estimated: a part without data is left out of the score and said so.

export function makeReports({ zernio, say, fa, esc, localParts, fontBlack = "", fontSemi = "" }) {
  // ---------- small helpers ----------
  const kvGet = async (env, k) => (await env.DB.prepare("SELECT v FROM kv WHERE k=?").bind(k).first())?.v ?? null;
  const kvSet = (env, k, v) => env.DB.prepare("INSERT OR REPLACE INTO kv (k, v, updated_at) VALUES (?, ?, datetime('now'))").bind(k, String(v)).run();
  const pad = (n) => String(n).padStart(2, "0");
  const localDate = (env, offsetDays = 0) => { const t = localParts(new Date(Date.now() + offsetDays * 864e5), env); return `${t.y}-${pad(t.m)}-${pad(t.d)}`; };
  const median = (a) => { const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const n0 = (x) => (Number.isFinite(x) ? x : 0);
  const dec = (x, d = 1) => fa(Number(x).toFixed(d)).replace(".", "٫");
  const big = (n) => { if (!Number.isFinite(n)) return "—"; const a = Math.abs(n);
    return a >= 1e6 ? dec(n / 1e6).replace(/٫۰$/, "") + " میلیون" : a >= 1e4 ? fa(Math.round(n / 1e3)) + " هزار" : fa(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬")); };
  const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + big(Math.abs(n));
  const ratio = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : null);
  const times = (r) => (r == null ? "" : r >= 1 ? `${dec(r)} برابر` : `${fa(Math.round(r * 100))} درصدِ`);
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
      { key: "growth", short: "رشد فالوور", label: "رشد فالوور (۷ روز در برابر ۷ روز قبلش)", r: g.length >= 10 ? ratio(g7.reduce((a, b) => a + b, 0), Math.max(1, p7.reduce((a, b) => a + b, 0))) : null },
      { key: "reach", short: "بازدید ریل‌ها", label: "بازدید ریل‌های ۲ هفته‌ی اخیر در برابر قبلی‌ها", r: ratio(median(recent.map((p) => m(p).views)), median(before.map((p) => m(p).views))) },
      { key: "value", short: "سیو و شیر", label: "سیو و شیر در هر هزار بازدید", r: ratio(median(recent.map((p) => m(p).valueK)), median(before.map((p) => m(p).valueK))) },
      { key: "retention", short: "نگه داشتن بیننده", label: "نگه داشتن بیننده (کمتر رد کردن)", r: ratio(median(before.map((p) => m(p).skip)), median(recent.map((p) => m(p).skip))) },
      { key: "consistency", short: "نظم انتشار", label: `نظم انتشار (هدف: هفته‌ای ${fa(target)} تا)`, r: null, fixed: Math.round(20 * Math.min(1, ps.filter((p) => d(p) <= 7).length / target)) },
    ].map((x) => ({ ...x, pts: x.fixed ?? pts(x.r) }));
    const have = parts.filter((x) => x.pts != null);
    const total = have.length ? Math.round(100 * have.reduce((a, b) => a + b.pts, 0) / (have.length * 20)) : null;
    return { total, parts, missing: parts.filter((x) => x.pts == null).map((x) => x.label) };
  }
  const bar = (p) => "■".repeat(Math.round(p / 4)) + "□".repeat(5 - Math.round(p / 4));

  // ---------- daily report ----------
  async function dailyReport(env) {
    const acc = await ig(env);
    if (!acc) return say(env, "📊 گزارش روزانه: حساب اینستاگرام توی Zernio پیدا نشد (شاید قطع شده؛ توی Zernio دوباره وصلش کن).");
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
    const L = [`📊 <b>گزارش روزانه</b> · ${fa(localDate(env))}`, ""];
    L.push(`👥 فالوور: <b>${big(acc.followersCount)}</b>`);
    if (gDay) L.push(`   ${gDay.date === yday ? "دیروز" : "آخرین روز ثبت‌شده (" + fa(gDay.date) + ")"}: <b>${signed(gDay.value - n0(lDay?.value))}</b> (${fa(gDay.value)} اومد، ${fa(n0(lDay?.value))} رفت)`);
    else L.push("   فالوور روزانه هنوز ثبت نشده (Zernio هر روز یه بار عکس می‌گیره؛ از فردا میاد).");
    if (g.length && g.length < 7) L.push(`📈 ${fa(g.length)} روز اخیر (از وقتی Zernio فالوور روزانه ثبت می‌کنه): <b>${signed(sum(g))}</b>`);
    if (g.length >= 7) L.push(`📈 ۷ روز اخیر: <b>${signed(g7)}</b>${p7 != null ? ` · هفته‌ی قبلش ${signed(p7)}${p7 > 0 ? ` (${times(g7 / p7)})` : ""}` : ""}`);
    if (counts.length >= 3) L.push(`   ${spark(counts)}  (${fa(counts.length)} روز)`);
    if (views30 != null) L.push(`👀 بازدید ۳۰ روز: <b>${big(views30)}</b>${weekAgo?.views30 ? ` (هفته‌ی پیش ${big(weekAgo.views30)}، ${signed(views30 - weekAgo.views30)})` : ""} · ریچ: ${big(reach30)}`);
    L.push(`📝 پست این هفته: ${fa(week.length)}`);
    if (sc.total != null) {
      L.push("", `🏆 <b>امتیاز پیج: ${fa(sc.total)} از ۱۰۰</b>${prev?.score != null ? ` (دیروز ${fa(prev.score)}، ${sc.total >= prev.score ? "▲" : "▼"} ${fa(Math.abs(sc.total - prev.score))})` : ""}`);
      for (const p of sc.parts) if (p.pts != null) L.push(`${bar(p.pts)} ${fa(p.pts)}/۲۰ · ${p.label}`);
      if (sc.missing.length) L.push(`<i>هنوز داده نداره: ${sc.missing.join("، ")}</i>`);
      const weakest = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts)[0];
      if (weakest && weakest.pts < 10) L.push(`🎯 ضعیف‌ترین بخش: ${weakest.label}`);
    }
    if (best) L.push("", `⭐ بهترین پست هفته: «${esc(firstLine(best.content))}» · ${big(m(best).views)} بازدید${best.platformPostUrl ? `\n${esc(best.platformPostUrl)}` : ""}`);
    const url = await dashLink(env);
    return say(env, L.join("\n").slice(0, 4000), url ? { reply_markup: { inline_keyboard: [[{ text: "📊 داشبورد کامل", url }]] } } : {});
  }

  // ---------- 24 h and 7-day post reports ----------
  async function gateStats(env, p) {
    const r = await zernio(env, "GET", "/comment-automations?limit=100");
    const a = (r.data?.automations || []).find((x) => x.postId && (x.postId === p._id || x.postId === p.latePostId));
    if (!a) return null;
    const l = await zernio(env, "GET", `/comment-automations/${a.id || a._id}/logs?limit=100`);
    const by = {}; for (const x of l.data?.logs || []) by[x.status] = (by[x.status] || 0) + 1;
    return { word: (a.keywords || []).join("، "), sent: by.sent || 0, failed: by.failed || 0, total: l.data?.pagination?.total ?? (l.data?.logs || []).length, misses: l.data?.misses?.total ?? null };
  }
  async function postReport(env, p, hours, ps, series) {
    const x = m(p), others = reelsOnly(ps).filter((q) => q._id !== p._id && Date.parse(q.publishedAt) < Date.parse(p.publishedAt)).slice(0, 20);
    const med = (k) => median(others.map((q) => m(q)[k]));
    const rank = 1 + others.filter((q) => n0(m(q).views) > n0(x.views)).length;
    const kind = x.reel ? "ریل" : "پست";
    const L = [`🎬 <b>گزارش ${hours >= 160 ? "۷ روزه" : "۲۴ ساعته"}‌ی ${kind}</b>`, `«${esc(firstLine(p.content))}»`, ""];
    L.push(`👀 بازدید: <b>${big(x.views)}</b>${med("views") ? ` · ${times(ratio(x.views, med("views")))} میانه‌ی ریل‌هات` : ""}${others.length ? ` · رتبه ${fa(rank)} از ${fa(others.length + 1)}` : ""}`);
    if (hours >= 160) { const v24 = await kvGet(env, `rep24v:${p._id}`); if (v24) L.push(`   از گزارش ۲۴ ساعته: ${signed(n0(x.views) - Number(v24))} بازدید بیشتر`); }
    L.push(`📣 ریچ: ${big(x.reach)} · ❤️ ${big(x.likes)} · 💬 ${big(x.comments)} · 🔁 ${big(x.shares)} · 🔖 ${big(x.saves)}`);
    if (x.views) L.push(`   در هر هزار بازدید: ${dec(x.savesK)} سیو${med("savesK") != null ? ` (میانه ${dec(med("savesK"))})` : ""} · ${dec(x.sharesK)} شیر${med("sharesK") != null ? ` (میانه ${dec(med("sharesK"))})` : ""}`);
    if (x.reel && (x.skip != null || x.watchPct != null)) L.push(`⏱ ${x.skip != null ? `رد کردن ${fa(Math.round(x.skip))} درصد${med("skip") != null ? ` (میانه ${fa(Math.round(med("skip")))})` : ""}` : ""}${x.watchPct != null ? ` · میانگین تماشا ${dec(x.watch)} از ${fa(Math.round(x.dur))} ثانیه (${fa(Math.round(x.watchPct))} درصد)` : ""}`);
    if (x.follows != null) L.push(`➕ فالوور از همین پست: <b>${fa(x.follows)}</b>`);
    const day = (o) => { const t = localParts(new Date(Date.parse(p.publishedAt) + o * 864e5), env); return `${t.y}-${pad(t.m)}-${pad(t.d)}`; };
    const gd = [0, 1].map((o) => series.gained.find((v) => v.date === day(o))?.value).filter(Number.isFinite);
    if (gd.length) L.push(`👥 فالوور کل پیج روز انتشار${gd.length > 1 ? " و فردا" : ""}: <b>+${fa(gd.reduce((a, b) => a + b, 0))}</b>`);
    if (x.profileViews) L.push(`👤 بازدید پروفایل از همین پست: ${big(x.profileViews)}`);
    const gate = await gateStats(env, p).catch(() => null);
    if (gate) L.push(`🔑 گیت «${esc(gate.word)}»: ${fa(gate.total)} کامنت · ✅ ${fa(gate.sent)} دایرکت رفت${gate.failed ? ` · ⚠️ ${fa(gate.failed)} نرفت` : ""}${gate.misses ? ` · ${fa(gate.misses)} کامنت بدون کلمه` : ""}`);
    // strengths and weaknesses against the page's own medians
    const cmp = [["بازدید", ratio(x.views, med("views"))], ["سیو", ratio(x.savesK, med("savesK"))], ["شیر", ratio(x.sharesK, med("sharesK"))],
      ["نگه داشتن بیننده", ratio(med("skip"), x.skip)], ["درصد تماشا", ratio(x.watchPct, med("watchPct"))]].filter(([, r]) => r != null);
    if (cmp.length >= 2) {
      const s = [...cmp].sort((a, b) => b[1] - a[1]), lo = s[s.length - 1];
      L.push("", s[0][1] >= 1.1 ? `✅ قوی‌ترین: ${s[0][0]} (${times(s[0][1])} میانه)` : "✅ هیچ بخشی به‌طور واضح بالاتر از میانه‌ی ریل‌هات نبود.");
      if (lo[1] > 0.9) L.push("⚠️ هیچ بخشی زیر میانه نبود.");
      else {
      L.push(`⚠️ ضعیف‌ترین: ${lo[0]} (${times(lo[1])} میانه)`);
      if (s[s.length - 1][0] === "نگه داشتن بیننده" || s[s.length - 1][0] === "درصد تماشا") L.push("   ← ثانیه‌های اول رو قوی‌تر کن: نتیجه رو از فریم اول نشون بده.");
      else if (s[s.length - 1][0] === "سیو") L.push("   ← یه چیز نگه‌داشتنی بده (لیست، قیمت، راهنما) و بگو «سیوش کن».");
      else if (s[s.length - 1][0] === "شیر") L.push("   ← بگو برای کی بفرستن («بفرست برا کسی که…»).");
      else if (s[s.length - 1][0] === "بازدید") L.push("   ← موضوع به بیننده نزدیک بود؟ قلاب ثانیه‌ی اول رو با ریل‌های پربازدیدت مقایسه کن.");
      }
    }
    if (x.updated) L.push(`<i>آمار Zernio: ${esc(String(x.updated).slice(0, 16))} UTC</i>`);
    const url = await dashLink(env);
    await say(env, L.join("\n").slice(0, 4000), { reply_markup: { inline_keyboard: [[...(p.platformPostUrl ? [{ text: "▶️ پست", url: p.platformPostUrl }] : []), ...(url ? [{ text: "📊 داشبورد", url }] : [])]] } });
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
    if (e.test) { await say(env, `🔔 وب‌هوک Zernio وصله (تست: ${esc(e.event || "")}).`); return new Response("ok"); }
    if (e.event === "account.disconnected") await say(env, `🚨 <b>حساب ${esc(e.account?.platform || "")} از Zernio قطع شد</b>${e.account?.username ? " (" + esc(e.account.username) + ")" : ""}.\nتا دوباره وصلش نکنی هیچ پستی منتشر نمی‌شه و آمار نمیاد: Zernio ← Accounts ← Reconnect.`);
    else if (e.event === "post.platform.failed") await say(env, `⚠️ انتشار روی ${esc(e.platform || e.post?.platform || "")} ناموفق بود: ${esc(String(e.error || e.post?.error || "").slice(0, 200))}`);
    else if (e.event === "post.platform.published" || e.event === "post.external.created") {
      const url = e.platformPostUrl || e.post?.platformPostUrl || (e.post?.platforms || []).find((x) => x.platformPostUrl)?.platformPostUrl || "";
      await say(env, `✅ منتشر شد${url ? ": " + esc(url) : ""}\nگزارش ۲۴ ساعته‌ش فردا همین موقع میاد.`);
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
    const v = points.filter((p) => Number.isFinite(p.y)); if (v.length < 2) return `<p class="muted">هنوز داده‌ی کافی نیست.</p>`;
    const lo = Math.min(...v.map((p) => p.y)), hi = Math.max(...v.map((p) => p.y)), X = (i) => 8 + i * (w - 16) / (v.length - 1), Y = (y) => h - 18 - (hi === lo ? .5 : (y - lo) / (hi - lo)) * (h - 36);
    const d = v.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img"><path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
${v.map((p, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5" fill="${color}"><title>${esc(p.x)}: ${p.y}</title></circle>`).join("")}
<text x="8" y="${h - 2}" class="ax">${esc(v[0].x)}</text><text x="${w - 8}" y="${h - 2}" class="ax" text-anchor="end">${esc(v[v.length - 1].x)}</text>
<text x="${w - 8}" y="14" class="ax" text-anchor="end">${hi.toLocaleString("en-US")}</text><text x="${w - 8}" y="${h - 22}" class="ax" text-anchor="end">${lo.toLocaleString("en-US")}</text></svg>`;
  }
  const hbars = (rows) => rows.length ? `<div class="bars">${rows.map(([k, v, max]) => `<div class="br"><span class="bk">${esc(k)}</span><span class="bt"><i style="width:${Math.max(2, 100 * v / max).toFixed(1)}%"></i></span><span class="bv">${fa(v)}</span></div>`).join("")}</div>` : `<p class="muted">داده نیست.</p>`;
  async function dashboardHtml(env) {
    const acc = await ig(env);
    if (!acc) return `<p>حساب اینستاگرام توی Zernio پیدا نشد.</p>`;
    const [series, ps, dem, bt] = await Promise.all([followerSeries(env, acc, 90), posts(env, acc, 2),
      zernio(env, "GET", `/analytics/instagram/demographics?accountId=${acc._id}&metric=follower_demographics`), zernio(env, "GET", `/analytics/best-time?accountId=${acc._id}`)]);
    const sc = score(env, ps, series);
    const snaps = (await env.DB.prepare("SELECT * FROM snapshots ORDER BY date").all()).results;
    const followerPts = series.counts.length >= 2 ? series.counts.map((x) => ({ x: x.date, y: x.value })) : snaps.filter((s) => s.followers).map((s) => ({ x: s.date, y: s.followers }));
    const scorePts = snaps.filter((s) => s.score != null).map((s) => ({ x: s.date, y: s.score }));
    const g = series.gained.map((x) => x.value), g7 = g.slice(-7).reduce((a, b) => a + b, 0);
    const last = [...snaps].reverse().find((s) => s.views30) || {};
    const D = dem.data?.demographics || {}, top = (k, n = 6) => { const a = (D[k] || []).slice().sort((x, y) => y.value - x.value).slice(0, n); const mx = Math.max(1, ...a.map((x) => x.value)); return a.map((x) => [x.dimension, x.value, mx]); };
    const DN = ["دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"];
    const slots = (bt.data?.slots || []).filter((s) => s.post_count > 0).sort((a, b) => b.avg_engagement - a.avg_engagement).slice(0, 5).map((s) => {
      const t = new Date(Date.UTC(2024, 0, 1 + s.day_of_week, s.hour)), lp = localParts(t, env), wd = (new Date(Date.UTC(lp.y, lp.m - 1, lp.d)).getUTCDay() + 6) % 7;
      return `<li>${DN[wd]} ساعت ${fa(pad(lp.H))}:${fa(pad(lp.M))} · میانگین تعامل ${fa(Math.round(s.avg_engagement))} (${fa(s.post_count)} پست)</li>`; }).join("");
    const reels = ps.slice(0, 30), medV = median(reelsOnly(ps).map((p) => m(p).views));
    const rows = reels.map((p) => { const x = m(p); return `<tr><td>${fa(String(p.publishedAt).slice(0, 10))}</td><td class="hook">${p.platformPostUrl ? `<a href="${esc(p.platformPostUrl)}" target="_blank" rel="noopener">${esc(firstLine(p.content))}</a>` : esc(firstLine(p.content))}</td>
<td data-v="${n0(x.views)}" class="${medV && x.views > medV * 1.5 ? "hi" : medV && x.views < medV * .5 ? "lo" : ""}">${big(x.views)}</td><td data-v="${n0(x.savesK)}">${x.savesK != null ? dec(x.savesK) : "—"}</td><td data-v="${n0(x.sharesK)}">${x.sharesK != null ? dec(x.sharesK) : "—"}</td><td data-v="${n0(x.skip)}">${x.skip != null ? fa(Math.round(x.skip)) : "—"}</td><td data-v="${n0(x.watchPct)}">${x.watchPct != null ? fa(Math.round(x.watchPct)) : "—"}</td></tr>`; }).join("");
    const weak = sc.parts.filter((p) => p.pts != null).sort((a, b) => a.pts - b.pts), strong = [...weak].reverse();
    const brandName = env.BRAND_NAME || acc.username || "";
    return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>داشبورد ${esc(brandName)}</title>
<meta name="robots" content="noindex"><style>
${fontBlack ? `@font-face{font-family:FB;src:url(data:font/woff2;base64,${fontBlack}) format("woff2")}` : ""}${fontSemi ? `@font-face{font-family:FS;src:url(data:font/woff2;base64,${fontSemi}) format("woff2")}` : ""}
:root{--bg:${env.STORY_BG || "#101418"};--ink:${env.STORY_INK || "#F2F0EA"};--accent:${env.STORY_ACCENT || "#E8B04B"};--muted:${env.STORY_MUTED || "#A9B0B8"};--card:color-mix(in srgb,var(--ink) 6%,var(--bg));--line:color-mix(in srgb,var(--ink) 14%,transparent);--good:#3FB97A;--bad:#E5484D}
@media (prefers-color-scheme: light){:root{--bg:#F6F5F1;--ink:#16181C;--card:#FFFFFF;--muted:#5D6470;--line:#E3E1DA}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 FS,Vazirmatn,Tahoma,sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font:28px/1.3 FB,FS,sans-serif;margin:4px 0}h2{font:18px/1.4 FB,FS,sans-serif;margin:0 0 10px}
.muted{color:var(--muted)}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.two{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}.kpi b{display:block;font:26px/1.2 FB,FS,sans-serif}.kpi span{color:var(--muted);font-size:13px}
.chart{width:100%;height:auto}.ax{fill:var(--muted);font-size:11px;direction:ltr}.bars .br{display:grid;grid-template-columns:110px 1fr 60px;gap:8px;align-items:center;margin:4px 0}
.bt{background:var(--line);border-radius:6px;height:10px;overflow:hidden}.bt i{display:block;height:100%;background:var(--accent);border-radius:6px}.bv{text-align:left;color:var(--muted)}
.score{font:46px/1 FB,FS,sans-serif;color:var(--accent)}ul{margin:6px 0;padding-inline-start:18px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}th{cursor:pointer;color:var(--muted);font-weight:400}
td.hook{white-space:normal;min-width:180px}td.hi{color:var(--good);font-weight:700}td.lo{color:var(--bad)}a{color:inherit}.tw{overflow-x:auto}
</style></head><body><main>
<p class="muted">${esc(acc.username ? "@" + acc.username : "")} · به‌روز: ${fa(localDate(env))} · منبع: Zernio (فالوور روزانه تا ۲۴ ساعت تأخیر داره)</p>
<h1>داشبورد ${esc(brandName)}</h1>
<div class="grid">
<div class="card kpi"><span>فالوور</span><b>${big(acc.followersCount)}</b></div>
<div class="card kpi"><span>${g.length && g.length < 7 ? fa(g.length) + " روز اخیر" : "۷ روز اخیر"}</span><b>${g.length ? signed(g7) : "—"}</b></div>
<div class="card kpi"><span>بازدید ۳۰ روز</span><b>${big(last.views30)}</b></div>
<div class="card kpi"><span>ریچ ۳۰ روز</span><b>${big(last.reach30)}</b></div>
<div class="card kpi"><span>امتیاز پیج</span><b>${sc.total != null ? fa(sc.total) + " / ۱۰۰" : "—"}</b></div>
</div>
<div class="two">
<div class="card"><h2>فالوور</h2>${line(followerPts)}</div>
<div class="card"><h2>امتیاز پیج در طول زمان</h2>${line(scorePts)}</div>
</div>
<div class="two">
<div class="card"><h2>امتیاز، بخش به بخش</h2>${hbars(sc.parts.filter((p) => p.pts != null).map((p) => [p.short, p.pts, 20]))}
${sc.missing.length ? `<p class="muted">هنوز داده نداره: ${sc.missing.join("، ")}</p>` : ""}<p class="muted">هر بخش در برابر میانه‌ی خود پیج: ۱۰ یعنی مثل قبل، ۲۰ یعنی دو برابر بهتر.</p></div>
<div class="card"><h2>قوت و ضعف</h2>${strong.length ? `<p>✅ <b>قوی‌ترین:</b> ${esc(strong[0].label)} (${fa(strong[0].pts)}/۲۰)</p><p>⚠️ <b>ضعیف‌ترین:</b> ${esc(weak[0].label)} (${fa(weak[0].pts)}/۲۰)</p>` : "<p class=muted>داده‌ی کافی نیست.</p>"}
<p class="muted">برای آدیت کامل با پیشنهاد (بیو، هایلایت، رقبا، برنامه‌ی دو هفته‌ای) توی Claude Code بنویس <b>/page-audit</b>.</p></div>
</div>
<div class="two">
<div class="card"><h2>شهر فالوورها</h2>${hbars(top("city"))}</div>
<div class="card"><h2>سن فالوورها</h2>${hbars(top("age", 7))}</div>
</div>
<div class="card"><h2>بهترین زمان‌ها (از پست‌های خودت، به وقت محلی)</h2>${slots ? `<ul>${slots}</ul>` : "<p class=muted>هنوز پست کافی نیست.</p>"}</div>
<div class="card"><h2>پست‌ها</h2><p class="muted">سبز: بیشتر از ۱.۵ برابر میانه · قرمز: کمتر از نصف. روی سرستون بزن تا مرتب بشه.</p><div class="tw"><table id="t"><thead><tr>
<th>تاریخ</th><th>خط اول</th><th>بازدید</th><th>سیو/هزار</th><th>شیر/هزار</th><th>رد کردن٪</th><th>تماشا٪</th></tr></thead><tbody>${rows}</tbody></table></div></div>
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
