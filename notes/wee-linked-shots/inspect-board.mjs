import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:820}, deviceScaleFactor:1 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
const info = await page.evaluate(()=>{
  const board = document.querySelector('.board-clip');
  return { className: board.className, marginTop: getComputedStyle(board).marginTop };
});
console.log('DOM class:', info.className);
console.log('computed marginTop:', info.marginTop);
await browser.close();
