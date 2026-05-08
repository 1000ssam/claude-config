---
name: notion-to-docs
description: Notion 페이지를 Google Docs로 즉시 변환하는 스크립트 프로젝트
type: project
---

## 프로젝트: notion-to-docs (~/dev/notion-to-docs)

### 개요
노션 페이지 콘텐츠를 Google Docs로 변환하는 Node.js 스크립트. 마크다운 API 우선 + 블록 API 보충 Hybrid 아키텍처.

### 핵심 파일
- `convert.js` — 단건 변환, `batch-convert.js` — DB 일괄 변환
- `style-map.js` — 스타일 설정 (이 파일만 수정하면 서식 교체)
- `google-auth.js` — OAuth2 인증 (token.json, 자동 갱신)

### 스킬
- `~/.claude/skills/notion-to-docs.md` — "문서화", "독스로 변환" 등 트리거

### 사용법
```bash
node convert.js <page-id>           # 단건
node batch-convert.js <db-id>       # DB 일괄
```

### 스타일
Arimo 10pt, H3 파랑, H4 파랑+밑줄, 줄간격 150%, 콜아웃 배경색 Notion 색상 매핑

### 알려진 한계
- 국기 이모지 렌더링 불가, 자간/장평 미지원, 콜아웃 배경 하단 약간 늘어짐
- Notion 이미지 URL 1시간 만료 — 즉시 실행 필요
