# The stack · every tool the studio uses, in one place
`bash tools/install.sh [core|video|all]` installs it (pinned versions); `bash tools/install.sh check [core|video|all]` reports
what is there for that level (default core). Nothing needs an account. Python scripts run with `tools/py <script>`, which
picks the Python in `tools/.venv` (the system `python3` has no Pillow).
Third-party code is fetched at install time from its own repository and keeps its own licence; only MIT/Apache/BSD/OFL/ISC
code is ever copied into this repo (see `THIRD_PARTY_NOTICES.md`). AGPL tools are used as separate apps, never vendored.

| piece | what it does here | used by | licence | how it arrives | level |
|---|---|---|---|---|---|
| [Playwright](https://playwright.dev) 1.63 | drives the installed Chrome: renders carousels, stories, highlight covers, caption frames, previews; captures websites | `tools/render/`, `tools/brand/`, `tools/capture/` | Apache-2.0 | `tools/package.json` | core |
| [Lucide](https://lucide.dev) icons 0.469 | icons on carousels, stories, highlight covers | `tools/render/` | ISC | `tools/package.json` | core |
| 51 font families | brand typography: Latin, Persian (incl. Nastaliq), Arabic | everything visual | SIL OFL 1.1 (each folder has its OFL.txt) | in the repo: `fonts/` | core |
| [Noto Color Emoji](https://github.com/googlefonts/noto-emoji) v2.051 (COLRv1) | the same licensed emoji in every render | renderers | SIL OFL 1.1 | `tools/install.sh` → `tools/vendor/noto-emoji/` | core |
| [Tabler Icons](https://tabler.io/icons) 3.49, [Phosphor](https://phosphoricons.com) 2.1, [Heroicons](https://heroicons.com) 2.2 | ~7,000 more icons (`tabler:`, `phosphor:`, `hero:`) | `tools/render/` | MIT | `tools/package.json` | core |
| [Open Doodles](https://www.opendoodles.com) (Pablo Stanley) | 32 illustrations, recoloured to the brand (`doodle:`) | `tools/render/` | CC0 | in the repo: `assets/illustrations/open-doodles/` | core |
| [DiceBear](https://www.dicebear.com) 9.4 + Open Peeps, Notionists, Lorelei, Thumbs | people illustrations from any word (`peep:` …) | `tools/render/` | code MIT, these designs CC0 | `tools/package.json` | core |
| OpenStreetMap data via [Overpass](https://overpass-api.de) + [Nominatim](https://nominatim.org) | the `location` story map, drawn by the kit | `tools/render/maps.mjs` | ODbL (credit printed on the map) | fetched per map, cached | core |
| [Openverse](https://openverse.org), [Wikimedia Commons](https://commons.wikimedia.org), [Pexels](https://www.pexels.com/license/), [Pixabay](https://pixabay.com/service/license-summary/), [Unsplash](https://unsplash.com/license) | photos, videos, CC0 music and sound effects with a credits file | `tools/assets/fetch.mjs`, `/assets` | per file: CC0/PD (BY with `--allow-by`) · the sites' own licences | fetched per reel, never stored in the kit | account (free keys for the last three) |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 4 | runs and deploys the Telegram bots (Cloudflare Workers, D1, Browser Rendering) | `telegram-bot/` | MIT / Apache-2.0 | `telegram-bot/package.json` | core |
| [ffmpeg](https://ffmpeg.org) | cutting, audio, burning captions, frames for QA | `tools/take/`, `tools/render/captions.mjs`, QA | LGPL/GPL (system install) | Homebrew / apt | core |
| [HyperFrames](https://github.com/heygen-com/hyperframes) 0.8.46 | HTML → MP4 engine of the video styles (/vogue /hud /swiss /vox /doodle + the 8 newer ones) | `tools/style-reel/` | Apache-2.0 | `npx hyperframes@0.8.46` | video |
| HyperFrames skills | the `/hyperframes` router and its core skills for Claude Code (captions, audio, animation, CLI) | Claude Code | Apache-2.0 | `npx hyperframes@0.8.46 skills update` | all |
| [WhisperX](https://github.com/m-bain/whisperX) | word-level timings; aligns YOUR OWN SRT/script to the audio (no rewriting of your words) | `tools/style-reel/srt_words.py`, `/captions` | BSD-2-Clause | `uv tool install whisperx` | video |
| OpenCV (YuNet face model) | QA: captions and graphics never cover a face | `tools/style-reel/qa.py` | Apache-2.0 (model: MIT) | `tools/requirements.txt` → `tools/.venv` (model downloaded on first use) | core |
| Pillow, numpy | contact sheets, palettes, placeholders | `tools/render/sheet.py`, `tools/brand/palette.py` | HPND / BSD | `tools/requirements.txt` → `tools/.venv` | core |
| [persian-motion-director](https://github.com/atmirrr/persian-motion-director) @5499640 | Persian typography linter (ی/ک, digits, half-spaces, RTL code traps) + a motion-direction skill | `tools/vendor/`, `/captions` and style reels in Persian | MIT | `git clone` (pinned) | video |
| [NextWork AI video editor](https://github.com/nextwork-projects/ai-video-editor) | Claude Code plugin: cuts retakes, false starts and dead air from a raw take; style edits | Claude Code (`/ai-editor:cut`) | MIT | `claude plugin install ai-editor@nextwork` | all |
| [OmniVoice](https://github.com/k2-fsa/OmniVoice) | optional: text-to-speech in the owner's OWN cloned voice (with their consent) for a voice-over fix | by hand | Apache-2.0 | not installed by the script (large model) | optional |
| [OpenMontage](https://github.com/calesthio/OpenMontage) | optional: an open video-editing studio, if they prefer a timeline | separate app | AGPL-3.0 | their own install, never vendored | optional |
| [Recordly](https://github.com/webadderallorg/recordly) | optional: screen recording with zooms for pages only a logged-in user can see | separate app | AGPL-3.0 | their own install, never vendored | optional |
| [Zernio](https://zernio.com) | publishing, analytics, comment-to-DM (API) | `tools/zernio/`, the bot | commercial service | an account (setup phase 7) | account |
| [Gemini API](https://aistudio.google.com) | search, idea scoring, post writing, reply suggestions in the bot | the bot | Google API terms | a free key (setup phase 7) | account |

## Rules for adding a tool
1. Licence first: MIT, Apache-2.0, BSD, ISC, OFL may be vendored (with its licence file and a line in `THIRD_PARTY_NOTICES.md`);
   GPL/AGPL only as a separate app the owner installs; "free for personal use" fonts and assets never.
2. Pin it (a version or a commit) in `tools/install.sh` and in this table.
3. Add a check to `bash tools/install.sh check`, and a line to `CHANGELOG.md` with an `Action:` line telling users to run it.
