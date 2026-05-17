import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const TEMPLATES_DB = '2f4dd1dc-d644-8156-b573-d8a469a8162a';
const AUTHOR_1000SSAM = '2f4dd1dc-d644-8110-b8b7-ef4350a25149';

const all = await notion.queryAll(TEMPLATES_DB);

console.log(`Total pages in templates DB: ${all.length}\n`);

const rows = all.map(p => {
  const titleProp = Object.values(p.properties).find(x => x.type === 'title');
  const title = titleProp?.title?.map(t => t.plain_text).join('') || '(no title)';
  const metaTitle = p.properties['Meta Title']?.rich_text?.map(t => t.plain_text).join('') || '';
  const metaDesc = p.properties['Meta Description']?.rich_text?.map(t => t.plain_text).join('') || '';
  const slug = p.properties['Slug']?.rich_text?.map(t => t.plain_text).join('') || '';
  const author = p.properties.Author?.relation?.[0]?.id || '';
  const publish = p.properties.Publish?.checkbox || false;
  const isOurs = author === AUTHOR_1000SSAM;
  return { title, metaTitle, metaDesc, slug, author, publish, isOurs, id: p.id };
});

console.log('=== 1000쌤 작성 글 ===');
const ours = rows.filter(r => r.isOurs);
console.log(`(총 ${ours.length}개)\n`);
for (const r of ours) {
  console.log(`■ ${r.title}`);
  console.log(`  Slug: ${r.slug}`);
  console.log(`  MetaTitle(${r.metaTitle.length}자): ${r.metaTitle}`);
  console.log(`  MetaDesc(${r.metaDesc.length}자): ${r.metaDesc}`);
  console.log(`  Publish: ${r.publish}`);
  console.log('');
}

console.log('=== 다른 작성자 / 작성자 미지정 글 ===');
const others = rows.filter(r => !r.isOurs);
for (const r of others) {
  console.log(`■ ${r.title} | author: ${r.author || 'none'} | slug: ${r.slug}`);
}
