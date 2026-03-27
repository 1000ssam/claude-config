---
name: SNS-automation 프로젝트
description: 스레드→노션AI→캔바 오토필→인스타 자동화 파이프라인. Canva REST API 오토필 연동 완료, Threads API 인증 미해결.
type: project
---

## SNS-automation (C:\dev\SNS-automation)

스레드 글 수집 → 노션 AI 캐러셀 편집 → 캔바 오토필 → 인스타 게시 자동화

### Canva REST API — 연동 완료 (2026-03-22)
- OAuth 토큰 발급 성공 (PKCE + Basic Auth)
- **canva-autofill 스킬** 생성 완료 (`~/.claude/skills/canva-autofill.md`)
- **canva-api.mjs** 모듈 (`~/.claude/skills/scripts/canva-api.mjs`)
- **canva-oauth.mjs** 모듈 (`~/.claude/skills/scripts/canva-oauth.mjs`)
- 크리덴셜: `~/.claude/secrets/canva-credentials.md`
- 토큰: `~/.claude/secrets/canva-token.json` (4시간 유효, 자동 갱신)
- 브랜드 템플릿 오토필 테스트 성공 (캐러셀1 → 노션 앰버서더 카드뉴스)
- Canva MCP(`mcp.canva.com/mcp`)도 병행 사용 가능 (조회/생성용)
- Pro 플랜에서 Autofill API 사용 가능 확인 (Enterprise 전용 아님)

### Threads API — 막힌 상태
- Meta 앱 "Threads 스크래퍼" App ID: `768985662266115`
- **Threads 앱 ID**: `1929560834507727` (OAuth에는 이걸 써야 함. Meta 앱 ID와 다름!)
- OAuth error 1349245: 테스터 초대 수락 문제
- **다음 시도**: 새 앱 생성 → 앱 역할 > 역할에서 Threads tester 등록 → 초대 수락 순서 정확히 밟기

**Why:** 기존 앱이 Make.com 연동 설정과 꼬였을 가능성
**How to apply:** 새 앱 만들 때 HANDOFF.md의 순서 참고
