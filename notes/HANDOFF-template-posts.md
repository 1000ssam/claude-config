# HANDOFF — 1000쌤 템플릿 소개 SEO 포스트 작성 원칙

> 작성: 2026-05-05 / 다음 세션에서 이어 작업.

---

## 1. 작업 컨텍스트

- **노션 DB**: 노션톡 templates DB (`2f4dd1dc-d644-8156-b573-d8a469a8162a`)
- **DS ID**: `2f4dd1dc-d644-81cf-847a-000b93ab3d6d`
- **목적**: 1000쌤이 노션 마켓에 올린 22개 템플릿 각각에 대한 SEO 블로그 포스트 운영
- **Author 매핑**:
  - 1000쌤: `2f4dd1dc-d644-8110-b8b7-ef4350a25149` (메인)
  - 곰곰이쌤: `2f4dd1dc-d644-8104-9aa9-f6593346279f` (점검 시 항상 제외)
  - 케미가체질: `2f4dd1dc-d644-8160-a4c6-d98ded816849` (게스트)

---

## 2. 톤 정책 (확정)

- **v1 기계적 SEO 스타일이 디폴트** — 사용자 결정
- 본인 톤(스레드 기반 1000쌤 voice)은 **사용자가 직접 다듬는 단계**로 분리. AI는 메타·구조까지만 도출
- 메모리 참조: `feedback_seo-blog-human-led.md`
- `seo-blog-writer` 스킬은 절대 톤 수정 금지 (그대로 유지)

---

## 3. 메타 작성 원칙

| 필드 | 규칙 |
|---|---|
| Post Title | 30-60자, 키워드 앞쪽, 검색 의도 반영 |
| Meta Title | 35-60자, `[키워드] - [부가 설명] \| 노션톡` 구조. 한국어는 짧게(35-40자)도 OK — SERP 컷오프 안 됨 |
| Meta Description | 한글 70-85자, **Pain → Solution → CTA** 순서. 가이드는 70-80자지만 SERP 컷오프 내에서 약간 길어도 무방 |
| Slug | 영문 소문자, 하이픈, **마켓 슬러그와 일치시킴 (중요)** |
| Author | 항상 1000쌤 (게스트는 별도) |
| Date | 마켓 `last_updated_at` 권장 (검색엔진 최신성 우선) |
| Featured | false (수동 발행) |
| Publish | false (사용자 검토 후 수동 true) |

**오타 사전 점검**: 메타 작성 후 본문에 등장하는 "온온한", "모은세요", "흔어져" 류의 오타가 메타에도 들어가는 일이 잦음. 발행 전 한 번 더 그렙.

---

## 4. 본문 표준 구조 (5섹션)

```
[1] 통합 스니펫 콜아웃  (📌 blue_bg)
    - Pain point 질문 hook
    - 해법 2-3문장
    - 📚 이 글에서 다룰 내용 (목차 3-5)
    - ⏳ 읽기 N분

[2] 기본 정보 박스  ← 이번 세션에서 표준화한 형식
    # [템플릿명] 템플릿이란?
    한 줄 소개 (NEXT_DATA description 첫 문장)
    - **제작자**: 1000쌤
    - **가격**: 무료 / $X
    - **카테고리**: cat1 · cat2 · ...
    - (선택) **구성**: ...
    - **마켓**: [노션 마켓플레이스](URL) [· [쌤동네](URL)]
    - (선택) **등록일 / 업데이트일**: ← 마켓 화면엔 안 보이는 차별 정보

[3] 본문 H1 (3-5개)
    - 페인포인트 → 가치 제안
    - 핵심 기능 (H2 서브섹션)
    - 이런 분께 추천
    - 시작하는 법

[4] 인라인 콜아웃 (선택, 1-2개만)
    💡 green_bg : 팁/추천
    ⚠️ orange_bg : 주의/한계 (예: 노션 AI 활성화 필요, 무료 플랜 제한)

[5] 핵심 정리 콜아웃  (📝 blue_bg)
    - 4-6 불릿
    - 마지막 줄에 "마켓 링크에서 복제하세요 (가격 명시)"
```

