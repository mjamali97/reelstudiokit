---
name: setup
description: First-run onboarding for this content studio, for any kind of page (a creator, a bakery, a clinic, a course, a shop). Interviews the owner, builds their profile, voice notes and design system, installs the video tools, connects Zernio (Instagram/YouTube), creates and deploys their two Telegram bots, and pulls an analytics baseline. Use when they type /setup, when profile/CREATOR.md says "STATUS: not set up", or when they ask to change their brand, accounts or bots («ستاپ», «راه‌اندازی», «از اول تنظیم کن»).
---

# /setup · make this studio theirs

Talk in the creator's language (ask once at the start). Short messages, one step at a time; use AskUserQuestion for choices.
Progress lives in `profile/SETUP-STATUS.md` (copy it from the template below on the first run): tick each box as it is
done, so a later session resumes where this one stopped. Read it first; skip what is ticked.

**Hard rules:** never ask them to paste a key or token into the chat; they put secrets in `.env` or GitHub/Cloudflare
settings themselves (you may open the file or the page for them). Never sign up, log in or type credentials for them.
Never deploy from a machine whose `npx wrangler whoami` is not their own Cloudflare account. Verify every step with a
command or a screenshot before ticking it.

```markdown
# Setup status
- [ ] 1 machine: git, node ≥ 20, python ≥ 3.11, ffmpeg, Google Chrome, uv
- [ ] 2 profile/CREATOR.md
- [ ] 3 profile/VOICE.md from their own takes
- [ ] 4 brand: BRAND.md, tokens.css, fonts, logo → style kit, bot colours, channel avatar
- [ ] 4b their formats: caption, Telegram post, story, gate DM, comment replies → playbook/ + telegram-bot/src/formats.js
- [ ] 5 video tools: venv, whisperx, capture, assets, demo renders seen
- [ ] 6 Zernio: account, Instagram (+ YouTube) connected, key in .env, `zernio.py accounts` OK
- [ ] 7 Telegram: channel, two bots, ids
- [ ] 8 Cloudflare + GitHub: token, account id, private repo, secrets, BOT_URL
- [ ] 9 bots deployed, /setup webhook OK, test post reached them in test mode
- [ ] 9b business playbook chosen or written, first /content-plan made
- [ ] 10 analytics baseline: HOOKS.md, REEL_DAYS/REEL_TIME from their audience, first /page-audit
- [ ] 11 go live (only when they say): PUBLISH_CHAT = channel, ZERNIO_DRY_RUN = 0
```

## 1 · Machine

Check `git --version`, `node -v`, `python3 --version`, `ffmpeg -version`, Chrome installed, `uv --version`. On macOS
install what is missing with Homebrew (`brew install git node python ffmpeg uv`; Chrome from google.com/chrome). On
Windows use WSL2 (Ubuntu) for everything except Chrome. `tools/capture/ocrfind` (placing highlights on screenshots of their own site) is macOS-only;
skip it elsewhere.

## 2 · The profile (interview, then write `profile/CREATOR.md`)

Ask in three short rounds, not one form:
0. **What kind of page:** a person building an audience (creator, expert, coach) or a business selling something (a bakery,
   a café, a clinic, a salon, an online shop, a course). Everything after this adapts: a bakery's "proof" is the cake
   coming out of the oven and real customers, its gate reward is the menu or an order link, its news digest is probably
   off and its story ideas are today's batch, a poll, a seasonal special. Pick their playbook from the 20 in `playbook/business/INDEX.md` and
   write its name in CREATOR.md → "Business playbook". No file fits: write `playbook/business/<their-type>.md` from
   `_TEMPLATE.md` with them (customer, pillars, 10 reel ideas with hooks in their words, weekly shot list, proof, gate
   words, stories, never-do list, styles), then read it back to them. If a file fits but not fully, adapt a copy.
1. **Who:** the name to call them, brand name (Latin + their language), handles (Instagram, YouTube, Telegram channel they
   want), language(s) of the content, time zone, country/city they film in.
