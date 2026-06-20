---
name: project_wee-log-subscription-decisions
description: wee-log 구독/인증 설계 확정 결정(2026-06-07 grill, 2026-06-10 신원통합 개정). Phase1 백엔드 2026-06-12 위링 프로젝트 배포됨(subs_ 접두사 격리). 핵심 - 앱이 위링(wee-linked) Supabase 프로젝트 공유=한 계정, 앱은 OTP 로그인.
metadata: 
  node_type: memory
  type: project
  originSessionId: 5f9cd984-deab-4896-af33-f1948fe62b31
---

wee-log(상담교사 데스크톱 앱) 구독/인증 설계 — 2026-06-07 grill 세션에서 확정. `SUBSCRIPTION_DESIGN.md`(v2, repo) 위에 얹는 결정.

**상태 업데이트(2026-06-12 P4)**: **Phase 1 위링 프로젝트(`msmiqcinohvomkgmezta`) 실배포 완료.** ⚠️ 핵심 발견: wee-linked에 `public.profiles`가 이미 존재(display_name NOT NULL+role 트리거) → 구독 테이블 5종을 **`subs_` 접두사로 리네임**해 격리(마이그레이션 적용은 wee-linked 리포 `0021` 경유 db push — 그 프로젝트 DB 히스토리는 wee-linked 리포 소유). 좌석캡 트리거 레이스 픽스(락 선점→재계산 2문장 분리) + 라이브 동시 redeem 검증(5계정×3라운드=정확히 2석, `scripts/subscription/redeem-race.test.mjs`). 함수 배포 시 `--import-map` 필수·admin-issue는 `--no-verify-jwt`. 동의서 SMS 서버사이드 이전 완료(Phase 6 항목 선행 처리), Worker entitlement 게이트는 `REQUIRE_ENTITLEMENT` 플래그로 내장(Phase 2 후 'true'). 잔여: 사용자 키쌍 생성(ENTITLEMENT_PRIVATE_JWK)·Cloudflare 이메일 인증·Solapi 신키.

**상태 업데이트(2026-06-11)**: 12개 결정 `SUBSCRIPTION_DESIGN.md §17` 반영 완료 + 신원통합(§17.8 동거모델) 문서 동기화 완료(커밋 b73da50). **Phase 1 백엔드 MVP = 클라우드 E2E 검증(18/18) 후 main 머지 완료**(머지커밋 `67c410b`). `feat/subscription-backend` 브랜치·워크트리 삭제됨. E2E 러너 `scripts/subscription/e2e-cloud-qa.mjs`(임시 Supabase 프로젝트 대상, 운영키 미사용) 동봉. **남은 작업**: Phase 1 실배포(위링 프로젝트 `msmiqcinohvomkgmezta`에 db push + functions deploy + 사용자가 ENTITLEMENT_PRIVATE_JWK·ADMIN_API_KEY 시크릿 등록), Phase 2(일렉트론 통합)~Phase 6. 이하 옛 기록: 산출: `supabase/migrations/0001`(orders·redemption_codes·code_bindings·plans·profiles, RLS+좌석캡 트리거), Edge Function 3종(`entitlement`·`redeem`·`admin-issue`, deno check 통과), EdDSA 서명코어(`_shared/entitlement.ts`, Web Crypto Ed25519, 라운드트립 15/15), 코드생성/정규화(8/8), CSV 일괄발급 헬퍼, `README-subscription.md`(Supabase·OAuth·시크릿·배포 가이드). **사용자 액션 대기**: 앱전용 Supabase 프로젝트 생성·Google OAuth·키페어 생성(gen-entitlement-keys.mjs)·시크릿 등록·배포. Phase 2(일렉트론 통합)~Phase 6(동의서 SMS 서버사이드=consent 머지조건) 미착수.

**토폴로지**: 위링(랜딩, 오픈가입=실제 Supabase Auth 계정) → 그 안 "위스토리"=앱 소개+테크빌 결제 가교(런타임 결합 없음) → **테크빌**=결제·대행사(=구독자정보 제공처) → 벤더가 코드 발급 → 사용자 다운로드 → **일렉트론에서 로그인** → 코드 redeem → 사용.

