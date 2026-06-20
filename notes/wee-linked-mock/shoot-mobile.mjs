import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const URL = 'file://' + DIR + '/mymind-native.html';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });

async function shoot(w, out, { drawer = false, clip = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'load' });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
  await p.waitForTimeout(900);
  if (drawer) { await p.click('.nav-toggle'); await p.waitForTimeout(400); }
  await p.screenshot({ path: DIR + '/' + out, fullPage: !clip, clip: clip || undefined });
  console.log('shot', out, '@' + w);
  await ctx.close();
}

// 모바일 풀페이지 + 드로어 열림(상단) + 태블릿 경계 + 데스크톱 회귀
await shoot(390, 'mob-390.png');
await shoot(390, 'mob-390-menu.png', { drawer: true, clip: { x: 0, y: 0, width: 390, height: 560 } });
await shoot(768, 'mob-768.png');
await shoot(1180, 'mymind-native.png');
await b.close();
console.log('OK');
