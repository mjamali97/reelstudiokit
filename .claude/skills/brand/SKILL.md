---
name: brand
description: Read, build or change the brand's design system and voice at any time after setup: re-read the website or a new brand book, compare design directions on a rendered preview, switch fonts or colours, retune the voice, or rebuild the formats; then apply it everywhere (tokens, video styles, bot colours and voice). Use when they type /brand, send a new logo or brand book, or say «رنگ‌ها رو عوض کن», «فونت عوض کن», «لحنمون اینطوری نیست», "change our colours", "this doesn't sound like us".
---

# /brand · the design system and the voice

Read `brand/brand.json`, `brand/BRAND.md`, `profile/VOICE.md`, `profile/CREATOR.md` first. Talk in their language.
Nothing is saved until they saw it (a rendered preview or the exact text) and said yes.

## What they want → what to do
| they say / send | do |
|---|---|
| a website, "read our site again" | `node tools/brand/extract.mjs <url> --pages 3` → show `report.md` facts + `preview.mjs` of the draft next to the current brand (`node tools/brand/preview.mjs brand/brand.json brand/extracted/<domain>/brand.draft.json`) |
| a brand book (PDF) or logo | read the PDF for stated hex codes, fonts, rules, tone of voice; `python3 tools/brand/palette.py <files> --sheet …` for measured colours; stated values win |
| "other colours", "a fresh look" | three directions in `brand/directions/` (palette with contrast checked + font pair from `fonts/gallery.html`), one preview sheet, they pick or mix |
| a font | `fonts/fonts.json` id, or their licensed font as `{"name","css"}` in `brand/fonts/`; never a font without a licence for social media/video |
| "this doesn't sound like us" | ask for the line they would have written; update VOICE.md (On brand / off brand, Words, Sentences); run the sample test from `/setup` phase 3 again; rewrite "## For the bot" |
| new products, prices, hours | update CREATOR.md → Offer (with the source) and `BUSINESS_FACTS` in `telegram-bot/wrangler.jsonc` |
| "update our caption / story / carousel format" | `playbook/FORMATS.md` for that format only |

## After any change
1. `node tools/brand/apply.mjs --dry` → show what will change → `node tools/brand/apply.mjs`.
2. Re-render one carousel and one story from `brand/formats/` (or `preview.mjs`) and show them.
3. If the bot changed (`telegram-bot/` in the list): `bash telegram-bot/test/all.sh`, then commit and push to deploy.
4. Note the change in `brand/BRAND.md` (date, what, why) and, if it is a rule, in `profile/RULES.md`.

## Upgrading from kit 1.x
Their `profile/VOICE.md` and `profile/CREATOR.md` keep the old, shorter structure (user files are never overwritten). Open the
new templates (`git show upstream/main:profile/VOICE.md`, same for CREATOR.md), move everything they already wrote into the new
sections, ask only for what is missing (tone sliders, form of address, the sample test, "For the bot"), and write
`brand/brand.json` from their `brand/BRAND.md` and `tokens.css` (colours, fonts mapped to `fonts/fonts.json` ids). Show the
result, save after their OK, run `node tools/brand/apply.mjs`, then push so the bot gets `BRAND_VOICE`.
