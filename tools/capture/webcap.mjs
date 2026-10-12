// webcap: screenshot any website for b-roll, at an exact CSS width.
// Headless Chrome's --window-size cannot go below ~500 CSS px, so mobile shots cut off at the
// right edge. Playwright sets the viewport directly, so 432 px really is 432 px.
//
//   node tools/capture/webcap.mjs <url> <out.png> [options]
//     --mobile            iPhone UA, touch, 432 wide, scale 2.5 (1080 px image)   (default)
//     --desktop           1280 wide, scale 2 (2560 px image)
//     --width=N --height=N --scale=N   override the viewport
//     --dark              prefers-color-scheme: dark
//     --max=N             stop the page at N CSS px tall (default 6400; 0 = viewport only)
//     --wait=MS           extra settle time after load (default 2500)
//     --hide="sel, sel"   CSS selectors to hide (badges, chat bubbles, promo bars)
//     --remove="sel, sel" delete these elements just before the shot (when an inline !important beats --hide)
//     --click="text"      click the first element with this exact text before capturing
//     --scrollto=N        scroll to N px and capture the viewport there (for sticky / pinned pages)
//
// It scrolls the whole page once so lazy images load, dismisses cookie banners it recognises,
// then takes the shot. Prints the saved size.
import { chromium } from 'playwright';

const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) { console.error('usage: webcap.mjs <url> <out.png> [--mobile|--desktop] [...]'); process.exit(1); }
// split on the first "=" only: selectors like a[href*="x"] carry their own "="
const opt = Object.fromEntries(rest.map(a => { const i = a.indexOf('='); return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
const desktop = !!opt.desktop;
const W = +(opt.width || (desktop ? 1280 : 432));
const H = +(opt.height || (desktop ? 900 : 932));
const S = +(opt.scale || (desktop ? 2 : 2.5));
const MAX = opt.max === undefined ? 6400 : +opt.max;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: S,
  isMobile: !desktop, hasTouch: !desktop,
  userAgent: desktop ? undefined :
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  colorScheme: opt.dark ? 'dark' : 'light', locale: 'en-US',
});
const page = await ctx.newPage();
try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
catch { await page.waitForLoadState('load').catch(() => {}); }
await page.waitForLoadState('load').catch(() => {}); await page.waitForTimeout(800); // client-side redirects settle here

// cookie / consent banners
for (const re of [/^(accept|accept all|allow all|agree|i agree|got it|ok|okay)$/i]) {
  const b = page.getByRole('button', { name: re }).first();
  if (await b.count().catch(() => 0)) await b.click({ timeout: 1500 }).catch(() => {});
}
if (opt.hide) await page.addStyleTag({ content: `${opt.hide}{display:none!important}` })
  .catch(async () => { await page.waitForLoadState('load'); await page.addStyleTag({ content: `${opt.hide}{display:none!important}` }); });
if (opt.click) { await page.getByText(opt.click, { exact: true }).first().click({ timeout: 4000 }).catch(e => console.error('click failed:', e.message)); await page.waitForTimeout(1200); }

// one slow pass to the bottom so lazy images and scroll reveals fire, then back up
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const stop = MAX ? Math.min(total, MAX) : H;
for (let y = 0; y < stop; y += Math.round(H * 0.7)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(220); }
await page.evaluate(v => window.scrollTo(0, v), +(opt.scrollto || 0));
await page.waitForTimeout(+(opt.wait || 2500));
// widgets whose inline !important style beats --hide (iubenda's consent button) are removed outright
if (opt.remove) await page.evaluate(s => document.querySelectorAll(s).forEach(e => e.remove()), opt.remove);

if (opt.scrollto || !MAX) await page.screenshot({ path: out });
else {
  const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), MAX);
  await page.screenshot({ path: out, fullPage: true, clip: { x: 0, y: 0, width: W, height: h } });
}
console.log(`${out}  ${Math.round(W * S)}x? css ${W}x${stop} scale ${S}  page ${total}px`);
await browser.close();
