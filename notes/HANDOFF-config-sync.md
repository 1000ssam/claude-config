# Claude Code 2대 PC 동기화 — 수동 워크플로

> 이전 자동 sync (SessionStart/Stop/PreCompact 훅) 은 2026-04-19 비활성화.
> 2026-04-29 부터 슬래시 명령 기반 **명시적 수동 동기화** 로 전환.

## 동기화 시스템 개요

- **리포**: `1000ssam/claude-config` (private)
- **로컬 경로**: `~/.claude/config-repo/`
- **트리거 방식**: 사용자가 `/sync-pull` 또는 `/sync-push` 슬래시 명령을 명시적으로 호출할 때만 실행. 자동 hook 없음.

### 동기화 대상

| 파일/디렉토리 | 비고 |
|---|---|
| `~/.claude/CLAUDE.md` | 전역 지침 |
| `~/.claude/settings.json` | **hooks/model/env 필드는 PC별 보존** (LOCAL_ONLY) |
| `~/.claude/mcp.json` | MCP 서버 설정 |
| `~/.claude/statusline-command.sh` | 상태 줄 스크립트 |
| `~/.claude/knowledge/` | 범용 인사이트 |
| `~/.claude/commands/` | 슬래시 명령 |
| `~/.claude/hooks/` | hook 스크립트 |
| `~/.claude/projects/C--Users-user/memory/` | 자동 메모리 |
| `/mnt/c/dev/notes/` | 범용 메모/핸드오프 |

### 동기화 제외

`secrets/`, `secrets.bak/`, `.credentials.json`, `settings.local.json`, `plugins/`, `projects/` (memory 외), `todos/`, `plans/`, `session-env/`, `shell-snapshots/`, `cache/`, `backups/`, `file-history/`, `paste-cache/`.

`.gitignore` 에도 시크릿 패턴(`secrets/`, `*.token`, `*.key`, `*.pem`, `.env*`, `credentials.json`) belt-and-suspenders 등록.

## 일상 워크플로

### 작업 시작 시 — 다른 PC 변경분 받기
```
/sync-pull
```
1. dry-run 미리보기 (어떤 커밋·파일이 들여올지 표시)
2. Claude 가 사용자에게 "이 변경분을 적용할까요?" 확인
3. OK 응답 → 실제 pull (`--apply`)

> 로컬에 미커밋 변경이 있으면 ABORT. 먼저 `/sync-push` 하거나 명시적 `--force` 요청해야 진행.

### 작업 끝났을 때 — 변경분 보내기
```
/sync-push
```
1. dry-run 미리보기 (`git status --porcelain` + 시크릿 의심 파일 경고)
2. Claude 가 "이 변경분을 push 할까요?" 확인
3. OK 응답 → 실제 push (`--apply`)

> 시크릿 의심 파일이 staging 에 있으면 ABORT. `.gitignore` 보강하거나 명시적 `--allow-secrets` 요청해야 진행.

### CLI 직접 사용 (슬래시 명령 없이)
```bash
node ~/.claude/config-repo/config-sync.js --pull              # dry-run
node ~/.claude/config-repo/config-sync.js --pull --apply      # 실제 적용
node ~/.claude/config-repo/config-sync.js --pull --apply --force   # dirty 무시 강제

node ~/.claude/config-repo/config-sync.js --push              # dry-run
node ~/.claude/config-repo/config-sync.js --push --apply      # 실제 적용
node ~/.claude/config-repo/config-sync.js --push --apply --allow-secrets   # 시크릿 경고 무시(위험)
```

종료 코드: `0`=성공, `1`=fetch 실패, `2`=시크릿 차단, `3`=로컬 dirty 차단, `4`=push 실패.

## 새 PC 부트스트랩

### Step 1: config-repo 클론
```bash
mkdir -p ~/.claude
cd ~/.claude
git clone https://github.com/1000ssam/claude-config.git config-repo
```

### Step 2: 초기 pull (dry-run → 적용)
```bash
node ~/.claude/config-repo/config-sync.js --pull              # 미리보기
node ~/.claude/config-repo/config-sync.js --pull --apply      # 적용
```

### Step 3: skills 리포 클론 (아직 없다면)
```bash
cd ~/.claude
git clone https://github.com/1000ssam/claude-skills.git skills
```

### Step 4: secrets 수동 배치
sync 대상이 아니므로 PC 마다 직접 배치. 필요한 파일들:
- `~/.claude/secrets/` 안의 토큰/키 파일들 (Slack, Notion, Threads, Maily, 기타)
- `~/.claude/.credentials.json` (gws 인증)

> 시크릿 값은 1Password 같은 비밀번호 관리자에서 가져오거나, USB·암호화된 채널로 직접 옮긴다. **GitHub 에 절대 올리지 않음**.

### Step 5: 머신별 settings.json 항목 점검 (필요시)
sync 후에도 PC 별로 다음 필드가 보존된다 (`LOCAL_ONLY_SETTINGS_FIELDS`):
- `hooks` — PC 별 hook 셋(예: `gsd-check-update.js`)
- `model` — 기본 모델 (`sonnet`/`opus` 등)
- `env` — 환경 변수

이 PC 의 값이 비어 있다면 다른 PC 의 값을 참고해 직접 입력.

### Step 6: 자동 sync hook 잔재 제거 (구버전 PC 마이그레이션 시)
`~/.claude/settings.json` 에 다음 항목이 남아 있다면 **삭제**:
- `SessionStart` 의 `config-sync.js --pull` 호출
- `Stop` / `PreCompact` / `SessionEnd` 의 `config-sync.js --push` 호출

남아 있으면 자동 sync 가 다시 돌아 의도와 어긋남.

### Step 7: 플러그인
Claude Code 실행 시 `enabledPlugins` 에 따라 자동 설치.

### Step 8: claude-mem (선택)
별도 동기화 안 함. 정션 스크립트는 리포에 보관:
```
powershell -ExecutionPolicy Bypass -File "C:\Users\user\.claude\config-repo\setup-claude-mem-junction.ps1"
```
주의: 양 PC 동시 사용 시 DB 손상 위험.

## 운영 주의사항

- **양쪽 PC 동시 작업 금지(권장)**: 한 PC 에서 push 끝낸 뒤 다른 PC 에서 작업 시작 전에 `/sync-pull`. 동시 작업하면 한쪽 변경이 덮어써질 위험.
- **세션(대화 이력) 동기화 안 됨**: 중요한 컨텍스트는 HANDOFF 문서로 전달.
- **2 PC 의 Windows 사용자명** 이 모두 `user` 로 동일해야 `projects/C--Users-user/memory/` 매핑이 깔끔하게 맞음.
- **머신별 차이가 새로 생기면**: `config-sync.js` 의 `LOCAL_ONLY_SETTINGS_FIELDS` 배열에 필드명 추가하면 양방향 보존됨.
