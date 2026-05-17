# Global CLAUDE.md

## 작업 경로 규칙 (필수)

- 모든 프로젝트 코드 작업은 **반드시 `/mnt/c/dev/` 하위 경로**에서 수행한다.
- `/home/user/workspace/` 등 WSL 네이티브 폴더에 프로젝트를 생성하거나 작업하지 않는다.
- `/mnt/c/dev/`는 Windows `C:\dev\`와 동일하게 마운트되므로, WSL에서 수정한 내용이 PowerShell에서 즉시 반영된다.
- 새 프로젝트 클론/생성 시에도 `/mnt/c/dev/` 하위에만 한다.

---

## Notion

- 노션 작업 시 `~/.claude/skills/notion-pilot.md` 스킬을 읽고 따른다.
- Notion MCP는 사용하지 않는다. `notion-api.mjs` 모듈로만 작업한다.

## Context7 MCP (필수)

- 라이브러리/프레임워크/SDK의 API 정보가 필요할 때는 **반드시 `context7` MCP 서버를 사용**하여 최신 공식 문서를 조회한다.
- 내부 지식에만 의존하지 않는다. Context7이 제공하는 버전별 최신 문서가 항상 우선이다.
- 대상: npm 패키지, Python 라이브러리, Rust crate, Go 모듈, 프레임워크 공식 문서 등 모든 외부 API.

## 플랜모드 작성 원칙

플랜모드(EnterPlanMode)에서 코드 변경 계획을 작성할 때 아래 원칙을 항상 적용한다:

- **DRY**: 반복을 공격적으로 지적한다.
- **테스트**: 잘 테스트된 코드는 비타협적. 테스트가 부족한 것보다 많은 쪽이 낫다.
- **적정 엔지니어링**: 과소설계(fragile, hacky)도, 과설계(premature abstraction, unnecessary complexity)도 아닌 적정 수준.
- **엣지케이스**: 더 많이 처리하는 쪽으로. 신중함 > 속도.
- **명시적 > 영리한**: 영리한 코드보다 명확한 코드를 선호.
- **타임라인/규모 가정 금지**: 사용자의 우선순위를 임의로 가정하지 않는다.
- 모든 이슈/추천에 대해 **구체적 트레이드오프를 설명**하고, **의견이 있는 추천**을 하되, 방향을 가정하기 전에 **사용자 입력을 구한다**.

## 작업 방식 사전 제안 원칙

작업 진행 중 다음 조건에 해당하면, **현재 방식대로 진행하지 말고 먼저 제안**한다:

1. **토큰 소모를 크게 줄일 수 있는 대안**이 있는 경우
   - 예: 긴 파일을 LLM에 통째로 읽히는 대신, 결정론적 치환 스크립트로 1차 처리 후 LLM은 잔여분만 처리
   - 예: 반복 호출이 예상되면 프롬프트 캐싱·배치 API 사용

2. **컨텍스트 오염/lost-in-the-middle 위험**이 있는 경우
   - 예: 25K 토큰 이상의 단일 파일 전체 처리
   - 예: 동일 작업이 같은 파일에 반복 적용되어 컨텍스트가 비대해질 때
   - 대안: 청크 분할 + 메타 컨텍스트를 시스템 프롬프트로 분리

3. **결정론적으로 처리 가능한데 LLM에 맡기고 있는** 경우
   - 예: 단순 치환·정규식·파일 조작을 Edit 반복 호출로 처리

제안 형식: "현재 방식의 트레이드오프 + 대안 + 대안의 트레이드오프"를 1~3문장으로 제시하고, 사용자 입력 대기. 사용자가 명시적으로 "그냥 진행해"라고 한 경우엔 제안 생략.

## 스킬 호출 규칙

- 사용자가 스킬 트리거 키워드를 사용하면 **반드시 Skill 도구로 해당 스킬을 먼저 호출**한 뒤 작업을 수행한다. (개별 키워드는 각 스킬의 프론트매터 description 참조)
- 스킬의 워크플로 단계를 건너뛰지 않는다.

## 스킬·스크립트 경로 규칙 (WSL 필수)

- 스킬 파일(`.md`)과 스크립트(`.mjs`, `.js`, `.py`)에서 절대 경로를 쓸 때는 **반드시 `/mnt/c/` 마운트 경로**를 사용한다.
- `C:/Users/user/` 또는 `C:\Users\user\` 형식의 Windows 경로는 **절대 사용하지 않는다** — WSL에서 실행 시 오류 발생.
- ESM import도 동일: `file:///C:/...` → `file:///mnt/c/...`
- 예시:
  - ❌ `C:/Users/user/.claude/secrets/token.txt`
  - ✅ `/mnt/c/Users/user/.claude/secrets/token.txt`
  - ❌ `import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs'`
  - ✅ `import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs'`
