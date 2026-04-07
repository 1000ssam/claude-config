/**
 * markdown-parser.js의 callout 처리 로직 시뮬레이션
 * L12 (callout 내부 이미지)가 parseNotionMarkdown에서 image 블록으로 파싱되는지 확인
 */
import { notion } from 'file:///home/user/.claude/skills/scripts/notion-api.mjs';

const pageId = '339dd1dcd64481e1b1dbc783d94729b6';
const markdown = await notion.getPageMarkdown(pageId);
const lines = markdown.split('\n');

// callout 내부 라인 수집 시뮬레이션
function preprocess(md) {
  return md
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/^[\t]*<empty-block\/>$/gm, '');
}

const procLines = preprocess(markdown).split('\n');
let i = 0;
let calloutCount = 0;

while (i < procLines.length) {
  const line = procLines[i];
  const stripped = line.replace(/^\t+/, '');
  const trimmed = stripped.trim();

  const calloutMatch = trimmed.match(/^<callout(?:\s+icon="([^"]*)")?(?:\s+color="([^"]*)")?\s*>/);
  if (calloutMatch) {
    calloutCount++;
    const calloutStart = i;
    i++;
    const innerLines = [];
    while (i < procLines.length && !procLines[i].includes('</callout>')) {
      innerLines.push(procLines[i]);
      i++;
    }
    if (i < procLines.length) i++;

    const innerText = innerLines.join('\n').trim();
    const hasStructure = innerLines.some(l => {
      const t = l.replace(/^\t+/, '').trim();
      return t.startsWith('#') || t.startsWith('- ') || t.startsWith('* ') || t.match(/^\d+\.\s/) || t.startsWith('> ');
    });

    // 이미지 포함 여부 확인
    const hasImage = innerLines.some(l => l.match(/!\[[^\]]*\]\([^)]+\)/));

    console.log(`\n[Callout #${calloutCount}] line ${calloutStart}`);
    console.log(`  icon="${calloutMatch[1] || ''}", color="${calloutMatch[2] || ''}"`);
    console.log(`  innerLines: ${innerLines.length}개`);
    console.log(`  hasStructure: ${hasStructure}`);
    console.log(`  hasImage: ${hasImage}`);
    if (hasImage) {
      innerLines.filter(l => l.match(/!\[[^\]]*\]\([^)]+\)/)).forEach(l => {
        console.log(`  >> ${l.trim().substring(0, 80)}`);
      });
      // 이미지가 있는데 hasStructure가 false면 → 단순 텍스트 콜아웃으로 처리됨 → 이미지 누락!
      if (!hasStructure) {
        console.log(`  ⚠️ hasStructure=false이므로 단순 텍스트 콜아웃으로 처리! 이미지 누락 위험`);
      } else {
        console.log(`  ✓ hasStructure=true이므로 재귀 파싱됨 (이미지 블록으로 처리 가능)`);
      }
    }
    continue;
  }
  i++;
}

console.log(`\n총 callout 블록: ${calloutCount}개`);

// callout hasStructure 판단에 이미지 라인이 포함되지 않는 문제 재현
console.log('\n=== hasStructure 판단 기준 재확인 ===');
const testLines = [
  '\t**자료 1 \\| 불교의 동아시아 전파**',
  '\t---',
  '\t![](https://example.com/img.png)',
];
const hasStructureResult = testLines.some(l => {
  const t = l.replace(/^\t+/, '').trim();
  return t.startsWith('#') || t.startsWith('- ') || t.startsWith('* ') || t.match(/^\d+\.\s/) || t.startsWith('> ');
});
const hasImageResult = testLines.some(l => l.match(/!\[[^\]]*\]\([^)]+\)/));
console.log(`hasStructure: ${hasStructureResult}`);
console.log(`hasImage: ${hasImageResult}`);
console.log(`→ 이미지만 있는 callout은 hasStructure=false → 단순 텍스트 처리 → 이미지 누락!`);
