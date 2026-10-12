// stories.mjs · 10 Instagram story templates (1080×1920) + highlight covers (1080×1080).
// Content stays inside the safe zone (y 250–1600); templates that need a sticker (poll, question, link, countdown) leave an
// empty, marked space for it, because stickers are added in the Instagram app.
import { esc, img, digits, icon, RTL } from "./lib.mjs";

export const SIZE = { w: 1080, h: 1920 };
export const HL_SIZE = { w: 1080, h: 1080 };

export const CSS = `
.ill{display:flex;justify-content:center}.ill svg{max-width:100%}
.map{position:relative;height:700px;border-radius:var(--r);overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.14);flex:none}
.map .pin{position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);filter:drop-shadow(0 8px 10px rgba(0,0,0,.35))}
.map .pin svg{fill:var(--surface)}
.map .osm{position:absolute;right:0;bottom:0;background:rgba(255,255,255,.85);color:#333;font:500 22px/1 var(--body);padding:8px 14px}
.st{position:absolute;inset:0;overflow:hidden}
.bar{position:absolute;top:250px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center;font:700 34px/1 var(--body)}
.chip{background:var(--accent);color:var(--surface);border-radius:999px;padding:14px 30px 17px;font:800 34px/1 var(--display)}
.zone{position:absolute;left:80px;right:80px;top:380px;bottom:320px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.big{font:900 120px/1.05 var(--display);letter-spacing:-.01em}.t1{font:800 86px/1.12 var(--display)}.t2{font:700 52px/1.35 var(--body)}
.mut{color:var(--muted)}.acc{color:var(--accent)}
.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,.05) 40%,rgba(0,0,0,.62) 62%,rgba(0,0,0,.82) 100%)}
.light{color:#fff}.light .mut{color:rgba(255,255,255,.8)}
.sticker{border:5px dashed color-mix(in srgb,var(--ink) 35%,transparent);border-radius:36px;height:300px;display:grid;place-items:center;font:700 32px/1.3 var(--body);color:var(--muted);text-align:center;padding:0 40px}
.card{background:var(--surface);color:var(--ink);border-radius:var(--r);padding:48px;box-shadow:0 24px 60px rgba(0,0,0,.12)}
.price{display:inline-block;background:var(--ink);color:var(--bg);border-radius:999px;padding:18px 40px 22px;font:900 64px/1 var(--display)}
.stars{color:var(--accent2);font-size:72px;letter-spacing:8px}
.foot{position:absolute;bottom:250px;left:80px;right:80px;display:flex;justify-content:space-between;font:600 30px/1 var(--body);color:var(--muted)}
.arrow{font:900 120px/1 var(--display);color:var(--accent);text-align:center}
`;

const shell = (ctx, inner, { chip, dark = false, photo } = {}) => `<div class="st${dark ? " light" : ""}">${photo ? `<img class="ph" src="${img(photo, ctx.base)}"><div class="shade"></div>` : ""}
<div class="bar"><span>${esc(ctx.brand.name)}</span>${chip ? `<span class="chip">${esc(chip)}</span>` : ""}</div>${inner}
<div class="foot" ${dark ? 'style="color:rgba(255,255,255,.8)"' : ""}><span dir="ltr">${esc(ctx.brand.handle || "")}</span><span></span></div></div>`;
const stickerBox = (label) => `<div class="sticker">${esc(label)}</div>`;

