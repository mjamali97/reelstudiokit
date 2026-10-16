# Persian (and other right-to-left) text · rules that broke renders

- **Never `dir="rtl"` on `<html>` in a HyperFrames composition.** It previews perfectly and renders a black video. Put
  direction on the element (`.fa { direction: rtl; unicode-bidi: isolate }`).
- **Half-space (ZWNJ, U+200C)** in compounds and prefixes: «می‌شه», «قیمت‌گذاری», «ایده‌ها». Never strip it (some
  "humanizer" tools do). Proofread aligned words for missing half-spaces.
- **Lint every Persian text** (script, captions, slide copy) once: `tools/py -I tools/render/lint_fa.py <file> [--fix]`.
  One run reports Arabic ي/ك, wrong digits and missing half-spaces together, spoken forms included («میشه» → «می‌شه»);
  `--fix` writes the safe fixes. `/captions` runs it on every Persian caption file.
- **Digits:** Persian digits (۰–۹) in Persian text. Some Persian fonts leave Latin digits out of their `unicode-range` on
  purpose, so a Latin digit falls back to another font. «درصد» rather than ٪ in stories and captions.
- **Latin inside Persian:** wrap every Latin word that touches punctuation or a digit in `<bdi>` («به AI. ۹ تاش» rendered
  as «به ۹ .AI تاش» until `AI` was isolated). In Telegram and Instagram plain text, start every line with a Persian word,
  because the line's direction comes from its first strong letter.
- **Animate whole lines or whole words, never letters:** Persian letters join; per-letter boxes break the shaping.
  Typing effects are a stepped clip reveal on Latin only; Persian lines arrive whole.
- **Fonts load for real:** embed as a data URL or serve from a file URL, `document.fonts.load()`, and fail if
  `document.fonts.check()` is false (`MOTION-QA.md`).
- **Colloquial register** for spoken scripts and captions (in their voice): «می‌شه» not «می‌شود», «واسه» if they say it.
  No formal news words («توسط»، «رونمایی»، «می‌باشد»).
