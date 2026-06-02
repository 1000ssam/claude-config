import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

console.log('===== 1차시 PAGE PROPERTIES =====');
const page = await notion.call('GET', '/pages/36bdd1dc-d644-81aa-86d5-d78c84a6acae');
for (const [name, def] of Object.entries(page.properties)) {
  let val = '';
  if (def.type === 'title') val = def.title.map(t=>t.plain_text).join('');
  else if (def.type === 'select') val = def.select?.name;
  else if (def.type === 'multi_select') val = def.multi_select.map(o=>o.name).join(',');
  else if (def.type === 'rich_text') val = def.rich_text.map(t=>t.plain_text).join('');
  else if (def.type === 'checkbox') val = def.checkbox;
  else val = `(${def.type})`;
  console.log(`  ${name} [${def.type}]: ${val}`);
}
console.log('  page parent:', JSON.stringify(page.parent));

console.log('\n===== 워크시트 DB SCHEMA =====');
const dsList = await notion.call('GET', '/databases/2eedd1dc-d644-81ac-a004-effe85796fce');
const dsId = dsList.data_sources?.[0]?.id;
console.log('  worksheet DS id:', dsId);
const ds = await notion.call('GET', `/data_sources/${dsId}`);
for (const [name, def] of Object.entries(ds.properties)) {
  let extra = '';
  if (def.type === 'select') extra = ' opts=' + JSON.stringify(def.select.options.map(o=>o.name));
  if (def.type === 'multi_select') extra = ' opts=' + JSON.stringify(def.multi_select.options.map(o=>o.name));
  console.log(`  ${name} [${def.type}]${extra}`);
}
