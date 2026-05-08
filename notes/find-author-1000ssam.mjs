import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const AUTHOR_DB = '2f4dd1dc-d644-8125-bceb-fddec7d21ca5';

const db = await notion.call('GET', `/databases/${AUTHOR_DB}`);
const dsId = db.data_sources?.[0]?.id;

const result = await notion.call('POST', `/data_sources/${dsId}/query`, { page_size: 50 });
console.log('Author DB pages:');
for (const p of result.results) {
  const titleProp = Object.values(p.properties).find(x => x.type === 'title');
  const title = titleProp?.title?.[0]?.plain_text || '(no title)';
  console.log(`- ${title} | id: ${p.id}`);
}
