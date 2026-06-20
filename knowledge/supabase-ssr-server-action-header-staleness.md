# @supabase/ssr + 서버 액션 로그인 시 헤더가 stale (로그인해도 로그인 버튼)

## 증상
로그인에 성공하고 리다이렉트까지 됐는데도 **우측 상단 헤더가 계속 로그아웃 상태**(로그인 버튼 노출, 마이페이지/프로필 안 나옴). 하드 리프레시(F5)하면 그제서야 정상. 로그아웃도 같은 식으로 헤더가 안 바뀜.

## 원인
헤더가 **클라이언트 컴포넌트 + 브라우저 supabase 클라이언트(`createBrowserClient`)의 인메모리 세션**에 의존할 때 발생한다.

- 로그인/로그아웃을 **서버 액션**(`createServerClient`의 `signInWithPassword`/`signOut`)으로 처리하면, **브라우저 클라이언트는 그 사실을 모른다** → `onAuthStateChange`(SIGNED_IN/OUT)가 **발화하지 않음**(그 이벤트는 브라우저 클라이언트가 직접 수행했을 때만 뜸).
- 서버 액션의 `redirect()`는 **소프트 내비게이션**이라 레이아웃에 상주하는 헤더 컴포넌트가 **재마운트되지 않음** → 마운트 1회짜리 `INITIAL_SESSION`도 다시 안 옴.
- 보완으로 `getSession()`/`getUser()`를 다시 불러도 **인메모리 캐시(`currentSession`)** 때문에 stale. 특히 로그아웃 후에도 인메모리엔 옛 세션이 남아 로그인 상태로 오판. (`createBrowserClient`는 url+key로 인스턴스를 메모이즈해서 "새 클라이언트"를 만들어도 같은 캐시.)

## 해결 — 헤더 상태를 "쿠키 진실원천"인 서버에서 읽기
헤더가 **서버 엔드포인트**에서 로그인 상태를 가져오게 한다. 서버는 매 요청 쿠키를 새로 파싱하므로 인메모리 캐시 문제가 원천 차단된다.

1. `app/api/me/route.ts` (동적, no-store): 서버에서 `getUser()`+프로필 조회 → `{ me }` 반환.
   ```ts
   export const dynamic = "force-dynamic";
   export async function GET() {
     const { user, profile } = await getProfile();      // createServerClient + getUser
     const me = user ? { displayName: profile?.display_name ?? "회원", role: profile?.role ?? "member" } : null;
     return NextResponse.json({ me }, { headers: { "Cache-Control": "no-store" } });
   }
   ```
2. 헤더(클라이언트): **경로가 바뀔 때마다**(`usePathname`) `/api/me`를 `fetch(..., {cache:"no-store"})`로 재조회. 로그인→/settings, 로그아웃→/ 소프트 내비에서 자동 동기화. 일시 오류 시 직전 상태 유지(깜빡임 방지).

이러면 마케팅 페이지는 **정적 유지**되고(`/api/me`만 동적), 토큰 갱신은 기존 미들웨어(Next16=proxy.ts, `updateSession`)가 담당.

### 대안들 (덜 권장)
- 로그인/로그아웃 후 **하드 리로드**(`window.location.assign`) → 브라우저 클라이언트 재초기화. 단순하지만 풀 페이지 깜빡임.
- 헤더를 **서버 컴포넌트**로 만들고 레이아웃에서 `getUser()` → 액션에서 `revalidatePath("/","layout")`. 정석이지만 레이아웃이 동적이 돼 전 페이지 정적성 손실.

## 교훈
- 인증 상태를 화면에 표시할 땐 "누가 그 상태를 set 하는가"를 먼저 본다. **set 주체(서버 액션)와 read 주체(브라우저 클라이언트)가 다르면** 이벤트가 안 와서 stale 난다.
- 브라우저 supabase 클라이언트의 `getSession/getUser`는 **인메모리 캐시**라 외부(서버)에서 바뀐 쿠키를 즉시 반영 못 한다 → "쿠키를 매번 새로 읽는 서버 read"가 신뢰원천.

## 키워드
supabase 로그인했는데 로그아웃 표시, 헤더 로그인 버튼 안 바뀜, onAuthStateChange 안 뜸, 서버 액션 로그인 헤더 stale, createBrowserClient 인메모리 세션, getSession stale, /api/me, usePathname 인증 재동기화, supabase-ssr 헤더, signInWithPassword 서버액션 헤더 갱신
