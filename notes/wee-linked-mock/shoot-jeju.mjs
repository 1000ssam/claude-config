import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 1200 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('file://' + DIR + '/mymind-native.html', { waitUntil: 'load' });
await p.evaluate(()=>{const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Jeju+Myeongjo&display=swap';document.head.appendChild(l);});
// 제주명조 적용 + 장평/자간 웹 일반 규격으로 복원
await p.addStyleTag({ content: `
  :root{--serif:"Jeju Myeongjo","Nanum Myeongjo",serif !important}
  .hero h1{transform:none !important;letter-spacing:-0.02em !important;line-height:1.12 !important;font-weight:400 !important}
` });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 9000))]));
await p.waitForTimeout(1400);
const ok = await p.evaluate(()=>document.fonts.check('400 90px "Jeju Myeongjo"'));
await p.screenshot({ path: DIR + '/hero-jeju.png', clip: { x:0, y:0, width:1180, height:580 } });
await p.screenshot({ path: DIR + '/jeju-full.png', fullPage: true });
console.log(`${ok?'OK':'⚠ FALLBACK'}  hero-jeju.png + jeju-full.png`);
await b.close();
