# Changelog

Every kit update gets a version and a short entry here; `/update` reads the new entries to you after pulling.
Format: what changed, then **Action** when you need to do something (most updates need nothing).

## 2.4.0 · 2026-10-16
- **Windows without WSL:** `tools\install.ps1` installs the same pieces and levels as `install.sh` from PowerShell
  (`-Install` gets Git, Node LTS, Python 3.12, ffmpeg, uv and Chrome with winget); in Git Bash, where Claude Code runs its
  commands, `bash tools/install.sh` hands over to it. `tools\py.cmd` runs the Python tools from PowerShell and cmd;
  `tools\update.ps1` updates the kit. Tested on every push on a Windows runner (installer, renders, a Persian caption
  burn, a multi-clip cut, a `/depth` render, the bot's tests, agency mode).
- Persian text is read and written as UTF-8 on every system (Windows defaulted to cp1252 and broke it); the Python tools
  run in UTF-8 mode; CI fails any new text read or write without an encoding.
- The bot's tests and demo are Node now (`telegram-bot/test/all.mjs`, `demo/demo.mjs`), so they run on Windows; the `.sh`
  files still work and start them. `audio.sh` became `audio.py` the same way.
- `webcap.mjs --find "phrase"` prints where a phrase is in the screenshot of their own site, read from the page: exact on
  every system (`ocrfind` stays as the macOS OCR for other images).
- Agency mode on Windows uses directory junctions: no administrator rights or Developer Mode.
- Fixes: `check_cuts.py` failed on ffmpeg 8 (`-vsync` is gone); compiled Python files had slipped into git in 2.3.0;
  `captions.mjs` found its linter by a path that breaks on Windows; the punch-in note now makes sense for small clips.
**Action:** none on macOS and Linux. On Windows: `powershell -ExecutionPolicy Bypass -File tools\install.ps1`.

## 2.3.0 · 2026-10-16
- **New style `/depth` (14 styles):** your talking head stays on screen and the punch word of each line sits behind your
  head, the speaker cut out locally (HyperFrames `remove-background`, no upload). Lines never cover the face (placed
  from the chin found by the face detector); numbers sit above the head; a punch-in on every cut; follow card at the end.
- **Several clips → one reel** (`playbook/TAKE.md` → "Several clips"): `tools/take/intake.py` (contact sheets, word
  timings with your brand names as hotwords, repeated lines with the last take marked), `assemble.py` (cut by an edit
  list with punch-ins, frame-exact 30 fps, an SRT for the edit), `cutout.py`, `headpos.py`, `check_cuts.py` (before/after
  frame of every cut, and a phone copy).
- **Grades:** a `grade` variable on every style (`natural`, `warm`, `editorial`, `bright`), on the face and cutout together.
- `stills.mjs --safe` paints Instagram's unsafe areas red; `--grade` previews a grade.
- `new_reel.py` brings a take's cutout and head positions along; MOTION-QA lists the seek-safety traps.
- Ideas credited to tenfoldmarc/video-edit-skill (that repo has no licence; no code from it is used).
**Action:** none. For `/depth`, the first `cutout.py` run downloads the segmentation model once.

## 2.2.0 · 2026-10-14
- **All 13 styles start a reel:** `new_reel.py --style` took only the five original styles (`/clean`, `/neon`, `/retro`,
  `/brutal`, `/luxe`, `/pop`, `/chalk`, `/receipt` stopped at "invalid choice"); it now reads them from `styles/`.
- **Python tools from `tools/.venv` everywhere:** `tools/py <script>` runs a kit script with the venv's Python (macOS,
  Linux, WSL, Git Bash). `/carousel` (contact sheet), `/setup` and `/brand` (palette) used the system `python3` and stopped
  at "No module named PIL". The core install now makes the venv (it was only in `video`).
- **`install.sh`:** checks Python ≥ 3.11 and Node ≥ 20 with the right command per system (Linux/WSL: Node from nvm or
  NodeSource, not apt's old `nodejs`; `python3-venv`). `check` really tests HyperFrames and the HyperFrames skills, and
  `check [core|video|all]` counts only that level, so a complete core install no longer ends in "Some pieces are missing".
- **Carousels to Zernio:** `zernio.py draft --images <url>…` makes an Instagram carousel draft (2–10 slides); `/publish`
  and `PUBLISH.md` show how. The one-tap card in the bot stays for reels; a carousel is scheduled in Zernio or by a time
  you give in chat.
- **Persian linter in one run:** `tools/render/lint_fa.py [--fix]` reports Arabic ي/ك and the missing half-space they hide
  together, and knows spoken verbs («میشه» → «می‌شه», «میتونم», «نمیدونم»…). `/captions` uses it.
- Bot: the status screen showed «خبر هر سه روز NaN:undefined» while the news check is off; it now says off. The demo is
  in Persian for `fa` (sample post, comment, voice) and shows the news check at 18:00.
- Docs match the code: `/reel-idea` saves to `reels/<slug>/` like the rest of the pipeline; `/demo` no longer says 30 fonts
  (CI now checks every font count in the docs).

**Action:** `bash tools/install.sh` once (it adds `tools/.venv` to the core install), then push to deploy the bot.

## 2.1.2 · 2026-10-12
- Stock fetcher verified for every source: Pixabay, Openverse and Wikimedia Commons live; Pexels (photos, videos) and
  Unsplash against their documented responses in a new offline test (`node tools/assets/test-fetch.mjs`, in CI) and their
  live endpoints. Unsplash download events are registered also when a result has no `download_location`.

## 2.1.1 · 2026-10-12
- `fetch.mjs pixabay`: photo searches return real photos only (no AI-generated illustrations); Pixabay photos and videos
  tested end to end. Pexels has paused new API keys; existing keys still work.

## 2.1.0 · 2026-10-12
**Licence change:** from this version Reel Studio is under the **Business Source License 1.1**. Free in production for
your own brand, business or page (and its staff); agencies, studios and freelancers using it for clients, and hosted
services, need a commercial licence (`COMMERCIAL-LICENSE.md`). Each version becomes Apache-2.0 four years after release.
Versions 2.0.1 and earlier stay MIT. Contributions now go under `CLA.md`.
- **Icons:** Tabler, Phosphor and Heroicons next to Lucide (~7,000, MIT/ISC): `"tabler:cake"`, `"phosphor:cake:duotone"`,
  `"hero:cake:solid"`; `node tools/render/icons.mjs <word>` finds them.
- **Illustrations (CC0), recoloured to the brand:** 32 Open Doodles (`doodle:<name>`) and Open Peeps, Notionists, Lorelei,
  Thumbs people from any word (`peep:<word>`), on carousel covers, tips, CTAs and stories.
- **Emoji:** Noto Color Emoji (OFL) in every render, the same on every computer.
- **Fonts:** 21 more OFL families (51), incl. Noto Nastaliq Urdu for a calligraphic Persian look.
- **Map story:** the `location` template draws a map in the brand colours from OpenStreetMap data, with the credit on it.
- **Licensed stock:** `tools/assets/fetch.mjs` gets photos, video b-roll, CC0 music and sound effects from Openverse,
  Wikimedia Commons, Pexels, Pixabay and Unsplash, with a CREDITS.md per reel; new `/assets` skill with the rules.
- The five original video styles pass motion QA again (2.0.1).

**Action:** `bash tools/install.sh` (new icon, illustration and emoji packages). If you use Reel Studio for clients, read
`COMMERCIAL-LICENSE.md`. Optional: free Pexels / Pixabay / Unsplash keys in `.env` for stock video and photos.

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
