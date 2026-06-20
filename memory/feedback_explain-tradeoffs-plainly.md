---
name: explain-tradeoffs-plainly
description: 트레이드오프·기술 설명은 비개발자도 알아듣는 쉬운 말로
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ebddd96b-5ab9-4f6e-a7a4-7ae30bf0b29c
---

사용자에게 트레이드오프나 기술 선택지를 설명할 때는 전문용어·영어 약어 없이 **쉬운 말 + 구체적 사용자 시나리오/일상 비유**로 설명한다. 코드 내부 용어(라우터·IPC·컬럼명·상태 동기화 등) 나열 금지.

**Why:** 사용자는 비개발자(교사)라 코드가 아니라 UI/UX·실제 사용 경험으로 판단한다. jargon 덤프는 이해 불가 → 의사결정이 막힌다. (2026-06-13 grill 중 "엥 이게 뭔 소리여? 쉬운 말로" 피드백)

**How to apply:** "방법 A/B + 각각의 👍👎 + 의견 있는 추천"을 브라우저 탭 같은 일상 비유로 풀어서. grill·플랜모드·설계 논의 전부 적용. 관련 [[user-reviews-ui-not-code]].
