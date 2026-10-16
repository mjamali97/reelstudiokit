# Connecting the accounts (setup phase 7–9)
The click-by-click part of /setup: the machine, Zernio, Telegram, Cloudflare + GitHub, deploy, the baseline and going live.
/setup walks the owner through it one screen at a time; each block can be skipped and done later (`/setup accounts`).
Rules: they type every password, key and token themselves (into `.env`, GitHub secrets or Cloudflare), never into the
chat; never deploy from a machine whose `npx wrangler whoami` is not their own Cloudflare account; verify each step with
a command or a screenshot before ticking it in `profile/SETUP-STATUS.md`.

## A · Machine

Check `git --version`, `node -v`, `python3 --version`, `ffmpeg -version`, Chrome installed, `uv --version`. On macOS
install what is missing with Homebrew (`brew install git node python ffmpeg uv`; Chrome from google.com/chrome). On
Linux and WSL2: `sudo apt install git ffmpeg python3 python3-venv` (Python 3.11+), Node 20+ from nvm (`nvm install --lts`)
or NodeSource, not apt's `nodejs` (usually older than 20), uv with its install script. `bash tools/install.sh` checks the
versions and prints the right command. On Windows use WSL2 (Ubuntu) for everything except Chrome. `tools/capture/ocrfind` (placing highlights on screenshots of their own site) is macOS-only;
skip it elsewhere.

## B · Video tools

```bash
bash tools/install.sh video      # the HyperFrames engine check, WhisperX, the Persian typography linter
bash tools/install.sh all        # optional: HyperFrames skills and the NextWork editor plugin for Claude Code
swiftc -O tools/capture/ocrfind.swift -o tools/capture/ocrfind   # macOS only: finding text on screenshots of their own site
```
Show them every style without rendering: `node tools/style-reel/stills.mjs <style> --sheet` for the two or three that fit their
playbook (or `docs/showcase/styles.png` for all 14). Render one demo in the style they like
(`cd tools/style-reel && npx --yes hyperframes@0.8.46 render --variables '{"style":"<name>"}' --strict-variables -o renders/demo-<name>.mp4`)
and show its 3 fps sheet (`qa.py --sheet`). Delete `tools/style-reel/renders/` afterwards.

## C · Zernio (Instagram + YouTube publishing, analytics, comment-to-DM)

Walk them through, one screen at a time (they click, you confirm from a screenshot or from the API):
1. Sign up at zernio.com. Pricing at the time of writing (Oct 2026): the first two social accounts free, then about $6 a
   month per account; check zernio.com/pricing for today's numbers before they decide.
2. Their Instagram must be a Professional account (Creator or Business): Instagram app → Settings → Account type.
3. Zernio dashboard → connect Instagram (and YouTube if they want Shorts). Telegram can also be connected there, but this
   kit posts to Telegram through its own Publisher bot.
4. Zernio → API keys → create one. They open `.env` (copy of `.env.example`) and paste it after `ZERNIO_API_KEY=` themselves.
5. Verify: `python3 -I tools/zernio/zernio.py accounts` lists their accounts (never print the key).
Comment-to-DM automations live under Inbox → Campaigns → Comment-to-DM in Zernio's UI; the bot creates them per reel.

## D · Telegram channel and bots

1. Channel: Telegram → New Channel → public, `t.me/<name>`. Name = `<brand> | <what they get>`; description ≤ 255
   characters saying what files/links live there and that the gate word is searchable with #. Pinned post: what the
   channel is, how to find a reel's files (#gateword), where to ask questions. Avatar from step 4.
2. Two bots with @BotFather → /newbot: a **Studio** bot (private inbox and approvals) and a **Publisher** bot (posts to the
   channel). /setuserpic with the logos from step 4. Each gives a token: they paste them into GitHub secrets in step 8,
   never into the chat.
3. Add the Publisher bot to the channel as an administrator with "Post messages".
4. Their numeric user id: they message @userinfobot and tell you the number (an id is not a secret).
5. Gemini key (free) for search, idea scoring, post writing, news and story ideas: aistudio.google.com → Get API key.

## E · Cloudflare + GitHub

