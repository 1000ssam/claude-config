// wee-log-migration 명렬표 셀프 릴레이션 수정안 검증 스크립트
// 1) v2 current 명렬표에 "과년도 학생 정보 연결" 속성 존재 + relation 타입 확인
// 2) 해당 속성에 실제 데이터(연결 페이지)가 들어있는 샘플 1~2건 확인
// 3) v3 명렬표의 "과년도 명렬표 연결" / "현행 명렬표에 연결" 이 dual_property 인지 확인

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const V2_PARENT = '3a5dd1dcd644826c81be015fef658397'; // Wee Class Pro v2.0
const V3_PARENT = '29fdd1dcd644836a800401baf9845f15'; // Wee Class Pro v3.0

function fmt(label, ok, detail) {
  const mark = ok ? 'OK' : 'FAIL';
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ''}`);
}

// 페이지 트리에서 child_database 블록을 깊이 우선 탐색
async function findDatabases(rootPageId, maxDepth = 8) {
  const found = []; // { id, title, parentTitle, depth }

  async function walk(blockId, depth, parentTitle) {
    if (depth > maxDepth) return;
    let cursor;
    do {
      const path = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
      const res = await notion.call('GET', path);
      for (const b of res.results) {
        if (b.type === 'child_database') {
          found.push({
            id: b.id,
            title: b.child_database?.title || '(untitled)',
            parentTitle,
            depth,
          });
        } else if (b.type === 'child_page') {
          const childTitle = b.child_page?.title || '(untitled)';
          await walk(b.id, depth + 1, childTitle);
        } else if (b.has_children) {
          // 컬럼·토글 등에 들어있을 수도 있음
          await walk(b.id, depth + 1, parentTitle);
        }
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
  }

  await walk(rootPageId, 0, '(root)');
  return found;
}

// 데이터소스(2025-09-03 API) 스키마 가져오기. linked view 등 data_source 없는 건 null
async function getDataSourceSchema(databaseId) {
  let db;
  try {
    db = await notion.call('GET', `/databases/${databaseId}`);
  } catch (e) {
    return null;
  }
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) return null;
  const ds = await notion.call('GET', `/data_sources/${dsId}`);
  return { dsId, schema: ds };
}

async function main() {
  console.log('=== v2 / v3 DB 탐색 ===');
  const v2Dbs = await findDatabases(V2_PARENT);
  const v3Dbs = await findDatabases(V3_PARENT);

  console.log(`v2 발견: ${v2Dbs.length}개, v3 발견: ${v3Dbs.length}개`);

  // v2 current 명렬표 후보: title이 "명렬표"인 것 중 "고유번호" 없는 것
  // v2 past 명렬표 후보: title에 "과년도" 또는 "학생 정보" 들어가는 것
  // v3 명렬표 후보: title이 "명렬표"인 v3 트리 안의 DB
  const v2Candidates = v2Dbs.filter(d =>
    /명렬표|학생 정보/.test(d.title)
  );
  const v3Candidates = v3Dbs.filter(d => /명렬표/.test(d.title));

  console.log('\n--- v2 명렬표/학생 정보 관련 DB ---');
  v2Candidates.forEach(d => console.log(`  ${d.title}  (id=${d.id}, depth=${d.depth}, parent="${d.parentTitle}")`));
  console.log('\n--- v3 명렬표 관련 DB ---');
  v3Candidates.forEach(d => console.log(`  ${d.title}  (id=${d.id}, depth=${d.depth}, parent="${d.parentTitle}")`));

  // 각 후보의 스키마 dump 로 종류 가르기
  console.log('\n=== 1) v2 current 명렬표 — "과년도 학생 정보 연결" 속성 검증 ===');
  let v2CurrentSchema = null;
  let v2CurrentDsId = null;
  for (const cand of v2Candidates) {
    const result = await getDataSourceSchema(cand.id);
    if (!result) continue; // linked view 등 스킵
    const { dsId, schema } = result;
    const props = schema.properties || {};
    const hasGoid = !!props['고유번호']; // past만 가짐
    const hasHakbun = !!props['학번'];   // current만 가짐
    if (hasHakbun && !hasGoid) {
      v2CurrentSchema = schema;
      v2CurrentDsId = dsId;
      console.log(`  → current 명렬표로 식별: id=${cand.id}, title="${cand.title}"`);
      break;
    }
  }
  if (!v2CurrentSchema) {
    fmt('v2 current 명렬표 식별', false, '학번 가지고 고유번호 없는 DB를 찾지 못함');
    return;
  }

  const v2Props = v2CurrentSchema.properties;
  const targetKey = '과년도 학생 정보 연결';
  const oldKey = '과년도 학생 정보';
  const exists = !!v2Props[targetKey];
  const oldExists = !!v2Props[oldKey];
  fmt(`v2 current["${targetKey}"] 존재`, exists, exists ? `type=${v2Props[targetKey].type}` : '없음');
  fmt(`v2 current["${oldKey}"] 존재`, !oldExists, oldExists ? '구버전 키도 존재 (충돌!)' : '없음 (정상)');

  // 실제 데이터 샘플 1~2건
  console.log('\n=== 2) 실제 relation 데이터 샘플 ===');
  if (exists) {
    const q = await notion.call('POST', `/data_sources/${v2CurrentDsId}/query`, {
      page_size: 50,
    });
    const withRelations = q.results
      .map(p => ({ id: p.id, ids: (p.properties?.[targetKey]?.relation || []).map(r => r.id) }))
      .filter(p => p.ids.length > 0);
    fmt(`v2 current에 "${targetKey}" 연결된 페이지 수`, withRelations.length > 0,
      `샘플 ${q.results.length}건 중 ${withRelations.length}건 연결됨`);
    if (withRelations[0]) {
      console.log(`  예시: pageId=${withRelations[0].id} → relation ${withRelations[0].ids.length}건`);
    }
  }

  // v3 명렬표의 dual_property 검증
  console.log('\n=== 3) v3 명렬표 — dual_property 여부 ===');
  let v3Schema = null;
  for (const cand of v3Candidates) {
    const result = await getDataSourceSchema(cand.id);
    if (!result) continue;
    const { schema } = result;
    const props = schema.properties || {};
    if (props['과년도 명렬표 연결'] || props['현행 명렬표에 연결']) {
      v3Schema = schema;
      console.log(`  → v3 명렬표로 식별: id=${cand.id}, title="${cand.title}"`);
      break;
    }
  }
  if (!v3Schema) {
    fmt('v3 명렬표 식별', false, '과년도/현행 명렬표 연결 속성을 가진 DB 없음');
    return;
  }
  const past = v3Schema.properties['과년도 명렬표 연결'];
  const curr = v3Schema.properties['현행 명렬표에 연결'];
  console.log('  past prop dump:', JSON.stringify(past, null, 2));
  console.log('  curr prop dump:', JSON.stringify(curr, null, 2));

  const pastIsDual = past?.relation?.type === 'dual_property';
  const currIsDual = curr?.relation?.type === 'dual_property';
  fmt('과년도 명렬표 연결 = dual_property', pastIsDual, `type=${past?.relation?.type}`);
  fmt('현행 명렬표에 연결 = dual_property', currIsDual, `type=${curr?.relation?.type}`);

  if (pastIsDual && currIsDual) {
    console.log('\n=> 방식 1(단방향 set + 자동 동기화) 가정 검증 통과');
  } else {
    console.log('\n=> 방식 1 가정 미충족 — 양방향 set으로 수정 필요할 수 있음');
  }
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
