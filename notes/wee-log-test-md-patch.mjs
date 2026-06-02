/**
 * 마크다운 PATCH 시 본문 이미지 거동 실측.
 *
 * 흐름:
 *   1) 샘플 페이지 마크다운 신선 재취득 (signed URL 새로 발급)
 *   2) 샘플 하위에 테스트 페이지 생성 (기존 데이터 비파괴, 신규 only)
 *   3) PATCH /markdown replace_content 로 본문 주입
 *   4) 생성된 image 블록의 image.type 확인
 *        file     → Notion이 빨아들여 재호스팅 (안전, 만료 안 됨)
 *        external → 외부 URL 참조만 (1시간 뒤 만료)
 *
 * 실행: node /mnt/c/dev/notes/wee-log-test-md-patch.mjs
 */
import { readFileSync } from "node:fs";

const SECRETS_PATH = "/mnt/c/Users/user/.claude/secrets/notion-credentials.md";
const NV = "2026-03-11";
const SAMPLE_PAGE = "ae0e256ba13c40a793f35d419b927431";

function loadToken() {
  const c = readFileSync(SECRETS_PATH, "utf-8");
  const m = c.match(/```\r?\n(ntn_\S+)\r?\n```/);
  if (!m) throw new Error("notion token not found");
  return m[1];
}
function toUuid(input) {
  const h = input.replace(/-/g, "").match(/[0-9a-fA-F]{32}/)[0].toLowerCase();
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

const token = loadToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": NV,
  "Content-Type": "application/json",
};

async function getMarkdown(id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}/markdown`, { headers });
  const t = await r.text();
  if (!r.ok) throw new Error(`GET markdown ${r.status}: ${t}`);
  try { const j = JSON.parse(t); if (typeof j.markdown === "string") return j.markdown; } catch {}
  return t;
}

async function listAll(blockId) {
  const out = []; let cursor;
  do {
    const u = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    u.searchParams.set("page_size", "100");
    if (cursor) u.searchParams.set("start_cursor", cursor);
    const r = await fetch(u, { headers });
    const j = await r.json();
    out.push(...(j.results || []));
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return out;
}

async function findImages(id, depth = 0, acc = []) {
  const blocks = await listAll(id);
  for (const b of blocks) {
    if (b.type === "image") acc.push(b);
    if (b.has_children) await findImages(b.id, depth + 1, acc);
  }
  return acc;
}

const srcId = toUuid(SAMPLE_PAGE);

// 1) 신선 마크다운
const md = await getMarkdown(srcId);
const srcImgUrl = (md.match(/!\[[^\]]*\]\(([^)]*)\)/) || [])[1] || "(없음)";
console.log("1) source markdown:", md.length, "자, 이미지 URL 호스트:", srcImgUrl.split("?")[0].slice(0, 70));

// 2) 테스트 페이지 생성
const cr = await fetch("https://api.notion.com/v1/pages", {
  method: "POST",
  headers,
  body: JSON.stringify({
    parent: { page_id: srcId },
    properties: { title: { title: [{ text: { content: "PATCH 이미지 거동 테스트 " + new Date().toISOString() } }] } },
  }),
});
const crJson = await cr.json();
if (!cr.ok) { console.error("2) create 실패:", cr.status, JSON.stringify(crJson)); process.exit(1); }
const newId = crJson.id;
console.log("2) 테스트 페이지 생성:", newId);

// 3) PATCH replace_content
const pt = await fetch(`https://api.notion.com/v1/pages/${newId}/markdown`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ type: "replace_content", replace_content: { new_str: md } }),
});
const ptText = await pt.text();
console.log("3) PATCH replace_content:", pt.status, pt.ok ? "OK" : ptText.slice(0, 400));

// 4) 이미지 블록 거동 확인
const imgs = await findImages(newId);
console.log(`4) 생성된 image 블록: ${imgs.length}개`);
for (const b of imgs) {
  const t = b.image?.type;
  const url = t === "file" ? b.image.file?.url : b.image?.external?.url;
  console.log(`   - image.type = ${t}  ${t === "file" ? "→ ✅ 재호스팅(영구)" : "→ ⚠️ 외부참조(만료)"}`);
  console.log(`     url 호스트: ${(url || "").split("?")[0].slice(0, 80)}`);
}

console.log("\n새 테스트 페이지 URL:", crJson.url);
console.log("(확인 후 삭제해도 됩니다. 원하면 제가 archive 처리할게요.)");
