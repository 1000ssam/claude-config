---
name: project-wee-log-migration
description: wee-log(위클래스 프로) Notion v2→v3 마이그레이션 웹앱 — v2 절대보존 하드룰 + 본문 콘텐츠 마크다운 이관
metadata: 
  node_type: memory
  type: project
  originSessionId: c05fd1b1-87d1-4e76-9a3e-30dfe2fb11fd
---

`/mnt/c/dev/wee-log-migration` — 위클래스 프로 Notion 템플릿 v2.0→v3.0 마이그레이션 웹서비스 (별개 프로젝트인 [[project-wee-log]] STT앱과 혼동 금지). 배포 https://wee-log-migration.vercel.app, repo 1000ssam/wee-log-migration(private). 10단계 SSE 마이그레이션, HANDOFF.md가 정본 상태문서.

**🚨 v2 절대 보존 (하드룰, 2026-05-27 사용자 강력 지시):** 마이그레이션 코드는 v2를 **어떤 경우에도** 삭제/`in_trash`/아카이브/스키마변경 하지 않는다. v2는 오직 query·retrieveMarkdown 등 **읽기 전용**. 확인됨: ensureRelationIdProperty·rebuildIdMap·10-cleanup 전부 v3 전용, v2 쓰기 0건. 새 코드도 이 불변식 유지.

**본문 콘텐츠 이관 (2026-05-27 착수, feat 브랜치):** 기존 코드는 속성값만 이관하고 페이지 본문은 누락했음. 해결 = Notion 마크다운 엔드포인트(SDK 5.20.0 `pages.retrieveMarkdown`/`pages.updateMarkdown` replace_content, **Notion-Version 2026-03-11 필요**)로 GET→PATCH 왕복. 실측상 중첩목록·토글·콜아웃·표·체크박스·날짜멘션 전부 무손실. 구식 블록 list/append 방식은 중첩 자식을 조용히 누락(09-reports 버그) → 같은 헬퍼로 교체.

**본문 이미지 정책 = A안 (사용자 승인):** 마크다운 PATCH는 외부 이미지 URL을 재호스팅 안 함(빈 `![]()`로 소실, 실측 확인) → 본문에 Notion-호스팅 이미지가 있으면 페이지 **최상단에 콜아웃 안내 + v2 원본 URL** prepend(자동 재업로드 X). 타임아웃 압박 회피가 이유. 이미지는 대단히 드물다는 전제. 관련 범용 함정은 [[notion-markdown-patch-no-image-rehost]] 참고.

**`<unknown>` 블록 함정 (실측 발견):** retrieveMarkdown이 미지원 블록(북마크/임베드/링크프리뷰/브레드크럼/템플릿/자식DB) 또는 truncated 콘텐츠를 `<unknown url=.../>`로 내보내는데, 이걸 그대로 updateMarkdown(replace_content)하면 "cannot create new `<unknown>` blocks" **validation_error로 페이지 본문 전체가 거부됨**. → copyPageBody가 `<unknown>` 토큰만 제거하고 나머지 본문은 살린 뒤 안내 콜아웃에 포함. 이미지와 동일 취급.

**볼륨 무관 + 이어하기 (Phase 1, 2026-05-27 구현·E2E검증):** maxDuration 300s/route는 step 1회 호출(=그 DB 전체) 단위라 대용량에서 터짐. 해결 = ① 서버: step 페이지 루프가 250s(`STEP_BUDGET_MS`) 경과 시 페이지 경계에서 중단 → `StepResult.incomplete=true`. ② 클라(`migrate/page.tsx`): incomplete/스트림끊김이면 같은 step 재호출(무진전 가드 3회), `rebuildIdMap`+`isAlreadyMigrated`로 완료분 스킵하며 이어감. ③ 크로스세션: `/api/migrate/status`가 v3의 relation_id 페이지 수로 step 완료 판정(=진행상태 정본은 v3, localStorage 의존 0 → 캐시/브라우저 경고 불필요). cleanup이 relation_id 지우므로 "v3 페이지 있는데 relId 0 = 완료+cleanup됨" 휴리스틱. 세션 24h 만료 시 재로그인 버튼→이어감(Notion 토큰은 장수명). **보고서(09)는 child-page 아니라 v3_reports DB 행**(title 속성 "제목")이라 다른 step과 동일하게 createPageWithTracking로 완전 이어하기 대상.
