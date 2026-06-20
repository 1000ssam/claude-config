import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const db = await notion.call('GET', '/databases/77fd16b9-ec9d-4230-9e7b-8fbdf87afcae');
console.log('4회차 DB url   :', db.url);
console.log('4회차 DB 제목  :', (db.title || []).map(t => t.plain_text).join(''));
const parent = await notion.call('GET', `/pages/${db.parent.page_id}`);
const ptitle = Object.values(parent.properties || {}).find(p => p.type === 'title');
console.log('부모 페이지명  :', (ptitle?.title || []).map(t => t.plain_text).join(''));
console.log('부모 페이지 url:', parent.url);
