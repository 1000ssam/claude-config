---
name: project_newsletter-editor-db
description: 뉴스레터 레터에 에디터(아바타+이름)·발송일 메타 추가 — 에디터 DB 아키텍처 결정
metadata: 
  node_type: memory
  type: project
  originSessionId: 6fb4312e-bfc3-4f60-a4ee-110721d7795b
---

뉴스레터(self-host)에 에디터가 여러 명 생길 예정 → 레터 상단 메타에 **에디터(프로필 사진+이름) + 발송일** 노출.

**에디터 데이터 모델 (단계적 접근, 2026-05-29 확정):**
- 노션 author 정본이 bullet 제약 때문에 **3개로 파편화**돼 있음(bullet이 사이트마다 author DB를 따로 요구 → 통합 시도 실패). "마스터 없는 평행 정본 3개" = data debt.
- 이번엔 통합 안 하고 단계적으로: 깨끗한 **마스터 에디터 DB를 정본**으로, **뉴스레터만 relation으로 연결**. bullet 3미러 단방향 동기화는 후속 과제(notion-action-relay 활용 예정).
- 마스터 에디터 DB: id `f6d8edc1-68b7-435e-8bee-4b0ee579dda3`, 속성 `이름`(title)/`사진1_실사`(files, 아바타)/`뉴스레터`(relation).
- 캠페인 DB: id `36add1dc-d644-81eb-bfdc-e9e121c2a9d3`.

**코드는 캠페인(레터) 페이지에서 에디터 relation을 읽음** → 캠페인 쪽에 relation 속성 필요. 상수: `LETTER_EDITOR_PROP="에디터"`, `EDITOR_AVATAR_PROP="사진1_실사"` (lib/notion-content.ts). 이메일 아바타는 presigned 만료 방지 위해 `rehostImageUrl`로 S3 재호스팅(웹은 revalidate 10분이라 그대로).

**미해결(사용자 노션 작업 대기):** ①에디터 DB를 "newsletter" 통합에 공유 ②에디터 DB의 단방향 `뉴스레터` relation을 dual로 전환해 캠페인 쪽에 `에디터` 속성 생성(또는 캠페인에 relation 신설). 완료 후 e2e 검증 → 명시적 "머지해" 시 main 반영.

코드는 main 머지·배포 완료(2026-05-29, merge `cddcf44`). 노션 셋업 전까지 에디터 메타는 빈 값으로 안전 동작(미표시). [[project_newsletter-self-host]] [[project_notion-action-relay]]
