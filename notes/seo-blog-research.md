# SEO Blog Research Summary: YouTube Scraper Skill

> 이 문서는 블로그 작성을 위한 리서치 요약본이다. 블로그 원고가 아님.

---

## 1. YouTube Scraper가 하는 일 (핵심 파이프라인)

**RSS Polling -> Transcript Extraction -> Notion DB Upsert**

1. **RSS 수신**: YouTube 채널의 공개 RSS 피드(`https://www.youtube.com/feeds/videos.xml?channel_id=...`)를 `curl`로 폴링하여 최신 영상 목록을 가져온다. XML을 정규식으로 파싱하여 `videoId`, `title`, `published`, `link`를 추출한다.
2. **날짜 필터링**: `--days N` 인자(기본 7일)에 따라 cutoff date 이전 영상을 제외한다.
3. **중복 대조**: Notion DB에 이미 존재하는 영상 제목과 비교하여 신규 영상만 처리한다 (title 기반 매칭).
4. **자막 추출**: `yt-dlp`로 한국어 자막(수동 + 자동 생성 포함)을 `json3` 포맷으로 다운로드. `events[].segs[].utf8`을 이어붙여 순수 텍스트 스크립트로 변환한다.
5. **로컬 백업**: `output/YYYY-MM-DD/{videoId}.md` 형태로 마크다운 파일 저장. 일자별 `index.md`도 생성.
6. **Notion DB Upsert**: `bulkUpsert` 함수로 title 기준 create/update 수행. 속성(제목, 영상ID, 채널, URL, 게시일)을 설정하고, 커버 이미지는 YouTube 썸네일(`maxresdefault.jpg`).
7. **페이지 본문 구성**: 영상 임베드 블록 + 토글 헤딩 H2("스크립트 전문") 안에 콜아웃 블록으로 자막 전문을 삽입. 2000자 제한 때문에 1900자 단위로 청크 분할한다.
8. **에러 알림**: Slack 봇 토큰이 설정되어 있으면 RSS 실패, 자막 추출 실패, Notion 업데이트 실패 시 `#자동화메시지` 채널에 알림 전송.

---

## 2. 8단계 스킬 워크플로 개요

스킬 파일(SKILL.md)은 Claude Code에게 대화형으로 아래 8단계를 순서대로 수행하도록 지시한다:

| 단계 | 이름 | 내용 |
|------|------|------|
| 0 | 환경 점검 | OS 감지(Linux/macOS/WSL), Node.js v18+, yt-dlp 설치 확인 |
| 1 | 프로젝트 폴더 생성 | 경로 확인, `package.json` + `.gitignore` 생성, npm install |
| 2 | Notion Integration 생성 | 사용자에게 https://notion.so/profile/integrations 안내, 토큰을 `.env`에 저장 |
| 3 | Notion DB 설정 | **3가지 분기**: A) 자동 생성, B) 템플릿 복제, C) 기존 DB 사용 |
| 4 | 채널 등록 | YouTube 채널 URL/ID를 받아 `channels.json` 생성. @handle 형식은 curl로 channelId 추출 |
| 5 | Slack 알림 (선택) | 사용 여부에 따라 코드에 Slack 함수 포함/제거 결정 |
| 6 | 코드 생성 | `lib/notion.mjs`, `scrape.mjs`, `.env.example`, `run.sh` 생성 |
| 7 | 테스트 실행 | `node scrape.mjs --days 7`로 E2E 검증 |
| 8 | 스케줄링 | OS별 분기 - Windows: Task Scheduler(PowerShell), macOS: launchd(plist), Linux: crontab |

**키포인트**: 사용자는 "유튜브 스크래퍼 만들어줘"라고 말하면 0단계부터 8단계까지 대화형으로 진행된다. 코드를 직접 작성할 필요 없이 질문에 답하기만 하면 완성된다.

---

## 3. 핵심 기술 아키텍처

### 런타임 & 의존성
- **Node.js** (ESM, `"type": "module"`)
- **의존성**: `dotenv` (^17.4.2)만 npm 패키지로 사용. 나머지는 Node 내장(`fs`, `child_process`, `path`, `url`) + native `fetch`.
- **yt-dlp**: 시스템 바이너리로 설치 (pip). `--write-sub --write-auto-sub --skip-download --sub-lang ko --sub-format json3` 옵션 조합.

