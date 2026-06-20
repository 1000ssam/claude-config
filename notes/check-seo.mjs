import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const plain=(r)=>Array.isArray(r)?r.map(t=>t.plain_text).join(''):'';
// 1) community PAGE (bullet pages DB) meta properties
const PAGE='2f4dd1dc-d644-800b-ac0c-c4d40a94cbd6';
const page=await notion.call('GET',`/pages/${PAGE}`);
console.log('=== COMMUNITY PAGE (bullet pages DB) META PROPS ===');
for(const [n,p] of Object.entries(page.properties||{})){
  let v=''; if(p.type==='title')v=plain(p.title); else if(p.type==='rich_text')v=plain(p.rich_text); else if(p.type==='select')v=p.select?.name??''; else if(p.type==='checkbox')v=p.checkbox; else if(p.type==='url')v=p.url??''; else v='<'+p.type+'>';
  console.log(`  ${n} [${p.type}] = ${JSON.stringify(v)}`);
}
// 2) 이벤트 DB schema — any meta props?
console.log('\n=== 이벤트 DB SCHEMA (per-event meta?) ===');
const ds=await notion.call('GET','/data_sources/323dd1dc-d644-80ad-bb2a-000b0a2d5296');
for(const [n,d] of Object.entries(ds.properties||{})) console.log(`  - ${n} :: ${d.type}`);
