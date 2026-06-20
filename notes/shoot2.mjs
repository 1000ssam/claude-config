import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const OUT = '/mnt/c/dev/notes/community-shots';
const base = 'http://localhost:4123';
const browser = await chromium.launch();
async function autoScroll(page){await page.evaluate(async()=>{for(let y=0;y<=document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}window.scrollTo(0,0);});await page.waitForTimeout(800);}
async function shot(name,url,vw,vh){const ctx=await browser.newContext({viewport:{width:vw,height:vh}});const p=await ctx.newPage();await p.goto(base+url,{waitUntil:'networkidle'});await autoScroll(p);await p.screenshot({path:`${OUT}/${name}.png`,fullPage:true});console.log('shot',name);await ctx.close();}
const tag = process.argv[2] || 'v2';
await shot(`${tag}-list-desktop`,'/contents/community/',1440,1000);
await shot(`${tag}-list-mobile`,'/contents/community/',390,844);
await browser.close();console.log('DONE');
