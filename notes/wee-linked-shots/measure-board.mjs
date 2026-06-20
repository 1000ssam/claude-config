import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:820}, deviceScaleFactor:1 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(300);
const m = await page.evaluate(()=>{
  const board = document.querySelector('.board-clip');
  const grid = board.parentElement; // grid container
  const leftCol = grid.children[0];
  const rightCol = grid.children[1];
  const cs = getComputedStyle(board);
  const csRight = getComputedStyle(rightCol);
  return {
    gridTop: Math.round(grid.getBoundingClientRect().top),
    leftColTop: Math.round(leftCol.getBoundingClientRect().top),
    rightColTop: Math.round(rightCol.getBoundingClientRect().top),
    rightCol_is_boardClip: rightCol.classList.contains('board-clip'),
    boardClip_marginTop: cs.marginTop,
    rightCol_marginTop: csRight.marginTop,
    gridAlignItems: getComputedStyle(grid).alignItems,
  };
});
console.log(JSON.stringify(m,null,2));
await browser.close();
