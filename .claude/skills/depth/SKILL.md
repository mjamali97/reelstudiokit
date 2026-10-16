---
name: depth
description: Edit one of the owner's talking-head reels in the Depth style («عمق»): the speaker stays on screen and the punch words sit BEHIND their head. Use when they type /depth, ask for words behind the head, text behind the person, or a "talking head with text" look, or pick it from /reel-style. Needs their own take (one clip or several).
---

# /depth · Words behind the head

**Best for:** a person talking to camera: the owner, a coach, a doctor, a consultant, a teacher; tips, opinions, "4 things to ask".
**Viral estimate:** 7.5/10 for talking heads: the face keeps trust, the layered words look edited by hand and hold the eye
through the plain stretches. It needs a clean, steady take; a busy background or fast head movement weakens it. A judgement
until their own posts in this style come back; `/analytics` updates it.

## The style
- Their footage fills the frame the whole time. Lead-in lines pop in front of the chest (blur → sharp in 0.2 s) as they are said.
- The punch word of each line sits **behind the head**: huge, in the room, only the lower ~30 % of its letters hidden, so it
  still reads. Numbers never go behind the head (a hidden digit changes the number): they sit above it.
- Every cut gets a short punch-in (1.06 → 1). A slow drift so no hold is ever still.
- Lines never cover the face: they sit under the chin when that fits above the caption area, otherwise in the top band.
- Brand colours from `brand/brand.json`; a grade per reel (`natural`, `warm`, `editorial`, `bright`).
- Closes on a follow card and the comment word typed in.

Preview it without rendering: `node tools/style-reel/stills.mjs depth --sheet` (add `--safe` for Instagram's unsafe areas
in red, `--grade warm` to try a grade).

## How to run it

1. **The take** (`playbook/TAKE.md` → "Several clips"): `intake.py` → pick the best take of each line in `edl.json` →
   `assemble.py` (one clean 30 fps `aroll.mp4` + `segments.json`) → `cutout.py` (the speaker cut out, `subject.webm`) →
   `headpos.py` (where the head and chin are in every segment, `headpos.js`). One clip works too: the EDL has one line per
   segment you keep.
2. **The edit:** follow `playbook/STYLE-REEL.md` with `--style depth`, with `aroll.mp4` as the face, and copy
   `subject.webm` and `headpos.js` into the reel's `assets/`. The reference is `tools/style-reel/styles/depth.js`: `place()`
   puts a word behind the head from `window.HEAD`, `front()` keeps a line off the face. Rewrite the words for the new
   content; never paste the demo text.
3. **Behind the head only** for one short word per beat; a word whose middle would hide goes in front. If `headpos.py`
   marks a segment `MOVES`, put that segment's words in front.
4. Before anything is shown: `qa.py --plan` with zero FAIL, the 3 fps eye pass (`playbook/MOTION-QA.md`) and
   `check_cuts.py` on the render (every "after" frame clean). Facts on screen come only from the source.
