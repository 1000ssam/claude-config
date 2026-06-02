---
name: project_newsletter-home-card
description: newsletter-self-host 홈 레터 카드 비주얼 구조(썸네일/부제목/에디터)
metadata: 
  node_type: memory
  type: project
  originSessionId: 2a730a25-27bd-44ca-b671-e18d6a6e4efd
---

[[project_newsletter-self-host]] 홈("지난 레터" 목록) 카드 구조 — 2026-06-01 main 배포(merge `6350440`).

**레이아웃**(`app/page.tsx`): 좌측 텍스트(제목 2줄예약 `min-h-[3.25rem]` / 부제목 2줄예약 `min-h-[2.75rem]` / 날짜+에디터) + 우측 노션 cover 썸네일(`w-32 sm:w-44 aspect-[4/3] object-cover`). **줄 수 예약으로 카드 높이 고정 → 텍스트 1줄/2줄 무관 모든 썸네일 동일 크기**(사용자 핵심 요구).

**데이터**(`lib/notion-content.ts` `listPublishedLetters` → `LetterListItem`):
- `thumbnail` = `extractCover(page)` (페이지 cover external/file URL 그대로. 다운로드·S3 재호스팅 안 함 — 노션이 CMS).
- `subtitle` = `extractSubtitle`('부제목' 속성) 우선, 없으면 본문 발췌.
- `editorName` = `fetchEditors(extractEditorIds(p))[0].name` (발췌와 병렬). relation 이미 연결돼 있으면 자동 표시.
- 정렬: 발송일 descending + **웰컴레터(유형=웰컴레터) 발송일 무관 최하단 고정**(isWelcome 분리 후 concat).

**날짜/에디터 행**: 날짜 `w-[88px]` 고정폭(이름 길이가 날짜 위치 안 밀게) + `Written by {이름}`(muted 톤). gap-1.5.

**배포**: 코드 변경이라 노션 "레터 갱신"(snapshot) 불필요 — `vercel deploy --prod`만으로 반영. 단 레터가 홈 목록에 뜨려면 노션 상태=발송완료 필수.
