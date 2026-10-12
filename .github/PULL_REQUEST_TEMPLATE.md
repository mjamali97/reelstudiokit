## What and why
<!-- one paragraph -->

## Checklist
- [ ] No personal data: no real handles, ids, keys, client names, faces (examples are neutral or the fictional bakery)
- [ ] `bash telegram-bot/test/all.sh` says ALL GREEN (if the bot changed)
- [ ] `node tools/ci/check.mjs` passes
- [ ] Renders looked at as a contact sheet (if anything visual changed); `node tools/render/showcase.mjs` re-run for the README images
- [ ] New settings have defaults in code; user-owned files (`.gitattributes`) only changed to improve the example
- [ ] `CHANGELOG.md` entry, with an **Action:** line if users must do something