export const TEMPLATES = {
  special: { about: "Today's special: photo, name, price, an order link sticker.", data: '{"chip": "Today", "image": "cake.jpg", "title": "...", "price": "...", "text": "...", "sticker": "Link sticker → order page"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone" style="justify-content:flex-end;gap:26px"><div class="big" style="font-size:104px">${esc(d.title)}</div>
${d.text ? `<div class="t2 mut">${esc(d.text)}</div>` : ""}${d.price ? `<div><span class="price">${esc(digits(d.price, ctx.lang))}</span></div>` : ""}${d.sticker ? stickerBox(d.sticker) : ""}</div>`, { chip: d.chip, dark: !!d.image, photo: d.image }) },
  poll: { about: "A question with space for the poll sticker.", data: '{"chip": "Poll", "title": "Which cake next week?", "options": ["Pistachio", "Saffron"], "sticker": "Poll sticker here"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone"><div class="t1">${esc(d.title)}</div>${(d.options || []).length ? `<div class="t2 mut">${d.options.map(esc).join(" · ")}</div>` : ""}${stickerBox(d.sticker || "Poll sticker")}</div>`, { chip: d.chip || "Poll" }) },
  question: { about: "Ask-me-anything with space for the question box.", data: '{"chip": "Q&A", "title": "Ask us anything about ...", "text": "...", "sticker": "Question box here"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone">${d.illustration ? `<div class="ill" style="height:420px">${d.illustration}</div>` : `<div style="font:900 200px/1 var(--display)" class="acc">?</div>`}<div class="t1">${esc(d.title)}</div>${d.text ? `<div class="t2 mut">${esc(d.text)}</div>` : ""}${stickerBox(d.sticker || "Question box")}</div>`, { chip: d.chip }) },
  offer: { about: "A limited offer with a real end date and a countdown sticker.", data: '{"chip": "Offer", "big": "-20%", "title": "...", "until": "until Friday", "sticker": "Countdown sticker"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone" style="text-align:center;align-items:center"><div style="font:900 300px/1 var(--display)" class="acc">${esc(digits(d.big || "", ctx.lang))}</div>
<div class="t1">${esc(d.title)}</div>${d.until ? `<div class="t2 mut">${esc(d.until)}</div>` : ""}<div style="width:100%">${stickerBox(d.sticker || "Countdown sticker")}</div></div>`, { chip: d.chip }) },
  "new-arrival": { about: "A new product: photo, NEW badge, name.", data: '{"chip": "New", "image": "a.jpg", "title": "...", "text": "..."}',
    frame: (d, ctx) => shell(ctx, `<div class="zone" style="justify-content:flex-end"><div class="big">${esc(d.title)}</div>${d.text ? `<div class="t2 mut">${esc(d.text)}</div>` : ""}</div>`, { chip: d.chip || "New", dark: !!d.image, photo: d.image }) },
  tip: { about: "One useful tip on a card.", data: '{"chip": "Tip", "n": 1, "title": "...", "text": "..."}',
    frame: (d, ctx) => shell(ctx, `<div class="zone"><div style="font:900 240px/0.9 var(--display)" class="acc">${digits(String(d.n ?? 1).padStart(2, "0"), ctx.lang)}</div>
<div class="card"><div class="t1" style="font-size:70px;margin-bottom:22px">${esc(d.title)}</div><div class="t2 mut">${esc(d.text || "")}</div></div>
${d.illustration ? `<div class="ill" style="height:420px">${d.illustration}</div>` : ""}</div>`, { chip: d.chip }) },
  review: { about: "A real customer review (with consent).", data: '{"chip": "Review", "quote": "...", "name": "...", "stars": 5}',
    frame: (d, ctx) => shell(ctx, `<div class="zone"><div class="stars">${"★".repeat(Math.max(0, Math.min(5, d.stars ?? 5)))}</div><div class="t1" style="font-weight:700">“${esc(d.quote)}”</div><div class="t2 mut">— ${esc(d.name || "")}</div></div>`, { chip: d.chip }) },
  behind: { about: "A behind-the-scenes photo with a caption strip.", data: '{"chip": "Behind the scenes", "image": "kitchen.jpg", "title": "...", "text": "..."}',
    frame: (d, ctx) => shell(ctx, `<div class="zone" style="justify-content:flex-end"><div class="t1">${esc(d.title)}</div>${d.text ? `<div class="t2 mut">${esc(d.text)}</div>` : ""}</div>`, { chip: d.chip, dark: !!d.image, photo: d.image }) },
  event: { about: "An event: what, when, where.", data: '{"chip": "Event", "title": "...", "date": "Sat 14 Dec", "time": "18:00", "place": "...", "sticker": "Reminder sticker"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone"><div class="t1">${esc(d.title)}</div><div class="card" style="display:grid;gap:24px">
${[["calendar", d.date], ["clock", d.time], ["map-pin", d.place]].filter(([, v]) => v).map(([ic, v]) => `<div style="display:flex;gap:24px;align-items:center" class="t2">${icon(ic, "var(--accent)", 64)}<span>${esc(digits(v, ctx.lang))}</span></div>`).join("")}</div>
${d.sticker ? stickerBox(d.sticker) : ""}</div>`, { chip: d.chip }) },
  link: { about: "Point to the link sticker (order, menu, booking).", data: '{"chip": "Order", "title": "Order in one tap", "items": ["...", "..."], "sticker": "Link sticker → ..."}',
    frame: (d, ctx) => shell(ctx, `<div class="zone"><div class="t1">${esc(d.title)}</div>${(d.items || []).map((x) => `<div class="t2" style="display:flex;gap:18px;align-items:center">${icon("check", "var(--accent)", 52)}<span>${esc(x)}</span></div>`).join("")}
<div class="arrow">↓</div>${stickerBox(d.sticker || "Link sticker")}</div>`, { chip: d.chip }) },
  location: { about: "Where to find you: a map drawn in your colours from OpenStreetMap data, with a pin (address or lat/lon; © OpenStreetMap contributors).", data: '{"chip": "Find us", "title": "...", "address": "12 Main St, City", "text": "Open every day 8–19", "zoom": 17, "sticker": "Location sticker"}',
    frame: (d, ctx) => shell(ctx, `<div class="zone" style="justify-content:flex-start;top:360px;gap:28px"><div class="t1">${esc(d.title || "")}</div>
<div class="map">${d._map || ""}<div class="pin">${icon("map-pin", "var(--accent)", 120)}</div><div class="osm" dir="ltr">© OpenStreetMap contributors</div></div>
${d.text ? `<div class="t2 mut">${esc(d.text)}</div>` : ""}${d.sticker ? `<div class="sticker" style="height:140px">${esc(d.sticker)}</div>` : ""}</div>`, { chip: d.chip || "Find us" }) },
};

