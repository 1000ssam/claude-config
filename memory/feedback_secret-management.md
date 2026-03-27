---
name: secret-management
description: API 토큰/키를 스킬 파일에 하드코딩하지 말고 ~/.claude/secrets/에 분리 보관
type: feedback
---

API 토큰, 키를 스킬 파일이나 config.json에 직접 넣지 않는다. `~/.claude/secrets/`에 별도 파일로 분리한다.

**Why:** 스킬 디렉토리가 git으로 관리되므로 토큰이 GitHub에 노출될 위험. 실제로 Notion 토큰, Maily 토큰이 커밋된 적 있음.

**How to apply:**
- 새 스킬에서 API 키가 필요하면 `~/.claude/secrets/{서비스명}-credentials.md`에 보관
- 스킬 문서에는 "Step 1: `~/.claude/secrets/xxx.md`를 Read로 읽어 토큰 확인" 패턴 사용
- `.gitignore`에 `.env`, `config.json`, `secrets/` 포함 확인
- `.env.example`, `config.example.json`만 git에 포함
