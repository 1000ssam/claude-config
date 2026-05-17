import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const BLOG_DB = '2f4dd1dc-d644-81d5-ac29-fe1404e69381';
const AUTHOR = '2f4dd1dc-d644-812c-b1fe-e4f273ca2ddd';

const shells = [
  { key: 'B', slug: 'notion-b2b-agent-shift',
    title: "[초안] 노션의 B2B 대전환 — DB 도구에서 '에이전트 운영환경'으로",
    metaTitle: '노션의 B2B 대전환 — 에이전트 운영환경 전략 분석 | 노션톡',
    metaDesc: '노션이 개발자 플랫폼으로 그리는 B2B 대전환 — 데이터베이스 도구를 넘어 에이전트 운영환경이 되려는 전략을 분석했습니다.' },
  { key: 'C', slug: 'notion-workers-pricing',
    title: '[초안] 노션 Workers, 얼마나 들까 — 크레딧 과금 정책 정리',
    metaTitle: '노션 Workers 크레딧 과금 정책 — 비용 정리 | 노션톡',
    metaDesc: '노션 Workers의 크레딧 과금 정책 — 2026년 8월 11일 유료 전환, per-run 비용 구조, 크레딧 아끼는 법을 정리했습니다.' },
];

for (const s of shells) {
  const p = await notion.createPage(BLOG_DB, {
    'Post Title': notion.prop.title(s.title),
    'Slug': notion.prop.richText(s.slug),
    'Meta Title': notion.prop.richText(s.metaTitle),
    'Meta Description': notion.prop.richText(s.metaDesc),
    'Author': notion.prop.relation([AUTHOR]),
    'Publish': notion.prop.checkbox(false),
  });
  console.log(`${s.key}\t${p.id}\t${p.url}`);
}
