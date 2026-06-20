import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const targets = [
  ['SKILLS',              '2a169a85-43ff-46e0-976e-716421253809'],
  ['[LAB] Skill Package', '6bfd8653-2069-413f-9fe2-b6a197f6d55d'],
];
for (const [name, dsId] of targets) {
  console.log(`\n===== ${name} (DS ${dsId}) =====`);
  try {
    const q = await notion.call('POST', `/data_sources/${dsId}/query`, { page_size: 25 });
    const rows = q.results || [];
    console.log('rows:', rows.length);
    for (const r of rows) {
      const props = r.properties || {};
      const tp = Object.values(props).find(p=>p.type==='title');
      const title = (tp?.title||[]).map(x=>x.plain_text).join('') || '(무제)';
      const files = Object.entries(props).find(([k,v])=>v.type==='files');
      const fileNames = files ? (files[1].files||[]).map(f=>f.name).join(', ') : '';
      const script = Object.entries(props).find(([k])=>k==='스크립트 있음');
      console.log(`  - "${title}"  [page ${r.id}]  파일:[${fileNames}]`);
    }
    // dump full body markdown of first row to learn convention
    if (rows.length) {
      console.log(`  --- 첫 행 본문(markdown) 미리보기 ---`);
      const md = await notion.getPageMarkdown(rows[0].id);
      console.log(md.split('\n').slice(0, 40).map(l=>'    '+l).join('\n'));
      console.log(`    ...(총 ${md.length}자)`);
    }
  } catch(e){ console.log('  ERR:', e.message.slice(0,120)); }
}
