# Business reel · the runbook (any page that sells something or serves people)

**Trigger:** every reel idea about the page's own product, service, place, people or customers. `/reel-idea` routes here.
**First read the page's type file** in `playbook/business/` (named in `profile/CREATOR.md` → "Business playbook"):
20 types, listed in `business/INDEX.md`. If their
kind of business has no file, `/setup` (or you, the first time it is needed) writes one from `business/_TEMPLATE.md`
together with the owner, then uses it.

## 1 · Facts first
- From the owner, into `reels/<slug>/SCRIPT.md` → facts table: the real name, price (with the date), sizes/variants,
  ingredients or materials, how long it keeps / how long it takes, delivery area, hours, how to order or book, stock
  limits, an offer's real end date.
- Anything a customer could hold them to (price, "fresh every day", "natural", "original", results of a treatment) must
  be true and current. Health, medical, legal and financial claims: only what they can document and are licensed to say;
  when unsure, leave it out.
- Customers on camera or in screenshots only with their consent (names blurred otherwise). Never invented reviews, never
  stock photos or AI images presented as their product or place.

## 2 · Pick the angle (distance ladder, `IDEA-TO-REEL.md`)
The type file lists the angles that travel for that business. The general ones:
| angle | why it works |
|---|---|
| result on frame one (the finished dish, the edited photo, the outfit on a person) | the payoff earns the next 3 s |
| process (hands making it, before → after) | satisfying, rewatched, saved |
| the question customers ask most | answers a real need, gets shared |
| mistakes / a counted list («۳ تا اشتباهی که…») | retention through the count |
| price transparency («با این مبلغ چی می‌گیری») | trust and saves |
| the people (the owner, the team, one honest line) | trust; a face is still the best hook |
| the offer (a season, a limited batch, an event) | urgency, only if true |

## 3 · Gate (what commenting the word gets them)
The menu or price list, a booking or order link, a recipe or a care guide, a size guide, a checklist, a discount code
with a real end date, a free consultation slot. Worth the comment and true. DM in their voice (`CAPTION.md` → Gate DM).

## 4 · B-roll bank
Real footage beats graphics. Once a week the owner films the type file's shot list: 3–5 s vertical clips, good light,
one clear motion each. Keep them in `reels/_bank/<date>/` with a line per clip in `reels/_bank/INDEX.md` (what, where,
outfit). Edits pull from the bank; the five styles carry the words and numbers (price card, LIST-N for steps, NAME for
the product). Screens of their own site, menu page or booking page: `tools/capture/webcap.mjs`.

## 5 · Then
`TAKE.md` → `STYLE-REEL.md` → `MOTION-QA.md` → approval → `CAPTION.md`, `COVER-AND-GATE.md`, `PUBLISH.md`.
