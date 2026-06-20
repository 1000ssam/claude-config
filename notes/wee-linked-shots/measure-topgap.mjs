import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const p = await b.newPage({ viewport:{width:1280,height:820}, deviceScaleFactor:1 });
await p.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await p.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
const m = await p.evaluate(()=>{
  const header=document.querySelector('header');
  const h1=document.querySelector('h1');
  const board=document.querySelector('.board-clip');
  const r=document.createRange(); r.selectNodeContents(h1);
  return {
    headerBottom: Math.round(header.getBoundingClientRect().bottom),
    textTop: Math.round(r.getBoundingClientRect().top),
    cardTop: Math.round(board.firstElementChild.firstElementChild.getBoundingClientRect().top),
    boardMarginTop: getComputedStyle(board).marginTop,
  };
});
m.gap_header_to_text = m.textTop - m.headerBottom;
console.log(JSON.stringify(m,null,2));
await b.close();
