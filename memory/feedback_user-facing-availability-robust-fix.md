---
name: user-facing-availability-robust-fix
description: "사용자 대면 가용성 문제(폼·페이지가 안 뜸)는 \"캐시 지워라\" 같은 로컬 워크어라운드로 답하지 말 것. 실유저가 못 따라하는 해법은 해법이 아님 — 근본·견고한 수정 우선"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 780c4a49-9faf-4759-81fb-4d4ec5d1931b
---

사용자가 접근하는 페이지/폼이 안 뜨는 등 **end-user 가용성** 문제는, 진단 결과가 "로컬 DNS 캐시/브라우저 상태"로 나오더라도 **"캐시 지우세요" 같은 로컬 워크어라운드를 최종 답으로 제시하지 말 것**. 근본적이고 견고한 수정(예: 커스텀 도메인 연결)을 우선 제안한다.

**Why:** newsletter-self-host 구독 폼이 `ERR_TIMED_OUT`으로 안 뜬 건 → 로컬 Windows DNS 캐시 글리치였지만, 사용자가 "실제 구독자한테 캐시 지우라고 안내할 거냐"고 지적. 실유저는 캐시를 못 지운다 — 그냥 이탈한다. 특히 타깃이 학교망 교사들이라 `*.vercel.app`은 차단·불안정 리스크가 큰데, raw vercel.app 도메인을 production 진입점으로 두는 것 자체가 결함. 로컬 우회로 답한 것이 실수였음.

**How to apply:** 진단으로 로컬 원인을 찾는 것까지는 OK. 하지만 그 문제가 "실제 사용자도 겪을 수 있는 가용성/접근성" 범주면, 보고 시 (1) 실유저가 수행 불가능한 워크어라운드(캐시 클리어/플래그 토글/hosts 수정 등)를 해법으로 제시 금지, (2) 근본 수정(커스텀 도메인, 인프라 견고화 등)을 우선 추천. 진단 결과를 정직하게 calibrate하되(이번 건은 로컬이었음을 숨기지 말 것), "그래도 production 진입점으로는 부적합"이라는 더 큰 결론을 놓치지 말 것. 관련: [[project_newsletter-self-host]]