2. **What and for whom:** their niche in one line; the viewer (who, where, what blocks them: money, access, language,
   time, trust); for a business: what they sell, prices they are happy to show, where they deliver, opening hours,
   how people order (DM, phone, site, Snappfood…), what customers ask most; what they can prove about themselves (degree, job, things they built, numbers) with a public link for each;
   what they never want to talk about.
3. **How:** formats (talking head + full-screen b-roll is the default of this kit), reels per week, which days they can
   film, whether they batch-film (then outfits must be tagged, see `playbook/PUBLISH.md`), the goal for the next 90 days.

Write `profile/CREATOR.md` from the template already in the file. Mark `STATUS: ready` only at the end of step 11.
If they already post: ask for their handle, then in step 10 fill the real numbers. Never guess a number.

## 3 · Their voice (`profile/VOICE.md`)

Ask for two or three of their own past takes (video, audio or SRT), or a 60-second voice memo answering "what do you
do and why". Transcribe with their own SRT or WhisperX, then write VOICE.md: how a sentence of theirs actually runs
(length, connectors, the words they repeat), how they open, how they close, how they ask for the comment, words they
never use. Quote their real lines. A script is later checked against this file, never against a generic "short punchy
lines" rule: written slogans do not sound like a person talking.

## 4 · Their design system (`brand/`)

Ask: do they already have one (colours, fonts, logo)? Then import it. If not, build one with them:
- Three adjectives for how the page should feel, two accounts or brands whose look they like (and why), colours they
  love or hate, one Persian/Latin font they like if any.
- Make one HTML preview page (`brand/preview.html`) with 3 directions: each a palette (background, ink, one accent,
  one muted, success), a Persian display face + a body face + a Latin/mono face, and the same sample frame rendered
  in each (a 9:16 b-roll title card, a caption chip, a story frame). Fonts only with a licence that allows embedding
  in videos and web pages (OFL fonts like Vazirmatn, Estedad, Markazi Text, Bodoni Moda are safe; check anything else).
  Open it for them (screenshot via `npx --yes hyperframes@0.8.46 snapshot` or Chrome), they pick or mix.
