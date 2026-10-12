---
name: publish
description: Package an APPROVED reel and send it to the Studio bot: upload video, cover and gate image to Zernio as a draft, write the caption, YouTube texts, gate DM and Telegram post in their format, and create the publish card they schedule with one tap. Use when they approve a final render («تأیید», «اوکیه بفرست»), type /publish, or ask to schedule a reel.
---

# /publish

Only after they approved the final render in this conversation. Follow `playbook/PUBLISH.md`:

1. Check the package: final render (QA passed, audio measured), cover, `CAPTION.md` in their format (`playbook/CAPTION.md`),
   gate image + `dm.md`, `TELEGRAM.md` (`playbook/TELEGRAM-POST.md`). `curl` every link for 200.
2. `tools/zernio/zernio.py upload` each file, then `draft` → the Zernio DRAFT id. Never schedule or publish from here.
3. `POST $BOT_URL/api/packages` with the texts (keys from `.env`, never printed). Tell them the card is in the Studio bot
   with a suggested day; their ✅ there schedules Instagram/YouTube, arms the DM gate and queues the Telegram post for the
   Publisher bot's final ✅.
4. Batch-filmed reels: show the planned order with each outfit before they schedule; no two same-outfit reels in a row.
