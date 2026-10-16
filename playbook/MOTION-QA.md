# Motion QA · before ANY motion video is shown

Every rule below is a real defect that a render once shipped with. Run all of it, every time.

## 1 · Before building: a timed storyboard
- Every beat is either **face** or **full-screen b-roll**. Nothing in between: the face in a small window beside a graphic
  is not b-roll. (Defect: in eight styles the face was on screen 85–100 % of the time.)
- Face only on the hook and short returns. **B-roll at least 60 % of the time.** The face plan goes in `qa/plan.json`
  and `qa.py` checks the render against it.
- **No still photo of the face while their voice plays.** Lips must move with the sound.
- Every b-roll scene has one main motion that runs from its start to its end. Not a slide that gains an item now and then.
  (Defect: a contents page stood still for 7 s.)

## 2 · While building
- **Instagram safe zone on every reel** (1080×1920):
  - top to y 250 belongs to the Reels header; labels and chips sit just under it, around y 270;
  - from y 1580 down belongs to Instagram's name and caption: no key text or number there;
  - the button rail: x > 940 and y > 1100: no text there;
  - face captions: y 1450–1580, x 140–940, centred exactly on x 540, one line, 50–62 px, under the chin, not on the face.
  - `qa.py --sheet` outlines these zones in red; the eye pass must catch any text inside them.
- **Frame 0 has content.** No white flash, no fade from an empty frame.
- **Transitions overlap.** The next scene arrives before the previous one leaves; never "hide, then show".
  (Defects: empty frames at 14.8–15.2 s, a dead frame at 14.9 s, an empty terminal at 15.2 s.)
- **Check 3D perspective with a still mid-move before rendering.** A page turn grew giant instead of turning.
- **Minimum text sizes for a phone:** main Persian text ≥ 56 px, subtitles ≥ 40 px, mono ≥ 34 px.
- **Multi-line titles get `text-wrap: balance`** so no single word is left alone on the last line.
- **Text stays in the frame.** A title wider than the frame gets its size from the width, never touches the edge.
- **A moving element never lands on text.** Compute its landing spot from the text box.
- **Darken the face for a moment only.** If a beat needs the face dark for seconds, it should be b-roll.
- **No scene enters empty.** A stat number is on screen from the scene's start and counts up to land on its word; the
  `hit` sound plays at that moment.
- **Stickers never share a row.** One sticker per row, first one highest, all above y 1580.
- **A kicker label has a solid background.** A translucent label on a white website capture cannot be read.
- **The number on screen equals the number in the b-roll.** If the creator says "tens of thousands", show a round
  number (50K+), not one that disagrees with the screen recording.
- **Captions are always one line.** Chunks of at most ~19 visible characters, centred in a flex container;
  `white-space: nowrap` must not be overridden by `text-wrap: balance`.
- **A card's number arrives with its word**, never waits on screen as "0K".
- **Counters count up, never down** (check in the sheet): use the counter's own `countFrom`, not a beat index.
- **A long card or scene never stands still** (qa: frozen ≥ 1 s): it floats slowly.
- **Zoom a PDF page onto its text.** Half the frame must not be the blank bottom of the page.
- **The Latin font must have every glyph you use** (a hyphen was missing in a display face). One big still of the exact
  text before using it.
- **Burned-in subtitles use the brand font for real:** embed the font as a data URL (or serve the page from a file URL),
  `document.fonts.load(...)`, and fail the render if `document.fonts.check` is false. A page built with `setContent` silently
  ignores `file://` fonts and falls back. Look at one rendered frame and confirm the letterforms.

- **Seek-safe timelines** (the renderer jumps to any frame; the browser preview plays forward and hides these):
  - `fromTo` placed later in the timeline gets `immediateRender: false`, or its start state shows from frame 0.
  - State changes are `tl.set`, never `tl.call` (a call does not replay when the renderer seeks backwards).
  - No `Date()`, `Math.random()` without a seed, or timers: the renderer's clock is not the wall clock.
  - Hide with `opacity`, not `visibility` (a later `visibility: visible` override shows elements outside their scene).
  - A change on a cut lands 2 ms before the cut frame (`cut - .002`), or it shows one frame late.
  - Never end a line of code with a `//` comment and then join lines: the comment swallows the code after it.
- **Layer order with a cutout:** footage → shade/vignette → words behind → `#subject` (the cutout) → front words →
  captions. A shade under the cutout leaves the speaker brighter than the room. A VP9 alpha webm decodes with alpha only
  through `-c:v libvpx-vp9` in ffmpeg; the default decoder drops it silently.
- **Words behind a head never hide a number or the middle of a word**: only the lower ~30 % of the letters, and numbers
  sit above the head. Check every behind-the-head word in a still on the real footage, not the demo silhouette.
- `stills.mjs <style> --safe` paints the unsafe areas red over any frame: the fastest check while building.

## 3 · After the render, before showing (every time, all of it)
1. `qa.py <video> --plan qa/plan.json --sheet qa/sheet.jpg`: zero FAIL. Face matches the plan, no freeze ≥ 1 s, no dead
   frame, frame 0 has content.
2. **The 3 fps sheet eye pass, cell by cell:** hook from frame one? a dead or half-empty frame? anything on text or face?
   readable on a phone? a lone word on a line? anything cut by the frame edge? anything in the red zones?
3. Do not stop at a few stills: the defects of a round were all between those moments.
4. Audio: `tools/take/audio.sh measure` (about −14 LUFS, true peak ≤ −1 dBFS), effects land on the motion frame.
