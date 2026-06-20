---
name: project_notiontalk-lenis-smooth-scroll
description: notiontalk 부드러운 스크롤(Lenis) 적용 범위 3곳 + bullet 주입/업그레이드 주의점
metadata: 
  node_type: memory
  type: project
  originSessionId: 622adb5c-de41-42d6-b705-7a167bf804f0
---

notiontalk에 Lenis(v1.3.23, 바닐라+모듈싱글톤) 부드러운 스크롤 적용 (2026-06-16 전부 prod 배포). 데스크톱 휠만 스무딩, 모바일 터치는 네이티브, reduced-motion 시 전부 미초기화.

적용 3영역 (도메인 한 개 아래 세 종류가 섞여 있음 — [[project_notiontalk-architecture]] 참조):
1. **랜딩 네이티브 페이지** (`/`, `/contents/about-us`, `/contents/community`): `app/layout.tsx`의 `<SmoothScroll/>` + `app/_lib/lenis.ts`의 `smoothScrollTo()` 헬퍼로 프로그래밍 스크롤(맨위로·#cta/#video 앵커·CreatorTabs) 라우팅. repo `1000ssam/notiontalk-landing`.
2. **bullet 프록시 페이지** (`/contents/guide`·`tools`·`vod`·`templates`): `app/contents/[...path]/route.ts`가 프록시하는 bullet HTML `</body>` 앞에 Lenis 로더 주입. CDN 대신 **자체 호스팅** `public/vendor/lenis-<버전>.min.js`(globalThis.Lenis 노출 IIFE) + 인라인 init. bullet엔 CSP 없어 인라인 허용 확인.
3. **뉴스레터 앱**: 별도 repo `1000ssam/newsletter-self-host`(Next15, apex `/newsletter` 프록시). 랜딩과 동일 SmoothScroll 컴포넌트(호출부 없어 헬퍼 생략). CSP는 Report-Only라 번들 Lenis 무영향.

🚨 **lenis 업그레이드 시**: bullet은 `public/vendor/lenis-X.min.js` 파일 교체 + `route.ts`의 `LENIS_VERSION` 상수 갱신(둘 다 안 하면 404/구버전). 랜딩·뉴스레터는 npm 버전만 올리면 됨.
