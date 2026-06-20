import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('http://localhost:4123/contents/community/', {waitUntil:'networkidle'});
// thorough slow scroll
await p.evaluate(async () => {
  for (let y=0; y<=document.body.scrollHeight; y+=300){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,120)); }
  window.scrollTo(0, document.body.scrollHeight);
});
await p.waitForTimeout(1500);
const op = await p.$$eval('a[href^="/contents/community/"]', els=>els.map(e=>({t:e.querySelector('h3')?.textContent, o:getComputedStyle(e.closest('div')).opacity})));
op.forEach(c=>console.log(c.o, c.t));
// screenshot bottom gallery region
await p.screenshot({path:'/mnt/c/dev/notes/community-shots/01b-gallery-region.png', fullPage:true});
await b.close();
