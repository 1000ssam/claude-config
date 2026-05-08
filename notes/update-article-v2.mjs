import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const PAGE_ID = '355dd1dc-d644-8117-8a6b-d6f05c9266bb';
const body = readFileSync('/mnt/c/dev/notes/article-body-v2.md', 'utf-8');

await notion.updatePageMarkdown(PAGE_ID, body);
console.log('v2 본문 덮어쓰기 완료');
console.log('URL: https://www.notion.so/AI-LITE-355dd1dcd64481178a6bd6f05c9266bb');
