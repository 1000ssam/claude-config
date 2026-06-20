---
name: wee-log-remote-llm
description: wee-log 원격 LLM(레벨1) 브랜치 상태 — worktree·구현완료 범위·사용자 결정 대기 4종
metadata: 
  node_type: memory
  type: project
  originSessionId: a8a608bf-8eec-4467-a187-1d527ed391d8
---

wee-log 원격 LLM 통합(레벨1: 가명화+TLS+무저장). 2026-06-11 구현, **2026-06-12 main ff 머지·푸시
완료**(67c410b→2e1ca20, audit phase0-2·phase3 리팩토링 11커밋 동반 — [[wee-log-audit-refactor]]).
합의된 순서: 머지✅ → QA(사용자 클릭스루, 미실시) → KT 서버 서빙(SERVER-SETUP-GUIDE.md).
⚠️ feat/family-look 머지 시 .gitignore 1곳 충돌 예정(양쪽 말미 추가 — 둘 다 유지로 해소).

- 브랜치 `feat/remote-llm` (분기점 49419e3=feat/audit-phase3-renderer, origin 푸시됨).
  worktree: `/mnt/c/dev/wee-log-remote-llm` (메인 리포는 feat/family-look 작업 중이라 분리, QA 후 제거 예정).
- 완료: ai_backend 설정 기반 전환(ensureProviderReady), H7 redact 초크포인트
  `lib/ai/remote-redaction.ts` 추출 + `scripts/remote-redact.check.mts`(22단언), SSE [DONE]
  버그·타임아웃·재시도, 설정 UI(토글+동의 다이얼로그+원격 카드), `server/`(vLLM 무로그
  컴포즈+검증 스크립트), `SERVER-SETUP-GUIDE.md`(수작업 0~9단계), `docs/remote-llm/`
  (LLM=Mi:dm 2.0 1순위·STT=WhisperX 스택 1순위·KT 비용 V100 295만/A100 487만 VAT별도).
- WSL 게이트 전부 통과(tsc web+node 0, checks 21/21, lint 0err, build OK).
  **2026-06-12: 합쳐진 main(55b7388=remote-llm+audit+family-look) 게이트 재검증 통과(WSL).**
  남은 건 Windows 시각 QA뿐 → 체크리스트 `/mnt/c/dev/notes/wee-log-qa-checklist-2026-06-12.md`.
  `electron/env.d.ts`를 gitignore 예외로 추적함(이전엔 로컬 전용이라 fresh checkout 깨짐).
- 🚩 사용자 결정 대기: ① GPU(권장 1차 V100→검증 후 A100, A100 VRAM 40/80GB 확인 필수)
  ② 모델 최종(권장 Mi:dm 2.0) ③ 도메인 ④ 원격 기본값(opt-in으로 구현됨).
- 실서버 E2E 미수행(서버 미가동). STT는 Phase 2 설계만(`server/stt/README.md`,
  오디오는 가명화 불가 — 강한 고지 필요). [[wee-log-audit]]
