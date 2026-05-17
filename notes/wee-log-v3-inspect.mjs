import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

// 자료실 1개, 명렬표 1개 페이지 샘플링
const DBS = [
  { title: '자료실', id: '749dd1dc-d644-8365-be1c-01f5be4a741f' },
  { title: '명렬표', id: '61bdd1dc-d644-83f7-9e91-01ac3327f2f4' },
];

(async () => {
  for (const db of DBS) {
    console.log(`\n## ${db.title}`);
    const pages = await notion.queryAll(db.id);
    console.log(`총 ${pages.length}개`);
    if (!pages.length) continue;

    const sample = pages[0];
    console.log(`\n샘플 페이지 ${sample.id} 의 속성 키 목록:`);
    console.log(Object.keys(sample.properties).join(', '));

    // relation_id 비슷한 키 찾기
    const idLike = Object.keys(sample.properties).filter((k) =>
      /relation|^id$|tracking/i.test(k)
    );
    console.log(`\nID 비슷한 키: ${idLike.length ? idLike.join(', ') : '(없음)'}`);

    // 모든 페이지의 relation_id 분포
    let withProp = 0;
    let withVal = 0;
    let firstSample = null;
    for (const p of pages) {
      const r = p.properties?.relation_id;
      if (r !== undefined) withProp++;
      if (r?.rich_text?.length) {
        withVal++;
        if (!firstSample) firstSample = { id: p.id, raw: r };
      }
    }
    console.log(
      `relation_id 속성 보유: ${withProp}/${pages.length}, 값 있음: ${withVal}/${pages.length}`
    );
    if (firstSample) console.log('첫 값:', JSON.stringify(firstSample.raw));
  }
})();
