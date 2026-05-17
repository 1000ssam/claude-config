import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

// 각 DB의 relation 속성들이 실제 값을 가지고 있는지 확인
const DBS = [
  { title: '자료실', id: '749dd1dc-d644-8365-be1c-01f5be4a741f' },
  { title: '명렬표', id: '61bdd1dc-d644-83f7-9e91-01ac3327f2f4' },
  { title: '사례 관리', id: 'dd2dd1dc-d644-8287-93d3-01e9b8704c9c' },
  { title: '사례 관련 할 일', id: 'cdadd1dc-d644-8290-9c84-0122b08abcd0' },
  { title: '수업 및 동아리 할 일', id: 'a57dd1dc-d644-8298-b130-01ed14526fe3' },
  { title: '행사 및 기타 할 일', id: '601dd1dc-d644-837b-b1f8-012433a5e640' },
  { title: '누가 기록', id: '885dd1dc-d644-83e2-948c-01a491dcd608' },
];

(async () => {
  for (const db of DBS) {
    const pages = await notion.queryAll(db.id);
    if (!pages.length) {
      console.log(`\n## ${db.title}: 비어있음`);
      continue;
    }
    const sample = pages[0];
    const relationKeys = Object.entries(sample.properties)
      .filter(([, v]) => v.type === 'relation')
      .map(([k]) => k);

    console.log(`\n## ${db.title} (${pages.length}개)`);
    if (!relationKeys.length) {
      console.log('  relation 속성 없음');
      continue;
    }
    for (const key of relationKeys) {
      let withVal = 0;
      let totalVals = 0;
      for (const p of pages) {
        const r = p.properties[key];
        if (r?.relation?.length) {
          withVal++;
          totalVals += r.relation.length;
        }
      }
      const status = withVal > 0 ? '✓' : '✗';
      console.log(`  ${status} ${key.padEnd(28)} 값 있는 행: ${withVal}/${pages.length}, 총 링크 수: ${totalVals}`);
    }
  }
})();
