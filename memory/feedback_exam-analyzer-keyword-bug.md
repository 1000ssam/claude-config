---
name: feedback_exam-analyzer-keyword-bug
description: exam-analyzer 스킬의 기출 문항 매칭 — 정답 선지만 포함, 오답 선지 제외
type: feedback
---

오답 선지 텍스트에서 키워드를 뽑으면 안 된다. 정답 선지는 매칭에 포함해야 한다.

**Why:** 오답 선지 키워드로 인한 false positive 방지 + 정답 선지에만 있는 핵심 키워드 누락 방지.

**How to apply (구현 완료 2026-04-15):**
- Python 스크립트: `extract_stem_and_choices()` — 발문/제시문과 개별 선지(1~5)를 분리 추출
- 패스 1.5: `{시험명}_정답.png` 이미지를 Read 도구로 읽어 정답 번호 매핑
- Step 3 매칭: `stem_text` + `correct_choice_text`(정답 선지) + `vision_text`(해당 시) 결합
- 오답 선지 4개는 절대 매칭에 포함하지 않음
- 정답 선지 키워드로만 매칭된 문항에는 `(선지)` 표시
- 정답지 파일 규칙: `{시험명}_정답.png` (시험 PDF와 파일명 접두사 일치)
