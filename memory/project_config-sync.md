---
name: Claude Code 2대 PC 동기화 설정
description: config-repo(Git) 기반 수동 동기화 — /sync-pull, /sync-push 슬래시 명령으로 명시적 트리거. 자동 hook 없음
type: project
originSessionId: 9f0164ae-a302-4900-a600-db80b0e05911
---
2대 PC에서 Claude Code 설정을 동기화하는 시스템.

**리포**: `1000ssam/claude-config` (private), 로컬 경로 `~/.claude/config-repo/`

**동기화 대상**: CLAUDE.md, settings.json(머신별 필드 제외), mcp.json, statusline-command.sh, knowledge/, commands/, hooks/, projects/.../memory/, /mnt/c/dev/notes/

**동기화 제외**: secrets/, secrets.bak/, .credentials.json, settings.local.json, plugins/, projects/(memory 외), todos/, plans/, session-env/, shell-snapshots/, cache/

**머신별 필드(LOCAL_ONLY_SETTINGS_FIELDS)**: settings.json 의 `hooks`, `model`, `env` 는 양방향 sync 에서 항상 로컬 값 보존. PC 마다 hook 셋·모델·환경변수가 달라도 충돌 없음.

**트리거**: 수동 슬래시 명령 (자동 hook 일체 없음, 2026-04-19 비활성화 → 2026-04-29 manual 워크플로 정착).
- `/sync-pull` → `node config-sync.js --pull` (dry-run) → 확인 후 `--pull --apply`
- `/sync-push` → `node config-sync.js --push` (dry-run) → 확인 후 `--push --apply`

**안전장치**:
- `--apply` 없이는 working tree 만 갱신, git 에 손대지 않음(dry-run 디폴트)
- push: 시크릿 의심 파일(`secrets/`, `*.token`, `*.key`, `.env*`, `.credentials.json` 등) 자동 차단. `--allow-secrets` 로만 강제 가능
- pull: 로컬 working tree dirty 면 ABORT. `--force` 로만 강제 가능
- `.gitignore` 에 시크릿 패턴 belt-and-suspenders 등록

**claude-mem**: 동기화 안 함. 정션 스크립트(`setup-claude-mem-junction.ps1`)는 리포에 보관만.

**다른 PC 부트스트랩**: `/mnt/c/dev/notes/config-sync-manual-workflow.md` 참조.

**Why:** 자동 sync 가 세션 시작 지연·예기치 않은 push 유발. 명시적 사용자 승인 후에만 양방향 이동하도록 전환.
**How to apply:** 작업 시작 시 다른 PC 변경 받으려면 `/sync-pull`. 보내려면 작업 끝나고 `/sync-push`. 둘 다 dry-run 먼저, 확인 후 apply.

## 🔧 후순위 과제 — sync 동기화 리스크 점검 (2026-05-26 기록)
- 2026-05-26, **skills 리포**(`~/.claude/skills`, repo `1000ssam/claude-skills` — config-sync의 config-repo와 별개)에서 **stash-pop 충돌 8개 파일이 미해결로 방치**된 채 발견됨(working tree에 충돌 마커, 인덱스 UU, origin/main보다 1커밋 뒤짐). config-sync 대상에 skills는 포함 안 됨 → 별도 수동 워크플로가 원인.
- 점검할 것:
  1. skills 리포의 수동 커밋/푸시(또는 다른 PC에서의 pull)가 **stash-pop 충돌을 남기고 방치**하게 된 경로 추적 — 어떤 절차가 stash를 만들고 pop 충돌을 무시했나.
  2. `/sync-pull`·`/sync-push`(config-repo)도 같은 식으로 UU/마커 잔류를 남길 수 있는지. dry-run/dirty-abort 안전장치가 **skills 리포엔 적용 안 됨**.
  3. 충돌 미해결 상태에서 다음 push가 **마커 박힌 파일을 origin에 올릴 위험** → 커밋 전 `<<<<<<<` 마커 검출 pre-commit 가드 필요.
- 방향(미정): skills 리포에도 dirty-abort·마커검출 가드 도입, 또는 수동 워크플로에 "stash pop 후 충돌 확인" 단계 추가.
