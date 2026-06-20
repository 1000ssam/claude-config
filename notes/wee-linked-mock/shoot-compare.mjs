import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 1400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('file://' + DIR + '/font-compare.html', { waitUntil: 'load' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 6000))]));
await p.waitForTimeout(1800);
await p.screenshot({ path: DIR + '/font-compare.png', fullPage: true });
// 본 파일(송명 적용) 히어로도 갱신
await p.goto('file://' + DIR + '/mymind-native.html', { waitUntil: 'load' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 6000))]));
await p.waitForTimeout(1500);
await p.screenshot({ path: DIR + '/native-hero.png', clip: { x: 0, y: 0, width: 1180, height: 1040 } });
await b.close();
console.log('OK');
