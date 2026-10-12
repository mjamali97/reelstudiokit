---
name: story
description: Make Instagram stories (1080×1920) and highlight covers in the brand: 11 frame templates (special, poll, question, offer, new-arrival, tip, review, behind, event, link, location with a map) with space left for the sticker, plus highlight cover sets (food, shop, service, creator) in three styles. Use when they type /story or /highlights, ask for stories, «استوری», «کاور هایلایت», "story", "highlight covers".
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
4. `location`: give the address (or lat/lon); the map is drawn in the brand colours from OpenStreetMap data with the credit on it.
   `tip` and `question` frames take `"illustration": "doodle:<name>"` or `"peep:<word>"` (CC0, see `/assets`).
5. Stories are posted from the phone (stickers only exist in the app); the bot's daily story idea can also produce them.

## Highlight covers
`{"type":"highlights","set":"food|shop|service|creator","style":"solid|soft|outline"}` or `"items":[{"icon":"<lucide name>","label":"…"}]`
(icons: plain Lucide names, or `tabler:`, `phosphor:`, `hero:` refs; `node tools/render/icons.mjs <word>` finds them). Render all three styles, show them side by side, they pick one; they upload each cover once
(Profile → the highlight → Edit highlight → Edit cover). Keep the icon in the middle 60 %; Instagram crops to a circle.