- 스크립트 자신의 위치를 참조할 때는 하드코딩 대신 `__dirname` / `import.meta.url` 기준 상대 경로를 사용한다.

## GitHub 리포지토리 생성 정책

- `gh repo create`로 리포지토리를 생성할 때 **항상 `--private` 플래그**를 사용한다.
- 사용자가 명시적으로 public을 요청한 경우에만 public으로 생성한다.

## Git 브랜치 정책 (필수)

- 사용자가 **명시적으로 main을 지정**한 경우(예: "메인에 커밋해", "main에 푸시해") 바로 main 브랜치에 커밋+푸시해도 된다.
- 브랜치를 명시하지 않은 일반적인 커밋+푸시 요청은 **test 브랜치**에 먼저 한다. test 브랜치가 없거나 사용 불가능하면 별도 테스트 브랜치를 신설한다.
- "잘 됐다", "완벽하다" 등의 반응은 main 푸시 지시가 **아니다**.

## 동시 다중 에이전트 작업 (git worktree 필수)

같은 리포에서 **다른 에이전트가 이미 작업 중**임을 인지하면 (사용자 안내, 미커밋 변경사항 발견, reflog에 본인이 만들지 않은 커밋 등), 같은 디렉토리에서 진행하지 않고 **즉시 git worktree로 분리해 작업**한다.

같은 디렉토리·`.git`을 공유한 채 동시 작업하면 두 가지 위험이 발생한다:
1. **파일 시스템 동시 쓰기 충돌**: 두 프로세스가 같은 파일에 동시에 write → OS 레벨에서 마지막 쓰기가 이김. 한쪽 작업이 통째로 소실되며 git이 개입할 수 없다.
2. **공유 ref 손상**: 한쪽의 `git checkout` / `branch -D` / `reset` 등이 다른 쪽 HEAD·브랜치까지 흔든다 (브랜치 ref는 `.git`에 저장되므로 공유됨).

worktree는 별도 물리 디렉토리·별도 HEAD를 가지지만 같은 `.git` 객체 저장소를 공유한다 → 동시 쓰기 충돌 원천 차단. 머지 시점의 의미적 충돌은 git이 정상 처리하므로 별개 문제.

명령:
```bash
# 격리 작업 시작
git worktree add /mnt/c/dev/<repo-name>-<task> -b feat/<task-name>
cd /mnt/c/dev/<repo-name>-<task>
# 작업, 커밋, 푸시
# 작업 종료 후 원본 디렉토리에서
git worktree remove /mnt/c/dev/<repo-name>-<task>
```

추가 안전 수칙:
- 본인이 만들지 않은 브랜치·커밋은 함부로 삭제·리셋하지 않는다 (다른 에이전트의 미푸시 작업일 수 있음).
- worktree는 같은 브랜치를 두 곳에서 체크아웃할 수 없으므로, 원본 디렉토리와 다른 브랜치로 시작한다.

## 보안

- 매 빌드마다 보안 스킬을 호출하지 **않는다**. 다음 시점에만 호출한다:
  - **기능 단위 완성 시** (예: 로그인 구현 완료, 결제 연동 완료, API 라우트 추가 완료) → `security-audit`
  - **배포 직전** → `security-audit` → `vibe-review` 순차 호출
- CSS/UI만 수정, 텍스트 변경 등 보안에 영향 없는 작업에서는 호출하지 않는다.
- 위 시점이라고 판단되면 사용자에게 "보안 점검 돌릴까요?" 한마디 확인 후 진행한다.

## 복기 문서 (LESSONS_LEARNED.md) 관리

- 파일 위치: `/mnt/c/dev/notes/LESSONS_LEARNED.md`
- 사용자가 "복기 문서에 기록해줘", "lessons learned 추가", "삽질 기록" 등을 요청하면 해당 파일을 열어 **다음 번호로 항목을 추가**한다.
- 항목 구조는 기존 형식을 유지한다: `## N. 제목` → `### 문제` → `### 원인` → `### 해결` → `### 교훈`
- 항목을 추가할 때 기존 내용은 절대 수정하지 않는다.

