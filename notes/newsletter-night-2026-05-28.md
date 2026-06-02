# 야간 자율작업 보고 — newsletter-self-host (2026-05-28 새벽)

> 사용자 취침 중 자율 진행. **main 미머지·미변경**(요청대로). 모든 작업은 피처 브랜치(main 기준)에서.
> 검토 후 머지/푸시 지시 바람.

## TL;DR
자율 가능한 **웹 UX·테스트 3건** 완료(전부 발송 경로와 독립·비차단). 사용자 매뉴얼 액션 필요 항목은 손대지 않고 아래 [매뉴얼 검증/액션 필요]에 정리.

## 완료한 작업 (피처 브랜치, main 미머지 / origin 푸시 완료)
모두 origin에 푸시됨(검토용). **main 미머지·미변경.** 작업 worktree는 정리(`git worktree remove`)했고 브랜치는 로컬+origin에 보존.

| # | 브랜치 (origin 푸시됨) | 내용 | 검증 |
|---|--------|------|------|
| #12 | `feat/result-page-tokens` | 구독확인·해지 결과 페이지 셸을 시맨틱 디자인 토큰으로 리팩토링 | tsc0·vitest175·build·**스크린샷 확인✅** |
| #13 | `feat/subscribe-modal` | 홈 '구독 신청하기' → 접근성 모달(포커스트랩·ESC·backdrop·스크롤락·aria-modal·enter/exit) | tsc0·vitest175·build·**스크린샷 확인✅** |
| #7  | `feat/slug-edge-tests` | 슬러그 해석 엣지케이스 테스트 보강(중복·특수문자·부분hex) | tsc0·vitest(27)✅ |

> Preview URL: 각 브랜치 푸시로 Vercel preview가 떴을 수 있으나 **이 프로젝트 preview는 SSO 보호(401)**라 바로 열람 불가(HANDOFF 기록). GitHub PR/브랜치로 코드 검토 권장.
> 시각 확인 결과: 결과페이지 success=accent(teal)·invalid=danger(red) 등 variant별 정상 렌더, 모달 데스크톱/모바일 정상.

### #12 상세
- `StatusResult.tsx` 인라인 hex/시스템폰트 → 시맨틱 variant 시스템(`success/warn/danger/neutral`)으로 리팩토링. 하드코딩→하드코딩 치환 아님(시맨틱 클래스/토큰).
  - success→accent(브랜드 teal, SubscribeForm 성공카드와 동일), warn→amber, danger→red, neutral→sub/paper/edge 토큰.
  - 아이콘 stroke=currentColor로 variant 색 상속. 셸은 `/subscribe` 페이지와 동일(Pretendard·bg-paper·white card).
- `ConfirmContent`/`UnsubscribeContent`의 hex 맵을 variant로 교체, 미사용 NEUTRAL/DANGER/WARN 상수 제거.

### #13 상세
- `SubscribeModalButton.tsx`(클라이언트 아일랜드) 신규. 홈은 ISR 서버컴포넌트 유지, CTA만 클라이언트로 분리.
- 기존 `SubscribeForm` 재사용. `/subscribe` 페이지는 no-JS·SEO 폴백으로 유지(삭제 안 함).
- **부수 수정**: `SubscribeForm`에 마운트 가드 useEffect 추가 — 모달 재오픈(재마운트) 시 Turnstile `Script onLoad`가 다시 안 떠도 위젯이 렌더되도록(`window.turnstile` 있으면 직접 render). 이 수정 없으면 모달 두 번째 오픈부터 위젯이 안 떠 제출 불가.

### #7 상세
- main에 이미 슬러그 기본 테스트 있음(extractSlug/resolveLetterPageId). 빠진 케이스만 보강: 중복 슬러그(page_size=1·첫 결과), 특수문자/공백/유니코드 슬러그를 equals 필터에 변형 없이 전달, 부분 hex라도 슬러그 매치 우선.

## 스크린샷
- `/mnt/c/dev/notes/newsletter-preview/nm-modal-desktop.png`, `nm-modal-mobile.png`, `nm-home-desktop.png`
- `/mnt/c/dev/notes/newsletter-preview/nm-confirm-success.png` 등 결과페이지 6종(success=accent / expired=warn / invalid=danger …)

## 🔴 매뉴얼 검증 / 사용자 액션 필요 (내가 진행 안 함)
1. **[Tier A 최우선] SNS 바운스/신고 토픽** — AWS 콘솔에서 SNS 토픽 생성 + HTTPS 구독을 `/api/ses-notification`에 연결. 코드 수신부는 이미 존재. **순수 콘솔 작업이라 자율 불가.** 첫 대량발송 전 필수.
2. **[Tier C] S3 이미지 영속화** — S3 버킷 + IAM 정책 생성(콘솔/권한)이 선행돼야 코드 검증 가능. 버킷 스펙(이름/리전/퍼블릭정책) 결정 필요 → 결정 주면 코드 작업 가능.
3. **[Tier B] 지표 추적(오픈·클릭·조회)** — 수치 **저장 위치 결정**이 필요(Upstash/Vercel KV/Notion 중). 설계 분기라 임의 진행 보류. 방향 정해주면 구현.
4. **모달/결과페이지 실브라우저 사인오프** — 스크린샷은 첨부했으나 ①모달 포커스트랩·ESC·애니메이션 실동작 ②Turnstile 실위젯(헤드리스에선 challenges.cloudflare.com 연결 실패로 위젯 에러 표시 — 코드 문제 아님)은 실제 PC 브라우저에서 최종 확인 권장.
5. **머지 판단** — 새 브랜치 3개 + 기존 미머지 2개(`feat/phase4-send`, `feat/letter-latency-cache`)는 사용자 검토 후 머지.

## 참고
- 작업용 worktree: `newsletter-self-host-{result-page-tokens,subscribe-modal,slug-edge-tests}` (node_modules는 본체 심볼릭, .env 복사). 정리 시 `git worktree remove`.
- 야간에 prev 세션 orphan `next-server` 3개(5/27) + 본인 테스트 서버 정리함(포트 3100).
