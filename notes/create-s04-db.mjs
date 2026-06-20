import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const S03_DB = 'a1c0ce36-7550-493d-8416-b30bebb30950';

// 1) s03 DB의 부모 페이지(RESOURCES > AI 동아리) 찾기
const s03 = await notion.call('GET', `/databases/${S03_DB}`);
console.log('s03 parent:', JSON.stringify(s03.parent));
const parentPageId = s03.parent?.page_id;
if (!parentPageId) { console.error('부모 page_id 없음'); process.exit(1); }

// 2) 4회차 DB 생성 (같은 부모 하위)
const props = {
  '이름': { title: {} },
  '이메일': { email: {} },
  '공부주제단원': { rich_text: {} },
  '만든학습기능': { multi_select: { options: [
    { name: '플래시카드', color: 'orange' },
    { name: '퀴즈', color: 'yellow' },
    { name: '학습 가이드', color: 'blue' },
    { name: '오디오 오버뷰', color: 'green' },
    { name: '비디오 오버뷰', color: 'purple' },
    { name: '마인드맵', color: 'pink' },
    { name: '기타', color: 'gray' },
  ] } },
  'AI자료검수': { rich_text: {} },
  '친구자료소감': { rich_text: {} },
  '다음에만들것': { rich_text: {} },
};

const db = await notion.createDatabase(parentPageId, 'AI 동아리 4회차 NotebookLM 학습자료 갈무리', '📚', props);
console.log('NEW_DB_ID=' + db.id);
