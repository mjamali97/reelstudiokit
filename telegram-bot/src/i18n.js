// i18n.js · the bots speak the owner's language. LANG in wrangler.jsonc → vars: en | fa | ar | tr | de | fr | it.
// Keys are the English source strings in the code; locales/<lang>.js map English → translation. A missing key falls back
// to English, so a new feature never breaks a language that has not been translated yet (CONTRIBUTING.md → translations).
import fa from "./locales/fa.js";
import ar from "./locales/ar.js";
import tr from "./locales/tr.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";
import it from "./locales/it.js";

const DICTS = { fa, ar, tr, de, fr, it };
export const LANGS = { en: "English", fa: "Persian (Farsi)", ar: "Arabic", tr: "Turkish", de: "German", fr: "French", it: "Italian" };
let L = "en";
export const setLang = (l) => { L = LANGS[l] ? l : "en"; };
export const lang = () => L;
export const langName = () => LANGS[L];
export const rtl = () => L === "fa" || L === "ar";
export const _ = (s) => (L === "en" ? s : DICTS[L]?.[s] ?? s);
// _f("Scheduled for {0}", when): placeholders {0} {1} … in the English key and in every translation
export const _f = (s, ...a) => _(s).replace(/\{(\d+)\}/g, (m, i) => String(a[+i] ?? ""));
const DIGITS = { fa: "۰۱۲۳۴۵۶۷۸۹", ar: "٠١٢٣٤٥٦٧٨٩" };
export const num = (n) => { const d = DIGITS[L]; return d ? String(n).replace(/\d/g, (x) => d[x]) : String(n); };
export const decSep = () => ({ fa: "٫", ar: "٫", de: ",", fr: ",", it: ",", tr: "," }[L] || ".");
export const thouSep = () => ({ fa: "٬", ar: "٬", de: ".", it: ".", tr: ".", fr: " " }[L] || ",");
export const listSep = () => (rtl() ? "، " : ", ");
// 1234567 → "1,234,567" in the language's digits and separators
export const grouped = (n) => num(Math.round(n).toLocaleString("en-US").replace(/,/g, "\u0001")).replace(/\u0001/g, thouSep());
export const dec = (x, d = 1) => num(Number(x).toFixed(d)).replace(/[.]/, decSep());
