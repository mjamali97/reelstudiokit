// ============================================================================================================
// formats.js · YOUR formats: everything the bot writes in your name that differs from the kit's defaults.
// The defaults live in formats.base.js (kit-owned, replaced on updates). Anything you export here wins, both where the
// bot uses it directly and inside the default prompts. /setup and /brand write this file with you; kit updates never
// touch it. Leave it empty to use the defaults. After editing: bash telegram-bot/test/all.sh, then push.
//
// What you can override (copy the default from formats.base.js and change it):
//   STYLE            { en: "...", fa: "..." }   how to write, per language (merged with the defaults)
//   TG_FORMAT        (env) => "..."              the structure of your Telegram channel posts
//   TG_EXAMPLE       (env) => "..."              one real example post in your format
//   SCORE_RULES      (env) => "..."              how ideas are scored for your page
//   STORY_IDEA_KIND  (env) => "..."              what a good daily story is about for your business
//   STORY_RULES      () => "..."                 how stories are written
//   REPLIES          { en: [...], fa: [...] }    public replies under gate comments, per language
//   brand            (env) => ({ ... })          names and handles (normally from wrangler.jsonc vars instead)
//   NEWS_PROMPT, STORY_PROMPT, SEARCH_PROMPT, RESEARCH_PROMPT, POST_PROMPT, REPLY_PROMPT, frameHtml, storyParts,
//   storyBody, replyPool, tagsDefault            whole functions, if you need to change more than a part
// ============================================================================================================

// Example (a bakery), uncomment and edit:
// export const TG_EXAMPLE = (env) => `A correct example post:
// 🎂 This week's cakes are in:
//
// The full menu with prices:
// https://example.com/menu
//
// 🔴 Tip: keep a cream cake in the fridge until you serve it.
//
// 💬 #menu`;
