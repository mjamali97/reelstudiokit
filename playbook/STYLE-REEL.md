# Styled motion reel · the runbook

**Trigger:** any of the 13 style skills, `/vogue` `/vox` `/swiss` `/hud` `/doodle` `/clean` `/neon` `/retro` `/brutal` `/luxe`
`/pop` `/chalk` `/receipt` (or «با سبک ووگ ادیت کن»), or `/reel-style` to pick one first.
**Template:** `tools/style-reel/` (HyperFrames engine shell, one style module per style in `styles/`, `qa.py`, fonts, icons,
sfx, `new_reel.py`).
**Worked example:** the demo in the template (a made-up bakery, every scene type in every style). Rewrite
the scenes for each new reel; never paste the demo text.
**Sibling:** `BUSINESS-REEL.md` + their `business/<file>` are the source for facts, gates and footage. This
runbook only builds the look.

## 0 · Pick the style (unless they named one)
`/reel-style`: one recommendation and one alternative, each with its score and why, before anything is built.

## 1 · Facts and script
As in `BUSINESS-REEL.md`: verify, write `reels/<slug>/SCRIPT.md`. Every number, name and claim on screen comes from the
source. A style is a look, never a reason to invent a figure.

## 2 · Their take → a cut take and SRT
`TAKE.md`: silence cuts, the SRT retimed to the cut file (`face-cut.mp4`), audio measured.

## 3 · Start the project
```bash
tools/.venv/bin/python tools/style-reel/new_reel.py --take reels/<slug>/take/face-cut.mp4 --srt reels/<slug>/take/face-cut.srt \
  --out reels/<slug>/motion --dur <seconds> --style <style> [--lang fa]
```
It copies the template, cuts `assets/face.mp4`, force-aligns their SRT words (WhisperX aligner only, no ASR, no API),
proofreads common Persian fixes and prints the word table. Then proofread `assets/words.js` by hand: compounds with a
half-space (`قیمت گذاری` → `قیمت‌گذاری`), brand names, Latin words (`playbook/PERSIAN.md`).

## 4 · Beats (write `BEATS.md` before any code)
- Every beat is either **FACE** (their live face, full frame) or **B-ROLL** (full screen, no face). **B-roll ≥ 60 % of the
  time.** Face on the hook (0 to ~2 s) and short returns (1.5–2.5 s) between b-roll runs. A face in a small window next to a
  graphic is not b-roll.
- A new picture every 1.5–2.5 s. Each b-roll scene lands on the word it shows.
- Scene types (same ids in every `styles/<style>.js`):

| type | when they say… | demo id |
|---|---|---|
| BEFORE → THIS | "before you order/buy X… see this" | B1 |
| LIST-N | a list (questions, steps, features), one panel per item on its word | B2 |
| CARD | the product/place with a counted stat (reviews, kilos, orders) | B3 |
| NAME | the name | B4 |
| GRID-N | "13 flavours…": N items landing on ticks, a counter | B5 |
| CHAIN | A → B (one thing feeds the next) | B6 |

Write the table: beat, start–end, words, FACE/B-ROLL, scene type, on-screen text. For a product page add real footage
scenes (the product, the place, the hands making it) as full-screen video clips inside a scene; real footage beats drawn
graphics whenever it exists.

## 5 · Build
- `index.html`: set `T` (word times from step 3), `FACE` (the face windows) and the cues: `whoosh-in` at each b-roll entry
  (start = t − 0.195), `whoosh-out` at each return to face (t − 0.45), `pop` per list item, `hit` on the name, `tick` per
  grid item. Every `<audio>` has an id. Set `data-duration` on the root and the video to the reel length.
- `styles/<style>.js`: rewrite the scenes for this content following that style's skill (grammar, palette, fonts, caption
  look). Keep the shared helpers (`IN`, `OUT`, `reveal`, `type`, `draw`, `count`, `scene`, `drift`).
- Captions are automatic in the face windows (`S.cap`): 50–62 px in the band y 1450–1580, x 140–940, centred on x 540,
  one line: below the chin, above Instagram's caption area, clear of the button rail. Labels and chips go just under the
  header (y ≈ 270), never on the face. B-roll scenes carry the key words themselves.
- Follow `MOTION-QA.md` §2 while building.

## 6 · Check, render, QA (every time, before they see anything)
```bash
cd reels/<slug>/motion
npx --yes hyperframes@0.8.46 check
npx --yes hyperframes@0.8.46 snapshot --at <mid-transition times> --no-end --describe false
npx --yes hyperframes@0.8.46 render --variables '{"style":"<style>"}' --strict-variables -o renders/<slug>-<style>.mp4
echo '{"face": [[0, 2.07], ...]}' > qa/plan.json          # the FACE windows
../../../tools/.venv/bin/python qa.py renders/<slug>-<style>.mp4 --plan qa/plan.json --sheet qa/<style>-sheet.jpg
bash ../../../tools/take/audio.sh measure renders/<slug>-<style>.mp4
```
Zero FAIL, then the 3 fps sheet eye pass with the `MOTION-QA.md` checklist. Known traps: a `mix-blend-mode` layer cannot
reach the video (filter the video itself); pages that turned or slid away must be hidden afterwards; two panels in one
swipe share start, duration and ease. The HyperFrames version is pinned (0.8.46); upgrade deliberately, then re-check.

## 7 · Deliver
The render, the SRT, the cover, the gate (`COVER-AND-GATE.md`). Delete superseded renders so the wrong one cannot be
posted. Then their approval, then `/publish`.
