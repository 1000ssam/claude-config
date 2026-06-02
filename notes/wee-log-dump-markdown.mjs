/**
 * wee-log 샘플 페이지 본문을 Notion 마크다운 엔드포인트로 통째 덤프.
 *
 * 사용:
 *   node /mnt/c/dev/notes/wee-log-dump-markdown.mjs "<노션 페이지 URL 또는 ID>"
 *
 * - GET /v1/pages/{id}/markdown  (Notion-Version: 2026-03-11)
 * - 토큰: /mnt/c/Users/user/.claude/secrets/notion-credentials.md (ntn_...)
 * - 미디어/내부링크/unknown 블록 존재 여부를 끝에 요약해 스코프 판단을 돕는다.
 */
import { readFileSync } from "node:fs";

const SECRETS_PATH = "/mnt/c/Users/user/.claude/secrets/notion-credentials.md";
const NOTION_VERSION = "2026-03-11";

function loadToken() {
  const content = readFileSync(SECRETS_PATH, "utf-8");
  const match = content.match(/```\r?\n(ntn_\S+)\r?\n```/);
  if (!match) throw new Error("notion token not found in secrets file");
  return match[1];
}

function extractPageId(input) {
  const hex = input.replace(/-/g, "").match(/[0-9a-fA-F]{32}/);
  if (!hex) throw new Error("32-hex page id를 찾을 수 없음: " + input);
  const h = hex[0].toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const arg = process.argv[2];
if (!arg) {
  console.error("사용법: node wee-log-dump-markdown.mjs \"<페이지 URL 또는 ID>\"");
  process.exit(1);
}

const token = loadToken();
const pageId = extractPageId(arg);

const res = await fetch(`https://api.notion.com/v1/pages/${pageId}/markdown`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
  },
});

const raw = await res.text();
console.log(`HTTP ${res.status} ${res.statusText}  (page ${pageId})`);
console.log("=".repeat(70));

if (!res.ok) {
  console.log(raw);
  process.exit(res.status === 404 ? 0 : 1);
}

// 응답이 JSON({markdown,...})일 수도, 순수 마크다운일 수도 있어 둘 다 대응
let md = raw;
let meta = null;
try {
  const j = JSON.parse(raw);
  if (j && typeof j === "object" && typeof j.markdown === "string") {
    md = j.markdown;
    meta = j;
  }
} catch {
  /* 순수 마크다운 응답 */
}

console.log(md);
console.log("=".repeat(70));

// --- 스코프 판단용 요약 ---
const imgs = (md.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
const mediaTags = (md.match(/<(video|audio|pdf)\b/g) || []).length;
const pageLinks = (md.match(/<page\b/g) || []).length;
const dbLinks = (md.match(/<database\b/g) || []).length;
const unknownTags = (md.match(/<unknown\b/g) || []).length;
const signedUrls = (md.match(/prod-files-secure|s3\.us-west|amazonaws\.com|secure\.notion-static/g) || []).length;

console.log("[요약]");
console.log(`  길이            : ${md.length.toLocaleString()}자 / ${md.split("\n").length}줄`);
console.log(`  이미지 ![]()    : ${imgs}`);
console.log(`  미디어 태그     : ${mediaTags}  (<video|audio|pdf>)`);
console.log(`  내부 페이지링크 : ${pageLinks}  (<page>)`);
console.log(`  내부 DB링크     : ${dbLinks}  (<database>)`);
console.log(`  만료성 URL 추정 : ${signedUrls}  (signed/S3)`);
console.log(`  unknown 블록    : ${unknownTags}`);
if (meta?.unknown_block_ids?.length) {
  console.log(`  unknown_block_ids: ${JSON.stringify(meta.unknown_block_ids)}`);
}
console.log("");
console.log("[판단 가이드]");
console.log("  이미지/미디어/signed=0 → 본문 평문 위주, replace_content 한 방이면 충실 이관 OK");
console.log("  page/database 링크>0   → 내부 링크 v2→v3 ID 치환 검토 필요");
console.log("  unknown>0              → bookmark/embed/link preview/breadcrumb/template 존재");
