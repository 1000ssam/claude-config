import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
// 1차시 폼 DB: url dd3cf31be18746aea7bc8268ebcc2ed4, DS 7fd02b35-6f8a-47ef-8527-a2e66017b6ca
const ds = await notion.call('GET', '/data_sources/7fd02b35-6f8a-47ef-8527-a2e66017b6ca');
console.log('=== DB TITLE ===');
console.log(JSON.stringify(ds.title, null, 0));
console.log('=== PROPERTIES ===');
for (const [name, def] of Object.entries(ds.properties)) {
  console.log(`\n--- ${name} (${def.type}) [id=${def.id}] ---`);
  if (def.type === 'formula') console.log('  formula:', JSON.stringify(def.formula));
  if (def.type === 'rollup') console.log('  rollup:', JSON.stringify(def.rollup));
  if (def.type === 'relation') console.log('  relation:', JSON.stringify(def.relation));
  if (def.type === 'multi_select') console.log('  options:', JSON.stringify(def.multi_select.options?.map(o=>o.name)));
}
console.log('\n=== parent ===', JSON.stringify(ds.parent));
