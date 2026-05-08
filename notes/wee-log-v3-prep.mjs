/**
 * V3 10개 DB에 relation_id (rich_text) 속성을 미리 박는다.
 * - 이미 있으면 그대로 둠 (idempotent)
 * - wee-log 마이그레이션의 ensureRelationIdProperty 우회용
 */

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const TARGETS = [
  { title: '자료실', id: '749dd1dc-d644-8365-be1c-01f5be4a741f' },
  { title: '명렬표', id: '61bdd1dc-d644-83f7-9e91-01ac3327f2f4' },
  { title: '연계 기관', id: '8c1dd1dc-d644-8369-a705-0158318c5d70' },
  { title: '사례 관리', id: 'dd2dd1dc-d644-8287-93d3-01e9b8704c9c' },
  { title: '사례 관련 할 일', id: 'cdadd1dc-d644-8290-9c84-0122b08abcd0' },
  { title: '수업 및 동아리 할 일', id: 'a57dd1dc-d644-8298-b130-01ed14526fe3' },
  { title: '행사 및 기타 할 일', id: '601dd1dc-d644-837b-b1f8-012433a5e640' },
  { title: '누가 기록', id: '885dd1dc-d644-83e2-948c-01a491dcd608' },
  { title: '보고서 리소스', id: 'ca0dd1dc-d644-83a8-84c2-01a99115ecdb' },
  { title: '보고서', id: '060dd1dc-d644-8370-87bb-01172899c6cd' },
];

(async () => {
  for (const t of TARGETS) {
    try {
      const db = await notion.getDatabase(t.id);
      const dsId = db.data_sources?.[0]?.id;
      if (!dsId) {
        console.log(`✗ ${t.title}: data_source_id 없음`);
        continue;
      }
      // 현재 스키마 조회
      const ds = await notion.call('GET', `/data_sources/${dsId}`);
      const exists = 'relation_id' in (ds.properties ?? {});
      if (exists) {
        console.log(`= ${t.title}: 이미 relation_id 있음 (skip)`);
        continue;
      }
      // 추가
      await notion.call('PATCH', `/data_sources/${dsId}`, {
        properties: { relation_id: { rich_text: {} } },
      });
      console.log(`✓ ${t.title}: relation_id 추가 완료`);
    } catch (e) {
      console.log(`✗ ${t.title}: ${e.message}`);
    }
  }
})();
