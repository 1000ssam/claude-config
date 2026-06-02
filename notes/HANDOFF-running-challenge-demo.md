# HANDOFF — notiontalk-running-challenge-demo (공개 데모 + 가이드북)

작성: 2026-05-27 · 작성자 세션 요약용. **이 파일은 공개 repo 밖**(내부 노트라 비공개 유지).

---

## 0. 한눈에

- **무엇**: 비공개 운영 repo `running-challenge-3`(러닝 스크린샷 → Gemini OCR → 노션 자동기록 + SMS)를
  민감정보 제거해 **공개 데모 repo**로 만들고, 그 위에 **선생님용 가이드북(`guide/`)** 을 작성 중.
- **공개 repo**: `1000ssam/notiontalk-running-challenge-demo` (Public) · 로컬 `/mnt/c/dev/notiontalk-running-challenge-demo` (히스토리 없는 fresh init)
- **원본(절대 혼동 금지)**: `1000ssam/running-challenge-3` (비공개) · 로컬 `/mnt/c/dev/running-challenge-3`
- **현재 main HEAD**: `9d74cc5` (origin/main 동기화됨)

> 🆕 **2026-05-28 — 가이드를 GitHub→Vercel 흐름으로 전면 재구성(`9d74cc5`).** "로컬 실행 제거"가 핵심.
> - **원칙**: 파일은 만들되 **실행은 Vercel에서**. Node 설치·터미널·로컬 서버 불필요. 검증은 배포된 URL에서.
> - **페이즈 7개 → 4개**: 0 셋업(노션·키) / 1 코드 만들어 GitHub에 / 2 Vercel 연결+키+배포 / 3 라이브 검증(`/api/debug`·`/api/challengers`·휴대폰 업로드, 막히면 Vercel 함수 로그를 AI에게).
> - **검증 최소화**: 페이즈마다 조각 테스트 안 함 → 배포 후 한 번에.
> - **분기 B 무벽화**: 메모장·탐색기·dotfile·`.env.local` **전부 폐기**. GitHub 웹에서 파일 직접 생성(이름칸에 `lib/gemini.js` 경로째 입력). 시크릿은 Vercel 환경변수에만.
> - **자동 시작**: 파일 붙여넣으면 인사/대기 없이 곧바로 페이즈 0. 사용자는 페이즈 끝에 "다음"만.
> - 그 사이 커밋: `457daf8`(틸드 취소선 버그 수정), `e8294ac`(초보 친화 1차).

> 🆕 **2026-05-27 (이어서) — 가이드 전면 교체.** 긴 산문 가이드북(01~03b 4파일)을 **삭제**하고, **AI에게 통째로 던지는 단일 빌드 가이드 `guide/AGENT-BUILD-GUIDE.md`** 로 갈아엎음(커밋 `34e9314`).
> - 구조: §0 사용법+분기결정 → §1 프로젝트 스펙(아키텍처·노션DM·Gemini규칙·env) → §2 페이즈 0~6([목표/🤖A요청/💬B요청/✅완료/📝핸드오프]) → §3 핸드오프 프로토콜.
> - **두 분기**: 🤖 에이전틱 툴(리포 통째로=실제 코드 정답지) / 💬 일반 LLM(MD 스펙 의존). 분기 B엔 "초보자에게 단계마다 설명하며 진행" 역할부여 블록 포함.
> - 옛 (B) AI Studio 경로는 "일반 LLM 분기"로 흡수됨(별도 03b 파일 없음). `guide/README.md`는 새 파일 가리키는 짧은 안내로 교체, 루트 README 링크 갱신.
> - ⚠️ 아래 1~2번·5번에서 언급하는 `01/02/03/03b` 파일은 **이제 존재하지 않음**(히스토리 기록용으로만 남김).

## 1. 지금까지 한 일

1. 원본에서 민감정보 제거 → 공개 데모 repo 생성·푸시 (히스토리 없음).
   - 제외: `CLAUDE.md`·`HANDOFF.md`(내부 노트), `samples/garmin_phone.jpg`(얼굴+GPS), `.env*`·`test-*.mjs`(원래 gitignore).
   - 치환: 실제 노션 DB ID·워크스페이스 URL·로컬 시크릿 경로 → env var/placeholder. 시크릿은 전부 `process.env`.
   - 추가: `README.md`, `.env.example`. 최종 스캔에서 실제 키/전화번호/이메일 0건.
2. 선생님용 **가이드북 `guide/`** 작성:
   - `README.md`(인덱스: 대상·준비물·읽는 순서)
   - `01-concepts.md`(개념 비유), `02-workflow.md`(아키텍처·파일별 역할·노션 데이터모델)
   - `03-tutorial.md` = **(A) 코딩 에이전트 경로**, `03b-tutorial-ai-studio.md` = **(B) 비코더/브라우저 경로**
