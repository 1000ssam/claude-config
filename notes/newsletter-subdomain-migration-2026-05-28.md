# 뉴스레터 발송 → 서브도메인(`news.notiontalk.com`) 전환 가이드

> 2026-05-28. 사용자 지시: apex 발송 → 서브도메인 발송 전환.
> **코드 변경 없음** — 전부 DNS + SES + env 값 작업. 웹페이지 `/newsletter` 구조는 무관(별개 레이어).

---

## ⚠️ 먼저 알아야 할 함정 — "그냥 From만 바꾸면 안 됩니다"

SES는 **검증된 도메인의 서브도메인으로도 발송을 허용**합니다. 그래서 아무 DNS 작업 없이 그냥
`SES_FROM_EMAIL`만 `newsletter@news.notiontalk.com`으로 바꿔도 **메일은 나갑니다.** 하지만:

- 이 경우 DKIM 서명은 **apex 키(d=notiontalk.com)**로 됩니다.
- 메일박스 사업자(Gmail 등)는 평판을 **DKIM 서명 도메인(=notiontalk.com)**에 귀속시킵니다.
- → **평판 격리 효과 0.** From 주소만 바뀐 화장(cosmetic)일 뿐, 원하던 "서브도메인이 안전하다"는 이득을 못 얻습니다.

### 두 가지 길

| | Option 1 (화장) | **Option 2 (진짜 격리) ← 목표에 맞음** |
|---|---|---|
| 작업 | env 값만 변경 | 서브도메인을 **별도 SES ID로 검증** (자체 DKIM) |
| DNS | 불필요 | DKIM CNAME 3개 등 필요 |
| DKIM d= | notiontalk.com | **news.notiontalk.com** |
| 평판 격리 | ❌ 없음 | ✅ 있음 |
| 결론 | 의미 없음 | **이걸로 진행** |

→ 아래는 **Option 2** 절차입니다.

---

## 핵심 장애물: 가비아 DNS UI의 2-dot 제약

2026-05-24에 이미 부딪힌 문제. SES 서브도메인 DKIM 레코드 호스트는
`<토큰>._domainkey.news` (점 2개)인데, **가비아 DNS UI가 점 2개 호스트를 거부**(점 1개 제한).
이래서 그때 apex로 선회했음. 이걸 우회해야 서브도메인 격리가 가능.

### 우회 STEP 0 — 가비아 재확인 (무료, 5분, 먼저 시도)
가비아 DNS 관리에서 CNAME 호스트에 **전체 FQDN**(`<토큰>._domainkey.news.notiontalk.com` 또는 `<토큰>._domainkey.news`)을 입력해 본다. UI가 바뀌었거나 FQDN 입력은 받을 수 있음.
- 받으면 → **Route53 불필요**, STEP 2로 직행(가비아에 직접 DKIM 입력).
- 여전히 거부 → STEP 1(Route53 위임).

### 우회 STEP 1 — `news` 서브도메인만 Route53로 위임 (권장, ~$0.50/월)
이미 AWS 쓰니 자연스러움. **apex·Maily 레코드 안 건드림.**
1. Route53 → **Hosted zone 생성**: `news.notiontalk.com` (월 $0.50).
2. 생성 시 받은 **NS 4개**를 가비아에 등록: 호스트 `news`, 타입 NS, 값=각 네임서버 4줄.
   - (호스트 `news`는 점 0개라 가비아 OK — 2-dot 문제는 DKIM 호스트에서만 발생)
3. 전파 후 `news.notiontalk.com`은 Route53가 관리 → 점 개수 제한 없음.

> Cloudflare는 무료지만 서브도메인 단독 zone이 유료플랜이고, apex 전체 이관은 기존 레코드 위험 → **Route53가 가장 깔끔**.

---

## 본 작업 (STEP 0/1로 DNS 입력 경로 확보 후)

### STEP 2 — SES에서 서브도메인 ID 검증
1. SES 콘솔(ap-northeast-2) → Identities → **Create identity** → Domain → `news.notiontalk.com`.
2. **Easy DKIM** 선택 → SES가 CNAME 3개 제시.
3. 그 CNAME 3개를 **Route53의 news zone**(또는 가비아 가능 시)에 입력.
   - Route53면 레코드 이름이 `<토큰>._domainkey`(zone 기준 상대) → 점 문제 없음.
