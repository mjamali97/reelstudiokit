---
name: page-audit
description: Full audit of the owner's Instagram page with a prioritised action plan: profile (name, bio, link, highlights, photo), grid, content mix, hooks, retention, saves/shares, audience vs target customer, posting days and times, conversion path (DMs, orders, bookings), and a comparison with 3–5 similar pages. Use when they type /page-audit, ask «پیجم رو آنالیز کن», «چرا پیجم رشد نمی‌کنه؟», «چی کار کنم بهتر بشه؟», at the end of /setup, or once a month.
---

# /page-audit · what to fix first

Read `profile/CREATOR.md`, their business playbook (`playbook/business/<file>`), `profile/HOOKS.md` and the last audit
(`profile/audits/`) if there is one. Talk in their language. **Only measured numbers**: from Zernio, from their own
Insights screenshots, or what is visible on public profiles. Never estimate a metric, never quote an "industry
benchmark" you cannot cite; compare with their own medians and with the competitor pages you actually looked at.

## Two modes
- **Public** (setup phase 5, or any time without Zernio): only what anyone can see — the profile, grid, captions, view
  counts Instagram shows on reels, highlights, competitors, the order path. Score only the areas that public data can
  show (Profile, Grid, Content mix, Hooks from visible view counts, Conversion path, vs competitors); mark Reach, Retention,
  Audience fit and Timing "waits for data". Save as `profile/audits/AUDIT-<date>-public.md`.
- **Full** (Zernio connected, setup phase 9 and monthly): everything below, compared with the last audit.
Either way: render the fixes they can do today in their brand (the highlight covers with `/story`, the new bio as text in
their voice), so the audit ends with something they can use in the next ten minutes.

## 1 · Collect

1. **Numbers (Zernio, read-only):** `tools/py -I tools/zernio/zernio.py audit` → `research/analytics/audit.json`
   (30-day totals, follower history, audience of followers and of engaged viewers by age/gender/city/country, online
   hours, best times, posting frequency vs engagement, content decay, every post's numbers). Pieces a small or new
   account lacks are listed as "not available"; say so, do not fill them in.
2. **What the profile looks like:** ask for screenshots (profile header with bio and highlights, the first 12 posts of the
   grid, Insights → Overview and → Audience). Or, if they want, open their profile in their own Chrome (Claude in Chrome)
   and look only; never log in, never type anything, never scrape.
3. **Competitors:** ask for 3–5 pages they consider rivals or role models (same city/kind of business). Look at their
   public profiles the same way (screenshots or viewing in their Chrome): followers, posts per week, the last 12 posts'
   view counts where Instagram shows them, what formats and hooks their top posts use, bio and highlights. Note the date.
4. **The order path:** how a viewer becomes a customer today (DM, phone, site, delivery app, booking link) and what
   they know about it (DMs per week, orders from Instagram, link taps from Insights).

## 2 · Analyse (score each area 0–10 with one line of evidence)

| area | look at |
|---|---|
| Profile | name field has the searchable keyword (what + city), bio says who it is for / what they get / where / next step, one clear link, highlights that answer buying questions (menu, prices, how to order, reviews, location), a recognisable profile photo |
| Grid | covers readable in the 3:4 grid crop, a consistent look, pinned posts that sell (best reel, prices/offer, reviews) |
| Content mix | their pillars vs the playbook's shares; too much of one thing; missing pillars |
| Hooks & retention | skip rate, average watch vs length, the first line of the best vs worst third (`HOOKS.md` patterns) |
| Value signals | saves and shares per 1k views, comments; which topics earn them |
| Reach | non-follower share, views per post vs their median, content decay (how long posts keep getting views) |
| Consistency & timing | posts per week, gaps, posting-frequency vs engagement, best times vs when they post |
| Audience fit | followers' and engaged viewers' city/age/gender vs the customer in CREATOR.md (a café in one city with followers from everywhere is reach that does not buy) |
| Conversion | gate words in use, DM automations, link taps, a clear "how to order/book" in captions, highlights and stories |
| vs competitors | what the strongest rival does that they do not (format, frequency, hook, offer), and what they do better |

## 3 · Deliver

Write `profile/audits/AUDIT-<YYYY-MM-DD>.md` and tell them, short:
1. **The verdict in three lines:** what is working, what is holding the page back, the one change with the biggest effect.
1b. **Strengths (top 3) and weaknesses (top 3)**, each with its evidence (a number, a post, a screenshot) and, for each
   weakness, the fix. Keep the strengths: say what to keep doing so a fix does not break what works.
2. **The scores table** (area, score, evidence).
3. **Top 5 actions**, ordered by impact ÷ effort, each concrete enough to do today: the new bio text (two variants in
   their voice), which highlights to create and what goes in each, which posts to pin, which pillar to add or cut, the
   posting days/times to use, the next 3 reel ideas with hooks (`/reel-idea` format).
4. **A two-week plan** (hand over to `/content-plan`).
5. **What to measure** to know it worked, and the date of the next audit (in ~30 days).

The bot's dashboard (📊 in the Studio bot) and the daily 09:00 report track the same page score every day; point them to it
for "did it work?". Then, with their OK: update `profile/HOOKS.md`, the weights in `playbook/IDEA-TO-REEL.md` §3, the scores in
`/reel-style`, and `REEL_DAYS`/`REEL_TIME` in `telegram-bot/wrangler.jsonc` (push to deploy). Bio and highlight changes
are theirs to make in the app; give them the exact texts.

From the second audit on, open with what changed since the last one (numbers side by side) and whether last time's
actions were done and worked.
