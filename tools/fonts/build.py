#!/usr/bin/env python3
"""Build the kit's font library (fonts/) from npm packages. Every family is SIL OFL 1.1; the licence file ships next to it.

    python3 -I tools/fonts/build.py          # downloads, writes fonts/<id>/{*.woff2,font.css,OFL.txt} and fonts/fonts.json

Only open-licence fonts. To add one: add a row to FAMILIES (fontsource id or a Persian package), run the script, check
fonts/gallery.html (tools/fonts/gallery.py), commit.
"""
import io, json, re, shutil, tarfile, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "fonts"
REG = "https://registry.npmjs.org/"

# id, display name, scripts, kind, weights wanted, note
FAMILIES = [
    ("vazirmatn", "Vazirmatn", ["persian", "arabic", "latin"], "sans", [400, 700, 900], "Clean Persian sans; the kit's default for Persian."),
    ("estedad", "Estedad", ["persian", "arabic", "latin"], "sans", [400, 700, 900], "Geometric Persian sans, strong for titles."),
    ("shabnam", "Shabnam", ["persian", "latin"], "sans", [400, 700], "Soft Persian sans for body text and captions."),
    ("sahel", "Sahel", ["persian", "latin"], "sans", [400, 700, 900], "Friendly Persian sans with a heavy weight."),
    ("samim", "Samim", ["persian", "latin"], "sans", [400, 700], "Compact Persian sans for dense text."),
    ("lalezar", "Lalezar", ["persian", "arabic", "latin"], "display", [400], "Bold Persian display face for big words."),
    ("markazi-text", "Markazi Text", ["persian", "arabic", "latin"], "serif", [400, 700], "Persian/Arabic serif for an editorial look."),
    ("noto-kufi-arabic", "Noto Kufi Arabic", ["arabic", "persian"], "sans", [400, 700, 900], "Kufi sans, wide support."),
    ("noto-naskh-arabic", "Noto Naskh Arabic", ["arabic", "persian"], "serif", [400, 700], "Naskh for long reading."),
    ("amiri", "Amiri", ["arabic", "latin"], "serif", [400, 700], "Classical Naskh serif."),
    ("cairo", "Cairo", ["arabic", "latin"], "sans", [400, 700, 900], "Popular Arabic sans with Latin."),
    ("tajawal", "Tajawal", ["arabic", "latin"], "sans", [400, 700, 900], "Light, modern Arabic sans."),
    ("almarai", "Almarai", ["arabic"], "sans", [400, 700, 800], "Very readable Arabic sans for UI and captions."),
    ("reem-kufi", "Reem Kufi", ["arabic", "latin"], "display", [400, 700], "Geometric Kufi display."),
    ("ibm-plex-sans-arabic", "IBM Plex Sans Arabic", ["arabic", "latin"], "sans", [400, 700], "Corporate, neutral Arabic sans."),
    ("readex-pro", "Readex Pro", ["arabic", "latin"], "sans", [400, 700], "Arabic + Latin, designed for readability."),
    ("rubik", "Rubik", ["arabic", "latin"], "sans", [400, 700, 900], "Rounded sans, Arabic + Latin."),
    ("inter", "Inter", ["latin"], "sans", [400, 700, 900], "Neutral Latin UI sans (Turkish, German, French, Italian)."),
    ("space-grotesk", "Space Grotesk", ["latin"], "sans", [400, 700], "Techy grotesk."),
    ("montserrat", "Montserrat", ["latin"], "sans", [400, 700, 900], "Geometric sans, strong headlines."),
    ("bricolage-grotesque", "Bricolage Grotesque", ["latin"], "sans", [400, 700, 800], "Characterful grotesk."),
    ("syne", "Syne", ["latin"], "display", [400, 700, 800], "Wide, artsy display."),
    ("bebas-neue", "Bebas Neue", ["latin"], "display", [400], "Tall condensed caps for big words."),
    ("archivo-black", "Archivo Black", ["latin"], "display", [400], "Heavy grotesk for slams."),
    ("playfair-display", "Playfair Display", ["latin"], "serif", [400, 700, 900], "High-contrast editorial serif."),
    ("dm-serif-display", "DM Serif Display", ["latin"], "serif", [400], "Elegant display serif."),
    ("fraunces", "Fraunces", ["latin"], "serif", [400, 700, 900], "Soft, warm serif."),
    ("instrument-serif", "Instrument Serif", ["latin"], "serif", [400], "Condensed modern serif."),
    ("bodoni-moda", "Bodoni Moda", ["latin"], "serif", [400, 700, 900], "Fashion-magazine Bodoni (the Vogue style)."),
    ("jetbrains-mono", "JetBrains Mono", ["latin"], "mono", [400, 700], "Mono for code, terminals and numbers."),
    # 2.1: more Persian/Arabic character and more Latin choices
    ("noto-nastaliq-urdu", "Noto Nastaliq Urdu", ["persian", "arabic"], "display", [400, 700], "Nastaliq calligraphic style: poetic, traditional Persian titles."),
    ("noto-sans-arabic", "Noto Sans Arabic", ["arabic", "persian"], "sans", [400, 700, 900], "Plain, very complete Arabic-script sans (Persian letters included)."),
    ("alexandria", "Alexandria", ["arabic", "latin"], "sans", [400, 700, 900], "Modern geometric Arabic + Latin."),
    ("changa", "Changa", ["arabic", "latin"], "sans", [400, 700, 800], "Squarish, techy Arabic + Latin."),
    ("el-messiri", "El Messiri", ["arabic", "latin"], "display", [400, 700], "Elegant, calligraphic-leaning Arabic display."),
    ("lemonada", "Lemonada", ["arabic", "latin"], "display", [400, 700], "Round, playful Arabic display."),
    ("baloo-bhaijaan-2", "Baloo Bhaijaan 2", ["arabic", "latin"], "display", [400, 700, 800], "Chunky, friendly Arabic display for food and kids."),
    ("harmattan", "Harmattan", ["arabic", "latin"], "sans", [400, 700], "Simple, open Arabic for small captions."),
    ("mada", "Mada", ["arabic", "latin"], "sans", [400, 700, 900], "Clean modern Arabic UI sans."),
    ("dm-sans", "DM Sans", ["latin"], "sans", [400, 700, 900], "Friendly, compact geometric sans."),
    ("poppins", "Poppins", ["latin"], "sans", [400, 700, 900], "Very popular round geometric sans."),
    ("outfit", "Outfit", ["latin"], "sans", [400, 700, 900], "Clean modern geometric sans."),
    ("plus-jakarta-sans", "Plus Jakarta Sans", ["latin"], "sans", [400, 700, 800], "Contemporary sans for brands."),
    ("manrope", "Manrope", ["latin"], "sans", [400, 700, 800], "Semi-condensed modern sans."),
    ("sora", "Sora", ["latin"], "sans", [400, 700, 800], "Wide, techy sans."),
    ("lora", "Lora", ["latin"], "serif", [400, 700], "Calm, readable serif."),
    ("oswald", "Oswald", ["latin"], "display", [400, 700], "Condensed sans for big headlines."),
    ("anton", "Anton", ["latin"], "display", [400], "Heavy condensed impact face."),
    ("caveat", "Caveat", ["latin"], "script", [400, 700], "Handwriting, for notes and doodles."),
    ("pacifico", "Pacifico", ["latin"], "script", [400], "Retro brush script for cafés and treats."),
    ("lobster", "Lobster", ["latin"], "script", [400], "Bold retro script."),
]
PERSIAN_PKGS = {"shabnam": "shabnam-font", "sahel": "sahel-font", "samim": "samim-font"}
SUBSETS = ("arabic", "latin", "latin-ext")


