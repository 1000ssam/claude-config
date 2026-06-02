---
name: measure-layout-before-changing
description: UI 정렬/레이아웃 어긋남은 동일 조건 픽셀 실측으로 원인 격리 후 수정. 감·코드구조 추측·핸드오프 진단 맹신 금지
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8509ac3c-5bbe-4e44-aa18-b0b87a19eefe
---

UI 정렬/레이아웃이 "안 맞는다 / 달라 보인다"는 문제는 **두 화면을 동일한 통제 조건(같은 뷰포트 폭, 변수 하나씩만 토글)에서 픽셀 단위로 실측해 원인을 격리한 뒤** 코드를 바꾼다. 헤드리스 Chrome 캡처 + PIL로 leftmost 픽셀을 재는 식. 감으로 때리거나, 코드 구조만 보고 원인을 추론하거나, HANDOFF가 적어둔 원인을 검증 없이 맹신/폐기하지 말 것.

**Why:** newsletter-self-host 좌측정렬 작업에서, 처음엔 HANDOFF의 스크롤바 진단을 감으로 적용 → 되돌림 → 코드 구조만 보고 `max-w-6xl vs 7xl 폭 차이`라 단정하고 7xl로 변경 → about-us와 8px→58px로 **더 벌어진 regression** 발생, 전량 롤백. 사용자: "감으로 때리지 말고 기존 페이지 코드를 제대로 읽어", "왜 갈수록 병신이 되냐". 결국 1440px에서 스크롤바 표시/숨김만 토글해 실측하니 `max-w-6xl`은 about-us와 **원래 픽셀 일치**(로고121·콘텐츠146 동일)였고, 유일한 축은 **스크롤바 거터 8px**(긴 about-us는 항상 스크롤바→8px 왼쪽, 짧은 뉴스레터는 없음)였음 = HANDOFF 최초 진단이 옳았음. 수정은 `scrollbar-gutter: stable` 한 줄.

**How to apply:** 정렬/간격/폭 어긋남 리포트 전반. ① 두 페이지를 같은 폭으로 캡처, ② 의심 변수(스크롤바·max-width 등)를 하나씩만 바꿔 격리, ③ 픽셀 측정으로 수치 확정, ④ 그 다음에 수정. HANDOFF/이전 세션이 원인을 이미 적어뒀으면 그 가설을 **실측으로 검증**(맹신도 무시도 아님). 특히 프로덕션 직행 머지 직전엔 변경 후에도 같은 실측으로 일치 재확인. [[verify-before-asserting]]
