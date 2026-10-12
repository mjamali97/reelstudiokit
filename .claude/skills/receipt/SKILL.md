---
name: receipt
description: Edit one of the owner's reels in the Receipt printer style («رسید»). Use when they type /receipt, ask for the receipt printer look, or pick it from /reel-style. Builds a 9:16 HyperFrames motion edit on their own take and SRT, mostly full-screen b-roll with their face only in short windows.
---

# /receipt · Receipt printer

**Best for:** concrete, money-and-value content: shops, takeaways, delivery, price lists, 'what you get for €10'.
**Viral estimate:** 7/10 in general: very readable and honest; works best when there are real prices or items to list. A judgement until their own posts in this style come back; `/analytics` updates it.

## The style
- A thermal printer slot at the top; the paper feeds out in steps with a printer jitter; zig-zag torn edge; dotted leaders; a barcode; red rubber stamps.
- Mono type for items and numbers, the brand's `"Fa"` face for Persian lines, ink #151515 on #FAF8F2.
- B-roll = receipts: a checklist that ticks itself, an item list with prices, an ORDER # slip with a PAID stamp; each receipt is torn off upward to end the scene.
- Only real prices and items from the owner's facts table on a receipt; never invent a price.

Preview it any time without rendering: `node tools/style-reel/stills.mjs receipt --sheet`.

## How to run it

Follow `playbook/STYLE-REEL.md` end to end with `--style receipt`. The reference implementation of every scene type in this
style is `tools/style-reel/styles/receipt.js` (scene ids B1–B6 are the same in every style; the template's demo is the worked
example). Rewrite the scenes for the new content in this style's grammar; never paste the demo text.

Before anything is shown: `qa.py --plan` with zero FAIL and the 3 fps sheet eye pass (`playbook/MOTION-QA.md`). Facts on
screen come only from the source (the owner's facts table, their own pages, a cited source).
