import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const ID = '2f4dd1dcd644800bac0cc4d40a94cbd6';

async function tryGet(label, fn) {
  try { return { ok: true, label, data: await fn() }; }
  catch (e) { return { ok: false, label, err: String(e.message || e).slice(0, 200) }; }
}

const asPage = await tryGet('page', () => notion.call('GET', `/pages/${ID}`));
const asDb   = await tryGet('database', () => notion.call('GET', `/databases/${ID}`));

console.log('=== IS PAGE? ===', asPage.ok);
if (asPage.ok) {
  const p = asPage.data;
  console.log('page object:', p.object, '| parent:', JSON.stringify(p.parent));
  console.log('page props:', Object.keys(p.properties || {}));
}
console.log('\n=== IS DATABASE? ===', asDb.ok);
if (asDb.ok) {
  const d = asDb.data;
  console.log('title:', (d.title || []).map(t=>t.plain_text).join(''));
  console.log('data_sources:', JSON.stringify(d.data_sources));
  console.log('PROPERTIES:');
  for (const [name, def] of Object.entries(d.properties || {})) {
    let extra = '';
    if (def.type === 'select' || def.type === 'status') extra = ' opts=[' + (def[def.type].options||[]).map(o=>o.name).join(', ') + ']';
    if (def.type === 'multi_select') extra = ' opts=[' + (def.multi_select.options||[]).map(o=>o.name).join(', ') + ']';
    console.log(`  - ${name} :: ${def.type}${extra}`);
  }
} else {
  console.log('db err:', asDb.err);
}

// If it's a page, list child blocks to find embedded databases
if (asPage.ok) {
  const kids = await notion.call('GET', `/blocks/${ID}/children?page_size=100`);
  console.log('\n=== CHILD BLOCKS (', (kids.results||[]).length, ') ===');
  for (const b of (kids.results||[])) {
    let t = b.type;
    let label = '';
    if (b[t]?.rich_text) label = b[t].rich_text.map(r=>r.plain_text).join('');
    if (t === 'child_database') label = b.child_database?.title || '';
    if (t === 'child_page') label = b.child_page?.title || '';
    console.log(`  [${t}] ${label}  ${t.includes('database')||t.includes('page')? '(id='+b.id+')':''}`);
  }
}
