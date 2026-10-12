# Example brand · Sweet Corner (a made-up bakery)

A complete, **fictional** example of what the studio produces after `/setup`: a filled brand profile and voice, carousels,
stories and highlight covers rendered in its brand (`brand/brand.json` at the kit root is this bakery until `/setup` replaces it).
Nothing here is a real business; the photos in `media/` are generated placeholders.

| folder | what | how it was made |
|---|---|---|
| `profile/CREATOR.md` | the brand profile: offer with prices and sources, customers, proof, goals | `/setup` phases 1–3 |
| `profile/VOICE.md` | the brand voice: tone, form of address, words, customer replies, on/off-brand lines | `/setup` phase 3 |
| `carousels/*.json` + folders | the 10 carousel templates (+ one in Persian) | `node tools/render/render.mjs examples/bakery/carousels/<name>.json` |
| `stories/stories*.json` | 10 story templates in English and Persian | same command with a story spec |
| `stories/highlights-*.json` | highlight covers in three styles | same command with a highlights spec |

Look at all of it without installing anything: the PNGs are committed. Re-render after changing `brand/brand.json` to see
the same content in another brand.
