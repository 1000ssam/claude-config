import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('/tmp/creator-data.json', 'utf-8'));
const market = [...(data.props?.pageProps?.pinnedTemplates||[]), ...(data.props?.pageProps?.nonPinnedTemplates||[])];

const fmt = (ms) => {
  if (!ms) return '-';
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
};

const rows = market.map(t => ({
  slug: t.slug,
  name: t.name,
  price: (t.price === 0 || t.price == null) ? '무료' : `$${t.price}`,
  created: fmt(t.created_at),
  updated: fmt(t.last_updated_at),
  createdMs: t.created_at,
}));

// 등록일 오름차순 정렬
rows.sort((a, b) => a.createdMs - b.createdMs);

console.log('=== 마켓 등록일 순 (오름차순) ===\n');
console.log('등록일       수정일       가격     슬러그                              이름');
console.log('-'.repeat(100));
for (const r of rows) {
  console.log(`${r.created}   ${r.updated}   ${r.price.padEnd(8)} ${r.slug.padEnd(35)} ${r.name}`);
}

console.log(`\n총 ${rows.length}개 템플릿`);
console.log(`최초 등록: ${rows[0].created} (${rows[0].name})`);
console.log(`최근 등록: ${rows[rows.length-1].created} (${rows[rows.length-1].name})`);
