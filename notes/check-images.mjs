import { notion } from 'file:///home/user/.claude/skills/scripts/notion-api.mjs';

const pageId = '339dd1dcd64481e1b1dbc783d94729b6';

console.log('블록 전체 조회 중...');

// 재귀적으로 모든 블록 수집 (DFS)
async function getAllBlocks(blockId, depth = 0, visited = new Set()) {
  if (visited.has(blockId)) return [];
  visited.add(blockId);

  const blocks = [];
  let cursor;
  do {
    const path = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const res = await notion.call('GET', path);
    for (const b of res.results) {
      blocks.push({ ...b, _depth: depth });
      if (b.has_children) {
        const children = await getAllBlocks(b.id, depth + 1, visited);
        blocks.push(...children);
      }
    }
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);

  return blocks;
}

const allBlocks = await getAllBlocks(pageId);
console.log(`\n전체 블록 수: ${allBlocks.length}`);

// 이미지 관련 블록만 필터링
const imageRelatedTypes = ['image', 'file', 'embed', 'video', 'pdf'];
const imageBlocks = allBlocks.filter(b => imageRelatedTypes.includes(b.type));

console.log(`\n=== 이미지 관련 블록 (${imageBlocks.length}개) ===`);
imageBlocks.forEach((b, i) => {
  const data = b[b.type] || {};
  const fileUrl = data.file?.url || '';
  const externalUrl = data.external?.url || '';
  const url = fileUrl || externalUrl || data.url || '(없음)';
  const fileType = fileUrl ? 'file(S3)' : externalUrl ? 'external' : '?';
  const caption = (data.caption || []).map(c => c.plain_text).join('') || '';
  console.log(`[${i}] type=${b.type}, source=${fileType}, depth=${b._depth}`);
  console.log(`     url=${url.substring(0, 100)}`);
  if (caption) console.log(`     caption="${caption}"`);
});

// 타입별 통계
const typeStats = {};
for (const b of allBlocks) {
  typeStats[b.type] = (typeStats[b.type] || 0) + 1;
}

console.log('\n=== 블록 타입별 통계 ===');
Object.entries(typeStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const isImageRelated = imageRelatedTypes.includes(type);
    console.log(`  ${isImageRelated ? '★' : ' '} ${type}: ${count}개`);
  });

// 마크다운 변환 시 이미지로 처리되는 블록 — image 타입만 상세 분석
const imageOnlyBlocks = allBlocks.filter(b => b.type === 'image');
console.log(`\n=== image 타입 블록 상세 (${imageOnlyBlocks.length}개) ===`);
imageOnlyBlocks.forEach((b, i) => {
  const data = b.image || {};
  const fileUrl = data.file?.url || '';
  const externalUrl = data.external?.url || '';
  const url = fileUrl || externalUrl;
  const isAttachment = url.startsWith('file://') || url.includes('secure.notion') || fileUrl !== '';
  console.log(`[${i}] source=${fileUrl ? 'file(S3)' : 'external'}, isAttachment=${isAttachment}`);
  console.log(`     url(100)=${url.substring(0, 100)}`);
});
