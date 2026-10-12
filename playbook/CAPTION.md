# Caption and gate DM · THEIR format

> /setup replaces the example below with the format the owner chose (step 4b); their business playbook has a
> type-specific example too. Write every caption in their voice (`profile/VOICE.md`).

## Instagram caption (example format)
```
[line 1: a curiosity or hook QUESTION about the reel's topic]

کلمه‌ی «[گیت]» رو کامنت کن تا [دقیقاً چی] رو برات تو دایرکت بفرستم 📩

[one-line description]:
[link 1]
[link 2]
[save CTA + a SHARE CTA tailored to this reel, e.g. «بفرست برا دوستی که …»]

#[5 hashtags specific to THIS reel's topic]
```
Why: the question earns the "more" tap, the share line drives sends (reach), specific hashtags classify the topic.
A reel without a gate skips the CTA line.

Business example (bakery): `[product name + one sensory line]` → `[price / how to order]` → `کامنت کن «منو» تا منو رو
برات بفرستم 📩` → `[address · hours]` → `[save/share CTA]` → `[#city #product …]`.

## Gate DM (comment-to-DM, sent by Zernio to everyone who comments the word)
- Message 1: what it is + the steps + the link(s) (Telegram channel or site). Under 1000 characters.
- Message 2 (optional): the thing itself alone (a prompt, a code, a recipe), so a long-press copies only it.
- No follow-gate ("follow first, then I send it"): send to everyone who comments.
- `curl` every link for 200 before it goes out.
- A short public reply under each matching comment rotates through variations (`REPLY_POOL` in `telegram-bot/src/formats.js`).

## YouTube Shorts
Title ≤ 100 characters (the hook as a statement), description = caption without the DM line + the links.
