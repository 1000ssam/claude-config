const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${path.resolve('/mnt/c/dev/notes/wee-story/wee-story-proposal.html')}`, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await new Promise(r => setTimeout(r, 1500));

  const data = await page.evaluate(() => {
    const result = [];
    const slides = document.querySelectorAll('.slide');
    [5, 6, 7, 8, 9].forEach(i => {  // slides 6, 7, 8, 9, 10
      const s = slides[i];
      const sb = s.querySelector('.slide-body');
      const split = s.querySelector('.split');
      const grid = split?.querySelector(':scope > div');
      const img = s.querySelector('img');
      const imgRect = img?.getBoundingClientRect();
      const slideRect = s.getBoundingClientRect();
      const splitRect = split?.getBoundingClientRect();
      const gridRect = grid?.getBoundingClientRect();
      result.push({
        slide: i + 1,
        slideHeight: slideRect.height,
        slideTop: slideRect.top,
        slideBottom: slideRect.bottom,
        sbHeight: sb?.getBoundingClientRect().height,
        splitHeight: splitRect?.height,
        splitTop: splitRect?.top,
        splitBottom: splitRect?.bottom,
        gridHeight: gridRect?.height,
        gridBottom: gridRect?.bottom,
        imgHeight: imgRect?.height,
        imgWidth: imgRect?.width,
        imgBottom: imgRect?.bottom,
      });
    });
    return result;
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
