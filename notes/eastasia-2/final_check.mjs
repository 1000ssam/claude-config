import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const FORM_DS = (await notion.call('GET', '/databases/b1cc50f5-56c9-4c31-a603-1c72c2182139')).data_sources[0].id;
const ds = await notion.call('GET', `/data_sources/${FORM_DS}`);
const props = Object.entries(ds.properties);
console.log('폼 DB 속성 ' + props.length + '개:');
for (const [n, d] of props) {
  let x = '';
  if (d.type === 'relation') x = ' ' + d.relation.type;
  if (d.type === 'multi_select') x = ' ' + JSON.stringify(d.multi_select.options.map(o=>o.name));
  console.log(`  ${n} [${d.type}]${x}`);
}
// 명렬표 역방향 속성 생성 안 됐는지 확인
const roster = await notion.call('GET', '/data_sources/2eedd1dc-d644-81b7-814d-000b7c0ba6e2');
const backrefs = Object.entries(roster.properties).filter(([n,d]) => d.type==='relation');
console.log('\n명렬표 relation 속성:', backrefs.map(([n])=>n).join(', ') || '(없음)');