**콜아웃 색상은 4종만**: blue_bg, green_bg, orange_bg, blue_bg(📝). `purple_bg` 같은 거 발견하면 blue_bg로 통일.

---

## 5. 데이터 소스 우선순위

1. **NEXT_DATA** (가장 정확) — `/tmp/creator-data.json`
   - 재추출: `curl -sL https://www.notion.com/ko/@1000 -H "User-Agent: Mozilla/5.0" -o /tmp/creator.html` → `__NEXT_DATA__` 추출
   - 필드: `name, slug, description, price, categories[], created_at, last_updated_at, attributes.purchase_url, attributes.serialized_body`
2. **쌤동네 페이지** (유료 템플릿) — `attributes.purchase_url`
   - 원화 가격, 협력 작가, 이용 기간, 업데이트 안내
3. **DB 기존 페이지 본문** — 사용자가 직접 쓴 어조·디테일 참고
4. **WebFetch 마켓 페이지** — SPA라 한계. NEXT_DATA가 항상 우선
5. **마켓 화면 visible 정보 vs HTML 데이터**:
   - 마켓 페이지에 등록일 표시 안 됨
   - 업데이트일은 i18n 버그로 "56년 전" 깨져 표시 (노션 측 버그)
   - 정확한 날짜는 NEXT_DATA 까야 보임 → **블로그 본문에 명시하면 차별점**

---

## 6. 금지 사항

- ❌ 본문 덮어쓰기 (사용자 명시) — 새 페이지 또는 블록 추가만
- ❌ "무료" 표기 시 NEXT_DATA `price` 확인 누락 — 어제 일괄 작성 시 일부 글 가격 표기 오류 발생 가능성
- ❌ 셀프 북마크 같은 무의미 블록 무시 — 의도 확인 후 보존/제거
- ❌ 사용자 직접 작성한 본문 톤 갈아엎기 (정보 박스만 추가하는 식 최소 변경)

---

## 7. 노션 API 함정 (이번 세션에서 발견)

### `after` 파라미터 deprecated
```js
// ❌ 옛 방식 (400 error in 2026-03-11)
{ children: [...], after: blockId }

// ✅ 새 방식
{ children: [...], position: { type: 'after_block', after_block: { id: blockId } } }
{ children: [...], position: { type: 'start' } }   // 페이지 최상단
{ children: [...], position: { type: 'end' } }     // 기본값
```

### 마크다운 쓰기 한계
- `bookmark`, `embed`, `synced_block` 은 마크다운으로 못 만듦
- `updatePageMarkdown()`은 본문 **전체 교체** → bookmark 사라짐
- 부분 추가/유지가 필요하면 **블록 API + position 파라미터** 사용

### rich_text 직접 구성 (블록 API 사용 시)
```js
function rt(text, opts = {}) {
  const obj = { type: 'text', text: { content: text } };
  if (opts.bold) obj.annotations = { bold: true };
  if (opts.link) obj.text.link = { url: opts.link };
  return obj;
}
// notion.block.* 헬퍼는 plain text만 → bold/link 필요 시 직접 구성
```

---

## 8. 작업 워크플로 (다음 글 작성 시)

```
1. 마켓 NEXT_DATA에서 템플릿 정보 추출
2. SEO 메타 4종 도출 (Post Title, Meta Title, Meta Desc, Slug)
3. 본문 5섹션 구조로 작성 (v1 기계적 스타일)
4. DB에 새 페이지 생성 또는 기존 페이지 갱신
   - 새 페이지: notion.createPage() + updatePageMarkdown()
   - 기존 페이지에 정보 박스만: 블록 API + position
5. Publish=false, Featured=false로 두고 사용자 검토 대기
6. 결과 URL을 응답 마지막에 노출
```

