import pkg from "file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pkg;

const URL = process.env.SHOT_URL || "http://localhost:3100/";
const OUT = "/mnt/c/dev/notes/wee-linked-shots";
const shots = [
  { name: "home-1280", width: 1280 },
  { name: "home-1024", width: 1024 },
  { name: "home-390", width: 390 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce", // Reveal 컴포넌트가 즉시 표시되도록(스크롤 등장 비활성)
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200); // 웹폰트(제주명조/Newsreader) 로딩 안정화
  // 정적 캡처용: Reveal(motion 인라인 opacity)만 최종 상태로 고정. 글로우 transform 은 클래스라 영향 없음.
  await page.addStyleTag({
    content: '[style*="opacity"]{opacity:1 !important;transform:none !important;}',
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
  console.log("shot:", s.name, s.width);
  await ctx.close();
}
await browser.close();
console.log("done");
