import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath:'/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport:{width:1280, height:900}, deviceScaleFactor:2 });
await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(250);
// "위링 마스터" 뱃지가 있는 섹션을 찾아 그 카드 캡처
const card = await page.evaluateHandle(()=>{
  const els=[...document.querySelectorAll('section')];
  for(const s of els){ if(s.textContent && s.textContent.includes('위링 마스터') && s.textContent.includes('선생님')) return s; }
  return null;
});
if(card){
  await card.asElement().scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await card.asElement().screenshot({ path:'/mnt/c/dev/notes/wee-linked-shots/master-restored.png' });
  console.log('saved master-restored.png');
} else {
  console.log('master section not found');
}
// 텍스트 내용 확인(intro 복원 여부)
const info = await page.evaluate(()=>{
  const s=[...document.querySelectorAll('section')].find(x=>x.textContent.includes('위링 마스터')&&x.textContent.includes('선생님'));
  if(!s) return 'none';
  const img=s.querySelector('img,canvas,[class*=rounded-full],div');
  return { hasMoreBtn: s.textContent.includes('마스터 이야기 더 보기'), len: s.textContent.replace(/\s+/g,' ').length };
});
console.log(JSON.stringify(info));
await browser.close();
