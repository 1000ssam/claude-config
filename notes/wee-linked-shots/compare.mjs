import pkg from "file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pkg;

const OUT = "/mnt/c/dev/notes/wee-linked-shots";
const REVEAL = '[style*="opacity"]{opacity:1 !important;transform:none !important;}';
// 디스플레이 세리프(제주명조)만 Pretendard 로 치환 — 소스 무변경, 런타임 오버라이드.
const SANS =
  ':root{--font-serif:"Pretendard",system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif !important;}';

const browser = await chromium.launch();

async function shoot(variant, extraCss) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: REVEAL + (extraCss || "") });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/font-${variant}-full.png`, fullPage: true });
  await page.screenshot({
    path: `${OUT}/font-${variant}-hero.png`,
    clip: { x: 0, y: 88, width: 760, height: 440 },
  });
  console.log("shot:", variant);
  await ctx.close();
}

await shoot("serif", ""); // 제주명조 (현재)
await shoot("sans", SANS); // Pretendard 통일 (현재 가중치 400)
await shoot("sansbold", SANS + ".font-serif{font-weight:600 !important;}"); // Pretendard 통일 + 디스플레이 600
await browser.close();
console.log("done");
