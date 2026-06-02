# 노션 페이지 ID 파싱 함정 (URL → UUID)

## 문제

노션 페이지 URL에서 페이지 ID(32 hex)를 뽑을 때, **제목이 hex 문자로 끝나면** ID를 잘못 추출한다.

예: `https://www.notion.so/ioooss/AI-vs-1000-cf09d27e38c1436cb1dba59a30c8bd63?source=copy_link`

- 하이픈을 제거하면 제목 끝 `1000`(1·0·0·0 전부 hex!)과 실제 ID가 **연속 36자 hex 런**으로 붙는다: `...1000cf09d27e38c1436cb1dba59a30c8bd63`
- "32-hex 런을 찾아 앞에서 32자"를 잡으면 → `1000cf09d27e38c1436cb1dba59a30c8` (틀림)
- 노션 API는 `path.page_id should be a valid uuid` 400 에러를 던진다.

## 원인

- 노션 페이지 ID는 항상 **경로 맨 끝의 32 hex**다.
- 그런데 워크스페이스 슬러그/제목(`AI-vs-1000-`)도 경로에 들어가고, 거기에 `a~f`/`0~9` 문자가 섞여 있다.
- 하이픈 제거 후 "어딘가의 32-hex 런"을 찾으면, 제목 꼬리 hex가 ID 앞에 달라붙어 경계가 어긋난다.
- `?source=...`, `#block` 같은 쿼리/프래그먼트도 hex 노이즈를 더한다.

## 해결

1. **쿼리/프래그먼트를 먼저 제거**한다 (`split(/[?#]/)[0]`).
2. 완전한 하이픈 UUID면 그대로 통과.
3. 하이픈 제거 후 **문자열 "끝"에서** 32 hex를 잡는다 (`/[0-9a-f]{32}$/i`). 앞에서 찾지 말 것.
4. 8-4-4-4-12로 하이픈 삽입.

```ts
export function parsePageId(input: string): string {
  const path = input.trim().split(/[?#]/)[0];                 // 1) 쿼리/프래그먼트 제거
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuid.test(path)) return path.toLowerCase();             // 2) 이미 UUID
  const compact = path.replace(/-/g, "");
  const m = compact.match(/[0-9a-f]{32}$/i);                  // 3) 끝에서 32 hex (앞 아님!)
  if (!m) throw new Error(`노션 페이지 ID를 찾을 수 없습니다: ${input}`);
  const id = m[0].toLowerCase();
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}
```

## 교훈

- 노션 URL 파싱은 "끝에서 32 hex" 원칙. "정규식으로 32-hex 매칭" 같은 위치 무관 방식은 제목 hex에 오염된다.
- 회귀 테스트에 **제목이 hex로 끝나는 케이스**(`...-1000-<id>`)를 반드시 포함.
- 최초 발견: 2026-05-24, newsletter-self-host `lib/notion-content.ts` (발송 CLI dry-run 중).
