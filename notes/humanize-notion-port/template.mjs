import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const pageId = '378dd1dc-d644-810a-a3bb-f6a95ae3e5f2'; // ppt-lab skill row
const page = await notion.call('GET', `/pages/${pageId}`);
console.log('===== PROPERTIES =====');
for (const [k,v] of Object.entries(page.properties||{})) {
  let val='';
  if (v.type==='title') val=(v.title||[]).map(x=>x.plain_text).join('');
  else if (v.type==='rich_text') val=(v.rich_text||[]).map(x=>x.plain_text).join('');
  else if (v.type==='status') val=v.status?.name;
  else if (v.type==='select') val=v.select?.name;
  else if (v.type==='multi_select') val=(v.multi_select||[]).map(o=>o.name).join(', ');
  else if (v.type==='checkbox') val=v.checkbox;
  else if (v.type==='files') val=JSON.stringify((v.files||[]).map(f=>({name:f.name,type:f.type})));
  else val=`(${v.type})`;
  console.log(`  ${k}: ${JSON.stringify(val)}`);
}
console.log('\n===== BODY (full markdown) =====');
const md = await notion.getPageMarkdown(pageId);
console.log(md);
