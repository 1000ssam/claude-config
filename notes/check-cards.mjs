import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('http://localhost:4123/contents/community/', {waitUntil:'networkidle'});
await p.waitForTimeout(500);
const cards = await p.$$eval('a[href^="/contents/community/"]', els => els.map(e => ({
  href: e.getAttribute('href'),
  text: e.querySelector('h3')?.textContent,
  opacity: getComputedStyle(e.closest('div')).opacity,
})));
console.log('cards found:', cards.length);
cards.forEach(c => console.log(' ', c.href, '|', c.text, '| wrapperOpacity=', c.opacity));
await b.close();
