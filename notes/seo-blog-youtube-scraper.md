---
title: "YouTube 자막 자동 수집 + Notion 정리, Claude Code 스킬로 세팅하는 방법"
meta_title: "YouTube 자막 자동 수집 Notion 정리 - Claude Code 스킬 가이드 | 노션톡"
meta_description: "YouTube 영상 자막을 자동 수집해 Notion DB에 정리하고 싶다면? Claude Code 스킬 하나로 코드 없이 대화만으로 완성하는 방법을 단계별로 안내합니다."
slug: youtube-scraper-claude-skill
keywords:
  - YouTube 자막 자동 수집
  - Notion 정리
  - Claude Code 스킬
date: 2026-04-19
---

<callout icon="📌" color="blue_bg">

**YouTube 영상을 볼 때마다 자막을 복사해서 Notion에 붙여넣고 계신가요?**

채널 RSS 피드를 감시하고, 자막을 자동으로 뽑아서, Notion DB에 정리까지 해주는 스크래퍼를 Claude Code 스킬 하나로 세팅할 수 있습니다. 코드를 직접 작성할 필요 없이, 대화만으로 8단계 워크플로를 따라가면 완성됩니다.

---

**이 글에서 배울 내용** ⏳ `읽기 6분`
- YouTube 자막 자동 수집 파이프라인이 어떻게 작동하는지
- Node.js + yt-dlp + Notion API로 구성된 아키텍처의 핵심 구조
- Claude Code 스킬을 통한 8단계 대화형 세팅 방법
- 원클릭 설치 스크립트로 바로 시작하는 방법

</callout>

# YouTube 스크래퍼가 하는 일

이 스크래퍼의 파이프라인은 세 단계로 요약됩니다.

**RSS 수신 → 자막 추출 → Notion DB 업서트**

1. YouTube 채널의 공개 RSS 피드를 폴링해서 최신 영상 목록을 가져옵니다.
2. yt-dlp(자막 추출 도구)로 한국어 자막을 텍스트로 변환합니다.
3. Notion DB에 영상 정보와 자막 전문을 자동 저장합니다.

한번 세팅해두면 매일 자동으로 돌아갑니다. 새 영상이 올라오면 Notion에 알아서 쌓이고, 이미 수집한 영상은 건너뜁니다. YouTube Data API 키도 필요 없습니다. 공개 RSS 피드를 사용하니까요.

## Notion에 저장되는 결과물

각 영상은 Notion DB에 하나의 페이지로 생성됩니다. 썸네일이 커버 이미지로 설정되고, 페이지 안에는 영상 임베드와 함께 자막 전문이 토글 안에 정리됩니다.

DB 속성으로는 제목, 영상 ID, 채널명, URL, 게시일 등이 자동으로 채워집니다. 갤러리 뷰로 전환하면 채널별로 영상을 한눈에 훑어볼 수 있습니다.

## Notion AI 스킬 프롬프트

스크래퍼와 함께 Notion AI용 요약 스킬 프롬프트도 생성됩니다. 수집된 자막 페이지에서 이 스킬을 실행하면:

- STT(음성 인식) 오탈자를 맥락에 맞게 보정하고
- 화제 전환 지점을 기준으로 단락을 나눠 요약하고
- 요약 결과를 같은 페이지에 토글로 삽입합니다

수집만으로 끝나지 않고, 정리까지 이어지는 구조입니다.

# 작동 원리

## 기술 스택

스크래퍼는 의외로 가벼운 구성입니다.

- **Node.js** (ESM 모듈): 메인 런타임
- **yt-dlp**: 자막 추출 전용 CLI 도구 (pip으로 설치)
- **Notion API (2026-03-11)**: DB 생성, 페이지 생성, 블록 추가
- **npm 의존성**: `dotenv` 하나뿐

YouTube Data API를 사용하지 않는 이유는 간단합니다. RSS 피드로 영상 목록을 가져오는 것만으로 충분하고, API 키 발급이나 할당량 걱정이 없기 때문입니다.

## 핵심 패턴 3가지

### 1. bulkUpsert — 중복 없는 저장

DB에 이미 있는 영상인지 제목 기준으로 확인하고, 새 영상만 생성(create), 기존 영상은 갱신(update)합니다. 동시 처리 수를 15로 제한해서 Notion API 속도 제한(Rate Limit)에 걸리지 않도록 합니다.

### 2. appendBlocks — 페이지 본문 구성

Notion API에서 블록 추가 순서가 곧 UI 표시 순서입니다. 이 원칙을 활용해서 영상 임베드 → 토글 헤딩("스크립트 전문") → 자막 텍스트 순서로 본문을 구성합니다. 자막이 길면 2,000자 제한 때문에 1,900자 단위로 청크를 나눠서 삽입합니다.

### 3. 로컬 백업

Notion에 저장하는 것과 별개로, `output/YYYY-MM-DD/` 폴더에 마크다운 파일로도 백업합니다. Notion이 일시적으로 안 되더라도 자막 데이터는 남아 있습니다.

<callout icon="💡" color="green_bg">

**RSS 피드가 비어 있을 때는?** YouTube RSS는 간헐적으로 빈 응답을 반환하는 경우가 있습니다. 스크래퍼 버그가 아니라 YouTube 서버 측 일시 현상이므로, 시간을 두고 재실행하면 정상 수신됩니다.

</callout>

