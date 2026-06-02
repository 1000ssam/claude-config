// SNS 바운스/신고 E2E 검증용 일회성 스크립트 (리포 밖, 의존성 0, raw fetch).
// 실 구독자는 절대 안 건드림 — 시뮬레이터 주소 행만 생성/조회/삭제.
// 실행: node --env-file=/mnt/c/dev/newsletter-self-host/.env sns-e2e-test.mjs <create|check|checkall|delete|deleteall> [email]
// Notion-Version은 2022-06-28 고정 → 삭제는 archived:true (in_trash 함정 회피).

const TOKEN = process.env.NOTION_TOKEN;
const DB = process.env.NOTION_SUBSCRIBERS_DB_ID;
if (!TOKEN || !DB) { console.error("NOTION_TOKEN / NOTION_SUBSCRIBERS_DB_ID 필요 (--env-file 확인)"); process.exit(1); }

const SIMS = ["bounce@simulator.amazonses.com", "complaint@simulator.amazonses.com"];
const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
const norm = (e) => e.trim().toLowerCase();

async function api(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method, headers: H, body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function findByEmail(email) {
  const r = await api("POST", `/databases/${DB}/query`, {
    filter: { property: "Email", title: { equals: norm(email) } },
  });
  return r.results[0] || null;
}

function summarize(page) {
  return {
    status: page.properties?.Status?.select?.name ?? "(none)",
    bounceCount: page.properties?.["Bounce Count"]?.number ?? null,
    pageId: page.id,
  };
}

async function create(email) {
  const existing = await findByEmail(email);
  if (existing) { console.log(`[skip] 이미 존재: ${email}`, summarize(existing)); return; }
  const page = await api("POST", "/pages", {
    parent: { database_id: DB },
    properties: {
      Email: { title: [{ text: { content: norm(email) } }] },
      Status: { select: { name: "confirmed" } },
      Name: { rich_text: [{ text: { content: "[SNS-E2E-TEST · 자동삭제예정]" } }] },
    },
  });
  console.log(`[created] ${email}`, summarize(page));
}

async function check(email) {
  const page = await findByEmail(email);
  console.log(page ? `[${email}] ${JSON.stringify(summarize(page))}` : `[${email}] 없음`);
}

async function del(email) {
  const page = await findByEmail(email);
  if (!page) { console.log(`[del] 없음(이미 정리됨): ${email}`); return; }
  await api("PATCH", `/pages/${page.id}`, { archived: true });
  console.log(`[del] 휴지통 이동: ${email} (${page.id})`);
}

const [action, emailArg] = process.argv.slice(2);
const targets = emailArg ? [norm(emailArg)] : SIMS;

switch (action) {
  case "create": for (const e of targets) await create(e); break;
  case "check": case "checkall": for (const e of targets) await check(e); break;
  case "delete": case "deleteall": for (const e of targets) await del(e); break;
  default: console.error("usage: <create|check|checkall|delete|deleteall> [email]"); process.exit(1);
}
