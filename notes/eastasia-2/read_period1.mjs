import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const md = await notion.getPageMarkdown('36bdd1dc-d644-81aa-86d5-d78c84a6acae');
console.log(md);
