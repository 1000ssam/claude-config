import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:820}, deviceScaleFactor:1 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(400);
const m = await page.evaluate(()=>{
  const h1=document.querySelector('h1');
  // 헤드라인 글자 실제 잉크 윗선(Range로 텍스트 박스 측정)
  const range=document.createRange();
  range.selectNodeContents(h1);
  const textTop = range.getBoundingClientRect().top;
  const h1BoxTop = h1.getBoundingClientRect().top;
  // 오른쪽 보드: board-clip/board-fade 래퍼 및 첫 카드
  const board = document.querySelector('.board-clip') || document.querySelector('.board-fade');
  const boardTop = board ? board.getBoundingClientRect().top : null;
  const firstCard = document.querySelector('.board-fade > div, .board-fade')?.firstElementChild;
  const cardTop = firstCard ? firstCard.getBoundingClientRect().top : null;
  const cs=getComputedStyle(h1);
  return { textTop:Math.round(textTop), h1BoxTop:Math.round(h1BoxTop), boardTop:boardTop&&Math.round(boardTop), cardTop:cardTop&&Math.round(cardTop), fontSize:cs.fontSize, lineHeight:cs.lineHeight };
});
console.log(JSON.stringify(m,null,2));
console.log('→ 글자윗선 - 카드윗선 delta =', (m.cardTop!=null? m.textTop - m.cardTop : 'n/a'));
console.log('→ h1박스윗선 - 보드윗선 delta =', (m.boardTop!=null? m.h1BoxTop - m.boardTop : 'n/a'));
await browser.close();