### Notion API 2026-03-11 특이사항
- **DB ID -> Data Source ID 변환 필수**: `GET /databases/{id}` -> `data_sources[0].id` 추출 -> `POST /data_sources/{dsId}/query`로 쿼리. 캐시 Map으로 반복 변환 방지.
- **`POST /databases`가 properties를 무시**: DB 생성 시 properties를 전달해도 적용되지 않음. 우회: DB 생성 -> dsId 추출 -> `PATCH /data_sources/{dsId}`로 properties 추가 (2단계 생성).
- **429 Rate Limit 재시도**: `withRetry` 래퍼로 1초 대기 후 최대 2회 재시도.
- **createPage 404 폴백**: `database_id`로 실패하면 `data_source_id`로 재시도.

### appendBlocks 패턴 (레이아웃 제어의 핵심)
- `appendBlocks(parentPageId, children)` = `PATCH /blocks/{id}/children`
- **생성 순서 = Notion UI 표시 순서**: 자식 리소스(child_page, child_database)는 생성 시점에 부모 페이지 끝에 추가됨
- 부모 페이지 레이아웃 생성 순서: H3 헤딩 -> 스킬 프롬프트 페이지(child_page) -> 토글(사용법) + 디바이더 -> DB(child_database)
- 영상 페이지 본문 구조: video 임베드 -> H2 토글("스크립트 전문") -> 콜아웃(자막 텍스트 청크들)

### bulkUpsert 로직
- queryAll로 DB 전체 페이지 로드 -> matchKey(제목) 기준 Map 캐시 -> create/update 분기
- concurrency 15로 `Promise.allSettled` 청크 처리
- 진행 상황 콜백(`onProgress`) 지원

### 마크다운 API
- `GET /pages/{id}/markdown` / `PATCH /pages/{id}/markdown` (replace_content 타입)
- 본문 초기화에 사용: `updatePageMarkdown(pageId, '')` -> 이후 `appendBlocks`로 구조적 블록 삽입
- **한계**: `<page>`, `<database>` 마크다운 태그는 읽기 전용. 쓰기에 사용하면 기존 자식 리소스 삭제 충돌 발생.

---

## 4. DB 구성 3가지 옵션 (3단계 분기)

### A) 자동 생성 (원클릭)
- **편의성**: 가장 편함. API로 DB + 스킬 프롬프트 페이지를 자동 생성.
- **뷰/필터**: 기본 테이블뷰만 제공. 갤러리뷰/정렬/필터는 사용자가 직접 설정.
- **프롬프트**: Notion AI 스킬 프롬프트 페이지 자동 생성 + 사용법 토글 포함.
- **추천 대상**: 빠르게 시작하고 싶은 분.
- **생성되는 Notion 구조**:
  ```
  [부모 페이지]
  ├── ### 영상과 스크립트를 수집한 후 아래 스킬을 발동시키면 더욱 좋습니다 :)
  ├── [SKILL]_유튜브_콘텐츠_요약    (AI 스킬 프롬프트)
  ├── ▶ 스킬 사용 방법              (토글 H4)
  ├── ─────────────────             (디바이더)
  └── YouTube 요약                  (DB, 이모지: 🎬)
  ```

### B) 템플릿 복제
- **편의성**: 링크 복제 + Integration 수동 연결.
- **뷰/필터**: 커스텀 뷰, 필터, 정렬 포함된 완성형.
- **프롬프트**: 포함됨.
- **추천 대상**: 완성형 원하는 분.
- **템플릿 URL**: `https://ioooss.notion.site/Youtube-148dd1dcd64483ab89ba0199271a43b4`

### C) 기존 DB 사용
- **편의성**: URL 입력 + 스키마 자동 검증.
- **뷰/필터**: 사용자 기존 설정 유지.
- **프롬프트**: 없음 (별도 생성 안 함).
- **추천 대상**: 이미 DB가 있는 분.
- **필수 속성 검증**: 제목(title), 영상ID(rich_text), 채널(select), URL(url), 게시일(date), by AI(checkbox). 나머지(조회수, 좋아요, 요약, 태그)는 선택.
- **Data Source API로 스키마 검증**: `GET /databases/{id}` -> `GET /data_sources/{dsId}` -> properties 확인.

### DB 스키마 (전체)
```
제목      - title
영상ID    - rich_text
채널      - select
URL       - url
게시일    - date
조회수    - number (number_with_commas)
좋아요    - number (number_with_commas)
요약      - rich_text
태그      - multi_select (AI, 개발, 비즈니스, 마케팅, 생산성, 교육)
보정 및 요약 - checkbox
```

---

## 5. Notion AI 스킬 프롬프트 (콘텐츠 요약)

자동 생성(A) 또는 템플릿 복제(B) 선택 시, `[SKILL]_유튜브_콘텐츠_요약`이라는 제목의 하위 페이지가 함께 생성된다. 이 페이지는 Notion AI 채팅에서 @멘션하거나 본문을 복사해서 사용한다.

