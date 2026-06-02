import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

// 2차시 페이지 속성
const page = await notion.call('GET', '/pages/36ddd1dc-d644-8162-9ceb-c200f45c8d52');
console.log('=== 2차시 페이지 properties ===');
for (const [k, v] of Object.entries(page.properties)) {
  let val = '';
  if (v.type === 'title') val = v.title?.map(t=>t.plain_text).join('');
  else if (v.type === 'select') val = v.select?.name;
  else if (v.type === 'multi_select') val = v.multi_select?.map(o=>o.name).join(',');
  else if (v.type === 'rich_text') val = v.rich_text?.map(t=>t.plain_text).join('');
  else if (v.type === 'url') val = v.url;
  else val = `(${v.type})`;
  console.log(`  ${k}: [${v.type}] ${val}`);
}

// 2차시 폼 DB 스키마
console.log('\n=== 2차시 폼 DB (b1cc50f5...) ===');
const db = await notion.call('GET', '/databases/b1cc50f556c94c31a6031c72c2182139');
console.log('title:', db.title?.map(t=>t.plain_text).join(''));
console.log('is_inline:', db.is_inline);
const dsId = db.data_sources?.[0]?.id;
console.log('data_source_id:', dsId);
const ds = await notion.call('GET', `/data_sources/${dsId}`);
console.log('--- properties ---');
for (const [k, v] of Object.entries(ds.properties)) {
  let extra = '';
  if (v.type === 'select') extra = JSON.stringify(v.select?.options?.map(o=>o.name));
  if (v.type === 'multi_select') extra = JSON.stringify(v.multi_select?.options?.map(o=>o.name));
  if (v.type === 'relation') extra = JSON.stringify(v.relation);
  console.log(`  ${k}: [${v.type}] ${extra}`);
}
