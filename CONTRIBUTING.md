# Maintaining the kit (for the maintainer and contributors)

Users copy this repo and pull updates with `/update` (`tools/update.sh`). Keep updates safe for them:

1. **No personal data**, ever: no real handles, ids, keys, numbers, faces, client names. Examples are neutral or a made-up business.
2. **User-owned files** are listed in `.gitattributes` (`merge=ours`). Change them only to improve the example; users who
   edited theirs keep their version, and `/update` tells them what changed so Claude can port it.
3. **New settings need defaults in code** (`env.X || default`), so an old `wrangler.jsonc` keeps working.
4. **New business type:** copy `playbook/business/_TEMPLATE.md`, fill every section, add a row to `playbook/business/INDEX.md`.
5. **Tests:** `node tools/ci/check.mjs` (static: skills, styles, fonts, guides, no personal data), `bash telegram-bot/test/all.sh`
   (ALL GREEN) and `cd tools/style-reel && npx --yes hyperframes@0.8.46 check`. CI runs these plus render smoke tests on every push.
5b. **A new video style:** `tools/style-reel/styles/<name>.js` (scenes B1–B6, every hold keeps moving: `H.camera`), an entry in the
   `style` enum and a script tag in `index.html`, a skill `.claude/skills/<name>/SKILL.md`, a row in `/reel-style` and in the guides;
   render the demo, `qa.py` zero FAIL, eye pass on the sheet, then `node tools/render/showcase.mjs --only styles`.
5c. **A new carousel or story template:** add it to `tools/render/carousels.mjs` / `stories.mjs`, an example spec in
   `examples/bakery/`, render it, look at the contact sheet, re-run `node tools/render/showcase.mjs`.
5d. **Text in the guides:** change `docs/guide/en.md` first, then the six translations in the same PR.
6. **Release:** bump `VERSION` (patch = fixes/texts, minor = new features, major = something users must act on), add a
   CHANGELOG entry with an **Action** line when users must do something, commit, push, optionally tag `v<version>`.
