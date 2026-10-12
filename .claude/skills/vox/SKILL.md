---
name: vox
description: Edit one of the creator's reels in the Vox documentary collage style (Vox). Use when they type /vox, say «با سبک Vox» or «Vox استایل», or pick this style from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /vox · Vox documentary collage

**Best for:** stories with numbers: how the business started, a case, myth vs fact, 'how X really works'.
**Viral estimate:** 7/10: strong curiosity and comments; needs a clear number or mystery to carry it. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- One archival tabletop: tan paper, ink #1A1A1A, ONE hot red #D62E1F, mustard #D9A441 for folders. The `"Fa"` face at 900 on paper strips. Halftone only on real photos.
- Face windows: their live face in black and white (`#face{filter:grayscale(1) contrast(1.22)}`; a blend layer cannot reach the video), a light dot screen and a burned edge, a taped label.
- B-roll: paper cut-outs stacking, rubber stamps slamming (scale 2 → 1 in 0.2 s), index cards pinned with brass pins and tied with red string, a camera pan across one wide board (right to left), manila folders, red stat cards counting up, newspaper headlines.
- Paper never fades in: it slides, springs (back.out), drops or is stamped. Hard cuts or a paper wipe between scenes.
- Captions: each word on its own paper strip, the spoken word turns red.
- Never generated faces or fake archive photos: only their real footage and real screenshots.

The style keeps its own palette on purpose (that is what makes it a style). The creator's brand enters through the `"Fa"`
font, `assets/brand.js`, the captions and the cover.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style vox`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/vox.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
