import pkg from "file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pkg;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
await page.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);
await page.addStyleTag({
  content: '[style*="opacity"]{opacity:1 !important;transform:none !important;}',
});
await page.waitForTimeout(300);
// 헤더 크롭
await page.screenshot({
  path: "/mnt/c/dev/notes/wee-linked-shots/crop-header.png",
  clip: { x: 0, y: 0, width: 1280, height: 110 },
});
// 히어로 보드 크롭(우측 단)
await page.screenshot({
  path: "/mnt/c/dev/notes/wee-linked-shots/crop-board.png",
  clip: { x: 760, y: 110, width: 520, height: 540 },
});
console.log("crops done");
await browser.close();
