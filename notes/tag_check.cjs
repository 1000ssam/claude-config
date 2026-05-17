const fs = require('fs');
const orig = fs.readFileSync('G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/2026학년도 개인정보 수집·이용 동의서 가정통신문.xml', 'utf-8');
const mod = fs.readFileSync('C:/dev/notes/개인정보동의서_보강.xml', 'utf-8');

function countStr(h, n) {
  let c = 0, p = 0;
  while ((p = h.indexOf(n, p)) !== -1) { c++; p += n.length; }
  return c;
}

const tags = ['<P ', '</P>', '<TEXT ', '</TEXT>', '<CHAR>', '</CHAR>', '<CHAR/>', '<ROW>', '</ROW>', '<CELL ', '</CELL>', '<TABLE ', '</TABLE>', '<PARALIST', '</PARALIST>'];

tags.forEach(tag => {
  const o = countStr(orig, tag);
  const m = countStr(mod, tag);
  const d = m - o;
  const label = d === 0 ? 'OK' : (d > 0 ? '+' + d : '' + d);
  console.log(tag.trim(), ':', o, '->', m, label);
});
