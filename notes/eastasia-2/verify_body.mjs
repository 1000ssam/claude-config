import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const md = await notion.getPageMarkdown('36ddd1dc-d644-8162-9ceb-c200f45c8d52');
console.log(md);
