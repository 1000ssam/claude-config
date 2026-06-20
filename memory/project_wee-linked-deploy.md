---
name: project_wee-linked-deploy
description: wee-linked.com 프로덕션 배포는 git push가 아니라 vercel --prod 직접 실행 필요
metadata: 
  node_type: memory
  type: project
  originSessionId: 496f5739-d4eb-41ba-8245-1597b58e8d11
---

wee-linked(/mnt/c/dev/wee-linked, Next.js+Supabase, 도메인 wee-linked.com) 배포 모델:

- **main에 push해도 Vercel은 Preview 배포만 생성**한다(production 자동 승격 안 됨). 2026-06-09 확인: 카테고리·게시판 레이아웃 작업을 main 머지+push 했으나 wee-linked.com은 옛 버전 유지, 최신 빌드는 전부 "Preview"로 찍힘.
- **프로덕션 반영 = `vercel --prod --yes`** 를 직접 실행해야 함(현재 main 체크아웃 상태에서). Preview 빌드는 prod env가 아니라 `vercel promote`로 직접 승격 불가 — 새 prod 빌드가 필요.
- 검증법: `curl -s https://wee-linked.com/community/free | grep -oE "마커"` 로 신/구 코드 마커 대조(예: 신규 클린탭=`border-b-2`, 구버전 발췌형 행=`line-clamp-2`).
- 그래서 "main 머지 = 라이브"로 착각 금지. 머지 후 반드시 `vercel --prod` 까지 해야 사용자에게 보인다.
- Supabase 마이그레이션은 별도: `supabase db push`. ⚠️ **마이그레이션 드리프트 주의**(2026-06-17 확인): 원격 `schema_migrations`에 `0021_weelog_subscription_schema`가 이미 적용돼 있음(미머지 `feat/weelog-subscription-schema`가 원격 DB에만 선반영 — [[project_wee-log-subscription-decisions]] 라이선스 스키마). 이 0021 파일이 없는 브랜치에서 `db push` 시 "Remote migration versions not found in local migrations directory"로 막힘. 우회: `git show origin/feat/weelog-subscription-schema:supabase/migrations/0021_weelog_subscription_schema.sql > supabase/migrations/0021_weelog_subscription_schema.sql`(커밋 X) → `db push`(적용된 0021 skip, 새 것만) → 임시파일 rm. 근본 정리: 구독 브랜치를 main에 머지해 0021 동기화. (그래서 게시판 개편 마이그레이션은 0022·0023 으로 들어감)

DB·도메인 인프라 맥락은 프로젝트 HANDOFF.md 참조. [[feedback_pass-means-merge]] 적용 시 이 프로젝트는 머지 후 prod 배포 한 스텝 더 필요.

**신원 공유 결정(2026-06-10)**: wee-linked Supabase 프로젝트(`msmiqcinohvomkgmezta`, Auth=이메일+비번)가 **wee-log 데스크톱 앱의 신원/구독 소스로도 공유**됨(별도 앱 프로젝트 안 만듦). 위링 가입↔앱 로그인 = 한 계정. 앱은 같은 계정에 **이메일 OTP**로 로그인(웹은 비번 유지). 라이선스 테이블(orders/codes/bindings)이 이 프로젝트에 RLS 전면차단으로 동거 예정. 가입 창구=위링 웹 단일. 상세·이유는 [[project_wee-log-subscription-decisions]] #13. (미구현 — 결정만)
