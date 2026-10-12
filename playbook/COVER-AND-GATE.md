# Cover and gate image

Both are HTML pages in their brand (`brand/tokens.css`), rendered to images with Chrome (`tools/capture/webcap.mjs
file:///…/cover.html out.png --width=1080 --height=1920 --scale=1 --max=0`) or a HyperFrames snapshot.

## Cover (`reels/<slug>/cover/`)
- 1080×1920. The profile grid shows a 1080×1080 centre crop (and a 3:4 crop in newer layouts): the title and the face
  must survive both. Check the crops before delivery.
- One title line, measured first: it must fit ≤ 960 px at the chosen size in the display font. Persian titles in heavy
  faces: watch words that read as one («بهتر از اینجا»): add `word-spacing: .16em` to that line, never letter-spacing.
- A real frame from the final edit (face at its best, mid-sentence, eyes open) + a real crop of the proof (the page, the
  product). Never a generated face.
- Instagram uses it as the reel thumbnail through Zernio (`instagramThumbnail`); YouTube only on a phone-verified channel.

## Gate image (`reels/<slug>/gate/`)
- What the commenter receives first in the DM: 1125×1590 at 3x device scale, JPEG quality ~60.
- The steps, the links (bare URLs, readable), what is free and what is not, the Telegram strip ("the files are in my
  channel; the link comes after this image") when they use a channel.
- Overflow guard: the title's bottom must stay above the footer (measure `getBoundingClientRect()` in the page).
- Lint the Persian (`PERSIAN.md`): half-spaces, Persian digits, `<bdi>` around Latin words next to punctuation or digits.
- `curl` every link for 200.
- `dm.md`: message 1 and message 2, each under 1000 characters (`CAPTION.md` → Gate DM).
