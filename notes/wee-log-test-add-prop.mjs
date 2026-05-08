/**
 * 명렬표 v3 DB에 relation_id (rich_text) 속성을 직접 추가 시도.
 * - wee-log-migration 코드와 동일한 페이로드 vs API 정식 페이로드 둘 다 시도
 * - 에러 메시지 그대로 노출
 */

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const ROSTER_DB_ID = '61bdd1dc-d644-83f7-9e91-01ac3327f2f4';

(async () => {
  // 1. 먼저 data_source_id 얻기
  const db = await notion.getDatabase(ROSTER_DB_ID);
  const dsId = db.data_sources?.[0]?.id;
  console.log(`명렬표 data_source_id: ${dsId}`);
  console.log(`현재 relation_id 존재 여부: ${'relation_id' in (db.properties ?? {})}`);
  console.log('');

  // 2. wee-log 코드 페이로드 (type 필드 포함) — 이게 silently 실패한 페이로드
  console.log('## 시도 A: wee-log 코드 페이로드 ({ type: "rich_text", rich_text: {} })');
  try {
    const r = await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: {
        relation_id_test_a: { type: 'rich_text', rich_text: {} },
      },
    });
    console.log('  ✓ 성공');
    // 정리
    await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: { relation_id_test_a: null },
    });
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
  }
  console.log('');

  // 3. 정식 페이로드 (type 없이)
  console.log('## 시도 B: 정식 페이로드 ({ rich_text: {} })');
  try {
    const r = await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: {
        relation_id_test_b: { rich_text: {} },
      },
    });
    console.log('  ✓ 성공');
    // 정리
    await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: { relation_id_test_b: null },
    });
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
  }
  console.log('');

  // 4. 실제 'relation_id' 라는 이름이 가능한지 — 이 이름이 reserved일 수 있음
  console.log('## 시도 C: relation_id 라는 이름 그대로');
  try {
    const r = await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: {
        relation_id: { rich_text: {} },
      },
    });
    console.log('  ✓ 성공 — DB에 relation_id 속성이 추가됨');
    // 정리
    await notion.call('PATCH', `/data_sources/${dsId}`, {
      properties: { relation_id: null },
    });
    console.log('  (정리 완료)');
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
  }
})();
