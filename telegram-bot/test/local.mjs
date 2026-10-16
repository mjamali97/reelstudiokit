// local.mjs · start and stop the bot on this computer (wrangler dev --local + the mock Telegram/Zernio/Gemini server),
// the same way on macOS, Linux and Windows. Used by test/all.mjs and demo/demo.mjs. Nothing here leaves 127.0.0.1.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";
const procs = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// npx is npx.cmd on Windows, which Node starts only through the shell
export const npx = (args, opts = {}) => spawn("npx", args, { cwd: BOT, shell: WIN, ...opts });
const npxSync = (args) => spawnSync("npx", args, { cwd: BOT, shell: WIN, stdio: "ignore" });

// .dev.vars from the example, with KEY=value lines replaced or added
export function devVars(over = {}) {
  let s = fs.readFileSync(path.join(BOT, ".dev.vars.example"), "utf8");
  for (const [k, v] of Object.entries(over)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    s = re.test(s) ? s.replace(re, () => `${k}=${v}`) : s.replace(/\n?$/, () => `\n${k}=${v}\n`);   // functions: a "$" in v stays literal
  }
  fs.writeFileSync(path.join(BOT, ".dev.vars"), s);
}

const up = async () => { try { return (await (await fetch("http://127.0.0.1:8787/")).text()).includes("bot"); } catch { return false; } };

function kill(p) {
  if (!p || p.exitCode !== null) return;
  if (WIN) spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore" });   // the whole tree: npx → wrangler → workerd
  else try { process.kill(-p.pid, "SIGTERM"); } catch {}                                      // the process group (detached below)
}

export async function stop() {
  while (procs.length) kill(procs.pop());
  // left over from a run that was killed hard (POSIX only: Windows has no pattern kill; taskkill above covers our own)
  if (!WIN) { spawnSync("pkill", ["-f", "wrangler.*dev --local --port 8787"]); spawnSync("pkill", ["-f", "test/mock-telegram.mjs"]); }
  for (let i = 0; i < 20 && (await up()); i++) await sleep(500);
}

export async function start({ tries = 60 } = {}) {
  await stop();
  fs.rmSync(path.join(BOT, ".wrangler"), { recursive: true, force: true });
  npxSync(["-y", "wrangler@4", "d1", "migrations", "apply", "reel-studio-bot", "--local"]);
  const log = (f) => fs.openSync(path.join(BOT, "test", f), "w");
  procs.push(spawn(process.execPath, ["test/mock-telegram.mjs"], { cwd: BOT, stdio: ["ignore", log("mock.log"), log("mock.log")], detached: !WIN }));
  procs.push(npx(["-y", "wrangler@4", "dev", "--local", "--port", "8787", "--test-scheduled"], { stdio: ["ignore", log("dev.log"), log("dev.log")], detached: !WIN }));
  for (let i = 0; i < tries; i++) { if (await up()) return true; await sleep(1500); }
  return false;
}

export function cleanup() {
  for (const f of [".dev.vars", ".dev.vars.bak"]) fs.rmSync(path.join(BOT, f), { force: true });
}
