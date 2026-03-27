# Memory

## Vercel
- Vercel MCP 사용하지 않음. CLI(`vercel`)로만 작업할 것.
- 계정: `1000s-projects-a51f0c2a` (단일 계정 사용)

## 스킬 경로
- 스킬 디렉토리: `C:\Users\user\.claude\skills\` (Claude가 인식하는 경로 + git 리포)
- GitHub 리포: `1000ssam/claude-skills` (비공개, default branch: main)
- 시크릿: `C:\Users\user\.claude\secrets\` (git 범위 밖, 토큰 보관)
- 스킬 수정 시 `~/.claude/skills/`에서 직접 커밋+푸시 (이중 동기화 불필요)
- `C:\dev\skills-for-teachers\` — 공유용 선별 스킬 (별도 리포 `1000ssam/skills-for-teachers`, 혼동 금지)

## 페르소나 사용 규칙
- [feedback_school-persona.md](feedback_school-persona.md) — 학교용 앱에서는 '1000쌤' 대신 '김용천 선생님' 사용

## 시크릿 관리
- [feedback_secret-management.md](feedback_secret-management.md) — API 토큰 분리 원칙

## CLAUDE.md 관리 원칙
- [feedback_claude-md-minimal.md](feedback_claude-md-minimal.md) — CLAUDE.md 최소화, 워크플로는 스킬로 분리

## book-writer 프로젝트
- [project_book-writer.md](project_book-writer.md) — 골든래빗 노션 책 집필 자동화 (Google Docs API 스타일 매핑)

## SNS-automation 프로젝트
- [project_sns-automation.md](project_sns-automation.md) — 스레드→캔바→인스타 자동화, Canva MCP 설치됨, Threads API 인증 미해결

## Threads Insights 스킬
- [project_threads-insights.md](project_threads-insights.md) — Threads API 수집·분석·글쓰기 자동화, 토큰 만료 2026-05-22

## 인스타 캐러셀 스타일 가이드
- [reference_carousel-style-guide.md](reference_carousel-style-guide.md) — 스레드→캐러셀 변환 시 구조/톤/샘플 참조 (Canva 폴더: 인스타 캐러셀)

## 동아시아사 수업 자료 자동화
- [project_eastasia-worksheet.md](project_eastasia-worksheet.md) — 교과서→기출분석→폼DB 통합 스킬, 성취기준 매핑 추후 과제

## 바이브 코딩 학습 기록
- [feedback_vibe-learning-log.md](feedback_vibe-learning-log.md) — 기술 용어 질문 시 C:\dev\notes\vibe-coding-learning.md에 추가

## 앱 개발 원칙
- [feedback_changelog-on-deploy.md](feedback_changelog-on-deploy.md) — 사용자 체감 변경 시 반드시 changelog 업데이트

## 2대 PC 동기화
- [project_config-sync.md](project_config-sync.md) — config-repo(Git) 자동 동기화, Stop hook마다 push

## 개발 사전 체크
- [feedback_check-platform-compat.md](feedback_check-platform-compat.md) — CLI/패키지 플랫폼 호환성 반드시 사전 확인 (win32 환경)

## API 문제 해결 원칙
- [feedback_no-api-downgrade.md](feedback_no-api-downgrade.md) — 레거시 API 다운그레이드 금지, 현재 버전에서 근본 원인 해결
- [feedback_use-context7-for-api.md](feedback_use-context7-for-api.md) — API 탐색 시 context7 MCP 필수 사용

## notion-flow 후속과제

1. **액션 설정 - 속성 매핑 개선** (프로젝트: `C:\dev\notion-flow`)
   - 현재: "대상 속성 이름"을 사용자가 직접 텍스트로 입력 → 오타/불일치 위험
   - 개선안: Make.com처럼 DB 스키마를 읽어와서 드롭다운으로 속성명 매핑
     - 최초 1회 DB 스키마 fetch + 수동 새로고침 버튼
     - 속성의 값 유형(select, number, text 등)도 함께 표시/정의해야 올바른 값 생성 가능
   - 현재 속성 값 유형 정의 부분이 없어서 실제 동작 시 문제 가능성 있음
2. **자동화 생성 후 즉시 활성화 UX** (프로젝트: `C:\dev\notion-flow`)
   - 현재: 새 자동화 생성 시 디폴트 비활성 → 사용자가 별도로 활성화해야 함
   - 개선안: 생성 완료 직후 활성화 여부를 묻는 확인 다이얼로그/토스트 표시 → 즉시 활성화 가능
