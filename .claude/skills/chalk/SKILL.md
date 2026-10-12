---
name: chalk
description: Edit one of the owner's reels in the Chalkboard style («تخته»). Use when they type /chalk, ask for the chalkboard look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /chalk · Chalkboard

**Best for:** cafés, restaurants, bakeries, schools and tutors: anything with a 'today's special' board.
**Viral estimate:** 7/10 in general, 8/10 for menus and teaching: feels handmade and local; quieter than the loud styles. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Green slate with chalk dust and a wooden frame; letters get a real chalk texture (SVG turbulence filter) in white, yellow, pink, blue and green chalk.
- Text writes itself in reading direction (right to left for Persian, left to right for Latin); underlines, circles, a star and arrows draw by hand.
- B-roll = boards: an eraser smudge wipes to the next board, a menu with dotted price rows, a box drawn around the product.
- Captions: Lalezar on a dark slate chip, the spoken word in yellow chalk.

Preview it any time without rendering: `node tools/style-reel/stills.mjs chalk --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style chalk`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/chalk.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
