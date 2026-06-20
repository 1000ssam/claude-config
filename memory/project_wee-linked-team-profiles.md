---
name: project_wee-linked-team-profiles
description: "wee-linked 소개 운영진 팀 프로필(notiontalk식 로스터) — main 머지 완료(ccb7dff), 프로덕션 미배포(vercel --prod 대기). 운영 DB에 데모 9명(@weetest.kr) 유지 중, 오픈 전 정리 필요"
metadata: 
  node_type: memory
  type: project
  originSessionId: 311e2c77-8a9b-401f-ad60-10de7c1047c8
---

wee-linked 소개(/about)에 **마스터(리드) 히어로 + 운영진(staff) 카드 그리드**. 운영진은 `/settings` "공개 프로필"에서 사진·소개 자가편집. 관리자는 `/admin/team`에서 순서·노출·대표 지정.

- **브랜치**: `feat/team-profiles`(커밋 0a72134, origin 푸시됨). ⚠️ **git worktree `/mnt/c/dev/wee-linked-team-profiles`에서 작업** — 본 디렉토리 `/mnt/c/dev/wee-linked`는 다른 에이전트가 `feat/hero-live-content`로 동시 작업 중이라 격리함(동시작업 충돌 복구 완료).
- **데이터**: `team_profiles`(user_id PK). is_lead/sort_order=admin 전용(guard 트리거+`admin_set_team_meta` RPC). 표시명은 행에 저장(`site_content.master.name`="조열음"에서 시드 — 운영 is_master 계정 display_name은 "열음쌤"이라 profiles 의존 금물). 리드 없으면 `MASTER` 상수 폴백(히어로 안 깨짐). 운영진 사진은 site-assets `team/{uid}/`(경로 스코프 RLS).
- **레이아웃(2026-06-20)**: notiontalk /about-us 방식 = 상단 **스티키 썸네일 바로가기**(데스크톱 9명 한 줄, `top-16 md:top-[88px]` — 헤더 h-[88px] 맞춤) + 운영진별 **풀 섹션 스택**(`team-roster.tsx`). 카드 그리드(`team-card.tsx`)는 미사용(보존).
- **운영 DB 상태**: 0025 **직접 SQL 적용**(supabase db push 아님 — 0024 미적용·0021 로컬無). schema_migrations 0025 기록. 보안 스모크 8/8. pg는 `/tmp/pgmod` 격리 설치(세션마다 재설치 필요).
- **🚨 실계정 vs 데모 혼재**: 운영진 9명 중 **박주혜(=주혜쌤 innerpeacewee@naver.com)·홍다운(=나무쌤 daun47@naver.com)은 실계정으로 합침**(2026-06-20, staff승격+데이터/사진복사+데모 삭제). 나머지 7(서희경·하수빈·이원영·이나리·예시⑦⑧⑨)은 **데모 `@weetest.kr`**(비번 WeeDemo!2345, staff) 유지. 리드 조열음=실계정(chanyang8907). 동물 SVG 아바타 6(서희경 곰 등)·실사진(박주혜·홍다운·이나리). **데모는 실수로 건드리지 말 것** — 실제 운영진 가입/오픈 직전 일괄 삭제 예정. 🔑 storage.objects엔 auth.users cascade FK 없음 → 계정 삭제해도 photo_url 사진은 살아있음(검증됨).
- **🔔 미처리 매칭**: 하수빈도 실계정(sbinnmm@naver.com, 이미 staff) 존재하나 데모 하수빈은 "준비 중" 자리표시뿐(합칠 데이터 無). 실제 staff 히그쌤·씨앗쌤·날쌤·재성쌤이 나머지 운영진(서희경·이원영 등)인지 미확인 — 사용자 매핑 필요.
- **🚩 남은 것**: `vercel --prod`(memory: main push≠prod — 확인됨, wee-linked.com 아직 구버전). 단 **예시⑦⑧⑨·"준비 중"이 라이브 노출**되므로 데모 정리/실데이터 후 배포 권장. 실제 운영진 = 본인 가입→admin staff승격→/settings 자가편집→카드 자동노출.
- **함정**: Supabase Storage **`x-upsert:true` 헤더는 경로스코프 RLS에서 신규객체도 403**(INSERT인데 UPDATE 권한 요구) → 업로드는 헤더 없이 고유경로. SVG 업로드는 차단되어 PNG 래스터화(playwright)로 우회.
- **플랜 편차**: 통합 함정 제거 위해 `CONTENT_SECTIONS`의 master 섹션 제거(타입·MASTER·폴백 보존). 마스터 본문은 이제 본인이 /settings에서 편집. 상세 `implementation-notes.md`.

관련: [[project_wee-linked-deploy]] [[project_wee-linked-content-admin]] [[feedback_readonly-agent-restrict-tools]]