### 프롬프트 구조 (4단계)

| 단계 | 작업 | 세부 |
|------|------|------|
| 0 | 맥락 수집 | 영상 제목, 채널명, 스크립트 전문 확인. 분야(역사, IT, 교육 등) 추론. 하드코딩 금지. |
| 1 | 오탈자 보정 | STT 오류 패턴 식별: 고유명사 오변환, 일반 어휘 오탈자, 숫자 오류. 맥락으로 특정 불가한 항목은 보류+보고. |
| 2 | 스크립트 요약 | 화제 전환 지점(시간/장소/논점/주체 전환)으로 단락 분할. 핵심 주장 + 근거 개조식. 팩트(고유명사/숫자/연도) 보존. |
| 3 | 페이지 삽입 | 기존 "스크립트" 토글 아래에 `## 스크립트 요약` 토글 헤딩 추가. 콜아웃 안에 소제목+불렛 구조. |
| 4 | 속성 업데이트 | `보정 및 요약` 체크박스를 true로 변경. |

### 사용 방법 (사용자 안내)
- **방법 1**: 스킬 페이지 본문 복사 -> 스크랩된 페이지에서 Notion AI 채팅에 붙여넣기
- **방법 2**: 스크랩된 페이지에서 Notion AI 채팅에 @멘션으로 스킬 페이지 첨부 -> "이 지침대로 작업해줘"

### 주의사항
- 화자의 의도적 표현(사투리, 조어)을 오탈자로 오인하지 않도록 주의
- 요약/발문 개수 하드코딩 금지 -- 콘텐츠 밀도에 따라 자율 판단
- 스크립트가 없는 페이지에는 적용 불가

---

## 6. 블로그에 활용할 개발 인사이트

### 6-1. Notion API 2026-03-11에서 발견한 5가지 제한사항

1. **`updatePageMarkdown`의 자식 삭제 충돌**: 마크다운 API로 페이지 내용을 쓸 때 `<page>`, `<database>` 태그를 사용하면 기존 자식 리소스가 삭제됨. 읽기 전용 태그를 쓰기에 사용하면 충돌 발생.
2. **블록 중첩 깊이 제한 (3레벨)**: Notion API는 블록 중첩을 3단계까지만 허용. 토글 > 콜아웃 > 단락 구조에서 한계에 도달.
3. **블록 순서 = 생성 순서**: `appendBlocks`로 추가한 블록은 항상 부모 끝에 배치됨. child_page/child_database도 마찬가지. UI 레이아웃은 생성 순서로만 제어 가능.
4. **inline DB 생성 불가**: API로는 full-page DB만 생성 가능. inline DB를 원하면 수동 설정 필요.
5. **`POST /databases`가 properties 무시**: DB 생성 시 properties 파라미터가 적용되지 않음. Data Source API(`PATCH /data_sources/{dsId}`)로 별도 추가해야 함.

### 6-2. 레이아웃 3회 반복(iteration) 과정

| 버전 | 구조 | 결과 |
|------|------|------|
| v1 | 콜아웃 + link_to_page | API 제한으로 실패. link_to_page는 block 전용이고 콜아웃 내부에 child_page/child_database 배치 불가. |
| v2 | 토글 H3 안에 모든 요소 중첩 | 기술적으로 가능하지만 UX 어색. 정보가 토글 뒤에 숨겨져 발견성 저하. |
| v3 (확정) | H3 + 스킬페이지 + 토글(사용법) + 디바이더 + DB를 평탄하게 나열 | API 제한을 수용하고 단순화. "appendBlocks 순서 = UI 순서" 원칙 활용. |

**교훈**: "API 한계를 수용하고 단순화하는 것"이 가장 좋은 디자인 결정이었다.

### 6-3. RSS 피드 미스터리

- 개발 1세션에서 같은 채널(함께하는세계사)의 RSS가 12회 이상 0개 반환.
- 크론 5분 간격 모니터링까지 설정했지만 계속 0개.
- 다음 세션(수 시간 후)에서 갑자기 복구, 10개 영상 정상 수신.
- **교훈**: YouTube RSS는 간헐적으로 빈 응답을 반환할 수 있다. 스크래퍼 코드 자체의 버그가 아닐 수 있으므로, 시간을 두고 재시도하는 것이 중요.

### 6-4. E2E 시뮬레이션 검증 방식

