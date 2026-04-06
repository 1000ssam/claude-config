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