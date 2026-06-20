# Next.js ISR 정적 페이지 × 외부 데이터 클라이언트 — 레이턴시·배포 차단 2대 함정

`export const revalidate = N`으로 ISR 정적화를 기대한 App Router 페이지가, **외부 데이터 클라이언트(SDK)의 fetch 동작** 때문에 ① 조용히 동적 강등돼 레이턴시가 폭증하거나 ② 빌드 프리렌더가 통째로 실패해 배포가 막히는 두 가지 함정. 실제 사례: newsletter-self-host `/newsletter` 리스팅 페이지.

핵심 진단 원칙: **추측 금지, 실측.** `curl -sL -w '%{time_total}' -D-`로 `x-vercel-cache`(HIT/MISS/PRERENDER)·`cache-control`·`age`를 보고, 빌드 라우트 표(`○ Static` vs `ƒ Dynamic`)를 보고, 같은 쿼리를 로컬·런타임에서 직접 때려 격리한다.

---

## 함정 ① no-store fetch SDK → ISR 라우트가 동적 강등 (레이턴시 폭증)

`@upstash/redis` 등 일부 SDK는 내부 REST fetch에 `cache: "no-store"`를 **명시적으로** 박는다 (`node_modules/@upstash/redis/nodejs.mjs`: `cache: configOrRequester.cache ?? "no-store"`). Next 15는 렌더 경로에 `no-store` fetch가 **하나라도** 캐시 경계 밖에 있으면 그 라우트를 동적으로 판정 → ISR/CDN 캐시 소멸 → **매 요청 풀 SSR**(외부 호출 전부 재실행).

### 증상
- 해당 페이지만 응답이 수 초(다른 페이지는 ms). `x-vercel-cache: MISS` + `cache-control: private, no-cache, no-store`가 **매 요청**.
- 빌드 라우트 표에서 그 페이지가 `○`가 아니라 `ƒ (Dynamic)`.
- 결정적 대조군: **같은 앱·같은 SDK**인데 다른 페이지는 `HIT`/빠름 → 그 페이지는 SDK 호출을 `unstable_cache`로 감쌌고, 느린 페이지는 안 감쌈.

### 정답 — no-store I/O를 `unstable_cache`로 가둔다
```ts
import { unstable_cache } from "next/cache";
const getCached = unstable_cache(
  async (items) => [...(await rawUpstashBatch(items))], // Map은 직렬화 안 되니 배열로
  ["views-batch"],
  { revalidate: 600, tags: ["letters"] },
);
```
- 캐시 경계 안의 fetch는 라우트의 정적/동적 판정에 영향을 주지 않는다(= `unstable_cache`의 존재 이유).
- `unstable_cache`는 인자를 캐시 키에 자동 포함 → 입력별 분리 캐시. 반환값은 직렬화되므로 `Map`→`[k,v][]`.
- **노션 클라이언트(`@notionhq/client`)는 cache 옵션 없는 기본 fetch라 정적 허용** → 감쌀 필요 없음. no-store를 박는 SDK만 문제.

---

## 함정 ② @notionhq/client gzip "Premature close" → Vercel 빌드 프리렌더 실패 (배포 차단)

ISR 정적 페이지는 **빌드 시점에 프리렌더**되며 그때 외부 API를 호출한다. `@notionhq/client`의 gzip 응답 스트림이 **Vercel 빌드 샌드박스 환경에서만** 일관되게 끊기면(`Gunzip` → `ERR_STREAM_PREMATURE_CLOSE`, `FetchError: ... /query: Premature close`) 프리렌더가 throw → **빌드 전체 실패 → 배포 차단**.

함정 ①을 고쳐 페이지가 정적이 되는 **순간** 이 빌드 의존성이 새로 생긴다(동적일 땐 빌드에서 안 불렀음). 즉 ①의 부작용으로 ②가 드러난다.

### 진단 (실측으로 격리)
- 같은 쿼리를 **로컬에서 prod env로 직접** 실행 → 매번 성공(작은 응답)인데 **Vercel 빌드만** 실패 ⇒ 크기·플레이키 아님, **빌드 샌드박스의 gzip 처리** 문제.
- 재시도해도 **같은 지점에서 일관 실패** ⇒ 일시 오류 아님(재시도로 안 풀림).

### 정답 — 압축을 꺼서 Gunzip 경로 자체 제거 (근본 원인)
```ts
const noGzipFetch = ((input: RequestInfo | URL, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("accept-encoding", "identity"); // gzip 안 받음 → Gunzip 없음
  return fetch(input, { ...init, headers });
}) as typeof fetch;

// @notionhq/client v2.3.0+ 는 커스텀 fetch 주입 지원
new Client({ auth, fetch: noGzipFetch as never });
```
- undici(Node fetch)는 수동 `accept-encoding` 설정 시 자동 압축 협상/해제를 하지 않고, 서버(노션)는 `identity`를 수용 → 비압축 응답. 목록 응답이 수십 KB면 비압축 비용 무시 가능.
- 로컬에서 `identity` 수용·파싱 정상부터 검증한 뒤 배포(빌드 샌드박스는 로컬 재현 불가).

### 보강 (방어용, 근본 해결은 아님)
- 일시 네트워크 오류(`ERR_STREAM_PREMATURE_CLOSE`·`ECONNRESET`·5xx·429)에 한해 지수 백오프 재시도 헬퍼. 검증오류(400)는 재시도 말고 즉시 throw.
- 목록 fan-out(레터별 발췌 등)은 try/catch로 **항목 단위 격리** → 한 항목 실패가 목록 전체 프리렌더를 죽이지 않게.

---

## 일반 교훈
- ISR 정적화는 **런타임 속도**를 얻는 대신 **빌드가 외부 API 가용성에 묶이는** 트레이드오프를 만든다. 정적화 직후 빌드 프리렌더를 반드시 확인.
- "느려졌다/배포 막혔다"는 **`x-vercel-cache`·빌드 라우트 표·로컬 직접 호출**로 격리 — 코드 구조 추측·핸드오프 맹신 금지.
- 같은 ISR 페이지에서 어떤 데이터 클라이언트는 정적 허용(노션 기본 fetch), 어떤 건 동적 강등(Upstash no-store)·빌드 차단(노션 gzip) — **클라이언트별 fetch 동작을 개별 확인**.
