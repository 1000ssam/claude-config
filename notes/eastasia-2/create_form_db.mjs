import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const ROSTER_DS = '2eedd1dc-d644-81b7-814d-000b7c0ba6e2'; // 학생 명렬표 data_source

// (헤딩/구분선은 직전 실행에서 이미 삽입됨 — 재삽입하지 않음)

// 폼 DB 생성 (1차시 구조 복제: 문항별 rich_text + 관련학생 relation + 주제 multi_select)
const props = {
  '제출 제목': { title: {} },
  '관련 학생': { relation: { data_source_id: ROSTER_DS, single_property: {} } },
  '주제': { multi_select: { options: [{ name: '08. 교역망의 발달과 은 유통' }] } },
  '2023 6월모평 12번': { rich_text: {} },
  '2025 5월학평 14번': { rich_text: {} },
  '2025 7월학평 14번': { rich_text: {} },
  '2025 9월모평 12번': { rich_text: {} },
  '2025 10월학평 11번': { rich_text: {} },
  '답안 메모': { rich_text: {} },
};

const db = await notion.createDatabase(
  PAGE,
  '동아시아사_08. 교역망의 발달과 은 유통 (2차시)_기출문제 답 입력',
  '📝',
  props,
);
console.log('FORM_DB_ID=' + db.id);

// 3) 검증
const dsId = db.data_sources?.[0]?.id;
console.log('FORM_DS_ID=' + dsId);
const ds = await notion.call('GET', `/data_sources/${dsId}`);
console.log('TITLE=' + ds.title.map(t => t.plain_text).join(''));
for (const [name, def] of Object.entries(ds.properties)) {
  let extra = '';
  if (def.type === 'relation') extra = ' -> ' + JSON.stringify(def.relation);
  if (def.type === 'multi_select') extra = ' opts=' + JSON.stringify(def.multi_select.options.map(o => o.name));
  console.log(`  ${name} [${def.type}]${extra}`);
}
