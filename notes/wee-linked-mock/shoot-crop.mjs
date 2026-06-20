import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 1100 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('file://' + DIR + '/mymind-native.html', { waitUntil: 'load' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 5000))]));
await p.waitForTimeout(1400);
// 히어로 상단 (tagbar+nav+hero+board 일부)
await p.screenshot({ path: DIR + '/native-hero.png', clip: { x: 0, y: 0, width: 1180, height: 1040 } });
// 모먼트 한 개 디테일
const m = await p.$$('.moment');
if (m[0]) await m[0].screenshot({ path: DIR + '/native-moment.png' });
await b.close();
console.log('OK');
