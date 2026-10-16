# Reel Studio · working notes for Claude

A content studio for one brand (any kind: a bakery, a restaurant, a photo studio, an online shop, a salon, a clinic, an expert,
a personal page) or, in agency mode, for many: idea → script → styled motion edit, carousels, stories → QA → Instagram/YouTube
(Zernio) + Telegram channel, with daily numbers and an inbox assistant in Telegram.
Goal of every task: views, reach, saves, shares, follows and customers, without breaking the brand's voice or trust.

**Before any task, read `profile/CREATOR.md` (the brand's facts), `profile/VOICE.md` (how it talks) and `profile/RULES.md`.**
Everything you write in the brand's name follows VOICE.md; every fact comes from CREATOR.md or a cited source.
If CREATOR.md still says `STATUS: not set up`, run `/setup` first. In agency mode (`clients/` exists), check
`node tools/client.mjs list` first: profile/, brand/ and reels/ belong to the ▶ active client.

## What is where
- `.claude/skills/` · onboarding `/setup` `/brand` `/demo` · planning `/content-plan` `/reel-idea` `/reel-style` · 14 video styles
  `/vogue` `/vox` `/swiss` `/hud` `/doodle` `/clean` `/neon` `/retro` `/brutal` `/luxe` `/pop` `/chalk` `/receipt` `/depth` · other formats
  `/carousel` `/story` `/captions` `/assets` · out `/publish` `/telegram-post` · numbers `/analytics` `/page-audit` · `/update`
- `playbook/` · runbooks: IDEA-TO-REEL, BUSINESS-REEL, STYLE-REEL, MOTION-QA, TAKE, CAPTION, COVER-AND-GATE, PUBLISH,
  TELEGRAM-POST, FORMATS (the brand's own formats), SETUP-ACCOUNTS, AGENCY, PERSIAN (RTL rules)
- `playbook/business/` · 20 content playbooks, one per kind of business (`INDEX.md`) + `_TEMPLATE.md`; CREATOR.md names theirs
- `profile/` · the brand: CREATOR (facts with sources), VOICE (voice, tone, words, customer replies), HOOKS (proven hooks from
  analytics), RULES (standing rules), IDEAS-REMOVED, SETUP-STATUS, audits/
- `brand/` · design system: `brand.json` (colours, fonts, logo; read by every renderer) + BRAND.md; `node tools/brand/apply.mjs`
  pushes it to tokens.css, the video styles and the bot. `brand/formats/` their saved carousel/story/caption specs.
- `fonts/` · 51 open-licence families (`fonts/gallery.html`) · `assets/illustrations/` CC0 doodles · `tools/assets/fetch.mjs` licensed stock with credits · · `tools/brand/` extract (website → brand), palette (images → colours),
  preview (brand on real frames), apply
- `tools/render/` · carousels (10 templates), stories (11, incl. a brand-coloured OpenStreetMap map) + highlight covers, captions burner, icons (4 sets), illustrations · `tools/style-reel/` HyperFrames
  engine + 14 styles (`stills.mjs` previews) · `tools/take/` cut + audio · `tools/capture/` their own site · `tools/zernio/` CLI
- `tools/install.sh` (Windows: `tools/install.ps1`, `tools\py.cmd`) + `tools/STACK.md` · every tool (HyperFrames, WhisperX, Playwright, persian-motion-director, the NextWork
  editor plugin…) pinned, with licences · `tools/client.mjs` agency folders
- `telegram-bot/` · Studio + Publisher bots (Cloudflare Worker), 7 languages, reports, inbox, competitors, agency; deploy = push to
  `main`; `bash telegram-bot/test/all.sh` before every push; `bash telegram-bot/demo/demo.sh` runs it locally with fakes
- `examples/bakery/` · a filled example brand: carousels, stories, highlights · `reels/<slug>/` one folder per reel (videos stay out of git)

## Updates
The kit lives at github.com/mjamali97/reelstudiokit (remote `upstream`); this copy is theirs (remote `origin`). `/update`
pulls new versions; files listed in `.gitattributes` are theirs and keep their version. Never push to `upstream`.

## Rules that bite
- **Nothing is published without the owner's ✅** (Studio bot card, then the Publisher bot for Telegram). Upload to Zernio only
  after they approved the final render, and only as a DRAFT.
- **Never print, paste or commit keys.** Keys live in `.env` (git-ignored) and in GitHub/Cloudflare secrets. Never type
  credentials into a web form for them; they add secrets themselves.
- **Only what the source has.** Every number, price, feature and claim on screen, in a caption or a gate comes from the source
  (CREATOR.md with its sources, their own site or menu, a cited source) and is checked. Never invent a figure, a quote, a review or a screen.
- **The brand's voice, not yours:** check every text against VOICE.md (form of address, words used and never used, emoji).
- **One speaker:** the person who appears for the brand. No second voice, no fake reactions, no generated face pretending to be them.
- **Every motion render passes `playbook/MOTION-QA.md`** (qa.py with zero FAIL + the 3 fps eye pass) before they see it;
  every carousel and story is looked at as a contact sheet before they see it.
- **Fonts and assets only with a licence for social media use** (`/assets`): the kit's own are OFL/MIT/ISC/CC0; fetched files keep a CREDITS.md; never NC, SA, "personal use only", Google Images or another page's post.
- **When the owner corrects you or states a preference, add it to `profile/RULES.md`** (date, rule, why) in the same turn, and
  to VOICE.md if it is about wording. If they say an idea is dead, add it to `profile/IDEAS-REMOVED.md` and never propose it again.
- **Agency:** never reuse one client's photos, captions, reviews or numbers for another.
