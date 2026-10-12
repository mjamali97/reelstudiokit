// illustrations.mjs · public-domain (CC0) illustrations, recoloured to the brand.
//   "doodle:<name>"       Open Doodles by Pablo Stanley (CC0), 32 drawings in assets/illustrations/open-doodles/
//   "peep:<seed>"         Open Peeps by Pablo Stanley (CC0), a hand-drawn person generated from any word (DiceBear, MIT code)
//   "notionists:<seed>"   Notionists by Zoish (CC0) · "lorelei:<seed>" Lorelei by Lisa Wischofsky (CC0) · "thumbs:<seed>" (CC0)
// The same seed always gives the same person, so a brand can keep "its" characters (e.g. peep:sara, peep:barista).
// Only CC0 styles are installed on purpose; DiceBear's CC BY styles need a credit line and are left out.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const DOODLES = path.join(ROOT, "assets/illustrations/open-doodles");
let DB = null;   // DiceBear, loaded on first use
async function dicebear() {
  if (DB) return DB;
  const [core, peeps, notionists, lorelei, thumbs] = await Promise.all(["@dicebear/core", "@dicebear/open-peeps", "@dicebear/notionists", "@dicebear/lorelei", "@dicebear/thumbs"].map((m) => import(m)));
  DB = { core, styles: { peep: peeps, notionists, lorelei, thumbs } };
  return DB;
}
export const doodles = () => (fs.existsSync(DOODLES) ? fs.readdirSync(DOODLES).filter((f) => f.endsWith(".svg")).map((f) => f.replace(/\.svg$/, "")) : []);

// one SVG string, sized to fill its box; colours: ink = the line colour, accent = the one highlight colour
export async function illustration(ref, { ink = "#111111", accent = "#E4572E", bg = "transparent" } = {}) {
  const [kind, ...rest] = String(ref).split(":"), name = rest.join(":");
  let svg;
  if (kind === "doodle") {
    const p = path.join(DOODLES, `${name}.svg`);
    if (!fs.existsSync(p)) throw new Error(`no doodle "${name}" (one of: ${doodles().join(", ")})`);
    svg = fs.readFileSync(p, "utf8").replace(/<\?xml[^>]*>|<!--[\s\S]*?-->|<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, "")
      .replace(/#FF5678/gi, accent).replace(/#000000\b/gi, ink).replace(/(fill|stroke)="#000"(?=[\s/>])/gi, `$1="${ink}"`);
  } else {
    const { core, styles } = await dicebear();
    if (!styles[kind]) throw new Error(`unknown illustration "${ref}": use doodle:<name>, peep:<seed>, notionists:<seed>, lorelei:<seed> or thumbs:<seed>`);
    const hex = (c) => String(c).replace(/^#/, "");
    const opts = { seed: name || "brand", backgroundColor: bg === "transparent" ? [] : [hex(bg)] };
    if (kind === "thumbs") Object.assign(opts, { shapeColor: [hex(accent)] });
    svg = core.createAvatar(styles[kind], opts).toString();
  }
  return svg.replace(/<svg\b([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "")} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`);
}

// resolve every "illustration" field in a spec before rendering (templates are synchronous)
export async function resolveIllustrations(spec, brand) {
  const c = brand.colors, opts = { ink: c.ink, accent: c.accent }, onAccent = { ink: c.surface, accent: c.accent2 || c.ink };
  const walk = async (o, inv) => {
    if (Array.isArray(o)) { for (const x of o) await walk(x, inv); return; }
    if (!o || typeof o !== "object") return;
    if (typeof o.illustration === "string" && !o.illustration.startsWith("<svg")) o.illustration = await illustration(o.illustration, inv ? onAccent : opts);
    for (const [k, v] of Object.entries(o)) await walk(v, inv || k === "cta");   // the closing slide sits on the accent colour
  };
  await walk(spec, false);
  return spec;
}
