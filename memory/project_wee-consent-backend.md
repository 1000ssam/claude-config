---
name: project_wee-consent-backend
description: "wee-consent = 링글(wee-log) 백엔드 서버. Cloudflare Worker, consent.wee-linked.com. 동의서·공휴일/NEIS 프록시·구독 검증·(예정)SMS. 절대 삭제 금지."
metadata: 
  node_type: memory
  type: project
  originSessionId: 776f6986-6b32-4687-9856-d97ad3fcc3af
---

**wee-consent = 링글(wee-log 앱)의 백엔드 서버.** 🚨 **절대 삭제 금지** — 지우면 링글 동의서·캘린더(공휴일/학사일정) 죽음.

**wee-* 패밀리** (헷갈리지 말 것):
- **wee-log** = 데스크톱 앱 (=링글, 상담기록 STT 앱)
- **wee-linked** = 웹 허브 (wee-linked.com, 상담교사 사이트)
- **wee-consent** = 백엔드 서버 (이 메모) — 앱이 뒤에서 호출하는 중계 서버

**실체**:
- Cloudflare Worker `wee-consent`, 주소 **`https://consent.wee-linked.com`** (wee-linked.com 존의 커스텀 도메인 — 별도 도메인 안 삼, 2026-06-12 결정. 보호자 신뢰·배관 면이라 브랜드 분리 불필요).
- D1 DB `wee-consent`(id 86b5c771…, APAC). Cloudflare 계정 = slowly007@goedu.kr (계정 이메일 미인증 → workers.dev만 막힘, 커스텀도메인·secret·script upload는 됨).
- 하는 일 4가지: ①보호자 동의서(E2E 영지식) ②공휴일(data.go.kr)·학사일정/학교검색(NEIS) 프록시(키 격리+D1 캐시) ③구독 entitlement 검증(`REQUIRE_ENTITLEMENT` 플래그, 현재 false) ④(예정) SMS 발송(`/sms/consent`, 프로바이더 미정).

**키(secret) 위치 — 전부 서버에만, 앱 번들엔 0** (P4 2026-06-12 격리):
- Cloudflare Worker secret: HOLIDAY_API_KEY, NEIS_API_KEY, (예정)SOLAPI_API_KEY/SECRET/SENDER. 공개키는 wrangler.toml [vars].
- 위링 Supabase 함수 secret: ENTITLEMENT_PRIVATE_JWK(서명), ADMIN_API_KEY. 사본 admin키 = `~/.claude/secrets/weelog-admin-issue-key.txt`.

**배포/운영 함정**:
- `wrangler deploy`는 이메일 미인증이라 끝의 workers.dev subdomain 토글에서 죽음(스크립트 업로드는 됨 → 코드 반영은 됨, 에러 무시). secret·커스텀도메인은 Cloudflare API 직접 호출로 운용(`.qa/cf-*.ps1`).
- 앱이 보는 설정은 `VITE_CONSENT_SERVER_URL` 하나(= consent.wee-linked.com).

관련: [[project_wee-log-subscription-decisions]](구독), [[project_wee-log-consent]](동의서 앱측), [[project_wee-linked-deploy]](위링 웹). P4 작업 브랜치 `feat/p4-release-gate`(wee-log)·`feat/weelog-subscription-schema`(wee-linked), main 미머지(2026-06-12).
