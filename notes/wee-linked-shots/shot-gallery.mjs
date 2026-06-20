import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const url = 'file:///mnt/c/dev/notes/wee-linked-shots/font-gallery.html';
const browser = await chromium.launch({
  executablePath: '/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const checks = await page.evaluate(() => {
  const fams = ['LINE Seed KR','S-Core Dream','Paperlogy','Wanted Sans Variable','Freesentation','GmarketSans','IBM Plex Sans KR','SUIT Variable','Pretendard Variable'];
  const out = {};
  for (const f of fams) out[f] = document.fonts.check(`24px "${f}"`);
  return out;
});
console.log('=== document.fonts.check ===');
for (const [k,v] of Object.entries(checks)) console.log(`  ${v?'OK':'-- '} ${k}`);
await page.screenshot({ path: '/mnt/c/dev/notes/wee-linked-shots/gallery-full.png', fullPage: true });
console.log('saved gallery-full.png');
await browser.close();
