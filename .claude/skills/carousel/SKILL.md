---
name: carousel
description: Make an Instagram carousel (1080×1350, up to 20 slides) in the brand from one of 10 templates (tips, steps, myth-fact, before-after, price-menu, faq, comparison, testimonial, checklist, showcase), written in the brand voice with real facts, rendered to PNGs. Use when they type /carousel, ask for a carousel, a post with slides, «کروسل», «اسلاید», "Karussell", "carrousel".
---

# /carousel · slides in their brand

Read `profile/CREATOR.md`, `profile/VOICE.md`, `brand/brand.json`, their playbook and `brand/formats/` (their saved carousel
formats). Talk in their language.

1. **Pick the template** for the content (one line why): tips (numbered advice) · steps (a how-to, photos optional) ·
   myth-fact · before-after (photos) · price-menu · faq · comparison (two options) · testimonial (real reviews, with
   consent) · checklist · showcase (one product per slide). `node tools/render/render.mjs --list` shows each data shape.
2. **Write the spec** `reels/<slug>/carousel.json` in their voice: a cover that promises one clear result (≤ 8 words), one
   idea per slide, a CTA slide with their gate word and a save/share line. 5–10 slides is the sweet spot. Only facts from
   the profile or a cited source; prices exactly as in CREATOR.md. Images: their photos only, paths relative to the spec; no photo for an explanation? an `"illustration"` on the cover, a tip or the CTA (`doodle:<name>`, `peep:<word>`, CC0, recoloured) and icons from four sets (`/assets`).
3. **Render**: `node tools/render/render.mjs reels/<slug>/carousel.json`, then a contact sheet
   `tools/py tools/render/sheet.py reels/<slug>/carousel reels/<slug>/carousel-sheet.jpg` and look at every slide: text
   fits, nothing cut, the arrow on every slide but the last, RTL text aligned right with the arrow still pointing right.
4. Show the sheet; fix what they point at; re-render. Then the caption (`playbook/CAPTION.md`) and, when approved,
   `/publish` uploads the slides as one Instagram carousel DRAFT in Zernio (`playbook/PUBLISH.md` § Carousels). The
   one-tap card in the Studio bot is for reels only: they schedule the carousel in Zernio, or tell you a time in chat.
