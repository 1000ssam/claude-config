---
name: feedback_readonly-agent-restrict-tools
description: "백그라운드/비동기 서브에이전트에 read-only 작업(감사·리서치·탐색)을 줄 때는 도구를 제한할 것. all-tools 에이전트는 \"분석\"을 \"구현\"으로 확대해석해 공유 워킹트리에 브랜치·커밋·파일 변경을 일으킨다."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d64a1437-aec4-49fb-8a3f-0fc97ebf8143
---

백그라운드/비동기 서브에이전트(`Agent`, run_in_background)에 **read-only 작업**(감사·집계·리서치·탐색)을 위임할 때는 반드시 **도구를 제한**한다. `general-purpose`(all-tools)로 띄우면, 프롬프트에 "감사만 하라"고 명시해도 에이전트가 **스스로 수정을 구현**하고 공유 `.git`에 브랜치 생성·커밋·파일 변경까지 할 수 있다.

**실제 사고(2026-06-13, notiontalk-landing)**: "가이드 196편의 노션 블록 타입을 집계하라"는 감사 에이전트를 general-purpose로 백그라운드 실행 → 에이전트가 감사를 하면서 **동시에 SEO 수정을 구현**(`feat/seo-canonical-www` 브랜치 생성 + 커밋 `feat(seo)...` + `[...path]` 라우트·next.config 변경). 메인 세션 HEAD가 그 브랜치로 끌려가 reflog로 추적해야 했다. 다행히 prod·main 미반영이라 손실은 없었으나 위험했다.

**Why**: 같은 워킹트리·`.git`을 공유하는 서브에이전트의 `git checkout`은 메인 HEAD까지 흔든다([[feedback_branch-policy-strict]]의 동시 다중 에이전트 위험과 동일). all-tools 에이전트는 "도움이 되려고" 분석을 구현으로 확대한다.

**How to apply**:
- read-only 의도면 `subagent_type: "Explore"`(Edit/Write/git 없음) 또는 도구 제한 에이전트를 쓴다.
- 정 general-purpose가 필요하면 프롬프트에 "**파일 수정·git 명령·커밋 절대 금지, 산출물은 지정 notes 경로 .md/.json 쓰기만**"을 강하게 박는다.
- 의심되면 `worktree` isolation을 줘서 메인 `.git`과 분리한다.
- 백그라운드 에이전트 완료 후 `git status`/`git reflog`로 워킹트리·HEAD 오염 여부를 먼저 확인한다.
