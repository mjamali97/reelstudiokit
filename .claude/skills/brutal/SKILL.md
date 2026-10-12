---
name: brutal
description: Edit one of the owner's reels in the Neo-brutal style («بروتال»). Use when they type /brutal, ask for the neo-brutal look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /brutal · Neo-brutal

**Best for:** young, loud, internet-native pages: streetwear, online shops, apps, courses, Gen-Z food, merch drops.
**Viral estimate:** 7.5/10 in general, 8.5/10 for under-25 audiences: punchy and meme-native; can feel cheap for premium brands. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Off-white with a dot grid, 8 px black borders, 16 px hard offset shadows, flat yellow #FFE14D, pink #FF7AA8, mint #7EE0B5, lilac #B9A6FF.
- Boxes slap in at an angle and press down like buttons; stickers fly in big and land rotated.
- B-roll = UI-like boxes: a browser window card, stacked question cards, a striped progress bar that fills, a DONE sticker.
- Captions: each word is a bordered box with a hard shadow, the spoken word yellow.

Preview it any time without rendering: `node tools/style-reel/stills.mjs brutal --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style brutal`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/brutal.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
