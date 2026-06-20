---
name: project_newsletter-view-count
description: notiontalk.com/newsletter 레터 조회수 표시 — 합산식·메일리 시드·Upstash 인스턴스·재검증 운영팁
metadata: 
  node_type: memory
  type: project
  originSessionId: 18a71730-6856-45f3-a470-6794d71a99e2
---

`/newsletter` 홈 목록에 레터별 "조회수" 표시(2026-06-19 main 머지·프로덕션 배포). 관련: [[project_newsletter-self-host]] [[project_newsletter-send-idempotency]].

**합산식** (lib/metrics.ts `getLetterViews`): 조회수 = `view:{slug}`(웹조회, 매 방문 INCR·재방문도 누적) + `open:{pageId}:uniq`(메일 고유오픈, campaignId===pageId) + `seed:{slug}`(메일리 시드). 0이면 숨김(맵에 없거나 0). 웹조회는 `/api/letter-content`에서 recordView 호출(인증 게이트 앞→비구독자 미리보기도 카운트, 레이트게이트 뒤).

**메일리 시드**: 메일리에서 이관된 옛 레터 4건은 추적 데이터 0 → 비어 보임. 🚨 메일리 계정 해제로 실제 과거 조회수 **복원 불가**(공개 preview URL이 maily.so 랜딩으로 리다이렉트, 게다가 JS 렌더라 정적 HTML에 숫자 없음). 사용자 결정으로 구독자수(1002)의 15~20% 랜덤 고정값 시드. 값: claude-code 197 / beginner-webinar 184 / second-brain 177 / christmas-gifts 200. `scripts/seed-letter-views.ts`(`npm run seed-views`)로 SET, 멱등(라이브 view와 분리되어 재시드해도 라이브 안 날아감).

**🔑 Upstash 인스턴스**: 로컬 `.env`의 `UPSTASH_REDIS_REST_*` == 프로덕션 Vercel env `KV_REST_API_*` (**같은 인스턴스**). getRedis는 `UPSTASH_* ?? KV_*`. 그래서 로컬 스크립트로 쓴 키를 프로덕션이 그대로 읽음. ⚠️ Vercel **프리뷰** 환경엔 KV 없음(Production 스코프 전용)·sensitive라 `env pull`도 빈값 → 프리뷰 QA는 `vercel deploy -e UPSTASH_REDIS_REST_URL=.. -e ..TOKEN=..`로 로컬 .env 값 주입(프로젝트 설정 안 건드림).

**배포 후 즉시 반영**: 홈은 ISR(revalidate=600). `POST https://notiontalk.com/newsletter/api/revalidate/`(**끝 슬래시 필수**, 없으면 308) 헤더 `x-revalidate-key: $TOKEN_SIGNING_SECRET` → revalidatePath("/")+revalidateTag("letters"). 검증 시 `grep "조회 N"`은 React가 `조회 <!-- -->210`로 쪼개 렌더해서 안 잡힘 → `>210<` 또는 `조회 (<!-- -->)?[0-9,]+`로 확인.

**🚨 스키마 드리프트 장애(2026-06-19)**: 노션 캠페인DB '상태' 옵션을 "발송완료"→"2.발송완료"(정렬 접두사)로 바꾸자 `listPublishedLetters`의 `select:{equals:"발송완료"}` 쿼리가 validation_error throw → **홈/newsletter 전체 500 + 레터상세 404**(isPublishedLetter 정확일치). 핫픽스: DB쿼리에서 옵션명 필터 제거(정렬만)·JS에서 게이트, `normalizeOptionName`(접두사 "N." 제거)로 판정. 교훈=노션 select **equals는 옵션명 정확일치 필수→이름 바꾸면 throw**. 관련 [[notion-select-to-multiselect-isr-stale]]. ⚠️ **미수정 후속**: `lib/metrics-sync.ts`(267·292행)·`lib/subscriber-metrics-sync.ts`(137행)에 동일 `select equals LETTER_PUBLISHED_OPTION` 잔존(스크립트라 사이트 장애는 아니나 실행 시 throw) → 같은 방식으로 고쳐야 함.
