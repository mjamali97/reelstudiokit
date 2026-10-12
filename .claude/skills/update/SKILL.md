---
name: update
description: Update this studio to the latest kit version from github.com/mjamali97/reelstudiokit without losing the owner's profile, brand, formats, settings or reels. Use when they type /update, ask «آپدیت کن», «نسخه‌ی جدید اومده؟», or when the kit's CHANGELOG mentions something they asked about.
---

# /update · new kit version, your files kept

1. `git status`: anything uncommitted is theirs; commit it first with a clear message (ask if unsure what it is).
2. `bash tools/update.sh`. It adds the `upstream` remote if missing, sets the `ours` merge driver, merges the kit and
   prints the new CHANGELOG entries plus the list of **their** files the kit also changed (they kept their version).
3. Explain the new entries in their language, short. Do every **Action** line with them.
4. For each of their files the kit changed: `git diff <old-merge-base> upstream/main -- <file>` to see what the kit added
   (a new setting, a new prompt line, a new section) and port only that into their version, keeping their words. New
   settings always have defaults in code, so nothing breaks if they skip one.
5. A merge conflict outside their files: resolve in favour of the kit unless they edited that file on purpose; ask.
6. `bash telegram-bot/test/all.sh` must say ALL GREEN; `cd tools/style-reel && npx --yes hyperframes@0.8.46 check` must pass.
7. `git push` to their own repo (`origin`): the bot redeploys. Tell them the new version number and what they can try.

Never push to `upstream`. Never overwrite `profile/`, `brand/`, `reels/` or their formats with the kit's examples.