1. Cloudflare (free plan): dash.cloudflare.com → sign up. Account ID: right column of the Workers & Pages overview.
   API token: My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers", then add
   Account · D1 · Edit and Account · Browser Rendering · Edit; scope it to their account.
2. GitHub: their own **private** repo for this folder, with the kit as `upstream` so `/update` can pull new versions:
   - cloned from the kit: `git remote rename origin upstream`, then `gh repo create <name> --private --source . --remote origin --push`;
   - from the zip (no `.git`): `git init -b main && git add -A && git commit -m "my studio"`, `git remote add upstream
     https://github.com/mjamali97/reelstudiokit.git`, then the same `gh repo create … --remote origin --push`.
   Check `git status` first: `.env`, `tools/.venv`, videos and takes must be ignored. Never push to `upstream`.
3. Fill `telegram-bot/wrangler.jsonc` → `vars` with them: OWNER_ID, PUBLISH_CHAT = their own id for now (test mode),
   TG_CHANNEL, CREATOR_NAME, AUDIENCE (one line from CREATOR.md), NEWS_TOPIC, AUDIENCE_NOTE (optional: one extra
   rule for scoring ideas, e.g. "viewers cannot pay in foreign currency"), BUSINESS_FACTS (hours, address, how to order,
   price-list link: the only facts the reply assistant may use), TAGS, TZ_NAME/TZ_LABEL, times. BRAND_NAME, IG_HANDLE,
   LANG, BRAND_VOICE and the STORY_* colours come from `node tools/brand/apply.mjs`. Leave ZERNIO_DRY_RUN = "1".
4. Secrets (repo → Settings → Secrets and variables → Actions → New secret), entered by them:
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `STUDIO_BOT_TOKEN`, `PUBLISHER_BOT_TOKEN`, `ZERNIO_API_KEY`,
   `GEMINI_API_KEY`, and three random ones you generate locally and they paste: `WEBHOOK_SECRET`, `SETUP_KEY`,
   `INGEST_KEY` (`openssl rand -hex 24` each; also keep `INGEST_KEY` and `BOT_URL` in `.env` for routines).
5. Variable (same page, Variables tab): `BOT_URL` = `https://reel-studio-bot.<their-subdomain>.workers.dev` (the subdomain
   is shown under Workers & Pages; after the first deploy the exact URL is in the Action log).

## F · Deploy and test

Before pushing: `bash telegram-bot/test/all.sh` must say ALL GREEN. Push to `main`; watch the Action (`gh run watch`).
It creates the D1 database, deploys, copies secrets and sets both webhooks. Then, in Telegram:
- Studio bot → /start: the menu appears in their language (LANG). 📊 → the dashboard opens; 📈 sends today's report now. Send any link: an idea card comes back.
- 🔎 Search → a question: a grounded answer with links (Gemini works).
- From the idea card ✍️ Telegram post → ✅ → the Publisher bot shows the exact post → ✅ → it arrives in their own
  chat marked as a test (test mode). Nothing reached the channel.
If a webhook did not set, open `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` (they open it; the key stays with them).

## G · Baseline from their own account

`python3 -I tools/zernio/zernio.py analytics --out research/analytics/posts.json` and `insights`. Write their top posts
into `profile/HOOKS.md` (the first line of each, views, saves and shares per 1k, skip rate) and note the pattern of each
hook. Pick `REEL_DAYS`/`REEL_TIME` from Zernio's online-followers / best-time data (two or three evenly spread days at
the evening peak), update `wrangler.jsonc`, push. No account yet or under ~10 posts: leave the defaults and say so.
Then run `/page-audit` once: their page, audience and 3–5 competitors, with the top 5 fixes (bio, highlights, pinned
posts, content mix, timing). It is the starting point every later audit is compared with.

## H · Go live (only when they say so)

After one full dry run of a reel package and a Telegram post looked right: `PUBLISH_CHAT` = `@theirchannel`,
`ZERNIO_DRY_RUN` = `"0"`, push. Set `STATUS: ready` in CREATOR.md. Tell them the weekly loop: `/content-plan` → film the shot list → `/reel-idea` per reel (or ideas sent to the Studio
bot) → `/reel-style` → edit → approve → `/publish` → ✅ on the card → `/analytics`.
