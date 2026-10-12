// maps.mjs · a map for the "location" story, drawn by the kit in the brand's colours from OpenStreetMap DATA (ODbL):
// streets, buildings, parks and water around the address, fetched once from the Overpass API and cached. No map tiles are
// used (the OSM tile server does not permit offline/static use). The credit "© OpenStreetMap contributors" is printed on
// every map, as the ODbL requires. Geocoding: one Nominatim request per address (identifying User-Agent, cached).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const UA = "ReelStudio/2 (+https://github.com/mjamali97/reelstudiokit)";
const CACHE = path.join(os.homedir(), ".cache/reel-studio/osm");
// public Overpass instances, tried in order (they are often busy); OVERPASS_URL puts yours first
const OVERPASS = [process.env.OVERPASS_URL, "https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"].filter(Boolean);
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const world = (lat, lon, z) => { const n = 256 * 2 ** z, r = (lat * Math.PI) / 180;   // web-mercator pixels
  return [((lon + 180) / 360) * n, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n]; };
const unworld = (x, y, z) => { const n = 256 * 2 ** z; return [(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI, (x / n) * 360 - 180]; };

async function cached(key, fetcher) {
  const f = path.join(CACHE, key); fs.mkdirSync(path.dirname(f), { recursive: true });
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  const data = await fetcher(); fs.writeFileSync(f, JSON.stringify(data)); return data;
}

export async function geocode(address) {
  const key = "geo/" + Buffer.from(address).toString("base64url").slice(0, 120) + ".json";
  const j = await cached(key, async () => {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`Nominatim ${r.status}`); return r.json();
  });
  if (!j[0]) throw new Error(`address not found on OpenStreetMap: "${address}" (give lat and lon instead)`);
  return { lat: +j[0].lat, lon: +j[0].lon };
}

async function osmData(s, w, n, e) {
  const bbox = [s, w, n, e].map((v) => v.toFixed(5)).join(",");
  const q = `[out:json][timeout:25];(way["highway"](${bbox});way["building"](${bbox});way["natural"="water"](${bbox});way["waterway"](${bbox});` +
    `way["leisure"~"park|garden|pitch"](${bbox});way["landuse"~"grass|forest|recreation_ground"](${bbox}););out geom;`;
  return cached(`overpass/${bbox}.json`, async () => {
    const errs = [];
    for (let round = 0; round < 2; round++) for (const url of OVERPASS) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "User-Agent": UA, "content-type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q), signal: AbortSignal.timeout(40000) });
        if (r.ok) return await r.json();
        errs.push(`${new URL(url).host} ${r.status}`);
      } catch (e) { errs.push(`${new URL(url).host} ${e.message}`); }
      await new Promise((ok) => setTimeout(ok, 1500));
    }
    throw new Error(`OpenStreetMap data unavailable right now (${errs.join("; ")}); try again later or set OVERPASS_URL`);
  });
}

const MAJOR = /^(motorway|trunk|primary|secondary|tertiary)(_link)?$/, MINOR = /^(residential|unclassified|living_street|service|road)$/, PATH = /^(footway|pedestrian|path|cycleway|steps|track)$/;

