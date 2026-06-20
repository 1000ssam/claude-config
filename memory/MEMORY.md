# Memory

## ppt-deck 스킬 (PPT 자동 생성)
- [feedback_teaching-deck-bigfont-reveal.md](feedback_teaching-deck-bigfont-reveal.md) — 교실 강의 덱: 본문 ≥28pt(틀은 유지) + 정답은 질문 다음 정리 슬라이드에 클릭 페이드로 점진 공개
- [project_ppt-deck-skill.md](project_ppt-deck-skill.md) — jay.pm.ai 가이드 하네스 구현. 카탈로그(46 variant)+5팔레트 토큰→python-pptx 빌드. `build-template.py --palette N --spec`. QA는 Windows PowerPoint 렌더. 36 variant 검증완료
- [project_ppt-lab-skill.md](project_ppt-lab-skill.md) — PPT 디자인 하네스 연습장(별도 git repo, ppt-deck와 격리). 2축 흡수(레이아웃+스타일). 스타일 축(폰트 latin/ea 분리+컴포넌트 프리셋, --style) feat/style-axis master 머지 완료(2026-06-04)
- [project_ppt-lab-rebuild.md](project_ppt-lab-rebuild.md) — 그리드 클린룸 PPT 하네스(ppt-lab 흡수모델과 별개). 리포 `1000ssam/ppt-lab-rebuild`(비공개·master). grammar 딥 11종(글로우 4룩 2026-06-13 머지). 🚨흡수=룩별 prompt.md 싹싹 정독+원본 preview 대조. 가독성(opacity·차트백드롭)=배경선언→엔진 자동(_bg_atmosphere); 일관성↔가독성=HITL 게이트(chart_backdrop_opacity). 다음=extract 정체성 격상/🥈키트. 팩 로컬 /mnt/c/dev/design-diversity

## running-challenge-3 프로젝트
- [project_running-challenge-cron-toggle.md](project_running-challenge-cron-toggle.md) — 일일 SMS 크론 on/off는 노션 '챌린지 정보' 페이지 '발송 상태'(진행/중단)로 제어. 다음 기수엔 '진행'으로
- [project_running-challenge-public-demo.md](project_running-challenge-public-demo.md) — 챌린저 공유용 공개 데모 리포(1000ssam/notiontalk-running-challenge-demo). 비공개 원본과 혼동 금지
- [project_running-challenge-webhook-automation.md](project_running-challenge-webhook-automation.md) — 인증했는데 SMS 미발송 진단: 발송내역 0건=웹훅 미발화(노션 자동화). 멱등 수동 호출로 복구+검증. 기수 초기 일시 미발화 주의

## notion-99-publishing 프로젝트 (선생님을 위한 노션 99제 출판)
- [project_notion-99-publishing.md](project_notion-99-publishing.md) — 출판 관련 모든 내용 단일 리포(1000ssam/notion-99-publishing, 비공개). 테크빌·인세10%·탈고 2026말·저자4인. 폴더 manuscript/planning/admin/assets

## 협업 모드
- [feedback_proactive-feature-proposal.md](feedback_proactive-feature-proposal.md) — 사용자가 모를 만한 클로드코드 기능을 빌드 흐름 중 능동 제안. 교재 만들 때 특히.
- [feedback_explain-tradeoffs-plainly.md](feedback_explain-tradeoffs-plainly.md) — 트레이드오프·기술 설명은 비개발자도 알아듣게 쉬운 말+일상 비유로 (jargon 금지)

## 작업 경로 규칙
- [feedback_work-in-mnt.md](feedback_work-in-mnt.md) — 모든 프로젝트 작업은 /mnt/c/dev/ 하위에서만. WSL 네이티브 경로(/home/user/...) 절대 사용 금지

## Git 브랜치 정책 (엄격 적용)
- [feedback_branch-policy-strict.md](feedback_branch-policy-strict.md) — 모든 작업은 피처 브랜치에서. 사용자 직접 검토 후 명시적 "머지해" 전까지 main 머지 절대 금지
- [feedback_readonly-agent-restrict-tools.md](feedback_readonly-agent-restrict-tools.md) — 백그라운드 read-only 에이전트(감사·리서치)는 도구 제한(Explore/no-git). all-tools는 분석을 구현·커밋으로 확대해 공유 워킹트리 오염
- [feedback_pass-means-merge.md](feedback_pass-means-merge.md) — "통과"/"오케이 통과" 한마디 = 커밋 + main 머지 + origin push 자동 실행

