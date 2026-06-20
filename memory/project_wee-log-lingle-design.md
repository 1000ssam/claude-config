---
name: wee-log-lingle-design
description: "wee-log 앱명 '링글(lingle)' 확정 + wee-linked 패밀리룩 v2.1 + 홈 대시보드 재구성 — 2026-06-12 main 머지 완료"
metadata: 
  node_type: memory
  type: project
  originSessionId: 17a6907a-64d7-478f-946c-f80cb3a9204a
---

# 링글(lingle) 브랜딩 + 패밀리룩 + 대시보드 (2026-06-12 main 머지, 4278936)

- **앱명 링글 확정** (위링 패밀리, '글로 쓰다'=상담 일지). 표시 영역만 교체 —
  **`productName`은 'Wee-Story' 의도적 유지** (Electron userData=DB 경로와 결합, 바꾸면 DB 마이그레이션 필요. 함부로 변경 금지)
- 브랜드 락업 `RingleLogo`/`RingleMark`(src/components/logo-ringle.tsx): 위링 파비콘(피치 라운드 사각+두 고리) 차용 + 아래 '글 획' 변주. Jua체 링글 + lingle 라벨
- **패밀리룩 v2.1 디자인 원칙(amie 레퍼런스에서 확립)**: 표면은 거의 순백(미색 배경 깔기 = 패착), 색은 콘텐츠·액센트에만, 피치(#d97f5c)는 CTA·today 등 극소 면적만. 토큰: globals.css :root 단일출처, 컬러 팔레트 전환 시스템 제거됨(palettes.ts·theme.ts 삭제)
- **홈 대시보드**: 날짜 헤딩+요약+CTA / 오늘의 상담 타임라인(today-timeline.tsx) / 그리드선 없는 캘린더(CalendarView 리스킨 — 주/월 토글·드래그·공휴일·학사일정 유지) / 사례 현황·장기 미접촉 top3·최근 기록(`sessions:recent` IPC 신설)
- 위젯 문법: WidgetLabel(작은 먹색 라벨) + "전체 >" 링크. 뷰 전환은 세그먼트 토글(역할 구분 — 통일하지 말 것)
- dev 주의: preload/main 변경 시 HMR로 안 닿음 → electron 재시작 필요 (`sessions.recent is not a function` 류 = stale preload)
- 시각 QA: `.qa/capture-window.ps1` (electron 소유 최대 창 캡처, 전체 화면 캡처 금지 — 개인 화면 유출). 관련: [[wee-log-audit-refactor]]

## 패밀리룩 v3.1 "에어" — wee-linked 토큰 재정렬 (2026-06-17 **main 머지 완료** 9fada44)
- **최종 방향(v3.1)**: 순백 면(배경·카드·사이드바 전부 #fff) + **차분한 블루 주연 `#4a6aa0`**(흰글 5.4:1) + 로즈는 로고·포인트 + **반투명 워시 포인트**(활성탭 `bg-primary/10`). "피로감" 피드백으로 v3(로즈주연)에서 저자극 튜닝. 보조텍스트 #646973(5.5:1)로 가독 확보. ink #20242e 앵커.
- 🔄 **원본 복구**: `git checkout d789947 -- src/globals.css tailwind.config.ts ...` → 원본 v2.1(피치×세이지) 복원. 전체 가이드 = `design system/THEME-HISTORY.md`(원본 :root literal 백업 포함).
- 흰 사이드바 대응: 활성탭 흰카드+그림자 → 반투명 블루 워시로 교체(panel-item·section-panel·rail-item·ui/sidebar 4파일).
- 배경(중간단계 v3): wee-linked.com이 **더스티 로즈 × 미스트 블루(mymind)** 로 리디자인되며 앱(웜 피치×세이지 v2.1)과 싱크 깨짐 → 앱을 웹 새 정체성에 재정렬.
- 방식: **shadcn 변수 이름 유지, 값만 교체**(globals.css `:root`) → 전 컴포넌트 자동 리스킨. wee-linked(Tailwind v4 `@theme` hex) → wee-log(v3 HSL)은 hex→HSL **결정론 변환**(`/mnt/c/dev/notes/wee-linked-token-convert.mjs`, WCAG 대비 포함).
- 핵심값: primary=rose-ink `#b0617e`(파스텔 로즈는 대비 미달→면/로고용 `--rose #e3aebf`), 성공·인증=블루 `#5a7fa6`(웹의 sage→blue 리매핑 따름), radius 16px, Wanted Sans 디스플레이 폰트 번들(`font-display` **opt-in**), 로고 마크 피치→로즈, 그림자 잉크 틴트 43,38,48.
- 빌드 통과. 차트=chart-palette.ts가 로즈 primary hue 기준 자동. 다크모드 없음(앱·웹 둘 다 라이트온리).
- 빌드 통과. 차트=chart-palette.ts가 블루 primary hue 기준 자동. 다크모드 없음(앱·웹 라이트온리). 비교 프리뷰 `design system/token-B2-air.html`·`token-compare-AB.html`. HANDOFF=`HANDOFF-design-tokens.md`.
- 🆕 **Wanted Sans 디스플레이 폰트 제거(2026-06-18, main 머지 완료 `0fb7f4e`)**: 앱엔 어디에도 미적용(`font-display` 클래스·변수 사용처 0건=죽은 번들)이라 woff2+`@font-face`+tailwind `fontFamily.display` 삭제 → **앱은 헤딩·본문 모두 Pretendard 단독**. ↑27줄의 "Wanted Sans 번들(opt-in)"은 폐기됨. 결정 근거(사용자): 패밀리룩 통일성은 색·로고·모양으로 이미 확보, 폰트는 기여 약한 레버 + 작업도구엔 중립 폰트가 더 맞음. ~1.29MB 번들 감소·빌드 통과·미사용이라 화면 변화 없음(시각 QA 불필요). 웹(wee-linked)은 Wanted Sans 유지.

## 사이드바 개편 (2026-06-17 main 머지 cda9fc5)
- 노션식 **워크스페이스 헤더**: 패널 상단에 "○○ 선생님의 상담실"(설정 `counselor_name` 자동, 없으면 '상담실'), 좌측 레일 브랜드 마크와 같은 h-12 줄. 섹션명은 그 아래 작은 라벨.
- **크롬(레일·패널·상단바)=옅은 쿨그레이(#f8f9fb=--sidebar-background), 본문=순백** 분리. 헤더 아래 전체 폭 가로 구분선(H안). 활성탭=반투명 블루 워시 `bg-primary/10`(흰 사이드바 대응, panel-item·section-panel·rail-item·ui/sidebar).
- 기능 아이콘 **Phosphor duotone**(`@phosphor-icons/react` 신규 의존성): House·Stack·Users·ChartBar·FileText·Gear·Megaphone·UsersThree·Archive, 레일에서 `weight="duotone"`. 교체 후보 갤러리=`/mnt/c/dev/notes/icon-gallery.png`(phosphoricons.com weight=Duotone).
- 브랜드 마크 = 로즈→블루 그라데이션 두 고리(컨테이너·밑줄 제거, `useId`로 그라데이션 id 고유화). logo-ringle.tsx.
- ⚠️ 남은 시각QA: 잠금 푼 **대시보드 실캡처 미완**(HMR로 앱 재잠금됨 — 비밀번호 필요). 잠금화면은 신톤 적용 확인됨(`/mnt/c/dev/notes/app-after.png`).