- Write `brand/BRAND.md` (palette with hex, fonts with licence and file, logo files, tone words, do/don't) and
  `brand/tokens.css` (`--bg --ink --accent --muted --ok --font-fa --font-body --font-mono`).
- Apply it: copy the font files into `tools/style-reel/assets/fonts/` and point the `"Fa"` `@font-face` lines in
  `tools/style-reel/assets/fonts.css` at them (that file is theirs; kit updates never overwrite it); fill `tools/style-reel/assets/brand.js` (mast, nameFa, handle, year); set
  `STORY_BG/INK/ACCENT/MUTED` in `telegram-bot/wrangler.jsonc`; if they want story frames in their font, replace the two
  base64 strings in `telegram-bot/src/fonts.js` with their woff2 files.
- Telegram channel avatar: a square HTML (`brand/channel-logo.html`, 1080×1080, content inside the central circle)
  rendered to `brand/channel-logo-640.png`. Same for the two bots (Studio, Publisher) so they can tell them apart.
  The five edit styles keep their own palettes on purpose (that is what makes them styles); the brand enters through
  the fonts, brand.js, captions and covers.

## 4b · Their formats (they own these; the kit only ships examples)

Every text the studio writes in their name follows a format they chose. Show the kit's example for each and the example in their
business playbook, say it is only an example, and build theirs with them, one at a time, with two or three variants
to pick from. Save each one where the skills and the bot read it:

| format | the kit's example | theirs goes in |
|---|---|---|
| Instagram caption | hook question → gate CTA → one-line description + links → save/share CTA → 5 topic hashtags | `playbook/CAPTION.md` |
| Telegram channel post | emoji + intro line, label/link pairs, 🔴 tip, 💬 #gateword, ➡️ @channel | `playbook/TELEGRAM-POST.md` and `TG_FORMAT` + `TG_EXAMPLE` in `telegram-bot/src/formats.js` |
| story | 2–3 frames, ≤ 4 short lines each, a label chip, → as the "next" cue, a sticker (link/poll/question) when useful | `playbook/TELEGRAM-POST.md` → Stories, `STORY_RULES` + `STORY_IDEA_KIND` + `frameHtml` (the frame design, in their brand) in `formats.js` |
| gate DM (comment-to-DM) | message 1: steps + link; message 2: the thing itself, alone so a long-press copies it | `playbook/CAPTION.md` → "Gate DM" |
| public reply under a gate comment | 12 short variations («فرستادم، دایرکتت رو چک کن 🙌»…) | `REPLY_POOL` in `formats.js` |
| news digest | news of their field every 3 days (off by default) | `NEWS_PROMPT` in `formats.js`, or `NEWS_CHECK_AT: "off"` |
| idea score | distance, hook, proof, reward, novelty, length | `SCORE_RULES` in `formats.js` and the table in `playbook/IDEA-TO-REEL.md` |

For example, a bakery: caption = the product's name and one sensory line → price/order line → "کامنت کن «منو» تا منو
رو برات بفرستم" → address/hours → hashtags of the city and the product; Telegram post = photo + name + price + how to
order; story = today's batch + a poll. Render one story frame with their `frameHtml` (Chrome screenshot of the HTML)
and show it before saving. Run `bash telegram-bot/test/all.sh` after editing `formats.js`.

## 5 · Video tools

```bash
python3 -m venv tools/.venv && tools/.venv/bin/pip install -r tools/requirements.txt
uv tool install whisperx                       # forced alignment of their SRT; set WHISPERX_PY if it lives elsewhere
(cd tools/capture && npm install)              # webcap / webrec (drive the installed Chrome)
swiftc -O tools/capture/ocrfind.swift -o tools/capture/ocrfind   # macOS only
tools/.venv/bin/python tools/style-reel/make_assets.py
tools/.venv/bin/python tools/style-reel/make_demo.py
cd tools/style-reel && npx --yes hyperframes@0.8.46 check
```
Render the demo once per style (`render --variables '{"style":"<name>"}' --strict-variables -o renders/demo-<name>.mp4`)
and show them a 3 fps contact sheet of each (qa.py `--sheet`). They now know what /vogue /hud /swiss /vox /doodle look like.
Delete `tools/style-reel/renders/` afterwards.

## 6 · Zernio (Instagram + YouTube publishing, analytics, comment-to-DM)

Walk them through, one screen at a time (they click, you confirm from a screenshot or from the API):
1. Sign up at zernio.com. Pricing at the time of writing (Oct 2026): the first two social accounts free, then about $6 a
   month per account; check zernio.com/pricing for today's numbers before they decide.
2. Their Instagram must be a Professional account (Creator or Business): Instagram app → Settings → Account type.
3. Zernio dashboard → connect Instagram (and YouTube if they want Shorts). Telegram can also be connected there, but this
   kit posts to Telegram through its own Publisher bot.
4. Zernio → API keys → create one. They open `.env` (copy of `.env.example`) and paste it after `ZERNIO_API_KEY=` themselves.
5. Verify: `python3 -I tools/zernio/zernio.py accounts` lists their accounts (never print the key).
Comment-to-DM automations live under Inbox → Campaigns → Comment-to-DM in Zernio's UI; the bot creates them per reel.

## 7 · Telegram

1. Channel: Telegram → New Channel → public, `t.me/<name>`. Name = `<brand> | <what they get>`; description ≤ 255
   characters saying what files/links live there and that the gate word is searchable with #. Pinned post: what the
   channel is, how to find a reel's files (#gateword), where to ask questions. Avatar from step 4.
2. Two bots with @BotFather → /newbot: a **Studio** bot (private inbox and approvals) and a **Publisher** bot (posts to the
   channel). /setuserpic with the logos from step 4. Each gives a token: they paste them into GitHub secrets in step 8,
   never into the chat.
3. Add the Publisher bot to the channel as an administrator with "Post messages".
4. Their numeric user id: they message @userinfobot and tell you the number (an id is not a secret).
5. Gemini key (free) for search, idea scoring, post writing, news and story ideas: aistudio.google.com → Get API key.

## 8 · Cloudflare + GitHub

1. Cloudflare (free plan): dash.cloudflare.com → sign up. Account ID: right column of the Workers & Pages overview.
   API token: My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers", then add
   Account · D1 · Edit and Account · Browser Rendering · Edit; scope it to their account.
2. GitHub: their own **private** repo for this folder, with the kit as `upstream` so `/update` can pull new versions:
   - cloned from the kit: `git remote rename origin upstream`, then `gh repo create <name> --private --source . --remote origin --push`;
   - from the zip (no `.git`): `git init -b main && git add -A && git commit -m "my studio"`, `git remote add upstream
     https://github.com/mjamali97/reelstudiokit.git`, then the same `gh repo create … --remote origin --push`.
   Check `git status` first: `.env`, `tools/.venv`, videos and takes must be ignored. Never push to `upstream`.
3. Fill `telegram-bot/wrangler.jsonc` → `vars` with them: OWNER_ID, PUBLISH_CHAT = their own id for now (test mode),
   BRAND_NAME, IG_HANDLE, TG_CHANNEL, CREATOR_NAME, AUDIENCE (one line from CREATOR.md), NEWS_TOPIC, AUDIENCE_NOTE
   (optional, e.g. the access rule for viewers inside Iran), TAGS, TZ_NAME/TZ_LABEL, times. Leave ZERNIO_DRY_RUN = "1".
4. Secrets (repo → Settings → Secrets and variables → Actions → New secret), entered by them:
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `STUDIO_BOT_TOKEN`, `PUBLISHER_BOT_TOKEN`, `ZERNIO_API_KEY`,
   `GEMINI_API_KEY`, and three random ones you generate locally and they paste: `WEBHOOK_SECRET`, `SETUP_KEY`,
   `INGEST_KEY` (`openssl rand -hex 24` each; also keep `INGEST_KEY` and `BOT_URL` in `.env` for routines).
5. Variable (same page, Variables tab): `BOT_URL` = `https://reel-studio-bot.<their-subdomain>.workers.dev` (the subdomain
   is shown under Workers & Pages; after the first deploy the exact URL is in the Action log).

## 9 · Deploy and test

Before pushing: `bash telegram-bot/test/all.sh` must say ALL GREEN. Push to `main`; watch the Action (`gh run watch`).
It creates the D1 database, deploys, copies secrets and sets both webhooks. Then, in Telegram:
- Studio bot → /start: the 10-button menu appears. 📊 → the dashboard opens; «📈 گزارش امروز» sends the daily report now. Send any link: an idea card comes back.
- 🔎 سرچ → a question: a grounded answer with links (Gemini works).
- From the idea card ✍️ پست تلگرام بساز → ✅ → the Publisher bot shows the exact post → ✅ → it arrives in their own
  chat marked «تست» (test mode). Nothing reached the channel.
If a webhook did not set, open `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` (they open it; the key stays with them).

## 10 · Baseline from their own account

`python3 -I tools/zernio/zernio.py analytics --out research/analytics/posts.json` and `insights`. Write their top posts
into `profile/HOOKS.md` (the first line of each, views, saves and shares per 1k, skip rate) and note the pattern of each
hook. Pick `REEL_DAYS`/`REEL_TIME` from Zernio's online-followers / best-time data (two or three evenly spread days at
the evening peak), update `wrangler.jsonc`, push. No account yet or under ~10 posts: leave the defaults and say so.
Then run `/page-audit` once: their page, audience and 3–5 competitors, with the top 5 fixes (bio, highlights, pinned
posts, content mix, timing). It is the starting point every later audit is compared with.

## 11 · Go live (only when they say so)

After one full dry run of a reel package and a Telegram post looked right: `PUBLISH_CHAT` = `@theirchannel`,
`ZERNIO_DRY_RUN` = `"0"`, push. Set `STATUS: ready` in CREATOR.md. Tell them the weekly loop: `/content-plan` → film the shot list → `/reel-idea` per reel (or ideas sent to the Studio
bot) → `/reel-style` → edit → approve → `/publish` → ✅ on the card → `/analytics`.
