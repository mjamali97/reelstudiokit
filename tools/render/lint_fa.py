#!/usr/bin/env python3
"""Persian copy linter: one run finds everything, including what an Arabic letter hides.

    python3 -I tools/render/lint_fa.py <file or text>... [--fix]      exit 1 when something is left
    python3 -I tools/render/lint_fa.py --self-test

Every rule looks at the line with Arabic ي/ك already read as Persian ی/ک, so «ميشه» is reported as Arabic ي AND as a
missing half-space in the same run (not one after the other). On top of the persian-motion-director copy rules (used when
`bash tools/install.sh video` has put it in tools/vendor/), it knows the spoken forms scripts and captions use: «میشه»,
«میتونم», «میخوام», «میگه», «میاد», «نمیدونم», «میشد»… → «می‌شه», «می‌تونم»… Whole words only, so «میمون», «میدون»,
«میراث», «میز» are left alone. Without the vendor linter it still checks ی/ک, digits and the half-space after می/نمی.

--fix writes the safe fixes back into the files (ی/ک, Persian digits, the half-space after می/نمی) and reports what is left.
Pure standard library.
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VENDOR = ROOT / "tools/vendor/persian-motion-director/scripts"
ZWNJ = "‌"
FA_LETTER = r"ء-يٱ-ۓۺ-ۿ"
NORM = str.maketrans({"ي": "ی", "ك": "ک"})             # 1:1, so columns stay the same
DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "۰۱۲۳۴۵۶۷۸۹")

# spoken (colloquial) verbs after می/نمی: a present stem + a personal ending, or a past stem (+ ending)
PRESENT = "ش|تون|خوا|ر|گ|د|دون|کن|زن|گیر|بین|خور|رس|ساز|نویس|کش|فرست|خون|پرس|یار|ار|ذار|گذار|دار|بر|مون|پوش|ریز|سوز|خر|فروش|پز|رقص|خواب|شین|شنو|بخش|ترس|خند|گرد|افت|اندیش|ده|شو|گو|گوی|آی|آر|آور"
PRESENT_END = "م|ی|ه|یم|ین|ید|ن|ند|د|ست"
PAST = "شد|خواست|رفت|گفت|کرد|داد|زد|دید|دونست|تونست|اومد|اومدن|خورد|برد|آورد|نوشت|خوند|گرفت|ساخت|فرستاد|پرسید|موند|رسید|کشید|خرید|فروخت|پخت|خوابید|نشست|شنید|ترسید|خندید|گشت|افتاد"
PAST_END = "م|ی|یم|ین|ید|ن|ند|"
SPOKEN = re.compile(
    f"(?<![{FA_LETTER}{ZWNJ}])(ن?می)(?=(?:(?:{PRESENT})(?:{PRESENT_END})|(?:{PAST})(?:{PAST_END})|ا(?:د|م|ی|یم|ین|ید))(?![{FA_LETTER}{ZWNJ}]))")
MI_SPACE = re.compile(f"(?<![{FA_LETTER}{ZWNJ}])(ن?می) (?=(?:(?:{PRESENT})(?:{PRESENT_END})|(?:{PAST})(?:{PAST_END}))(?![{FA_LETTER}{ZWNJ}]))")

BASE_RULES = [   # used when the vendor linter is not installed (it has these and more)
    ("arabic-yeh", re.compile("ي"), "Arabic ي (U+064A): use Persian ی (U+06CC)"),
    ("arabic-kaf", re.compile("ك"), "Arabic ك (U+0643): use Persian ک (U+06A9)"),
    ("arabic-digit", re.compile("[٠-٩]"), "Arabic-Indic digit: use Persian digits ۰–۹ (U+06F0–06F9)"),
]
RAW_ONLY = {"arabic-yeh", "arabic-kaf", "alef-maksura", "arabic-digit"}   # these must see the line as written


def vendor_rules():
    if not (VENDOR / "lint_persian.py").exists():
        return None
    sys.path.insert(0, str(VENDOR))
    try:
        import lint_persian
        return lint_persian
    except Exception:
        return None
    finally:
        sys.path.pop(0)


V = vendor_rules()


def lint_line(line):
    """[(col, code, message)] for one line, every rule in one pass."""
    if not re.search(f"[{FA_LETTER}]", line):
        return []
    norm = line.translate(NORM)
    out = []
    for code, rx, msg in (V.COPY_RULES if V else BASE_RULES):
        for m in rx.finditer(line if code in RAW_ONLY else norm):
            out.append((m.start(), code, msg))
    if V:
        out += [(c, code, msg) for c, code, msg in V.kashida_issues(norm)]
    seen = {c for c, code, _ in out if code in ("mi-glued", "mi-space")}
    for m in SPOKEN.finditer(norm):
        if m.start() not in seen:
            out.append((m.start(), "mi-glued", "می / نمی glued to the verb: use a half-space (می‌شه، نمی‌دونم)"))
    for m in MI_SPACE.finditer(norm):
        if m.start() not in seen:
            out.append((m.start(), "mi-space", "می / نمی followed by a space: use a half-space (می‌شه)"))
    return sorted(out)


def fix_text(text):
    text = text.translate(NORM).translate(DIGITS)
    text = MI_SPACE.sub(lambda m: m.group(1) + ZWNJ, text)
    return SPOKEN.sub(lambda m: m.group(1) + ZWNJ, text)


def lint_text(text, name):
    return [(name, ln, col + 1, code, msg) for ln, line in enumerate(text.splitlines(), 1) for col, code, msg in lint_line(line)]


def self_test():
    cases = {   # text → codes one run must report
        "این میشه خوب": {"mi-glued"},
        "اینجا ميشه کار کرد": {"arabic-yeh", "mi-glued"},       # both in ONE run
        "نميدونم": {"arabic-yeh", "mi-glued"},
        "میتونم بیام": {"mi-glued"},
        "اونا میرن، میگه میاد": {"mi-glued"},
        "می شه گفت": {"mi-space"},
        "دیروز میشد": {"mi-glued"},
        "كيك": {"arabic-yeh", "arabic-kaf"},
        "می‌شه، نمی‌دونم، می‌تونم": set(),
        "میمون و میدون و میراث و میز و میان و میوه": set(),
    }
    bad = 0
    for text, want in cases.items():
        got = {code for _, code, _ in lint_line(text)}
        if not want <= got or (not want and got):
            bad += 1
            print(f"❌ {text!r}: want {sorted(want)}, got {sorted(got)}")
    for src, want in {"ميشه": "می‌شه", "نمیخوام ٣ تا": "نمی‌خوام ۳ تا", "می شه": "می‌شه", "میمون": "میمون"}.items():
        if fix_text(src) != want:
            bad += 1
            print(f"❌ fix {src!r} → {fix_text(src)!r}, want {want!r}")
        if lint_text(fix_text(src), "") and src != "میمون":
            bad += 1
            print(f"❌ {fix_text(src)!r} still has issues after --fix")
    print(f"lint_fa self-test ({'with' if V else 'without'} persian-motion-director): " + ("ok" if not bad else f"{bad} failed"))
    return 1 if bad else 0


def main(argv):
    if argv[1:] == ["--self-test"]:
        return self_test()
    fix = "--fix" in argv
    targets = [a for a in argv[1:] if a != "--fix"]
    if not targets:
        print(__doc__)
        return 2
    issues = []
    for t in targets:
        if os.path.isfile(t):
            text = Path(t).read_text(encoding="utf-8")
            if fix and fix_text(text) != text:
                Path(t).write_text(fix_text(text), encoding="utf-8")
                print(f"{t}: fixed ی/ک, digits and half-spaces after می/نمی")
                text = fix_text(text)
            issues += lint_text(text, t)
        else:
            issues += lint_text(fix_text(t) if fix else t, "<text>")
    for name, ln, col, code, msg in issues:
        print(f"{name}:{ln}:{col}  {code}  {msg}")
    print(f"\n{len(issues)} issue(s)" if issues else "clean")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
