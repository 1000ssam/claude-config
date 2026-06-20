---
name: project_hf-gui
description: "HyperFrames 설정 GUI — CLI를 감싼 로컬 웹 래퍼 (변수폼+해상도+렌더). 비공개 repo, feat/build"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1952b641-9af8-4c24-b0e3-63e0c5688acb
---

HyperFrames 영상 CLI를 감싸는 **로컬 웹 설정 GUI**. 기존 컴포지션을 골라 변수폼(컴포지션의
`data-composition-variables`에서 자동 생성)·해상도/fps/품질/포맷을 설정하고, 미리보기 후
`npx hyperframes render`로 mp4를 굽는다. 화면 캡처가 아니라 "기존 컴포지션 설정·렌더" 도구.

- 경로 `/mnt/c/dev/hf-gui`, repo `1000ssam/hf-gui`(비공개). 작업 브랜치 **feat/build**(원격 푸시됨),
  **main 머지는 사용자 "머지해" 전까지 금지**.
- 스택: Next.js 16(App Router·Tailwind v4·TS) + vitest + node-html-parser. 1000쌤 기본 디자인.
- 구조: 공유계약 `src/lib/{types,presets,config}.ts` / 순수로직 `composition-parser·resolution·projects·
  render-args·progress` / 스폰경계 `hf-cli.ts` / 라우트 `api/{health,projects,composition,render(SSE),file}`.
- 핵심: ① CLI만 호출(내부모듈 import 금지) ② HTML 재작성 없이 변수 스키마만 폼화 ③ 비율 맞는
  `--resolution` 프리셋만 노출 ④ array spawn(셸 금지)+경로화이트리스트+설정 allowlist+동시2개.
- 검증: 69/69 테스트·tsc·build·CLI렌더·API E2E(72 progress)·보안(무효설정 400/traversal 403) 통과.
- 데모: `/mnt/c/dev/hf-gui-sandbox/demo`(변수 7종 선언). 기본 projectsRoot=/mnt/c/dev. 실행 `npm run dev`.
- 남은 일: **브라우저 시각 QA**(레이아웃/폼 모양)는 사람 확인 필요. 변수 입력 반영 미리보기는
  "테스트 렌더(draft)"로 대체(스튜디오 변수 오버라이드 미사용).

**Why:** 사용자가 HyperFrames CLI가 추상적이라 GUI 래퍼를 원함(/goal·max effort 자율 빌드).
**How to apply:** 재개 시 feat/build에서 작업. 시각 QA 후 사용자 승인 받으면 main 머지+`vercel` 아님(로컬툴).
관련 [[feedback_branch-policy-strict]] [[feedback_work-in-mnt]] [[feedback_always-report-visual-qa-needed]]
