import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const id = '381dd1dc-d644-81ef-ba96-caac5a415fa6';
const p = await notion.call('GET', `/pages/${id}`);
console.log('=== 속성 검증 ===');
for (const [k,v] of Object.entries(p.properties||{})) {
  let val='';
  if (v.type==='title') val=(v.title||[]).map(x=>x.plain_text).join('');
  else if (v.type==='rich_text') val=(v.rich_text||[]).map(x=>x.plain_text).join('').slice(0,60)+'…';
  else if (v.type==='status') val=v.status?.name;
  else if (v.type==='checkbox') val=v.checkbox;
  else if (v.type==='files') val=(v.files||[]).map(f=>`${f.name} (${f.type})`).join(', ');
  else continue;
  console.log(`  ${k}: ${JSON.stringify(val)}`);
}
console.log('\n=== 본문 markdown 라운드트립 ===');
const md = await notion.getPageMarkdown(id);
console.log(md);
