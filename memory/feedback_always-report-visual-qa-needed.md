---
name: feedback_always-report-visual-qa-needed
description: 사용자가 직접 육안/수동으로 검증해야 하는 항목이 있으면 작업 보고 시 항상 명시
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 28db35ef-9b83-4e01-991e-f8b582bb9726
---

작업을 보고할 때, **사용자가 직접 육안(브라우저/UI)으로 또는 수동으로 검증해야 하는 항목이 남아 있으면 항상 명시적으로 보고**한다. 자동 스모크/테스트로 커버한 부분과, 사람이 눈으로 확인해야 하는 부분을 구분해서 알려준다.

**Why:** 자동 검증으로 다 끝난 것처럼 보고하면, 실제로 사람이 봐야 하는 잔여 검증(예: UI 비활성 버튼, 모바일 줄바꿈, 권한별 화면 차이)이 누락된 채 배포될 위험이 있다.

**How to apply:** 보고 말미에 "🔭 육안 검증 필요" 같은 항목을 두고, 무엇을·어떤 계정/조건으로 확인해야 하는지 한 줄로 적는다. 관련: [[feedback_first-pass-ui-quality]], [[feedback_user-reviews-ui-not-code]]