def tarball(pkg):
    meta = json.load(urllib.request.urlopen(REG + pkg + "/latest", timeout=60))
    data = urllib.request.urlopen(meta["dist"]["tarball"], timeout=120).read()
    return meta, tarfile.open(fileobj=io.BytesIO(data), mode="r:gz")


def fontsource(fid, weights, dst):
    meta, tf = tarball("@fontsource/" + fid)
    names = tf.getnames(); faces = []; got = []
    for w in weights:
        css_name = f"package/{w}.css"
        if css_name not in names:
            continue
        css = tf.extractfile(css_name).read().decode()
        for block in re.findall(r"@font-face\s*{[^}]*}", css):
            url = re.search(r"url\(\./files/([^)]+?\.woff2)\)", block)
            rng = re.search(r"unicode-range:\s*([^;]+);", block)
            sub = re.search(r"files/[a-z0-9-]+?-((?:arabic|latin-ext|latin))-\d+-normal", block)
            if not url or not sub or sub.group(1) not in SUBSETS:
                continue
            f = url.group(1)
            (dst / f).write_bytes(tf.extractfile("package/files/" + f).read())
            faces.append((w, f, rng.group(1).strip() if rng else None))
        got.append(w)
    lic = next((n for n in names if n.lower() in ("package/license", "package/license.md", "package/ofl.txt")), None)
    if lic:
        (dst / "OFL.txt").write_bytes(tf.extractfile(lic).read())
    return meta["version"], got, faces


