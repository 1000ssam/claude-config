import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const plain = (rich) => Array.isArray(rich) ? rich.map(t=>t.plain_text).join('') : '';
const PAGE = '2f4dd1dc-d644-800b-ac0c-c4d40a94cbd6';
const EVENT_DS = '323dd1dc-d644-80ad-bb2a-000b0a2d5296';

// 1) community page properties
const page = await notion.call('GET', `/pages/${PAGE}`);
console.log('=== COMMUNITY PAGE PROPS ===');
for (const [n, p] of Object.entries(page.properties||{})) {
  let v='';
  if (p.type==='title') v=plain(p.title);
  else if (p.type==='rich_text') v=plain(p.rich_text);
  else if (p.type==='select') v=p.select?.name??'';
  else if (p.type==='checkbox') v=p.checkbox;
  else if (p.type==='url') v=p.url??'';
  else v='<'+p.type+'>';
  console.log(`  ${n} [${p.type}] = ${JSON.stringify(v)}`);
}

// 2) community page body markdown (captures CTA link target)
console.log('\n=== COMMUNITY PAGE MARKDOWN ===');
try {
  const md = await notion.getPageMarkdown(PAGE);
  console.log(md.slice(0, 1500));
} catch(e){ console.log('md err', e.message); }

// 3) event rows: cover/icon + body
console.log('\n\n=== EVENT ROWS DETAIL ===');
const q = await notion.call('POST', `/data_sources/${EVENT_DS}/query`, { page_size: 100 });
for (const r of (q.results||[])) {
  const title = plain(r.properties['제목']?.title);
  const cover = r.cover ? (r.cover.type==='file'? r.cover.file.url : r.cover.external?.url) : null;
  const icon = r.icon ? (r.icon.type==='emoji'? r.icon.emoji : (r.icon.file?.url||r.icon.external?.url)) : null;
  console.log(`\n• ${title}`);
  console.log(`   cover: ${cover ? cover.slice(0,90)+'...' : 'NONE'}`);
  console.log(`   icon: ${icon || 'none'} | publish=${r.properties['publish']?.checkbox} | 상태=${r.properties['상태']?.select?.name||''} | 날짜=${r.properties['날짜']?.date?.start||''}`);
  // body
  try {
    const md = await notion.getPageMarkdown(r.id);
    const body = md.trim();
    console.log(`   body(${body.length} chars): ${body.slice(0,200).replace(/\n/g,' ⏎ ')}`);
  } catch(e){ console.log('   body err', e.message); }
}
