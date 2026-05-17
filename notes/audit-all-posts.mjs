import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';
const AUTHOR_1000SSAM = '2f4dd1dc-d644-8110-b8b7-ef4350a25149';
const AUTHOR_GOMGOM   = '2f4dd1dc-d644-8104-9aa9-f6593346279f';  // 제외 대상
const AUTHOR_CHEMIGA  = '2f4dd1dc-d644-8160-a4c6-d98ded816849';

// 1) 마켓플레이스 22개 추출
const next = JSON.parse(readFileSync('/tmp/creator-data.json', 'utf-8'));
const market = [...(next.props?.pageProps?.pinnedTemplates||[]), ...(next.props?.pageProps?.nonPinnedTemplates||[])];
const marketBySlug = new Map(market.map(t => [t.slug, t]));

// 2) DB 전체 조회
const all = await notion.queryAll(TEMPLATES_DB);

// 3) 곰곰이쌤 제외
const targets = all.filter(p => {
  const aid = p.properties.Author?.relation?.[0]?.id;
  return aid !== AUTHOR_GOMGOM;
});

console.log(`총 DB 페이지 ${all.length}개 → 곰곰이쌤 제외 후 ${targets.length}개 점검 대상\n`);

// 4) 슬러그 중복 검사
const slugCount = new Map();
for (const p of targets) {
  const slug = p.properties.Slug?.rich_text?.map(t => t.plain_text).join('') || '(no-slug)';
  if (!slugCount.has(slug)) slugCount.set(slug, []);
  slugCount.get(slug).push(p);
}

