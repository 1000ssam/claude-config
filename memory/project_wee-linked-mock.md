---
name: project_wee-linked-mock
description: "wee-linked 랜딩 리디자인 시안(mymind·제주명조·V2히어로) 완성·배포. 다음=실서비스 wee-linked.com 전면 리테마 이관(REDESIGN_HANDOFF)"
metadata: 
  node_type: memory
  type: project
  originSessionId: cdf44bef-a651-45a4-b9e4-5ccb7b0b4fd9
---

위링(wee-linked) 상담교사 커뮤니티 **랜딩 리디자인 시안**. 작업 폴더 `/mnt/c/dev/notes/wee-linked-mock/`, 마스터 소스 `mymind-native.html`. 🚨 **핸드오프=`/mnt/c/dev/notes/wee-linked-mock/HANDOFF.md`** (다음 세션 먼저 읽기).

확정: 레퍼런스 mymind · 팔레트 더스티로즈×미스트블루(1번) · 디스플레이=**제주명조(Jeju Myeongjo)**(디필레이아 폐기, 굵기400단일 `font-synthesis:none`) + 본문 Pretendard · 왼쪽정렬 · 위계 90/48/32 · 섹션 형태 변주+주석칩. **모바일 반응형 + V2 히어로(네비확대+카드 우측단 2단, ≥1000) 완성·배포**. 칼럼 예시는 고딕.

🚨 라이브 **https://wee-linked-demo.vercel.app** (Vercel `1000s-projects-a51f0c2a/wee-linked-demo`, 공개·noindex)는 **디자인 시안**일 뿐, 실제 서비스 **wee-linked.com**(Next.js+Supabase, [[project_wee-linked-deploy]])과 **완전 별개** — 혼동 금지.

배포본 `wee-linked-demo/index.html`은 마스터의 수동 카피 → 수정 시 HANDOFF §5 재생성+`vercel deploy --prod` 필요.

🚀 **다음 세션(2026-06-16 결정): 이 시안을 실서비스 [[project_wee-linked-deploy]](wee-linked.com)에 전면 리테마 이관.** 범위=**사이트 전체 통일**(랜딩만 아님), 단 로직·DB·게시판 무변경(색·폰트·외형만). 🚨 **이관 핸드오프=`/mnt/c/dev/wee-linked/REDESIGN_HANDOFF.md`** (토큰 매핑·컴포넌트 포팅·보존계약 3가지=site_content/SiteHeader/'링글'네이밍·실행순서 전부 수록). 실서비스는 현재 peach+Jua/Gaegu → 로즈블루+제주명조로.
