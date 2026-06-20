import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('http://localhost:4123/contents/community/meetup-2/',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
const btns=await p.$$('button[aria-label*="보기"]');
console.log('filmstrip count =', btns.length);
if(btns[6]){ await btns[6].click(); await p.waitForTimeout(2000); }  // generous wait for image load
await p.evaluate(()=>window.scrollTo(0,0));
await p.screenshot({path:'/mnt/c/dev/notes/community-shots/v8b-selected.png',fullPage:false});
console.log('done'); await b.close();
