import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 1400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const variants = [
  { cls: 'v-left',        out: 'var-left.png' },
  { cls: 'v-center',      out: 'var-center.png' },
  { cls: 'v-left v-bold', out: 'var-bold.png' },
];
for (const v of variants) {
  await p.goto('file://' + DIR + '/mymind-native.html', { waitUntil: 'load' });
  await p.evaluate((cls) => { document.body.className = cls; }, v.cls);   // 직접 주입
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 5000))]));
  await p.waitForTimeout(1300);
  const got = await p.evaluate(() => document.body.className);
  await p.screenshot({ path: DIR + '/' + v.out, fullPage: true });
  console.log('shot', v.out, '=>', got);
}
await b.close();
console.log('OK');
