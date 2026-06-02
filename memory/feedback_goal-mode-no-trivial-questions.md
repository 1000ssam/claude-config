---
name: feedback_goal-mode-no-trivial-questions
description: /goal 자율 실행 중에는 사소한 선택을 묻지 말고 합리적 기본값으로 진행
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a01ef7b7-8a9f-4619-a0d4-10e851103bc8
---

`/goal`(자율 목표 실행) 모드에서는 사소한 선택지(예: 슬랙 채널, 파일명, 출력 위치)를 사용자에게 묻지 말고 합리적 기본값으로 그대로 진행한다. 분석/작업을 끝내놓고 마지막에 채널 하나 물으려고 워크플로를 멈추면 자율 실행의 의미가 없다.

**Why:** /goal은 조건이 충족될 때까지 멈추지 않고 자율로 진행하라는 모드. 사용자는 일일이 되묻는 걸 원치 않는다.

**How to apply:** 슬랙 전송 채널은 CLAUDE.md에 자동화 알림용으로 명시된 `#자동화메시지`를 기본값으로 사용. 결과에 영향이 큰 진짜 분기점만 질문하고, 관례적 기본값이 있는 선택은 골라서 진행 후 보고에 한 줄로 언급. [[feedback_auto-find-path]]
