---
name: project_notion-to-docs-comments
description: notion-to-docs 스킬의 노션 댓글(discussion-urls span) 처리 현황과 향후 역분석 과제
metadata: 
  node_type: memory
  type: project
  originSessionId: 0b060ec4-15d6-4edc-9b93-c2e4938d87a5
---

notion-to-docs 변환 시 노션 댓글 앵커가 `<span discussion-urls="discussion://...">텍스트</span>` 형태로 본문에 새던 버그가 있었음.

**해결됨 (2026-06-01):** `rich-text.js` `parseInlineMarkdown` 1단계에 discussion-urls span 제거 정규식 추가 — 래퍼만 벗기고 안쪽 텍스트는 보존. underline/color span 처리보다 먼저 실행.

**댓글 이관은 보류(포기):**
- 노션 resolved 댓글은 Notion API(`listComments`/`getComment`)가 반환 안 함 → 본문 텍스트 취득 불가.
- Google Drive API `comments.create`에 anchor(`{r:rev, a:[{txt:{o,l}}]}`) 지정해도 `quotedFileContent`가 null로 옴 → Docs 에디터의 인라인 댓글(단어 하이라이트 고정)과 앵커 체계가 달라 실제 단어에 안 붙음. 브라우저 확인 결과 아무 댓글도 표시 안 됨.

**향후 과제:** 사용자가 "댓글이 실제로 붙은 Google Docs"를 제공하면, 그 문서를 역분석(Drive API로 comments + anchor 구조 덤프)해서 올바른 anchor 포맷을 찾아 인라인 댓글 이관 재시도. 관련 [[project_notion-to-docs]]
