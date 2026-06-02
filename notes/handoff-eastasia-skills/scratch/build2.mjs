import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const pageId = '36ddd1dc-d644-8168-a638-cae015ed1da8';
const STUDENT_DS = '2eedd1dc-d644-81b7-814d-000b7c0ba6e2'; // 학생 명렬표 DS

const props = {
  '제출 제목': { title: {} },
  '2025 5월학평 8번': { rich_text: {} },
  '2025 9월모평 8번': { rich_text: {} },
  '2023 9월모평 15번': { rich_text: {} },
  '2024 수능 6번': { rich_text: {} },
  '2025 3월학평 13번': { rich_text: {} },
  '2025 7월학평 8번': { rich_text: {} },
  '2024 9월모평 12번': { rich_text: {} },
  '관련 학생': { relation: { data_source_id: STUDENT_DS, type: 'single_property', single_property: {} } },
  '주제': { multi_select: { options: [{ name: '08. 교역망의 발달과 은 유통' }] } },
  '답안 메모': { rich_text: {} },
};

const db = await notion.createDatabase(
  pageId,
  '동아시아사_08. 교역망의 발달과 은 유통 (3차시)_기출문제 답 입력',
  '📝',
  props,
);
console.log('DB_ID=', db.id);
console.log('DS_ID=', db.data_source_id);
console.log('속성:', Object.keys(db.properties || {}).join(', '));
