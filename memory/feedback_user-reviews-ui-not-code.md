---
name: feedback_user-reviews-ui-not-code
description: 사용자는 코드를 못 읽음. 검토 요청은 UI/UX만 할 것. 코드 리뷰는 Claude 몫.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5f9cd984-deab-4896-af33-f1948fe62b31
---

사용자는 코드를 읽을 줄 모른다. 검토를 요청할 때 **코드 리뷰를 사용자에게 맡기지 말 것**. 코드 정합성·보안·로직 검증은 전부 Claude가 책임지고, 사용자에게는 **UI/UX 점검만** 요청한다(화면 흐름, 버튼 동작, 렌더 결과, 문구 등 눈으로 보고 클릭해서 확인 가능한 것).

**Why:** "코드 핵심 4파일 검토해보세요" 식 요청은 사용자가 수행 불가능하므로 무의미하다.

**How to apply:** 핸드오프/검토 단계에서 "사용자 확인 항목"을 짤 때 코드 항목은 Claude가 흡수하고, 사용자 몫은 실행 가능한 UI/UX 체크리스트(클릭 경로 + 기대 결과)로만 제시한다. 관련: [[feedback_handoff-path-output]]
