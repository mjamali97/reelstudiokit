---
name: analytics
description: Pull the creator's Instagram numbers from Zernio, find what worked and why, and update their hooks file, the viral-score weights and the style scores. Use when they type /analytics, ask «آمار رو ببین», «کدوم ریل گرفت؟», or a day/week after a post.
---

# /analytics

```bash
python3 -I tools/zernio/zernio.py analytics --out research/analytics/posts.json
python3 -I tools/zernio/zernio.py insights
```
Then, in their language, short:
1. The table of recent posts: views, saves/1k, shares/1k, skip rate, average watch vs length. Saves and shares per 1k views
   are the quality signal; raw views depend on timing and the trial audience.
2. What separates the top third from the rest: hook pattern, distance tier, topic, style, length, gate. Say how sure you
   are (a pattern on three posts is a hunch).
3. Update `profile/HOOKS.md` (rows + "what the numbers say"), the weights in `playbook/IDEA-TO-REEL.md` §3 and the scores
   in `.claude/skills/reel-style/SKILL.md`, each change dated. Online-followers / best-time data → suggest `REEL_DAYS` and
   `REEL_TIME` changes for `telegram-bot/wrangler.jsonc`.
4. One concrete next move (an idea, a format to repeat, one to drop).
Numbers only from Zernio or their screenshots; never estimate a metric that was not measured.
