---
name: project_newsletter-send-idempotency
description: 뉴스레터 발송 멱등 로그가 CLI(로컬파일)와 노션버튼(GH캐시)으로 분리돼 경로 혼용 시 이중발송 위험
metadata: 
  node_type: memory
  type: project
  originSessionId: b3fe8d82-75b0-4c1a-8c88-47d57b7e970a
---

newsletter-self-host 발송 멱등성 함정 + 첫 대량발송 기록.

**첫 대량발송 완료 (2026-06-16):** 레터 `vibe-coding-deterministic-habit`(pageId 376dd1dc-d644-8054-ab1e-c2f8fd2b3dce)를 단계발송으로 confirmed 전원에게. 1차 200 → 관찰 → 2차 833 = **총 1,033, 실패 0**. 최종 반송률 **3.5%**(안정, 5% 검토선 아래), 신고 0%. SNS 반송 자동제외 파이프라인 **실제 작동 확인**(영구반송만 status=bounced + Bounce Count+1, 자동 발송제외).

**🚨 핵심 함정 — 멱등 로그가 발송 경로별로 분리됨 (공유 안 됨):**
- **CLI 발송**(`npm run send`): `send-logs/<pageId>.json` 로컬 파일. `.gitignore`됨(PII) → 이 PC에만 존재.
- **노션 버튼 발송**(send.yml, GitHub Actions): **GitHub Actions 캐시**(pageId 키). 클라우드지만 별개 저장소.
- 둘은 서로 못 봄, 노션·공유DB도 아님. → **같은 레터를 두 경로로 보내면 이중발송**(예: CLI로 보낸 뒤 버튼 누르면 캐시 비어 전체 재발송 + 버튼은 --max 없어 전체 블라스트).
- 발송대상 필터 = `Status=confirmed`(영문 select, ≠한글 `리드 상태`) − send-log의 이메일. `pendingRecipients`가 로컬 로그만 봄.

**근본 해결책(미적용, 사용자가 B=보류 선택 2026-06-16):** Upstash `sent:<pageId>:uniq` 셋이 이미 양 경로 공유 클라우드 기록(추적 ON 시 recordSent가 씀, 1차후 200·완료후 1033 확인). `pendingRecipients`가 이걸(로컬 OR Upstash) 보게 하면 경로·PC 무관 dedup. 코드변경=피처브랜치+명시 머지 승인.

**운영 수칙:** 한 레터는 한 환경에서 끝낼 것. CLI로 시작한 레터는 노션 버튼 누르지 말 것. 단계 워밍업은 CLI만 가능(버튼은 --max 없음). [[project_newsletter-self-host]]
