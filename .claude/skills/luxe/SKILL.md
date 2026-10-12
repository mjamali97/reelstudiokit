---
name: luxe
description: Edit one of the owner's reels in the Luxe black and gold style («لوکس»). Use when they type /luxe, ask for the luxe black and gold look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /luxe · Luxe black and gold

**Best for:** premium: jewellery, salons, fine dining, perfume, wedding cakes, high-end services.
**Viral estimate:** 6.5/10 in general, 8/10 for premium brands: trust and desire over speed; slow pacing loses some scrollers. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Black with a warm centre glow, champagne gold gradient that a light sweeps across, Markazi for Persian, Bodoni Moda for Latin (italic for names and numerals).
- Hairline gold rules draw themselves; a thin double frame in face windows.
- B-roll = slow reveals: masks lift from below with a little blur clearing, Roman numerals for chapters, a framed panel with a line-drawn diamond, a scrolling italic list.
- Motion: slow (0.8–1 s), power2/3, dissolves between scenes. Never bounce, never shake, never more than one thing moving.

Preview it any time without rendering: `node tools/style-reel/stills.mjs luxe --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style luxe`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/luxe.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
