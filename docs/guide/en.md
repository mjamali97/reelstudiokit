# Reel Studio · the complete guide

**Languages:** English · [فارسی](fa.md) · [العربية](ar.md) · [Türkçe](tr.md) · [Deutsch](de.md) · [Français](fr.md) · [Italiano](it.md)

Reel Studio is a content studio that runs inside [Claude Code](https://claude.com/claude-code). You talk to Claude in your
language; it plans your posts, writes them in your brand's voice, edits reels in 14 motion styles, renders carousels,
stories and highlight covers in your brand, publishes through Zernio after your ✅, and sends you the numbers every
morning in Telegram. It works for any page: a bakery, a restaurant, a photo studio, a salon, a clinic, an online shop, an
expert, a personal page, or an agency with many clients.

---

## 1 · Try it first (5 minutes, no accounts)

```bash
git clone https://github.com/mjamali97/reelstudiokit.git my-studio
cd my-studio
bash tools/install.sh            # checks your computer, installs the core tools
bash telegram-bot/demo/demo.sh   # the bots, running locally with fake Telegram, Instagram and Gemini
```

From inside Claude Code you can also install it as a plugin: `/plugin install reel-studio --marketplace mjamali97/reelstudiokit`,
then `/reel-studio:start` clones the kit into a folder you choose and installs the tools.

A page opens with three panes: your **Studio bot**, your **Publisher bot** and your **channel**. Press 📝 Drafts → ✅ on the
post → the final ✅ in the Publisher pane, and watch it arrive in the channel. Open 📊 Dashboard, 💬 Inbox, send any link.
Nothing leaves your computer. Stop with Ctrl-C. Add a language: `bash telegram-bot/demo/demo.sh de`.

The visuals are in `examples/bakery/` (a made-up bakery): 10 carousel templates, 11 story templates, highlight covers.
`fonts/gallery.html` shows the 51 fonts. In Claude Code, `/demo` walks you through all of it.

## 2 · What you need

| | |
|---|---|
| Computer | macOS, Linux, or Windows with WSL2 |
| Software | git, Node 20+, Python 3.11+, ffmpeg, Google Chrome, uv (`bash tools/install.sh` tells you what is missing and how to get it) |
| Claude Code | a Claude subscription or API key: [claude.com/claude-code](https://claude.com/claude-code) |
| Accounts (only for going live) | Instagram professional account, [Zernio](https://zernio.com) (publishing and numbers; the first two social accounts free at the time of writing), Telegram, a free Gemini key, a free Cloudflare account, GitHub |

Install levels: `bash tools/install.sh` (core: carousels, stories, captions, brand tools, the bots) · `video` (adds the
reel engine, WhisperX word timings, the Persian typography linter) · `all` (adds the HyperFrames skills and the NextWork
AI video editor plugin for Claude Code) · `check` (only reports). Every tool and its licence: `tools/STACK.md`.

## 3 · Setup: how it goes

Open the folder in a terminal, run `claude`, type **`/setup`**. It is a conversation, not a form, and you can stop at any
point; it continues where it stopped (`profile/SETUP-STATUS.md`). About an hour in total.

| phase | what happens | what you do |
|---|---|---|
| 0 Welcome | your language, full setup / demo first / agency client | pick |
| 1 Discover | what kind of business, what already exists | tick what you have: website, Instagram, brand book or logo, menu or price list, Google Maps, other socials; share links and files |
| 2 Read | Claude reads your site (colours, fonts, logo, facts, prices), your Instagram screenshots, your files, and shows **"Here is what I understood"** with a preview of your brand on real frames | correct what is wrong |
| 3 Profile and voice | only the questions your material could not answer; then **the voice**: tone sliders, how you address people, words you use and avoid, and a sample test ("which of these three sounds like you?") | answer, pick, edit |
| 4 Design system | your existing look imported, or three directions side by side to choose from; applied to every tool | pick or mix |
| 5 First audit | your page from public data: strengths, weaknesses, top 5 fixes, ready-made bio and highlight covers | apply the quick wins |
| 6 Plan and formats | your business playbook, your own caption / carousel / story / post formats, the first two-week plan | choose |
| 7–8 Accounts and bots | Zernio, Telegram channel and two bots, Cloudflare and GitHub, deploy in **test mode** | click through, paste keys into `.env` or GitHub yourself |
| 9 Baseline | your real numbers, best posting times, the full audit | read it |
| 10 Go live | posts reach the channel, Zernio stops dry-running | say "go live" |

You never paste a password or key into the chat. Claude opens the right page; you type the secret where it belongs.

## 4 · Your brand, and changing it later

Everything the studio makes reads three files:
- `brand/brand.json` — colours, fonts, logo, name, handle, language. Fonts come from the open-licence library in `fonts/`, or your own licensed font.
- `profile/CREATOR.md` — the facts: what you sell, prices (each with its source), hours, how people order, customers, proof, goals.
- `profile/VOICE.md` — the voice: personality, tone, form of address, words, emoji, how you answer customers, on-brand and off-brand lines.

Change any of it with **`/brand`** ("make our colours warmer", "we never say 'cheap'", "here is our new logo", "read our
new website"). It shows a preview first, then runs `node tools/brand/apply.mjs`, which pushes the change into the video
styles, the bot's colours and the bot's voice.

## 5 · Making content

**The weekly loop:** `/content-plan` → film the shot list → `/reel-idea` for each reel → `/reel-style` → edit → your ✅ →
`/publish` → ✅ on the card in Telegram → `/analytics` once a week.

| you want | type | what you get |
|---|---|---|
| an idea checked and scripted | `/reel-idea` (or send a link to the Studio bot) | verified facts, a script in your voice, a viral score with the weakest part, 2–3 styles with odds |
| a reel edited | `/reel-style`, then the style | a 9:16 motion edit on your own take, QA-checked |
| a carousel | `/carousel` | 1080×1350 slides from 10 templates: tips, steps, myth-fact, before-after, price menu, FAQ, comparison, testimonial, checklist, showcase |
| stories | `/story` | 1080×1920 frames from 10 templates, with space left for the poll, question, link or countdown sticker |
| highlight covers | `/story` → highlights | icon sets for food, shop, service, creator in three styles |
| subtitles on a video | `/captions` | burned-in captions in your font, inside Instagram's safe zone, word-by-word optional |

**The 14 video styles:**

| style | feel | best for |
|---|---|---|
| `/clean` | your brand colours, calm cards | a house style for any business |
| `/vogue` | magazine editorial | a person or a signature product as the hero |
| `/luxe` | black and gold, slow | jewellery, salons, fine dining, premium |
| `/vox` | collage and evidence board | stories with numbers, myth vs fact |
| `/swiss` | giant type on a grid | lists, prices, offers, news |
| `/brutal` | thick borders, loud colours | young audiences, shops, apps, drops |
| `/pop` | comic book | snacks, toys, parties, street food |
| `/retro` | 70s poster | bakeries, cafés, family places |
| `/neon` | night signs | evening businesses, bars, beauty |
| `/chalk` | menu board | cafés, restaurants, teaching |
| `/receipt` | thermal printer | prices, "what you get", delivery |
| `/hud` | screen interface | ordering, booking, online shops |
| `/doodle` | hand-drawn on paper | how-tos, recipes, tips |
| `/depth` | words behind your head | talking to camera: tips, opinions, experts |

Preview any style without rendering: `node tools/style-reel/stills.mjs neon --sheet`.

**Pictures, music, icons: only what you may use** (`/assets`). Built in: ~7,000 icons (Lucide, Tabler, Phosphor, Heroicons),
CC0 illustrations recoloured to your brand (Open Doodles; Open Peeps people from any word), Noto emoji, 51 open-licence fonts,
and a `location` story whose map is drawn in your colours from OpenStreetMap data. Fetched per reel with a credits file:
`node tools/assets/fetch.mjs openverse|commons|pexels|pixabay|unsplash "<what>"` for photos, video b-roll, CC0 music and sound
effects. Never non-commercial or share-alike material, never Google Images or another page's post; stock is "a cake", never "our cake".

Every reel passes an automatic QA (`qa.py`: no face where b-roll should be, no frozen or blank frames) and an eye check of
a 3-frames-per-second contact sheet before you see it. Every carousel and story is checked as a contact sheet.

## 6 · Publishing

Nothing is published without your ✅. `/publish` uploads the approved render to Zernio **as a draft**, writes the caption in
your format, sets the comment-to-DM gate, and sends a card to your Studio bot. One ✅ schedules Instagram (and YouTube if
connected). Telegram channel posts need a second, final ✅ in the Publisher bot, which shows the exact post.

## 7 · The Telegram bots

Two bots on a free Cloudflare Worker. Their menu speaks your language (English, Persian, Arabic, Turkish, German, French
or Italian: `LANG` in `telegram-bot/wrangler.jsonc`).

| button | what it does |
|---|---|
| 🎬 Reels · 💡 Ideas · 📝 Drafts | your pipeline; send any link or text to save it as an idea, then research and score it |
| 📅 Schedule | the content calendar: what is scheduled, what is missing |
| 📸 Stories · 📰 News | a story idea each morning (in your voice), a news digest of your field (optional) |
| 🔎 Search | a question answered with sources |
| 📊 Dashboard | a private page: followers, reach, page score, audience, best times, every post, calendar, competitors |
| 💬 Inbox | new comments and DMs with a suggested reply in your voice and facts: ✅ send, ✏️ write your own, ❌ ignore |
| ⚙️ Status | what is on, what is in test mode |
| 👥 Clients | agency mode only |

**Automatic messages:** the daily report at 09:00 (followers yesterday, 7-day trend, page score out of 100 with its five
parts), a report 24 hours and 7 days after each post (views vs your median, saves, shares, gate comments, follows), a
weekly competitors report, and a monthly PDF report.

## 8 · Numbers and audits

`/analytics` pulls your numbers from Zernio and updates what works: your hooks, the style scores, the posting days.
`/page-audit` audits the whole page (profile, grid, content mix, retention, audience vs your customer, timing,
conversion, competitors): strengths, weaknesses, top 5 fixes, a two-week plan. Once a month is enough.

## 9 · Agency mode (many clients)

Using Reel Studio for clients needs a commercial licence (`COMMERCIAL-LICENSE.md`); trying agency mode is free.

```bash
node tools/client.mjs init my-first-client      # turns the current brand into a client folder
node tools/client.mjs new bakery-roma "Forno Roma"
node tools/client.mjs use bakery-roma            # every skill and tool now works for this client
```
Run `/setup` per client (choose "Set up a client"). One Zernio account with one **profile** per client, one pair of bots
with `AGENCY: "on"`: 👥 Clients adds them, each client can join with an invite link and receive their own reports, and
`node tools/client.mjs sync <slug> --id <n>` gives the inbox assistant that client's voice and facts. Full runbook:
`playbook/AGENCY.md`.

## 10 · Updating

Type `/update` (or `bash tools/update.sh`). It pulls the new version, keeps everything that is yours (profile, brand,
formats, reels, bot settings: see `.gitattributes`), shows what is new and whether a change needs an action from you.

## 11 · Languages

- **Content:** any language Claude writes; the renderers handle right-to-left (Persian, Arabic) and left-to-right scripts,
  with matching fonts and digits.
- **Bot menus:** `LANG` = `en`, `fa`, `ar`, `tr`, `de`, `fr`, `it`.
- **This guide:** in all seven, linked at the top.

## 12 · Safety and privacy

- Nothing is published without your ✅ (twice for Telegram). Uploads are drafts.
- Keys live in `.env` (never committed) and in GitHub/Cloudflare secrets. Claude never asks you to paste one in the chat.
- Your repository is private; the kit itself contains no personal data.
- Only facts with a source go on screen or in a caption; no invented prices, reviews or numbers.
- The bot tests run against fakes: `bash telegram-bot/test/all.sh`.

## 13 · Troubleshooting

| problem | fix |
|---|---|
| `install.sh` says something is missing | install it with the command it prints, run it again |
| a render says a font did not load | the font id in `brand/brand.json` is not in `fonts/fonts.json`, or your own font's `css` path is wrong |
| the bot does not answer | open `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` (you open it; the key stays with you) and check both webhooks |
| no numbers in the report | the Instagram account needs to be a professional account connected in Zernio; new accounts need a few days of data |
| the demo does not start | port 8787 or 8790 is busy; close the other program, or see `telegram-bot/test/dev.log` |
| Persian text looks broken in a video | run `/captions`, which lints Persian (ی/ک, digits, half-spaces) before burning |

## 14 · FAQ

**Do I need to show my face?** No. Every playbook has hands-only and product-only formats.
**Is it only for Persian pages?** No. English is the main language; Persian, Arabic, Turkish, German, French and Italian are built in.
**What does it cost?** Free for your own brand or business (Business Source License 1.1); an agency, studio or freelancer using it for clients needs a commercial licence (`COMMERCIAL-LICENSE.md`). Each version becomes Apache-2.0 after four years. You pay for Claude, and for Zernio beyond its free tier.
**Can I use my own fonts?** Yes, if your licence allows social media and video use; add it as `{"name","css"}` in `brand/brand.json`.
**Will an update overwrite my work?** No. Your files are protected by `.gitattributes`.

## 15 · All commands

`/setup` `/brand` `/demo` · `/content-plan` `/reel-idea` `/reel-style` · `/clean` `/vogue` `/luxe` `/vox` `/swiss` `/brutal`
`/pop` `/retro` `/neon` `/chalk` `/receipt` `/hud` `/doodle` `/depth` · `/carousel` `/story` `/captions` · `/publish` `/telegram-post` ·
`/analytics` `/page-audit` · `/assets` · `/update`
