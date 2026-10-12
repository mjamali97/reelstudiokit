---
name: vogue
description: Edit one of the creator's reels in the Vogue editorial style (ووگ). Use when they type /vogue, say «با سبک ووگ» or «ووگ استایل», or pick this style from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /vogue · Vogue editorial

**Best for:** a person is the hero (the owner, the chef, the photographer, the doctor), a signature product, a transformation, a premium launch.
**Viral estimate:** 6.5/10 in general, 8/10 when a person or a signature product is the hero: high trust and saves, slower pacing than Reels rewards. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Cream paper (`assets/paper-cream.jpg`), ink #121212, ONE red #B3122E. Bodoni Moda for Latin mastheads and numerals, Markazi Text for every Persian line. No other colour.
- Face windows: a live cover (masthead from `assets/brand.js` over their background, an issue line), then a cream page frame. Never a still photo of them while they talk.
- B-roll = magazine pages: line art drawn on their words, chapters with Roman numerals, a contents index, a feature spread, a cover whose masthead becomes the name.
- Motion: pages slide in from the left (reading order) or turn on their right spine; never rotate past 85° (the page swings toward the camera). Hide a page once it has turned. Text is revealed from the right with a clip, never faded letter by letter. Every hold drifts (paper scale 1 → 1.05).
- Captions: Markazi 700, 62 px, cream with a red block on the spoken word.
- Bodoni Moda lacks some punctuation: wrap hyphens in Markazi (`.vg-hy`).

The style keeps its own palette on purpose (that is what makes it a style). The creator's brand enters through the `"Fa"`
font, `assets/brand.js`, the captions and the cover.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style vogue`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/vogue.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
