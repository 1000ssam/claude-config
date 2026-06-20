import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1180, height: 1400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('file://' + DIR + '/palette-preview.html', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
await p.waitForTimeout(1500);

const ids = ['A', 'B', 'C'];
for (const id of ids) {
  const el = await p.$('#frame-' + id);
  await el.screenshot({ path: `${DIR}/palette-${id}.png` });
  console.log('shot', id);
}
// 전체 비교 한 장 (세로 스택)
await p.screenshot({ path: `${DIR}/palette-all.png`, fullPage: true });
console.log('shot all');
await b.close();
console.log('DONE');
