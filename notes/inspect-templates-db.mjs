import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';

// 1) DB 스키마 가져오기
const db = await notion.call('GET', `/databases/${TEMPLATES_DB}`);
const dsId = db.data_sources?.[0]?.id;
console.log('DS ID:', dsId);

// 2) DS 스키마 (속성 목록)
const ds = await notion.call('GET', `/data_sources/${dsId}`);
console.log('\n=== Properties ===');
for (const [name, prop] of Object.entries(ds.properties)) {
  let extra = '';
  if (prop.type === 'relation') {
    extra = ` → DB: ${prop.relation?.database_id || prop.relation?.data_source_id}`;
  }
  console.log(`- ${name} (${prop.type})${extra}`);
}

// 3) 기존 페이지 1개 샘플 (Author 릴레이션 타겟 ID 확인용)
const pages = await notion.call('POST', `/data_sources/${dsId}/query`, { page_size: 3 });
console.log('\n=== Sample pages ===');
for (const p of pages.results) {
  const titleProp = Object.values(p.properties).find(x => x.type === 'title');
  const title = titleProp?.title?.[0]?.plain_text || '(no title)';
  const author = p.properties.Author?.relation?.[0]?.id || 'N/A';
  console.log(`- ${title} | Author: ${author} | id: ${p.id}`);
}
