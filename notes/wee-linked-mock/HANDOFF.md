# wee-linked 랜딩 리디자인 — HANDOFF

> 작성: 2026-06-15 · 갱신: 2026-06-15(모바일 반응형 완료) · 다음 세션은 **고도화(§6-B)** 진행

---

## 0. 한 줄 요약
상담교사 커뮤니티 **위링(wee-linked)** 랜딩 리디자인 시안. 레퍼런스 **mymind**, 팔레트 **더스티 로즈 × 미스트 블루(1번)**, 디스플레이 폰트 **제주명조(Jeju Myeongjo)**, **왼쪽 정렬**, **섹션 형태 변주(아키타입 교차)** 데스크톱 시안 완성. **모바일 반응형(clamp 유동 타이포 + @768/@430 구조 붕괴 + 햄버거 드로어)까지 적용 완료.** 가로 overflow 0px(360~1024 실측).

## 0-1. 이번 세션 변경 (2026-06-15 모바일 반응형)
- **유동 타이포**: 디스플레이 7곳 `clamp()` 화(상한=기존 데스크톱 값 → 데스크톱 회귀 없음). h1 90·진술/마스터/클로징 48·모먼트/앱밴드 32·피처카드 30.
- **@768 구조 붕괴**: `.frame` 100%, `.wrap` 패딩 20, 보드 4→2열, feat2/moment/appband/footer 스택, 모먼트 텍스트 우선(`.moment.rev .copy{order:0}`).
- **모바일 nav**: 가로 메뉴 숨김 → 햄버거 버튼(인라인 SVG, 열림 시 X 모핑) + 아코디언 드로어(`.nav-drawer`, body `.nav-open` 토글, 링크 클릭 시 닫힘). JS는 기존 변형 스크립트 하단에 `classList` 방식으로 추가(`body.className` 변형 로직과 비충돌).
- **앱밴드 모바일 재설계**: `.appwin{width:600px}` 절대배치 "탈출" → 모바일선 `position:relative;width:100%`, 칩을 위로(stage flex-column).
- **@430 미세조정**: 히어로 장평 완화(scaleX .96), 자료실 1열, 푸터 1열, 마스터 아바타 축소.
- 🐞 **버그 2건 수정**(데스크톱에도 잠재):
  1. `<br>` 강제개행을 모바일서 `display:none` 하니 단어가 공백 없이 붙음("자료를손쉽게") → 규칙 제거, 짧은 br 유지.
  2. **`.sheet .ic.b` 가 본문 `.sheet .b{flex:1}` 와 클래스 충돌** → 파란 PDF/DOCX 아이콘이 늘어남(데스크톱 라이브에도 존재) → `.ic.b{flex:none}` 명시로 해결.
- 렌더: `shoot-mobile.mjs`(390/768/1180 + 드로어), `shoot-mobile-crops.mjs`(섹션별 locator 크롭). 결과 `mob-390.png`·`mob-390-menu.png`·`mob-768.png`·`mc-*.png`·`dsk-sheets.png`.

## 0-2. 추가 변경 (2026-06-16)
- **디스플레이 폰트 → 제주명조(Jeju Myeongjo)** 채택, 히어로 응축(scaleX/자간) 해제. 상세는 §2 타이포.
- **칼럼 카드 예시(`.mini-quote`) → 고딕(sans)** — 제주명조 제목과 구분.
- **🆕 히어로 구성 V2** — 네비바 확대(769+) + 네비↔히어로 간격 확대 + **카드 프리뷰를 히어로 우측 단으로**(2단 grid, 1000+). mymind식 "첫 화면 중앙 정렬감" 확보. 중간폭(769~999)은 단일 중앙 히어로(V1형)로 폴백, 모바일(≤768)은 기존 스택 유지. 전 구간 overflow 0px.
  - 임계값 메모: 2단은 **min-width:1000**(좁은 데스크톱서 84px 헤드라인 깨짐 방지), 네비 확대는 **min-width:769**. 마스터 `<style>` 끝 "히어로 구성 V2" 블록.
  - 비교 산출물: `fold-current/v1/v2.png`, 소스 `var1-nav.html`·`var2-board-right.html`(V1은 미채택 보관). 검증 `v2-1280/1024/900/390.png`.
- ✅ **라이브 반영 완료** (모바일 반응형 + 제주명조 + V2 히어로 전부 배포): https://wee-linked-demo.vercel.app

## 1. 라이브 (배포)
- 공개 URL: **https://wee-linked-demo.vercel.app** (HTTP 200, 로그인 벽 없음)
- 프로젝트: `1000s-projects-a51f0c2a / wee-linked-demo` · 대시보드: https://vercel.com/1000s-projects-a51f0c2a/wee-linked-demo
- ⚠️ 이건 **디자인 시안**. 실제 서비스 `wee-linked.com`(Next.js+Supabase)과 **완전 별개**. 혼동 금지.
- `noindex` 적용 중(검색 비노출). 검색 공개 원하면 `<meta name="robots">` 제거.

