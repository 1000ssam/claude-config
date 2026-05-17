import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs';
import fs from 'fs';
import path from 'path';

const DOWNLOAD_DIR = 'C:/dev/notes/covers';
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// ── Pexels image pool by category (photo IDs) ──
const imagePool = {
  productivity: [7670738, 5208881, 7476975, 5971288, 6204564, 3987019, 1229862, 3987013, 7439134, 3184454, 4006158, 6893338, 5412270, 577560, 5928998, 5827775, 3944802, 5797997, 6592630, 7255730, 6893893, 16347, 5208324, 3747070],
  database: [7735708, 7821914, 7376, 7821578, 1148820, 6549358, 6549923, 7688365, 590041, 6779570, 7735778, 7054399, 6694560, 6549629, 7580704, 7054415, 6120168, 7735769, 6779714, 3195784, 7658313, 669617, 5083397, 6694492],
  automation: [5716007, 4198373, 3862374, 6803551, 7485213, 6914056, 171198, 3862599, 7439127, 265087, 1181345, 38519, 3862605, 6153343, 3862630, 4604607, 4955393, 4623084, 5668861],
  ai: [2599244, 5181148, 6153345, 4102557, 2085831, 6019019, 7688592, 6153740, 7688766, 7688748, 3913025, 7688545, 6153065, 6153362],
  formula: [4494641, 6256258, 6256066, 6256253, 6256102, 6238068, 5310565, 6238026, 6325967, 3649874, 3729557, 5775, 6209870, 6238030, 5238132, 4494634, 5184946, 5184955, 6256072, 167682, 240163],
  education: [2675050, 5428003, 5212329, 256395, 3231359, 5211431, 5299833, 2675061, 289740, 6992138, 5212337, 6827520, 5428262, 289737, 265076, 5428013, 5212336, 5428014, 5212342, 4255727],
};

// Track used images to avoid duplicates
const usedImages = new Set();

function getImageUrl(photoId) {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
}

function pickImage(category) {
  const pool = imagePool[category] || imagePool.productivity;
  for (const id of pool) {
    if (!usedImages.has(id)) {
      usedImages.add(id);
      return getImageUrl(id);
    }
  }
  // If all used in this category, fall back to productivity
  if (category !== 'productivity') {
    for (const id of imagePool.productivity) {
      if (!usedImages.has(id)) {
        usedImages.add(id);
        return getImageUrl(id);
      }
    }
  }
  // Last resort: reuse first from category
  return getImageUrl(pool[0]);
}

// ── Title → category mapping ──
function categorize(title) {
  const t = title.toLowerCase();

  // Events (마감/종료/이벤트/모집)
  if (t.includes('이벤트') || t.includes('마감') || t.includes('종료') || t.includes('모집') || t.includes('스승의 날'))
    return 'education';

  // AI
  if (t.includes('ai') || t.includes('claude') || t.includes('mcp') || t.includes('genspark') || t.includes('생기부'))
    return 'ai';

  // Automation
  if (t.includes('자동화') || t.includes('자동 ') || t.includes('make') || t.includes('canva') || t.includes('뉴스레터'))
    return 'automation';

  // Formula / Math
  if (t.includes('수식') || t.includes('수학') || t.includes('katex') || t.includes('계산') || t.includes('formula'))
    return 'formula';

  // Education specific
  if (t.includes('학생') || t.includes('교사') || t.includes('교무') || t.includes('연수') || t.includes('강의') || t.includes('강사')
    || t.includes('학업') || t.includes('학기') || t.includes('양식') || t.includes('형성평가') || t.includes('교육용') || t.includes('요금제'))
    return 'education';

  // Database
  if (t.includes('데이터베이스') || t.includes('관계형') || t.includes('차트') || t.includes('예산') || t.includes('회비')
    || t.includes('명렬표') || t.includes('독서') || t.includes('업무 관리') || t.includes('대시보드') || t.includes('자료실'))
    return 'database';

  // Default: productivity (Notion basics, editing, pages, sharing, etc.)
  return 'productivity';
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
  return buffer.length;
}

// ── Main ──
async function main() {
  const dsId = '2f4dd1dc-d644-8180-a79f-000b4526f294';

  // Get all pages
  let allPages = [];
  let cursor = undefined;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await notion.call('POST', `/data_sources/${dsId}/query`, body);
    allPages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);

  const noCover = allPages.filter(p => !p.cover && p.properties?.Publish?.checkbox === true);
  console.log(`Found ${noCover.length} published posts without cover\n`);

  let success = 0, failed = 0;
  const failures = [];
  const results = [];

  for (let i = 0; i < noCover.length; i++) {
    const page = noCover[i];
    let title = '(no title)';
    for (const [, val] of Object.entries(page.properties || {})) {
      if (val.type === 'title' && val.title?.[0]?.plain_text) {
        title = val.title[0].plain_text;
        break;
      }
    }

    const category = categorize(title);
    const imageUrl = pickImage(category);
    const filepath = path.join(DOWNLOAD_DIR, `cover_${i}.jpg`);

    console.log(`[${i + 1}/${noCover.length}] ${category.padEnd(12)} | "${title.slice(0, 50)}..."`);

    try {
      // Download
      const size = await downloadImage(imageUrl, filepath);
      if (size < 5000) throw new Error(`File too small: ${size} bytes`);

      // Upload as cover
      await notion.setCover(page.id, filepath);
      console.log(`  ✓ ${(size / 1024).toFixed(0)}KB uploaded`);
      success++;
      results.push({ title: title.slice(0, 40), category, status: 'ok' });

      // Cleanup
      fs.unlinkSync(filepath);

      // Small delay for rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
      failed++;
      failures.push(title);
      results.push({ title: title.slice(0, 40), category, status: 'fail', error: e.message });
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Complete! Success: ${success} / Failed: ${failed} / Total: ${noCover.length}`);
  if (failures.length > 0) {
    console.log(`\nFailed:`);
    failures.forEach(t => console.log(`  - ${t}`));
  }

  // Write summary for Slack
  fs.writeFileSync('C:/dev/notes/cover-result.json', JSON.stringify({ success, failed, total: noCover.length, failures }, null, 2));
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
