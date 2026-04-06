# WSL → Windows 네이티브 Claude Code 마이그레이션 가이드

> 작성일: 2026-04-04
> 배경: Electron 앱 개발 시 WSL에서 네이티브 모듈 빌드 이슈 + `/mnt/` 경로 혼선 반복으로 전환 검토

---

## 왜 전환을 고려하는가

| 문제 | 원인 |
|------|------|
| `better-sqlite3` 등 네이티브 모듈이 Electron에서 로드 실패 | Claude Bash 도구(WSL)로 빌드 시 Linux ELF 바이너리 생성 → Windows PE 필요 |
| `/home/user/` 경로에 파일 생성되는 이슈 반복 | Claude가 WSL 홈을 기본 경로로 인식 |
| PowerShell에서 별도 rebuild 필요 | WSL ↔ Windows 이중 환경 유지 비용 |

---

## 마이그레이션 대상 실태 (2026-04-04 기준)

### ✅ 이전 불필요 — 이미 `/mnt/c/dev/` = `C:\dev\`에 있음
- 대부분의 주요 프로젝트 (wee-log, notion-flow 등)

### ⚠️ 확인 필요 — WSL `~/workspace/`에만 있는 프로젝트 5개
```
cc-cache-fix
notion-form-limiter
notion-print
notion-to-docs
wee-story
```
→ 각 프로젝트의 최신 커밋 상태 확인 후 GitHub에 push → Windows에서 clone

### 🔴 핵심 이슈 — `~/.claude/` 생태계 전체 이전 필요

현재 `~` = `/home/user/` (WSL)
전환 후 `~` = `C:\Users\user\` (Windows)

이전 대상:
- `~/.claude/skills/` — 스킬 파일들 (config-sync git 리포에 있음)
- `~/.claude/secrets/` — 토큰/키 (git 밖, 수동 복사 필요)
- `~/.claude/knowledge/` — 범용 인사이트 문서
- `~/.claude/projects/` — 메모리 파일들
- `~/.claude/skills/scripts/` — notion-api.mjs, slack-api.mjs 등 실행 스크립트

---

## 마이그레이션 체크리스트

### Phase 1 — 사전 준비
- [ ] WSL 전용 프로젝트 5개 GitHub push 확인
- [ ] `~/.claude/secrets/` 내용 목록 확인 (이전 누락 방지)
- [ ] config-sync 리포 최신 상태 push

### Phase 2 — Windows 환경 구성
- [ ] Windows Terminal + PowerShell 7 설치 확인
- [ ] Node.js (Windows 네이티브) 설치
- [ ] Claude Code 설치: `npm install -g @anthropic-ai/claude-code` (PowerShell)
- [ ] `C:\Users\user\.claude\` 디렉토리 생성

### Phase 3 — 파일 이전
- [ ] config-sync 리포를 `C:\Users\user\.claude\`로 clone
- [ ] `~/.claude/secrets/` 파일들 수동 복사 (WSL → Windows)
  - `slack-bot-token.txt`
  - `notion-credentials.md`
  - `canva-credentials.md`, `canva-token.json`
  - `maily-credentials.md`
  - 기타

### Phase 4 — 스킬 경로 검증
스킬 내 하드코딩된 WSL 경로 점검 필요:
- `slack-pilot.md` → `file:///C:/Users/user/.claude/skills/scripts/slack-api.mjs` (이미 Windows 경로 사용 중 ✅)
- `notion-pilot.md` → 경로 확인 필요
- `hwpx-skill` → 스크립트 경로 확인 필요
- `document-organizer` → config.json 경로 확인 필요

### Phase 5 — 검증
- [ ] `claude` 명령어 실행 확인
- [ ] 슬랙 알림 스킬 동작 확인
- [ ] 노션 API 스킬 동작 확인
- [ ] 프로젝트에서 `npm install` → 바이너리 자동으로 Windows용 생성 확인

---

## 리스크 & 주의사항

1. **스킬 스크립트의 bash 문법** — `notion-api.mjs`, `slack-api.mjs` 등은 Node.js라서 괜찮음. bash 스크립트(`.sh`)가 있다면 PowerShell로 재작성 필요
2. **시크릿 파일 이전 누락** — git 밖에 있어서 수동으로 해야 함. 빠뜨리면 스킬이 자격증명 못 찾음
3. **메모리 파일** — `~/.claude/projects/` 이전 누락 시 이전 대화 맥락 손실
4. **config-sync 훅** — Stop hook이 WSL 경로로 push하도록 설정되어 있을 수 있음 → 재설정 필요

---

## 결론

전환 자체는 가능하나, `~/.claude/` 생태계 이전이 핵심 작업.
**별도 세션에서 집중적으로 진행 권장** — wee-log 등 현재 진행 중인 프로젝트 마무리 후 실행.
