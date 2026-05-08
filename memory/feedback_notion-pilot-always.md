---
name: notion-pilot-reference-scope
description: 노션 관련 아키텍처 설계 시에도 반드시 notion-pilot 스킬 참조 (API 호출 시점뿐 아니라 설계 단계에서도)
type: feedback
---

노션 기반 프로젝트의 **아키텍처 설계 단계**에서도 반드시 `~/.claude/skills/notion-pilot.md`를 참조한다.

**Why:** API 직접 호출 시점에만 스킬을 참조하면, 마크다운 엔드포인트(`getPageMarkdown`) 같은 효율적 대안을 놓치고 블록 API 재귀 호출 같은 비효율적 설계를 하게 됨. 실제로 notion-to-docs 프로젝트 초기 설계에서 블록 API 기반으로 설계했다가 마크다운 우선 방식으로 전환함.

**How to apply:** 노션 데이터를 읽거나 쓰는 구조를 **계획**할 때 — 플랜모드, PRD 작성, 아키텍처 논의 시점에서 — notion-pilot 스킬의 API 호출 방법, 토큰 절약 규칙, 헬퍼 레퍼런스 섹션을 먼저 읽고 최적 접근법을 결정한다.
