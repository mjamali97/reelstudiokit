# Telegram channel post and stories · THEIR formats

> /setup replaces these examples with the creator's own (step 4b) and mirrors them in `telegram-bot/src/formats.js`
> (`TG_FORMAT`, `TG_EXAMPLE`, `STORY_RULES`, `frameHtml`) so the bot writes the same way. Keep the two in sync.

## Channel setup
- Name `<brand> | <what they get here>`; description ≤ 255 characters; pinned post: what lives here, how to find a reel's
  files (search the gate word with #), where to ask.
- Every reel with a gate gets a channel post; the Instagram gate image carries a small "files are in my Telegram"
  strip and the DM links the channel.

## Post format (example)
```
[topic emoji] [one intro line, with a number if it has one]:

[label for link 1, number in brackets]:
[link 1]

[label for link 2]:
[link 2]

🔴 نکته: [one useful tip or an honest warning]

💬 #[gate word]

➡️ @[channel]
```
- Persian: every line starts with a Persian word (Telegram takes the line direction from its first letter); links have
  their own line; a blank line between label/link pairs.
- Emoji only in those four places. Files go as Document with this text as the caption (≤ 1024 characters).

Business example (bakery): photo of today's batch → `[name] · [price]` → `[how to order / link]` → `🔴 [keeps 3 days in
the fridge]` → `💬 #[gate]` → `➡️ @[channel]`.

## Stories (example rules)
- 2–3 frames, ≤ 4 short lines each, one fact per line, the same headline height on every frame of a series.
- `→` is the only "next" cue; no separate cover; the last frame leaves room for the sticker (link/poll/question).
- Persian: «درصد» not ٪, lines start with a Persian word or a number.
- A series from a source (a thread, an announcement): one frame per item of the source, every item included, the source
  credited; name only what the source names.
- The story frame design is `frameHtml` (default in `telegram-bot/src/formats.base.js`; yours, if any, in `formats.js`) (their brand colours via `STORY_*` vars).
- Ideas for stories the creator rejects go to `profile/RULES.md` (e.g. some creators do not want behind-the-scenes or
  reel reshares; a bakery may live on them).
