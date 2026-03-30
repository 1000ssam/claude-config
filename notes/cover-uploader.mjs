import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const DOWNLOAD_DIR = 'C:/dev/notes/covers';
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// ── Title → English keyword mapping ──
function titleToKeywords(title) {
  const t = title.toLowerCase();

  // Event/community posts
  if (t.includes('이벤트') || t.includes('마감') || t.includes('종료') || t.includes('모집'))
    return 'community celebration event colorful';
  if (t.includes('스승의 날')) return 'teacher appreciation flowers';
  if (t.includes('맛집')) return 'food map restaurant';
  if (t.includes('자랑대회') || t.includes('우수작')) return 'award trophy showcase';

  // AI related
  if (t.includes('ai agent')) return 'AI artificial intelligence agent';
  if (t.includes('ai 프롬프트') || t.includes('메타 프롬프트')) return 'AI prompt writing';
  if (t.includes('ai 모델') || t.includes('생기부')) return 'AI education student report';
  if (t.includes('ai') && t.includes('수식')) return 'AI formula mathematics';
  if (t.includes('ai') && t.includes('데이터베이스')) return 'AI data transformation';
  if (t.includes('ai') && t.includes('아카이빙')) return 'AI document archiving';
  if (t.includes('ai') && t.includes('대화')) return 'AI chatbot conversation';
  if (t.includes('claude') || t.includes('mcp')) return 'AI automation Claude API';
  if (t.includes('genspark')) return 'AI video editing technology';

  // Automation
  if (t.includes('자동화') && t.includes('채점')) return 'automation grading education';
  if (t.includes('자동화') && t.includes('이메일')) return 'email automation notification';
  if (t.includes('자동화') && t.includes('문자')) return 'message automation smartphone';
  if (t.includes('자동화') && t.includes('날짜')) return 'calendar automation date';
  if (t.includes('자동화') && t.includes('뉴스레터')) return 'newsletter email automation';
  if (t.includes('자동화') || t.includes('make')) return 'workflow automation integration';
  if (t.includes('canva') && t.includes('카드뉴스')) return 'Canva design card news';

  // Database
  if (t.includes('업무 관리') || t.includes('업무 대시보드')) return 'task management dashboard productivity';
  if (t.includes('예산')) return 'budget finance spreadsheet';
  if (t.includes('명렬표') || t.includes('학생')) return 'student roster education classroom';
  if (t.includes('독서')) return 'reading books library';
  if (t.includes('익명 질문') || t.includes('무물')) return 'anonymous question survey';
  if (t.includes('회비')) return 'accounting finance calculation';
  if (t.includes('자료실')) return 'shared resources folder organization';
  if (t.includes('데이터베이스') && t.includes('템플릿')) return 'database template organization';
  if (t.includes('데이터베이스') && t.includes('보기')) return 'database view filter table';
  if (t.includes('데이터베이스') && t.includes('이름 규칙')) return 'naming convention label organization';
  if (t.includes('데이터베이스') && t.includes('조건부 색상')) return 'colorful highlight data';
  if (t.includes('데이터베이스') && t.includes('캘린더')) return 'calendar schedule planner';
  if (t.includes('데이터베이스') && t.includes('선택 옵션')) return 'dropdown select options settings';
  if (t.includes('데이터베이스')) return 'database organization structured data';

  // Formula & math
  if (t.includes('수식') && t.includes('편집창')) return 'formula editor code';
  if (t.includes('수식') && t.includes('주말')) return 'calendar weekday calculation';
  if (t.includes('수학 공식') || t.includes('katex')) return 'math equation formula';
  if (t.includes('수식')) return 'formula calculation mathematics';

  // Page design & editing
  if (t.includes('미니멀') || t.includes('꾸미')) return 'minimal clean design aesthetic';
  if (t.includes('이모지') && t.includes('커스텀')) return 'emoji customization design';
  if (t.includes('이모지')) return 'emoji icons colorful';
  if (t.includes('편집 제안') || t.includes('피드백')) return 'feedback collaboration editing';
  if (t.includes('편집') && t.includes('블록')) return 'text editing blocks writing';

  // Sharing & publishing
  if (t.includes('게시') && t.includes('안내')) return 'publish share document';
  if (t.includes('게시') && t.includes('만료일')) return 'expiration date setting';
  if (t.includes('공유 설정') || t.includes('교무실')) return 'team collaboration office sharing';
  if (t.includes('복제 링크')) return 'link sharing clipboard';
  if (t.includes('인증 뱃지') || t.includes('certified')) return 'certification badge achievement';

  // iOS & mobile
  if (t.includes('ios 단축어')) return 'iPhone shortcut mobile app';
  if (t.includes('기프티콘')) return 'gift card coupon mobile';

  // Specific tools & features
  if (t.includes('피드 뷰')) return 'social media feed scrolling';
  if (t.includes('번역')) return 'language translation globe';
  if (t.includes('동기화 블록')) return 'sync connection link';
  if (t.includes('하위 페이지')) return 'page hierarchy tree structure';
  if (t.includes('버튼 블록')) return 'button interface click UI';
  if (t.includes('차트')) return 'chart graph data visualization';
  if (t.includes('관계형 속성') || t.includes('양식')) return 'form survey data collection';
  if (t.includes('pdf')) return 'PDF document upload';
  if (t.includes('엑셀') && t.includes('가져오')) return 'Excel import spreadsheet';
  if (t.includes('엑셀') && t.includes('진도표')) return 'schedule progress tracking education';
  if (t.includes('pt') || t.includes('gamma')) return 'presentation slides design';
  if (t.includes('유튜브') || t.includes('음악')) return 'music headphones listening';
  if (t.includes('텍스트 링크') || t.includes('단축키')) return 'keyboard shortcut typing fast';
  if (t.includes('아이콘 숨기기')) return 'clean minimal hide icon';
  if (t.includes('오류') || t.includes('캐시')) return 'error fix troubleshooting repair';

  // Getting started & guides
  if (t.includes('처음 시작') || t.includes('가입')) return 'getting started beginner guide';
  if (t.includes('공식 도움말') || t.includes('공식 가이드')) return 'documentation help guide book';
  if (t.includes('웨비나') || t.includes('다시보기')) return 'webinar online video seminar';
  if (t.includes('연수') || t.includes('강의') || t.includes('강사')) return 'education training workshop classroom';
  if (t.includes('교육용') || t.includes('요금제')) return 'education plan pricing';
  if (t.includes('교무수첩')) return 'teacher planner notebook school';

  // Default: Notion productivity
  return 'Notion productivity workspace organization';
}

