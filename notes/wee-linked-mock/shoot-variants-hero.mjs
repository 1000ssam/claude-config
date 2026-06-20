import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const shots = [
  ['mymind-native.html', 'fold-current.png'],
  ['var1-nav.html', 'fold-v1.png'],
  ['var2-board-right.html', 'fold-v2.png'],
];
for (const [file, out] of shots) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('file://' + DIR + '/' + file, { waitUntil: 'load' });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 8000))]));
  await p.waitForTimeout(1100);
  await p.screenshot({ path: DIR + '/' + out });  // 뷰포트=above the fold
  console.log('shot', out);
  await ctx.close();
}
await b.close(); console.log('DONE');
