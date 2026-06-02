---
name: project-newsletter-self-host
description: "Maily 대체 — AWS SES + Notion + Vercel 자체 뉴스레터. 코드 전부 main + Vercel 배포. 단일옵트인+환영메일+이름+Source('web') 모두 main 머지·배포(2026-05-27). 환영메일=레터DB 유형=웰컴레터 렌더(Vercel prod env에 NOTION_CAMPAIGNS_DB_ID 추가해 발송 정상화). SES 프로덕션 승인 완료. ✅ 홈페이지 통합 LIVE(2026-05-27): www.notiontalk.com/newsletter Multi-Zones 배포완료(홈/구독/레터/콘텐츠월/API E2E검증, 네비바=뉴스레터 페이지 상단에 노션톡 SiteNav 사본 이식, apex 메뉴엔 뉴스레터 항목 없음=URL진입만, apex 원본 변경 시 사본 수동 동기화 필요). SNS 바운스/신고 토픽 ✅완료·E2E검증(2026-05-29, apex ID Bounce/Complaint→노션 자동마킹). 🔴다음 최우선=발송대상 정리: 현 DB 552명은 사실 **Luma 웨비나 참가자**(Source 전부 import), 진짜 뉴스레터 대상 **Maily 700은 아직 미import**(메일리 대체 핵심 마이그레이션 미완)→사용자가 CSV 주면 import+dedup. 그 외 선택=지표추적(Upstash)·S3이미지. ⚠️apex는 `vercel --prod` CLI 수동배포(git자동X). 정본=리포 HANDOFF.md·implementation-notes.md"
metadata: 
  node_type: memory
  type: project
  originSessionId: fdf3c143-da7f-47b2-9381-9a0392917a3f
---

Maily 가격 200% 인상이 트리거가 되어 2026-05-23 착수. 자체 구축으로 구독료 제거.

**📍 현재(2026-05-28):**
- **웹UX 3건 + 캐싱 + 레이트제한 전부 main 머지·프로덕션 배포 Ready·라이브 200 확인**: feat/subscribe-modal(홈 구독=접근성 모달), result-page-tokens(결과페이지 시맨틱토큰), slug-edge-tests, letter-latency-cache(unstable_cache), **phase4-send-ready**(단계발송 `--max`+초당레이트 `--rate`+rate-gate.ts; 구 feat/phase4-send는 send.ts 해지슬래시 충돌나서 cherry-pick 해소본으로 대체). tsc0/테스트183/빌드 클린. main=`151d149`. ⚠️ 이제 **단계발송·레이트제한이 main에 있음**(`scripts/send.ts` `--max`/`--rate`).
- **✅ 발송 도메인 = apex `notiontalk.com` 유지로 확정(2026-05-29, 이전 서브도메인 전환 결정 철회)**: 리서치+분석 결론. ①서브도메인 DKIM은 `<토큰>._domainkey.news` 2-dot 호스트 필수 → Gabia가 못 받음(2026-05-24 실측, 입력실수 아님 — 셋업문서에 정확한 상대형식 적고도 거부됨). 회피책은 외부 DNS 위임(Route53/Cloudflare)뿐인데 사용자가 "다른 서비스 우회 이상하다" 거부. ②실측 DNS: `news.*`·`newsletter.*` 둘 다 **레코드 0개**(메일리 충돌 우려 해소), apex는 MX 없음(수신함X)+메일리 SPF만. **이 프로젝트가 메일리 대체 중 → apex 발신 = 뉴스레터 단 하나 = 격리해도 지킬 트랜잭션 스트림 없음 → 실익 작음.** → **`help@` 등 별도 발신 생기면 그때 재개**(더 자연스러움). 절차 가이드 보관=`/mnt/c/dev/notes/newsletter-subdomain-migration-2026-05-28.md`. 지표저장소 결정메모=`/mnt/c/dev/notes/newsletter-metrics-decision-2026-05-28.md`.
- ⚠️ README/.env.example가 `news.notiontalk.com`(서브도메인) 표기로 남아있으면 **apex로 정정 필요**(실제 prod env=apex가 정답). 문서-현실 역전 주의.

