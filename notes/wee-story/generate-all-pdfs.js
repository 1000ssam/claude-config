const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SRC_HTML = path.resolve(__dirname, 'wee-story-proposal.html');
const COMPANIES = [
  { slug: 'visang',  name: '비상교육' },
  { slug: 'chunjae', name: '천재교육' },
  { slug: 'mirae-n', name: '미래엔'   },
];

(async () => {
  const src = fs.readFileSync(SRC_HTML, 'utf8');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const { slug, name } of COMPANIES) {
    const dir = path.resolve(__dirname, `proposal-${slug}`);
    fs.mkdirSync(dir, { recursive: true });

    // 1) 회사명 치환 — 긴 패턴 먼저
    const out = src
      .replaceAll('아이스크림미디어', name)
      .replaceAll('아이스크림', name);

    const htmlPath = path.join(dir, `wee-story-proposal-${slug}.html`);
    const pdfPath  = path.join(dir, `wee-story-proposal-${slug}.pdf`);
    fs.writeFileSync(htmlPath, out);

    // 2) PDF 렌더
    console.log(`📄 ${name} (${slug}) HTML 로드...`);
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.pdf({
      path: pdfPath,
      width: '1920px',
      height: '1080px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });
    await page.close();
    console.log(`✅ ${name} → ${pdfPath}`);
  }

  await browser.close();
  console.log('🎉 전체 완료');
})();
