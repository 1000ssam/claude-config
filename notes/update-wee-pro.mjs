import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const PAGE_ID = '2f4dd1dc-d644-8098-b5da-ea59e294c4f4';
const body = readFileSync('/mnt/c/dev/notes/article-wee-pro.md', 'utf-8');

// Meta Description 오타 수정 ("흔어져" → "흩어져")
const newMetaDesc = '위클래스 상담 기록·관리 파일이 너무 흩어져 있나요? 상담 일지·주간 활동 계획·대장까지 한 페이지에 담은 Wee Class Pro 2.0으로 상담 흐름을 정리하세요.';

await notion.call('PATCH', `/pages/${PAGE_ID}`, {
  properties: {
    'Meta Description': { rich_text: [{ text: { content: newMetaDesc } }] },
  },
});
console.log('✓ Meta Description 오타 수정 완료');

// 본문 업데이트
await notion.updatePageMarkdown(PAGE_ID, body);
console.log('✓ 본문 업데이트 완료');

console.log('\nPage URL: https://www.notion.so/ioooss/Wee-Class-Pro-2-0-2f4dd1dcd6448098b5daea59e294c4f4');
