// webrec: record a real video of a live website (animations, hover, cursor effects) for b-roll.
// A screenshot cannot show motion; this records what Chrome actually paints, frame by frame
// (CDP screencast), while a scripted mouse and scroll drive the page. Output: CFR 30 fps H.264.
//
//   node tools/capture/webrec.mjs <url> <out.mp4> [options]
//     --width=540 --height=960 --scale=2     viewport in CSS px (default 540x960 at 2 = 1080x1920)
//     --seconds=6                            length of the recording
//     --settle=3000                          wait after load before recording starts
//     --dark                                 prefers-color-scheme: dark
//     --mobile                               iPhone UA + touch (no cursor effects then)
//     --cursor                               draw a pointer where the mouse is (headless paints none)
//     --hide="sel, sel"                      CSS selectors to hide
//     --do="<actions>"                       the choreography, run once recording starts:
//         wait MS
//         move X,Y                           jump the mouse
//         glide X1,Y1 X2,Y2 ... MS           smooth path through the points (eased)
//         wheel DY MS                        wheel-scroll DY px over MS (fires the page's wheel handlers)
//         scroll Y MS                        tween window scroll to Y (for plain pages)
//         click X,Y
//         tap CSS-SELECTOR                   click an element, e.g. tap [aria-label=Minimize]
//     --pre="<actions>"                      same actions, run before recording (close a panel, scroll to a section)
//       e.g. --do="move 100,900; glide 100,900 540,480 900,1200 4000; click 540,600; wait 1500"
//
// Frames arrive when Chrome paints; each output frame takes the last painted frame at its
// timestamp, so the clip keeps real-time speed even if Chrome paints below 30 fps.
// The script prints the real paint rate; under ~20 fps, lower --scale or the viewport.
import { chromium } from 'playwright';
import { mkdtempSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) { console.error('usage: webrec.mjs <url> <out.mp4> [--seconds=6] [--do="..."]'); process.exit(1); }
const opt = Object.fromEntries(rest.map(a => { const i = a.indexOf('='); return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
const W = +(opt.width || 540), H = +(opt.height || 960), S = +(opt.scale || 2);
const SECONDS = +(opt.seconds || 6), FPS = 30;

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: S,
  isMobile: !!opt.mobile, hasTouch: !!opt.mobile, colorScheme: opt.dark ? 'dark' : 'light', locale: 'en-US',
  userAgent: opt.mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined,
});
const page = await ctx.newPage();
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const pt = s => s.split(',').map(Number);
try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
catch { await page.waitForLoadState('load').catch(() => {}); }
await page.waitForLoadState('load').catch(() => {}); await page.waitForTimeout(800); // client-side redirects settle here
if (opt.hide) await page.addStyleTag({ content: `${opt.hide}{display:none!important}` })
  .catch(async () => { await page.waitForLoadState('load'); await page.addStyleTag({ content: `${opt.hide}{display:none!important}` }); });
if (opt.cursor) await page.evaluate(() => {
  const c = document.createElement('div');
  c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l16 10.5-7 1.2 4.2 7.6-3 1.6-4.2-7.7L4 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)';
  document.documentElement.appendChild(c);
  addEventListener('pointermove', e => { c.style.transform = `translate(${e.clientX - 5}px,${e.clientY - 3}px)`; }, true);
});
// park the mouse where the choreography starts, so frame 0 does not jump
const firstMove = String(opt.do || '').split(';')[0].trim().match(/^move\s+(\d+),(\d+)/);
await page.mouse.move(firstMove ? +firstMove[1] : W / 2, firstMove ? +firstMove[2] : H * 0.62);
for (const c of String(opt.pre || '').split(';')) await run(c);
await page.waitForTimeout(+(opt.settle || 3000));

const cdp = await ctx.newCDPSession(page);
const frames = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  frames.push({ t: metadata.timestamp, data });
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: Math.round(W * S), maxHeight: Math.round(H * S), everyNthFrame: 1 });
const t0 = Date.now() / 1000;

async function run(cmd) {
  const [op, ...a] = cmd.trim().split(/\s+/);
  if (!op) return;
  if (op === 'wait') return page.waitForTimeout(+a[0]);
  if (op === 'move') { const [x, y] = pt(a[0]); return page.mouse.move(x, y); }
  if (op === 'click') { const [x, y] = pt(a[0]); return page.mouse.click(x, y); }
  if (op === 'tap') return page.locator(a.join(' ')).first().click({ timeout: 4000 }).catch(e => console.error('tap failed:', e.message));
  if (op === 'glide') {
    const ms = +a.pop(), pts = a.map(pt), steps = Math.max(2, Math.round(ms / 16)), segs = pts.length - 1;
    const start = Date.now();
    for (let i = 1; i <= steps; i++) {
      const u = ease(i / steps) * segs, k = Math.min(segs - 1, Math.floor(u)), f = u - k;
      await page.mouse.move(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f);
      const lag = start + (ms * i) / steps - Date.now(); if (lag > 0) await page.waitForTimeout(lag);
    }
    return;
  }
  if (op === 'wheel') {
    const dy = +a[0], ms = +a[1], steps = Math.max(1, Math.round(ms / 33)), start = Date.now();
    for (let i = 1; i <= steps; i++) {
      await page.mouse.wheel(0, dy / steps);
      const lag = start + (ms * i) / steps - Date.now(); if (lag > 0) await page.waitForTimeout(lag);
    }
    return;
  }
  if (op === 'scroll') {
    const y1 = +a[0], ms = +a[1], y0 = await page.evaluate(() => scrollY), steps = Math.round(ms / 16), start = Date.now();
    for (let i = 1; i <= steps; i++) {
      await page.evaluate(v => window.scrollTo(0, v), y0 + (y1 - y0) * ease(i / steps));
      const lag = start + (ms * i) / steps - Date.now(); if (lag > 0) await page.waitForTimeout(lag);
    }
    return;
  }
  throw new Error('unknown action: ' + op);
}
for (const c of String(opt.do || '').split(';')) await run(c);
const left = t0 + SECONDS - Date.now() / 1000;
if (left > 0) await page.waitForTimeout(left * 1000);
await cdp.send('Page.stopScreencast');
await browser.close();

// constant 30 fps: output frame i shows the last frame painted at or before its time
const dir = mkdtempSync(join(tmpdir(), 'webrec-'));
frames.forEach((f, i) => writeFileSync(join(dir, `p${i}.jpg`), Buffer.from(f.data, 'base64')));
const first = frames[0]?.t ?? t0;
let j = 0;
for (let i = 0; i < SECONDS * FPS; i++) {
  const t = first + i / FPS;
  while (j + 1 < frames.length && frames[j + 1].t <= t) j++;
  copyFileSync(join(dir, `p${j}.jpg`), join(dir, `f${String(i).padStart(5, '0')}.jpg`));
}
const span = frames.length > 1 ? frames.at(-1).t - frames[0].t : 0;
execFileSync('ffmpeg', ['-nostdin', '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%05d.jpg'),
  '-vf', `scale=${Math.round(W * S / 2) * 2}:${Math.round(H * S / 2) * 2}:flags=lanczos`, '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', out]);
rmSync(dir, { recursive: true, force: true });
console.log(`${out}  ${SECONDS}s  painted ${frames.length} frames = ${(frames.length / Math.max(span, 0.001)).toFixed(1)} fps`);
