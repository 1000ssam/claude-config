/**
 * copyPageBody의 이미지 안내 콜아웃 prepend 동작 실측 (일회성, 비파괴).
 * - 샘플(이미지 포함) 마크다운 GET → 동일 로직으로 안내 prepend → throwaway 페이지에 PATCH → 되읽기 검증 → in_trash
 */
import { readFileSync } from "node:fs";

const SECRETS_PATH = "/mnt/c/Users/user/.claude/secrets/notion-credentials.md";
const NV = "2026-03-11";
const SAMPLE_PAGE = "ae0e256ba13c40a793f35d419b927431";

// copyPageBody와 동일한 패턴/문구
const NOTION_HOSTED_IMAGE_RE =
  /!\[[^\]]*\]\([^)]*(?:prod-files-secure|amazonaws\.com|secure\.notion-static|notion\.so\/image)[^)]*\)/;
const v2PageUrl = (id) => `https://www.notion.so/${id.replace(/-/g, "")}`;

const token = (() => {
  const c = readFileSync(SECRETS_PATH, "utf-8");
  return c.match(/```\r?\n(ntn_\S+)\r?\n```/)[1];
})();
const toUuid = (s) => { const h = s.replace(/-/g,"").match(/[0-9a-fA-F]{32}/)[0].toLowerCase(); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
const headers = { Authorization:`Bearer ${token}`, "Notion-Version":NV, "Content-Type":"application/json" };
const api = async (method, path, body) => {
  const r = await fetch(`https://api.notion.com/v1${path}`, { method, headers, ...(body?{body:JSON.stringify(body)}:{}) });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; }
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${t.slice(0,300)}`);
  return j;
};

const srcId = toUuid(SAMPLE_PAGE);

// 1) 소스 마크다운 + copyPageBody와 동일한 안내 prepend
let md = (await api("GET", `/pages/${srcId}/markdown`)).markdown ?? "";
const hadImage = NOTION_HOSTED_IMAGE_RE.test(md);
if (hadImage) {
  md = `<callout icon="🖼️" color="yellow_bg">\n원본(v2)에 이미지가 있었습니다. 자동 이관 불가 — 원본에서 확인 후 직접 추가하세요 → [원본 보기](${v2PageUrl(srcId)})\n</callout>\n\n` + md;
}
console.log("이미지 감지:", hadImage, "| 안내 prepend 후 길이:", md.length);

// 2) throwaway 페이지 생성 + PATCH
const page = await api("POST", "/pages", {
  parent: { page_id: srcId },
  properties: { title: { title: [{ text: { content: "본문 안내 콜아웃 검증 " + new Date().toISOString() } }] } },
});
console.log("throwaway 생성:", page.id);
await api("PATCH", `/pages/${page.id}/markdown`, { type:"replace_content", replace_content:{ new_str: md } });

// 3) 되읽기 검증
const back = (await api("GET", `/pages/${page.id}/markdown`)).markdown ?? "";
const top = back.split("\n").slice(0, 4).join("\n");
const ok = /<callout/.test(top) && /원본 보기/.test(back) && /notion\.so/.test(back);
console.log("--- 되읽은 본문 상단 4줄 ---");
console.log(top);
console.log("--------------------------------");
console.log(ok ? "✅ 콜아웃+원본링크가 최상단에 정상 렌더됨" : "⚠️ 콜아웃/링크 검증 실패 — 출력 확인 필요");

// 4) 정리 (in_trash, archived 아님)
const trashed = await api("PATCH", `/pages/${page.id}`, { in_trash: true });
console.log("throwaway in_trash =", trashed.in_trash);
