---
name: notiontalk.com 도메인 아키텍처
description: notiontalk.com은 Vercel(Next.js) 랜딩 + bullet.so를 /contents 서브디렉토리로 reverse proxy 하는 구조. bullet UI 제약 때문에 hosting path는 `/contents` 필수
type: project
originSessionId: cece47e0-0dbc-453d-b6e7-5b044b6f2d74
---
# notiontalk.com 아키텍처 (2026-04-26 마이그레이션)

```
notiontalk.com/                 → Vercel: Next.js 랜딩 (notiontalk-landing repo)
notiontalk.com/contents/<slug>  → rewrite → notiontalk-bullet.pages.dev/<slug>
notiontalk.com/newsletter/*     → rewrite → newsletter-self-host.vercel.app/newsletter/* (Multi-Zones, 2026-05-27 LIVE)
notiontalk.com/<legacy-slug>    → redirect → /contents/<new-slug>
```

**⚠️ apex 배포 = `vercel --prod` CLI 수동 (git 자동배포 아님)**. main push로는 안 뜸. notiontalk-landing 변경 시 반드시 `cd /mnt/c/dev/notiontalk-landing && vercel --prod --yes`. (canonical 호스트는 **www** — `notiontalk.com`→308→`www.notiontalk.com`. 검증 curl은 www로 칠 것.)

**뉴스레터 존(Multi-Zones)**: 뉴스레터 앱(별도 Vercel `newsletter-self-host`)이 `basePath:/newsletter`+`trailingSlash:true`. apex rewrite는 `/contents` 패턴 미러링 — 확장자자산은 슬래시X, 하위경로 `:path+`→`/:path+/`, 루트는 명시규칙(`:path*` 0+는 루트에서 더블슬래시→무한루프 버그). 신규 페이지 추가 시 rewrite 수정 불필요(`:path+`가 다 잡음).

**Why**:
- 기존 bullet 단독 호스팅에서 Next.js 랜딩 + bullet 서브디렉토리 분리 구조로 이전
- bullet의 Sub-directory UI는 hosting path에 `/` 단독 허용 안 함 (정규식 `/[a-zA-Z0-9-]+(/.*)?` 강제) → `/contents` prefix 필수
- 평탄 URL이 불가하므로 redirect로 옛 슬러그 → `/contents/<slug>` 매핑

**How to apply**:
- bullet에 신규 루트 페이지 추가하면 `next.config.ts`의 redirects에 한 줄 추가 필요. 안 그러면 직접 슬러그 입력 시 404
- bullet은 case-sensitive. About-us와 about-us는 다른 페이지로 인식
- 자세한 운영 가이드: `/mnt/c/dev/notiontalk-landing/docs/redirect-migration/README.md`
- DNS는 가비아. Vercel project: `notiontalk-landing` (account `1000s-projects-a51f0c2a`)
- bullet pages.dev URL: `notiontalk-bullet.pages.dev` (production URL, 해시 prefix 붙은 건 deployment-specific이라 사용 금지)
- 옛 bullet redirect 테이블은 비움 (단일 진실 원칙: redirect는 next.config.ts에서만 관리)
