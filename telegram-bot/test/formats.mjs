// formats: the kit defaults (formats.base.js) + your overrides (formats.js). No worker needed.
import * as BASE from "../src/formats.base.js";
import * as YOURS from "../src/formats.js";
let pass = 0, fail = 0;
const ok = (c, name) => { c ? pass++ : fail++; console.log(`${c ? "✅" : "❌"} ${name}`); };
const env = { BRAND_NAME: "Sweet Corner", IG_HANDLE: "@sweetcorner", TG_CHANNEL: "@sweetcorner_menu" };
ok(typeof BASE.POST_PROMPT === "function" && typeof BASE.replyPool === "function", "defaults export every prompt");
Object.assign(BASE.O, YOURS);
ok(BASE.POST_PROMPT(env, { title: "t" }).includes("@sweetcorner_menu"), "defaults work with an empty formats.js");
for (const k of Object.keys(BASE.O)) delete BASE.O[k];   // the checks below must not depend on the overrides in your formats.js
BASE.O.TG_EXAMPLE = () => "MY-OWN-EXAMPLE";
BASE.O.STYLE = { en: "MY-OWN-STYLE" };
BASE.O.REPLIES = { en: ["MY-OWN-REPLY"] };
const p = BASE.POST_PROMPT(env, { title: "t" });
ok(p.includes("MY-OWN-EXAMPLE") && p.includes("MY-OWN-STYLE"), "an override in formats.js reaches inside the default prompts");
ok(BASE.replyPool()[0] === "MY-OWN-REPLY", "REPLIES override");
BASE.O.brand = (e) => ({ ...BASE.defaultBrand(e), ig: "@x" });
ok(BASE.SEARCH_PROMPT(env, "q").includes("@x"), "brand override reaches the prompts");
console.log(`\n${pass} passed, ${fail} failed`);
