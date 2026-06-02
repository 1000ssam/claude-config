# 루마 동의 모델 & 자체 뉴스레터(SES) 발송 가이드 — 세션 핸드오프

> 작성 2026-05-24 · 출처: CRM 이관 세션. SES 자체 뉴스레터 구축 세션에 전달용.
> 관련 작업 기록: `/mnt/c/dev/crm-migration/IMPLEMENTATION_NOTES.md`

## 왜 이 문서가 필요한가
구 CRM → 신 CRM("뉴스레터 구독자" 통합마스터 DB) 이관 중, **뉴스레터 동의 안 한 사람들이 전부 `Status=confirmed`로 들어가는 문제**를 발견했다. 자체 SES 발송 시스템이 이들을 잘못 발송 대상에 넣으면 옵트인 위반 소지가 있어, 발송 게이트 설계 전에 동의 근거를 명확히 해두려 정리한다.

## 현재 데이터 (신 CRM "뉴스레터 구독자" DB, 552명)
- DB: `뉴스레터 구독자` / ds `e3aee153-e06c-492d-97d7-4d0fe881d285` / DB id `71a57f26-4874-431a-8836-d45180df0d00`
- **뉴스레터 동의: true 294 / false 258**
- **현재 `Status`: 552명 전원 `confirmed`** ← 이관 명세가 일괄 지정. 지금은 변별력 0 = **그대로 발송 기준 쓰면 위험**
- `리드 상태`: 활성 294 / 미동의 258 (= 뉴스레터 동의와 1:1 일치)
- **미동의 258명 = 100% 이벤트 참여자** (이벤트 관계 282링크 보유). 순수 무이력 미동의 0명.
- 출처: 상당수가 **루마(lu.ma) 이벤트**로 수집된 리드.

## 루마(lu.ma) 동의·발송 모델 (공식 도움말 확인)
1. **이벤트 등록 → 자동으로 호스트의 People list(캘린더 연락처)에 편입.**
2. **캘린더 연락처 = 옵트아웃 모델**로 호스트의 미래 이벤트 **Invite·Newsletter 수신 가능**. Remove/Block 하거나 본인이 구독취소하면 그때 제외.
3. **Blast는 "그 이벤트" 게스트 한정**(Going/Pending/Waitlist/Invited, Not Going 제외). 과거 참여자에게 새 이벤트 알림은 → 새 이벤트 **초대** 또는 캘린더 연락처 대상 **뉴스레터**.
4. **콜드메일·구매 리스트 금지.** 단, "내 이벤트 등록자"는 콜드가 아닌 관계 있는 연락처로 간주.
5. 요약: 루마 안에서는 **등록 자체가 사실상 소프트 옵트인(옵트아웃 방식)**. 별도 "뉴스레터 동의 체크박스"를 강제하지 않음.

## ⚠️ 핵심 구분 — 루마 플랫폼 ≠ 자체 SES 발송
- *루마 플랫폼 안에서의 발송 허용*과, *그 사람을 우리 자체 리스트로 옮겨 SES로 직접 발송하는 것*은 **동의 근거가 다르다.**
- 한국 **정보통신망법**: 영리 목적 광고성 정보 전송은 **사전 동의(옵트인)** 가 일반 원칙. (기존 거래관계 기반 예외가 있으나 범위 좁음.) → **발송 전 법적 확인 권장.**
- 결론: `메일링 동의=false`인 258명을 **자체 뉴스레터로 일괄 발송하는 것은 리스크.** 루마의 옵트아웃 관계가 자동으로 자체 발송 동의가 되지 않는다.
- (이 법 관련 서술은 일반 지식 기반이며, 위 루마 출처에는 포함되지 않음. 실제 적용 전 확인 필요.)

## SES 구축 시 반영할 사항
1. **발송 게이트(필수)**: 정규 뉴스레터 발송 대상 = **`Status=confirmed` AND `뉴스레터 동의=true`** 인 사람만. 현재 전원 confirmed이므로 **Status 단독을 발송 기준으로 쓰면 안 됨.**
2. **상태 정합화 필요**: 동의 294 → `confirmed` 유지 / 미동의 258 → `confirmed`에서 내려야 함(`pending` 또는 신규 옵션).
3. **258명 처리(잠정안)**: 삭제 보류. 발송 대상에서 제외. 후보 — `Status`에 **`event_only`** 옵션 추가 → 정규 발송 제외 + 이벤트 재초대엔 활용 + 추후 파기 결정 시 일괄 처리 용이.
4. 바운스/컴플레인: `Status`에 `bounced`/`complained` 옵션 이미 존재 → SNS 웹훅으로 반영하는 구조 그대로 사용.

## 미결정 (사용자 확인 대기)
- 258명 최종 처리: `event_only` 태깅 vs 보류 vs 삭제 → **다른 DB에서 구독자 추가 수집 완료 후 재논의 예정.**
- 상태 필드 중복 정리: `리드 상태`·`뉴스레터 동의`를 `Status`로 일원화할지 여부(이관 세션에서 논의 중).

## 출처 (Luma Help)
- Email Consent and Cold Emailing — https://help.luma.com/p/email-consent-and-cold-emailing
- Sending or Scheduling Event Blasts — https://help.luma.com/p/sending-or-scheduling-event-blasts
- Managing Calendar Contacts — https://help.luma.com/p/helpart-hPIjHeyxSzFSXLu/managing-calendar-members
- What do we do with the data we collect? — https://help.luma.com/p/helpart-NXju79HVgwBrlWP/what-do-we-do-with-the-data-we-collect-
