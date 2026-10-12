// carousels.mjs · 10 Instagram carousel templates (1080×1350, 4:5). Every deck = cover → content slides → closing CTA.
// A spec chooses one template and fills it; the brand (brand/brand.json) gives colours, fonts and handle.
import { esc, img, digits, icon, swipe, RTL } from "./lib.mjs";

export const SIZE = { w: 1080, h: 1350 };
// split into slides of at most n, evenly (6 items at most 5 per slide → 3 + 3, never 5 + 1)
const chunk = (a, n) => { const k = Math.ceil(a.length / n), size = Math.ceil(a.length / k); return a.reduce((o, x, i) => (i % size ? o[o.length - 1].push(x) : o.push([x]), o), []); };

export const CSS = `
.s{position:absolute;inset:0;padding:96px 88px 120px;display:flex;flex-direction:column;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:center;font:700 26px/1 var(--body);color:var(--muted);letter-spacing:.02em}
.kick{display:inline-block;align-self:flex-start;background:var(--accent);color:var(--surface);font:800 30px/1 var(--display);padding:16px 26px 18px;border-radius:999px}
.foot{position:absolute;left:88px;right:88px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font:600 24px/1 var(--body);color:var(--muted)}
.swipe{position:absolute;bottom:40px;right:88px;width:84px;height:84px;border-radius:50%;background:var(--ink);color:var(--bg);display:grid;place-items:center;font:700 44px/1 var(--body)}
.blob{position:absolute;border-radius:50%;background:var(--accent);opacity:.12}
.h1{font:800 118px/1.08 var(--display);letter-spacing:-.01em;max-height:660px}
.h2{font:800 86px/1.12 var(--display);max-height:420px}
.h3{font:800 54px/1.2 var(--display)}
.p{font:500 44px/1.5 var(--body)}
.mut{color:var(--muted)}
.card{background:var(--surface);border-radius:var(--r);padding:44px;box-shadow:0 18px 50px rgba(0,0,0,.08)}
.num{font:900 260px/0.9 var(--display);color:var(--accent)}
.pill{display:inline-block;background:var(--ink);color:var(--bg);border-radius:999px;padding:16px 34px 20px;font:800 54px/1 var(--display)}
.photo{width:100%;object-fit:cover;border-radius:var(--r);display:block}
.grow{flex:1;display:flex;flex-direction:column;justify-content:center;gap:34px}
.row{display:flex;gap:28px;align-items:center}
.tag{display:inline-block;align-self:flex-start;border:3px solid var(--accent);color:var(--accent);border-radius:999px;padding:6px 18px 9px;font:800 26px/1 var(--body)}
.cta{background:var(--accent);color:var(--surface)}.cta .foot,.cta .top{color:color-mix(in srgb,var(--surface) 80%,transparent)}
.cta .pill{background:var(--surface);color:var(--accent);font-size:72px;padding:22px 48px 28px}
.ic{display:inline-grid;place-items:center;width:96px;height:96px;border-radius:28px;background:color-mix(in srgb,var(--accent) 14%,transparent)}
.ck{width:58px;height:58px;border-radius:16px;border:5px solid var(--accent);display:grid;place-items:center;flex:none}
.stars{color:var(--accent2);font-size:52px;letter-spacing:6px}
table{width:100%;border-collapse:separate;border-spacing:0 16px}td,th{padding:22px 24px;font:600 36px/1.3 var(--body);text-align:start;vertical-align:middle}
th{font:800 38px/1.2 var(--display);color:var(--muted)}td{background:var(--surface)}td:first-child{border-start-start-radius:20px;border-end-start-radius:20px;font-weight:800}
td:last-child{border-start-end-radius:20px;border-end-end-radius:20px}
`;

const frame = (ctx, i, n, inner, cls = "") => `<div class="s ${cls}">
<div class="top"><span>${esc(ctx.brand.name)}</span><span dir="ltr">${digits(`${i + 1} / ${n}`, ctx.lang)}</span></div>${inner}
<div class="foot" dir="ltr"><span dir="ltr">${esc(ctx.brand.handle || "")}</span><span></span></div>${i < n - 1 ? swipe(ctx.lang) : ""}</div>`;

const cover = (c, ctx, i, n) => frame(ctx, i, n, `<div class="blob" style="width:720px;height:720px;inset-inline-end:-260px;top:-180px"></div>
<div class="grow">${c.kicker ? `<span class="kick">${esc(c.kicker)}</span>` : ""}<div class="h1 fit" data-fit="60" style="max-height:640px">${esc(c.title)}</div>
${c.sub ? `<div class="p mut" style="font-size:44px">${esc(c.sub)}</div>` : ""}${c.image ? `<img class="photo" style="height:360px" src="${img(c.image, ctx.base)}">` : ""}</div>`);