**📍 현재(2026-05-26) — 정본은 리포 `HANDOFF.md`·`WEBHOOK-SETUP.md`:**
- 코드 전부 `main` + **Vercel 프로덕션 배포 완료**: `https://newsletter-self-host.vercel.app`(프로젝트 `newsletter-self-host`, 런타임 env 9개, 공개 접근). 구독/확인/해지 라이브(해지 `/api/unsubscribe` 302 검증).
- **노션 버튼 → 웹훅 발송 파이프라인 E2E 검증 완료**: 레터 페이지에 `id()` formula 속성 → 노션 "웹훅 보내기" → relay(`notion-action-relay`, `?action=newsletter-test`/`newsletter-send`) → GitHub Actions `send.yml` → `send.ts`. 테스트=TEST_RECIPIENTS 3주소(목록 우회), 전체=`--confirm-all`. ⚠️ relay GH_PAT은 **두 repo(notion-action-relay·newsletter-self-host) Actions:RW** 필요(2026-05-26 추가).
- 발신자명 `노션톡 레터`(ses.ts RFC2047 인코딩 적용). PUBLIC_BASE_URL=배포 도메인을 Vercel·GitHub시크릿·로컬.env 3곳에 설정.
- **subscribe 봇차단 ✅ 완료**: Cloudflare Turnstile 게이트 main 머지·**프로덕션 배포·라이브 검증 완료**(2026-05-27, prod 토큰누락→403). `lib/turnstile.ts`(siteverify, fail-closed)+라우트 게이트(노션쓰기·메일발송 전)+폼 위젯. 키 2개 Vercel Production+로컬.env(테스트키) 등록. 보안감사 통과. IP 아닌 요청당 토큰 검증(학교 NAT 오탐 없음). CSP 도입 시 `challenges.cloudflare.com` 화이트리스트 필수.
- **SES 프로덕션 승인 ✅ 완료(2026-05-27)** — 샌드박스 해제, 임의 주소 발송 가능. 단 신생 프로덕션 계정이라 반송<5%·신고<0.1% 감시 → 평판 관리 실제 리스크화.
- **구독 단일 옵트인 ✅ main 머지·배포 완료(2026-05-27)**: 더블옵트인 폐기. 버튼→즉시 confirmed + 환영메일 best-effort. 환영메일=레터 DB `유형=웰컴레터` 페이지 실시간 렌더. `createConfirmedSubscriber`·`findWelcomeLetterPageId`·`sendWelcomeEmail` 추가. goedu 실주소로 환영메일 수신 E2E 확인. **⚠️ 환영메일 버그픽스**: Vercel prod env에 `NOTION_CAMPAIGNS_DB_ID`가 없어 환영메일이 조용히 스킵되던 것 → env 추가+재배포로 정상화.
- **구독폼 이름/닉네임(선택) + Source='web' ✅ 머지·배포(2026-05-27)**: 백엔드는 이미 name 지원, 폼 입력란만 누락이었음. Source는 `/api/subscribe` 라우트 기본값(노션 select 옵션 'web').
- **✅ 홈페이지 통합 LIVE(2026-05-27 배포완료)**: 구독폼 raw vercel.app 도달성 문제 → `www.notiontalk.com/newsletter` Next.js Multi-Zones 편입(apex notiontalk-landing가 서버사이드 프록시). 뉴스레터 앱 `basePath:/newsletter`+`trailingSlash:true`, fetch/쿠키/리다이렉트/링크 절대경로 대응. apex는 `/contents` 패턴 미러링한 `/newsletter` rewrite(루트 무한루프 버그=`:path*` 더블슬래시 발견·수정: `:path+`+루트명시규칙). `PUBLIC_BASE_URL`→`notiontalk.com/newsletter`(Vercel·GitHub·phase3 .env). SiteNav는 apex 사본 이식(메뉴 동일, URL진입만). E2E 전경로 검증. ⚠️ **apex는 `vercel --prod` CLI 수동배포**(git자동X) — [[notiontalk.com 도메인 아키텍처]] 참조. **레터 슬러그=노션 레터DB '슬러그'(rich_text) 속성**(`/letters/<슬러그>`, 신규 레터는 속성 채워야 함·비면 page id 폴백). 정렬은 about-us 구조(풀폭 px 래퍼+max-w-6xl 안쪽)로 좌측 일치, 레터 배경 흰색 통일. ⚠️ **이 repo에 auto-sync 데몬 활성** — 작업 중 `feat/autosync-<date>` 브랜치를 만들어 변경을 자동 커밋·체크아웃해 main이 뒤처질 수 있음(squash 머지로 수습). 동시 작업 시 worktree 권장. 남음: **S3 이미지 영속화**(레터/이메일 이미지 노션presigned ~1h만료) + send.ts 해지링크 슬래시 보정(다음 발송 전). 상세=HANDOFF·implementation-notes.
- **남은 블로커(도달률)**: ① **SNS 바운스/신고 토픽**(첫 대량발송 전 필수) ② 리스트 위생 ③ 워밍업. (홈페이지 통합이 현재 우선순위 위.)
- ※ 아래 2026-05-24 상세는 히스토리 — 그 시점 stale 항목(Phase4 미머지·PUBLIC_BASE_URL/SES_FROM_NAME 빈값·Phase5 미착수)은 모두 해소됨.

