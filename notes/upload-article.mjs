import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
import { readFileSync } from 'fs';

const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';
const AUTHOR_1000SSAM = '2f4dd1dc-d644-8110-b8b7-ef4350a25149';

const POST_TITLE = 'AI 독서노트 LITE 노션 템플릿 - 책을 삶에 적용하는 무료 독서기록';
const META_TITLE = 'AI 독서노트 LITE - AI 철학 질문으로 깊어지는 무료 노션 템플릿 | 노션톡';
const META_DESCRIPTION = '기록만 쌓이고 책이 삶에 남지 않나요? AI 독서노트 LITE는 인용·인사이트에 AI 철학 질문을 더해 책을 행동으로 이어줍니다. 평점 4.95 무료 템플릿 지금 복제하세요.';
const SLUG = 'ai-booknote-lite-template';

const body = readFileSync('/mnt/c/dev/notes/article-body.md', 'utf-8');

// 1) 페이지 생성
const page = await notion.createPage(TEMPLATES_DB, {
  'Post Title': notion.prop.title(POST_TITLE),
  'Meta Title': notion.prop.richText(META_TITLE),
  'Meta Description': notion.prop.richText(META_DESCRIPTION),
  'Slug': notion.prop.richText(SLUG),
  'Author': notion.prop.relation(AUTHOR_1000SSAM),
  'Date': notion.prop.date('2026-05-04'),
  'Featured': notion.prop.checkbox(false),
  'Publish': notion.prop.checkbox(false),
});

console.log('Page created:', page.id);
console.log('URL:', page.url);

// 2) 본문 마크다운 업로드
await notion.updatePageMarkdown(page.id, body);
console.log('Body uploaded.');

console.log('\n=== Done ===');
console.log(`Page URL: ${page.url}`);
