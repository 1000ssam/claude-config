# Threads 인사이트 스킬 — Handoff

## 완료 항목

### Meta 앱 설정
- 앱명: Threads Crawler (ID: 1280400260856279)
- 계정: @iooo_tttt (ID: 26984465234499801, 팔로워 5,304)
- 장기 토큰 발급 완료 (만료: 2026-05-22)
- Windows 작업 스케줄러 등록: 4주마다 월요일 09:13 자동 갱신

### 파일 구조
```
~/.claude/skills/
├── scripts/
│   ├── threads-api.mjs            # API 모듈 (프로필, 수집, 인사이트, 발행, 토큰갱신)
│   ├── threads-collect.mjs        # 일괄 수집 스크립트 (토큰 자동갱신 내장)
│   ├── threads-to-notion.mjs      # 노션 DB 업로드 (upsert + 미디어 + 타래)
│   └── threads-refresh-token.mjs  # 토큰 갱신 전용 (작업 스케줄러용)
├── threads-insights/
│   └── SKILL.md                   # 스킬 워크플로
└── secrets/
    └── threads-api.env            # 크리덴셜

C:\dev\threads-data/
├── posts/{YYYY-MM}.json           # 월별 게시물 + 인사이트
├── snapshots/{YYYY-MM-DD}.json    # 계정 인사이트 스냅샷
├── analysis/
│   ├── writing-style.md           # 글쓰기 스타일 프로필 (바이럴 패턴 포함)
│   └── latest-analysis.json       # (미생성, 스레드 분석 시 생성)
└── notion-config.json             # 노션 DB ID 저장
```

### 노션 DB
- DB ID: `4a832a15-26eb-464c-aa99-b5e67c8befe5`
- 위치: 2026 HOME 하위
- 속성: 제목, 날짜, 유형, 조회수, 좋아요, 답글, 리포스트, 참여율, 글자수, 타래수, 링크, 미디어, 요일, 시간대, 본문, 미디어파일
- 470개 게시물 업로드 완료 (미디어 265개 포함)

### 데이터 수집 범위
- 게시물: 1,294개 (원본 470 + 리포스트 824)
- 타래: 259개 (내 글에 내가 직접 단 댓글 + 이어쓴 체인)
- 기간: 2024-07 ~ 2026-03

### 스킬 커맨드
| 커맨드 | 설명 |
|--------|------|
| `스레드 수집` | 전체 수집 (토큰 자동갱신) |
| `스레드 업데이트` | 신규만 추가 |
| `스레드 분석` | 패턴 분석 |
| `스레드 스타일` | 글쓰기 스타일 학습 |
| `스레드 작성 [주제]` | 스타일 기반 초안 생성 |
| `스레드 발행` | 게시물 발행 |
| `스레드 노션` | 노션 DB upsert (미디어 포함) |
| `스레드 토큰` | 토큰 상태 확인/갱신 |

### 글쓰기 스타일 분석 결과 요약
- 톤: 친근한 존댓말 + 자기비하 유머 + 겸손한 자부심
- 구조: 한 줄에 한 의미, 짧은 호흡, 3~4줄마다 빈 줄
- 고성과: 개인 스토리 + 짧은 글(100~300자) + 유머 + 질문형 마무리
- 바이럴(1만뷰+): 공감/유머/일상이 압도적, 기술글은 "따라해봐" 구조일 때만 터짐
- 상세: `C:\dev\threads-data\analysis\writing-style.md`

### 타래 수집 로직
- `/me/replies`에서 전체 답글 수집
- `root_post`가 내 게시물이고, `replied_to`가 내 게시물 또는 내 답글인 경우만 타래로 판별
- 본문 속성에 `---` 구분 후 넘버링으로 합침

### 미디어 업로드 로직
- IMAGE: media_url 직접 업로드
- CAROUSEL: children 엔드포인트에서 개별 URL 수집 후 전부 업로드
- VIDEO: 20MB 초과 시 폴백 (미디어 없이 속성만 업데이트)
- 타래 미디어: 원본 미디어와 함께 한 속성에 합침
- Notion File Upload API 사용 (uploadFromUrl)

## 미완료 / 후속 과제
- `스레드 분석` 실행하여 시간대별/유형별 성과 분석
- 노션 DB 뷰 커스터마이징 (갤러리뷰, 차트뷰 등)
- 게시물 발행 테스트 (`threads_content_publish` 권한 추가 필요)
- 스킬 파일을 claude-skills 리포에 커밋
