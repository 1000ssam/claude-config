import { chromium } from '/home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const EXE='/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE });

async function shoot(w, h, name){
  const page = await browser.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:2 });
  await page.goto('http://localhost:3100/', { waitUntil:'networkidle' });
  // Reveal 애니메이션(opacity:0)을 정적 캡처용으로 강제 표시
  await page.addStyleTag({ content:'*{opacity:1 !important; transform:none !important;}' });
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path:`/mnt/c/dev/notes/wee-linked-shots/redesign-${name}.png`, fullPage: name==='desktop' });
  if(name==='desktop'){
    const checks = await page.evaluate(()=>{
      const out={};
      for(const f of ['Wanted Sans Variable','Pretendard','Jeju Myeongjo']) out[f]=document.fonts.check(`24px "${f}"`);
      // 히어로 h1의 실제 적용 폰트
      const h1=document.querySelector('h1');
      out._heroFont = h1 ? getComputedStyle(h1).fontFamily : 'no h1';
      out._heroWeight = h1 ? getComputedStyle(h1).fontWeight : '';
      return out;
    });
    console.log(JSON.stringify(checks,null,2));
  }
  await page.close();
}
await shoot(1280, 900, 'desktop');
await shoot(390, 844, 'mobile');
console.log('saved redesign-desktop.png / redesign-mobile.png');
await browser.close();