def persian(fid, weights, dst):
    meta, tf = tarball(PERSIAN_PKGS[fid])
    names = tf.getnames(); faces = []; got = []
    wmap = {400: "", 700: "-Bold", 900: "-Black", 500: "-Medium", 300: "-Light"}
    for w in weights:
        want = [n for n in names if n.endswith(".woff2") and re.search(rf"/{fid}{wmap.get(w,'')}\.woff2$", n, re.I) and "FD" not in n and "WOL" not in n]
        if not want:
            continue
        f = f"{fid}-{w}.woff2"
        (dst / f).write_bytes(tf.extractfile(want[0]).read())
        faces.append((w, f, None)); got.append(w)
    lic = next((n for n in names if re.search(r"(OFL|LICENSE)(\.txt|\.md)?$", n, re.I)), None)
    if lic:
        (dst / "OFL.txt").write_bytes(tf.extractfile(lic).read())
    return meta["version"], got, faces


def main():
    OUT.mkdir(exist_ok=True); manifest = []
    for fid, name, scripts, kind, weights, note in FAMILIES:
        dst = OUT / fid
        shutil.rmtree(dst, ignore_errors=True); dst.mkdir(parents=True)
        version, got, faces = (persian if fid in PERSIAN_PKGS else fontsource)(fid, weights, dst)
        css = [f'/* {name} · SIL OFL 1.1 (OFL.txt) · npm {PERSIAN_PKGS.get(fid, "@fontsource/" + fid)}@{version} */']
        for w, f, rng in faces:
            css.append(f'@font-face{{font-family:"{name}";src:url("{f}") format("woff2");font-weight:{w};font-style:normal;font-display:block'
                       + (f";unicode-range:{rng}" if rng else "") + "}")
        (dst / "font.css").write_text("\n".join(css) + "\n", encoding="utf-8")
        size = sum(p.stat().st_size for p in dst.glob("*.woff2"))
        manifest.append({"id": fid, "name": name, "scripts": scripts, "kind": kind, "weights": got, "license": "OFL-1.1",
                         "source": f"https://www.npmjs.com/package/{PERSIAN_PKGS.get(fid, '@fontsource/' + fid)}", "css": f"fonts/{fid}/font.css", "kb": round(size / 1024), "note": note})
        print(f"{fid:22} {','.join(map(str, got)):12} {round(size/1024):5} KB  licence={'yes' if (dst/'OFL.txt').exists() else 'MISSING'}")
    (OUT / "fonts.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("total", round(sum(m["kb"] for m in manifest) / 1024, 1), "MB ·", len(manifest), "families")


if __name__ == "__main__":
    main()
