---
name: pop
description: Edit one of the owner's reels in the Pop comic style («پاپ»). Use when they type /pop, ask for the pop comic look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /pop · Pop comic

**Best for:** playful and loud: snacks, toys, games, kids' parties, street food, fun announcements.
**Viral estimate:** 7.5/10 in general: high energy and colour, strong for kids and families; tiring if the reel is long. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Primary red #E8202A, yellow #FFD500, blue #1E5BD8, green #21A65A, halftone dots everywhere, 10 px ink outlines, Lalezar with a black stroke and offset shadow.
- Speech bubbles grow from their tail, BAM/WOW/ZIP bursts punch in on beats, panels slam into a comic grid from four sides, the page shakes on impact.
- Rays spin slowly behind big words. Keep sound effects in sync with every punch.
- Captions: bordered white word boxes, the spoken word yellow.

Preview it any time without rendering: `node tools/style-reel/stills.mjs pop --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style pop`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/pop.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
