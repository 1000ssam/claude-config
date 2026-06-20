import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const targets = [
  { name: 'SKILLS', id: '2a169a85-43ff-46e0-976e-716421253809' },
  { name: '[LAB] Skill Package 샘플 DB', id: '6bfd8653-2069-413f-9fe2-b6a197f6d55d' },
];

for (const t of targets) {
  console.log(`\n===== ${t.name} (${t.id}) =====`);
  try {
    // retrieve DB to get properties schema (call resolves DB->DS automatically? use queryAll to get rows)
    const db = await notion.call('GET', `/databases/${t.id}`);
    const dsId = db.data_sources?.[0]?.id;
    console.log('title:', (db.title||[]).map(x=>x.plain_text).join(''));
    console.log('data_source:', dsId);
    // get DS schema
    if (dsId) {
      const ds = await notion.call('GET', `/data_sources/${dsId}`);
      console.log('--- PROPERTIES ---');
      for (const [k, v] of Object.entries(ds.properties || {})) {
        let extra = '';
        if (v.type === 'select' || v.type === 'multi_select' || v.type === 'status') {
          const opts = (v[v.type]?.options || []).map(o=>o.name);
          extra = ` [${opts.join(', ')}]`;
        }
        console.log(`  • ${k}: ${v.type}${extra}`);
      }
    }
    // sample rows
    const rows = await notion.queryAll(t.id, {});
    console.log(`--- ROWS: ${rows.length} ---`);
    for (const r of rows.slice(0, 8)) {
      const props = r.properties || {};
      const titleProp = Object.values(props).find(p => p.type === 'title');
      const title = (titleProp?.title || []).map(x=>x.plain_text).join('') || '(무제)';
      console.log(`  - ${title}  [page ${r.id}]`);
    }
  } catch (e) {
    console.error('ERR', t.name, e.message);
  }
}
