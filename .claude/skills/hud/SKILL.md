---
name: hud
description: Edit one of the creator's reels in the HUD / terminal style (HUD). Use when they type /hud, say «با سبک HUD» or «HUD استایل», or pick this style from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /hud · HUD / terminal

**Best for:** anything that happens on a screen: ordering and booking flows, an online shop's system, delivery tracking, apps, dashboards.
**Viral estimate:** 6.5/10: feels modern and precise, colder for a general audience; never let it read as a fake screen. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Living blue field #3D40FE → #2A2DE0 with a drifting light spot, white, navy #0A0B3D terminals, ice #C9CAFF, green #28C840 for success. Mono for commands, the `"Fa"` face for Persian.
- A HUD frame for the whole film: corner brackets, `<BRAND> · REEL · <year>` (from `assets/brand.js`), a blinking REC with a running timecode, a progress bar.
- B-roll: terminals/screens typing ONLY real steps and texts (their real order page, their real menu), widgets that never stop moving (radar sweep, slot reels showing «?» instead of invented prices, a wireframe cube, a target), a loading list with bars, a node graph with packets, chromatic-split title slams.
- Typing is a stepped clip reveal on Latin only; Persian lines arrive whole. Glitch cuts (0.3 s clip + 3-step jitter) between scenes.
- A loaded or finished state still moves (scan bar, push-in).

The style keeps its own palette on purpose (that is what makes it a style). The creator's brand enters through the `"Fa"`
font, `assets/brand.js`, the captions and the cover.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style hud`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/hud.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
