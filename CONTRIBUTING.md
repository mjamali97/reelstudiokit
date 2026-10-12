# Maintaining the kit (for the maintainer and contributors)

Users copy this repo and pull updates with `/update` (`tools/update.sh`). Keep updates safe for them:

1. **No personal data**, ever: no real handles, ids, keys, numbers, faces, client names. Examples are neutral or a made-up business.
2. **User-owned files** are listed in `.gitattributes` (`merge=ours`). Change them only to improve the example; users who
   edited theirs keep their version, and `/update` tells them what changed so Claude can port it.
3. **New settings need defaults in code** (`env.X || default`), so an old `wrangler.jsonc` keeps working.
4. **New business type:** copy `playbook/business/_TEMPLATE.md`, fill every section, add a row to `playbook/business/INDEX.md`.
5. **Tests:** `bash telegram-bot/test/all.sh` (ALL GREEN) and `cd tools/style-reel && npx --yes hyperframes@0.8.46 check`.
6. **Release:** bump `VERSION` (patch = fixes/texts, minor = new features, major = something users must act on), add a
   CHANGELOG entry with an **Action** line when users must do something, commit, push, optionally tag `v<version>`.