**확정 결정:**
1. 판매채널=테크빌(대행사) 단독. 개인=코드1장, 단체(교육청)=멀티시트 코드(한 코드 max_seats=N).
2. 벤더 무과금. 서버는 `period_end`만 보유, 테크빌이 생성/연장/만료 신호. 월/n개월/학기/연간 전부 period_end로 표현(정기청구 webhook·past_due 머신 불필요).
3. 바인딩 조인키=**redemption code**(이메일매칭 아님). 영구키 아님, redeem 1회→계정 바인딩→이후 계정기준 자동갱신.
4. 유출통제=짧은 redeem 창+좌석캡+벤더 가시성/수동회수. 도메인락 강제 안 함(로그인 자유 우선).
5. 좌석 재배정=v1 벤더 수동. **redeem=계정별 바인딩 행**(회수 granularity 핵심). 회수계정=읽기전용. 학교 셀프 대시보드=v2.
6. 식별: 신원은 계정레이어에만(가입 시 이름 1회), redeem은 코드만(이메일 중복입력 X). 교육청이메일 신뢰성=로그인 기본값 넛지(교육청 Google). 가명=잔여리스크 수용.
7. 테크빌 연동 입력구=admin/CSV 수동 먼저(B), 내부모델 단일, push API는 인터페이스만 후속.
8. 무료체험=별도시스템 아님. 일반코드+`is_trial` 태그+짧은 period_end. plan(기능등급)과 직교.
9. 플랜등급 내용 미정 가능. 구조만: **서버 주도 feature 플래그**(엔타이틀먼트 토큰에 `features[]` 주입), 앱은 `hasFeature`/`requireFeature`(main IPC가 진짜 자물쇠, §16 requireKey 패턴 재사용). 등급재단=서버config, 앱 재배포 0.
10. 다기기=**1디바이스+매끄러운 자동이전**(새 기기 로그인=이전기기 자동 로그아웃). 좌석=계정바인딩이라 기기이동 시 재redeem 불필요, 데이터는 백업/복구로 이전.
11. 토큰/보안: 로그인 1회→구독만료까지 무중단(백그라운드 자동갱신). **grace(오프라인유효창)=7일**(재로그인 주기 아님). 2토큰(리프레시=키체인, 엔타이틀먼트=EdDSA 단수명). 비공개 서명키=서버 시크릿, 공개키=앱+**동의서 Worker 공유**.
12. 호스팅=~~앱 전용 Supabase 프로젝트(위링과 분리)~~ → **#13으로 개정됨(2026-06-10)**. 엔타이틀먼트 발급=Supabase Edge Function(비공개키 보관).

