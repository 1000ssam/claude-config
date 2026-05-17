/**
 * callout 내부 이미지(L12)가 마크다운 파서에서 어떻게 처리되는지 확인
 * + resolveFileAttachments의 인덱싱 정합성 검증
 */
import { notion } from 'file:///home/user/.claude/skills/scripts/notion-api.mjs';

const pageId = '339dd1dcd64481e1b1dbc783d94729b6';

const markdown = await notion.getPageMarkdown(pageId);
const lines = markdown.split('\n');

// L12 주변 컨텍스트 (callout 내부 이미지)
console.log('=== L8~L20 컨텍스트 ===');
for (let i = 7; i <= 20 && i < lines.length; i++) {
  console.log(`L${i}: ${JSON.stringify(lines[i])}`);
}

// 모든 이미지 URL과 순서 추출 (마크다운 기준)
const mdImgPattern = /!\[[^\]]*\]\(([^)]+)\)/g;
const mdImages = [...markdown.matchAll(mdImgPattern)];

console.log(`\n=== 마크다운 이미지 URL 순서 (${mdImages.length}개) ===`);
mdImages.forEach((m, i) => {
  const isFileUrl = m[1].startsWith('file://');
  const url = m[1].substring(0, 80);
  console.log(`[${i}] ${isFileUrl ? 'FILE://' : 'S3    '} ${url}`);
});

// 블록 API 이미지 순서 (notion-reader.js의 collectImageUrlsInOrder와 동일 로직)
async function collectImageUrlsInOrder(blockId, visited = new Set()) {
  if (visited.has(blockId)) return [];
  visited.add(blockId);

  const urls = [];
  let cursor;
  do {
    const path = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const res = await notion.call('GET', path);
    for (const b of res.results) {
      if (b.type === 'image') {
        const url = b.image?.file?.url || b.image?.external?.url || '';
        if (url) urls.push({ url, blockId: b.id, parentId: blockId });
      }
      if (b.has_children) {
        const childUrls = await collectImageUrlsInOrder(b.id, visited);
        urls.push(...childUrls);
      }
    }
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return urls;
}

const blockImages = await collectImageUrlsInOrder(pageId);
console.log(`\n=== 블록 API 이미지 순서 (${blockImages.length}개) ===`);
blockImages.forEach((img, i) => {
  console.log(`[${i}] url=${img.url.substring(0, 80)}`);
});

// 인덱스 매핑 분석
console.log('\n=== 인덱스 매핑 분석 ===');
console.log(`마크다운 이미지: ${mdImages.length}개`);
console.log(`블록 API 이미지: ${blockImages.length}개`);

// resolveFileAttachments 시뮬레이션
let blockIdx = 0;
let mismatches = [];
for (let mdIdx = 0; mdIdx < mdImages.length; mdIdx++) {
  const mdUrl = mdImages[mdIdx][1];
  const blockUrl = blockImages[blockIdx]?.url || '(없음)';
  const isFileUrl = mdUrl.startsWith('file://');

  if (isFileUrl) {
    // file:// URL은 블록 URL로 대체 시도
    const s3Match = blockUrl.includes('prod-files-secure.s3');
    console.log(`md[${mdIdx}] FILE:// → block[${blockIdx}] ${s3Match ? '✓' : '✗'} ${blockUrl.substring(0, 60)}`);
  } else {
    // S3 URL은 그대로 사용 — 블록과 순서가 맞는지 비교
    const same = blockUrl.split('?')[0].substring(0, 60) === mdUrl.split('?')[0].substring(0, 60);
    if (!same) {
      mismatches.push({ mdIdx, blockIdx, mdUrl: mdUrl.substring(0, 60), blockUrl: blockUrl.substring(0, 60) });
    }
    console.log(`md[${mdIdx}] S3     ${same ? '=' : '≠'} block[${blockIdx}]`);
  }
  blockIdx++;
}

if (mismatches.length > 0) {
  console.log('\n⚠️ 순서 불일치 발견:');
  mismatches.forEach(m => {
    console.log(`  md[${m.mdIdx}]: ${m.mdUrl}`);
    console.log(`  block[${m.blockIdx}]: ${m.blockUrl}`);
  });
}

// callout 내 이미지가 마크다운에서 callout 태그 안에 있는지 확인
console.log('\n=== callout 내부 이미지 확인 ===');
let inCallout = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('<callout')) inCallout = true;
  if (lines[i].includes('</callout>')) { inCallout = false; }
  if (inCallout && lines[i].match(/!\[[^\]]*\]\([^)]+\)/)) {
    console.log(`L${i} [callout 내부]: ${lines[i].trim().substring(0, 100)}`);
  }
}
