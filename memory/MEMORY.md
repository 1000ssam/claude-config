# Memory

## 협업 모드
- [feedback_proactive-feature-proposal.md](feedback_proactive-feature-proposal.md) — 사용자가 모를 만한 클로드코드 기능을 빌드 흐름 중 능동 제안. 교재 만들 때 특히.

## 작업 경로 규칙
- [feedback_work-in-mnt.md](feedback_work-in-mnt.md) — 모든 프로젝트 작업은 /mnt/c/dev/ 하위에서만. WSL 네이티브 경로(/home/user/...) 절대 사용 금지

## Git 브랜치 정책 (엄격 적용)
- [feedback_branch-policy-strict.md](feedback_branch-policy-strict.md) — 모든 작업은 피처 브랜치에서. 사용자 직접 검토 후 명시적 "머지해" 전까지 main 머지 절대 금지
- [feedback_pass-means-merge.md](feedback_pass-means-merge.md) — "통과"/"오케이 통과" 한마디 = 커밋 + main 머지 + origin push 자동 실행

## Vercel
- Vercel MCP 사용하지 않음. CLI(`vercel`)로만 작업할 것.
- 계정: `1000s-projects-a51f0c2a` (단일 계정 사용)
- [feedback_always-give-preview-url.md](feedback_always-give-preview-url.md) — feat 브랜치 푸시 후 보고 시 preview URL 항상 자동 안내
- [reference_vercel-cli-rest-api.md](reference_vercel-cli-rest-api.md) — CLI 한계 작업(도메인 redirect, deploy hook 삭제 등)은 OAuth 토큰으로 REST API 직접 호출

## bullet.so (notiontalk.com 호스팅)
- [reference_bullet-so-redirects.md](reference_bullet-so-redirects.md) — 리다이렉트 와일드카드 문법: `From: /old/*` → `To: /new/:splat` (Netlify 스타일 splat)
- [project_notiontalk-architecture.md](project_notiontalk-architecture.md) — Vercel 랜딩 + bullet `/contents` 서브디렉토리 reverse proxy 구조. 신규 bullet 페이지 추가 시 next.config.ts redirect 갱신 필요

