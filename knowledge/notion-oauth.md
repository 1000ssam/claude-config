# 노션 OAuth 개발 가이드

## 핵심 규칙: 리다이렉트 응답에 Set-Cookie 금지

OAuth 흐름(login → 외부 → callback)에서 리다이렉트 응답(302/307)에 Set-Cookie를 실으면 일부 브라우저(특히 모바일 Safari)에서 쿠키가 유실된다. HTTP 스펙상 처리해야 하지만 실제로는 불안정.

### 증상
- 첫 번째 OAuth 시도에서 로그인 후 메인 화면으로 돌아감
- 두 번째 시도에서는 정상 동작
- PC에서는 간헐적, 모바일에서는 거의 항상 재현

### 원인
1. Login route에서 `oauthState`를 세션 쿠키에 저장 → 외부(Notion)로 리다이렉트
2. 브라우저가 리다이렉트 응답의 Set-Cookie를 처리하지 않음
3. Callback에서 state 검증 실패 → 에러 리다이렉트

### 해결: HMAC 서명 State

세션 쿠키 대신 HMAC 서명된 self-contained state를 사용한다.

```ts
// === Login Route ===
import crypto from "crypto";

function signState(): string {
  const secret = process.env.IRON_SESSION_PASSWORD!;
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${hmac}`;
}

// state를 Notion OAuth URL에 포함. 쿠키 설정 불필요.
const state = signState();

// === Callback Route ===
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10분

function verifyState(state: string): boolean {
  const secret = process.env.IRON_SESSION_PASSWORD;
  if (!secret) return false;

  const parts = state.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const elapsed = Date.now() - Number(timestamp);
  if (isNaN(elapsed) || elapsed < 0 || elapsed > STATE_MAX_AGE_MS) return false;

  const expected = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

### Callback에서 세션 저장

Callback에서 토큰을 세션에 저장할 때는 `getIronSession(request, response, options)`로 redirect response에 직접 설정:

```ts
const response = NextResponse.redirect(`${baseUrl}/databases`);
const session = await getIronSession<SessionData>(request, response, getSessionOptions());
session.accessToken = tokenData.access_token;
await session.save();
return response;
```

### 시도했으나 실패한 방법

| 방법 | 결과 |
|------|------|
| `cookies()` + `NextResponse.redirect()` | implicit/explicit 응답 분리로 쿠키 유실 |
| `getIronSession(req, res)` 로 login에서 쿠키 설정 | PC 일부 해결, 모바일 여전히 실패 |
| `getSession()`과 `getIronSession(req, res)` 혼용 | Set-Cookie 중복으로 악화 |

### 적용 범위
- 노션 OAuth뿐 아니라 **모든 외부 OAuth 흐름**에 동일하게 적용
- Google, GitHub 등 다른 OAuth provider에서도 같은 패턴 권장

> 상세 삽질 과정: `LESSONS_LEARNED.md` #8 참조
