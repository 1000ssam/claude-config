import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const p = await b.newPage({ viewport:{width:1280,height:600}, deviceScaleFactor:2 });
await p.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await p.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(250);
await p.screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/hero-margin2x.png', clip:{x:0,y:0,width:1280,height:480} });
console.log('saved hero-margin2x.png'); await b.close();
