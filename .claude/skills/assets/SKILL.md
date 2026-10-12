---
name: assets
description: Find and use pictures, video, music, sound effects, icons, illustrations, emoji, fonts and maps that the brand may legally use in posts and ads, and keep a record of each licence. Use when they type /assets, need b-roll, a photo, a background track, an icon or an illustration, ask «عکس از کجا بیارم», «موزیک بدون کپی‌رایت», "royalty-free", "stock video", or before using any file they did not make themselves.
---

# /assets · only what the brand may use

**Their own material first:** their photos, videos and voice prove more than any stock file. Stock is for b-roll that cannot be
filmed (a city, an ingredient field, a texture), illustrations for explanations, and sound.

## What is in the kit (no download, no credit needed unless noted)
| need | use | licence |
|---|---|---|
| icons | `"icon": "cake"` (Lucide), `"tabler:cake"`, `"tabler:cake:filled"`, `"phosphor:cake:duotone"`, `"hero:cake:solid"` · search: `node tools/render/icons.mjs cake --sheet /tmp/i.png` | ISC / MIT |
| illustrations | `"illustration": "doodle:<name>"` (Open Doodles, 32, recoloured to the brand) or `"peep:<any word>"` (Open Peeps people; same word = same person), `"notionists:…"`, `"lorelei:…"`, `"thumbs:…"` on carousel covers, tips, CTAs and tip/question stories | CC0 |
| emoji | typed normally; renders use Noto Color Emoji (installed by `tools/install.sh`) | OFL |
| fonts | 51 families in `fonts/` (`fonts/gallery.html`) | OFL |
| a map | story template `location` with an address: drawn in the brand colours from OpenStreetMap data, credit printed on it | ODbL (credit required, already on the map) |

## What to fetch (`node tools/assets/fetch.mjs`)
| need | command | licence |
|---|---|---|
| photo | `openverse "<query>"` or `commons "<query>"` (no key) · `pexels` / `pixabay` / `unsplash "<query>" --portrait` (free keys in `.env`, typed by them) | CC0 / public domain · Pexels / Pixabay / Unsplash licences |
| video b-roll | `pexels "<query>" --type video --portrait` · `pixabay "<query>" --type video` | Pexels / Pixabay licences |
| music | `openverse "<mood, genre>" --type music` | CC0 |
| sound effects | `openverse "<sound>" --type sfx` (Freesound CC0 among them) | CC0 |
Files land in `reels/<slug>/stock/` (pass `--out`) with `CREDITS.md`; keep it with the reel. `--allow-by` adds CC BY (then the
credit line from CREDITS.md goes in the caption or the description).

## Rules
- Never: CC BY-NC (non-commercial), CC BY-SA (share-alike), "free for personal use", anything from Google Images, Pinterest,
  another page's post, a film, a TV show or a song from the radio. Instagram's own music library works only when posting from
  the app; a track added in the edit must be cleared (CC0, a licence they bought, or music they own).
- Stock with a recognisable person, a logo or private property: fine for posts; for paid ads check the model/property release
  on the source page.
- Never present a stock photo as their product, their shop or their customer. Stock is "a cake", never "our cake".
- Look at every file before using it (watermarks, wrong subject, text in the image). Record the licence in the reel's folder.
- A paid font, music or photo licence they bought: note what it covers (social media? ads? how many views?) in `brand/BRAND.md`.
