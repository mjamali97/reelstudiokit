# Security

## Reporting a vulnerability
Please do **not** open a public issue. Use GitHub's private reporting: **Security → Report a vulnerability** on
github.com/mjamali97/reelstudiokit. Include what you found, how to reproduce it, and what could be affected. You will get an
answer within a week.

## What is in scope
- the Telegram bots (`telegram-bot/`): webhook and API authentication, the owner check, the agency client isolation
  (one client must never see another's data), the Zernio webhook signature check, the private dashboard links;
- the update script (`tools/update.sh`) and anything that runs on a user's machine;
- anything that could leak a key, a token or a user's data.

## How the kit handles secrets
- Keys live in `.env` (git-ignored) and in GitHub / Cloudflare secrets. The skills never ask for a key in the chat and never
  print one; Claude never types credentials into a web page.
- Every bot endpoint checks a secret: Telegram webhooks (`X-Telegram-Bot-Api-Secret-Token`), the API (`X-Api-Key`), Zernio
  webhooks (HMAC-SHA256 signature + a token in the URL), dashboards (a derived token).
- Only `OWNER_ID` is answered by the Studio bot; agency clients reach only their own reports through the Publisher bot.
- Uploads are drafts and nothing is published without the owner's ✅.
