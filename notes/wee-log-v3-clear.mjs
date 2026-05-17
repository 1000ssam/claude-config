/**
 * Wee Class Pro v3.0 페이지 하위 마이그레이션 대상 10개 DB의 row(페이지)를 archive 처리.
 * - 화이트리스트 매칭 + data_source_id 중복 제거(linked view 대응)
 * - DB 스키마/속성/페이지 자체는 절대 건드리지 않음
 *
 * 사용:
 *   node /mnt/c/dev/notes/wee-log-v3-clear.mjs --dry-run
 *   node /mnt/c/dev/notes/wee-log-v3-clear.mjs --execute
 */

import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const V3_ROOT = '29fdd1dcd644836a800401baf9845f15'; // Wee-Class-Pro-v3-0

// 마이그레이션 범위 안의 v3 DB 제목 (linked view 제목도 허용)
const TARGET_TITLES = new Set([
  '자료실',
  '명렬표',
  '참가 학생 관리(명렬표 보기)', // 명렬표 linked view
  '연계 기관',
  '사례 관리',
  '사례 관련 할 일(상담,검사,자문,교육,연구,의뢰)',
  '수업 및 동아리 관련 할 일',
  '행사 및 기타 할 일',
  '누가 기록',
  '보고서 리소스',
  '보고서',
]);

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run') || !args.has('--execute');

async function findChildDatabases(blockId, depth = 0, acc = [], visited = new Set()) {
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
      acc.push({ id: b.id, title: b.child_database?.title ?? '', depth });
    } else if (b.has_children) {
      await findChildDatabases(b.id, depth + 1, acc, visited);
    }
  }
  return acc;
}

(async () => {
  console.log(`[mode] ${DRY ? 'DRY-RUN' : 'EXECUTE'}`);
  console.log('');

  console.log('1) child_database 탐색...');
  const all = await findChildDatabases(V3_ROOT);
  console.log(`   전체 ${all.length}개 발견`);

  // 화이트리스트 필터
  const targets = all.filter((db) => TARGET_TITLES.has(db.title));
  console.log(`   타겟 매칭 ${targets.length}개`);
  console.log('');

  // 페이지 조회 + 페이지 ID 단위 중복 제거 (linked view 대응)
  console.log('2) 페이지 조회 및 중복 제거...');
  const seenPageIds = new Set();
  const summary = [];
  for (const t of targets) {
    try {
      const pages = await notion.queryAll(t.id);
      const unique = pages.filter((p) => {
        if (seenPageIds.has(p.id)) return false;
        seenPageIds.add(p.id);
        return true;
      });
      summary.push({ ...t, count: unique.length, raw: pages.length, pages: unique });
    } catch (e) {
      summary.push({ ...t, count: 0, raw: 0, pages: [], error: e.message });
    }
  }
  console.log('   ─────────────────────────────────────────');
  for (const s of summary) {
    const tag = s.error
      ? `❌ ${s.error}`
      : s.raw === s.count
      ? `${s.count}개`
      : `${s.count}개 (linked view 중복 ${s.raw - s.count} 제외)`;
    console.log(`   • ${s.title.padEnd(20)} → ${tag}`);
  }
  console.log('   ─────────────────────────────────────────');
  const total = summary.reduce((a, s) => a + (s.count ?? 0), 0);
  console.log(`   합계: ${total}개 페이지`);
  console.log('');

  if (DRY) {
    console.log('[dry-run] 종료. --execute 로 archive 실행.');
    return;
  }

  console.log('4) archive 실행');
  let done = 0;
  let failed = 0;
  const errSamples = [];
  for (const s of summary) {
    if (!s.pages?.length) continue;
    process.stdout.write(`   • ${s.title} (${s.count}개)...`);
    let local = 0;
    for (const p of s.pages) {
      try {
        await notion.archivePage(p.id);
        done++;
        local++;
      } catch (e) {
        failed++;
        if (errSamples.length < 5) errSamples.push(`${s.title} ${p.id}: ${e.message}`);
      }
    }
    console.log(` ${local}/${s.count} archive`);
  }
  console.log('');
  console.log(`완료: ${done} archive, ${failed} 실패 / 합계 ${total}`);
  if (errSamples.length) {
    console.log('샘플 에러:');
    errSamples.forEach((m) => console.log(`  - ${m}`));
  }
})();
