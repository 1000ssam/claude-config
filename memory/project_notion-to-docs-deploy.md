---
name: notion-to-docs-deploy
description: notion-to-docs 배포 계획 — 공유 스킬 + 크롬 익스텐션 (PRD 작성 완료)
type: project
---

## notion-to-docs 배포 계획

### 배포 경로 2가지
1. **공유 스킬** (skills-for-teachers) — 우선 진행
2. **크롬 익스텐션** — 후순위

### 크롬 익스텐션 핵심 설계 (후순위, 메모)
- `chrome.identity.launchWebAuthFlow()`로 Notion OAuth + Google OAuth (서버 불필요)
- 현재 탭 URL 감지: 페이지면 바로 변환, DB면 하위 페이지 체크박스 선택 or 전체
- Service Worker에서 변환 실행 (팝업 닫아도 진행)
- Notion Public Integration 등록 필요 (OAuth용)
- Google Cloud Console에 Chrome app 클라이언트 추가 필요
- MV3 Service Worker 30초 idle 제한 → chrome.alarms keep-alive
- 상세 PRD: `~/.claude/plans/pure-beaming-dawn.md`

**Why:** 노션 페이지에서 버튼 하나로 변환하는 UX가 URL 복붙보다 압도적으로 편리
**How to apply:** 스킬 배포 완료 후 크롬 익스텐션 착수, 코어 모듈 5개는 그대로 복사 사용
