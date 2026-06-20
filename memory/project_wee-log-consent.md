---
name: project_wee-log-consent
description: "wee-log 보호자 동의서 E2E 영지식 발송·수합 기능(별도 워크트리/브랜치, libsodium+Cloudflare)"
metadata: 
  node_type: memory
  type: project
  originSessionId: dfd18209-74ba-43d6-b523-e0dab79579fa
---

wee-log(전문상담교사 상담기록 Electron 앱)에 **보호자 동의서/접수양식 E2E 영지식 발송·수합** 기능 구현. 플랜: `~/.claude/plans/humble-kindling-ladybug.md`.

**위치(혼동 주의)**: 워크트리 `/mnt/c/dev/wee-log-consent`, 브랜치 `feat/consent-forms` (최신 `9b9296f`; …97fb053 폼빌더UI→387c576 보류기록→9b9296f **Phase 6 감사로그**). wee-log STT/LLM 워크트리(wee-log-ai, wee-log-integration)와 별개. ⚠️ 같은 .git 공유 → `git stash`는 worktree 간 공유 스택(다른 에이전트 stash 섞임). `tsc -b`는 composite라 .d.ts/.js를 emit하니 WSL 검증엔 `--noEmit` 쓸 것(`git clean` 금지—신규 untracked 소스 날아감).

**Phase 6 감사로그(2026-06-07, 야간 자율)**: 발송/수합/파기 11이벤트를 비식별 메타로 기록(`consent_audit_log`). 순수 빌더 `buildAuditEvent`가 PII 키 제거+전화번호 마스킹(DB 미의존→WSL 검증). best-effort 사이드카, request_id FK 미설정(이력보존). `consent:audit-list` IPC+패널 다이얼로그. 검증=단위25/25+test:units 13스위트, tsc -b DELTA=0, eslint 0err. **Windows 시각QA만 잔여**. main 미머지(보류 유지).

**⛔ 머지 보류 결정(2026-06-07)**: main에 **의도적 미머지**. 조건 = **SMS 발신번호(070 등) 확보 + 서버사이드 발송 게이트 완성** 후 머지. 현재 SMS는 클라이언트 발송(`electron/sms.ts`)이라 판매모델 부적합 → 구독 엔타이틀먼트에 올라타 Cloudflare Worker에서 "유효 구독자만 발송"으로 이전 필요(구독 Phase 1 선행). 빌드 위치 = [[project_wee-log-subscription-decisions]] §17.10 Phase 6. 동의서 기능 자체는 완성·검증, 링크 수동 전달은 지금도 동작. HANDOFF-consent.md 상단에도 기록됨.

**아키텍처**: 서버는 평문 응답·개인키를 절대 못 봄(libsodium sealed box, 요청별 X25519). 앱이 키쌍 생성→공개키만 서버로→보호자 브라우저가 `crypto_box_seal`→앱이 `crypto_box_seal_open` 복호→로컬 암호화 저장→서버 ack 파기. 백엔드=Cloudflare 단일 Worker(API+보호자폼 HTML)+D1+셀프호스팅 libsodium(`cloudflare/`). SMS=Solapi(채널 추상화 sms|link, running-challenge 인증 재사용, 본문 PII 0). UI=사례 상세 '동의서' 탭.

**검증 완료**: 단위테스트 12/12, 로컬 wrangler dev 전체흐름 23/23(영지식/1회용/만료/소유격리/앱↔브라우저 interop), D1 평문 PII 0, SMS 실발송 statusCode 2000(010-4929-3427 LMS).

**선행(배포 전)**: Cloudflare 계정+`VITE_CONSENT_SERVER_URL`, Solapi `VITE_SOLAPI_*`(.env.local.example 참조). 배포: `cloudflare/README.md` 절차.

**2026-06-12 3축 감사+수정 → main 머지 완료**: 리포트 `/mnt/c/dev/notes/wee-log-consent-audit-2026-06-12.md`(31건). 수정 핵심: ①응답유실 3중 차단(revoke responded 409 보존+cron 7일 유예+15분 백그라운드 자동수합+발송 전 회수) ②폼 방어(필드 key/type 서버 검증, CSP nonce+wasm-unsafe-eval, 에러 detail 제거, favicon 204) ③UX(재발송 경고, 폼 로드 폴백, 410 입력보존, 에러 한국어화). 라이브 검증=폼 항목 3/3(CSP 후 암호화 라운드트립 복호 증명)+flow.mjs **34/34**+tsc/eslint 0. **main 머지됨**(`e809bba`, 2026-06-12): p4-release-gate가 먼저 main 착지(0200e6a — SMS 서버화·entitlement·Worker 프로덕션배포 포함)해서 D묶음(S-1/S-2/W-4)은 p4가 이미 해결 → 내 consent 수정만 클린 ff로 main에 얹음. sms.ts는 p4가 삭제(서버 발송 `sendConsentSms`).
🚩 **잔여 2건**: ① **프로덕션 Worker 재배포 필수** — consent.wee-linked.com이 아직 구버전(CSP·revoke보존·필드검증 미반영, 라이브 헤더로 확인). `cd cloudflare && wrangler deploy`(프로덕션 D1 `86b5c771…`, 사용자 승인 후). ② 상담교사 패널 QA 4~6(재발송 경고·에러문구·15분 자동수합)은 머지된 앱에서 육안 — 사용자 결정으로 후속. E묶음(문서 드리프트·죽은코드·만료일표시) 후순위. 워크트리 `/mnt/c/dev/wee-log-audit-consent`는 정리 가능.

**2026-06-13 케이스 일괄 발송 + 기본 전체 체크 (`feat/consent-case-batch` @4c921ee, origin 푸시됨, main 미머지)**: ①신규 IPC `consent:send-case-batch`(학생N×양식M 순차, 학생당 SMS 1통, 회수 1회) — 기존 send-batch 본문을 `sendTemplatesForStudent`로 추출 공유, 시그니처 불변. 연락처 없는 학생 `no_contact` 가시적 제외. ②기본 체크="선택한 모든 학생에게 unsent인 양식 전부"(`src/lib/consent-selection.ts` 순수 모듈 3분류 unsent/active/completed) — f60a2a3 불변식(열자마자 경고 금지) 유지, active/completed는 배지+기본해제. main.ts 무수정(모듈 분해 보존). 검증: tsc 0·eslint 0·test:units 22스위트(신규 consent-send-defaults 24 + resend-scope 14). **잔여: Windows 시각 QA = qa-checklist 5번 섹션(11항목) → 통과 후 사용자 "머지해" 대기.**

**함정**: `libsodium-wrappers@0.7.15` ESM 빌드 패키징 버그(형제 `./libsodium.mjs` 누락)로 순수 ESM 실행 시 `ERR_MODULE_NOT_FOUND`. **앱은 electron-vite CJS(require)라 무관**. 검증 스크립트만 영향 → `node_modules/libsodium/dist/modules-esm/libsodium.mjs`를 `libsodium-wrappers/dist/modules-esm/`로 복사하면 해결(npm install 시 재적용). 관련 [[feedback_check-platform-compat]].