// highlight covers: an icon on the brand colour; Instagram crops them to a circle (keep the icon in the middle 60 %)
export const HL_CSS = `.hl{position:absolute;inset:0;display:grid;place-items:center}.hl .in{display:grid;place-items:center;gap:30px;text-align:center}
.hl .lb{font:800 64px/1 var(--display)}`;
export const HL_STYLES = ["solid", "soft", "outline"];
export function highlight(d, ctx, style = "solid") {
  const bg = style === "solid" ? "var(--accent)" : style === "soft" ? "color-mix(in srgb,var(--accent) 16%,var(--bg))" : "var(--bg)";
  const fg = style === "solid" ? "var(--surface)" : "var(--accent)";
  return `<div class="hl" style="background:${bg}">${style === "outline" ? `<div style="position:absolute;inset:150px;border:16px solid var(--accent);border-radius:50%"></div>` : ""}
<div class="in" style="color:${fg}">${icon(d.icon || "star", fg, d.label ? 360 : 470)}${d.label && ctx.labels ? `<div class="lb">${esc(d.label)}</div>` : ""}</div></div>`;
}
// suggested highlight sets per kind of business (icons from Lucide, ISC licence)
export const HL_SETS = {
  food: [["utensils", "Menu"], ["tag", "Prices"], ["shopping-bag", "Order"], ["star", "Reviews"], ["map-pin", "Location"], ["clock", "Hours"], ["chef-hat", "Kitchen"], ["gift", "Offers"]],
  shop: [["shirt", "New in"], ["tag", "Prices"], ["ruler", "Sizes"], ["truck", "Delivery"], ["star", "Reviews"], ["refresh-ccw", "Returns"], ["message-circle-question", "FAQ"], ["gift", "Offers"]],
  service: [["calendar-check", "Booking"], ["tag", "Prices"], ["images", "Work"], ["star", "Reviews"], ["map-pin", "Location"], ["message-circle-question", "FAQ"], ["users", "Team"], ["gift", "Offers"]],
  creator: [["play", "Start here"], ["bookmark", "Guides"], ["lightbulb", "Tips"], ["star", "Results"], ["message-circle-question", "Q&A"], ["mail", "Contact"], ["gift", "Free"], ["user", "About"]],
};
