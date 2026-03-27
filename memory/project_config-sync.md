---
name: Claude Code 2대 PC 동기화 설정
description: config-repo(Git) 기반 자동 동기화 — Stop hook마다 push, SessionStart마다 pull
type: project
---

2대 PC에서 Claude Code 설정을 동기화하는 시스템 구축 완료 (2026-03-27).

**리포**: `1000ssam/claude-config` (private), 로컬 경로 `~/.claude/config-repo/`

**동기화 대상**: CLAUDE.md, settings.json, mcp.json, knowledge/, commands/, hooks/, memory/, statusline-command.sh

**동기화 제외**: secrets/, .credentials.json, settings.local.json, plugins/, sessions/, claude-mem DB

**Hook**: SessionStart→pull, Stop→push, PreCompact→push, SessionEnd→push (쓰로틀 없음, git no-op이 충분히 빠름)

**claude-mem**: 동기화하지 않음. 정션 스크립트(`setup-claude-mem-junction.ps1`)는 리포에 보관만.

**다른 PC 셋업**: `C:\dev\notes\HANDOFF-config-sync.md` 참조

**Why:** Anthropic에 네이티브 동기화 기능 없음. 세션(대화 이력)은 동기화 불가 — HANDOFF.md로 대체.
**How to apply:** 설정 변경 시 자동 반영됨. 다른 PC 초기 셋업은 핸드오프 문서 따라 진행.
