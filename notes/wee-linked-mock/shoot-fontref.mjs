import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 1400 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('file://' + DIR + '/font-references.html', { waitUntil: 'load' });
await p.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 9000))]));
await p.waitForTimeout(1500);
// 폴백 검증: 각 패밀리가 실제 로드됐는지
const fams = ['Diphylleia','Maru Buri','RIDIBatang','Noto Serif KR','Hahmlet','Song Myung','Gowun Batang','Nanum Myeongjo'];
const checks = await p.evaluate((fams) => fams.map(f => ({
  f, ok: document.fonts.check(`700 90px "${f}"`) || document.fonts.check(`400 90px "${f}"`)
})), fams);
console.log('=== 폰트 로드 검증 ===');
checks.forEach(c => console.log(`  ${c.ok ? 'OK ' : '⚠ FALLBACK'} ${c.f}`));
await p.screenshot({ path: DIR + '/font-references.png', fullPage: true });
await b.close();
console.log('OK · saved font-references.png');
