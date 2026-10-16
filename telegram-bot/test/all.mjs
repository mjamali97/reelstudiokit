// all.mjs · every local check, in the configurations the bot runs in. Mock Telegram + mock Zernio on 127.0.0.1:8790:
// nothing here reaches Telegram, Zernio, Gemini or your Cloudflare account. Same on macOS, Linux and Windows.
//   node telegram-bot/test/all.mjs        (bash telegram-bot/test/all.sh runs this)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BOT, devVars, start, stop, cleanup } from "./local.mjs";

if (!fs.existsSync(path.join(BOT, "node_modules"))) spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: BOT, stdio: "ignore", shell: process.platform === "win32" });
let failed = false;
function suite(file, ...args) {
  console.log(`== ${[file, ...args].join(" ")}`);
  const r = spawnSync(process.execPath, [path.join("test", file), ...args], { cwd: BOT, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  for (const l of out.split("\n")) if (/❌|passed/.test(l)) console.log(l);
  if (!/ 0 failed/.test(out)) failed = true;
}
async function run(vars, ...suites) {
  devVars(vars);
  if (!(await start())) { console.log("worker did not start; see telegram-bot/test/dev.log"); await stop(); cleanup(); process.exit(1); }
  for (const s of suites) suite(...(Array.isArray(s) ? s : [s]));
}
process.on("SIGINT", async () => { await stop(); cleanup(); process.exit(130); });

try {
  suite("i18n.mjs");
  suite("formats.mjs");
  await run({}, "run.mjs");
  await run({ ZERNIO_DRY_RUN: 0 }, "publish.mjs", "story.mjs", "reports.mjs");
  await run({ PUBLISH_CHAT: "@my_channel" }, "flow.mjs");
  await run({ LANG: "en", ZERNIO_DRY_RUN: 0 }, "features.mjs");
  await run({ LANG: "en", ZERNIO_DRY_RUN: 0, AGENCY: "on", GEMINI_API_KEY: "fake", GEMINI_API: "http://127.0.0.1:8790/gemini" }, "agency.mjs");
  for (const L of ["fa", "ar", "tr", "de", "fr", "it"]) await run({ LANG: L }, ["langs.mjs", L]);
} finally { await stop(); cleanup(); }   // also after a crash: no worker left on port 8787
console.log(failed ? "SOME CHECKS FAILED" : "ALL GREEN");
process.exit(failed ? 1 : 0);
