---
name: clean
description: Edit one of the owner's reels in the Clean style («کلین»). Use when they type /clean, ask for the clean look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /clean · Clean

**Best for:** the brand's own colours and a calm, app-like look: any business that wants reels to look like *its* brand (it reads brand/brand.json), product explainers, services, clinics, SaaS-style shops.
**Viral estimate:** 7/10 in general, 8/10 as a house style for a business page: consistent and trustworthy, less of a scroll-stopper than loud styles. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- Colours come from `brand/brand.json` (bg, ink, accent, accent2, muted, surface) through `assets/brand.js`: change the brand, the style follows. Type = the brand's `"Fa"` display face.
- Face windows: a thin rounded frame and a brand-name tag; captions are word pills, the spoken word in the accent colour.
- B-roll = rounded cards: cards that stack and slide up for a list, a product card with a gradient header, a brand circle that grows behind the name, chips that pop in, a progress track from order to delivery.
- Motion: slide in from the side and settle (power3), no bounce, every hold drifts slightly. Lots of air; one accent at a time.

Preview it any time without rendering: `node tools/style-reel/stills.mjs clean --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style clean`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/clean.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
