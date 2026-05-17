import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const ids = [
  { id: '2f4dd1dc-d644-80d0-9885-dbbb41a98e39', label: 'mandatory-training-2025' },
  { id: '2f4dd1dc-d644-8007-9c9c-f82f09c8f578', label: 'notion-class-placement' },
  { id: '2f4dd1dc-d644-80a7-822d-c40d45f41848', label: 'notion-study-time-tracker' },
  { id: '2f4dd1dc-d644-8014-b08b-e84fd11c15fe', label: 'notion-make-class-challenge' },
  { id: '2f4dd1dc-d644-80b7-9004-df063b9748e3', label: 'student-sticker-board' },
  { id: '2f4dd1dc-d644-80b6-8256-cb61a72c7618', label: 'autumn-dashboard-template' },
  { id: '2f4dd1dc-d644-80de-b489-d8f174f9ae79', label: 'notion-progress-macro' },
  { id: '2f4dd1dc-d644-80d8-a805-f787471ecb5b', label: 'ultimate-teachers-log' },
];

for (const { id, label } of ids) {
  const page = await notion.call('GET', `/pages/${id}`);
  const titleProp = Object.values(page.properties).find(x => x.type === 'title');
  const title = titleProp?.title?.map(t => t.plain_text).join('');
  const slug = page.properties.Slug?.rich_text?.map(t => t.plain_text).join('');
  const body = await notion.getPageMarkdown(id);
  console.log('='.repeat(70));
  console.log(`[${label}]`);
  console.log(`Title: ${title}`);
  console.log(`Slug: ${slug}`);
  console.log(`Body length: ${body.length}`);
  console.log('---');
  console.log(body.slice(0, 1500));
  if (body.length > 1500) console.log(`...(+${body.length - 1500} more chars)`);
  console.log('');
}