- 스킬 완성 후 `/mnt/c/dev/yt-sim-test/`에 완전히 빈 폴더를 만들고, 스킬 워크플로 0단계~7단계를 실제 실행.
- Notion 워크스페이스에 자동 생성된 구조(H3, 스킬 페이지, 토글, DB) 확인.
- 스크래퍼 실행 -> RSS 수신 -> 자막 추출 -> Notion 업서트 전체 정상 동작 확인.
- 시뮬레이션 후 모든 테스트 리소스(Notion 페이지, 로컬 폴더) 정리.
- **교훈**: "작동하는 스킬"과 "작동한다고 믿는 스킬"의 차이. 실제 빈 환경에서 돌려봐야 누락된 단계나 암묵적 가정을 발견할 수 있다.

### 6-5. 스킬 설계 철학

- **코드 템플릿 전문 포함**: 스킬 파일(SKILL.md) 안에 `lib/notion.mjs`, `scrape.mjs`, `run.sh`, `register-task.ps1`, `com.youtube-scraper.plist` 전체 코드가 부록으로 포함됨. 외부 의존 없이 독립 실행 가능.
- **사용자 입력은 런타임 설정으로 분리**: `.env`(토큰), `channels.json`(채널 목록), CLI 인자(`--days`, `--channel`, `--no-notion`). 스크립트 코드 수정이 필요한 경우는 Slack 제거 시만.
- **적정 엔지니어링**: Node.js/yt-dlp는 패키징하지 않고 0단계에서 안내만. npm 의존성은 `dotenv` 하나만. YouTube Data API 대신 무료 RSS 피드 사용.

---

## 7. 배포 방법

### 배포 리포지토리
- **GitHub**: `1000ssam/skills-for-teachers` (public repo)
- **브랜치**: main
- **커밋**: `c55f867`
- **경로**: `skills/youtube-scraper-setup/`

### 배포 폴더 구조
```
skills/youtube-scraper-setup/
├── SKILL.md       # 스킬 본문 (8단계 워크플로 + 코드 템플릿 부록 전문, ~1000줄)
├── README.md      # 설치 안내 + 기능 소개 + 파일 구조 설명
├── install.sh     # macOS/Linux 원클릭 설치 (curl | bash)
└── install.ps1    # Windows 원클릭 설치 (irm | iex)
```

### 설치 방법

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/1000ssam/skills-for-teachers/main/skills/youtube-scraper-setup/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/1000ssam/skills-for-teachers/main/skills/youtube-scraper-setup/install.ps1 | iex
```

### 설치 스크립트 동작
1. `~/.claude/skills/` 디렉토리 생성
2. GitHub에서 리포 ZIP 다운로드
3. `SKILL.md`를 `~/.claude/skills/youtube-scraper-setup.md`로 복사
4. 임시 파일 정리
5. 다음 단계 안내 출력 (Node.js, yt-dlp, Notion Integration 확인)

### 수동 설치
`SKILL.md`를 다운로드하여 `~/.claude/skills/youtube-scraper-setup.md`로 저장.

---

## 8. 생성되는 프로젝트 파일 구조

```
your-project/
├── lib/
│   └── notion.mjs        # Notion API 헬퍼 (2026-03-11, ~200줄)
├── scrape.mjs             # 메인 스크래퍼 (~390줄)
├── channels.json          # 구독 채널 목록 [{id, name}]
├── run.sh                 # 실행 래퍼 (로그 포함)
├── register-task.ps1      # Windows Task Scheduler 등록
├── .env                   # 토큰 (NOTION_TOKEN, NOTION_DB_ID, SLACK_BOT_TOKEN)
├── .env.example
├── .gitignore
├── package.json           # dotenv만 의존
└── output/                # 로컬 마크다운 백업
    └── YYYY-MM-DD/
        ├── index.md       # 일자별 수집 요약
        └── {videoId}.md   # 영상별 메타데이터 + 자막
```

---

## 9. 추가 참고 사항

### 타겟 독자 (HANDOFF에서 발췌)
- Notion 크리에이터
- Claude Code 사용자
- AI 자동화에 관심 있는 교사/직장인

### 톤/스타일
- LLM 범용 표현
- 기술 용어는 설명 포함
- curl 예시 같은 실용적 코드 포함
- 이전 SEO 글 참고: Notion-guide-Posts DB, 페이지 ID `328dd1dcd64481c2b0dfe9745a2cd73e`

### 발행 위치
- Notion-guide-Posts DB (마크다운 API로 발행 예정)

### 핵심 결정사항 요약 (블로그에서 언급할 만한 것들)
- Notion 레이아웃에 콜아웃 사용하지 않음 (API 제한 + 불필요한 복잡도)
- Node.js/yt-dlp는 패키징하지 않음 (적정 엔지니어링)
- 퍼블릭 리포 대신 공유 스킬로 배포 (보안 검토 후 결정)
- YouTube Data API 대신 RSS 피드 (API 키 불필요, 무료, 충분)
