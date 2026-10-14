# The brand's formats (setup phase 6, or `/brand formats` later)
Every text and frame the studio makes in the brand's name follows a format **the owner chose**. The kit only ships
examples (a bakery in `examples/`, one per business in `playbook/business/`). Build each format with them, one at a time:
write 2–3 variants **in their voice (`profile/VOICE.md`) with their real content** (`profile/CREATOR.md`), show them,
let them pick or mix, then save it where the skills and the bot read it.

| format | the kit's example | theirs is saved in |
|---|---|---|
| Instagram caption | hook question → gate CTA → one-line description + links → save/share CTA → 5 topic hashtags | `playbook/CAPTION.md` |
| carousel | 10 templates (`node tools/render/render.mjs --list`): tips, steps, myth-fact, before-after, price-menu, faq, comparison, testimonial, checklist, showcase | `brand/formats/carousel-*.json` (their starting specs) |
| story | 10 frame templates + sticker spaces; 2–3 frames, ≤ 4 short lines each, a label chip, → as the "next" cue | `brand/formats/stories.json`, and for the bot `STORY_IDEA_KIND`, `frameHtml` in `telegram-bot/src/formats.js` |
| highlight covers | sets food / shop / service / creator × styles solid / soft / outline | `brand/formats/highlights.json` → rendered PNGs they upload once |
| reel captions (subtitles) | pill / outline / brand / word-by-word, 58 px, bottom at y 1580 | `brand/formats/captions.json` ({"style","size","bottom"}) |
| Telegram channel post | emoji + intro line, label/link pairs, 🔴 tip, 💬 #gateword, ➡️ @channel | `playbook/TELEGRAM-POST.md` and `TG_FORMAT` + `TG_EXAMPLE` in `telegram-bot/src/formats.js` |
| gate DM (comment-to-DM) | message 1: steps + link; message 2: the thing itself, alone so a long-press copies it | `playbook/CAPTION.md` → "Gate DM" |
| public reply under a gate comment | 12 short variations ("Sent! Check your DMs 🙌"…) | `REPLIES` in `telegram-bot/src/formats.js` |
| comment and DM replies (inbox assistant) | warm, ≤ 2 sentences, facts only from BUSINESS_FACTS | `profile/VOICE.md` → "With customers" + `BRAND_VOICE`, `BUSINESS_FACTS` in `wrangler.jsonc` |
| news digest | news of their field every 3 days (off by default) | `NEWS_PROMPT` in `formats.js` (copy it from `formats.base.js`), or `NEWS_CHECK_AT: "off"` |
| idea score | distance, hook, proof, reward, novelty, length | `SCORE_RULES` in `formats.js` and the table in `playbook/IDEA-TO-REEL.md` |

## How to run it
1. **Caption first** (it sets the voice for the rest): write three captions for one real product or topic of theirs, each a
   different structure, all in their voice. They pick; save the structure + the chosen caption as the example.
2. **Carousel**: pick 2–3 templates that fit their playbook (a bakery: tips, price-menu, showcase; a clinic: myth-fact,
   faq, before-after). Write the specs with their real content into `brand/formats/`, render
   (`node tools/render/render.mjs brand/formats/<spec>.json`), show the contact sheet
   (`tools/py tools/render/sheet.py <dir> <out.jpg>`). Fix what they point at, re-render.
3. **Stories and highlights**: same, with `type: story` and `type: highlights` specs. Highlight covers are uploaded once in
   the Instagram app (Profile → highlight → Edit → Edit cover).
4. **Reel captions**: burn one test with `node tools/render/captions.mjs` on any of their clips in two styles; they pick.
5. **Telegram post, gate DM, replies**: write them in `formats.js` (the bot: only what differs from the defaults in
   `formats.base.js`, which kit updates replace) and the playbook files; render one story frame
   with their `frameHtml`; run `bash telegram-bot/test/all.sh` after editing `formats.js`.
6. Read each saved format back in one line and tick it in `profile/SETUP-STATUS.md`.

**Examples by business** (only to start the conversation, never to copy): a bakery's caption = the product's name and one
sensory line → price/order line → "comment MENU and we'll send it" → address/hours → hashtags of the city and the product;
its Telegram post = photo + name + price + how to order; its story = today's batch + a poll. A clinic's caption = the
question patients ask → the short answer → "comment GUIDE for the full sheet" → booking line; no before/after photos without
written consent and the rules of their country.
