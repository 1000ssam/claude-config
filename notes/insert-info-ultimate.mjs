import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const PAGE_ID = '2f4dd1dc-d644-80d8-a805-f787471ecb5b';

const next = JSON.parse(readFileSync('/tmp/creator-data.json', 'utf-8'));
const market = [...(next.props?.pageProps?.pinnedTemplates||[]), ...(next.props?.pageProps?.nonPinnedTemplates||[])];
const tpl = market.find(t => t.slug === 'ultimate-teachers-log');

function rt(text, opts = {}) {
  const obj = { type: 'text', text: { content: text } };
  if (opts.bold || opts.italic) obj.annotations = { bold: !!opts.bold, italic: !!opts.italic };
  if (opts.link) obj.text.link = { url: opts.link };
  return obj;
}
const paragraph = (richTexts) => ({ type: 'paragraph', paragraph: { rich_text: richTexts } });
const heading1 = (richTexts) => ({ type: 'heading_1', heading_1: { rich_text: richTexts } });
const bullet = (richTexts) => ({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: richTexts } });

const priceLabel = (tpl.price === 0 || tpl.price == null) ? '무료' : `$${tpl.price}`;
const isFree = priceLabel === '무료';
const categories = (tpl.categories || []).map(c => c.name || c.slug);

const blocks = [
  heading1([rt(`${tpl.name} 템플릿이란?`)]),
  paragraph([
    rt(tpl.name, { bold: true }),
    rt(`은 1000쌤이 제작한 ${isFree ? '무료 ' : ''}노션 템플릿이에요. `),
    rt(tpl.description ? tpl.description.split('\n')[0] : ''),
  ]),
  bullet([rt('제작자', { bold: true }), rt(': 1000쌤')]),
  bullet([rt('가격', { bold: true }), rt(`: ${priceLabel}`)]),
  bullet([rt('카테고리', { bold: true }), rt(`: ${categories.join(' · ')}`)]),
];

const marketUrl = `https://www.notion.com/ko/templates/${tpl.slug}`;
const marketRich = [
  rt('마켓', { bold: true }),
  rt(': '),
  rt('노션 마켓플레이스', { link: marketUrl }),
];
if (tpl.attributes?.purchase_url) {
  marketRich.push(rt(' · '));
  marketRich.push(rt('쌤동네', { link: tpl.attributes.purchase_url }));
}
blocks.push(bullet(marketRich));

await notion.call('PATCH', `/blocks/${PAGE_ID}/children`, {
  children: blocks,
  position: { type: 'start' },
});

console.log(`✓ ultimate-teachers-log 정보 박스 추가 완료 (${blocks.length}블록, 페이지 최상단)`);
console.log(`  ${tpl.name} | ${priceLabel}`);
console.log('  Page URL: https://www.notion.so/2f4dd1dcd64480d8a805f787471ecb5b');
