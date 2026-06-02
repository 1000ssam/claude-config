import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const res = await notion.call('GET', `/blocks/${PAGE}/children?page_size=200`);
const txt = (b) => {
  const t = b[b.type];
  if (t?.rich_text) return t.rich_text.map(r => r.plain_text).join('');
  return '';
};
for (const b of res.results) {
  let label = txt(b).slice(0, 70);
  if (b.type === 'callout') label = `[${b.callout.color}] ${label}`;
  if (b.type === 'image') label = '(image)';
  if (b.type === 'divider') label = '———';
  if (b.type === 'child_database') label = 'DB: ' + (b.child_database?.title || '');
  console.log(`${b.type.padEnd(20)} ${label}`);
}
