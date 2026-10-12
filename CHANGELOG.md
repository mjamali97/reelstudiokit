# Changelog

Every kit update gets a version and a short entry here; `/update` reads the new entries to you after pulling.
Format: what changed, then **Action** when you need to do something (most updates need nothing).

## 2.0.1 · 2026-10-12
- The five original styles (vogue, vox, swiss, hud, doodle) pass motion QA again: no blank frame entering scene 5 (vox,
  doodle), no still second in swiss's last scene, hud's first scene or doodle's last scene (a slow handheld camera).

## 2.0.0 · 2026-10-12
The studio now fits any brand in any of seven languages, makes carousels, stories and highlight covers, and runs agencies.
- **Onboarding rebuilt** (`/setup`): it first reads what the brand already has (website, Instagram, brand book, menu),
  shows "here is what I understood", asks only for the gaps, captures the **brand voice** (tone, form of address, words,
  a sample test) and every brand fact with its source, then design system → public audit → plan and formats → accounts.
  New `/brand` to change the brand or voice any time; `tools/brand/` extract (website → brand), palette (images), preview, apply.
- **English is the main language**; full guides in English, Persian, Arabic, Turkish, German, French and Italian (`docs/guide/`).
- **8 new video styles** (13 in total): `/clean` (your brand colours), `/neon`, `/retro`, `/brutal`, `/luxe`, `/pop`, `/chalk`,
  `/receipt`; left-to-right support in the video engine; `stills.mjs` previews any style without rendering.
- **Carousels** (`/carousel`, 10 templates), **stories** (`/story`, 10 templates) and **highlight covers** (4 sets × 3 styles),
  rendered in the brand; **captions** burner (`/captions`) with Persian linting; a library of **30 open-licence fonts**.
- **Telegram bot:** the brand voice (`BRAND_VOICE`) in every post, story idea and reply; per-client voice and facts in agency mode.
- **Agency mode:** `tools/client.mjs` (one folder per client, switch the active one, sync the client's voice to the bot), `playbook/AGENCY.md`.
- **Demo mode:** `bash telegram-bot/demo/demo.sh` runs the bots locally with fake Telegram, Zernio and Gemini in a browser viewer; `/demo`.
- **Everything in one place:** `tools/install.sh` (core / video / all / check) installs HyperFrames, WhisperX, Playwright,
  persian-motion-director and the NextWork editor plugin, pinned; `tools/STACK.md` lists every tool with its licence.
- Claude Code **plugin** (`/plugin install reel-studio --marketplace mjamali97/reelstudiokit`, then `/reel-studio:start`);
  CI, issue templates, `SECURITY.md`, a filled example brand (`examples/bakery/`).

**Action:** run `bash tools/install.sh` (new shared packages in `tools/`), then `/brand` once: it fills the new
`profile/VOICE.md` sections and `brand/brand.json` from your existing profile, and `node tools/brand/apply.mjs` pushes them to
the bot (`BRAND_VOICE`). Push to deploy the bot (migration 0007 adds per-client voice for agency mode).

## 1.0.0 · 2026-10-12
First public version.
- `/setup` onboarding for any business: profile, voice, design system, your own formats, Zernio, Telegram bots, deploy.
- 20 business playbooks (`playbook/business/INDEX.md`) and `/content-plan`.
- `/reel-idea`, `/reel-style`, five edit styles (`/vogue` `/hud` `/swiss` `/vox` `/doodle`), motion QA.
- `/publish` (Zernio drafts → one-tap publish card), `/telegram-post`, `/analytics`, `/page-audit`.
- Telegram bots: ideas, drafts, approvals, search, story ideas, news; daily page report with a score, a report 24 h and
  7 days after every post, private dashboard, Zernio webhooks.
- `/update` to pull new versions without touching your own files.
