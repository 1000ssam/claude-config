// 헤드리스 스크린샷: node shot.mjs <url> <out.png> [desktop|mobile] [waitMs]
import { chromium } from "playwright";

const [, , url, out, vp = "desktop", waitMs = "2500"] = process.argv;
const sizes = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};
if (!url || !out) {
  console.error("usage: node shot.mjs <url> <out.png> [desktop|mobile] [waitMs]");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: sizes[vp] ?? sizes.desktop,
  deviceScaleFactor: 2,
  isMobile: vp === "mobile",
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out, fullPage: false });
await browser.close();
console.log("OK", out, vp);
