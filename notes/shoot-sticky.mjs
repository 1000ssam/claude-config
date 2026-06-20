import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const OUT='/mnt/c/dev/notes/community-shots';
const b=await chromium.launch();
// 1) full page, all 4 active
let ctx=await b.newContext({viewport:{width:1440,height:900}});
let p=await ctx.newPage();
await p.goto('http://localhost:4123/contents/community/',{waitUntil:'networkidle'});
await p.evaluate(async()=>{for(let y=0;y<=document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);});
await p.waitForTimeout(700);
await p.screenshot({path:`${OUT}/v3active-full.png`,fullPage:true});
// 2) sticky proof: short viewport, scroll down, capture viewport (hero should stay pinned)
await ctx.close();
ctx=await b.newContext({viewport:{width:1440,height:680}});
p=await ctx.newPage();
await p.goto('http://localhost:4123/contents/community/',{waitUntil:'networkidle'});
await p.evaluate(()=>window.scrollTo(0,360));
await p.waitForTimeout(600);
await p.screenshot({path:`${OUT}/v3active-scrolled.png`,fullPage:false});
console.log('done');
await b.close();
