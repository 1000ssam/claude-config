import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync } from 'node:fs';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock/refs/what';
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1280, height: 920 }, deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
});
const p = await ctx.newPage();
await p.goto('https://mymind.com/what', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);
// 전체 스크롤로 lazy 로드
const H = await p.evaluate(async () => {
  await new Promise((res) => { let y=0; const t=setInterval(()=>{window.scrollBy(0,700);y+=700;if(y>=document.body.scrollHeight){clearInterval(t);res();}},200); });
  return document.body.scrollHeight;
});
await p.waitForTimeout(1200);
const step = 820;
const n = Math.min(14, Math.ceil(H/step));
for (let i=0;i<n;i++){
  await p.evaluate((y)=>window.scrollTo(0,y), i*step);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${DIR}/s${String(i).padStart(2,'0')}.png` });
}
await b.close();
console.log('H=',H,'slices=',n);