**Why:** 비용(SES $0.10/1,000통 ≈ 0) + API 자유도. 진짜 난관은 발송이 아니라 도달률(네이버·다음·Gmail) + SES 평판 유지(바운스/신고 처리).

**확정 요구사항:**
- 규모: 구독자 ~수백, 발송 주1~월1회
- 원고: Notion 기반 (Notion → HTML 이메일)
- 발신 도메인: **루트 `notiontalk.com`** (2026-05-24 결정). 서브도메인 `newsletter.notiontalk.com`을 쓰려 했으나 **가비아 DNS UI가 DKIM의 2-dot 호스트(`토큰._domainkey.newsletter`)를 못 받아서**(점 1개 제한) 루트로 선회. 루트는 DKIM 호스트가 `토큰._domainkey`(점 1개)라 가비아 OK. MAIL FROM `mail.notiontalk.com`, From `newsletter@notiontalk.com`. 메일리도 루트를 쓰지만 DKIM 셀렉터 달라 공존. 기존 사이트/메일리 레코드 건드리지 말고 SES 레코드만 추가.
- DNS 진행(2026-05-24): DKIM CNAME 3개 가비아 입력 완료, DNS 조회 3/3 정상. 확인된 기존 레코드 — `_dmarc.notiontalk.com`=`v=DMARC1; p=none;`(유지, 덮지 말 것), root SPF=`v=spf1 include:spf.maily.so ~all`(메일리, 건드리지 말 것). 도메인 Verified 완료(DKIM). MAIL FROM(`mail.notiontalk.com`: MX=`feedback-smtp.ap-northeast-2.amazonses.com` pri10 + SPF `v=spf1 include:amazonses.com ~all`) 입력·DNS검증 완료. **DNS 전부 끝남**(DKIM 정렬+SPF 정렬 둘 다 확보). IAM 발송 키 생성·검증 완료(2026-05-24, 메일박스 시뮬레이터 발송 SUCCESS — 자격증명/권한/발신도메인/리전 정상). 프로덕션 액세스 신청 제출(승인 대기 ~24h). TOKEN_SIGNING_SECRET .env에 생성 완료. 남은 Phase 0: 프로덕션 액세스 승인, SNS 토픽(바운스/신고, Phase 3 전).
- 범위: 실용 MVP (구독폼+더블옵트인+발송+해지+바운스 처리, 대시보드/오픈추적 후순위)

