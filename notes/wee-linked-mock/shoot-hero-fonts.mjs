import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const MB = 'https://cdn.jsdelivr.net/gh/fonts-archive/MaruBuri';
const fonts = [
  { key:'maruburi', fam:'Maru Buri', face:`
    @font-face{font-family:'Maru Buri';font-weight:400;src:url('${MB}/MaruBuri-Regular.woff2') format('woff2')}
    @font-face{font-family:'Maru Buri';font-weight:600;src:url('${MB}/MaruBuri-SemiBold.woff2') format('woff2')}
    @font-face{font-family:'Maru Buri';font-weight:700;src:url('${MB}/MaruBuri-Bold.woff2') format('woff2')}` },
  { key:'ridibatang', fam:'RIDIBatang', face:`
    @font-face{font-family:'RIDIBatang';font-weight:400;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/RIDIBatang/RIDIBatang.woff2') format('woff2')}` },
  { key:'noto', fam:'Noto Serif KR', link:'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap' },
  { key:'songmyung', fam:'Song Myung', link:'https://fonts.googleapis.com/css2?family=Song+Myung&display=swap' },
];
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
for (const f of fonts) {
  const ctx = await b.newContext({ viewport: { width: 1180, height: 1200 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('file://' + DIR + '/mymind-native.html', { waitUntil: 'load' });
  if (f.link) await p.evaluate((href)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);}, f.link);
  if (f.face) await p.addStyleTag({ content: f.face });
  await p.addStyleTag({ content: `:root{--serif:"${f.fam}","Nanum Myeongjo",serif !important}` });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 9000))]));
  await p.waitForTimeout(1400);
  const ok = await p.evaluate((fam)=>document.fonts.check(`600 90px "${fam}"`)||document.fonts.check(`400 90px "${fam}"`), f.fam);
  await p.screenshot({ path: `${DIR}/hero-${f.key}.png`, clip: { x:0, y:0, width:1180, height:560 } });
  console.log(`${ok?'OK ':'⚠ FALLBACK'} hero-${f.key}.png  (${f.fam})`);
  await ctx.close();
}
await b.close();
console.log('DONE');
