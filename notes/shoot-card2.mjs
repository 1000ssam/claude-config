import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('http://localhost:4123/contents/community/',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
const card=p.locator('div.bg-accent').first();
const box=await card.boundingBox();
console.log('CTA card height =', box ? Math.round(box.height)+'px (was ~228px)' : 'NOT FOUND');
await card.screenshot({path:'/mnt/c/dev/notes/community-shots/v6b-cta-card.png'});
// also left column full
await p.locator('div.lg\\:col-span-5').first().screenshot({path:'/mnt/c/dev/notes/community-shots/v6b-leftcol.png'});
console.log('done'); await b.close();
