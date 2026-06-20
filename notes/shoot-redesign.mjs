import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const OUT='/mnt/c/dev/notes/community-shots';
const b=await chromium.launch();
async function autoScroll(page){await page.evaluate(async()=>{for(let y=0;y<=document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);});await page.waitForTimeout(700);}
// list gallery
let ctx=await b.newContext({viewport:{width:1440,height:1000}});let p=await ctx.newPage();
await p.goto('http://localhost:4123/contents/community/',{waitUntil:'networkidle'});await autoScroll(p);
await p.screenshot({path:`${OUT}/v8-list.png`,fullPage:true});console.log('list shot');await ctx.close();
// detail meetup-2
ctx=await b.newContext({viewport:{width:1440,height:1000}});p=await ctx.newPage();
await p.goto('http://localhost:4123/contents/community/meetup-2/',{waitUntil:'networkidle'});await p.waitForTimeout(900);
await p.screenshot({path:`${OUT}/v8-detail.png`,fullPage:true});console.log('detail shot');
// click a filmstrip preview (3rd) then capture top
const btns=await p.$$('button[aria-label*="보기"]');
if(btns[4]) { await btns[4].click(); await p.waitForTimeout(700); }
await p.evaluate(()=>window.scrollTo(0,0));
await p.screenshot({path:`${OUT}/v8-detail-selected.png`,fullPage:false});console.log('selected shot');await ctx.close();
// detail mobile
ctx=await b.newContext({viewport:{width:390,height:844}});p=await ctx.newPage();
await p.goto('http://localhost:4123/contents/community/meetup-2/',{waitUntil:'networkidle'});await autoScroll(p);
await p.screenshot({path:`${OUT}/v8-detail-mobile.png`,fullPage:true});console.log('mobile shot');
await b.close();console.log('DONE');
