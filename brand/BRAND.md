# Brand / design system
Filled by /setup (step 4). Fonts only with a licence that allows embedding in video and web (OFL is safe).

## Feel
- Three words: <…> · Looks they like: <…> · Never: <…>

## Palette
| token | hex | use |
|---|---|---|
| --bg | | backgrounds |
| --ink | | text |
| --accent | | ONE accent: highlights, the spoken word, rules |
| --muted | | secondary text |
| --ok | | success |

## Type
| role | font | file | licence |
|---|---|---|---|
| Persian display (`"Fa"` in the style kit) | | | |
| body | | | |
| Latin / mono | | | |

## Logo and avatars
- Logo: `brand/logo.svg` · Channel avatar: `brand/channel-logo-640.png` · Bots: `brand/studio-640.png`, `brand/publisher-640.png`

## Where the brand is applied
- `tools/style-reel/index.html` (`"Fa"` font-face) and `tools/style-reel/assets/brand.js`
- `telegram-bot/wrangler.jsonc` → STORY_BG/INK/ACCENT/MUTED; `telegram-bot/src/formats.js` → frameHtml; `src/fonts.js`
- covers and gate images (`playbook/COVER-AND-GATE.md`)