// 5) 각 페이지 점검
const audits = [];
for (const p of targets) {
  const titleProp = Object.values(p.properties).find(x => x.type === 'title');
  const title = titleProp?.title?.map(t => t.plain_text).join('') || '(no title)';
  const metaTitle = p.properties['Meta Title']?.rich_text?.map(t => t.plain_text).join('') || '';
  const metaDesc = p.properties['Meta Description']?.rich_text?.map(t => t.plain_text).join('') || '';
  const slug = p.properties.Slug?.rich_text?.map(t => t.plain_text).join('') || '';
  const aid = p.properties.Author?.relation?.[0]?.id || '';
  const date = p.properties.Date?.date?.start || '';
  const publish = p.properties.Publish?.checkbox || false;

  let authorLabel = 'none';
  if (aid === AUTHOR_1000SSAM) authorLabel = '1000쌤';
  else if (aid === AUTHOR_CHEMIGA) authorLabel = '케미가체질';
  else if (aid) authorLabel = aid;

  const body = await notion.getPageMarkdown(p.id);

  // 본문 구조 체크
  const hasSnippetCallout = /<callout[^>]*color="blue_bg"[^>]*>[\s\S]{0,800}읽기[^<]*분/.test(body);
  const hasInfoBox = /\*\*제작자\*\*|\*\*가격\*\*/.test(body);
  const hasClosingSummary = /핵심 정리/.test(body);
  const h1Count = (body.match(/^# /gm) || []).length;
  const calloutCount = (body.match(/<callout/g) || []).length;

  // 가격 추정
  const market_tpl = marketBySlug.get(slug);
  let pricePolicy = null;
  if (market_tpl) {
    if (market_tpl.price === 0 || market_tpl.price == null) pricePolicy = 'free';
    else pricePolicy = `paid:$${market_tpl.price}`;
  }

  // 본문 가격 표기
  const bodyMentionsFree = /무료/.test(body);
  const bodyMentionsPaid = /\$\d|\d{1,3},\d{3}원|유료/.test(body);

  let priceConflict = null;
  if (market_tpl) {
    if (market_tpl.price > 0 && bodyMentionsFree && !bodyMentionsPaid) priceConflict = '실제 유료인데 본문은 "무료"로만 표기';
    if ((market_tpl.price === 0 || market_tpl.price == null) && bodyMentionsPaid && !bodyMentionsFree) priceConflict = '실제 무료인데 본문은 "유료"로 표기';
  }

  audits.push({
    title, slug, authorLabel, metaTitle, metaDesc, date, publish,
    pageId: p.id,
    bodyLen: body.length,
    metaTitleLen: metaTitle.length,
    metaDescLen: metaDesc.length,
    metaComplete: metaTitle.length > 0 && metaDesc.length > 0 && slug.length > 0,
    authorComplete: aid === AUTHOR_1000SSAM || aid === AUTHOR_CHEMIGA,
    hasSnippetCallout, hasInfoBox, hasClosingSummary, h1Count, calloutCount,
    market_tpl,
    pricePolicy,
    priceConflict,
    bodyMentionsFree, bodyMentionsPaid,
  });
}

// =================================================
// 리포트 출력
// =================================================

console.log('='.repeat(70));
console.log('SECTION 1: 메타 정보 점검');
console.log('='.repeat(70));
const metaIssues = audits.filter(a => !a.metaComplete);
console.log(`\n메타 누락: ${metaIssues.length}건\n`);
for (const a of metaIssues) {
  const missing = [];
  if (a.metaTitleLen === 0) missing.push('Meta Title');
  if (a.metaDescLen === 0) missing.push('Meta Description');
  if (!a.slug) missing.push('Slug');
  console.log(`  ✗ [${a.authorLabel}] ${a.title}`);
  console.log(`    누락: ${missing.join(', ')}`);
  console.log(`    ID: ${a.pageId}`);
}

const authorIssues = audits.filter(a => !a.authorComplete);
console.log(`\n\nAuthor 누락 (none): ${authorIssues.length}건\n`);
for (const a of authorIssues) {
  console.log(`  ✗ ${a.title}`);
  console.log(`    Slug: ${a.slug || '(없음)'} | Publish: ${a.publish}`);
}

const dateIssues = audits.filter(a => !a.date && a.metaComplete);
console.log(`\n\nDate 누락 (단, 메타 채워진 글만): ${dateIssues.length}건\n`);
for (const a of dateIssues) {
  console.log(`  ✗ [${a.authorLabel}] ${a.title} (${a.slug})`);
}

// =================================================
console.log('\n\n' + '='.repeat(70));
console.log('SECTION 2: 본문 흐름 통일성 점검');
console.log('='.repeat(70));

const flowIssues = audits.filter(a => !a.hasSnippetCallout || !a.hasInfoBox || !a.hasClosingSummary);
console.log(`\n흐름 미준수: ${flowIssues.length}건 (스니펫 콜아웃 + 정보 박스 + 핵심 정리 콜아웃 모두 있어야 통과)\n`);
for (const a of flowIssues) {
  const missing = [];
  if (!a.hasSnippetCallout) missing.push('스니펫 콜아웃');
  if (!a.hasInfoBox) missing.push('기본 정보 박스');
  if (!a.hasClosingSummary) missing.push('핵심 정리');
  console.log(`  ✗ [${a.authorLabel}] ${a.title} (${a.slug || '?'})`);
  console.log(`    누락: ${missing.join(', ')} | H1=${a.h1Count}, callout=${a.calloutCount}, 본문=${a.bodyLen}자`);
}

// =================================================
console.log('\n\n' + '='.repeat(70));
console.log('SECTION 3: 가격 표기 점검');
console.log('='.repeat(70));

console.log('\n[3-1] 마켓플레이스 가격 ↔ 본문 표기 충돌\n');
const priceConflicts = audits.filter(a => a.priceConflict);
if (priceConflicts.length === 0) {
  console.log('  ✅ 충돌 없음');
} else {
  for (const a of priceConflicts) {
    console.log(`  ✗ [${a.authorLabel}] ${a.title} (${a.slug})`);
    console.log(`    마켓 정책: ${a.pricePolicy} | 충돌: ${a.priceConflict}`);
  }
}

console.log('\n[3-2] 마켓플레이스에 있는데 본문에 가격 표기 없음\n');
const noPriceMention = audits.filter(a => a.market_tpl && !a.bodyMentionsFree && !a.bodyMentionsPaid && a.metaComplete);
for (const a of noPriceMention) {
  console.log(`  ⚠ [${a.authorLabel}] ${a.title} (${a.slug}) — 정책: ${a.pricePolicy}`);
}

console.log('\n[3-3] 마켓플레이스 가격 분포 (참고)\n');
for (const t of market) {
  const status = t.price === 0 || t.price == null ? '무료' : `$${t.price}`;
  console.log(`  ${status.padEnd(8)} ${t.slug.padEnd(35)} ${t.name}`);
}

// =================================================
console.log('\n\n' + '='.repeat(70));
console.log('SECTION 4: 마켓플레이스 ↔ DB 매칭');
console.log('='.repeat(70));

const dbSlugs = new Set(audits.map(a => a.slug).filter(s => s));
const marketSlugs = new Set(market.map(t => t.slug));

const inMarketNotInDb = [...marketSlugs].filter(s => !dbSlugs.has(s));
console.log(`\n[4-1] 마켓에 있지만 DB에 없음 (누락): ${inMarketNotInDb.length}건\n`);
for (const s of inMarketNotInDb) {
  const t = marketBySlug.get(s);
  console.log(`  ✗ ${s} — ${t.name}`);
}

const inDbNotInMarket = [...dbSlugs].filter(s => !marketSlugs.has(s));
console.log(`\n[4-2] DB에 있지만 마켓에 없음 (정리 후보): ${inDbNotInMarket.length}건\n`);
for (const s of inDbNotInMarket) {
  const a = audits.find(x => x.slug === s);
  console.log(`  ⚠ ${s} — ${a?.title} [${a?.authorLabel}]`);
}

console.log(`\n[4-3] 슬러그 중복 (DB 내 같은 slug 2건+):\n`);
let dupCount = 0;
for (const [slug, pages] of slugCount.entries()) {
  if (pages.length > 1 && slug !== '(no-slug)') {
    dupCount++;
    console.log(`  ✗ ${slug} (${pages.length}건)`);
    for (const p of pages) {
      const titleProp = Object.values(p.properties).find(x => x.type === 'title');
      const title = titleProp?.title?.map(t => t.plain_text).join('') || '(no title)';
      const publish = p.properties.Publish?.checkbox || false;
      console.log(`    - ${title} | Publish=${publish} | ${p.id}`);
    }
  }
}
if (dupCount === 0) console.log('  ✅ 슬러그 중복 없음');

console.log(`\n[4-4] 슬러그 없는 페이지:\n`);
const noSlug = audits.filter(a => !a.slug);
for (const a of noSlug) {
  console.log(`  ✗ [${a.authorLabel}] ${a.title} | ${a.pageId}`);
}
if (noSlug.length === 0) console.log('  ✅ 슬러그 누락 없음');

// =================================================
console.log('\n\n' + '='.repeat(70));
console.log('SECTION 5: 노션 기본 샘플 / 비-1000쌤 콘텐츠');
console.log('='.repeat(70));

const nonOurs = audits.filter(a => a.authorLabel === 'none' || a.authorLabel === '케미가체질');
console.log(`\n${nonOurs.length}건\n`);
for (const a of nonOurs) {
  const isMarket = a.market_tpl ? '✓ 마켓 매칭' : '— 마켓 없음';
  console.log(`  [${a.authorLabel}] ${a.title}`);
  console.log(`    Slug: ${a.slug} | ${isMarket} | Publish: ${a.publish}`);
}

// =================================================
console.log('\n\n' + '='.repeat(70));
console.log('총평 요약');
console.log('='.repeat(70));
console.log(`총 점검 대상: ${audits.length}건`);
console.log(`  - 메타 누락: ${metaIssues.length}`);
console.log(`  - Author 누락: ${authorIssues.length}`);
console.log(`  - Date 누락(메타완성건): ${dateIssues.length}`);
console.log(`  - 본문 흐름 미준수: ${flowIssues.length}`);
console.log(`  - 가격 충돌: ${priceConflicts.length}`);
console.log(`  - 마켓 누락: ${inMarketNotInDb.length}`);
console.log(`  - DB only: ${inDbNotInMarket.length}`);
console.log(`  - 슬러그 중복: ${dupCount}`);
