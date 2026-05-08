---
name: WebSearch는 미국 기반, 한국 SERP 단정 금지
description: WebSearch 도구는 미국 Google 기준이라 한국어 브랜드/키워드 SERP를 그대로 반영하지 않음. 한국 SEO 진단 시 단독 근거로 결론 내리지 말 것
type: feedback
originSessionId: d1d37640-ec19-45c0-b70a-3ed1a825da8a
---
WebSearch 도구는 미국 Google에서 실행된다. 한국어 브랜드명("노션톡" 등)이나 한국 시장 키워드 SERP를 진단할 때 WebSearch 결과만으로 "검색에 안 나옴", "권위 부족" 같은 결론을 내리면 안 된다.

**Why:** 2026-05-05 노션톡(notiontalk.com) SEO 진단에서 미국 Google이 "노션톡"을 일반 노션 결과로 디스앰비기에이션해 노션톡 사이트가 SERP에 안 잡혔다. 이걸 근거로 "도메인 권위 0"이라고 보고했는데, 한국 Google에서는 정상 노출되고 있었다. 사용자가 "개소리"라고 강하게 정정함.

**How to apply:**
- 한국어 SEO/SERP 진단 시 WebSearch는 보조 근거로만 사용. 결론 단정 금지.
- 가능하면 사용자에게 한국에서 실제로 보이는 SERP를 공유받거나, Search Console 데이터를 요청한다.
- "검색에 안 나옵니다" 류 단정 발언 전에 반드시 "WebSearch는 미국 기반이라 한국 SERP와 다를 수 있다"는 한계를 먼저 명시하거나 검증 후 말한다.
- 온페이지 SEO(robots.txt, meta, H1 등 raw HTML 점검)는 curl/WebFetch로 정확히 가능 — 거기에 집중하고, SERP 순위는 사용자에게 확인 요청.
