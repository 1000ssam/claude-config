import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const PAGE_ID = '2f4dd1dc-d644-8064-ab39-f4a142c2d26b';
const body = readFileSync('/mnt/c/dev/notes/article-group-reading.md', 'utf-8');

const newPostTitle = '그룹 독서 모임 일지 노션 템플릿 - 학급 독서 토론·개인 일지 통합 관리';
const newMetaTitle = '그룹 독서 모임 일지 - 학급 독서 토론 노션 템플릿 | 노션톡';
const newMetaDesc = '학생 독서 기록과 토론을 따로 관리하시나요? 명렬표·그룹 토론·개인 일지 3개 DB로 학급 독서 모임을 한 곳에 정리하는 무료 노션 템플릿입니다.';

await notion.call('PATCH', `/pages/${PAGE_ID}`, {
  properties: {
    'Post Title': { title: [{ text: { content: newPostTitle } }] },
    'Meta Title': { rich_text: [{ text: { content: newMetaTitle } }] },
    'Meta Description': { rich_text: [{ text: { content: newMetaDesc } }] },
  },
});
console.log('✓ 메타 갱신 완료');
console.log(`  Post Title: ${newPostTitle}`);
console.log(`  Meta Title (${newMetaTitle.length}자)`);
console.log(`  Meta Desc (${newMetaDesc.length}자)`);

await notion.updatePageMarkdown(PAGE_ID, body);
console.log('✓ 본문 업데이트 완료');

console.log('\nPage URL: https://www.notion.so/ioooss/2f4dd1dcd6448064ab39f4a142c2d26b');
