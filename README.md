# Reel Studio kit for Claude Code

A complete Instagram/YouTube/Telegram content studio that runs inside Claude Code, for any page: a creator, an expert,
a bakery, a clinic, a shop, a course. No personal data inside; `/setup` makes it yours.

**Persian step-by-step guide: [README.fa.md](README.fa.md)**

## What you get
| | |
|---|---|
| `/setup` | onboarding: your profile, voice, design system, formats, tools, Zernio, Telegram bots, deploy, analytics baseline |
| `/reel-idea` | idea → verified facts → script in your voice (hooks + Hormozi's model) → viral score → 2–3 style options |
| `/reel-style` | which edit style fits this content, with odds |
| `/vogue` `/hud` `/swiss` `/vox` `/doodle` | five motion-edit styles (HyperFrames: HTML → MP4, free, local) |
| `/content-plan` | the week's reels, stories and posts from your business playbook, plus the shot list to film |
| `playbook/business/` | 20 content playbooks: restaurant/café, bakery, photo studio, online shop, beauty salon, clinic, expert/service, personal page, gym, real estate, car services, language school, tailor/fashion, home decor, florist, jewellery, travel, hotel/eco-lodge, handmade, weddings & events (`INDEX.md`); `/setup` writes one for any other kind |
| `/update` | pulls new kit versions without touching your profile, brand, formats, settings or reels |
| `/publish` | approved render → Zernio draft → a publish card in your Studio bot → one ✅ schedules IG + YouTube + DM gate + Telegram |
| `/telegram-post` | channel posts and stories in your format, as drafts for approval |
| `/analytics` | your numbers from Zernio → what worked → updated hooks, scores, posting days |
| `/page-audit` | full page audit: bio, highlights, grid, content mix, retention, audience vs your customer, timing, conversion, 3–5 competitors → scores + top 5 fixes + a two-week plan |
| `telegram-bot/` | two Telegram bots on a free Cloudflare Worker: Studio (ideas, drafts, approvals, search, news, story ideas, a daily page report with a score, a report 24 h and 7 days after every post, a private dashboard) and Publisher (final ✅ before anything reaches your channel) |
| `playbook/` | the runbooks behind the skills, incl. a motion QA checklist built from real defects |

## Quick start
1. Install Claude Code, then get the kit:
   ```bash
   git clone https://github.com/mjamali97/reelstudiokit.git my-studio && cd my-studio && claude
   ```
   (or download the ZIP from GitHub, unzip, open a terminal in the folder, run `claude`).
2. Type `/setup` and answer. It is resumable (`profile/SETUP-STATUS.md`).
3. Then: ideas to the Studio bot or `/reel-idea` here → film → `/reel-style` → edit → approve → `/publish` → ✅.

## Updates
The kit keeps improving. Type `/update` (or `bash tools/update.sh`): it pulls the new version from this repo, keeps
everything that is yours (`.gitattributes` lists those files), shows what's new from `CHANGELOG.md` and tells you if a
change needs an action. Current version: see `VERSION`.

## Requirements
macOS (or Windows with WSL2 / Linux), git, Node ≥ 20, Python ≥ 3.11, ffmpeg, Google Chrome, uv. Accounts: Zernio,
Telegram, Google AI Studio (free Gemini key), Cloudflare (free), GitHub. Costs: Zernio's paid accounts beyond its free
tier; everything else here runs on free plans.

## Safety
Nothing is published without your ✅ (twice for Telegram). Uploads are drafts. Keys live in `.env` and GitHub secrets,
never in files you commit or in the chat. Bot tests run against mocks: `bash telegram-bot/test/all.sh`.

## Licence
MIT (`LICENSE`). Fonts, icons and libraries keep their own licences: `THIRD_PARTY_NOTICES.md`.
Maintaining or contributing: `CONTRIBUTING.md`.
