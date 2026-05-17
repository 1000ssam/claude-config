/**
 * V2 원본과 V3 결과 비교: 페이지 수 + relation 카운트 매칭
 */
import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const V2_ROOT = '3a5dd1dcd644826c81be015fef658397';

async function findDbsByTitle(blockId, depth = 0, acc = [], visited = new Set()) {
  if (visited.has(blockId) || depth > 10) return acc;
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
      await findDbsByTitle(b.id, depth + 1, acc, visited);
    }
  }
  return acc;
}

async function summarize(label, id) {
  try {
    const pages = await notion.queryAll(id);
    const ds = await notion.call('GET', `/data_sources/${(await notion.getDatabase(id)).data_sources?.[0]?.id}`);
    const relCols = Object.entries(ds.properties ?? {})
      .filter(([, v]) => v.type === 'relation')
      .map(([k]) => k);
    const relCounts = {};
    for (const k of relCols) {
      let withVal = 0;
      let total = 0;
      for (const p of pages) {
        const r = p.properties[k];
        if (r?.relation?.length) {
          withVal++;
          total += r.relation.length;
        }
      }
      relCounts[k] = { withVal, total };
    }
    return { count: pages.length, relCounts };
  } catch (e) {
    return { error: e.message };
  }
}

(async () => {
  const v2Dbs = await findDbsByTitle(V2_ROOT);

  // 매핑할 V2 → V3
  const map = [
    { v2Title: '자료실', v3Title: '자료실', v3Id: '749dd1dc-d644-8365-be1c-01f5be4a741f' },
    { v2Title: '연계 기관', v3Title: '연계 기관', v3Id: '8c1dd1dc-d644-8369-a705-0158318c5d70' },
    { v2Title: '사례 관리', v3Title: '사례 관리', v3Id: 'dd2dd1dc-d644-8287-93d3-01e9b8704c9c' },
    { v2Title: '상담일지', v3Title: '사례 관련 할 일', v3Id: 'cdadd1dc-d644-8290-9c84-0122b08abcd0' },
    { v2Title: '수업 관련 할 일', v3Title: '수업 및 동아리 할 일', v3Id: 'a57dd1dc-d644-8298-b130-01ed14526fe3' },
    { v2Title: '행사 관련 할 일', v3Title: '행사 및 기타 할 일', v3Id: '601dd1dc-d644-837b-b1f8-012433a5e640' },
    { v2Title: '생기부 누가기록', v3Title: '누가 기록', v3Id: '885dd1dc-d644-83e2-948c-01a491dcd608' },
    { v2Title: '보고서 리소스', v3Title: '보고서 리소스', v3Id: 'ca0dd1dc-d644-83a8-84c2-01a99115ecdb' },
    { v2Title: '월별업무통계', v3Title: '보고서', v3Id: '060dd1dc-d644-8370-87bb-01172899c6cd' },
  ];

  for (const m of map) {
    // V2에서 정확한 title 매치 또는 부분 매치 찾기
    const cand = v2Dbs.find((d) => d.title === m.v2Title) ??
      v2Dbs.find((d) => d.title.includes(m.v2Title));
    if (!cand) {
      console.log(`✗ V2 "${m.v2Title}" 미발견 → V3 "${m.v3Title}"`);
      continue;
    }
    const v2 = await summarize(`V2 ${m.v2Title}`, cand.id);
    const v3 = await summarize(`V3 ${m.v3Title}`, m.v3Id);
    const status = v2.count === v3.count ? '✓' : '⚠';
    console.log(`\n${status} ${m.v2Title} → ${m.v3Title}`);
    console.log(`   페이지: V2 ${v2.count} → V3 ${v3.count}`);
    if (v2.relCounts && v3.relCounts) {
      // 공통 relation 컬럼 검사 (V2/V3 동일 이름인 경우만)
      const v2Keys = Object.keys(v2.relCounts);
      const v3Keys = Object.keys(v3.relCounts);
      // V3 기준으로 V2에 매칭되는 거 찾기 (단순)
      for (const k of v3Keys) {
        const v3r = v3.relCounts[k];
        const v2r = v2.relCounts[k];
        if (v2r) {
          const ok = v2r.total === v3r.total ? '✓' : '⚠';
          console.log(`   ${ok} ${k}: V2 ${v2r.withVal}행/${v2r.total}링크 → V3 ${v3r.withVal}/${v3r.total}`);
        } else {
          console.log(`   . ${k}: V3 ${v3r.withVal}/${v3r.total} (V2엔 동명 없음)`);
        }
      }
    }
  }
})();
