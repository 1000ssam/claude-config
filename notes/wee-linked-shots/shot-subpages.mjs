import pkg from "file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pkg;

const BASE = process.env.SHOT_BASE || "http://localhost:3100";
const OUT = "/mnt/c/dev/notes/wee-linked-shots";
const REVEAL = '[style*="opacity"]{opacity:1 !important;transform:none !important;}';

const pages = [
  { path: "/about", slug: "about" },
  { path: "/wee-story", slug: "weestory" },
  { path: "/changelog", slug: "changelog" },
];
const widths = [
  { name: "desktop", w: 1280 },
  { name: "mobile", w: 390 },
];

const browser = await chromium.launch();
for (const p of pages) {
  for (const v of widths) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const resp = await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1000);
    await page.addStyleTag({ content: REVEAL });
    await page.waitForTimeout(300);
    const status = resp ? resp.status() : "?";
    await page.screenshot({ path: `${OUT}/sub-${p.slug}-${v.name}.png`, fullPage: true });
    console.log("shot:", p.slug, v.name, "status", status);
    await ctx.close();
  }
}
await browser.close();
console.log("done");
