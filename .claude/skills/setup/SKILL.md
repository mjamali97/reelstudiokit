---
name: setup
description: First-run onboarding that makes this studio fit one specific brand (a bakery, a restaurant, a photo studio, a shop, a clinic, an expert, any page). It reads what the brand already has (website, Instagram, brand book, logo, menu), shows what it understood, asks only about the gaps, records the brand voice and every brand fact, builds or imports the design system with a visual preview, audits the page, proposes a plan and the brand's own formats, then connects Zernio, Telegram and the bots. Use when they type /setup, when profile/CREATOR.md says "STATUS: not set up", or when they want to redo a part («ستاپ», «راه‌اندازی», «Einrichtung», «configurer», «kurulum», «configura», «إعداد»).
---

# /setup · make this studio theirs

The owner should feel understood, not interrogated. They show you what they already have; you do the reading; you show
back what you understood; they correct it; you ask only what is missing. **Show, don't describe**: a rendered preview,
three caption variants, a contact sheet. Accounts and keys come last, once they have seen value.

## Ground rules
- Talk in their language (ask once, first). Short messages, one step at a time. Use AskUserQuestion for every choice, with
  a recommended option first. Offer "skip for now" on anything that is not needed yet.
- Progress lives in `profile/SETUP-STATUS.md` (create it from the checklist below). Read it first and resume where it
  stopped; tick each box only after checking the result. `/setup <phase>` (e.g. `/setup voice`, `/setup accounts`) reruns one phase.
- Facts only. Everything written into the profile is something they said or a source shows; keep the source. Never invent a
  price, a review, a number or a claim. Mark guesses as guesses and ask.
- Confirm before saving: show the draft (or the diff) of CREATOR.md, VOICE.md and brand.json and write after their OK.
- Never ask for a password, key or token in the chat; they type secrets into `.env` or GitHub/Cloudflare themselves.
  Never log in or sign up for them. Viewing a public page in their Chrome is fine; typing into it is not.
- Agency running this for a client: same flow, one folder per client; see `playbook/AGENCY.md`.

```markdown
# Setup status · <brand>
- [ ] 0 welcome: language, path (full / demo first / agency client), what to have ready
- [ ] 1 discover: kind of business, what exists (site, Instagram, brand files, menu, maps), links and files collected
- [ ] 2 read: site extracted, Instagram read, files read → "what I understood" confirmed
- [ ] 3 brand profile: CREATOR.md (facts with sources) + VOICE.md (voice, confirmed by the sample test)
- [ ] 4 design system: brand.json confirmed on a preview, apply.mjs run, avatars
- [ ] 5 first audit (public): strengths, weaknesses, top 5 fixes → profile/audits/
- [ ] 6 plan and formats: playbook chosen, formats built and rendered, first 2-week plan
- [ ] 7 tools and accounts: machine, video tools, Zernio, Telegram, Cloudflare + GitHub (playbook/SETUP-ACCOUNTS.md)
- [ ] 8 deploy and test mode: bots live, test post reached only them, daily report arrived
- [ ] 9 baseline from data: HOOKS.md, best times, full /page-audit with numbers
- [ ] 10 go live (only when they say so)
```

