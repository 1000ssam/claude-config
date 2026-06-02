---
name: project_newsletter-marketing-consent
description: 뉴스레터 마케팅 수신 동의 + 개인정보처리방침 (정보통신망법 대응)
metadata: 
  node_type: memory
  type: project
  originSessionId: 6fb4312e-bfc3-4f60-a4ee-110721d7795b
---

뉴스레터(self-host)가 정보성+광고성(마케팅) 메일을 함께 발송 예정 → 정보통신망법 §50(광고성 opt-in)·개인정보보호법 대응.

**완료(2026-05-29, main 머지 `81b868c`):**
- 구독 폼: **필수 통합 동의 체크박스**(개인정보 수집·이용 + 광고성 정보 수신) — 체크 전 제출 비활성, 서버에서 `consent===true` 강제(누락/false → 400 `consent_required`). 동의 시각 = 구독자 `Subscribed At`.
- **개인정보처리방침** 신설(`app/privacy/page.tsx`, /newsletter/privacy). 운영주체 **노션톡**, 연락처 **slowly007@goedu.kr**, 보유기간 **해지 시 즉시 파기**, 수탁사 Notion/AWS/Cloudflare 고지. 시행일 2026-05-29.
- 이메일 푸터(뉴스레터·확인메일)에 개인정보처리방침 링크.
- 소개문 '격주로' 제거(발송 주기 미확정).

**🚩 첫 마케팅(광고성) 발송 전 남은 과제(미구현):**
- 광고성 메일은 **제목에 "(광고)" 표기 + 본문에 전송자 정보(명칭·연락처)·무료 수신거부 방법** 명시 필요(정보통신망법 발송 단계). lib/email-templates.ts 발송 본문/제목 측 작업. 정보성 메일엔 불필요 → 광고성 캠페인 구분 플래그 필요할 수 있음.

**범위 밖:** 기존 구독자 처리는 사용자가 직접(모두 마케팅 동의자로 간주). 동의버전 Notion 필드는 정책 개정 시 후속.

[[project_newsletter-self-host]] [[feedback_no-fabrication]]
