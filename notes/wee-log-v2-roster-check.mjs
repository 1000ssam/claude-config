/**
 * V2 명렬표(현재) 학생들이 "과년도 학생 정보 연결" relation을 실제로 가지고 있는지 확인.
 * - 0이면 V2 자체에 데이터가 없는 것 → roster step Phase 4가 0인 게 정상
 * - >0이면 코드 또는 idMap 문제
 */

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const V2_ROOT = '3a5dd1dcd644826c81be015fef658397';

(async () => {
  // V2 페이지 하위 child_database 다 모음
  async function findDbs(blockId, depth = 0, acc = [], visited = new Set()) {
    if (visited.has(blockId) || depth > 8) return acc;
    visited.add(blockId);
    let blocks;
    try {
      blocks = await notion.getBlocksAll(blockId);
    } catch {
      return acc;
    }
    for (const b of blocks) {
      if (b.type === 'child_database') {
        acc.push({ id: b.id, title: b.child_database?.title ?? '' });
      } else if (b.has_children) {
        await findDbs(b.id, depth + 1, acc, visited);
      }
    }
    return acc;
  }

  const dbs = await findDbs(V2_ROOT);
  console.log(`V2 child_database ${dbs.length}개`);

  // 명렬표(현재)와 과년도 명렬표 후보
  const rosterCandidates = dbs.filter((d) =>
    /명렬표|학생\s*정보/.test(d.title)
  );
  console.log('\n명렬표/학생정보 후보:');
  for (const c of rosterCandidates) console.log(`  - "${c.title}" ${c.id}`);

  // 각 후보의 properties 스키마 + 첫 페이지 relation 검사
  for (const c of rosterCandidates) {
    console.log(`\n## ${c.title} (${c.id})`);
    try {
      const db = await notion.getDatabase(c.id);
      const dsId = db.data_sources?.[0]?.id;
      if (!dsId) {
        console.log('  data_source_id 없음 — linked view일 가능성, skip');
        continue;
      }
      const ds = await notion.call('GET', `/data_sources/${dsId}`);
      const propNames = Object.keys(ds.properties ?? {});
      const relProps = Object.entries(ds.properties ?? {})
        .filter(([, v]) => v.type === 'relation')
        .map(([k]) => k);
      console.log(`  속성 ${propNames.length}개 / relation 속성: ${relProps.join(', ') || '(없음)'}`);

      const pages = await notion.queryAll(c.id);
      console.log(`  페이지 ${pages.length}개`);

      for (const rk of relProps) {
        let nonEmpty = 0;
        let totalLinks = 0;
        for (const p of pages) {
          const r = p.properties[rk];
          if (r?.relation?.length) {
            nonEmpty++;
            totalLinks += r.relation.length;
          }
        }
        console.log(`    • ${rk}: 값 있는 행 ${nonEmpty}/${pages.length}, 총 링크 ${totalLinks}`);
      }
    } catch (e) {
      console.log(`  err: ${e.message}`);
    }
  }
})();
