# Reel Studio · working notes for Claude

A content studio for one creator or business (any kind: a restaurant, a bakery, a photo studio, an online shop, a salon, a clinic, an expert, a personal page): idea → script → styled motion edit → QA → Instagram/YouTube (Zernio) + Telegram channel.
Goal of every task: views, reach, saves, shares, follows, without breaking the creator's voice or trust.

**Before any task, read `profile/CREATOR.md`, `profile/VOICE.md` and `profile/RULES.md`.** They hold who the creator is, how
they talk and every rule they gave. If `profile/CREATOR.md` still says `STATUS: not set up`, run `/setup` first.

## What is where
- `.claude/skills/` · `/setup` `/reel-idea` `/reel-style` `/vogue` `/hud` `/swiss` `/vox` `/doodle` `/content-plan` `/publish` `/telegram-post` `/analytics` `/page-audit` `/update`
- `playbook/` · the runbooks the skills follow: IDEA-TO-REEL, BUSINESS-REEL, STYLE-REEL, MOTION-QA, TAKE, CAPTION, COVER-AND-GATE,
  PUBLISH, TELEGRAM-POST (posts + stories), PERSIAN
- `playbook/business/` · 20 content playbooks, one per kind of business (`INDEX.md`) + `_TEMPLATE.md` for any other kind;
  CREATOR.md names theirs
- `profile/` · the creator: CREATOR (facts), VOICE (how they talk), HOOKS (their proven hooks, from analytics), RULES (standing rules), IDEAS-REMOVED, audits/ (one /page-audit per month)
- `brand/` · their design system: BRAND.md + tokens.css (+ fonts, logo)
- `tools/style-reel/` · the HyperFrames engine + 5 styles · `tools/take/` cut + audio · `tools/capture/` screenshots/recordings of their own site · `tools/zernio/` CLI
- `telegram-bot/` · Studio + Publisher bots (Cloudflare Worker); deploy = push to `main` (`.github/workflows/deploy-bot.yml`)
- `reels/<slug>/` · one folder per reel: SCRIPT.md, CAPTION.md, TELEGRAM.md, gate/, cover/, motion/. Videos and raw takes stay out of git.

## Updates
The kit lives at github.com/mjamali97/reelstudiokit (remote `upstream`); this copy is theirs (remote `origin`). `/update`
pulls new versions; files listed in `.gitattributes` are theirs and keep their version. Never push to `upstream`.

## Rules that bite
- **Nothing is published without the creator's ✅** (Studio bot card, then the Publisher bot for Telegram). Upload to Zernio only
  after they approved the final render, and only as a DRAFT.
- **Never print, paste or commit keys.** Keys live in `.env` (git-ignored) and in GitHub/Cloudflare secrets. Never type
  credentials into a web form for them; they add secrets themselves.
- **Only what the source has.** Every number, feature and claim on screen, in a caption or a gate comes from the source
  (the owner's facts table, their own site or menu, a cited source) and is checked. Never invent a figure, a quote, a testimonial or a screen.
- **One speaker:** the creator. No second voice, no fake reactions, no generated face pretending to be them.
- **Every motion render passes `playbook/MOTION-QA.md`** (qa.py with zero FAIL + the 3 fps eye pass) before they see it.
- **When the creator corrects you or states a preference, add it to `profile/RULES.md`** (date, rule, why) in the same turn,
  so the next session knows. If they say an idea is dead, add it to `profile/IDEAS-REMOVED.md` and never propose it again.
