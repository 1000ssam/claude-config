import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock/refs';
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
});
const p = await ctx.newPage();

const pages = [
  { url: 'https://mymind.com/', out: 'mymind-home-full.png', top: 'mymind-home-top.png' },
  { url: 'https://mymind.com/what', out: 'mymind-what-full.png', top: 'mymind-what-top.png' },
];

for (const pg of pages) {
  try {
    await p.goto(pg.url, { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1500);
    // 위쪽 고해상도 한 장
    await p.screenshot({ path: DIR + '/' + pg.top });
    // 끝까지 스크롤하며 lazy 콘텐츠 로드
    await p.evaluate(async () => {
      await new Promise((res) => {
        let y = 0; const step = 600;
        const t = setInterval(() => {
          window.scrollBy(0, step); y += step;
          if (y >= document.body.scrollHeight - window.innerHeight - 10) { clearInterval(t); res(); }
        }, 250);
      });
    });
    await p.waitForTimeout(1500);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(800);
    await p.screenshot({ path: DIR + '/' + pg.out, fullPage: true });
    console.log('shot', pg.url);
  } catch (e) {
    console.log('FAIL', pg.url, e.message.slice(0, 80));
  }
}
await b.close();
console.log('DONE');
