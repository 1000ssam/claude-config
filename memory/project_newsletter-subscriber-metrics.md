---
name: project_newsletter-subscriber-metrics
description: "newsletter-self-host 구독자별 지표(메일리식) 롤업 — 노션 구독자 DB 동기화, 레터 동기화 워크플로에 통합"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2e8352c3-c112-417c-ac3b-39a284caf3d2
---

newsletter-self-host에 메일리식 **구독자별 지표 대시보드**를 구현(2026-06-01 main 배포).

- **데이터 흐름**: 캠페인 중심 Upstash 카운터 → 구독자 중심 롤업(코드 메모리에서 subId=HMAC(email) 역매핑으로 조인, 노션 relation 없음) → 노션 구독자 DB 속성에 기록. SSOT=Upstash.
- **노션 속성 7종**(API 생성): 받은레터수/오픈수/클릭수/최근오픈/지표동기화시각 + 오픈율/클릭율(수식, 0~1 → 노션에서 숫자형식 '퍼센트'로 표시).
- **Redis 키 추가**: 발송 시 `sent:{cid}:uniq`(SADD), 오픈 시 `open:last`(HSET subId→iso). 전부 fail-open.
- **CLI**: `npm run sync-subscriber-metrics`(롤업·변경분만 기록), `npm run backfill-sent-uniq`(과거 발송분 받은레터수 소급, 로컬 send-logs 필요).
- **자동화**: `.github/workflows/metrics-sync.yml` 에 통합 — 크론(KST 03:00)·수동·노션버튼 어느 트리거든 **레터 지표 + 구독자 롤업 둘 다** 갱신. 시크릿 `NOTION_SUBSCRIBERS_DB_ID` 이미 등록됨.
- **현재 상태**: 실발송 이력 없음(테스트 발송만) → backfill 불필요. 미래 발송분부터 자동 추적. 사용자가 구독자 DB에 '지표 동기화' 버튼 직접 생성 예정(기존 레터 버튼과 동일 workflow_dispatch, page_url 비움).
- 오픈율은 Apple Mail MPP로 과대측정 → 클릭이 1차 신호.

관련: [[project_newsletter-self-host]]
