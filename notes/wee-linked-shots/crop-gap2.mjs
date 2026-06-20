import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:720}, deviceScaleFactor:2 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(400);
const y = await page.evaluate(()=>{
  const el=[...document.querySelectorAll('p')].find(e=>e.textContent.replace(/\s+/g,'').includes('상담교사의하루가가벼워'));
  if(!el) return -1;
  const r=el.getBoundingClientRect();
  const top=r.top + window.scrollY - 70;  // 위로 70px 여유(헤더)
  window.scrollTo(0, top);
  return Math.round(top);
});
await page.waitForTimeout(300);
console.log('scrolled to y=', y);
await page.screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/gap-statement2.png', clip:{x:0,y:0,width:1280,height:680} });
console.log('saved gap-statement2.png');
await browser.close();
