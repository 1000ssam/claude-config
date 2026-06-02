---
name: project_running-challenge-cron-toggle
description: "running-challenge-3 일일 SMS 크론 on/off는 노션 '챌린지 정보' 페이지의 '발송 상태'(진행/중단) 셀렉트로 제어"
metadata: 
  node_type: memory
  type: project
  originSessionId: 02f71fa7-07dd-42b6-8509-d7a20421dc49
---

running-challenge-3(노션톡 러닝 챌린지)의 **모든 SMS 발송**은 노션 **"챌린지 정보" DB의 페이지 속성 `발송 상태`(select: 진행/중단)** 하나로 켜고 끈다. 발송 경로는 정확히 둘이며 둘 다 게이팅됨:
- `api/cron/daily-morning.js` — 매일 08:00 KST(Vercel cron `0 23 * * *`): 첫날·마지막날·독려
- `api/webhook/run-added.js` — 러닝 인증 업로드 시: 진행도·7회성공

- `getChallengeInfo()`가 `발송 상태`를 읽어 `sendingEnabled = (값 === '진행')`로 노출. fail-closed(opt-in): 미설정/'중단'/오타/챌린지정보 null은 모두 발송 차단. 두 핸들러 모두 챌린지 조회 직후 `!challenge?.sendingEnabled`면 즉시 `skipped`로 종료(모든 sendSms 분기의 상위 가드). 러닝 기록 저장 자체는 영향 없음.
- **다음 기수 재가동**: 노션 "챌린지 정보" 페이지의 `발송 상태`를 `진행`으로 바꾸면 **재배포 없이** 크론·웹훅 양쪽 발송 재개. 끄려면 `중단`. (스크립트 `scripts/setup-send-status.mjs`로 속성 추가/세팅 가능 — 멱등)
- 2026-05-26: 3기 종료로 `중단` 설정 + 크론·웹훅 가드 둘 다 프로덕션 배포·검증 완료.
