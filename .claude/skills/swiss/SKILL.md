---
name: swiss
description: Edit one of the creator's reels in the Swiss kinetic typography style (سوییس). Use when they type /swiss, say «با سبک سوییس» or «سوییس استایل», or pick this style from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /swiss · Swiss kinetic typography

**Best for:** fast news, comparisons, lists, 'stop doing X' hooks, prices and offers; anything where the words themselves are the show.
**Viral estimate:** 7.5/10: the highest retention potential of the type styles (a new giant word every beat); lower trust, so pair it with a real proof shot when there is one. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Klein blue #002FA7, white, black. A 90 px grid. The `"Fa"` face at 900 for giant words; mono for code/names.
- Face windows: their live face full frame inside a 30 px blue border, captions white with a white block on the spoken word.
- B-roll: one giant word per beat, fitted to the width (font size from the character count, never touching the edge), colour fields that invert on beats, one geometric shape morphing (circle → square → triangle → diamond) through a list, hard cuts on their words, mono names scrolling for counts.
- Slam = scale 1.18 → 1 in 0.18 s, power4.out, no bounce. Cuts land on the word or 2 frames before.

The style keeps its own palette on purpose (that is what makes it a style). The creator's brand enters through the `"Fa"`
font, `assets/brand.js`, the captions and the cover.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style swiss`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/swiss.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
