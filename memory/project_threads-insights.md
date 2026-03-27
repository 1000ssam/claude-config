---
name: threads-insights
description: Threads API 인사이트 수집·분석·글쓰기 자동화 스킬 — 앱 설정, 토큰 관리, 데이터 저장 구조
type: project
---

Threads 인사이트 수집 스킬 완성 (2026-03-23).

**Why:** @iooo_tttt 계정의 게시물 패턴 분석 + 글쓰기 스타일 학습 + 자동화
**How to apply:** `스레드 수집/분석/스타일/작성/발행/노션/토큰/업데이트` 커맨드로 사용

- Meta 앱: Threads Crawler (ID: 1280400260856279)
- 크리덴셜: `~/.claude/secrets/threads-api.env`
- API 모듈: `~/.claude/skills/scripts/threads-api.mjs`
- 수집 스크립트: `~/.claude/skills/scripts/threads-collect.mjs`
- 스킬: `~/.claude/skills/threads-insights/SKILL.md`
- 데이터: `C:\dev\threads-data/` (posts/, snapshots/, analysis/)
- 토큰 만료: 2026-05-22 (60일 주기 갱신 필요)
- 계정: @iooo_tttt / 팔로워 5,304 / 총 1,294 게시물 (원본 470)
