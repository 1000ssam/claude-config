---
name: feedback_use-context7-for-api
description: API 정보 탐색 시 반드시 context7 MCP를 사용할 것 — 내부 지식에만 의존 금지
type: feedback
---

API 동작이 예상과 다를 때, 내부 지식으로 추측하지 말고 반드시 context7 MCP로 최신 공식 문서를 조회한다.

**Why:** context7 MCP를 설치해놓은 이유가 있는데 안 쓰면 의미가 없음. 이번 Notion API 2026-03-11 createDatabase 문제도 context7으로 문서를 먼저 확인했으면 data_sources 분리 구조를 바로 파악했을 것. 사용자가 강하게 지적.

**How to apply:** API 호출이 예상과 다르게 동작하면 → (1) context7으로 해당 API 최신 문서 조회 (2) 버전별 breaking change 확인 (3) 공식 문서 기반으로 수정. 이 순서가 최우선이고, raw 응답 분석은 문서로 안 풀릴 때만.
