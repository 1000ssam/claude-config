import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const OUT = '/mnt/c/dev/notes/community-shots';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });
const base = 'http://localhost:4123';
const browser = await chromium.launch();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, 400);
        y += 400;
        if (y < document.body.scrollHeight + 800) setTimeout(step, 80);
        else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
      };
      step();
    });
  });
  await page.waitForTimeout(600);
}

async function shot(name, url, vw, vh, full=true, action) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.goto(base + url, { waitUntil: 'networkidle' });
  await autoScroll(page);
  if (action) await action(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log('shot', name);
  await ctx.close();
}

await shot('01-list-desktop', '/contents/community/', 1440, 1000, true);
await shot('02-list-mobile', '/contents/community/', 390, 844, true);
await shot('03-detail-meetup2-desktop', '/contents/community/meetup-2/', 1440, 1000, true);
await shot('04-detail-mobile', '/contents/community/meetup-2/', 390, 844, true);
await shot('05-lightbox', '/contents/community/meetup-2/', 1440, 1000, false, async (page) => {
  await page.locator('button[aria-label*="크게 보기"]').first().click();
  await page.waitForTimeout(700);
});
await shot('06-detail-challenge', '/contents/community/reading-challenge/', 1440, 1000, true);
await browser.close();
console.log('DONE');
