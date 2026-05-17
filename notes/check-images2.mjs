/**
 * 마크다운에서 이미지가 어떻게 표현되는지 확인
 * + depth=1 (토글 자식) 이미지 블록의 마크다운 표현 추적
 */
import { notion } from 'file:///home/user/.claude/skills/scripts/notion-api.mjs';

const pageId = '339dd1dcd64481e1b1dbc783d94729b6';

// 1. 마크다운 원문 가져오기
const markdown = await notion.getPageMarkdown(pageId);

// 이미지 관련 패턴 추출
const imgMatches = [...markdown.matchAll(/!\[[^\]]*\]\([^)]+\)/g)];
const unknownMatches = [...markdown.matchAll(/<unknown[^>]*>/g)];

console.log(`\n=== 마크다운 이미지 패턴 분석 ===`);
console.log(`![...](url) 패턴: ${imgMatches.length}개`);
console.log(`<unknown> 패턴: ${unknownMatches.length}개`);

console.log(`\n--- ![...](url) 목록 ---`);
imgMatches.forEach((m, i) => {
  console.log(`[${i}] ${m[0].substring(0, 120)}`);
});

console.log(`\n--- <unknown> 목록 ---`);
unknownMatches.forEach((m, i) => {
  console.log(`[${i}] ${m[0]}`);
});

// 2. depth=1 이미지 블록이 어느 부모에 속하는지 확인
console.log('\n=== depth=1 이미지 블록의 부모 컨텍스트 ===');
let cursor;
const topBlocks = [];
do {
  const path = `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
  const res = await notion.call('GET', path);
  topBlocks.push(...res.results);
  cursor = res.has_more ? res.next_cursor : null;
} while (cursor);

for (const parent of topBlocks) {
  if (!parent.has_children) continue;
  let childCursor;
  const children = [];
  do {
    const cPath = `/blocks/${parent.id}/children?page_size=100${childCursor ? `&start_cursor=${childCursor}` : ''}`;
    const cRes = await notion.call('GET', cPath);
    children.push(...cRes.results);
    childCursor = cRes.has_more ? cRes.next_cursor : null;
  } while (childCursor);

  const childImages = children.filter(c => c.type === 'image');
  if (childImages.length > 0) {
    const parentTitle = parent[parent.type]?.rich_text?.[0]?.plain_text
      || parent[parent.type]?.title?.[0]?.plain_text
      || '(제목 없음)';
    console.log(`\n부모 블록: type=${parent.type}, title="${parentTitle}"`);
    childImages.forEach((img, i) => {
      const url = img.image?.file?.url || img.image?.external?.url || '없음';
      console.log(`  자식 이미지[${i}]: ${url.substring(0, 80)}`);
    });
  }
}

// 3. file:// 패턴 확인
const fileUrls = [...markdown.matchAll(/file:\/\/[^\s)"]+/g)];
console.log(`\n=== file:// URL 패턴 (${fileUrls.length}개) ===`);
fileUrls.forEach((m, i) => {
  console.log(`[${i}] ${m[0].substring(0, 120)}`);
});

// 4. 마크다운 중 이미지가 있는 라인의 컨텍스트 출력
console.log('\n=== 마크다운 이미지 라인 (앞뒤 1줄 포함) ===');
const lines = markdown.split('\n');
lines.forEach((line, idx) => {
  if (line.match(/!\[[^\]]*\]\([^)]+\)/)) {
    const before = lines[idx-1] || '';
    const after = lines[idx+1] || '';
    const tabsBefore = (before.match(/^\t+/) || [''])[0].length;
    const tabsCurrent = (line.match(/^\t+/) || [''])[0].length;
    console.log(`L${idx}: [tabs=${tabsCurrent}] ${line.substring(0, 100)}`);
    if (tabsBefore !== tabsCurrent) {
      console.log(`  ↑ [tabs=${tabsBefore}] ${before.substring(0, 80)}`);
    }
  }
});
