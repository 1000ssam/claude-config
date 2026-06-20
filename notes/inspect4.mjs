import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const plain = (rich) => Array.isArray(rich) ? rich.map(t=>t.plain_text).join('') : '';
// 2nd meetup carousel
const CAR = '323dd1dc-d644-80cc-ae14-000b0488e802';
const q = await notion.call('POST', `/data_sources/${CAR}/query`, { page_size: 100 });
console.log('=== Carousel DS (2nd 밋업) rows:', (q.results||[]).length, '===');
const ds = await notion.call('GET', `/data_sources/${CAR}`);
console.log('schema:', Object.entries(ds.properties||{}).map(([n,d])=>`${n}:${d.type}`).join(', '));
(q.results||[]).slice(0,3).forEach((r,i)=>{
  const cover = r.cover ? (r.cover.type==='file'?r.cover.file.url:r.cover.external?.url):null;
  const titleProp = Object.values(r.properties).find(p=>p.type==='title');
  console.log(`  row${i+1}: title="${plain(titleProp?.title)}" cover=${cover?cover.slice(0,70):'none'} files=${Object.entries(r.properties).filter(([n,p])=>p.type==='files').map(([n,p])=>n+':'+(p.files||[]).length)}`);
});