## 2. 확정된 디자인 결정 (LOCK-IN — 다음 세션에서 유지)
- **레퍼런스**: mymind ( https://mymind.com/what ). "절제된 파스텔 + 에디토리얼 세리프 + 섹션 형태 변주".
- **팔레트(1번, globals.css `--color-*` 매핑)**:
  - bg `#ffffff` · ink(본문) `#2b2630` · muted `#8c8590` · line `#efebee`
  - 로즈(주연): soft `#faeef3` / accent `#e3aebf` / strong `#d093a7` / ink `#b0617e`
  - 미스트 블루(조연): soft `#eef4fb` / `#aec4e0` / ink `#5a7fa6`
  - 하이라이트(문장 속 형광펜): rose `#f6d3e0`·blue `#d6e6f5`·lilac `#e7ddf4`
  - 글로우: rose `#f6d9e4`·blue `#dde9f5`·peach `#f8e6dd`
- **팔레트 사용 원칙**: ①면적 90/8/2(흰색90·로즈옅은면8·채도포인트2) ②로즈 주연·블루 조연 한 점 ③큰 색면 금지(히어로·CTA는 글로우로만) ④대비는 잉크가 담당 ⑤채도 천장=더스티(쨍한 캔디색 금지).
- **타이포** (🔄 2026-06-15 디스플레이 폰트 교체):
  - 디스플레이=**제주명조(Jeju Myeongjo)** 세리프(구글폰트). 정갈·따뜻한 정통 명조. ⚠️ **굵기 400 단일**(디필레이아·송명과 동일 한계)이나 획 균일해 소형에서 더 안정적. 라틴은 평범 → 라틴 악센트는 Newsreader 유지. `font-synthesis:none` 유지.
  - ❌ 폐기: 디필레이아(고대비·소형 깨짐·라틴 약함). 후보 비교는 `font-references.html/png`(8종)·`hero-*.png`(in-context) 참조. v-bold 변형은 여전히 Hahmlet.
  - 본문/UI/하이라이트/작은 카드=**Pretendard**. **칼럼 카드 예시 인용(`.mini-quote`)도 고딕(sans)으로 변경** — 제주명조 제목과 상하 인접 시 구분 안 돼서(2026-06-15).
  - **위계 사다리(왼쪽 정렬 기준)**: H1 히어로 90px(clamp) ≫ 진술·마스터·클로징 48px(clamp) > 섹션 헤드 30~32px(clamp) > 본문 16px(고딕).
  - 🔄 **히어로 응축 해제**: 기존 `scaleX(.84)`+자간`-.06em` → **장평 100%(transform 없음)·자간 -.02em·line-height 1.12**(웹 일반 규격). 모바일 hero scaleX 오버라이드도 제거. 가로 overflow 0px 유지(360~768 실측).
- **정렬**: 전부 **왼쪽 정렬** 확정. (가운데/굵게 변형도 코드에 토글로 살아있음 — §4)
- **카드 시스템**: 하드보더 대신 다층 소프트 그림자(`--sh-card`/`--sh-float`)로 띄움 + 라운드 18~26px + 연한 보더(`--card-line`).
- **섹션 아키타입 변주(mymind 원칙 = 연속 섹션이 같은 형태 금지)**:
  1 히어로(타이포+글로우) → 2 보드(빽빽 마조너리) → 3 진술(여백 타이포) → 4 **2-up 피처카드**(커뮤니티+칼럼, 비주얼 박고+세리프+칩) → 5 자료실(텍스트↔자료카드) → 6 **앱 밴드**(틴트면+탈출하는 앱창+칩) → 7 마스터(타이포+글로우) → 8 클로징(타이포+글로우).
  - **주석 칩 모티프**(`.chip-note`): "오늘의 이야기"·"이달의 칼럼"·"내 PC에만 안전 보관" — mymind 시그니처.

## 3. 파일 맵 (`/mnt/c/dev/notes/wee-linked-mock/`)
- **`mymind-native.html`** ← **마스터 소스** (모든 작업은 여기서). 단일 HTML, 외부 의존=구글폰트+Pretendard CDN뿐(로컬 이미지 없음, 보드/아이콘은 CSS·인라인SVG).
- `wee-linked-demo/index.html` ← 배포본(위 파일에서 tagbar 제거한 클린 카피). **자동 동기화 아님** → §5 재생성 필요.
- 렌더 결과: `mymind-native.png`(풀), `native-hero.png`/`native-moment.png`, `new-feat2.png`/`new-appband.png`, `cards-sheets.png`, `var-left/center/bold.png`, `font-compare.png`(세리프 6종).
- 레퍼런스: `refs/mymind-*.png`, `refs/what/s00~s12.png`(mymind /what 슬라이스 — 아키타입 연구 자료), `refs/`(13개 사이트), `reference-catalog.html`(팔레트 도출 카탈로그).
- 폐기/이전 시안: `mymind-mock.html`(중앙 히어로 구버전), `palette-preview.html`, `board-*.html`.

## 4. 렌더/프리뷰 방법
```bash
cd /mnt/c/dev/notes/wee-linked-mock
node shoot-native.mjs      # mymind-native.html → mymind-native.png (풀페이지)
node shoot-crop.mjs        # 히어로/모먼트 디테일 크롭
node shoot-variants.mjs    # 정렬/굵기 변형 3종 (var-left/center/bold.png)
```
- 정렬/굵기 토글: body 클래스 `v-left`(기본)·`v-center`·`v-bold`(=함렛 굵게). 파일 끝 `<script>`가 `#left/#center/#bold` 해시로 세팅하지만 **해시만 바꾸면 리로드 안 됨** → 스크립트는 `p.evaluate`로 클래스 직접 주입함.
- playwright 경로: `file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js` (shoot 스크립트 상단 참조).

## 5. 배포 (재배포 + 배포본 재생성)
```bash
cd /mnt/c/dev/notes/wee-linked-mock
# 1) 마스터 → 배포본 재생성 (tagbar 제거 + 제목 교체)
node -e 'const fs=require("fs");let h=fs.readFileSync("mymind-native.html","utf8");h=h.replace(/<div class="tagbar">[\s\S]*?<div class="frame">/,"<div class=\"frame\">");h=h.replace(/<title>[\s\S]*?<\/title>/,"<title>위링 · 상담교사를 잇는 공간 (디자인 시안)</title>");fs.writeFileSync("wee-linked-demo/index.html",h);'
# 2) 프로덕션 배포
vercel deploy /mnt/c/dev/notes/wee-linked-mock/wee-linked-demo --prod --yes
```
- Vercel 계정 `slowly007-beep` / 스코프 `1000s-projects-a51f0c2a`. CLI만 사용(MCP 금지).

## 6. 다음 세션 TODO

### A. 모바일 반응형 ✅ 완료 (2026-06-15) — 아래는 당시 체크리스트(전부 반영됨)
> 360~1024 가로 overflow 0px 실측. 재검수 포인트: 실기기(노치/safe-area), 가로모드, `prefers-reduced-motion`(드로어/호버 트랜지션) 정도 남음.
구 체크리스트(처리 완료):
- **`.frame`**: `max-width:1180px` 고정 → 모바일은 `width:100%`.
- **`header.nav`**: 가로 메뉴(`nav.menu`) → 햄버거 or 모바일 숨김.
- **`.hero h1`**: 90px·`scaleX(.84)` 과대 → `clamp()` 도입(예 `clamp(40px,11vw,90px)`), 모바일에선 장평 완화 고려.
- **`.hero .sub`/`.statement p`/`.master blockquote`/`.closing h2`**: 48px 등 → `clamp()`.
- **`.board`**: `column-count:4` → 모바일 2.
- **`.feat2`**: `grid 1fr 1fr` → 1열 스택.
- **`.moment`(자료실)**: `grid 1fr 1fr` → 1열 스택(+`.rev` 순서 처리, 텍스트 먼저).
- **`.sheets`**: 2열 → 모바일 1~2열.
- **`.appband .ab-in`**: `grid 0.9/1.1` → 스택. **`.appwin{width:600px}` 고정** → 모바일에선 폭 축소/스케일. "탈출 오버플로우" 연출은 모바일에서 재설계 필요.
- **`footer .cols`**: 4열 → 2열 or 1열.
- **글로우**: 고정 px 위치(`width:920px` 등) → 좁은 폭에서 넘침 점검.
- 모바일 QA용: `shoot-native.mjs` 복제해 viewport 390px 버전 추가 → 스크린샷 확인.

### B. 고도화 후보 (2순위)
- mymind `refs/what/s04` 식 **우클릭 "위링에 저장" 컨텍스트 메뉴 목업** 추가(아키타입 1종 더).
- 보드를 한 번 더 리치하게(실 썸네일 느낌/카드 종류 추가).
- **실제 콘텐츠/수치 반영**(현재 박상담·이마음 등 데모값, 받기 312 등 임시).
- 접근성: 색 대비(로즈 위 잉크), 포커스 링, `prefers-reduced-motion`, 시맨틱 헤딩 태그(현재 h1/h2/h3 혼재 — 실 구현 시 정리).
- 커스텀 도메인(예 `demo.wee-linked.com`) / noindex 해제 결정.
- 실제 `wee-linked.com` 코드로 이관 시 토큰을 `globals.css --color-*`로 단일출처화(§2 매핑 그대로).

## 7. 알려진 이슈 / 열린 결정
- 데모 데이터(이름·댓글수·받기수)는 전부 임시 목업값 — 실데이터 아님.
- `noindex` 유지 vs 검색 공개: 미결(사용자 결정).
- 디필레이아 라틴 글리프는 평범 → 라틴 많아지면 Newsreader 비중 검토.
- 배포본이 마스터의 수동 카피라 §5 재생성 안 하면 라이브가 안 바뀜(주의).

## 8. 핵심 레퍼런스 이미지 (다음 세션 먼저 열어볼 것)
- `refs/mymind-what-top.png` (히어로+하이라이트 문장), `refs/what/s01.png`(보드), `refs/what/s03.png`·`s04.png`(떠다니는 목업), 그리고 사용자가 준 2-up 피처카드(Image #3, 대화 참조).
