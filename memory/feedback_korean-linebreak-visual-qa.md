---
name: korean-linebreak-visual-qa
description: 한글 UI/덱 줄바꿈은 실제 표시 폭에서 직접 렌더 검수 필수 + word-break:keep-all 기본 적용
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 27dea60f-b860-4083-b8ea-19002ab2ee7e
---

한글 텍스트(특히 큰 헤드라인)를 렌더하는 UI는 "완성" 보고 전, 실제 표시 폭에서 직접 스크린샷 검수하고 줄바꿈을 어절 단위로 확인한다. CSS는 한글에 `word-break: keep-all`(어절 중간 끊김 방지) + `text-wrap: balance/pretty` + display 폰트 max 크기 캡을 기본으로 둔다.

**Why:** 2026-05-28 Marginalia 데모 deck에서 헤드라인이 82px로 너무 커 본문 컬럼을 넘쳐 "흔적/을," 처럼 어절 중간이 끊겼는데, 1280px 단일 폭 + 축소 썸네일만 봐서 못 잡음. 사용자가 더 넓은 창에서 깨진 화면을 직접 캡처해 지적("줄바꿈 제대로 하려면 시각 검수 하는 수밖에 없는데 그건 안해?").

**How to apply:** 한글 deck/슬라이드/랜딩 헤드라인 작업 전반. 단일 뷰포트·축소 썸네일 검수로 끝내지 말고 최소 2개 폭(예: 1280/1440/1680)에서 캡처해 줄바꿈을 본다. `word-break: keep-all` 누락이 한글 어절 끊김의 가장 흔한 원인. clamp() 헤드라인은 vw 계수·max를 보수적으로. 관련: [[feedback_verify-before-asserting]] · [[feedback_measure-layout-before-changing]]
