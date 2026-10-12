---
name: doodle
description: Edit one of the creator's reels in the Hand-drawn doodle style (دودل). Use when they type /doodle, say «با سبک دودل» or «دودل استایل», or pick this style from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /doodle · Hand-drawn doodle

**Best for:** recipes, how-tos, size guides, aftercare, tips, friendly explainers.
**Viral estimate:** 6/10: likeable and clear, lower energy; best over real footage or a live screen recording. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Off-white paper, ink #1A1A1A, ONE orange marker #FF5A1F, yellow sticky notes #FFE58A. The `"Fa"` face at 900, slightly rotated (−2° to −4°).
- Face windows: their live face with doodles on top (a circle round the head on the hook, question marks, a tick, a star), drawn on their words.
- B-roll: line drawings that draw themselves (pathLength 1 dash), a big one per list item, a doodled browser window, sticky notes, hand-drawn arrows.
- Every line boils on twos: three jittered versions, one visible per 2-frame step (`boil` in the reference). Marker highlights sweep from the right under key words.
- Two panels in one swipe share start, duration and ease (they move as one strip, never overlap).

The style keeps its own palette on purpose (that is what makes it a style). The creator's brand enters through the `"Fa"`
font, `assets/brand.js`, the captions and the cover.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style doodle`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/doodle.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
