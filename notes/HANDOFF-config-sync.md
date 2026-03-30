# Claude Code 2대 PC 동기화 셋업 핸드오프

## 완료된 작업

### 1. Git 리포 생성 및 초기 동기화
- **리포**: `1000ssam/claude-config` (private)
- **위치**: `~/.claude/config-repo/`
- **동기화 대상**:
  - `CLAUDE.md` — 전역 지침
  - `settings.json` — hooks, plugins, MCP 설정
  - `mcp.json` — MCP 서버 설정
  - `knowledge/` — 범용 인사이트 (2개 파일)
  - `commands/` — 사용자 정의 커맨드 (book-writer, seo-blog-writer, gsd/)
  - `hooks/` — GSD hook 스크립트 (3개)
  - `memory/` — 자동 메모리 (projects/C--Users-user/memory/ 전체)
  - `statusline-command.sh`
- **동기화 제외**: secrets/, .credentials.json, settings.local.json, plugins/, sessions/, cache/ 등

### 2. 자동 동기화 Hook 등록 (settings.json)
| Hook 이벤트 | 동작 | 시점 |
|-------------|------|------|
| `SessionStart` | `--pull` (원격→로컬) | 세션 시작 시 |
| `Stop` | `--push` (로컬→원격) | Claude 응답 완료 시마다 |
| `PreCompact` | `--push` | 컨텍스트 압축 직전 |
| `SessionEnd` | `--push` | 세션 종료 시 |

### 3. claude-mem Google Drive 정션 (미실행)
- 스크립트 생성됨: `~/.claude/config-repo/setup-claude-mem-junction.ps1`
- **Claude Code 완전 종료 후** 실행 필요:
  ```
  powershell -ExecutionPolicy Bypass -File "C:\Users\user\.claude\config-repo\setup-claude-mem-junction.ps1"
  ```
- `.claude-mem/` → `G:\내 드라이브\claude-mem\` 정션 생성
- 주의: 두 PC 동시 사용 시 DB 손상 위험

## 다른 PC 셋업 절차

### Step 1: config-repo 클론
```bash
cd ~/.claude
git clone https://github.com/1000ssam/claude-config.git config-repo
```

### Step 2: 초기 pull (설정 파일 적용)
```bash
node ~/.claude/config-repo/config-sync.js --pull
```

### Step 3: skills 리포 클론 (아직 없다면)
```bash
cd ~/.claude
git clone https://github.com/1000ssam/claude-skills.git skills
```

### Step 4: secrets 수동 복사
- `~/.claude/secrets/` 폴더의 토큰 파일들은 수동으로 복사
- `.credentials.json`도 별도 인증 필요

### Step 5: claude-mem 정션 (선택)
```
powershell -ExecutionPolicy Bypass -File "C:\Users\user\.claude\config-repo\setup-claude-mem-junction.ps1"
```

### Step 6: 플러그인 설치
- Claude Code 실행하면 `enabledPlugins` 설정에 따라 자동 설치됨

## 주의사항
- 두 PC의 Windows 사용자명이 `user`로 동일해야 경로 매핑이 자연스러움
- claude-mem은 동시 사용 불가 (한쪽 종료 후 다른 쪽 사용)
- 세션(대화 이력)은 동기화되지 않음 — 중요한 컨텍스트는 HANDOFF.md로 전달
- settings.local.json은 PC별 권한 설정이므로 동기화하지 않음
