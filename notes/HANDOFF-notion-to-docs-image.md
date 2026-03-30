# HANDOFF — notion-to-docs 이미지/타이틀 개선

> 작성: 2026-03-29

## 완료된 작업

### 1. 이미지 전처리 파이프라인 (`image-utils.js` 신규)
- **문제**: Google Docs API가 S3 signed URL HEAD 요청 차단 + webp 미지원
- **해결**:
  - GET+Range로 접근 체크 (HEAD 대신)
  - webp/tiff/avif/heic → sharp로 jpg 변환 → Google Drive 임시 업로드 → Drive URL로 삽입
  - 접근 불가 이미지는 `[📷 이미지]` 플레이스홀더 대체
  - 변환 완료 후 임시 Drive 파일 자동 삭제

### 2. 타이틀 자동 삽입
- **notion-reader.js**: title 속성 자동 탐색 (`type === 'title'` 기준, 속성명 무관)
- **convert.js**: 페이지 타이틀을 Google Docs 문서명 + 본문 최상단 H1으로 삽입
- **markdown-parser.js**: `makeTitleBlock()` 헬퍼 추가

### 3. 양쪽 프로젝트 동기화 완료
- `~/dev/notion-to-docs` (원본)
- `~/dev/skills-for-teachers/skills/notion-to-docs` (공유용)

## 변경 파일

### ~/dev/notion-to-docs
| 파일 | 상태 |
|---|---|
| `image-utils.js` | 신규 |
| `convert.js` | 수정 (import, preprocessImages, makeTitleBlock, cleanup) |
| `request-builder.js` | 수정 (image case: _accessible 플래그 분기) |
| `notion-reader.js` | 수정 (title 자동 탐색) |
| `markdown-parser.js` | 수정 (makeTitleBlock export) |

### ~/dev/skills-for-teachers/skills/notion-to-docs
| 파일 | 상태 |
|---|---|
| `scripts/image-utils.js` | 신규 |
| `scripts/convert.js` | 수정 |
| `scripts/request-builder.js` | 수정 |
| `scripts/notion-reader.js` | 수정 |
| `scripts/markdown-parser.js` | 수정 |
| `scripts/package.json` | 수정 (sharp 의존성 추가) |
| `SKILL.md` | 수정 (타이틀/이미지 처리 섹션) |

### 스킬 파일
- `~/.claude/skills/notion-to-docs.md` — 타이틀/이미지 처리 섹션 추가

## 미커밋 상태
- 양쪽 프로젝트 모두 커밋/푸시 안 됨

## 테스트 결과
- 노션 페이지 `32ddd1dcd644815792dddadd35c0cf2b` 변환 3회 성공
- 이미지 12/12 삽입 (webp 1개 jpg 변환 포함)
- 타이틀 정상: 문서명 + 본문 H1 모두 적용

## 후속 작업 (선택)
- 공유 스킬 리포 커밋/푸시
- skills-for-teachers 사용자는 `cd scripts && npm install` 필요 (sharp)
