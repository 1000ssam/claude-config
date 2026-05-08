---
name: 자체 뉴스레터 서비스 구축 계획
description: Maily 대체 — AWS SES + Notion DB로 자체 뉴스레터 발송 시스템 구축 예정
type: project
---

Maily가 비싸고 API가 불편해서 자체 구축 예정.

**Why:** 비용 절감 + API 자유도. 구독자 규모 수백 명 이하로 SES 무료 티어 내.

**How to apply:**
- 구성: AWS SES + Notion DB(구독자) + Vercel(구독페이지) + GitHub Actions(발송 트리거)
- 선행 조건: AWS 계정 생성 필요 (아직 없음)
- 기존 maily-subscribe 스킬 로직 재활용 가능
- 사용자가 "나중에" 하겠다고 함 (2026-04-09 기준) — 먼저 제안하지 말 것