## 0 · Welcome (2 minutes)
Ask the language. Then in five lines: what the studio does for them (ideas → reels, carousels, stories in their brand →
Instagram/YouTube/Telegram → daily numbers in Telegram), how setup goes (we first get to know the brand, then design, then
a plan, then accounts; about an hour, can pause anytime), and what helps to have at hand: website link, Instagram handle,
logo/brand files, a price list or menu, 10 minutes of their time for questions.
AskUserQuestion: **Full setup** (recommended) · **Try the demo first** (no accounts: `/demo` shows example output in the
kit's bakery brand; come back after) · **Set up a client** (agency).

## 1 · Discover what exists
1. Kind of business (AskUserQuestion with the 4 closest from `playbook/business/INDEX.md` + Other). Note the playbook.
2. AskUserQuestion, multiSelect: **What do you already have?** Website · Instagram page · Brand book or logo/fonts files ·
   Menu / price list / catalogue · Google Maps or review pages · Other social (TikTok, Telegram, YouTube) · Nothing yet, new brand.
3. Collect each: links (site, @handle, maps), file paths (they drag files into the chat or a folder like `brand/source/`).
   For Instagram ask for screenshots: the profile header, the grid (first 12–18 posts), 3–5 top posts with their captions,
   and Insights → Audience if they have it. Or, if they prefer, view their public profile in their own Chrome (look only).
Write the list into SETUP-STATUS under phase 1.

## 2 · Read it all, then say what you understood
Do the reading yourself while they wait (tell them it takes a few minutes):
- **Website** → `node tools/brand/extract.mjs <url> --pages 3`: colours by share of the page, fonts, logo/icon/og-image files,
  social links, language → `brand/extracted/<domain>/` (report.md, brand.draft.json, screenshots). Then read the pages
  themselves (WebFetch or the screenshots) for facts: products and prices, hours, address, delivery, how to order, story,
  claims and proof. Note the page URL as the source of each fact.
- **Instagram** (screenshots or viewing) → bio, name field, highlights, grid look, posting rhythm, what their top posts
  are; captions → voice material. Grid screenshot → `tools/py tools/brand/palette.py <img> --sheet brand/extracted/ig-palette.png`.
- **Brand book / logo / files** → read the PDF directly for the stated hex codes, fonts, logo rules, tone of voice;
  `palette.py` on the logo and on brand-book pages. A stated hex code beats a measured one.
- **Menu / price list** → the Offer table, each line with the file as source.
- **Maps / reviews** → what customers praise and complain about, in their words (themes only, no names).

Then one message, "**Here is what I understood**": name and what they sell, for whom, 5–8 key facts with sources, the
colours as swatches (render `node tools/brand/preview.mjs brand/extracted/<domain>/brand.draft.json` and show
`brand/preview/sheet.png`), fonts (and whether each is licensed for social media use or replaced by a library font),
3 voice traits with a real quote each, and a short **"What I could not find"** list. Ask: what is wrong or missing?
Correct, then move on. Nothing found at all (a new brand): say so and go straight to phase 3.

## 3 · Brand profile and voice (only the gaps)
Ask only what phase 2 did not answer, in at most three short rounds (AskUserQuestion where a choice fits):
1. **Customers and offer**: main customer, what stops them buying, top questions they ask, how people order, prices they are
   happy to show, delivery/area/hours, policies.
2. **Why them**: why people choose them, the story, proof they can show (with links), what they never talk about.
3. **Goals and capacity**: 90-day goal with a number, who appears on camera, reels/carousels per week, filming days.

**The voice** (the part that makes everything sound like them):
- Read all voice material from phase 2 (captions, site copy, replies, a voice memo or past takes; transcribe audio with
  WhisperX or their SRT). Fill VOICE.md: personality, tone sliders, form of address (تو/شما, du/Sie, tu/vous, tu/Lei,
  sen/siz, dialect), words they use and never use, emoji, how they open, ask and close, how they answer customers.
- Ask what the material cannot show: tone sliders (AskUserQuestion, 2–3 at a time), form of address, words to avoid,
  how to answer a complaint or a public price question.
- **The sample test**: write the same short caption (one of their real products) in three tones, e.g. warmer / plainer /
  more playful. AskUserQuestion "Which one sounds like you?". Then one comment reply in two tones. Their choices and
  their edits go into VOICE.md → "On brand / off brand". Repeat once if they pick none.
- Write the "## For the bot" paragraph (2–4 sentences) and set VOICE.md `STATUS: confirmed`.
Show CREATOR.md and VOICE.md drafts, save after their OK. Seed `profile/RULES.md` with any rule they stated.

## 4 · Design system
- **They have one** (brand book, or the site's look is their brand): start from `brand.draft.json` and the stated values.
  Fonts not in `fonts/fonts.json`: ask whether they hold a licence for social media/video use; yes → add it as
  `{"name","css"}` with their files in `brand/fonts/`; no or unsure → the closest library font (the report names it).
- **They don't** (or want a refresh): ask three adjectives, two brands or pages whose look they like and why, colours they
  love or hate. Write three directions as `brand/directions/a.json`, `b.json`, `c.json` (each: palette with contrast
  checked: ink on bg ≥ 7:1, text on accent ≥ 4.5:1 or accent used for shapes only; a display + body pair from
  `fonts/gallery.html`; radius). Render `node tools/brand/preview.mjs brand/directions/a.json brand/directions/b.json brand/directions/c.json`
  and show the sheet. They pick or mix ("A's colours with C's fonts"); re-render until they say yes.
- Save `brand/brand.json`, fill `brand/BRAND.md` (feel, palette with use, type with licence, logo rules, do/don't), copy the
  logo to `brand/logo.*`. Run `node tools/brand/apply.mjs` (tokens.css, video styles, bot colours, BRAND_VOICE).
- Avatars: a 1080×1080 HTML for the Telegram channel and each bot (Studio, Publisher) in the brand, content inside the
  central circle, rendered to `brand/channel-logo-640.png`, `brand/studio-640.png`, `brand/publisher-640.png`.

## 5 · First audit (public data, before any account)
Run `/page-audit` in public mode: profile (name field keyword, bio, link, highlights, photo), grid, content mix, hooks, the
order path, and 3–5 competitors from CREATOR.md. Strengths first (what to keep), then weaknesses, then the **top 5 fixes**
ranked by effort vs impact, each with the exact change (e.g. the new bio in their voice, the highlight set to make).
Save to `profile/audits/<date>-public.md`. Numbers come in phase 9; say which parts wait for them.

## 6 · Plan and their formats
- Confirm the business playbook (`playbook/business/<file>.md`); adapt a copy if it fits only partly, or write their own
  from `_TEMPLATE.md` with them. Content pillars into CREATOR.md.
- Build their formats with `playbook/FORMATS.md`: caption, carousel, stories, highlight covers, reel captions, Telegram post,
  gate DM, replies. Each in their voice with their real content, rendered in their brand, picked by them.
- Quick wins from the audit they can do today (bio, highlight covers just rendered, pinned posts).
- `/content-plan` for the first two weeks: what to film, which carousel and story on which day, in their capacity.

## 7–8 · Tools, accounts, deploy (`playbook/SETUP-ACCOUNTS.md`)
Say what each account gives them before asking for it: Zernio = publishing + numbers + comment-to-DM; Telegram bots =
approvals, reports and inbox on the phone; Cloudflare + GitHub = where the bots run, free tier. Walk A → F one screen at a
time; they can stop after any block. Test mode until phase 10: posts reach only their own chat, Zernio in dry run.

## 9 · Baseline from data
`tools/py -I tools/zernio/zernio.py audit` → HOOKS.md (their top posts and what the hooks did), REEL_DAYS/REEL_TIME from their
audience's online hours, then the full `/page-audit` with numbers, compared with phase 5. New account (< 10 posts): keep
the defaults and say so.

## 10 · Go live (only when they say so)
After one full dry run looked right: `PUBLISH_CHAT` = their channel, `ZERNIO_DRY_RUN` = "0", push. CREATOR.md
`STATUS: ready`. End with a one-screen card: their weekly loop (`/content-plan` → film → `/reel-idea` → `/reel-style` →
`/carousel` `/story` → approve → `/publish` → ✅ in the bot → `/analytics`), where things live, and that `/brand` updates the
brand and voice anytime, `/update` pulls new kit versions.
