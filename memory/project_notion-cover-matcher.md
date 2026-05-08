---
name: notion-cover-matcher
description: 노션 DB 페이지에 Unsplash 커버를 unique 보장으로 일괄 적용하는 7단계 파이프라인 도구
type: project
originSessionId: 8122d59a-abfa-4fab-8e16-ad10cf9300d8
---
위치: `/mnt/c/dev/notion-cover-matcher`

**핵심 자산:**
- `data/backup-covers.json` — 적용 전 원본 커버 스냅샷. `node src/rollback.mjs`로 언제든 복원
- `src/lib/unsplash.mjs` — Unsplash 검색 + `urls.raw + ?w=1500&fit=crop&q=80` 형태의 안정 cover URL 빌드 + download tracking 헬퍼
- `src/lib/notion.mjs` — 기존 notion-api.mjs 재익스포트 래퍼

**Why:**
ioooss 워크스페이스 노션톡 블로그 DB(`2f4dd1dcd64481d5ac29fe1404e69381`, 183개 페이지) 갤러리 뷰의 톤 통일 목적으로 2026-04-27 1차 적용 완료. 키워드 매칭은 추상 SW 개념 한계로 사실상 연극이었음 (`feedback_keyword-image-matching-theater.md` 참조).

**How to apply:**
유사 요청(다른 노션 DB에 일괄 커버) 들어오면:
1. `data/backup-covers.json` **반드시 먼저 떠놓기** — 롤백 안전망
2. Unsplash 검색 키워드는 짧은 1~2단어 변형을 여러 개 (`['planner notebook', 'agenda desk', ...]`) 배열로 시도. 긴 keyword 결합은 AND 검색이 되어 결과 빈약
3. 글로벌 `usedPhotoIds` Set + 풀 사이즈(페이지×2 이상) + 최종 assert로 unique 3중 보장
4. cover URL은 `urls.regular` 대신 `urls.raw + ?w=1500&fit=crop&q=80` (signed ixid 만료 회피)
5. Notion external cover는 `notion.updatePage(pageId, { cover: { type:'external', external:{ url }}})`. concurrency=5 권장
6. Unsplash download tracking은 50/h Demo 키론 부족 — 검색에 50 다 쓰면 트래킹 다수 403. 표시엔 무영향이지만 ToS 권장사항이라 production key 또는 시간 분할 필요
