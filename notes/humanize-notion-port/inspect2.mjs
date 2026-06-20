import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

// Re-search and capture object type + raw shape
const res = await notion.search('SKILLS', { filter: 'database' });
const arr = res.results || res || [];
console.log('raw search count:', arr.length);
for (const d of arr.slice(0,3)) {
  console.log('--- sample raw object keys:', Object.keys(d).join(','));
  console.log('    object:', d.object, ' id:', d.id, ' parent:', JSON.stringify(d.parent));
}

const candidates = [
  ['SKILLS',                 '2a169a85-43ff-46e0-976e-716421253809'],
  ['[LAB] Skill Package',    '6bfd8653-2069-413f-9fe2-b6a197f6d55d'],
  ['[샘플] SKILLS DB (a)',   'd5ddd1dc-d644-82d7-af7d-07ac1a5d08c6'],
  ['[샘플] SKILLS DB (b)',   '360dd1dc-d644-8111-be1f-000bfc849896'],
  ['[샘플] SKILLS DB (c)',   'ccedd1dc-d644-830f-bf58-07d6e756975d'],
];

for (const [name, id] of candidates) {
  console.log(`\n===== ${name} =====`);
  let schemaProps = null, objType = null;
  // try as data_source first
  try {
    const ds = await notion.call('GET', `/data_sources/${id}`);
    objType = 'data_source'; schemaProps = ds.properties;
  } catch (e1) {
    try {
      const db = await notion.call('GET', `/databases/${id}`);
      objType = 'database';
      const dsId = db.data_sources?.[0]?.id;
      if (dsId) { const ds = await notion.call('GET', `/data_sources/${dsId}`); schemaProps = ds.properties; }
    } catch (e2) {
      console.log('  inaccessible:', e1.message.slice(0,60), '||', e2.message.slice(0,60));
      continue;
    }
  }
  console.log('  objType:', objType);
  if (schemaProps) {
    for (const [k,v] of Object.entries(schemaProps)) {
      let extra='';
      if (['select','multi_select','status'].includes(v.type))
        extra=` [${(v[v.type]?.options||[]).map(o=>o.name).join(', ')}]`;
      console.log(`    • ${k}: ${v.type}${extra}`);
    }
  }
  try {
    const rows = await notion.queryAll(id, {});
    console.log(`  ROWS: ${rows.length}`);
    for (const r of rows.slice(0,6)) {
      const tp = Object.values(r.properties||{}).find(p=>p.type==='title');
      console.log('    -', (tp?.title||[]).map(x=>x.plain_text).join('')||'(무제)');
    }
  } catch(e){ console.log('  query err:', e.message.slice(0,60)); }
}
