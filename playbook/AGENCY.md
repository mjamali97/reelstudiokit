# Agency mode · many clients, one studio
For a freelancer, a social media manager or an agency running several pages. Each client keeps their **own** brand, voice,
facts, formats, reels and reports; nothing of one client ever reaches another.

**Licence:** using Reel Studio for clients needs a commercial licence (`COMMERCIAL-LICENSE.md`); trying agency mode does not.

## How it is organised
| | single brand | agency |
|---|---|---|
| brand, voice, facts | `profile/`, `brand/`, `reels/` | `clients/<slug>/profile`, `/brand`, `/reels`; the root names are links to the **active** client |
| switching | n/a | `node tools/client.mjs use <slug>` (every skill, renderer and tool then works on that client) |
| bot | one page | one bot, `AGENCY: "on"`: 👥 Clients in the Studio menu, one Zernio profile per client |
| reports | daily/24 h/7 d/monthly to you | to you (labelled, plus one agency summary each morning) **and** to the client's own Telegram if they joined |
| inbox replies | `BRAND_VOICE` + `BUSINESS_FACTS` | each client's voice, facts and handle (`tools/client.mjs sync`) |
| dashboards | `/dashboard` | `/dashboard` = all clients; `/c/<token>` = one client's private page to share with them |

## Start
1. `node tools/client.mjs init <slug-of-the-current-brand>` (keeps what is already in profile/ and brand/), or skip it on a fresh kit.
2. Per client: `node tools/client.mjs new <slug> "Client name"` → `use <slug>` → `/setup` (choose **Set up a client**: the same
   discovery → understood → voice → design → audit → plan flow, written into that client's folder). The accounts phase
   is done once for the agency (one Zernio account, one pair of bots, one Cloudflare + GitHub); per client only their
   Instagram is connected in Zernio as its own **profile** (Zernio → Profiles → New profile → connect their Instagram).
3. Bot: `AGENCY: "on"` in `telegram-bot/wrangler.jsonc`, push. Studio bot → 👥 Clients → ➕ → pick their Zernio profile.
   The bot shows the client's number and an invite link: send the link to the client; when they press Start in the
   Publisher bot, their daily report, post reports and monthly PDF reach them too (🔕 turns that off per client).
4. `node tools/client.mjs sync <slug> --id <number>` so inbox suggestions for their comments and DMs speak in their voice
   with their facts. Run it again after any `/brand` change to their voice or prices.
5. Competitors per client: 👥 Clients → the client → competitors, or `POST /api/competitors {clientId, username}`.

## Rules
- Work on one client at a time; before a task, check `node tools/client.mjs list` shows the right ▶ active client.
- Never reuse one client's photos, captions, reviews or numbers for another, not even as an "example".
- Each client approves their own posts (who approves is in their CREATOR.md → Content); a post needs that ✅ before `/publish`.
- Monthly: `/page-audit` per client, saved in their `profile/audits/`; the monthly PDF from the bot goes with it.
- A client leaves: 👥 Clients → the client → 🗑 (removes their bot data), archive `clients/<slug>/` outside the repo.
