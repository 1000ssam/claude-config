import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const URL = 'file://' + DIR + '/mymind-native.html';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: 'load' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
await p.waitForTimeout(900);

const sel = ['.hero', '.feat2', '.moment', '.appband', '.master', '.closing', 'footer.site'];
let i = 0;
for (const s of sel) {
  const el = p.locator(s).first();
  if (await el.count() === 0) { i++; continue; }
  await el.screenshot({ path: `${DIR}/mc-${i}-${s.replace(/[^a-z0-9]/gi,'')}.png` });
  console.log('crop', s);
  i++;
}
await b.close();
console.log('OK');
