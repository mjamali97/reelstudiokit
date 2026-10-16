# Publish · after the creator approved the final render

Nothing before their approval. Nothing goes live without their ✅ on the bot card. Everything uploaded is a DRAFT.

## 1 · Package the reel
Ready in `reels/<slug>/`: the final render (audio pass done, QA passed), a YouTube cut if different, the cover, `CAPTION.md`
(Instagram caption + YouTube title/description), `gate/` (gate image + `dm.md`), `TELEGRAM.md` (the channel post).

## 2 · Upload to Zernio as a draft
```bash
tools/py -I tools/zernio/zernio.py upload reels/<slug>/final.mp4          # → video URL
tools/py -I tools/zernio/zernio.py upload reels/<slug>/cover/cover.jpg     # → cover URL
tools/py -I tools/zernio/zernio.py upload reels/<slug>/gate/gate.jpg       # → DM image URL (optional)
tools/py -I tools/zernio/zernio.py draft --video <video URL> --caption reels/<slug>/CAPTION.ig.txt --cover <cover URL> \
  [--yt-video <yt URL> --yt-title "…" --yt-desc reels/<slug>/CAPTION.yt.txt]   # → DRAFT post id
```
Limits: Instagram reels ≤ 90 s / 300 MB via the API; ~25 posts per hour per account.

## 3 · Send the publish card to the Studio bot
```bash
curl -s -X POST "$BOT_URL/api/packages" -H "X-Api-Key: $INGEST_KEY" -H "content-type: application/json" -d @package.json
```
`package.json`: `{slug, title, zernio_post_id, video_url, yt_url?, cover_url?, ig_caption, yt_title?, yt_desc?, gate?, dm?,
dm_media?, comment_reply?, telegram?}` (read `BOT_URL`/`INGEST_KEY` from `.env`; never echo them). The card arrives with
the cover, a suggested day (next free `REEL_DAYS` slot, never two Instagram posts on one day), 🧪 trial (shown to
non-followers first) and 🎵 audio-name toggles, 👀/✏️ for every text.

One ✅ on the card: Zernio schedules Instagram (+ YouTube), arms the comment-to-DM automation for the gate word (no
follow-gate, rotating public replies), and sends the Telegram post to the Publisher bot for its own final ✅ at the same
time. ↩️ cancels everything (Zernio back to draft, automation deleted). If the creator asks in chat for a specific time:
`POST /api/packages/<id>/schedule {"at": "<UTC ISO>"}`.

## 3b · Carousels
After they approved the contact sheet and the caption. Zernio makes an Instagram carousel from one post with several
image `mediaItems` (2–10 slides, JPEG/PNG ≤ 8 MB each, every slide the shape of the first; the kit's 1080×1350 slides fit).
```bash
for f in reels/<slug>/carousel/slide-*.png; do tools/py -I tools/zernio/zernio.py upload "$f"; done   # → one URL per slide
tools/py -I tools/zernio/zernio.py draft --images <url1> <url2> … --caption reels/<slug>/CAPTION.ig.txt   # → DRAFT post id
```
The Studio bot's one-tap card (step 3) is for reels only, so a carousel is scheduled by hand: the owner schedules the draft in the
Zernio dashboard, or names a time in chat and you run
`tools/py -I tools/zernio/zernio.py schedule <post id> <UTC ISO>`. Check 📅 Schedule in the bot first: never two Instagram
posts on one day. The comment-to-DM gate is set up in Zernio for a carousel, or left out.

## 4 · Order of the grid
- Batch-filmed reels in the same outfit never go out back to back: tag each take's outfit, interleave with other days'
  reels and carousels, and show the planned order with the outfits before scheduling.
- Two or three reels a week on their best days beats a burst followed by silence.

## 5 · After posting
Day 1 and day 7: `/analytics`. Note what the reel taught in `profile/HOOKS.md`.
