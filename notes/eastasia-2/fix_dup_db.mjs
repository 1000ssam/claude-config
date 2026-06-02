import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const GOOD_DB = '65273449-602a-470d-820f-c2d1393c32df'; // 두 번째(정상) 생성분

const res = await notion.call('GET', `/blocks/${PAGE}/children?page_size=200`);
const dbBlocks = res.results.filter(b => b.type === 'child_database');
console.log('child_database 블록 수:', dbBlocks.length);

for (const b of dbBlocks) {
  // child_database 블록 id == database id
  const dbId = b.id;
  let propNames = [];
  try {
    const dbMeta = await notion.call('GET', `/databases/${dbId}`);
    const dsId = dbMeta.data_sources?.[0]?.id;
    const ds = await notion.call('GET', `/data_sources/${dsId}`);
    propNames = Object.keys(ds.properties);
  } catch (e) { propNames = ['(err ' + e.status + ')']; }
  const isGood = dbId === GOOD_DB || propNames.includes('2023 6월모평 12번');
  console.log(`\nblock ${dbId} good=${isGood} props(${propNames.length}): ${propNames.join(', ')}`);
  if (!isGood) {
    // 고아 DB → 블록 삭제(=DB 휴지통)
    await notion.call('DELETE', `/blocks/${dbId}`);
    console.log('  -> DELETED (orphan)');
  }
}
console.log('\nDONE');
