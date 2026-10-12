---
name: story
description: Make Instagram stories (1080×1920) and highlight covers in the brand: 10 frame templates (special, poll, question, offer, new-arrival, tip, review, behind, event, link) with space left for the sticker, plus highlight cover sets (food, shop, service, creator) in three styles. Use when they type /story or /highlights, ask for stories, «استوری», «کاور هایلایت», "story", "highlight covers".
---

# /story · stories and highlight covers

Read `profile/CREATOR.md`, `profile/VOICE.md`, `brand/brand.json`, `brand/formats/stories.json` if they saved one.

## Stories
1. Decide the sequence (2–4 frames): what happens today, the one action (poll, question, link to order, reminder). Use
   `node tools/render/render.mjs --list` for each template's data.
2. Write `reels/stories-<date>.json` (`{"type":"story","lang":…,"frames":[{"template":"special",…},…]}`): ≤ 4 short lines per
   frame, in their voice, real prices and dates only. Frames that need a sticker get a `sticker` label: the grey dashed box
   marks where they place it in the Instagram app.
3. Render, look at every frame (text inside y 250–1600, the sticker box free), show them, fix, re-render.
4. Stories are posted from the phone (stickers only exist in the app); the bot's daily story idea can also produce them.

## Highlight covers
`{"type":"highlights","set":"food|shop|service|creator","style":"solid|soft|outline"}` or `"items":[{"icon":"<lucide name>","label":"…"}]`
(icons: lucide.dev). Render all three styles, show them side by side, they pick one; they upload each cover once
(Profile → the highlight → Edit highlight → Edit cover). Keep the icon in the middle 60 %; Instagram crops to a circle.
