---
name: project_wee-linked-content-admin
description: wee-linked 정적 페이지 콘텐츠 편집(site_content) 기능과 admin 전용 권한 정책
metadata: 
  node_type: memory
  type: project
  originSessionId: b6d4b9a2-3021-4d6a-927b-13234ea05fc9
---

wee-linked 정적 페이지 문구(사이트 소개·기능 카드·마스터·Wee-Story·업데이트 소식)를 운영 콘솔 `/admin/content`에서 코드 수정 없이 편집. 2026-06-09 main 머지 + prod 배포(wee-linked.com 라이브).

**구조**: 단일 테이블 `site_content`(key/JSON 덮어쓰기 레이어, 마이그 0018) + 시드 없음(카피 원본은 `src/lib/site.ts` `DEFAULTS` 단일 보관, `getContent(key)`=DB값 또는 기본값). 무결성은 `content-schema.ts` `validateContent`. 저장 후 `updateTag('site-content')`(Next16 — revalidateTag 아님).

**이미지(마스터 사진)**: 공개 버킷 `site-assets`(마이그 0020, public=true, admin 전용 쓰기) + `uploadSiteImage` 액션(이미지 매직바이트 검증, 공개 URL 반환) + `master.photoUrl`. 콘솔 마스터 폼에서 업로드→URL이 콘텐츠 JSON에 저장. 렌더는 photoUrl 있으면 `<img object-cover>`/없으면 이니셜 폴백. 칼럼 커버는 별개(외부 URL 붙여넣기 방식).

**🔒 권한 = admin 전용**(마이그 0019, 사용자 명시 지정): 콘텐츠는 **운영자(slowly007)+조열음 마스터만** 수정. RLS write·서버액션·페이지 가드·허브 카드 4겹 모두 `is_admin`/`admin`. **이 정책을 staff로 넓히지 말 것** — 커뮤니티 모더레이션 staff가 추가돼도 콘텐츠는 못 건드리게가 의도.
**Why**: 사용자가 "조열음쌤이랑 나만 고칠 수 있게"라고 못박음.
**How to apply**: 콘텐츠 편집 관련 권한 손볼 때 admin 경계 유지. 향후 섹션 추가/리셰이프는 마이그레이션 없이 site.ts+content-schema+content-editors 3곳 패턴 편집(이미 편집된 섹션 모양 변경 시 새 필드 optional 처리 or backfill). 배포는 [[project_wee-linked-deploy]] 참조(main push≠prod, `vercel --prod` 필수).

**편집 섹션 6종**: 사이트 소개·기능 카드·마스터(+사진)·소개 페이지 본문(about: 머리말·이름풀이·제작자, 2026-06-10)·Wee-Story·업데이트 소식.
**⏸️ 보류(사용자 결정 2026-06-10)**: 랜딩 인라인 문구(홈 hero 큰 제목·섹션 소제목·closing-cta·푸터 저작권)는 아직 코드 하드코딩. 랜딩 구성이 유동적이라 조각조각 커스텀화 안 하고 **페이지 구성 확정 후 한 번에 정리**하기로. 그 전까진 추가 콘솔화 제안하지 말 것.

**🔒 오픈 전 스위치(site.ts)**: `SITE_INDEXABLE=false`(검색 비노출: noindex+robots.txt Disallow), `CHANGELOG_PUBLIC=false`(업데이트 소식 비공개: 푸터 링크 숨김+/changelog 404). 정식 오픈 시 둘 다 true로.

**📘 DB 구조 문서(2026-06-10)**: `docs/db-structure.html`(전문+쉬운말 설명서, 라이브 실측) 리포에 보관. **DB 구조 변경(supabase/migrations/ 새 .sql) 시 사용자에게 문서 갱신 여부를 반드시 물어볼 것** — AGENTS.md 규칙 + `.claude/settings.json` PostToolUse 훅(db-migration-reminder.mjs)으로 이중 보장. 갱신 헬퍼: `node scripts/dump-db-schema.mjs`(pg 필요, `npm i pg --no-save`).
