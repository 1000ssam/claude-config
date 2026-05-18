---
name: feedback_git-init-on-new-work
description: 새 작업/프로젝트를 암시하면 폴더 생성 + git init + 비공개 GitHub 리모트를 먼저 제안
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4f5baeb8-3ea1-45ca-841c-37fae6660d64
---

사용자가 새 작업·새 앱·새 도구·새 스크립트 프로젝트를 시작하려는 낌새를 보이면, 본격 작업에 들어가기 전에 **먼저 제안**한다: `/mnt/c/dev/` 아래 프로젝트 폴더 생성 → `git init` → `gh repo create --private`로 GitHub 리모트 연결.

**Why:** 2026-05-18 구축한 project-autopush 훅(`~/.claude/hooks/project-autopush.mjs`)은 **git 리포 + origin 리모트가 있는 폴더만** 자동 커밋·푸시한다. git init이나 리모트가 없는 폴더의 작업물은 PC 간에 영영 동기화되지 않고 백업도 안 된다. 사용자는 이 단계를 수동으로 자꾸 까먹는다고 명시적으로 밝혔다.

**How to apply:** 새 작업이 감지되는 *바로 그 시점*에 — 코드를 짜기 전에 — git init + 비공개 리모트 단계를 한 줄로 제안하고 진행한다. 사용자가 이미 리포를 만들어 둔 경우엔 생략. 관련: [[project_config-sync]], [[feedback_work-in-mnt]]
