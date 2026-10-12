---
name: retro
description: Edit one of the owner's reels in the Retro 70s style («رترو»). Use when they type /retro, ask for the retro 70s look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /retro · Retro 70s

**Best for:** warm and friendly businesses: bakeries, cafés, family restaurants, kids' products, vintage shops, ice cream.
**Viral estimate:** 7.5/10 in general: warm, nostalgic, very shareable; the busy background needs short text. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Tan paper, a slowly turning sunburst, wavy orange-mustard-teal stripes, Lalezar (OFL) with stacked cream and brown shadows; badges are starbursts.
- Palette: orange #D9541E, mustard #F2A93B, teal #3E8E7E, brown #4A2A16, cream #FFF3DC.
- B-roll = posters: words drop and bounce, cards slide in tilted, a big starburst counts, chips pop with a little rotation.
- Motion: back/bounce eases, circle-wipe transitions. Keep lines short; the background is busy.

Preview it any time without rendering: `node tools/style-reel/stills.mjs retro --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style retro`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/retro.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
