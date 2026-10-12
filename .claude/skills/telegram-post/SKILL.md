---
name: telegram-post
description: Write a post or a story series for the creator's Telegram channel or Instagram stories in THEIR format, check every link, and send it to the Studio bot as a draft for approval. Use when they type /telegram-post, ask for a channel post, a story, a news digest, or «پست تلگرام بنویس».
---

# /telegram-post

Format: `playbook/TELEGRAM-POST.md` (theirs after /setup; the same rules live in `telegram-bot/src/formats.js`, defaults in `formats.base.js`). Voice:
`profile/VOICE.md`. Facts only from the source, each link opened (`curl -sL -o /dev/null -w '%{http_code}'`).

Send it as a draft, never to the channel directly:
```bash
curl -s -X POST "$BOT_URL/api/drafts" -H "X-Api-Key: $INGEST_KEY" -H "content-type: application/json" \
  -d '{"kind":"telegram","title":"…","body":"…","media_url":"https://… (optional)","scheduled_for":"<UTC ISO, optional>"}'
```
`kind`: `telegram` | `news` | `story` (no sticker: auto-posted to Instagram after approval) | `story_manual` (link, poll or
question sticker: they post it by hand). Story bodies are `استوری ۱:\n…\n\nاستوری ۲:\n…` with an optional last line
`🔗 استیکر لینک: …` / `📊 نظرسنجی: a / b` / `❓ باکس سؤال: …`. They approve in the Studio bot; Telegram posts get a second,
final ✅ in the Publisher bot.
