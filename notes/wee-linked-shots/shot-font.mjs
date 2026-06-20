import pkg from "file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js";
const { chromium } = pkg;

const BASE = process.env.SHOT_BASE || "http://localhost:3101";
const OUT = "/mnt/c/dev/notes/wee-linked-shots";
const REVEAL = '[style*="opacity"]{opacity:1 !important;transform:none !important;}';

const browser = await chromium.launch();

async function shoot(path, slug, hero) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const resp = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500); // 폰트 로딩 안정화
  await page.addStyleTag({ content: REVEAL });
  await page.waitForTimeout(400);
  // 헤드라인 computed font-family 추출
  const sel = hero ? "h1" : "h1";
  const fam = await page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el).fontFamily : "(no h1)";
  }, sel);
  const bodyFam = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  await page.screenshot({ path: `${OUT}/font-self-${slug}.png`, fullPage: true });
  console.log(`${slug}: status ${resp ? resp.status() : "?"} | h1 font=${fam} | body font=${bodyFam}`);
  await ctx.close();
}

await shoot("/", "home", true);
await shoot("/about", "about", false);
await browser.close();
console.log("done");
