import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
// 2차시 페이지 (본보기)
const pageId = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const md = await notion.getPageMarkdown(pageId);
console.log(md);