3. 용어 통일: 노션 DB 행 = **"데이터베이스 페이지"** (사용자 지정). "줄"의 다른 의미(주다/코드 한 줄)는 보존.
4. (B)의 data_source_id 구하는 법을 **노션 GUI 방식**으로 교체:
   데이터베이스 옵션(⋯) → **데이터 소스 관리** → 출처 → 미트볼(⋯) → **데이터 소스 ID 복사**.
5. (B)에 "프롬프트로 직접 짜는 게 원래 방법, 저장소 코드 복붙은 편의" 명시 (STEP 1 = 길①/길②).
6. **리서치 후 (A)에 무료 코딩 에이전트로 Antigravity CLI 전면 배치** (아래 4번 참조).

## 2. 핵심 결정 (확정됨)

- **(A) 무료 에이전트 = Antigravity CLI를 앞세움.** 개인 구글계정 무료 + 로컬 파일 접근. 공식 <https://antigravity.google>.
- **(B) = 현행 유지** (우리 repo 코드 복붙 + GitHub 웹 업로드 + **Vercel** 배포). 01/02·repo와 일치 유지.
  → AI Studio Build→Cloud Run 전환은 **보류**(스택 React+Node/Cloud Run이 우리 repo(정적+Vercel)와 달라 가이드 일관성 깨짐).
- 가이드 따라하기 범위 = **입력 자동화(사진→노션→배포)** 까지. SMS 자동화(자동화 2)는 개념·구조만(02 심화절).

## 3. 리서치로 확인한 사실 (시한성 주의)

- **AI Studio 웹 = 로컬 파일 직접 접근 없음**(브라우저 전용). 편의기능(ZIP다운/GitHub푸시/Cloud Run 배포)은 *AI Studio 생성 코드 한정*.
- **Gemini CLI**: 개인 구글계정 무료(맞음). 그러나 **개인/AI Pro/Ultra 대상 2026-06-18 종료** → 후속 **Antigravity CLI**.
  (출처: developers.google.com/gemini-code-assist 릴리스노트, antigravity.google/docs/gcli-migration)
- 그래서 가이드는 Gemini CLI 대신 **Antigravity CLI**를 앞세우고 "6/18 종료" 주석만 달아둠.

## 4. ⚠️ 반드시 알아야 할 함정

- **이 디렉토리는 project-autopush 대상.** 작업 중 PreCompact 등으로 autopush가 떠 `feat/autosync-YYYYMMDD` 브랜치를 만들고
  **HEAD를 그쪽으로 바꾸며 public origin에 `git add -A` 푸시**함 (다른 PC `LAPTOP-BP1OMPKE` 포함).
  - → **명시적 산출물은 반드시 `main`에 커밋·푸시.** 작업 전 `git branch --show-current`로 main인지 확인.
  - → **내부 노트(HANDOFF 등)를 repo 디렉토리에 두지 말 것** (autopush가 공개 origin에 올림). 그래서 이 파일은 `/mnt/c/dev/notes/`에 있음.
- 커밋 시 작성자 식별자: `git -c user.name="1000ssam" -c user.email="slowly007@goedu.kr" commit ...` 형태로 줬음(전역 git identity 미설정 가능성).
- 푸시 거부(non-fast-forward) 나면 → autopush/다른 PC가 먼저 푸시한 것. **force 금지**, `git fetch && git rebase origin/main` 후 재푸시.

## 5. 열린 항목 (다음 세션 후보)

1. **autopush가 만든 `origin/feat/autosync-20260527` 공개 브랜치 정리** — 사용자 미결정. 옵션: ① 그 브랜치 삭제 ② 이 공개 repo를 autopush 대상에서 제외. (main이 기본이라 방문자 영향은 없음)
2. **가이드를 노션 페이지로 변환** — 선생님들에게 GitHub보다 친숙. (notion-pilot/ notion-to-docs 활용 제안한 바 있음)
3. **SMS 자동화(자동화 2) 따라하기** — 현재 개념·구조만. 풀 튜토리얼은 미작성(유료 Solapi 계정·발신번호·노션 웹훅 필요).
4. **LICENSE 파일** — README에 "학습용 공개"만 명시. 정식 라이선스(MIT 등) 추가 여부는 사용자 결정 대기.

## 6. 다음 세션 빠른 시작

```bash
cd /mnt/c/dev/notiontalk-running-challenge-demo
git branch --show-current      # main인지 확인 (autosync 브랜치면 git checkout main)
git fetch origin && git log --oneline -3 origin/main
ls guide/                      # 01~03b + README
```
- 가이드 수정 → main에 커밋(위 -c identity) → `git fetch && git rebase origin/main` → `git push origin main`.
- 메모리: `project_running-challenge-public-demo.md`에 정제규칙·용어·도구사실·autopush 주의 정리돼 있음.
