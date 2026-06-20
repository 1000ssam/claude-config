import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:760}, deviceScaleFactor:2 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(250);
// 헤더+히어로 상단 크롭
await page.screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/redesign-hero-crop.png', clip:{x:0,y:0,width:1280,height:520} });
await browser.close();
console.log('saved redesign-hero-crop.png');
