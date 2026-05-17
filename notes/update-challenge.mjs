import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const PAGE_ID = '2f4dd1dc-d644-8032-9726-f493073d0fcc';
const body = readFileSync('/mnt/c/dev/notes/article-challenge.md', 'utf-8');

await notion.updatePageMarkdown(PAGE_ID, body);
console.log('✓ 본문 업데이트 완료');
console.log('Page URL: https://www.notion.so/ioooss/2f4dd1dcd64480329726f493073d0fcc');
