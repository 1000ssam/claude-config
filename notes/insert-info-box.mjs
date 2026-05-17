import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

// ============================================================
// 1) 그룹 1 — DB 페이지 ID + slug 매핑
// ============================================================
const targets = [
  { slug: 'school-budget',         pageId: null, name: null },
  { slug: 'titan-routine',         pageId: null, name: null },
  { slug: 'ai-booknote-lite',      pageId: null, name: null },
  { slug: 'wee-class-lite',        pageId: null, name: null },
  { slug: 'timeblocker',           pageId: null, name: null },
  { slug: 'ai-booknote-pro',       pageId: null, name: null },
  { slug: 'highschool-2015',       pageId: null, name: null },
  { slug: 'memory-pro',            pageId: null, name: null },
  { slug: 'ultimate-teachers-log', pageId: null, name: null },  // 첫 콜아웃 없음 → 별도 처리
];

// 2) DB에서 slug → pageId 매핑
const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';
const all = await notion.queryAll(TEMPLATES_DB);
const slugToPage = new Map();
for (const p of all) {
  const slug = p.properties.Slug?.rich_text?.map(t => t.plain_text).join('') || '';
  if (slug) slugToPage.set(slug, p);
}
for (const t of targets) {
  const p = slugToPage.get(t.slug);
  if (p) t.pageId = p.id;
}

// 3) NEXT_DATA에서 마켓 정보 (이름/가격/카테고리/구매URL)
const next = JSON.parse(readFileSync('/tmp/creator-data.json', 'utf-8'));
const market = [...(next.props?.pageProps?.pinnedTemplates||[]), ...(next.props?.pageProps?.nonPinnedTemplates||[])];
const marketBySlug = new Map(market.map(t => [t.slug, t]));

// ============================================================
// 4) rich_text / 블록 헬퍼
// ============================================================
function rt(text, opts = {}) {
  const obj = { type: 'text', text: { content: text } };
  if (opts.bold || opts.italic || opts.code) {
    obj.annotations = { bold: !!opts.bold, italic: !!opts.italic, code: !!opts.code };
  }
  if (opts.link) obj.text.link = { url: opts.link };
  return obj;
}
function paragraph(richTexts) {
  return { type: 'paragraph', paragraph: { rich_text: richTexts } };
}
function heading1(richTexts) {
  return { type: 'heading_1', heading_1: { rich_text: richTexts } };
}
function bullet(richTexts) {
  return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: richTexts } };
}

// ============================================================
// 5) 정보 박스 블록 생성 함수
// ============================================================
function makeInfoBoxBlocks(slug, name, description, price, categories, purchaseUrl) {
  const priceLabel = (price === 0 || price == null) ? '무료' : `$${price}`;
  const isFree = priceLabel === '무료';
  const intro = `**${name}**은 1000쌤이 제작한 ${isFree ? '무료 ' : ''}노션 템플릿이에요. `
    + (description ? description.split('\n')[0].slice(0, 120) : '');

  const introRichTexts = [
    rt(name, { bold: true }),
    rt(`은 1000쌤이 제작한 ${isFree ? '무료 ' : ''}노션 템플릿이에요. `),
    rt(description ? description.split('\n')[0] : ''),
  ];

  const blocks = [
    heading1([rt(`${name} 템플릿이란?`)]),
    paragraph(introRichTexts),
    bullet([rt('제작자', { bold: true }), rt(': 1000쌤')]),
    bullet([rt('가격', { bold: true }), rt(`: ${priceLabel}`)]),
    bullet([rt('카테고리', { bold: true }), rt(`: ${categories.join(' · ')}`)]),
  ];

  // 마켓 링크
  const marketUrl = `https://www.notion.com/ko/templates/${slug}`;
  const marketRich = [
    rt('마켓', { bold: true }),
    rt(': '),
    rt('노션 마켓플레이스', { link: marketUrl }),
  ];
  if (purchaseUrl) {
    marketRich.push(rt(' · '));
    marketRich.push(rt('쌤동네', { link: purchaseUrl }));
  }
  blocks.push(bullet(marketRich));

  return blocks;
}

// ============================================================
// 6) 각 페이지 처리
// ============================================================
const results = [];
for (const t of targets) {
  if (!t.pageId) {
    results.push({ slug: t.slug, status: '✗ DB에 페이지 없음' });
    continue;
  }

  const tpl = marketBySlug.get(t.slug);
  if (!tpl) {
    results.push({ slug: t.slug, status: '✗ 마켓에 없음' });
    continue;
  }

  // 자식 블록 목록 조회
  const children = await notion.call('GET', `/blocks/${t.pageId}/children?page_size=100`);

  // 첫 callout (blue_bg) 블록 찾기
  const firstCallout = children.results.find(b =>
    b.type === 'callout' &&
    (b.callout?.color === 'blue_background' || b.callout?.color === 'blue')
  );

  // 첫 callout이 없으면 스킵
  if (!firstCallout) {
    results.push({ slug: t.slug, status: '⚠ 첫 콜아웃(blue_bg) 없음 → 스킵' });
    continue;
  }

  // 이미 정보 박스 있는지 체크 — "**제작자**" 키워드를 포함한 bullet이 페이지 어딘가에 있으면 스킵
  const hasInfo = children.results.some(b => {
    if (b.type !== 'bulleted_list_item') return false;
    const txt = (b.bulleted_list_item?.rich_text || []).map(r => r.plain_text).join('');
    return /제작자/.test(txt);
  });
  if (hasInfo) {
    results.push({ slug: t.slug, status: '— 이미 정보 박스 있음, 스킵' });
    continue;
  }

  // 정보 박스 블록 생성
  const blocks = makeInfoBoxBlocks(
    t.slug,
    tpl.name,
    tpl.description,
    tpl.price,
    (tpl.categories || []).map(c => c.name || c.slug),
    tpl.attributes?.purchase_url || null,
  );

  // 콜아웃 직후 삽입 (2026-03-11 API: after → position 으로 변경됨)
  await notion.call('PATCH', `/blocks/${t.pageId}/children`, {
    children: blocks,
    position: {
      type: 'after_block',
      after_block: { id: firstCallout.id },
    },
  });

  results.push({ slug: t.slug, status: `✓ 추가 완료 (${blocks.length}블록)`, name: tpl.name });
}

// ============================================================
// 7) 결과 출력
// ============================================================
console.log('\n=== 정보 박스 삽입 결과 ===\n');
for (const r of results) {
  console.log(`${r.status.padEnd(35)} | ${r.slug}${r.name ? ' — ' + r.name : ''}`);
}
