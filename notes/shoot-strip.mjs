import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const OUT='/mnt/c/dev/notes/community-shots';
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('http://localhost:4123/contents/community/meetup-2/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
// hover the filmstrip to reveal scroll buttons
const strip=p.locator('div.group\\/strip').first();
await strip.hover();
await p.waitForTimeout(400);
await strip.screenshot({path:`${OUT}/v9-strip-hover.png`});
console.log('strip hover shot');
// verify right button exists and scroll works
const rightBtn=p.locator('button[aria-label="다음 사진들"]');
const hasRight = await rightBtn.count();
console.log('right button count =', hasRight);
if(hasRight){ await rightBtn.first().click({force:true}); await p.waitForTimeout(700); await strip.hover(); await p.waitForTimeout(300); await strip.screenshot({path:`${OUT}/v9-strip-scrolled.png`}); console.log('scrolled shot + left should now appear'); 
  const leftCount = await p.locator('button[aria-label="이전 사진들"]').count();
  console.log('left button count after scroll =', leftCount);
}
// full detail for context
await p.evaluate(()=>window.scrollTo(0,0));
await p.screenshot({path:`${OUT}/v9-detail.png`,fullPage:true});
console.log('DONE'); await b.close();
