import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const db = await notion.call('GET', '/databases/77fd16b9-ec9d-4230-9e7b-8fbdf87afcae');
console.log('top keys:', Object.keys(db).join(', '));
console.log('data_sources:', JSON.stringify(db.data_sources || null));
// 2026-03-11: properties live on the data source
const dsId = db.data_sources?.[0]?.id;
if (dsId) {
  const ds = await notion.call('GET', `/data_sources/${dsId}`);
  console.log('속성:', Object.keys(ds.properties || {}).join(', '));
  console.log('만든학습기능 옵션:', (ds.properties?.['만든학습기능']?.multi_select?.options || []).map(o => o.name).join(', '));
  console.log('이메일 타입:', ds.properties?.['이메일']?.type, '| 이름 타입:', ds.properties?.['이름']?.type);
}
