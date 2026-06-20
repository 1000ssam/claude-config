import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const plain = (rich) => Array.isArray(rich) ? rich.map(t=>t.plain_text).join('') : '';

const DBS = {
  'DB1 이벤트DB': '323dd1dc-d644-8049-8131-fc5f2fd5de36',
  'DB2 갤러리': '323dd1dc-d644-80e1-bd14-f61a49b5c968',
};

function schemaOf(props) {
  for (const [n, def] of Object.entries(props||{})) {
    let extra='';
    if (['select','status'].includes(def.type)) extra=' {'+(def[def.type].options||[]).map(o=>o.name).join(', ')+'}';
    if (def.type==='multi_select') extra=' {'+(def.multi_select.options||[]).map(o=>o.name).join(', ')+'}';
    console.log(`   - ${n} :: ${def.type}${extra}`);
  }
}

for (const [label, id] of Object.entries(DBS)) {
  console.log('\n=== ' + label + ' (id=' + id + ') ===');
  const db = await notion.call('GET', `/databases/${id}`);
  console.log('title:', plain(db.title), '| is_inline:', db.is_inline);
  console.log('data_sources:', JSON.stringify(db.data_sources));
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) { console.log('NO DATA SOURCE → likely linked view. raw keys:', Object.keys(db)); continue; }
  const ds = await notion.call('GET', `/data_sources/${dsId}`);
  console.log('--- data_source schema ---');
  schemaOf(ds.properties);
}
