# HANDOFF — document-organizer 스킬 대규모 리팩토링

**날짜:** 2026-03-19
**작업 디렉토리:** `C:\Users\user` (홈)
**스킬 디렉토리:** `C:\Users\user\.claude\skills\document-organizer`

## 완료된 작업

### 1. notion-api.mjs 공용 모듈 위임 (핵심 변경)

**Before:** `document-organizer/scripts/notion-api.mjs`가 자체 Notion API 구현 (330줄, 크레덴셜 로드, 페이지 생성, 중복 체크 등 모두 자체 구현)

**After:** 공용 `~/.claude/skills/scripts/notion-api.mjs` 모듈의 래퍼 (110줄)
- `bulkUpsert` 기반 등록 (동시성 15, 비고 필드 기반 upsert)
- `queryAll` 기반 기존 등록 조회 (`--list-existing`)
- `notion.prop.*`, `notion.block.*` 헬퍼 활용

### 2. Step 4-1 노션 기존 등록 필터링

**문제:** `--list-pdfs`가 목적지 폴더의 모든 PDF를 반환 → 이미 노션에 등록된 공문도 서브에이전트가 다시 읽음 (토큰 낭비)

**해결:** Step 4-1에서 `--list-existing` 실행 → 노션 Task DB(`by AI = true`)에서 비고 필드의 공문번호 숫자 추출 → PDF 목록 필터링

**정규식 주의점:** 비고 필드에 `인창고등학교-2243, 2844, 3060 | 마감일 재확인 요망` 같이 쉼표/슬래시로 여러 번호가 들어간 경우 대응:
```javascript
note.matchAll(/(?:[가-힣]+-|[,/]\s*)(\d{3,})/g)
```

### 3. Step 6-A 팔로우업 분리

**Before:** 필수 액션 + 팔로우업 모두 TASKS DB에 개별 태스크로 생성 (서브에이전트 3개)

**After:**
- **6-A-1 필수 액션:** TASKS DB에 `bulkUpsert` (서브에이전트 1개)
- **6-A-2 팔로우업:** 기존 페이지(`followup_page_id`)에 to_do 블록으로 추가 + 제목 날짜 멘션 업데이트

### 4. config.json 업데이트 (v1.2 → v1.3)

새 필드: `followup_page_id: "324dd1dcd644813d8521c44ecfa7c845"`

## 변경된 파일

| 파일 | 변경 |
|------|------|
| `document-organizer/scripts/notion-api.mjs` | 전면 교체 → 공용 모듈 래퍼 |
| `document-organizer/SKILL.md` | Step 4-1 필터링, Step 6-A 팔로우업 분리 |
| `document-organizer/config.json` | v1.3, `followup_page_id` 추가 |

## 남은 과제

### 레거시 비고 정규화 (선택)
이전 `_batch_register.mjs`로 등록한 항목들의 비고가 `인창고-XXXX` 축약형. 현재 `--list-existing`의 숫자 추출 정규식으로 대응하고 있지만, `_batch_register.mjs`가 사용한 DB와 현재 스킬이 사용하는 DB가 다를 수 있음 (`.env` vs `notion-credentials.md`). 확인 필요.

### `_batch_register.mjs` 삭제
`document-organizer/scripts/_batch_register.mjs`는 일회성 스크립트. 더 이상 불필요하므로 삭제 가능. `_check_schema.mjs`도 동일.

### 스킬 리포 커밋
`~/.claude/skills/` 리포에 이번 변경사항 커밋+푸시 필요 (test 브랜치).

## 테스트 결과

마지막 실행 (2026-03-19):
- 파일 정리: 폴더 2개 생성, 7개 이동, 54개 스킵
- 노션 필터링: 31 PDF 중 12개 기존 등록 스킵 → 19개 신규
- 제목 분류: 필수 6건, 팔로우업 13건
- 서브에이전트: 2개 (이전 4개에서 절반 감소)
- 팔로우업 블록 추가: 16개 블록 → 기존 페이지에 성공
- 제목 날짜 멘션: 2026-03-19 업데이트 성공