**구성:** AWS SES(서울 ap-northeast-2) + Notion DB(구독자+원고) + Vercel(구독폼/확인/해지/SNS웹훅) + 로컬 CLI `scripts/send.mjs`(발송).

**How to apply:**
- 리포: `/mnt/c/dev/newsletter-self-host` (GitHub `1000ssam/newsletter-self-host` 비공개). 계획은 `PLAN.md`, 외부 셋업 체크리스트는 `docs/PHASE0-SETUP.md`.
- 현재(2026-05-24): **Phase 1~4 `main` 머지·origin 푸시 완료**(`main`=`29f7914`, fast-forward + HANDOFF 커밋. 테스트 140·tsc·next build 클린). **유일 블로커 = SES 프로덕션 액세스 승인 대기**(승인 전엔 인증주소/시뮬레이터 발송만). 실 원고 1건 dry-run 검증 완료(552명 대상, 비교표 포함 정상 렌더). Phase 0 외부셋업은 DNS·IAM·토큰·Notion DB 전부 완료, SNS 토픽 생성(콘솔)만 남음. ⚠️ 실발송 전 `.env`의 PUBLIC_BASE_URL·SES_FROM_NAME(빈 값) 채워야 함. feat/phase1-foundation은 별도 라인(옛 HANDOFF 무시) — main HANDOFF가 정본.
- Phase 1(코드) **완료**: `lib/tokens.ts`(HMAC 토큰)·`lib/notion.ts`(구독자 CRUD)·`lib/ses.ts`(SESv2 발송) + 테스트. 브랜치 `feat/phase1-foundation`. `lib/notion.ts`의 `PROP` 상수로 Notion 속성명(영어) 참조 → DB 속성명 정확히 일치 필요.
- Phase 2(구독 플로우) **완료·미머지**: `app/api/subscribe`·`confirm` + 구독폼·확인 페이지 + `lib/email-templates.ts`. 브랜치 `feat/phase2-subscribe`(워크트리에서 검증).
- Phase 3(해지+바운스) **완료·미머지·푸시됨**: `app/api/unsubscribe`(GET+POST 원클릭) + `app/api/ses-notification`(SNS 웹훅, 공식 `sns-validator` 서명검증) + `lib/sns.ts` + 해지페이지 + `StatusResult` 공유컴포넌트 + 보안헤더(next.config). 총 81 테스트·tsc·next build 클린. 브랜치 `feat/phase3-unsubscribe`(`feat/phase2-subscribe`에서 스택, 워크트리 `/mnt/c/dev/newsletter-self-host-phase3`). ⚠️ auto-sync 데몬이 이 리포에 활성 — 작업 중 자동 커밋+push 발생.
- Phase 4(발송 파이프라인) **완료·미머지·미푸시** (커밋 `f39c455`, 브랜치 `feat/phase4-send`, 워크트리 `/mnt/c/dev/newsletter-self-host-phase3`): 렌더링 스택은 **커스텀 렌더러로 확정**(PLAN.md notion-to-md→marked→juice 폐기). `lib/render.ts`(블록→email-safe HTML/평문, 의존성0, 테마 주입, href 화이트리스트·이스케이프), `lib/notion-content.ts`(페이지/블록 재귀조회+parsePageId), `lib/send-log.ts`(`send-logs/<id>.json` 멱등), `lib/email-templates.ts`(공유 셸+`buildNewsletterEmail`), `scripts/send.ts`(`.mjs` 아님, Node24 네이티브 TS, `npm run send -- <url> --dry-run`, 개인화 해지링크+List-Unsubscribe 헤더+p-limit). tsconfig `allowImportingTsExtensions` 추가, `p-limit` 설치.
- 다음: **Phase 5(배포·도달률)** — Vercel 배포(env에 SES_FROM_NAME·PUBLIC_BASE_URL 추가)+SNS HTTPS 구독 연결+첫 실발송으로 List-Unsubscribe 헤더 런타임 수용 확인+E2E. 그 전 사용자 작업: 실노션 페이지 dry-run 눈확인, Phase2·3·4 main 머지 검토. 보안 후속: `/api/subscribe` rate limiting(구독폭탄, Turnstile/Upstash). 미해결: 노션 업로드 이미지 presigned URL 만료(외부 URL 권장). 브랜치 정책 [[feedback_branch-policy-strict]]: 사용자 검토 후 명시적 머지 전까지 main 금지.
- notiontalk.com DNS = **가비아(Gabia)** (NS: ns.gabia.net 등). SES DKIM/MAIL FROM/DMARC 레코드는 가비아 DNS 관리툴에 추가.
- Notion 구독자 DB 생성·검증 완료(2026-05-24): 스키마 코드와 100% 일치, .env에 NOTION_TOKEN/DB_ID 채워져 동작 확인. 검증 스크립트 `scripts/check-notion-schema.mjs`.
- 미해결: (광고) 표기 의무 여부 미확인.
- 기존 maily-subscribe 스킬 로직(Notion 구독자 CRUD) 재활용.
- 코드 시작 시 [[feedback_design-tokens-not-hardcoding]] 무관하나, 시크릿 3원칙 [[feedback_secret-management]] 엄수. 더블옵트인=정보통신망법 동의 이력.

