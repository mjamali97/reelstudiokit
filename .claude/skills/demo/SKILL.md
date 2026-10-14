---
name: demo
description: Show what the studio does before any account exists - the Telegram bots running locally with fake Telegram, Instagram and Gemini in a browser viewer, plus the example carousels, stories, highlight covers and video styles in the kit's bakery brand. Use when they type /demo, ask "what does this do?", «دمو», «نشونم بده», or pick "Try the demo first" in /setup.
---

# /demo · try it without accounts

1. **The bots** (needs node ≥ 20): `bash telegram-bot/demo/demo.sh <lang>` (en fa ar tr de fr it). It opens
   `http://127.0.0.1:8790/viewer`: three panes (Studio bot, Publisher bot, the channel). Suggest a path: press 📝 Drafts →
   ✅ on the autumn menu post → the final ✅ in the Publisher pane → it appears in the channel; 📊 Dashboard; the comment card
   in 💬 Inbox with its suggested reply; send any link to get an idea card, then 🧠 Research & score. Answers from "Gemini"
   are canned in the demo; in the real bot they are written from the page. Stop with Ctrl-C (their own `.dev.vars` is restored).
2. **The visuals**: open the contact sheets in `examples/bakery/` (carousels: 10 templates in English + one in Persian; stories;
   highlight covers in three styles) or render one again: `node tools/render/render.mjs examples/bakery/carousels/tips.json`.
   `node tools/brand/preview.mjs` shows the bakery brand on every kind of frame; `fonts/gallery.html` shows every font
   in the library (`fonts/fonts.json`).
3. **The video styles**: `docs/showcase/` has a still of each style; `/reel-style` explains when each one fits.
4. Then ask whether to start `/setup` (it begins by reading their own site and page, no accounts needed).