## Vercel
- Vercel MCP 사용하지 않음. CLI(`vercel`)로만 작업할 것.
- 계정: `1000s-projects-a51f0c2a` (단일 계정 사용)
- [feedback_always-give-preview-url.md](feedback_always-give-preview-url.md) — feat 브랜치 푸시 후 보고 시 preview URL 항상 자동 안내
- [reference_vercel-cli-rest-api.md](reference_vercel-cli-rest-api.md) — CLI 한계 작업(도메인 redirect, deploy hook 삭제 등)은 OAuth 토큰으로 REST API 직접 호출

## gws (Google Workspace CLI)
- [reference_gws-account-actual.md](reference_gws-account-actual.md) — gws는 env var 무관하게 slowly008@gmail.com으로만 인증됨. 파일 생성 위치 보고 전 `about get`으로 실제 주체 확인 필수

## bullet.so (notiontalk.com 호스팅)
- [reference_bullet-so-redirects.md](reference_bullet-so-redirects.md) — 리다이렉트 와일드카드 문법: `From: /old/*` → `To: /new/:splat` (Netlify 스타일 splat)
- [project_notiontalk-architecture.md](project_notiontalk-architecture.md) — Vercel 랜딩 + bullet `/contents` 서브디렉토리 reverse proxy 구조. 신규 bullet 페이지 추가 시 next.config.ts redirect 갱신 필요
- [project_notiontalk-nav-config.md](project_notiontalk-nav-config.md) — 네비 메뉴 단일출처 패키지(@notiontalk/nav-config, 공개 repo). 랜딩+뉴스레터 공유. 메뉴 변경=index.js 수정→두 앱 npm update+재배포→bullet 수동. 공개 상시 유지 필수
- [project_notiontalk-lenis-smooth-scroll.md](project_notiontalk-lenis-smooth-scroll.md) — Lenis 부드러운 스크롤 적용 3영역(랜딩 네이티브/bullet 프록시 주입/뉴스레터 별도repo). 🚨업그레이드 시 bullet은 public/vendor 파일+route.ts LENIS_VERSION 둘 다 갱신
- [project_notion-action-relay.md](project_notion-action-relay.md) — 🚀 **시크릿 기반 자동화 액션 통합 파이프라인**(GitHub Actions, repo `1000ssam/notion-action-relay`). 새 자동화/시크릿 작업·노션 버튼 트리거·bullet 배포 요청 시 **먼저 이 repo부터 참조**. 완전가동(노션→Vercel→Actions 검증완료). 새 액션 추가 = `actions/<name>.py` + Secrets + 워크플로 env 한 줄

