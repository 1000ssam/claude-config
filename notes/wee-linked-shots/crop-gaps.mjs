import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:820}, deviceScaleFactor:2 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(400);
// 1) 히어로 상단
await page.screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/gap-hero.png', clip:{x:0,y:0,width:1280,height:560} });
// 2) statement → feature 구간으로 스크롤 후 캡처
await page.evaluate(()=>{
  const s=[...document.querySelectorAll('p,h2,blockquote')].find(e=>e.textContent.includes('상담교사의 하루가 가벼워'));
  if(s) s.scrollIntoView({block:'start'});
  window.scrollBy(0,-40);
});
await page.waitForTimeout(300);
await page.screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/gap-statement.png', clip:{x:0,y:0,width:1280,height:700} });
console.log('saved gap-hero.png / gap-statement.png');
await browser.close();
