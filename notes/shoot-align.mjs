import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:1100}})).newPage();
await p.goto('http://localhost:4123/contents/community/',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
// measure bottoms
const cta=await p.locator('div.bg-accent').first().boundingBox();
const box=await p.locator('div.border-dashed').first().boundingBox();
console.log('CTA bottom =', cta?Math.round(cta.y+cta.height):'?', '| box bottom =', box?Math.round(box.y+box.height):'?');
// screenshot the whole 2-col section
await p.locator('section').first().screenshot({path:'/mnt/c/dev/notes/community-shots/v7-section.png'});
console.log('done'); await b.close();