13. **(2026-06-10 개정 — #12·§17.8 뒤집음) 신원 통합: 앱이 위링(wee-linked) Supabase 프로젝트를 공유한다.** 별도 앱 전용 프로젝트 안 만듦. 이유: 위링 커뮤니티 서브디렉토리에 앱 소개·다운로드가 들어가는데, 별도 계정이면 "또 가입? 같은 ID인가?" UX 혼란. Supabase는 프로젝트당 `auth.users` 1개라 크로스-프로젝트 SSO 없음 → **같은 프로젝트 공유 = 문자 그대로 한 계정**(위링 가입↔앱 로그인 양방향).
    - **위링 실측(2026-06-10)**: wee-linked = Supabase Auth **이메일+비밀번호**, 프로젝트 ref `msmiqcinohvomkgmezta`. (OAuth/OTP 미사용)
    - **로그인 수단 분리**: 웹(위링)=이메일+비번 그대로 / **앱=같은 계정에 이메일 OTP**(앱엔 이미 로컬 데이터 비번 L2가 있어 "비번 2개" 함정 회피). 한 계정에 비번·OTP 공존(Supabase 허용). 구글은 후순위 옵션.
    - **가입 단일화**: 가입 창구=위링 웹 1개. 앱 로그인 화면 하단 "아직 위링 회원 아니세요? → (위링 가입 페이지)" 링크. 앱 내 가입 안 함.
    - **라이선스 테이블 동거**: orders·codes·bindings·plans를 위링 프로젝트에 두되 **RLS 전면차단(service_role만)** → 위링 웹 클라가 못 건드림(이미 그렇게 설계됨).
    - **안전**: 오픈가입이어도 계정≠구독(redeem 코드가 게이트). 신원 통합해도 상담데이터는 로컬 비번(L2) 전용이라 노출 무관.
    - **UI 카피**: "위링(wee-linked) 계정으로 로그인 — 위링 회원이면 같은 이메일로 바로 로그인".
    - **TODO**: ~~`SUBSCRIPTION_DESIGN.md §17.8` 개정~~ ✅완료(2026-06-10, `feat/subscription-backend` 커밋 `b73da50` — 설계문서 4종 동거모델로 동기화) / 남음: Phase 1 배포 타깃을 `msmiqcinohvomkgmezta`(위링)로 실제 배포. 코드는 `auth.users` FK 그대로라 이식 용이. [[project_wee-linked-deploy]]와 직결.
    - ⚠️ **혼동 주의**: "구독 데이터 별도 리포"는 **git 코드 리포** 분리를 뜻함(조직 취향). **데이터·인증은 위링 Supabase 프로젝트 동거**가 확정. 별도 Supabase '프로젝트'로 가면 크로스-JWT/FK상실 비용 → 동거로 회피한 게 핵심(2026-06-10 재확인).

**연결**: 동의서 SMS 서버사이드 발송은 이 엔타이틀먼트(공개키 검증)에 올라타 "유효 구독자만 발송" 게이트. [[project_wee-log-consent]]와 직결. 현재 동의서 SMS는 클라이언트 발송(`electron/sms.ts`, 판매모델에 안 맞음)→서버사이드 이전 필요(구독 Phase 후행).

**플랜 등급 구상(2026-06-12, 사용자와 확정):**
- 🔑 **분할 원칙**: "데이터 주권은 무료, 시간(재가공·자동화·AI)은 유료." 사람이 눈/종이로
  보는 건 무료, **기계가 다시 읽을 수 있는 형태(CSV/엑셀/NEIS양식)는 전부 유료.**
- **Free**: 일지 작성 전부 + **세션/케이스/학생별 인쇄·PDF**(이미 구현됨). = "구독 끊겨도
  내 기록 인쇄·PDF로 항상 빼냄" → 데이터 인질 우려 제거(경쟁사엔 무료티어 없음=진입 쐐기).
  운영원가 0(로컬앱, 무료유저는 서버 안 씀). AI·재가공 내보내기 없음. **CSV는 무료 아님(확정).**
- **Tier1(~1만원)**: 핵심가치=**NEIS 자동채움 + 보고서 템플릿 + 비전자 공문서 + CSV/엑셀**
  = 재가공 가능 "업무 자동화 내보내기"(전부 로컬 연산, 서버원가 0). 로컬 AI는 보너스/폴백일
  뿐 차별점 아님. (비전자문서=출력/결재용 공문서 포맷, 추후 개발 — HWPX 가능성)
- **Tier2(~2만원)**: 프리미엄 AI(챗봇형 인터페이스, STT 축어록) = 원격 GPU 서버 사용.
- 🔑 **경제 구조**: 상담교사 사용밀도 극저 → GPU 1장이 Tier2 수백~천 석 수용(용량 무제약).
  유일 변수 = **서버 월고정비 vs Tier2 석수**. 한계비용≈0이라 BEP 넘으면 거의 순마진.
  **서버 쌀수록 BEP 석수↓**(KT V100 320만/VAT=160석, A100 532만=266석, 물리호스팅
  ~50만 가정 시 ~25석 — [[wee-log-remote-llm]] 물리서버 조사 진행중).
- ⚠️ **Tier1 로컬 AI 품질 리스크**: 사용자가 "유저 PC 로컬 오픈웨이트=개노답" 동의. 대안 =
  Tier1에 원격 요약 **쿼터제**(서버 한계비용≈0이라 BEP 불변 + Tier2 업셀 깔때기). 권장안.
- 포지셔닝 전환: AI 기능 실질 기본값=원격, 로컬은 오프라인 폴백. 문구="외부 AI 사업자
  미제공·국내 자체 운영 서버·가명화·무저장"(레벨2 TEE 전까지 "종단간 암호화" 과장 금지).

14. **(2026-06-12 사용자 구상 — #9의 플랜등급 초안, 미확정)** 3-티어:
    - **Free**: 일지 작성 전부 / AI·나이스 엑셀·보고서 내보내기 미지원
    - **Tier1(~1만원/월)**: 나이스 엑셀+보고서 내보내기+로컬 AI
    - **Tier2(~2만원/월)**: 프리미엄 AI = 원격 서버(챗봇형 인터페이스+STT 축어록)
    - 배경: 사용자 판정 "유저 PC 로컬 AI는 품질 개노답" → 원격이 AI 실질 기본값([[wee-log-remote-llm]]).
      서버 원가는 Tier2 전용 → 손익분기=서버 월비용÷2만원. Claude 제안(미결): Tier1에 원격 AI
      쿼터제(한계비용 ~0, 업셀 경로), 로컬은 오프라인 폴백으로 강등. GPU 물리서버 임대(IWINV 등)
      가격 조사 + 티어별 손익분기 정리 진행 중(2026-06-12).
