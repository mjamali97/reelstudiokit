---
name: reel-style
description: Recommend which edit style fits a piece of content, with a viral estimate for each, before anything is built. Use when they type /reel-style, ask «کدوم سبک؟» or «این رو چطوری ادیت کنیم», or send new content (a product, a service, a script, a take) without naming a style.
---

# /reel-style · which edit for this content

Answer in their language, short: one recommendation, one alternative, each with a score out of 10 and one line of why,
then the commands (`/vogue`, `/swiss`, `/clean`…). Then wait for their pick. Never build first.

## Decision table (a starting point; /analytics rewrites the scores from their own posts)

| content | first choice | alternative | why |
|---|---|---|---|
| a person is the hero (the owner, the chef, the doctor, the photographer), a signature product, a transformation | `/vogue` 8 | `/luxe` 7.5 | trust and a feature-story feel |
| a premium product or service (jewellery, salon, perfume, wedding cake, fine dining) | `/luxe` 8 | `/vogue` 7.5 | slow, expensive grammar sells the price |
| a story with numbers: how the business started, a case, a myth vs fact | `/vox` 7.5 | `/swiss` 7 | evidence-board curiosity |
| prices, a list, "3 mistakes", an offer, a launch, news | `/swiss` 7.5 | `/brutal` 7.5 | one giant word per beat keeps people watching |
| a price list, "what you get for the money", an order, delivery | `/receipt` 7.5 | `/swiss` 7 | concrete items and numbers, honest |
| today's menu, a special, a lesson, a tip from the counter | `/chalk` 7.5 | `/doodle` 7 | handmade and local |
| ordering, booking, delivery tracking, an online shop's system, anything on a screen | `/hud` 6.5 | `/clean` 7 | screen grammar; only their real pages |
| a how-to, recipe, size guide, aftercare, a tip | `/doodle` 6.5 over real footage | `/chalk` 7 | explain by hand; hook hard |
| the brand's everyday look, product explainers, a service step by step | `/clean` 7.5 | `/swiss` 7 | looks like *their* brand (brand.json colours) |
| an evening crowd: café at night, bar, event, beauty | `/neon` 8 | `/pop` 7 | night contrast stops the scroll |
| warm and friendly: a bakery, a family café, kids, vintage | `/retro` 7.5 | `/pop` 7.5 | nostalgic, shareable |
| young and loud: streetwear, merch drop, app, course, Gen-Z food | `/brutal` 8 | `/pop` 7.5 | meme-native energy |
| playful: snacks, toys, games, parties, street food | `/pop` 7.5 | `/retro` 7.5 | comic energy, bursts on the beat |

All 13 can be previewed without rendering: `node tools/style-reel/stills.mjs <style> --sheet` (a row of 12 frames), or see
`docs/showcase/styles.png`.

## Signals that move the pick
- Real footage exists (the product, the place, the process) → use it inside the style; proof beats
  decoration.
- The hero is a person → `/vogue`. The hero is a number → `/vox` or `/swiss`.
- The point happens on a screen (ordering, booking) → `/hud`, only their real pages.
- Beginners need a concept explained → `/doodle`.
- Distance ladder first: if the topic is far from the viewer, no style saves it; say so.
- Their brand look matters more than variety for a business page: keep one or two styles as the house look.

## Scores
Judgement, not data, until their posts in each style come back. After each post compare skip rate, saves and shares per 1k
views (`/analytics`) and update this table with the date.
