---
name: roadmap-videos-hyperframes
description: Hyperframes(HTML→MP4) 셋업 완료 + 커밋이력 로드맵 지도 영상 프로젝트(/mnt/c/dev/roadmap-videos)
metadata: 
  node_type: memory
  type: project
  originSessionId: 10ceed97-e261-422f-b50e-9219ced3f1bb
---

Hyperframes(HeyGen 오픈소스, 무료·로컬렌더) 전역 설치 완료(2026-06-11): `~/.claude/skills/`에 hyperframes·hyperframes-cli·hyperframes-media·hyperframes-registry + 어댑터(gsap 등). 요구사항 Node22+/FFmpeg(설치됨). Docker 불필요.

프로젝트 `/mnt/c/dev/roadmap-videos/`: git 커밋 이력→"로드맵 지도" 모션그래픽. notiontalk 1편 완성(48s, 정거장 8곳, 7200×3400 캔버스 카메라 패닝 + 손글씨 스트로크). 디자인 토큰은 notiontalk-landing globals.css 기준 → `design.md`에 정리(틸 마커 #5BC8C0, Pretendard+Gaegu 로컬 woff2 in fonts/).

핵심 워크플로: 커밋로그→마일스톤 8개 추림→index.html 컴포지션→`npx hyperframes lint/validate/inspect`→`npm run render`(48s≈21분, WSL)→ffmpeg 프레임 추출 육안QA.

주의: 렌더는 CDN 폰트 불가(로컬 @font-face 필수), CSS transform+GSAP 트윈 충돌 금지(gsap.set으로 초기화), 카메라=월드 div translate 역산.

다음 후보: wee-linked·wee-log 개발 스토리 영상 (같은 골격 재사용, design.md만 교체).
