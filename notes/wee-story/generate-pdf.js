const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 브라우저 시작...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'wee-story-proposal.html');
  const outputPath = path.resolve(__dirname, 'wee-story-proposal.pdf');

  console.log('📄 HTML 로드 중...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Google Fonts 로드 대기
  console.log('⏳ 폰트 로드 대기...');
  await new Promise(r => setTimeout(r, 2000));

  console.log('🖨️  PDF 생성 중...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`✅ 완료: ${outputPath}`);
})();
