# Next.js 16: `middleware.ts` → `proxy.ts` 개명 함정

Next.js 16부터 미들웨어 규약이 **`middleware`에서 `proxy`로 이름이 바뀌었다**(기능 동일). 즉 루트에 두는 파일은 `src/middleware.ts`가 아니라 **`src/proxy.ts`**, export 함수도 `export function middleware(...)`가 아니라 **`export function proxy(request)`**.

```ts
// src/proxy.ts (Next 16)
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: [ ... ] };
```

## 함정 — "미들웨어가 없네?" 오진
프로젝트에 `middleware.ts`가 안 보이면 "세션 갱신 미들웨어가 빠졌다"고 **오진하기 쉽다**. 실제로는 `proxy.ts`로 이관돼 멀쩡히 돌고 있는 경우가 많다. 새로 `middleware.ts`를 만들면 빌드가 충돌로 막아준다:

```
Error: Both middleware file "./src/middleware.ts" and proxy file "./src/proxy.ts"
are detected. Please use "./src/proxy.ts" only.
```

→ @supabase/ssr 같은 "미들웨어로 세션 쿠키 갱신" 패턴을 점검할 땐 **`middleware.ts`와 `proxy.ts` 둘 다 grep**할 것. `grep -rn "export.*function (middleware|proxy)" src/`.

## 교훈
- 파일 부재만으로 기능 부재를 단정하지 말 것(프레임워크 버전별 규약 개명 가능).
- `next build`는 이런 규약 위반을 런타임 전에 잡아준다 → 미들웨어/라우트 신설 시 **타입체크·테스트뿐 아니라 빌드까지** 돌려 확인.

## 키워드
Next 16 미들웨어, middleware proxy 개명, proxy.ts, Both middleware file and proxy file detected, middleware-to-proxy, export function proxy, 미들웨어 없음 오진