## 컨텍스트 윈도우 관리

- 컨텍스트 윈도우의 약 70%가 소진되면 사용자에게 알리고, HANDOFF.md를 작성한 뒤 새 세션으로 이동할 것을 권장한다.

## 커뮤니케이션 언어 규칙

- 사용자에게 선택을 요구하거나, 작업 결과를 보고할 때는 **무조건 한글**로 말한다.
- 내부 사고 과정(thinking)은 영문으로 해도 무방하다.
- 이 규칙은 전역 지침이며 모든 프로젝트에 적용된다.

## Knowledge 라우터

작업 중 아래 키워드가 등장하면 해당 파일을 **Read 도구로 읽은 뒤** 작업에 반영한다.

| 키워드 | 파일 |
|--------|------|
| 노션 OAuth, Notion OAuth, OAuth 리다이렉트, OAuth state | `~/.claude/knowledge/notion-oauth.md` |
| iOS 줌, iOS 확대, input 확대, textarea 줌, 모바일 줌 | `~/.claude/knowledge/ios-input-zoom.md` |
| WSL 바이너리, WSL native module, .node 파일 Windows, better-sqlite3 WSL, 네이티브 모듈 WSL | `~/.claude/knowledge/wsl-native-module.md` |
| Claude 디자인, 아티팩트 프롬프트, 디자인 시스템 프롬프트, Tweaks 프로토콜, AI 슬롭, starter component, deck_stage | `~/.claude/knowledge/claude-design-system-prompt.md` |
| 스레드 문투, 스레드 톤, 글 고쳐, 문투에 맞게, 스레드 작성, 스레드 스타일 | `~/.claude/knowledge/threads-writing-style.md` |
| PowerShell symlink, mklink, 심볼릭 링크 권한, 배치 파일 인코딩, symlink 권한 | `~/.claude/knowledge/powershell-symlink.md` |
| Vercel env add preview, git_branch_required, vercel CLI 50, preview 환경변수 등록 | `~/.claude/knowledge/vercel-cli-preview-env.md` |
| 노션 archived, archived should be not present, in_trash, 페이지 삭제, 노션 휴지통, 페이지 복원 | `~/.claude/knowledge/notion-api-archived-to-in-trash.md` |

- knowledge 파일은 `~/.claude/knowledge/` 디렉토리에 주제별로 관리한다.
- 새로운 범용 인사이트가 확인되면 해당 디렉토리에 파일을 추가하고 이 테이블을 업데이트한다.
- **디버깅 중 범용적 인사이트**(특정 프로젝트에 국한되지 않는 패턴, 브라우저/프레임워크 함정 등)가 발생하면, 해결 직후 사용자에게 knowledge 파일 추가 + 라우터 업데이트를 **먼저 제안**한다.

## 임시 파일 경로 규칙

- 특정 프로젝트 리포가 아닌 범용 MD/스크립트 파일은 **`/mnt/c/dev/notes/`** 아래에 생성한다.
- `~`, 홈 디렉토리, 데스크톱 등에 흩뿌리지 않는다.

## Bash 도구에서 PowerShell 사용 시 주의

- Bash 도구 내에서 `powershell -Command "..."` 실행 시, `$` 문자가 Bash에 의해 변수로 해석된다.
- PowerShell 로직이 필요하면 `.ps1` 파일을 작성한 뒤 `powershell -ExecutionPolicy Bypass -File script.ps1`로 실행하거나, Node.js 스크립트를 대신 사용한다.

## Slack 알림

- 슬랙 작업 시 `~/.claude/skills/slack-pilot.md` 스킬을 읽고 따른다.
- 작업 시작 시 현재 시각을 기억해둔다.
- 작업 완료 시 경과 시간이 **5분 이상**이면 `#자동화메시지` 채널에 완료 알림을 보낸다.
- 백그라운드 에이전트 완료 시에는 시간 무관하게 **항상** 알림을 보낸다.
- 알림 형식: `✅ 작업 완료: {한줄 요약} ({경과시간})`

## RTK (Rust Token Killer)

- Bash 명령 실행 시 `~/.claude/skills/rtk.md` 스킬을 읽고 `rtk` 접두사를 적용한다.