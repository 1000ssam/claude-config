---
name: project_running-challenge-public-demo
description: running-challenge-3의 챌린저 공유용 공개 데모 리포 (정제본). 비공개 원본과 구분
metadata: 
  node_type: memory
  type: project
  originSessionId: 4ce8b479-2433-47de-9f7a-10274858dda6
---

`running-challenge-3`(비공개)에서 민감정보를 제거한 **공개 데모 리포**가 별도로 존재한다.

- **공개 리포**: `1000ssam/notiontalk-running-challenge-demo` (Public, GitHub) — 챌린저들이 "어떻게 만들었나" 보라고 공유
- **로컬**: `/mnt/c/dev/notiontalk-running-challenge-demo` (히스토리 없는 fresh git init, 원본과 별개 디렉토리)
- **원본**: `1000ssam/running-challenge-3` (비공개, `/mnt/c/dev/running-challenge-3`) — 실제 운영 코드. 절대 혼동 금지.

정제 규칙(다음에 갱신 시 동일 적용): CLAUDE.md·HANDOFF.md 등 내부 작업노트 제외 / 노션 DB ID·워크스페이스 URL·로컬 시크릿 경로는 env var·placeholder로 치환 / 얼굴·GPS 노출 샘플 제외 / 시크릿은 전부 `process.env`. README + `.env.example` 추가됨.

선생님용 가이드북은 `guide/`(README 인덱스 + 01-concepts + 02-workflow + 03-tutorial(코딩에이전트용 A) + 03b-tutorial-ai-studio(비코더 AI Studio 손수 B)). 용어: 노션 DB 행 = "데이터베이스 페이지". data_source_id는 노션 GUI(데이터베이스 옵션 ⋯ → 데이터 소스 관리 → 출처 → 미트볼 ⋯ → 데이터 소스 ID 복사)로 구함.

도구 사실(2026-05 확인): (A)는 무료 코딩에이전트로 **Antigravity CLI** 앞세움 — 구 **Gemini CLI는 개인/AI Pro/Ultra 대상 2026-06-18 종료**, 후속이 Antigravity(antigravity.google). **AI Studio 웹은 로컬 파일 접근 없음**(ZIP다운/GitHub푸시/Cloud Run 배포만, 자기 생성코드 한정, 스택 React+Node). (B)는 우리 repo 복붙+Vercel 유지로 확정 — AI Studio Build→Cloud Run 전환은 스택 상이로 보류.

⚠️ 이 디렉토리는 **project-autopush 대상**이다([[project-config-sync]]). 작업 중 PreCompact 등으로 autopush가 떠 `feat/autosync-YYYYMMDD` 브랜치를 만들고 **HEAD를 그쪽으로 바꾸며 public origin에 푸시**한다(다른 PC LAPTOP-BP1OMPKE 포함). → 명시적 산출물은 반드시 `main`에 커밋·푸시할 것. autosync 브랜치가 공개 리포에 노출되는 게 싫으면 이 repo를 autopush 대상에서 제외 검토.

원본에 새 기능이 들어가면 공개본은 자동 동기화되지 않으므로, 공유본 갱신 요청 시 위 정제 규칙으로 다시 추출해야 한다. [[feedback_secret-management]]
