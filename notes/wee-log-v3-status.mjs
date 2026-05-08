/**
 * V3 DB 현재 상태 점검: 각 DB의 비-archive 페이지 수와 relation_id 보유 비율.
 * - relation_id 없는 페이지가 있다면 마이그레이션이 도중에 끊겼거나 사용자가 직접 만든 것
 */

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

// dry-run에서 매칭된 10개 DB의 block id (linked view 제외)
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
  console.log('V3 DB 현재 상태 (archive 제외)');
  console.log('─────────────────────────────────────────────────────────');
  console.log('DB                        총   relation_id있음  없음');
  console.log('─────────────────────────────────────────────────────────');

  for (const t of TARGETS) {
    try {
      const pages = await notion.queryAll(t.id);
      let withRel = 0;
      let withoutRel = 0;
      for (const p of pages) {
        const r = p.properties?.relation_id;
        const has = r?.type === 'rich_text' && r.rich_text?.length > 0;
        if (has) withRel++;
        else withoutRel++;
      }
      const tag = withoutRel > 0 ? '⚠' : ' ';
      console.log(
        `${tag} ${t.title.padEnd(22)} ${String(pages.length).padStart(4)}   ${String(withRel).padStart(4)}            ${String(withoutRel).padStart(4)}`
      );
    } catch (e) {
      console.log(`✗ ${t.title.padEnd(22)} error: ${e.message}`);
    }
  }
  console.log('─────────────────────────────────────────────────────────');
})();