// the map as one SVG, w×h px, centred on lat/lon, in the brand colours
export async function mapSvg({ lat, lon, zoom = 17, w = 920, h = 700, colors = {} }) {
  const c = { bg: "#F3EFE8", ink: "#2B1D16", accent: "#E4572E", accent2: "#F2C14E", surface: "#FFFFFF", muted: "#8A7A70", ...colors };
  const [cx, cy] = world(lat, lon, zoom), x0 = cx - w / 2, y0 = cy - h / 2;
  const [n, wl] = unworld(x0, y0, zoom), [s, el] = unworld(x0 + w, y0 + h, zoom);
  const data = await osmData(s, wl, n, el);
  const pts = (geom) => geom.map((g) => { const [x, y] = world(g.lat, g.lon, zoom); return `${(x - x0).toFixed(1)},${(y - y0).toFixed(1)}`; }).join(" ");
  const layers = { park: [], water: [], building: [], casing: [], path: [], minor: [], major: [], labels: [] };
  let id = 0;
  for (const el of data.elements || []) {
    if (el.type !== "way" || !el.geometry) continue;
    const t = el.tags || {}, p = pts(el.geometry);
    if (t.building) layers.building.push(`<polygon points="${p}"/>`);
    else if (t.natural === "water") layers.water.push(`<polygon points="${p}"/>`);
    else if (t.waterway) layers.water.push(`<polyline points="${p}" fill="none" stroke-width="10"/>`);
    else if (t.leisure || t.landuse) layers.park.push(`<polygon points="${p}"/>`);
    else if (t.highway) {
      const kind = MAJOR.test(t.highway) ? "major" : MINOR.test(t.highway) ? "minor" : PATH.test(t.highway) ? "path" : null;
      if (!kind) continue;
      if (kind !== "path") layers.casing.push(`<polyline points="${p}" stroke-width="${kind === "major" ? 22 : 15}"/>`);
      const pid = `osm-r${id++}`;   // a <path>: Chrome runs a street name only along a path, not a polyline
      layers[kind].push(`<path id="${pid}" d="M${p.split(" ").join(" L")}"/>`);
      // a street name along the longer major/minor streets
      const len = el.geometry.reduce((a, g, i, A) => { if (!i) return 0; const [x1, y1] = world(A[i - 1].lat, A[i - 1].lon, zoom), [x2, y2] = world(g.lat, g.lon, zoom); return a + Math.hypot(x2 - x1, y2 - y1); }, 0);
      if (t.name && kind !== "path" && len > 260) layers.labels.push(`<text><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${esc(t.name)}</textPath></text>`);
    }
  }
  const mix = (a, b, k) => { const h2 = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h2(a), B = h2(b); return "#" + A.map((v, i) => Math.round(v * (1 - k) + B[i] * k).toString(16).padStart(2, "0")).join(""); };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
<rect width="${w}" height="${h}" fill="${mix(c.bg, c.ink, 0.04)}"/>
<g fill="${mix(c.bg, c.accent2, 0.35)}">${layers.park.join("")}</g>
<g fill="${mix(c.bg, "#7FB3D5", 0.55)}" stroke="${mix(c.bg, "#7FB3D5", 0.55)}">${layers.water.join("")}</g>
<g fill="${mix(c.bg, c.ink, 0.12)}">${layers.building.join("")}</g>
<g fill="none" stroke="${mix(c.bg, c.ink, 0.22)}" stroke-linecap="round" stroke-linejoin="round">${layers.casing.join("")}</g>
<g fill="none" stroke="${mix(c.bg, c.ink, 0.3)}" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round">${layers.path.join("")}</g>
<g fill="none" stroke="${c.surface}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">${layers.minor.join("")}</g>
<g fill="none" stroke="${mix(c.surface, c.accent2, 0.35)}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">${layers.major.join("")}</g>
<g fill="${mix(c.ink, c.bg, 0.25)}" style="font-family:var(--body)" font-size="22" font-weight="600" paint-order="stroke" stroke="${c.surface}" stroke-width="5" dominant-baseline="central">${layers.labels.join("")}</g>
</svg>`;
}

// fill every story frame with template "location" before rendering (templates are synchronous)
export async function resolveMaps(spec, brand) {
  for (const f of spec.frames || []) {
    if (f.template !== "location" || f._map) continue;
    if (!(Number.isFinite(f.lat) && Number.isFinite(f.lon))) { if (!f.address) throw new Error("location story: give an address or lat and lon"); Object.assign(f, await geocode(f.address)); }
    f._map = await mapSvg({ lat: f.lat, lon: f.lon, zoom: f.zoom || 17, colors: brand?.colors });
  }
  return spec;
}
