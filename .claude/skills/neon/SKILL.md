---
name: neon
description: Edit one of the owner's reels in the Neon night style («نئون»). Use when they type /neon, ask for the neon night look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /neon · Neon night

**Best for:** an evening crowd: cafés, bars, late-night food, beauty salons, events, music.
**Viral estimate:** 7/10 in general, 8/10 for night-time businesses: very high contrast stops the thumb; dark frames can feel heavy for daytime products. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Dark brick wall, glass tubes in pink #FF2E88, cyan #19E6FF, warm yellow #FFD84D, violet #A66BFF.
- Words strike on like real tubes (two short flickers) when said and stay faintly visible as unlit glass afterwards: the whole board is readable from the first frame.
- B-roll = signs: a sign per question in a tube box, an OPEN-style shop sign with the rating, flavour tags lighting one by one, a wire that draws from order to delivery.
- Motion is light, not movement: flicker, buzz, glow. Cuts are hard. Every state is a timeline set, so any frame renders exactly.

Preview it any time without rendering: `node tools/style-reel/stills.mjs neon --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style neon`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/neon.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
