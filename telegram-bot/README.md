# Reel Studio bots (Cloudflare Worker)

Two Telegram bots in one free Cloudflare Worker. No server, no laptop needed once deployed.
The bot UI is in Persian; every brand detail comes from `wrangler.jsonc` → `vars`.

- **Studio bot** (private, answers only `OWNER_ID`): ideas inbox (send any link or text), draft cards (✅ ⏰ ✏️ ❌),
  menu: 🎬 ریل‌ها · 📝 پیش‌نویس‌ها · 💡 ایده‌ها · 📅 برنامه · 📸 استوری · 📰 خبر · 🔎 سرچ · ➕ ایده‌ی جدید · ⚙️ وضعیت.
- **Publisher bot**: shows every Telegram post exactly as the channel will see it; it goes to `PUBLISH_CHAT` only after your final ✅.
- **Zernio**: reels and stories go to Instagram (+ YouTube) through Zernio. A reel "package" card schedules the post, arms the
  comment-to-DM gate automation and sends the Telegram post for final approval, all with one ✅.
- **Gemini** (free key): 🔎 search with Google grounding, 🧠 idea scoring, ✍️ Telegram post writer, a news digest every ~3 days,
  a daily story idea. Every link is opened before it reaches you; broken ones are replaced or flagged.

- **Reports** (`src/reports.js`): every morning (`DAILY_REPORT_AT`, default 09:00) followers gained/lost yesterday, the 7-day
  trend, 30-day views, a **page score out of 100** (growth, reach, saves+shares, retention, consistency, each against the
  page's own baseline) and the week's best post. Every post gets a report **24 hours** and **7 days** after publishing:
  views and rank among earlier reels, saves/shares per 1k vs the median, skip rate and watch time, followers that day,
  gate comments and DMs sent, strongest and weakest part with a fix. 📊 opens a private **dashboard page** served by the
  Worker (followers, score history, score parts, strengths/weaknesses, audience cities and ages, best times, every post).
- **Zernio webhooks** (registered by `/setup`): an alert when Instagram disconnects, a note when a post goes live or fails.

Nothing is published without your ✅.

## Settings (`wrangler.jsonc` → `vars`)

| var | what |
|---|---|
| `OWNER_ID` | your numeric Telegram id (message @userinfobot) |
| `PUBLISH_CHAT` | start with your own id (test: posts come to you marked «تست»), later `@yourchannel` |
| `ZERNIO_DRY_RUN` | `1` shows the Zernio request without sending; `0` = live |
| `BRAND_NAME`, `IG_HANDLE`, `TG_CHANNEL` | your brand name, Instagram handle, channel signature |
| `CREATOR_NAME`, `AUDIENCE`, `NEWS_TOPIC`, `STORY_IDEA_KIND`, `AUDIENCE_NOTE` | what the Gemini prompts know about you and your viewers |
| `AUDIO_NAME` | the "original audio" name on Instagram (empty = brand name) |
| `TAGS` | up to 8 idea tags, comma separated |
| `STORY_BG/INK/ACCENT/MUTED` | story frame colours from your design system |
| `TZ_NAME`, `TZ_LABEL` | any IANA time zone and how the bot names it |
| `REEL_DAYS`, `REEL_TIME` | reel cadence (0 = Sunday); never two Instagram posts on one day |
| `STORY_IDEA_AT`, `STORY_POST_TIME`, `NEWS_CHECK_AT`, `NEWS_POST_TIME` | daily jobs, local time (`off` disables) |
| `DAILY_REPORT_AT`, `POST_REPORTS` | the daily page report time (`off` disables) and the 24 h / 7-day post reports (`on`/`off`) |

**Your formats live in `src/formats.js`**: the Telegram post format, the Gemini prompts (news, story idea, search, scoring),
the story frame design and the replies under gate comments. The shipped values are neutral examples; `/setup`
rewrites them with you (a bakery gets its own). `index.js` holds only the mechanics.

Story font: Vazirmatn (OFL) in `src/fonts.js`. To use your brand font, replace the two base64 strings with your own woff2 files
(only fonts whose licence allows embedding).

## Secrets (never in a file you commit)

You create: `STUDIO_BOT_TOKEN`, `PUBLISHER_BOT_TOKEN` (@BotFather), `ZERNIO_API_KEY` (zernio.com → API keys),
`GEMINI_API_KEY` (aistudio.google.com → Get API key). Random: `WEBHOOK_SECRET`, `SETUP_KEY`, `INGEST_KEY` (`openssl rand -hex 24` each).
Put all seven in GitHub → repo → Settings → Secrets and variables → Actions, plus `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
The workflow copies them into the Worker. After adding or rotating a bot token, open `https://<worker-url>/setup?key=<SETUP_KEY>` once.

## Deploy

Push to `main` → `.github/workflows/deploy-bot.yml` creates the D1 database on the first run, applies migrations, deploys,
copies secrets and points both webhooks at the Worker. Set the repo variable `BOT_URL` (Settings → Variables) to your Worker
URL (`https://reel-studio-bot.<your-subdomain>.workers.dev`) so the workflow can call `/setup`.

## API for Claude routines (header `X-Api-Key: <INGEST_KEY>`)

- `POST /api/drafts` `{kind: telegram|news|story|story_manual|reel|carousel, body, title?, media_url?, scheduled_for? (UTC ISO)}` → a card in Studio
- `POST /api/packages` `{slug, title, zernio_post_id, video_url, yt_url?, cover_url?, ig_caption, yt_title?, yt_desc?, gate?, dm?, dm_media?, comment_reply?, telegram?}`
  → a reel publish card. Call it only after the render was approved and the Zernio DRAFT exists.
- `POST /api/packages/:id/schedule` `{at: UTC ISO}` · `GET /api/packages` · `GET /api/drafts` · `GET /api/ideas?status=new`
- `PATCH /api/ideas/:id` `{summary, note, tag, score, status, title}` · `POST /api/notify` `{text}` · `POST /api/job` `{type, arg}`
- `GET /api/dashboard?k=<sha256(INGEST_KEY + ":dashboard") first 40 hex>` → posts, followers, account totals, online hours, pipeline, ideas, news

## Test locally (no real Telegram, Zernio or Cloudflare)

```bash
cd telegram-bot && bash test/all.sh     # 133 checks in three configurations, incl. "nothing sent to any chat but the owner"
```
`node test/gemini.mjs news|story|search` runs the Gemini features against a mock Telegram with your real `GEMINI_API_KEY` in `.dev.vars`.

## Webhook self-heal

Telegram sometimes fails to resolve a fresh workers.dev host. Every 5 minutes the Worker checks the Studio webhook and sets it
again until Telegram accepts it. `/setup?key=<SETUP_KEY>&info=1` shows both webhooks.