# Claude Code 스킬로 세팅하기

이 스크래퍼는 Claude Code 스킬로 배포됩니다. "스킬"이란 Claude Code에게 특정 작업을 수행하는 방법을 알려주는 마크다운 파일입니다. `~/.claude/skills/` 폴더에 넣어두면, Claude Code가 대화 중에 자동으로 참조합니다.

## 8단계 대화형 워크플로

스킬을 설치한 뒤 Claude Code에게 **"유튜브 스크래퍼 만들어줘"**라고 말하면, 아래 8단계가 대화형으로 진행됩니다.

| 단계 | 내용 | 사용자가 할 일 |
|------|------|----------------|
| 0 | 환경 점검 (Node.js, yt-dlp) | 없음 (자동 확인) |
| 1 | 프로젝트 폴더 생성 | 경로 확인만 |
| 2 | Notion Integration 생성 | 토큰 붙여넣기 |
| 3 | Notion DB 설정 | A/B/C 중 선택 |
| 4 | 채널 등록 | YouTube 채널 URL 입력 |
| 5 | Slack 알림 설정 | 사용 여부 선택 |
| 6 | 코드 생성 | 없음 (자동) |
| 7 | 테스트 실행 | 결과 확인 |
| 8 | 스케줄링 | OS에 맞게 자동 등록 |

코드를 한 줄도 직접 작성하지 않습니다. Claude Code가 스킬 파일에 포함된 코드 템플릿을 기반으로 프로젝트 전체를 생성합니다.

## DB 설정 3가지 옵션 (3단계)

3단계에서 Notion DB를 어떻게 준비할지 선택합니다.

### A) 자동 생성

가장 빠른 방법입니다. API로 DB와 스킬 프롬프트 페이지를 한 번에 만들어줍니다. 기본 테이블 뷰만 제공되므로, 갤러리 뷰나 필터는 직접 설정해야 합니다.

### B) 템플릿 복제

미리 만들어둔 Notion 템플릿을 복제하는 방식입니다. 커스텀 뷰, 필터, 정렬이 포함된 완성형이라 바로 쓸 수 있습니다. 복제 후 Integration을 수동으로 연결하는 단계만 필요합니다.

### C) 기존 DB 사용

이미 YouTube 자료를 모아둔 DB가 있다면 그대로 활용합니다. 필수 속성(제목, 영상ID, 채널, URL, 게시일)이 있는지 자동으로 검증해주고, 없는 속성은 안내해줍니다.

<callout icon="💡" color="green_bg">

**어떤 옵션을 고를까?** 처음 시작한다면 A(자동 생성)가 가장 간편합니다. Notion을 꼼꼼하게 세팅해서 쓰고 싶다면 B(템플릿 복제)를 추천합니다.

</callout>

## 스케줄링 (8단계)

세팅이 끝나면 OS에 맞는 자동 실행을 등록합니다.

- **Windows**: Task Scheduler (PowerShell 스크립트로 등록)
- **macOS**: launchd (plist 파일 생성)
- **Linux**: crontab

한번 등록하면 매일 지정한 시간에 자동으로 새 영상을 수집합니다.

# 설치 방법

## 원클릭 설치

터미널에 아래 명령어 하나만 실행하면 스킬 파일이 `~/.claude/skills/`에 설치됩니다.

**macOS / Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/1000ssam/skills-for-teachers/main/skills/youtube-scraper-setup/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/1000ssam/skills-for-teachers/main/skills/youtube-scraper-setup/install.ps1 | iex
```

설치 스크립트가 하는 일:
1. `~/.claude/skills/` 디렉토리 생성
2. GitHub에서 스킬 파일 다운로드
3. `youtube-scraper-setup.md`로 저장
4. 다음 단계 안내 출력

## 수동 설치

GitHub 저장소에서 `SKILL.md` 파일을 직접 다운로드한 뒤, `~/.claude/skills/youtube-scraper-setup.md`로 저장하면 됩니다.

저장소 경로: [skills-for-teachers/skills/youtube-scraper-setup/](https://github.com/1000ssam/skills-for-teachers/tree/main/skills/youtube-scraper-setup)

<callout icon="⚠️" color="orange_bg">

**사전 준비물**
- **Node.js v18 이상**: 스크래퍼 실행에 필요합니다
- **yt-dlp**: 자막 추출 도구입니다 (`pip install yt-dlp`로 설치)
- **Notion Integration 토큰**: [notion.so/profile/integrations](https://notion.so/profile/integrations)에서 생성합니다
- **Claude Code**: 스킬을 실행할 Claude Code CLI가 설치되어 있어야 합니다

</callout>

## 설치 후 시작하기

Claude Code를 열고 **"유튜브 스크래퍼 만들어줘"**라고 말하면 됩니다. 환경 점검부터 테스트 실행까지 대화로 안내받으면서 진행할 수 있습니다.

<callout icon="📝" color="blue_bg">

**핵심 정리**
- YouTube RSS → yt-dlp 자막 추출 → Notion DB 자동 저장, 세 단계 파이프라인
- Claude Code 스킬로 코드 작성 없이 대화만으로 세팅 완료
- DB는 자동 생성 / 템플릿 복제 / 기존 DB 중 선택
- Notion AI 스킬 프롬프트로 수집 후 오탈자 보정 + 요약까지 자동화
- 원클릭 설치 스크립트로 1분 만에 시작 가능

</callout>
