---
name: content-plan
description: Plan the coming week (or month) of reels, stories and channel posts for this page from its business playbook, its analytics and its filming days, plus the shot list to film. Use when they type /content-plan, ask «برنامه‌ی این هفته», «چی بسازیم؟», «ایده بده», or after /analytics.
---

# /content-plan

Read `profile/CREATOR.md` (business type, reels per week, filming days), the page's file in `playbook/business/`,
`profile/HOOKS.md`, `profile/RULES.md`, `profile/IDEAS-REMOVED.md`, and the ideas waiting in the Studio bot
(`GET $BOT_URL/api/ideas?status=new`, keys from `.env`, never printed).

Deliver in their language, as one table:
1. **Reels** (as many as their weekly number): day, pillar, hook in their voice, gate word + what it gives, style, the
   viral score with its weakest part. Mix pillars by the playbook's shares; repeat what `/analytics` says works.
2. **Stories**: one line per day (what, which sticker).
3. **Channel posts** if they use a channel.
4. **The shot list** for their filming day: every clip the reels need plus the playbook's weekly b-roll bank, grouped by
   place so it can be filmed in one go, with outfit changes marked (batch-filmed reels must not look batch-filmed).
5. Anything that needs a fact from them (prices, dates, stock) as a short question list.

Save it as `reels/plan-<YYYY-MM-DD>.md`. If they want, send each story or post idea to the Studio bot as a draft
(`/telegram-post`). Nothing is filmed, edited or published from here.
