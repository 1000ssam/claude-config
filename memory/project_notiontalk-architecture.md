---
name: notiontalk.com 도메인 아키텍처
description: notiontalk.com은 Vercel(Next.js) 랜딩 + bullet.so를 /contents 서브디렉토리로 reverse proxy 하는 구조. bullet UI 제약 때문에 hosting path는 `/contents` 필수
type: project
originSessionId: cece47e0-0dbc-453d-b6e7-5b044b6f2d74
---
# notiontalk.com 아키텍처 (2026-04-26 마이그레이션)

```
notiontalk.com/                 → Vercel: Next.js 랜딩 (notiontalk-landing repo)
notiontalk.com/contents/<slug>  → ★프록시 라우트핸들러 app/contents/[...path]/route.ts → bullet (HTML 본문 재작성 + 엣지캐시). 자산(확장자)만 next.config beforeFiles rewrite로 bullet 직송
notiontalk.com/contents/community(/*)  → ★네이티브 Next.js (bullet 아님, 2026-06-11)
notiontalk.com/contents/about-us       → ★네이티브 Next.js (bullet 아님)
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

**★ 네이티브 페이지(community·about-us) — bullet 아님**:
- `app/contents/community/`(리스트+`[slug]` 상세)·`app/contents/about-us/`는 네이티브 Next.js. 원천=노션 DB→`scripts/sync-*.mjs`→`app/_data/*.json`+`public/*` 이미지(빌드 시 동기화, gitignore). creators=`sync-creators.mjs`, 이벤트=`sync-community.mjs`(이벤트 DB `323dd1dc-d644-8049-8131-fc5f2fd5de36`).
- 이미지는 `/community-media/`에 둠 — `/community/*` 레거시 redirect와 충돌 회피(절대 `/community/`에 정적 자산 두지 말 것).
- ⚠️ **bullet 프록시 = 순수 rewrite 아님, 라우트핸들러**(2026-06-13 `feat/seo-canonical-www`): `app/contents/[...path]/route.ts`가 bullet HTML을 프록시하며 ① non-www canonical/og:url→www 정규화(GSC www/non-www 분열 해소) ② `<html lang=en>`→ko ③ 응답에 `s-maxage=600+SWR` 부여해 Vercel 엣지 캐시(force-dynamic 금지). 네이티브 community·about-us는 **리터럴 세그먼트가 캐치올 `[...path]`보다 우선**이라 자동 제외(옛 네거티브 룩어헤드 rewrite 폐기). 자산(확장자 경로)은 `next.config` **beforeFiles** rewrite로 bullet 직송(파일시스템 라우트보다 먼저라야 핸들러에 안 삼켜짐). 리다이렉트는 `:path+`→`/:path+/`+ bare-section 2규칙으로 308 1홉화.
- 상세 본문 렌더: newsletter-self-host의 `LetterBody`(노션 블록→JSX) 포팅 재사용. 이벤트에 본문 텍스트 있으면 렌더, 없으면 폴백. 상세에 schema.org **Event JSON-LD**(`buildEventJsonLd`, 날짜 있는 이벤트만, 주소·가격 날조 금지).
- 이벤트 슬러그: **노션 `슬러그` 속성 우선** > `SLUG_MAP` 하드코딩 > 노션ID 단축 fallback (`notionSlug()` in sync-community.mjs).
- ⚠️ 모든 동기화 이미지(커버·갤러리·본문·담당자·크리에이터)는 `scripts/lib/image.mjs`의 단일 `downloadImage`로 **WebP 다운스케일**(GIF→애니WebP, EXIF회전, ≤1600px). 렌더는 전부 `next/image`(ESLint가 raw `<img>` 금지). 본문 이미지는 sync 시 치수 측정해 `dim` 동봉.

**★ 발행(재빌드) 트리거 — community/about-us 갱신법 (2026-06-12)**:
- 네이티브 페이지 발행 = notiontalk-landing **재빌드**(prebuild가 sync-* 재실행). 트리거 3경로: ① `notion-action-relay`의 `notiontalk-rebuild` 액션(권장, 자동화 허브 일원화) ② notiontalk-landing 자체 `/api/notion-webhook`(헤더 `x-webhook-secret`=`NOTION_WEBHOOK_SECRET`) ③ raw Vercel Deploy Hook.
- ⚠️ **bullet-publish 액션은 네이티브 페이지를 안 바꾼다**(bullet.so만 재발행). 마이그레이션 후 옛 about-us bullet-publish 버튼은 무효 → `notiontalk-rebuild`로 교체할 것.
- ⚠️ `/api/notion-webhook`은 `trailingSlash:true`라 **슬래시 없는 POST→308**. 웹훅 발신 도구가 308 미추종 시 실패 → 끝슬래시 필수거나 relay 경유(서버사이드 POST라 함정 없음).
- relay 버튼: `notion-action-relay.vercel.app/api/trigger?action=notiontalk-rebuild`, 키=기존 `TRIGGER_SECRET`. 액션 정의=`actions/notiontalk_rebuild.py`(Deploy Hook POST), GH Secret `NOTIONTALK_DEPLOY_HOOK`(=landing의 `VERCEL_DEPLOY_HOOK_URL`). feat 브랜치 `feat/notiontalk-rebuild-action`, master 머지 후 relay Vercel 재배포돼야 라이브 버튼 동작.