// ── Unsplash search via napi ──
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`JSON parse error for ${url}: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(dest); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function searchUnsplash(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
  try {
    const data = await fetchJSON(url);
    if (data.results && data.results.length > 0) {
      // Pick the first result with good dimensions
      for (const r of data.results) {
        if (r.urls?.regular) {
          return {
            url: r.urls.regular,
            credit: r.user?.name || 'Unknown',
            unsplashUrl: r.links?.html
          };
        }
      }
    }
  } catch (e) {
    console.error(`  Unsplash search failed for "${query}": ${e.message}`);
  }
  return null;
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
  console.log(`Found ${noCover.length} published posts without cover`);

  let success = 0, failed = 0;
  const failures = [];

  for (let i = 0; i < noCover.length; i++) {
    const page = noCover[i];
    let title = '(no title)';
    for (const [, val] of Object.entries(page.properties || {})) {
      if (val.type === 'title' && val.title?.[0]?.plain_text) {
        title = val.title[0].plain_text;
        break;
      }
    }

    console.log(`\n[${i + 1}/${noCover.length}] "${title}"`);

    try {
      // 1. Generate keywords
      const keywords = titleToKeywords(title);
      console.log(`  Keywords: ${keywords}`);

      // 2. Search Unsplash
      let imageResult = await searchUnsplash(keywords);

      // Fallback: try simpler keywords
      if (!imageResult) {
        const fallback = keywords.split(' ').slice(0, 2).join(' ');
        console.log(`  Retrying with: ${fallback}`);
        imageResult = await searchUnsplash(fallback);
      }

      // Second fallback: generic productivity
      if (!imageResult) {
        console.log(`  Retrying with generic keyword`);
        imageResult = await searchUnsplash('productivity workspace minimal');
      }

      if (!imageResult) {
        console.log(`  FAILED: No image found`);
        failed++;
        failures.push(title);
        continue;
      }

      console.log(`  Image by: ${imageResult.credit}`);

      // 3. Download image
      const filename = `cover_${i}.jpg`;
      const filepath = path.join(DOWNLOAD_DIR, filename);
      await downloadFile(imageResult.url, filepath);

      // Check file size
      const stats = fs.statSync(filepath);
      if (stats.size < 1000) {
        console.log(`  FAILED: Downloaded file too small (${stats.size} bytes)`);
        failed++;
        failures.push(title);
        continue;
      }

      console.log(`  Downloaded: ${(stats.size / 1024).toFixed(1)}KB`);

      // 4. Upload as cover to Notion
      await notion.setCover(page.id, filepath);
      console.log(`  ✓ Cover set!`);
      success++;

      // Clean up downloaded file
      fs.unlinkSync(filepath);

      // Rate limit: small delay between requests
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      failed++;
      failures.push(title);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done! Success: ${success}, Failed: ${failed}`);
  if (failures.length > 0) {
    console.log(`\nFailed posts:`);
    failures.forEach(t => console.log(`  - ${t}`));
  }
}

main().catch(console.error);
