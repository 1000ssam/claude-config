import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const queries = ['스킬', 'Skill', 'skill', '스킬 DB'];
const seen = new Map();
for (const q of queries) {
  try {
    const dbs = await notion.search(q, { filter: 'database' });
    for (const d of (dbs.results || dbs || [])) {
      const id = d.id;
      const title = (d.title || []).map(t => t.plain_text).join('') || '(제목없음)';
      const url = d.url || '';
      if (!seen.has(id)) seen.set(id, { title, url, id });
    }
  } catch (e) {
    console.error('search err', q, e.message);
  }
}
console.log('=== DATABASES matching skill ===');
for (const [id, v] of seen) {
  console.log(`- ${v.title}\n    id: ${id}\n    url: ${v.url}`);
}
console.log(`\ntotal: ${seen.size}`);
