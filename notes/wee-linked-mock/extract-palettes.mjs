import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync } from 'node:fs';
const { chromium } = pw;
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const files = ['headspace','trevor','breathwrk','enerjoy','unwind','mymind','lifer','facetune','katrine','oatly','mozi','canva','figma'];

const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
const p = await (await b.newContext()).newPage();
await p.goto('file://' + DIR + '/palette-preview.html');  // 같은 출처(file://) 확보 → refs/*.png 로드 가능
const out = {};

for (const f of files) {
 try {
  const buckets = await p.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const W = 110, H = Math.max(1, Math.round(W * img.height / img.width));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    const map = new Map();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue;
      const qr = Math.round(d[i] / 22) * 22, qg = Math.round(d[i + 1] / 22) * 22, qb = Math.round(d[i + 2] / 22) * 22;
      const k = qr + ',' + qg + ',' + qb;
      map.set(k, (map.get(k) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).map(e => e[0]);
  }, 'file://' + DIR + '/refs/' + f + '.png');

  const toRGB = s => s.split(',').map(Number);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const picks = [];
  for (const k of buckets) {
    const rgb = toRGB(k).map(v => Math.min(255, v));
    if (picks.every(pp => dist(pp, rgb) > 38)) picks.push(rgb);
    if (picks.length >= 6) break;
  }
  out[f] = picks.map(([r, g, bl]) => '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join(''));
  console.log(f.padEnd(11), out[f].join('  '));
 } catch (e) {
  out[f] = [];
  console.log(f.padEnd(11), 'SKIP', e.message.slice(0, 40));
 }
}
await b.close();
writeFileSync(DIR + '/palettes.js', 'window.PALETTES=' + JSON.stringify(out) + ';');
console.log('WROTE palettes.js');
