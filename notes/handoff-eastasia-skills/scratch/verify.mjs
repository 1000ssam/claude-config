import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const md = await notion.getPageMarkdown('36ddd1dc-d644-8168-a638-cae015ed1da8');
// 이미지 URL 축약
const out = md.replace(/!\[\]\(https:\/\/[^)]+\)/g, '![](🖼️ IMG)');
console.log(out);
console.log('\n--- 검증 ---');
console.log('콜아웃 수:', (md.match(/<callout/g)||[]).length);
console.log('이미지 수:', (md.match(/!\[\]\(https/g)||[]).length);
console.log('구분선 수:', (md.match(/^---$/gm)||[]).length);
console.log('database 블록:', (md.match(/<database/g)||[]).length);
console.log('미완성 마커 <<<<:', (md.match(/[<]{3,}|[>]{3,}/g)||[]).length);
