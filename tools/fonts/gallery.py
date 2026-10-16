#!/usr/bin/env python3
"""Write fonts/gallery.html: every font of the library in Persian, Arabic and Latin samples, each weight.

    python3 -I tools/fonts/gallery.py      # then open fonts/gallery.html, or screenshot it with tools/capture/webcap.mjs
/setup shows this page when the owner picks a font for their brand.
"""
import html, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
F = json.loads((ROOT / "fonts/fonts.json").read_text(encoding="utf-8"))
SAMPLE = {
    "persian": "کیک تولد سه طبقه، با ۲۰ درصد تخفیف",
    "arabic": "كعكة عيد ميلاد بثلاث طبقات، بخصم ٢٠٪",
    "latin": "Three-layer birthday cake, 20% off · Pasta · Gâteau · Torte",
}
rows = []
for f in F:
    links = f'<link rel="stylesheet" href="{f["id"]}/font.css">'
    samples = []
    for s in f["scripts"]:
        if s not in SAMPLE:
            continue
        rtl = s in ("persian", "arabic")
        for w in f["weights"]:
            samples.append(f'<div class="s" dir="{"rtl" if rtl else "ltr"}" style="font-family:\'{f["name"]}\';font-weight:{w}">'
                           f'<span class="w">{w}</span>{html.escape(SAMPLE[s])}</div>')
    rows.append(f'{links}<section><header><b>{html.escape(f["name"])}</b><span>{f["kind"]} · {", ".join(f["scripts"])} · {f["kb"]} KB · OFL</span>'
                f'<code>fonts/{f["id"]}/font.css</code></header><p>{html.escape(f["note"])}</p>{"".join(samples)}</section>')
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Font library</title><style>
:root{{--bg:#f6f5f1;--ink:#16181c;--muted:#5d6470;--line:#e3e1da;--card:#fff}}
@media (prefers-color-scheme:dark){{:root{{--bg:#101418;--ink:#f2f0ea;--muted:#a9b0b8;--line:#2a3036;--card:#161b20}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif}}main{{max-width:1100px;margin:0 auto;padding:24px 16px}}
h1{{margin:0 0 4px}}section{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}}
header{{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}}header span{{color:var(--muted)}}code{{margin-inline-start:auto;color:var(--muted)}}p{{margin:4px 0 8px;color:var(--muted)}}
.s{{font-size:34px;line-height:1.5;padding:2px 0;border-top:1px dashed var(--line);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}.w{{font:12px system-ui;color:var(--muted);display:inline-block;width:42px}}
</style></head><body><main><h1>Font library</h1><p>{len(F)} families, all SIL Open Font License 1.1 (free to use in videos, images and web pages; the licence file is in each folder).
Use one in your brand by pointing <code>tools/style-reel/assets/fonts.css</code> and <code>brand/tokens.css</code> at its <code>font.css</code>.</p>
{"".join(rows)}</main></body></html>"""
(ROOT / "fonts/gallery.html").write_text(page, encoding="utf-8")
print("fonts/gallery.html:", len(F), "families")
