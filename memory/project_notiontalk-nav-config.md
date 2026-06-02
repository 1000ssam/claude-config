---
name: project_notiontalk-nav-config
description: 노션톡 네비 메뉴 단일 출처 패키지(@notiontalk/nav-config). 메뉴 변경 시 워크플로·공개 유지 필수
metadata: 
  node_type: memory
  type: project
  originSessionId: 2dfd7ed8-3219-41c7-921f-9e025d3554b0
---

노션톡 사이트 **네비게이션 메뉴의 단일 출처(SSoT)** = 별도 repo `1000ssam/notiontalk-nav-config` (**공개**, default branch main, 로컬 `/mnt/c/dev/notiontalk-nav-config`).

- 내용: `index.js`(순수 ESM `NAV` 데이터 + `isDropdown`) + 수기 `index.d.ts`. 빌드 스텝 없어 어느 번들러든 `transpilePackages` 없이 바로 import.
- 소비 앱 2개가 `"@notiontalk/nav-config": "github:1000ssam/notiontalk-nav-config"` 의존성으로 공유:
  - `notiontalk-landing` (랜딩 `/` + about-us) — `app/_components/SiteNav.tsx`가 `NAV.map()` 렌더, 브랜드 로고만 next/link
  - `newsletter-self-host` (`/newsletter/`, basePath) — 동일 `SiteNav.tsx`, 단 브랜드·전 href 절대 URL `<a>` (basePath 때문). layout에서 `current="newsletter"` 강조
- href는 전부 절대 URL `https://www.notiontalk.com/...` (끝 슬래시). 메뉴 순서: 노션+AI 꿀팁(드롭다운)→노션 템플릿→툴킷(드롭다운)→뉴스레터→커뮤니티→제작자 소개.

**🚨 공개 상시 유지**: Vercel이 매 빌드 `npm install`로 이 repo를 클론 → 비공개로 되돌리면 두 앱 배포가 SSH 권한거부(exit 128)로 깨짐. 내용이 비민감(공개 메뉴 데이터)이라 영구 공개 OK. 민감정보 들어갈 일 생기면 토큰인증/subtree로 전환.

**메뉴 변경 워크플로**: ① `index.js` NAV 수정+push → ② 두 앱에서 `npm update @notiontalk/nav-config` + 커밋 + 재배포(빌드 시 번들되므로 재배포 없이 반영 안 됨) → ③ ⚠️ bullet 블로그 네비(`/contents/...`)는 React 아니라 이 패키지 못 읽음 → bullet.so 대시보드 네비 UI에서 수동 갱신.

관련: [[project_notiontalk-architecture]], [[project_newsletter-self-host]]
