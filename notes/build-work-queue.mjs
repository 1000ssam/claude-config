import { readFileSync, writeFileSync } from 'fs';
import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';
const AUTHOR_1000SSAM = '2f4dd1dc-d644-8110-b8b7-ef4350a25149';

// 1) NEXT_DATA에서 22개 템플릿 추출
const data = JSON.parse(readFileSync('/tmp/creator-data.json', 'utf-8'));
const pinned = data.props?.pageProps?.pinnedTemplates || [];
const nonPinned = data.props?.pageProps?.nonPinnedTemplates || [];
const galleryTemplates = [...pinned, ...nonPinned];
console.log(`Gallery: pinned=${pinned.length}, nonPinned=${nonPinned.length}, total=${galleryTemplates.length}`);

// 2) DB의 모든 1000쌤 글 조회 (author=1000쌤 OR author=none)
const all = await notion.queryAll(TEMPLATES_DB);

const dbBySlug = new Map();
for (const p of all) {
  const slug = p.properties['Slug']?.rich_text?.map(t => t.plain_text).join('') || '';
  if (slug) dbBySlug.set(slug, p);
}

// 3) 매칭 + SEO 컴플라이언스 판정
const workQueue = [];
const noMatch = [];

function checkSeoBody(markdown) {
  // 휴리스틱: 통합 스니펫 콜아웃 + 읽기시간 + H1 3+
  const hasSnippetCallout = /<callout[^>]*color="blue_bg"/.test(markdown) && /읽기.*분/.test(markdown);
  const h1Count = (markdown.match(/^# /gm) || []).length;
  const hasCallouts = (markdown.match(/<callout/g) || []).length;
  return {
    hasSnippetCallout,
    h1Count,
    calloutCount: hasCallouts,
    compliant: hasSnippetCallout && h1Count >= 3,
  };
}

function checkSeoMeta(p) {
  const metaTitle = p.properties['Meta Title']?.rich_text?.map(t => t.plain_text).join('') || '';
  const metaDesc = p.properties['Meta Description']?.rich_text?.map(t => t.plain_text).join('') || '';
  const slug = p.properties['Slug']?.rich_text?.map(t => t.plain_text).join('') || '';
  return {
    metaTitle,
    metaDesc,
    slug,
    metaTitleLen: metaTitle.length,
    metaDescLen: metaDesc.length,
    metaFilled: metaTitle.length > 0 && metaDesc.length > 0 && slug.length > 0,
  };
}

const results = [];
for (const t of galleryTemplates) {
  const dbPage = dbBySlug.get(t.slug);
  if (!dbPage) {
    results.push({ tpl: t, status: 'NO_DB_PAGE', action: 'CREATE_NEW' });
    continue;
  }
  const meta = checkSeoMeta(dbPage);
  if (!meta.metaFilled) {
    results.push({ tpl: t, dbPage, meta, status: 'META_EMPTY', action: 'CREATE_NEW' });
    continue;
  }
  // 메타 채워진 글 — 본문도 체크
  const body = await notion.getPageMarkdown(dbPage.id);
  const bodyCheck = checkSeoBody(body);
  if (!bodyCheck.compliant) {
    results.push({ tpl: t, dbPage, meta, bodyCheck, status: 'BODY_NOT_SEO', action: 'CREATE_NEW' });
  } else {
    results.push({ tpl: t, dbPage, meta, bodyCheck, status: 'OK', action: 'SKIP' });
  }
}

console.log('\n=== 작업 큐 ===\n');
console.log(`Total gallery templates: ${galleryTemplates.length}\n`);

const create = results.filter(r => r.action === 'CREATE_NEW');
const skip = results.filter(r => r.action === 'SKIP');

console.log(`✅ SEO 컴플라이언트 (skip): ${skip.length}개`);
for (const r of skip) {
  console.log(`  - ${r.tpl.name} (${r.tpl.slug})`);
}

console.log(`\n📝 새 페이지 생성 필요: ${create.length}개`);
for (const r of create) {
  let reason = r.status;
  if (r.status === 'BODY_NOT_SEO') {
    reason += ` (snippet=${r.bodyCheck.hasSnippetCallout}, h1=${r.bodyCheck.h1Count})`;
  }
  console.log(`  - ${r.tpl.name} (${r.tpl.slug}) — ${reason}`);
}

// 큐 저장 (다음 단계에서 사용)
writeFileSync('/tmp/work-queue.json', JSON.stringify(create.map(r => ({
  name: r.tpl.name,
  slug: r.tpl.slug,
  description: r.tpl.description,
  tags: (r.tpl.tags || []).map(t => t.name || t),
  categories: (r.tpl.categories || []).map(c => c.name || c.slug),
  reason: r.status,
})), null, 2));

console.log('\n작업 큐 저장: /tmp/work-queue.json');
