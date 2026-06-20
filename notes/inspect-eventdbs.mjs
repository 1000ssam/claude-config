import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const DBS = {
  '이벤트 DB (진행중 이벤트&강의)': '323dd1dc-d644-8049-8131-fc5f2fd5de36',
  'Untitled (이벤트 갤러리)': '323dd1dc-d644-80e1-bd14-f61a49b5c968',
};

const plain = (rich) => Array.isArray(rich) ? rich.map(t=>t.plain_text).join('') : '';

function fmtProp(name, p) {
  if (!p) return `${name}=∅`;
  const t = p.type;
  let v = '';
  switch(t) {
    case 'title': v = plain(p.title); break;
    case 'rich_text': v = plain(p.rich_text); break;
    case 'select': v = p.select?.name ?? ''; break;
    case 'status': v = p.status?.name ?? ''; break;
    case 'multi_select': v = (p.multi_select||[]).map(o=>o.name).join('|'); break;
    case 'date': v = p.date?.start ?? ''; break;
    case 'url': v = p.url ?? ''; break;
    case 'checkbox': v = p.checkbox; break;
    case 'number': v = p.number ?? ''; break;
    case 'files': v = (p.files||[]).map(f=> f.type==='file'? '[file]' : '[ext]'+(f.external?.url||'')).join(','); break;
    case 'created_time': v = p.created_time; break;
    default: v = `<${t}>`;
  }
  return `${name}[${t}]=${JSON.stringify(v)}`;
}

for (const [label, id] of Object.entries(DBS)) {
  console.log('\n\n########################################');
  console.log('# ' + label);
  console.log('# id=' + id);
  console.log('########################################');
  try {
    const db = await notion.call('GET', `/databases/${id}`);
    console.log('title:', plain(db.title));
    console.log('is_inline:', db.is_inline, '| parent:', JSON.stringify(db.parent));
    const dsId = db.data_sources?.[0]?.id;
    console.log('SCHEMA:');
    for (const [n, def] of Object.entries(db.properties||{})) {
      let extra='';
      if (['select','status'].includes(def.type)) extra=' {'+(def[def.type].options||[]).map(o=>o.name).join(', ')+'}';
      if (def.type==='multi_select') extra=' {'+(def.multi_select.options||[]).map(o=>o.name).join(', ')+'}';
      console.log(`   - ${n} :: ${def.type}${extra}`);
    }
    // rows
    const q = await notion.call('POST', `/data_sources/${dsId}/query`, { page_size: 100 });
    const rows = q.results || [];
    console.log(`ROWS: ${rows.length}`);
    rows.forEach((r, i) => {
      const props = r.properties||{};
      console.log(`  --- row ${i+1} ---`);
      for (const [n, p] of Object.entries(props)) console.log('     ' + fmtProp(n, p));
    });
  } catch(e) {
    console.log('ERR:', String(e.message||e).slice(0,300));
  }
}
