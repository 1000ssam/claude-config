const fs = require('fs');
const orig = fs.readFileSync('G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/2026학년도 개인정보 수집·이용 동의서 가정통신문.xml', 'utf-8');
const mod = fs.readFileSync('C:/dev/notes/개인정보동의서_보강.xml', 'utf-8');

const tags = ['<P ', '</P>', '<TEXT ', '</TEXT>', '<CHAR>', '</CHAR>', '<CHAR/>', '<ROW>', '</ROW>', '<CELL ', '</CELL>', '<TABLE ', '</TABLE>', '<PARALIST', '</PARALIST>'];

tags.forEach(tag => {
  const escaped = tag.replace(/[.*+?^${}()|[\]\]/g, '\$&');
  const origCount = (orig.match(new RegExp(escaped, 'g')) || []).length;
  const modCount = (mod.match(new RegExp(escaped, 'g')) || []).length;
  const diff = modCount - origCount;
  if (diff !== 0) {
    console.log(tag.trim(), ':', origCount, '->', modCount, '(diff:', (diff > 0 ? '+' : '') + diff + ')');
  } else {
    console.log(tag.trim(), ':', origCount, '== OK');
  }
});
