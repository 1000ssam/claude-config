import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const PAGE_ID = '2f4dd1dc-d644-8098-b5da-ea59e294c4f4';

const page = await notion.call('GET', `/pages/${PAGE_ID}`);
console.log('=== 메타 속성 ===');
const titleProp = Object.values(page.properties).find(x => x.type === 'title');
console.log('Post Title:', titleProp?.title?.map(t => t.plain_text).join(''));
console.log('Slug:', page.properties['Slug']?.rich_text?.map(t => t.plain_text).join(''));
console.log('Meta Title:', page.properties['Meta Title']?.rich_text?.map(t => t.plain_text).join(''));
console.log('Meta Description:', page.properties['Meta Description']?.rich_text?.map(t => t.plain_text).join(''));
console.log('Author:', page.properties.Author?.relation?.[0]?.id || 'none');
console.log('Publish:', page.properties.Publish?.checkbox);
console.log('Date:', page.properties.Date?.date?.start);

console.log('\n=== 본문 ===');
const body = await notion.getPageMarkdown(PAGE_ID);
console.log(`길이: ${body.length}자`);
console.log(body.slice(0, 500));