4. (권장) **Custom MAIL FROM**: `mail.news.notiontalk.com` → MX `feedback-smtp.ap-northeast-2.amazonses.com`(pri 10) + TXT SPF `v=spf1 include:amazonses.com ~all`. (SPF 정렬 강화용. 없어도 DKIM 정렬로 DMARC 통과하나, 있으면 더 견고.)
5. (선택) `_dmarc.news.notiontalk.com` TXT `v=DMARC1; p=none;` — 없으면 apex DMARC의 `sp=`가 적용됨.
6. SES가 DKIM 감지 → **Verified** 될 때까지 대기(수분~수시간).

### STEP 3 — SNS 바운스/신고 토픽을 이 ID에 연결 (= 원래 Task #1)
**서브도메인 ID가 검증된 뒤** 진행(그래야 올바른 ID에 걸림 — apex에 먼저 걸면 헛수고):
1. SNS(ap-northeast-2) → 토픽 `newsletter-ses-feedback`(Standard) 생성.
2. 구독 추가: HTTPS, 엔드포인트
   `https://newsletter-self-host.vercel.app/newsletter/api/ses-notification/`
   (⚠️ **끝 슬래시 필수** — 없으면 308 리다이렉트로 SNS 구독 실패. 라우트가 자동 확정함 → Status "Confirmed" 확인)
3. SES → Identities → **`news.notiontalk.com`** → Notifications → Feedback notifications → Edit:
   - Bounce / Complaint SNS topic = `newsletter-ses-feedback`
   - (권장) Email Feedback Forwarding 끄기
   - ⚠️ apex(`notiontalk.com`) ID에 기존에 걸어둔 게 있으면 정리.

### STEP 4 — Vercel env 전환 (← 이건 내가 함, DNS 검증 끝난 뒤)
```
SES_FROM_EMAIL = newsletter@news.notiontalk.com   (현재 newsletter@notiontalk.com)
```
- GitHub Actions 발송이 같은 값을 쓰면 GH Secret도 동기화 필요.
- **검증 전에 바꾸면 발송이 깨짐** → 반드시 STEP 2 Verified 확인 후.
- 로컬 `.env`도 동일하게(로컬 테스트 발송용).
- `PUBLIC_BASE_URL`(웹 링크용)은 **바꾸지 않음** — 발송 도메인과 무관.

### STEP 5 — 검증 (내가 실행 가능)
1. 발송 스크립트로 `success@simulator.amazonses.com`에 1통 → 수신 헤더에서
   `DKIM-Signature: ... d=news.notiontalk.com` 확인(= 진짜 격리 작동) + DMARC pass.
2. `bounce@simulator.amazonses.com` / `complaint@simulator.amazonses.com` → SNS → Notion 제외 마킹 E2E.
   (시뮬레이터는 평판 영향 없음)

---

## 요약 체크리스트
- [ ] STEP 0: 가비아 FQDN 재시도 (받으면 Route53 생략)
- [ ] STEP 1: (가비아 막히면) Route53 zone `news.notiontalk.com` + 가비아 NS 위임
- [ ] STEP 2: SES 서브도메인 ID 검증 (DKIM CNAME 3 + MAIL FROM + DMARC)
- [ ] STEP 3: SNS 토픽 + 구독(끝슬래시) + **news ID**에 피드백 알림 연결
- [ ] STEP 4: Vercel/GH/로컬 `SES_FROM_EMAIL` → 서브도메인 (← 내가, 검증 후)
- [ ] STEP 5: 시뮬레이터로 DKIM d=news 확인 + 바운스→Notion E2E (← 내가)

## 사용자 손이 필요한 것 / 내가 할 수 있는 것
- **사용자**: STEP 0~3 (콘솔/DNS) — 콘솔·DNS 접근은 나에게 없음. 단계별 안내는 가능.
- **나(자동)**: STEP 4(env 플립, vercel CLI) + STEP 5(시뮬레이터 발송 E2E) — STEP 2 Verified만 확인되면 즉시.