const cta = (c, ctx, i, n) => frame(ctx, i, n, `<div class="grow" style="align-items:flex-start">
<div class="h2 fit" data-fit="48">${esc(c.title || "")}</div>${c.text ? `<div class="p" style="opacity:.9">${esc(c.text)}</div>` : ""}
${c.word ? `<span class="pill">${esc(c.word)}</span>` : ""}
<div class="row" style="margin-top:20px;gap:40px;font:700 34px/1 var(--body)">${icon("bookmark", "currentColor", 56)}<span>${esc(c.save || "")}</span>${icon("send", "currentColor", 56)}<span>${esc(c.share || "")}</span></div></div>`, "cta");

// ---------- the 10 templates: each turns spec.items into content slides ----------
export const TEMPLATES = {
  tips: { about: "Numbered tips, one per slide (title + text).", item: '{"title": "...", "text": "..."}',
    slides: (s, ctx) => s.items.map((it, k) => (i, n) => frame(ctx, i, n, `<div class="grow"><div class="num">${digits(String(k + 1).padStart(2, "0"), ctx.lang)}</div>
<div class="h2 fit" data-fit="44">${esc(it.title)}</div><div class="p mut fit" data-fit="28" style="max-height:420px">${esc(it.text || "")}</div></div>`)) },
  steps: { about: "A how-to: step N with an optional photo.", item: '{"title": "...", "text": "...", "image": "optional.jpg"}',
    slides: (s, ctx) => s.items.map((it, k) => (i, n) => frame(ctx, i, n, `<div class="grow" style="gap:26px"><span class="tag">${esc(s.stepWord || "Step")} ${digits(k + 1, ctx.lang)}</span>
${it.image ? `<img class="photo" style="height:470px" src="${img(it.image, ctx.base)}">` : ""}<div class="h3 fit" data-fit="40">${esc(it.title)}</div>
<div class="p mut fit" data-fit="28" style="max-height:${it.image ? 220 : 520}px">${esc(it.text || "")}</div></div>`)) },
  "myth-fact": { about: "A common belief, then the truth.", item: '{"myth": "...", "fact": "..."}',
    slides: (s, ctx) => s.items.map((it) => (i, n) => frame(ctx, i, n, `<div class="grow">
<div class="card" style="background:color-mix(in srgb,var(--muted) 14%,var(--bg));box-shadow:none"><div class="row" style="margin-bottom:16px">${icon("x", "#C0392B", 56)}<b class="h3" style="font-size:42px;color:#C0392B">${esc(s.mythWord || "Myth")}</b></div>
<div class="p fit" data-fit="28" style="text-decoration:line-through;text-decoration-color:color-mix(in srgb,#C0392B 60%,transparent);max-height:300px">${esc(it.myth)}</div></div>
<div class="card"><div class="row" style="margin-bottom:16px">${icon("check", "#2E8B57", 56)}<b class="h3" style="font-size:42px;color:#2E8B57">${esc(s.factWord || "Fact")}</b></div>
<div class="p fit" data-fit="28" style="max-height:360px">${esc(it.fact)}</div></div></div>`)) },
  "before-after": { about: "Two photos per slide with labels.", item: '{"before": "a.jpg", "after": "b.jpg", "caption": "..."}',
    slides: (s, ctx) => s.items.map((it) => (i, n) => frame(ctx, i, n, `<div class="grow" style="gap:22px"><div class="row" style="gap:22px;align-items:stretch">
${[["before", s.beforeWord || "Before"], ["after", s.afterWord || "After"]].map(([k, l]) => `<div style="flex:1;position:relative"><img class="photo" style="height:760px" src="${img(it[k], ctx.base)}">
<span class="kick" style="position:absolute;top:22px;inset-inline-start:22px;${k === "before" ? "background:var(--ink);color:var(--bg)" : ""}">${esc(l)}</span></div>`).join("")}</div>
${it.caption ? `<div class="h3 fit" data-fit="34" style="font-size:46px">${esc(it.caption)}</div>` : ""}</div>`)) },
  "price-menu": { about: "A menu or price list, 4 items per slide.", item: '{"name": "...", "price": "...", "desc": "optional", "tag": "optional (new, best seller)"}',
    slides: (s, ctx) => chunk(s.items, 4).map((grp) => (i, n) => frame(ctx, i, n, `<div class="grow" style="gap:22px">${s.listTitle ? `<div class="h3">${esc(s.listTitle)}</div>` : ""}
${grp.map((it) => `<div class="card" style="padding:30px 36px"><div class="row" style="justify-content:space-between;gap:20px"><div style="flex:1"><div style="font:800 44px/1.2 var(--display)">${esc(it.name)} ${it.tag ? `<span class="tag" style="vertical-align:middle">${esc(it.tag)}</span>` : ""}</div>
${it.desc ? `<div class="p mut" style="font-size:30px;margin-top:6px">${esc(it.desc)}</div>` : ""}</div><div style="font:900 50px/1 var(--display);color:var(--accent);white-space:nowrap">${esc(digits(it.price, ctx.lang))}</div></div></div>`).join("")}</div>`)) },
  faq: { about: "Question and answer cards, one per slide.", item: '{"q": "...", "a": "..."}',
    slides: (s, ctx) => s.items.map((it) => (i, n) => frame(ctx, i, n, `<div class="grow"><div class="row">${`<span class="ic">${icon("message-circle-question", "var(--accent)", 60)}</span>`}</div>
<div class="h2 fit" data-fit="40" style="font-size:66px;max-height:360px">${esc(it.q)}</div><div class="card"><div class="p fit" data-fit="28" style="max-height:470px">${esc(it.a)}</div></div></div>`)) },
  comparison: { about: "A vs B, a table of rows (4 per slide).", item: '{"label": "...", "a": "...", "b": "..."}',
    slides: (s, ctx) => chunk(s.items, 4).map((grp) => (i, n) => frame(ctx, i, n, `<div class="grow"><table><tr><th></th><th>${esc(s.compare?.a || "A")}</th><th style="color:var(--accent)">${esc(s.compare?.b || "B")}</th></tr>
${grp.map((it) => `<tr><td>${esc(it.label)}</td><td>${esc(it.a)}</td><td style="color:var(--accent);font-weight:800">${esc(it.b)}</td></tr>`).join("")}</table></div>`)) },
  testimonial: { about: "Customer quotes with stars (only real ones, with consent).", item: '{"quote": "...", "name": "...", "stars": 5}',
    slides: (s, ctx) => s.items.map((it) => (i, n) => frame(ctx, i, n, `<div class="grow"><div style="font:900 220px/0.6 var(--display);color:var(--accent);height:110px">“</div>
<div class="h3 fit" data-fit="34" style="font-weight:700;max-height:620px">${esc(it.quote)}</div><div class="stars">${"★".repeat(Math.max(0, Math.min(5, it.stars ?? 5)))}</div>
<div class="p mut">— ${esc(it.name || "")}</div></div>`)) },
  checklist: { about: "A checklist, up to 6 items per slide.", item: '{"text": "..."}',
    slides: (s, ctx) => chunk(s.items, 6).map((grp) => (i, n) => frame(ctx, i, n, `<div class="grow" style="gap:40px">${s.listTitle ? `<div class="h2">${esc(s.listTitle)}</div>` : ""}
${grp.map((it) => `<div class="row" style="align-items:flex-start;gap:28px"><span class="ck" style="width:72px;height:72px">${icon("check", "var(--accent)", 52)}</span><span class="p" style="font-weight:600;font-size:50px;color:var(--ink)">${esc(it.text)}</span></div>`).join("")}</div>`)) },
  showcase: { about: "One product per slide: big photo, name, price, points.", item: '{"image": "a.jpg", "name": "...", "price": "...", "points": ["...", "..."]}',
    slides: (s, ctx) => s.items.map((it) => (i, n) => frame(ctx, i, n, `<div class="grow" style="gap:24px">${it.image ? `<img class="photo" style="height:640px" src="${img(it.image, ctx.base)}">` : ""}
<div class="row" style="justify-content:space-between"><div class="h3 fit" data-fit="36">${esc(it.name)}</div>${it.price ? `<span class="pill" style="font-size:44px">${esc(digits(it.price, ctx.lang))}</span>` : ""}</div>
${(it.points || []).slice(0, 3).map((p) => `<div class="row p" style="font-size:34px;gap:16px">${icon("sparkles", "var(--accent)", 40)}<span>${esc(p)}</span></div>`).join("")}</div>`)) },
};

export function build(spec, ctx) {
  const t = TEMPLATES[spec.template];
  if (!t) throw new Error(`unknown carousel template "${spec.template}" (one of: ${Object.keys(TEMPLATES).join(", ")})`);
  const parts = [...(spec.cover ? [(i, n) => cover(spec.cover, ctx, i, n)] : []), ...t.slides(spec, ctx), ...(spec.cta ? [(i, n) => cta(spec.cta, ctx, i, n)] : [])];
  if (parts.length > 20) throw new Error("Instagram carousels hold at most 20 slides");
  return parts.map((f, i) => f(i, parts.length));
}