**🚨 발송 안전 규칙 (절대)**: `뉴스레터 구독자` DB의 552명은 **실제로 모은 진짜 구독자**. **테스트 발송에 절대 사용 금지.** 테스트용 이메일은 별도 협의 예정(미정). dry-run(읽기전용)은 무관.

**Notion 토폴로지 (2026-05-24 확정)**: 워크스페이스 "1000쌤의 학교에서 노션하기"에 통합 2개 — ⑴ **`newsletter` bot**(=프로젝트 `NOTION_TOKEN`, send.ts가 사용): `뉴스레터 구독자`(DB id=`NOTION_SUBSCRIBERS_DB_ID`, ds 71a57f26)·`CRM 이벤트/연수`(db `57f716c0`)·`CRM 콘텐츠/리드마그넷`(db `3b873707`)·**`뉴스레터 레터`(db `36add1dc-d644-81eb-bfdc-e9e121c2a9d3`, NEW, `.env` NOTION_CAMPAIGNS_DB_ID)** 만 접근. CRM 허브 부모 페이지=`369dd1dc-d644-80cd-9f46-c64664edd607`. ⑵ **`Claude Code` bot**(=notion-pilot의 notion-api.mjs 개인 토큰): 이 CRM은 **404로 못 봄**. → **이 프로젝트 Notion 작업은 notion-api.mjs 말고 `NOTION_TOKEN`(@notionhq/client)으로** 해야 함(합당한 notion-pilot 편차).

**레터 DB 설계 (최종 확정 2026-05-24)**: `뉴스레터 레터` DB에 **모든 발송 본문을 페이지 콘텐츠로 작성**(정보성·이벤트안내 전부). 속성: 제목(title)·유형(select 정보성/이벤트안내/공지)·상태(select 초안/검토/발송완료)·발송일(date)·연결 이벤트(relation→CRM이벤트/연수)·연결 콘텐츠(relation→CRM콘텐츠)·메모. **이벤트 DB는 구조화 "정보"(진행일·신청자·링크)만 보유 — 이메일 본문 없음.** relation은 "이 레터가 어느 이벤트 안내인지" 연결·추적용(본문 소싱 아님). → **send.ts 변경 불필요**: 레터 페이지 본문을 그대로 렌더하는 현 로직으로 충분(사용자 확정). 출처 해석 로직 만들지 말 것.