## 스킬 경로
- 스킬 디렉토리: `~/.claude/skills\` (Claude가 인식하는 경로 + git 리포)
- GitHub 리포: `1000ssam/claude-skills` (비공개, default branch: main)
- 시크릿: `~/.claude/secrets\` (git 범위 밖, 토큰 보관)
- 스킬 수정은 `~/.claude/skills/`에서 직접 작업(이중 동기화 불필요)하되, **커밋은 브랜치 정책 적용** — 명시 지시 없이 main 직행 금지
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
- [project_eastasia-exam2.md](project_eastasia-exam2.md) — 2차 지필 22문항(7~11과) 출제·검증 완료, /mnt/c/dev/동아시아사-출제/2차/. HWPX 이관 대기(실시일·구성 확인 필요)

## exam-analyzer 스킬 개선 사항
- [feedback_exam-analyzer-keyword-bug.md](feedback_exam-analyzer-keyword-bug.md) — 오답 선지 키워드로 인한 false positive 문제. 발문+제시문에서만 키워드 추출, 정답지 사전 매핑 필요
- [feedback_worksheet-include-integrated-exams.md](feedback_worksheet-include-integrated-exams.md) — 시기통합·단원통합 문항도 해당 차시로 풀 수 있으면 포함. 선지/보기까지 스캔 (false positive와 구분)

## 바이브 코딩 학습 기록
- [feedback_vibe-learning-log.md](feedback_vibe-learning-log.md) — 기술 용어 질문 시 /mnt/c/dev/notes/vibe-coding-learning.md에 추가

## UI 모킹 원칙
- [feedback_no-emoji-in-ui.md](feedback_no-emoji-in-ui.md) — 프리뷰/모킹에서도 이모지 아이콘 사용 금지, SVG만 사용
- [feedback_first-pass-ui-quality.md](feedback_first-pass-ui-quality.md) — 첫 패스에 와꾸 잘 뽑는 범용 원칙: 코드 전 취향 고정·토큰 단일출처·AI슬롭 디폴트 제거·진짜 콘텐츠·정직한 시각QA

## 진단·검증 원칙
- [feedback_user-facing-availability-robust-fix.md](feedback_user-facing-availability-robust-fix.md) — 유저 대면 가용성 문제는 "캐시 지워라" 류 로컬 워크어라운드 금지. 근본·견고한 수정(커스텀 도메인 등) 우선
- [feedback_websearch-us-only.md](feedback_websearch-us-only.md) — WebSearch는 미국 Google. 한국 SERP 결론을 단독으로 내리지 말 것
- [feedback_verify-before-asserting.md](feedback_verify-before-asserting.md) — grep/regex "없음" 단정 전 nested·multiline 케이스 재검증
- [feedback_measure-layout-before-changing.md](feedback_measure-layout-before-changing.md) — UI 정렬 어긋남은 동일조건 픽셀 실측으로 원인 격리 후 수정. 감·코드구조 추측·핸드오프 맹신 금지
- [feedback_korean-linebreak-visual-qa.md](feedback_korean-linebreak-visual-qa.md) — 한글 헤드라인 줄바꿈은 실제 표시 폭(복수)에서 직접 검수 + word-break:keep-all 기본. 단일폭·썸네일 검수 금지

## 원고 검토 메모
- [feedback_review-memo-tone-terse.md](feedback_review-memo-tone-terse.md) — 검토 메모는 아주 짧게+소프트 플래그('확인 필요'). 단정·명령형·강한 평가어 금지
- [feedback_exam-stem-no-daum.md](feedback_exam-stem-no-daum.md) — 시험 발문에 "다음" 금지: "다음 자료에 나타난"(X)→"자료에 나타난"(O)
- [feedback_distractor-no-fabricated-events.md](feedback_distractor-no-fabricated-events.md) — 오답 선지에 거짓 술어(날조·반전·변조) 금지, 술어는 실재 참 사실+귀속만 어긋남. 반전 허용은 부정발문 정답 한정 (선지 대원칙)

## 카피 수정 원칙
- [feedback_dont-overtrim-copy.md](feedback_dont-overtrim-copy.md) — 카피 수정 시 사용자가 지목한 부분만 손댐. 주변 문장 임의 압축/재작성 금지
- [feedback_textbook-headings-verbatim.md](feedback_textbook-headings-verbatim.md) — 학습지는 교과서 헤딩·소절명 그대로. 부제 추가·위계 평탄화·이모지 번호 임의 부착 금지
- [feedback_worksheet-gaesik-myeongsahyeong.md](feedback_worksheet-gaesik-myeongsahyeong.md) — 워크시트 본문은 개조식+명사형 어미(서술형 문장 금지). 스킬 실행 전 기존 산출물 형식 먼저 확인
- [feedback_seo-blog-human-led.md](feedback_seo-blog-human-led.md) — SEO 블로그는 메타·구조까지만 AI 도출, 본문은 사용자가 직접 작성. seo-blog-writer 스킬 톤 수정 금지
- [feedback_no-fabrication.md](feedback_no-fabrication.md) — **🚨 최상위**: 출처에 없는 기능·시나리오·플랜 제약·후킹 카피·부정 단정 절대 발명 금지. 의심되면 삭제
- [feedback_analysis-stay-descriptive.md](feedback_analysis-stay-descriptive.md) — 전략·분석은 서술에서 멈춤. 비판적인 척·예리한 척, 냉소적 표현(위장막·인질 등) 금지

## 핸드오프 출력 규칙
- [feedback_handoff-path-output.md](feedback_handoff-path-output.md) — HANDOFF 파일 작성/갱신 후 절대 경로를 응답 마지막에 단독 노출 (다음 세션 복사용)

## 앱 개발 원칙
- [feedback_user-reviews-ui-not-code.md](feedback_user-reviews-ui-not-code.md) — 사용자는 코드 못 읽음. 검토 요청은 UI/UX만. 코드 리뷰는 Claude 몫
- [feedback_changelog-on-deploy.md](feedback_changelog-on-deploy.md) — 사용자 체감 변경 시 반드시 changelog 업데이트
- [feedback_always-report-visual-qa-needed.md](feedback_always-report-visual-qa-needed.md) — 사용자가 육안/수동으로 검증해야 할 항목이 남으면 보고 시 항상 명시
- [feedback_visual-qa-show-original-target.md](feedback_visual-qa-show-original-target.md) — 시각 QA 제시 시 항상 원본 타깃(레퍼런스)을 우리 결과와 나란히 제공·동시 열기
- [feedback_design-tokens-not-hardcoding.md](feedback_design-tokens-not-hardcoding.md) — 리디자인은 시맨틱 클래스/CSS 변수로 리팩토링. 하드코딩→하드코딩 치환 금지

## 2대 PC 동기화
- [project_config-sync.md](project_config-sync.md) — config-repo(Git) 자동 동기화, SessionStart→pull / PreCompact→push
- [feedback_git-init-on-new-work.md](feedback_git-init-on-new-work.md) — 새 작업 암시 시 /mnt/c/dev/ 폴더 + git init + 비공개 리모트 먼저 제안 (project-autopush 대상화)

## 개발 사전 체크
- [feedback_check-platform-compat.md](feedback_check-platform-compat.md) — CLI/패키지 플랫폼 호환성 반드시 사전 확인 (win32 환경)

## 메일리 콘텐츠 이관
- [project_maily-content-import.md](project_maily-content-import.md) — 메일리 발행글→노션 임포터(/mnt/c/dev/maily-import). 메일리 콘텐츠API無·서버렌더 스크래핑. 공개분=쿠키無, 유료/미발행=_letter_box_session 쿠키. @notionhq/client v2.2.15 고정 필수

## 뉴스레터 홈 카드
- [project_newsletter-home-card.md](project_newsletter-home-card.md) — 홈 레터 카드 구조(cover썸네일/부제목/에디터 Written by). 줄수예약으로 카드높이 고정→썸네일 동일크기. 웰컴레터 최하단. 2026-06-01 main 배포

## wee-log 보호자 동의서 (E2E 영지식)
- [project_wee-log-consent.md](project_wee-log-consent.md) — E2E 영지식 동의서(libsodium+CF Worker+Solapi). 감사수정 main 머지·프로덕션 배포 완료. 🆕 `feat/consent-case-batch`=케이스 일괄발송+기본 전체체크, 시각QA(qa-checklist 5번) 후 머지 대기

## API 문제 해결 원칙
- [feedback_no-api-downgrade.md](feedback_no-api-downgrade.md) — 레거시 API 다운그레이드 금지, 현재 버전에서 근본 원인 해결
- [feedback_use-context7-for-api.md](feedback_use-context7-for-api.md) — API 탐색 시 context7 MCP 필수 사용
- [feedback_vercel-env-newline.md](feedback_vercel-env-newline.md) — vercel env add 시 `<<<` 금지, `printf | vercel env add` 사용

## notion-to-docs 프로젝트
- [project_notion-to-docs.md](project_notion-to-docs.md) — Notion→Google Docs 변환기, 스킬 등록됨
- [project_notion-to-docs-deploy.md](project_notion-to-docs-deploy.md) — 배포 계획: 공유 스킬(우선) + 크롬 익스텐션(후순위)
- [project_notion-to-docs-comments.md](project_notion-to-docs-comments.md) — discussion-urls span 버그 수정✅. 댓글 이관은 보류(Drive anchor 미동작). 향후 댓글 붙은 Docs 역분석 과제

## 노션 작업 원칙
- [feedback_notion-pilot-always.md](feedback_notion-pilot-always.md) — 노션 아키텍처 설계 단계에서도 반드시 notion-pilot 스킬 참조
- [reference_notion-formula-api-relation.md](reference_notion-formula-api-relation.md) — API 생성 relation은 수식 map/join 순회 불가 → rollup(show_original)으로 대체. eastasia-worksheet 폼 DB STEP4 함정

## 클립보드 이미지
- [feedback_clipboard-shortcut.md](feedback_clipboard-shortcut.md) — "클립보드" 말하면 즉시 PowerShell 이미지 저장+읽기

## notion-print 프로젝트
- [project_notion-print.md](project_notion-print.md) — 노션 A4 인쇄 미리보기 웹앱, MVP 완성, 텍스트 리플로우 분할이 핵심 후속과제

## MWN 블로그 시리즈
- [project_mwn-blog-series.md](project_mwn-blog-series.md) — notiontalk 'Make with Notion 2026' 9편 시리즈 초안 완성·미발행. git 리포: /mnt/c/dev/mwn-blog-series/

## 프롬프트 모음
- [reference_notion-to-app-prompts.md](reference_notion-to-app-prompts.md) — 노션 AI(PRD) + 클로드 코드(기술 설계) 2단계 프롬프트 → `~/workspace/notes/notion-to-app-prompts.md`

## PDF 추출 방법
- [feedback_pdf-use-fitz-not-read.md](feedback_pdf-use-fitz-not-read.md) — PDF는 Read 도구 말고 PyMuPDF(fitz)로 바로 추출. poppler 설치 같은 삽질 방지

## 경로 자동 탐색
- [feedback_auto-find-path.md](feedback_auto-find-path.md) — 경로 없으면 유사 이름 자동 탐색, 되묻지 말 것

## 자율 실행 모드
- [feedback_goal-mode-no-trivial-questions.md](feedback_goal-mode-no-trivial-questions.md) — /goal 자율 실행 중 사소한 선택은 묻지 말고 합리적 기본값으로 진행

## 자체 뉴스레터 서비스
- [project_newsletter-send-idempotency.md](project_newsletter-send-idempotency.md) — 🚨 첫 대량발송 완료(2026-06-16, 1033명·반송3.5%). 멱등로그 경로분리(CLI=로컬파일/노션버튼=GH캐시, 공유안됨)→경로혼용=이중발송. CLI로 보낸 레터는 버튼 누르지 말 것. Upstash dedup 하드닝 보류(B)
- [project_newsletter-self-host.md](project_newsletter-self-host.md) — Maily 대체, AWS SES+Notion+Vercel. 라이브·Turnstile·SES프로덕션승인✅. 웹UX/캐싱/단계발송·레이트제한 전부 main 머지·배포(2026-05-28). 🚩다음=발송도메인 apex→서브도메인(news.notiontalk.com) 전환(별도SES ID검증 필요, Gabia 2-dot은 Route53 위임). 가이드=notes/newsletter-subdomain-migration-2026-05-28.md
- [project_newsletter-editor-db.md](project_newsletter-editor-db.md) — 레터 에디터(아바타+이름)·발송일 메타. 단계적 마스터 에디터 DB(bullet 3정본 통합은 후속). 코드 main 배포✅, 노션 공유+relation 셋업 대기
- [project_newsletter-marketing-consent.md](project_newsletter-marketing-consent.md) — 구독 폼 필수 마케팅 동의 + 개인정보처리방침(/privacy) main 배포✅. 🚩첫 광고성 발송 전 제목"(광고)"+전송자정보 표기 과제 남음
- [project_newsletter-view-count.md](project_newsletter-view-count.md) — /newsletter 조회수 표시(웹조회+메일고유오픈+메일리시드, 0이면 숨김). 메일리 옛레터 4건은 계정해제로 실수치 복원불가→구독자 15~20% 고정시드. 🔑로컬 UPSTASH_*==프로덕션 KV_*(같은 인스턴스), 프리뷰엔 KV없음. 배포후 revalidate(끝슬래시 필수). 2026-06-19 라이브

## 뉴스레터 구독자 지표
- [project_newsletter-subscriber-metrics.md](project_newsletter-subscriber-metrics.md) — 메일리식 구독자별 롤업→노션 구독자 DB. 레터 동기화 워크플로에 통합(한 버튼/크론으로 둘 다). 실발송 이력無→backfill 불필요. 2026-06-01 배포

## ai-club 프로젝트
- [project_ai-club.md](project_ai-club.md) — 고1 AI 동아리 웹페이지 + Notion 제출 시스템. 4회차까지 완료·배포(NotebookLM 학습자료 제작·공유). Vercel preview env는 빈문자열 브랜치 인자 필요.

## wee-linked 프로젝트 (상담교사 허브, Next.js+Supabase, wee-linked.com)
- [project_wee-linked-team-profiles.md](project_wee-linked-team-profiles.md) — 소개 운영진 팀 프로필(마스터+운영진 통합). feat/team-profiles(worktree 격리)·운영DB 0025 적용·프리뷰 라이브. main 머지+vercel --prod 대기
- [project_wee-linked-deploy.md](project_wee-linked-deploy.md) — 🚩 main push≠프로덕션. 머지 후 반드시 `vercel --prod --yes` 실행해야 wee-linked.com 반영. DB는 `supabase db push` 별도. 게시판 카테고리(board_categories)+클린탭 레이아웃 라이브(2026-06-09)
- [project_wee-linked-content-admin.md](project_wee-linked-content-admin.md) — 정적 페이지 문구 편집(`/admin/content`, site_content 단일테이블 덮어쓰기). 🔒 admin 전용(slowly007+조열음만) — staff로 넓히지 말 것. 0018/0019 라이브
- [project_wee-linked-mock.md](project_wee-linked-mock.md) — 랜딩 리디자인 시안(mymind 레퍼런스·디필레이아·1번 팔레트). 데스크톱 완성·https://wee-linked-demo.vercel.app 공개. 실서비스와 별개. HANDOFF=/mnt/c/dev/notes/wee-linked-mock/HANDOFF.md. 다음=모바일/고도화

## wee-log 프로젝트
- [project_wee-log-archival-scope.md](project_wee-log-archival-scope.md) — 기록물 이관=전국 공통플로우(K-에듀파인등록+편철+이관목록 별지제2호+실물 인계)만 커버, USB단독=불충분. 서울식 보유목록관리시스템=특화→오픈후 현장피드백. 매뉴얼 10종 /mnt/c/dev/notes/wee-archival-manuals/
- [project_wee-log-audit.md](project_wee-log-audit.md) — 🔧 2026-06-11 전체감사+리팩토링 완료. audit-phase0-2(핫픽스·타입·main.ts분해)+phase3-renderer 브랜치, main 미머지·시각QA 대기. P4 출시게이트(Solapi키·Worker인증) 미착수
- [project_wee-log.md](project_wee-log.md) — 인수인계 시 필수 체크리스트 (API 키 처리 등)
- [project_wee-log-lingle-design.md](project_wee-log-lingle-design.md) — 앱명 링글+패밀리룩(productName='Wee-Story' 유지 필수·미색배경=패착). v3.1"에어"=순백+블루차분 토큰 **main머지완료**(2026-06-17 9fada44). 원본복구=THEME-HISTORY.md(git checkout d789947)
- [project_wee-log-subscription-decisions.md](project_wee-log-subscription-decisions.md) — 구독/인증 설계 확정 12개 결정(2026-06-07 grill). 테크빌 대행사+redemption code+멀티시트+1디바이스+서버주도 feature플래그+앱전용 Supabase. 미구현, SUBSCRIPTION_DESIGN.md 반영 필요
- [feedback_diarization-no-manual-toggle.md](feedback_diarization-no-manual-toggle.md) — STT 화자 분리 '사용자가 화자마다 버튼 누르는' UX 절대 제안 금지. 자동 솔루션 우선, 안 되면 "안 된다"고 답함

## wee-consent 백엔드 (링글 서버)
- [project_wee-consent-backend.md](project_wee-consent-backend.md) — 🚨 wee-consent = 링글(wee-log) 백엔드 Cloudflare Worker(consent.wee-linked.com). 동의서·공휴일/NEIS프록시·구독검증·(예정)SMS. 키 전부 서버 격리(P4 2026-06-12). 절대 삭제 금지. wee-log=앱/wee-linked=웹/wee-consent=서버

## wee-log-migration 프로젝트 (v2→v3 노션 마이그레이션 웹앱, ≠ wee-log STT앱)
- [project_wee-log-migration.md](project_wee-log-migration.md) — 🚨 v2 절대보존 하드룰 + 본문 마크다운 이관(2026-03-11 retrieveMarkdown/updateMarkdown) + 이미지 A안(콜아웃 안내)

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

## wee-linked.com 도메인
- [project_wee-linked-domain.md](project_wee-linked-domain.md) — Porkbun 등록(2026-06-08, 1년)+Cloudflare DNS 위임+Vercel 호스팅(A 76.76.21.21/CNAME cname.vercel-dns.com, DNS only 필수). 메일 보류(CS 우선)
- [roadmap-videos (Hyperframes)](project_roadmap-videos.md) — HTML→MP4 커밋이력 로드맵 영상. 셋업완료, notiontalk 1편 완성. 다음=wee-linked·wee-log
- [project_wee-log-remote-llm.md](project_wee-log-remote-llm.md) — 원격 LLM 레벨1 main 머지완료(2026-06-12, audit 리팩토링 동반). 다음=QA→KT서빙. 서버 수작업=SERVER-SETUP-GUIDE.md. 결정대기: GPU/모델(Mi:dm 권장)/도메인

## hf-gui (HyperFrames 설정 GUI)
- [project_hf-gui.md](project_hf-gui.md) — HyperFrames CLI 감싼 로컬 웹 래퍼(변수폼+해상도+SSE렌더). repo 1000ssam/hf-gui 비공개·feat/build(main 미머지). E2E·보안 검증완료. 남은일=브라우저 시각QA. 데모 /mnt/c/dev/hf-gui-sandbox/demo