---

## 9. 현재 잔여 작업

### 9-1. 그룹 2 (마켓 없는 6건) 정보 박스 추가
- 마켓 정보가 없어 정보 박스 형식 변형 필요
  - "제작자 / 자료 종류 / 카테고리 / 관련 링크" 식
- 대상: mandatory-training-2025, notion-class-placement, notion-study-time-tracker, autumn-dashboard-template, notion-progress-macro, notion-make-class-challenge(케미가체질)

### 9-2. Date 속성 일괄 채우기 (4건)
- ai-booknote-pro, highschool-2015, challenge, memory-pro
- 권장: 마켓 `last_updated_at` 사용

### 9-3. ultimate-teachers-log 추가 정비
- 정보 박스만 들어감 → 스니펫 콜아웃·핵심 정리는 여전히 없음 (요청 외라 미처리)

### 9-4. 노션 영문 샘플 8건 정리(삭제)
- Benefits of Blogging, How to blog, Blogging metrics, Features of Notion, Content marketing techniques, How to build a successful landing page, Why do you need an online portfolio?, Is Notion the best CMS?

### 9-5. 어제 일괄 작성 11개 중 일부 사라진 정황
- DB 총수 변화: 어제 47 예상 → 오늘 39
- 사용자 의도 정리였는지 확인 필요

### 9-6. 슬러그 미스매치 정리 (DB only 슬러그 → 마켓 슬러그)
| DB 슬러그 | 마켓 슬러그 (예상) |
|---|---|
| student-short-quiz-chart | quiz-chart |
| notion-auto-quiz-grading | quiz-autograde |
| short-answer-quiz | shortquiz |
| notion-teacher-planner-2026 | lite-teachers-planner |
| student-sticker-board | student-participation-tracker (단, student-sticker-board에 어제 만든 v1 본문이 있음 → 어떻게 합쳤는지 확인 필요) |

### 9-7. 유료 템플릿 본문에 가격 표기 누락 점검
- 정보 박스 추가로 9건은 해결됨
- 그룹 2의 6건은 별도

---

## 10. 유용한 파일 위치

- `/tmp/creator-data.json` — NEXT_DATA 풀 데이터
- `/mnt/c/dev/notes/audit-all-posts.mjs` — 전수 감사 스크립트
- `/mnt/c/dev/notes/insert-info-box.mjs` — 정보 박스 일괄 삽입 (블록 API + position)
- `/mnt/c/dev/notes/list-template-dates.mjs` — 마켓 등록일·수정일 정리
- `/mnt/c/dev/notes/article-*.md` — 새 글 본문 백업
- `/mnt/c/dev/notes/update-*.mjs` — 페이지 갱신 개별 스크립트

---

## 11. 메모리 참조

- `feedback_seo-blog-human-led.md` — 본문은 사용자 직접, AI는 메타·구조까지만
- `feedback_dont-overtrim-copy.md` — 카피 수정 시 지목된 부분만
- `feedback_handoff-path-output.md` — HANDOFF 절대 경로 마지막 줄 노출
- `reference_carousel-style-guide.md` — 인스타 캐러셀 (별도)
- `project_notiontalk-architecture.md` — 노션톡 호스팅 구조

---

## 12. 다음 세션 첫 액션 제안

1. 이 HANDOFF 읽기
2. `/mnt/c/dev/notes/audit-all-posts.mjs` 재실행 → 현재 상태 스냅샷
3. 잔여 작업 9-1 ~ 9-7 중 우선순위 정해서 진행
   - 영향도 큰 순: 9-2 (Date 4건) → 9-1 (그룹 2 정보 박스) → 9-6 (슬러그 정리) → 9-4 (영문 샘플 삭제) → 9-3 (ultimate 보강) → 9-5 (사라진 글 확인)