## 스킬 경로
- 스킬 디렉토리: `~/.claude/skills\` (Claude가 인식하는 경로 + git 리포)
- GitHub 리포: `1000ssam/claude-skills` (비공개, default branch: main)
- 시크릿: `~/.claude/secrets\` (git 범위 밖, 토큰 보관)
- 스킬 수정 시 `~/.claude/skills/`에서 직접 커밋+푸시 (이중 동기화 불필요)
- `~/workspace/skills-for-teachers\` — 공유용 선별 스킬 (별도 리포 `1000ssam/skills-for-teachers`, 혼동 금지)

## 페르소나 사용 규칙
- [feedback_school-persona.md](feedback_school-persona.md) — 학교용 앱에서는 '1000쌤' 대신 '김용천 선생님' 사용

## 시크릿 관리
- [feedback_secret-management.md](feedback_secret-management.md) — 시크릿 3대 원칙: 하드코딩 금지, 대화창 노출 금지, 깃 푸시 금지

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

## exam-analyzer 스킬 개선 사항
- [feedback_exam-analyzer-keyword-bug.md](feedback_exam-analyzer-keyword-bug.md) — 오답 선지 키워드로 인한 false positive 문제. 발문+제시문에서만 키워드 추출, 정답지 사전 매핑 필요

## 바이브 코딩 학습 기록
- [feedback_vibe-learning-log.md](feedback_vibe-learning-log.md) — 기술 용어 질문 시 ~/workspace/notes\vibe-coding-learning.md에 추가

## UI 모킹 원칙
- [feedback_no-emoji-in-ui.md](feedback_no-emoji-in-ui.md) — 프리뷰/모킹에서도 이모지 아이콘 사용 금지, SVG만 사용

## 진단·검증 원칙
- [feedback_websearch-us-only.md](feedback_websearch-us-only.md) — WebSearch는 미국 Google. 한국 SERP 결론을 단독으로 내리지 말 것
- [feedback_verify-before-asserting.md](feedback_verify-before-asserting.md) — grep/regex "없음" 단정 전 nested·multiline 케이스 재검증

## 카피 수정 원칙
- [feedback_dont-overtrim-copy.md](feedback_dont-overtrim-copy.md) — 카피 수정 시 사용자가 지목한 부분만 손댐. 주변 문장 임의 압축/재작성 금지
- [feedback_textbook-headings-verbatim.md](feedback_textbook-headings-verbatim.md) — 학습지는 교과서 헤딩·소절명 그대로. 부제 추가·위계 평탄화·이모지 번호 임의 부착 금지
- [feedback_seo-blog-human-led.md](feedback_seo-blog-human-led.md) — SEO 블로그는 메타·구조까지만 AI 도출, 본문은 사용자가 직접 작성. seo-blog-writer 스킬 톤 수정 금지
- [feedback_no-fabrication.md](feedback_no-fabrication.md) — **🚨 최상위**: 출처에 없는 기능·시나리오·플랜 제약·후킹 카피·부정 단정 절대 발명 금지. 의심되면 삭제
- [feedback_analysis-stay-descriptive.md](feedback_analysis-stay-descriptive.md) — 전략·분석은 서술에서 멈춤. 비판적인 척·예리한 척, 냉소적 표현(위장막·인질 등) 금지

## 핸드오프 출력 규칙
- [feedback_handoff-path-output.md](feedback_handoff-path-output.md) — HANDOFF 파일 작성/갱신 후 절대 경로를 응답 마지막에 단독 노출 (다음 세션 복사용)

## 앱 개발 원칙
- [feedback_changelog-on-deploy.md](feedback_changelog-on-deploy.md) — 사용자 체감 변경 시 반드시 changelog 업데이트
- [feedback_design-tokens-not-hardcoding.md](feedback_design-tokens-not-hardcoding.md) — 리디자인은 시맨틱 클래스/CSS 변수로 리팩토링. 하드코딩→하드코딩 치환 금지

## 2대 PC 동기화
- [project_config-sync.md](project_config-sync.md) — config-repo(Git) 자동 동기화, SessionStart→pull / PreCompact→push
- [feedback_git-init-on-new-work.md](feedback_git-init-on-new-work.md) — 새 작업 암시 시 /mnt/c/dev/ 폴더 + git init + 비공개 리모트 먼저 제안 (project-autopush 대상화)

## 개발 사전 체크
- [feedback_check-platform-compat.md](feedback_check-platform-compat.md) — CLI/패키지 플랫폼 호환성 반드시 사전 확인 (win32 환경)

## API 문제 해결 원칙
- [feedback_no-api-downgrade.md](feedback_no-api-downgrade.md) — 레거시 API 다운그레이드 금지, 현재 버전에서 근본 원인 해결
- [feedback_use-context7-for-api.md](feedback_use-context7-for-api.md) — API 탐색 시 context7 MCP 필수 사용
- [feedback_vercel-env-newline.md](feedback_vercel-env-newline.md) — vercel env add 시 `<<<` 금지, `printf | vercel env add` 사용

## notion-to-docs 프로젝트
- [project_notion-to-docs.md](project_notion-to-docs.md) — Notion→Google Docs 변환기, 스킬 등록됨
- [project_notion-to-docs-deploy.md](project_notion-to-docs-deploy.md) — 배포 계획: 공유 스킬(우선) + 크롬 익스텐션(후순위)

## 노션 작업 원칙
- [feedback_notion-pilot-always.md](feedback_notion-pilot-always.md) — 노션 아키텍처 설계 단계에서도 반드시 notion-pilot 스킬 참조

## 클립보드 이미지
- [feedback_clipboard-shortcut.md](feedback_clipboard-shortcut.md) — "클립보드" 말하면 즉시 PowerShell 이미지 저장+읽기

## notion-print 프로젝트
- [project_notion-print.md](project_notion-print.md) — 노션 A4 인쇄 미리보기 웹앱, MVP 완성, 텍스트 리플로우 분할이 핵심 후속과제

## 프롬프트 모음
- [reference_notion-to-app-prompts.md](reference_notion-to-app-prompts.md) — 노션 AI(PRD) + 클로드 코드(기술 설계) 2단계 프롬프트 → `~/workspace/notes/notion-to-app-prompts.md`

## PDF 추출 방법
- [feedback_pdf-use-fitz-not-read.md](feedback_pdf-use-fitz-not-read.md) — PDF는 Read 도구 말고 PyMuPDF(fitz)로 바로 추출. poppler 설치 같은 삽질 방지

## 경로 자동 탐색
- [feedback_auto-find-path.md](feedback_auto-find-path.md) — 경로 없으면 유사 이름 자동 탐색, 되묻지 말 것

## 자체 뉴스레터 서비스
- [project_newsletter-self-host.md](project_newsletter-self-host.md) — Maily 대체, AWS SES + Notion DB 구축 예정 (AWS 계정 미생성)

## ai-club 프로젝트
- [project_ai-club.md](project_ai-club.md) — 고1 AI 동아리 웹페이지 + Notion 제출 시스템. 2회차까지 완료. Vercel env add 개행문자 버그 주의.

## wee-log 프로젝트
- [project_wee-log.md](project_wee-log.md) — 인수인계 시 필수 체크리스트 (API 키 처리 등)

## 테스트 원칙
- [feedback_never-overwrite-existing-data.md](feedback_never-overwrite-existing-data.md) — 테스트 시 기존 데이터 페이지에 절대 덮어쓰지 말 것. 신규 생성으로만 테스트

## desktop-inbox 프로젝트
- [project_desktop-inbox.md](project_desktop-inbox.md) — 바탕화면 자동 정리 (Inbox + Symlink 분류), PowerShell 스크립트

## Knowledge
- `~/.claude/knowledge/powershell-symlink.md` — PowerShell symlink 권한 문제 + 배치 인코딩 해결법

## Claude Design System Prompt
- Knowledge 파일: `~/.claude/knowledge/claude-design-system-prompt.md` — Claude 아티팩트(HTML) 디자인 도구의 시스템 프롬프트. 워크플로, React/Babel 핀 버전, Tweaks 프로토콜, AI 슬롭 회피 원칙, Starter Components 등 포함

## notion-cover-matcher 프로젝트
- [project_notion-cover-matcher.md](project_notion-cover-matcher.md) — 노션 DB 일괄 커버 적용 도구. backup-covers.json 안전망 필수. urls.raw + 안정 파라미터 사용

## 이미지 매칭 접근법
- [feedback_keyword-image-matching-theater.md](feedback_keyword-image-matching-theater.md) — 추상 SW 개념 ↔ 사진 키워드 매칭은 연극. 큐레이션 뱅크/컬러 필터/AI 생성 우선 제안

## PC 관리대장
- [project_pc-management-ledger.md](project_pc-management-ledger.md) — 로컬 정본(`/mnt/c/dev/관리대장최신화/`) + G드라이브 .lnk 바로가기. 자동 G드라이브 복사 금지, in-place 갱신만

## zoom-meeting 스킬
- [feedback_zoom-defaults.md](feedback_zoom-defaults.md) — 줌 회의 기본값: 대기실 OFF, 입장음소거 ON, 호스트없이입장 ON, PMI 사용, 비번 1000

## 인창고 2026 정보보호 감사
- [project_inchang-2026-roster.md](project_inchang-2026-roster.md) — 2026학년도 재직자 85명 단일 명단 (정보보호 감사·개인정보취급자 서약서 대상 판정용). 문서: /mnt/c/dev/inchang-security-audit-2026/2026_재직자_명단.md

## notion-flow 후속과제

1. **액션 설정 - 속성 매핑 개선** (프로젝트: `~/workspace/notion-flow`)
   - 현재: "대상 속성 이름"을 사용자가 직접 텍스트로 입력 → 오타/불일치 위험
   - 개선안: Make.com처럼 DB 스키마를 읽어와서 드롭다운으로 속성명 매핑
     - 최초 1회 DB 스키마 fetch + 수동 새로고침 버튼
     - 속성의 값 유형(select, number, text 등)도 함께 표시/정의해야 올바른 값 생성 가능
   - 현재 속성 값 유형 정의 부분이 없어서 실제 동작 시 문제 가능성 있음
2. **자동화 생성 후 즉시 활성화 UX** (프로젝트: `~/workspace/notion-flow`)
   - 현재: 새 자동화 생성 시 디폴트 비활성 → 사용자가 별도로 활성화해야 함
   - 개선안: 생성 완료 직후 활성화 여부를 묻는 확인 다이얼로그/토스트 표시 → 즉시 활성화 가능
