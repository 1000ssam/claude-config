---
name: project_maily-content-import
description: 메일리 발행글을 노션 캠페인 DB로 가져오는 임포터 도구와 스크래핑 방식
metadata: 
  node_type: memory
  type: project
  originSessionId: 2a730a25-27bd-44ca-b671-e18d6a6e4efd
---

메일리(maily.so)는 **콘텐츠 관리 API가 없음**(구독자 API만 존재 — [[project_newsletter-self-host]]의 maily-subscribe 스킬). 하지만 **발행글 페이지는 서버 렌더**라 본문 HTML이 페이지에 통째로 박혀 옴 → 익스텐션/로그인 없이 스크래핑 가능.

**도구 위치**: `/mnt/c/dev/maily-import/` (standalone, 레포 미오염). `import.mjs <url|--file urls.txt> [--dry-run] [--cookie "<쿠키>"] [--status 초안]`. 노션 자격증명은 `newsletter-self-host/.env`에서 읽음.

**파이프라인(결정론적, LLM 미경유 → 글 수 무관 토큰 고정비)**: fetch → node-html-parser로 `.post-body-narrow`(또는 `.prose`) 추출 → turndown(HTML→MD, 이미지·링크카드 정리 룰) → @tryfabric/martian(MD→노션 블록) → notion.pages.create. 제목/부제목/썸네일=og: 메타, 발송일=본문 YYYY.MM.DD 파싱. 슬러그=URL의 posts/notes id. 슬러그 중복 시 스킵(멱등). 상태 기본='초안'(사이트 노출 기준은 '발송완료'). children 100개 초과분은 append.

**URL 두 종류**:
- 공개 발행분 `maily.so/notiontalk/posts/<id>` = 인증 불필요.
- 프리뷰/오너 `maily.so/notiontalk/o/notes/<id>/preview` = 로그인(`_letter_box_session` 쿠키) 필요. note id == post id라, **쿠키 없으면 스크립트가 공개 URL로 자동 변환**(normalizeUrl). 유료/미발행 원고는 쿠키 필수.

**⚠️ 함정**: `@notionhq/client`는 **v2.2.15로 고정**해야 함(레포와 동일). 최신 v5는 `databases.query` 제거 등 API 파괴적 변경.

**이력**: 2026-05-31 공개글 4편 적재·검증 완료(전부 상태=초안). 캠페인 DB 스키마: 제목(title)/슬러그(rich_text)/발송일(date)/상태(select: 초안|발송대기|발송완료|발송실패)/유형(select: 기본|웰컴레터)/부제목(rich_text)/에디터(relation).
