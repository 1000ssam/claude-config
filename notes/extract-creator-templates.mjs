import { readFileSync, writeFileSync } from 'fs';

const html = readFileSync('/tmp/creator.html', 'utf-8');

// Extract __NEXT_DATA__ JSON
const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) {
  console.error('NEXT_DATA not found');
  process.exit(1);
}

const data = JSON.parse(m[1]);

// Save full JSON for inspection
writeFileSync('/tmp/creator-data.json', JSON.stringify(data, null, 2));

// Try common locations for templates
const profile = data.props?.pageProps?.marketplaceProfile;
console.log('Profile name:', profile?.name);
console.log('Number of templates:', profile?.number_of_templates);

// Look for template list
const keys = Object.keys(data.props?.pageProps || {});
console.log('\npageProps keys:', keys);

// Try templates array
const templates = data.props?.pageProps?.templates || data.props?.pageProps?.posts || data.props?.pageProps?.contents;
if (templates && Array.isArray(templates)) {
  console.log(`\nFound ${templates.length} templates:\n`);
  for (const t of templates) {
    console.log(`■ ${t.title || t.name || '(no title)'}`);
    console.log(`  slug: ${t.slug || t.id}`);
    console.log(`  free: ${t.is_free ?? t.free ?? '?'}, price: ${t.price ?? '?'}`);
    console.log('');
  }
} else {
  console.log('\nNo templates array directly. Search recursively...');
  // Recursive search for arrays of objects with "slug" property
  function search(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      if (obj.length > 0 && obj[0] && typeof obj[0] === 'object' && (obj[0].slug || obj[0].url_slug)) {
        console.log(`Found candidate at ${path} (length ${obj.length})`);
        console.log('First item keys:', Object.keys(obj[0]).slice(0, 15));
      }
      obj.forEach((v, i) => search(v, `${path}[${i}]`));
    } else {
      for (const [k, v] of Object.entries(obj)) search(v, `${path}.${k}`);
    }
  }
  search(data);
}
