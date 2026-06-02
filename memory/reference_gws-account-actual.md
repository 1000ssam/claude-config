---
name: reference-gws-account-actual
description: gws CLI는 환경변수와 무관하게 slowly008@gmail.com으로만 인증됨 (skill 문서의 goedu/inchang와 불일치)
metadata: 
  node_type: memory
  type: reference
  originSessionId: fa533a3f-d339-48db-a953-a5eed84a2e60
---

gws(Google Workspace CLI)는 `GOOGLE_WORKSPACE_CLI_ACCOUNT` 환경변수를 무엇으로 지정하든 실제 인증 주체가 **`slowly008@gmail.com`** 이다. keyring에 008 토큰만 등록돼 있어 inchang/goedu 지정이 무시된다.

- 확인법: `gws drive about get --params '{"fields":"user(emailAddress)"}'`
- 영향: gws로 생성하는 모든 파일은 **008 소유**가 된다. 다른 계정(인창/개인)으로 브라우저에서 열면 "권한 필요"가 뜬다.
- gws 스킬 문서(`~/.claude/skills/gws`)의 계정 표(goedu/inchang 맥락 분기)는 현재 keyring 상태와 **불일치**. 파일 생성 위치를 보고하기 전에 반드시 `about get`으로 실제 주체를 확인할 것.
- 다른 계정으로 만들려면 먼저 `gws auth login --account <email>` 필요.
