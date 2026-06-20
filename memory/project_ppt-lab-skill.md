---
name: project-ppt-lab-skill
description: ppt-lab — PPT 디자인 하네스 연습용 제로베이스 샌드박스 스킬
metadata: 
  node_type: memory
  type: project
  originSessionId: 50fdce27-7a62-43f2-8e9b-7676765113d1
---

**🚨 2026-06-07 클린룸 재창조 (최신 — 이 내용이 우선, 아래 구 모델은 히스토리)**: 사용자가 "남의 레이아웃 큐레이션(ppt-deck→jay.pm.ai 상속 + Showeet 측정)을 공유하기 껄끄럽다"며 레이아웃 축을 **별도 클린룸 리포 `/mnt/c/dev/ppt-lab-rebuild`**(fresh git init, 리모트 없음)에서 1차 원리로 재창조.
- **상속 19 archetype·Showeet 측정 좌표 전부 폐기** → 공개 캐논(Müller-Brockmann 그리드·Zelazny 차트)에서 도출한 **자작 12×8 그리드 SSOT(`grid.json`)** + **23 아키타입 7 family**(Frame/Focus/Set/Contrast/Field/Structure/Data, `archetypes.md`). 좌표는 `gen-layouts.py`가 `grid_box(c0,cspan,r0,rspan)`로 결정론 생성(매직넘버 0).
- **폐기**: 스타일 `showeet`·`flat`, 팔레트 `Logistics Flat`, `_pptx-references/*`, `SOURCES.md`. **유지**: 110 룩(MIT)·`consulting`·`Cobalt Mono`·`velis`(CC0)·`myeongmungo`·house+5 use-팔레트.
- **신규 기능**: 이미지 카드(수업용 사진+설명 2컬럼, duo/trio/grid)·`media()` 플레이스홀더(이모지 없음)·`chart()` 20종(네이티브12+합성8: waterfall/funnel/gauge/gantt/tam_sam_som/bullet/slope/kpi).
- **출처 떳떳이**: `CANON.md`(Zelazny·Müller-Brockmann·Alley 크레딧 + 자작 범위 분리).
- **검증**: 23 아키타입 전수 빌드 클린 + 자체 시각QA(렌더→PNG 판독, system 코어겹침·quadrant 불균일·이미지카드 버그 수정 완료). 출처 grep 클린.
- **노션 등록 완료**: SKILLS 항목(`378dd1dc-d644-810a-a3bb-f6a95ae3e5f2`) 요약·본문·zip(`ppt-lab-skill.zip` 18파일)을 신모델로 갱신. **폰트 자산 창고 DB(`02da6509…`) 보존**(updatePageMarkdown 전체교체는 자식 DB 삭제 경고 → 본문에 `<database>` 태그 명시로 보존).
- ✅ **별개 스킬로 등록 결정(컷오버 안 함)**: 사용자가 "ppt-lab 그대로 두고 ppt-lab-rebuild로 새 스킬 등록" 지시. 신버전 = **`~/.claude/skills/ppt-lab-rebuild/`** (SKILL.md `name: ppt-lab-rebuild`, 부모 `.gitignore`에 추가, 자체 git repo). 구 `~/.claude/skills/ppt-lab`는 **무손상 유지**(흡수 모델 그대로). `/mnt/c/dev/ppt-lab-rebuild` 복제본은 divergence 방지 위해 제거(이력은 스킬 디렉토리에 보존). extract-look.py도 포트됨.
- **노션 엔트리: 조치 없음(사용자 결정)**: 노션 SKILLS 엔트리(`378dd1dc…`)는 제목 'ppt-lab'이나 내용·zip은 **신모델(=ppt-lab-rebuild)**. 사용자가 "노션에 구 스킬 필요 없다, 아무 조치 안 해도 됨" 지시 → **그대로 둠**(개명·복원 안 함). 즉 노션엔 신모델 1건만 존재(제목만 ppt-lab).
- **독립(콜드) 평가로 스타일 매핑 검증**(pptx XML 대조): 폰트·팔레트·룩·직교성 전부 정확 매핑 확인. 잡힌 결함 `_content_card()`/kpi가 card fill·border를 하드코딩해 스타일/룩 카드 테두리 미반영 → 수정 완료(커밋 `bfc9e23`, house=무border/consulting=0.75pt slate-300/bauhaus룩=2pt #1A1A1A XML 검증). 미존재 팔레트/스타일은 이제 stderr 경고. 노션 zip 재업로드 완료.
- ✅ **폰트 창고 DB(`02da6509…`) 일괄 채움 완료(2026-06-07)**: 덱 40폰트 중 **가용 36종 전부 TTF zip 첨부**(생성 29·갱신 11). 정합성 검증 통과 — 각 TTF의 실제 Windows family name(fonttools 추출)이 design-tokens.json 값과 **0 오차 일치**(한글/영문 혼용 함정 없음, Noto KR도 langID 동일). 독점 4종(Futura·Helvetica Neue·SF Pro Display·Hyundai Sans Head)은 파일 없는 스텁(`업로드 필요` 표기). 소스: Google Fonts 30 + Fontshare(Clash Display) + 시스템(Arial/Noto KR/Inter/Pretendard). TTF 원본은 `/mnt/c/dev/ppt-fonts/`.
- ✅ **로컬 Windows 설치 완료(사용자 폰트)**: 룩폰트를 HKCU 레지스트리+LocalAppData로 설치. **변수폰트(variable)는 GDI 열거/PowerPoint에서 누락** → fonttools `instantiateVariableFont`로 **정적 인스턴스 추출 후 설치**(38 변수폰트→정적). 다축(opsz/SOFT/WONK) 폰트는 전체 축 고정+패밀리명 강제 필요. **35/40 인식+렌더 검증**(Playfair Display 고대비 세리프 정상 렌더 확인). 설치 스크립트: `/mnt/c/dev/install-fonts.ps1`.
- ⚠️ **Fraunces 1종만 미해결**: 파일은 유효(family=Fraunces, upright, static)하나 반복 재설치로 **세션 폰트캐시 꼬임** → PowerPoint가 대체(산세리프) 렌더. **logoff/logon 또는 `Restart-Service FontCache`(관리자) 후 활성화 예상**. ~4 룩 영향.
- ⚠️ **독점 4종**(Futura·Helvetica Neue·SF Pro Display·Hyundai Sans Head): 재배포 불가 → 항상 대체. ~5 룩 영향.

---

`~/.claude/skills/ppt-lab/` — `[[project_ppt-deck-skill]]`(완성형)와 **별개의 격리 연습장**. 2026-06-02 구축. 사용자가 PPT 디자인 하네스 원리를 학습하며 **자기 PPTX 레퍼런스를 흡수해 나만의 변종·토큰을 제로베이스에서 쌓는** 용도.

**격리**: 자체 git repo(`git init`). 부모 `~/.claude/skills/.gitignore`에 `ppt-lab/` 추가해 claude-skills repo에서 제외. ppt-deck 절대 안 건드림.

**2026-06-04 대전환 — 더 이상 제로베이스 아님**: ppt-deck 골격 4종(layouts.json 19 archetype+chart_region, design-tokens 5팔레트, slide-types, build-template 1058줄)을 **베이스로 임포트**하고, 그 위에 **스타일 축**을 얹음. **`feat/style-axis` master 머지 완료(2026-06-04, origin de9d932)**. 스타일 축 구현·검증·머지 전부 종료. 남은 건 선택적 폴리시(나머지 빌더 card() 이관, mono/english 폰트 배선)뿐.

**2축 흡수 구조** (직교):
- 레이아웃 축: `extract-pptx.py` → layouts.json + build함수 + slide-types
- **스타일 축**(신규): `extract-style.py` → design-tokens `styles{ fonts{latin,ea}, components{card{radius,fill,border,shadow}} }`. 측정→흡수, 빌드엔 미등장(깔때기).

**스타일 = 폰트+컴포넌트, `--style <id>`로 결정론 선택**(디폴트 house):
- 폰트 **latin/ea 분리**: 영문→latin(폴백 **Inter**), 한글→ea(폴백 **Pretendard**). run 레벨 → 서구폰트 스타일서도 한글 안 깨짐. `_set_run_font` 단일진입점이라 **전 변종 즉시 적용**.
- 🚩 **폰트 탑재 필수**: 스타일 지정 폰트(Inter 폴백 포함)는 렌더머신에 설치돼야 결정론. 미설치=PowerPoint 임의대체. **흡수 시 그 레퍼 폰트 설치 여부를 사용자에 확인/요청**. (이 PC: Calibri·Pretendard·**Inter v4.1 설치 확인✅** 2026-06-04)
- 컴포넌트=프리셋(묶음). `card()` 헬퍼 + `shadow()`(oxml 직접주입, python-pptx 고수준 미노출). 빌더 변경: `apply_style()`/`card()`/`shadow()`/per-style `_set_run_font`/`--style`.
- styles 3종: house(deck기본+Inter/Pretendard), myeongmungo(자작=각진·1pt테두리), showeet(Calibri+그림자, 실측 _style.json서 도출).

**검증(2026-06-04 완료)**: ①결정론 역측정 — lab 자신의 extract-style로 산출물 측정 → radius/border/shadow·run폰트가 `--style`별로 결정론적 변화 확인. ②**시각 QA** — 3스타일 PowerPoint COM 렌더 픽셀 확인: house=둥근·무테·무그림자, myeongmungo=각짐·테두리, showeet=각짐·테두리·그림자+Calibri latin. **showeet=Calibri인데 한글 Pretendard로 두부 없이 렌더 = latin/ea 분리 실증.** 역측정과 픽셀 일치. card() 이관: 공용 `_column_card`(2C/3)+콘텐츠카드 4곳 완료. 나머지 변종 card() 이관은 선택적 후속.

**도구**: extract-pptx/extract-style/render-catalog/qa-runner. 워크드 예제: `catalog/EXAMPLE_명문고-cover.md`. SKILL.md 2축 흡수로 전면 재작성 완료(과거 "제로베이스" 단절 해소).

**2026-06-04 전부 master 머지 완료(89c9f2c)**:
- build_T 스텝박스 rect→card() 이관. 나머지 rect 사이트 전수 분류(대부분 카드 아니라 rect 유지가 맞음, md-radius는 설계 결정 보류).
- **덱 고르기 UX 파이프라인 2단계**: ①`tools/render-style-portfolio.py`(레이아웃축 render-catalog와 대칭인 스타일축 생성기): 전 스타일×`catalog/portfolio-sample.json` 빌드→qa-runner 렌더(DRY)→`_portfolio/<style>/slide_*.png` + `style-portfolio.html`(키보드 ←→슬라이드/↑↓스타일). ②`tools/render-deck-cards.py`: **덱 1개=PNG 1개** 카드(헤더 이름·특징·라이선스뱃지 + 표지 + 미리보기 카드/지표/차트, 특징·라이선스는 design-tokens에서 도출=DRY) + `deck-gallery.html`(클릭 그리드). 스타일 변경 시 ①→② 순서로 재실행.
- **첫 실전 흡수 velis**: lrk-slides-velis.potx(CC0) → velis 스타일(Arial)+Velis Teal 팔레트(id6, 틸/핑크). per-style 팔레트 힌트(`styles[*].palette`)로 흡수 덱이 자기 색으로 렌더. **⚠️ 흡수 한계: 템플릿(.potx)은 내용 슬라이드 0 → 테마층(폰트·팔레트)만, 컴포넌트(카드)·마스터 장식(예 Velis 틸 U자 프레임)은 못 줌.** 다운로드는 raw.githubusercontent CDN 차단 망 → api.github.com Contents API base64 우회.
- **스탯 팔레트 누수 수정**: build_N 액센트가 팔레트 밖 `green`을 써서 4번째 지표카드가 톤 이탈 → 교정. (아래 accent-role 시스템으로 발전·대체됨)
- **🎨 accent-role 시스템(a548f7a)**: 원칙을 ~~한 덱 한 톤~~ → **"한 덱 한 *정의된* 팔레트"**(모노든 멀티든)로 완화. 팔레트에 순서 있는 `accents:[primary,secondary,...]` 추가, `accent_cycle(n)` 헬퍼가 정의된 accent를 순회하고 부족분은 primary 명도로 패딩. 멀티색 빌더(build_3/W/N) 라우팅. **모노 팔레트→모노, 멀티→멀티, 항상 in-palette → out-of-palette 누수 구조적 불가**. 팔레트가 `accents` 미정의 시 기본 `["blue","orange"]`.
- **flat 스타일 흡수(showeet_transport-logistics)**: Calibri + 각진·무테·무그림자 solid + **Logistics Flat 멀티 팔레트(id7: 블루/오렌지/청록/레드)**. 멀티컬러 정체성 충실 재현. 일러스트(트럭·배)는 커스텀 아트라 미흡수. (라이선스: Showeet 표기의무, 스타일/추상토큰 축이라 안전.)
- **현재 5 스타일**(house/myeongmungo/showeet/velis/flat), **7 팔레트**. accent 시스템은 **ppt-lab만 반영, 프로덕션 ppt-deck 미이식**(사용자 선택). 향후 ppt-deck 이식 시 기본 accents 모노/멀티 결정 필요.
- **표지 축(보류)**: CC0/CC-BY 표지 레이아웃을 그대로 lift(텍스트만 교체)하면 스타일축이 못 잡는 장식 첫인상을 잡을 수 있음(검증됨). 단 라이선스가 스타일축(추상토큰=거의 안전)과 달리 **표현 복제라 CC0·CC-BY만, Showeet류 제외**. Velis 표지 자체는 별로라 정식화 보류.

**2026-06-07 — design-pick 룩 흡수(제3의 흡수 소스) + consulting 스타일**: 흡수 소스가 PPTX 측정만이 아님을 확립. **design-pick 룩 명세(MD)는 색·폰트·형태·하지말것을 규칙으로 적어둔 '의도까지 담긴 _style.json'** → `extract-style.py` 측정보다 풍부하므로 **명세→SSOT 직접 번역**으로 흡수(렌더 측정은 좌표 필요한 새 레이아웃에만 보조). 핵심 통찰: **design-pick 룩의 90%는 레이아웃 흡수가 아니라 style+palette 흡수**(다이어그램이 기존 19 archetype과 겹침) → 흡수하면 룩 종속이 풀려 어떤 레이아웃·팔레트와도 자유 조립. 첫 흡수=`ppt-consulting-precision-grid`(맥킨지식): `styles.consulting`(Arial/Pretendard, radius0+0.75pt헤어라인, **신규 `card.accent_edge` left/4px**) + `palettes[id:8]` Cobalt Mono(코발트 1색, accents=[blue], orange=blue 강제 mono). 엔진: `card()`에 `accent=`+`_accent_edge()`—강조막대 변/두께는 스타일, 색은 팔레트, 미지정 top/8px 레거시호환. `_column_card`·`build_N`·`build_VQ` 하드코딩 엣지/radius 제거→스타일 위임. **3축(style×palette×layout) 조립 검증**: consulting+8(네이티브)/+4(색 다이얼)/flat+8(컴포넌트 다이얼) 동일 spec 성립. 하위호환: 기존 5스타일 렌더 동일. **브랜치 `feat/absorb-consulting`(587a504, main 미머지)**. 기록 `catalog/consulting-absorption.md`, 데모 spec `catalog/consulting-absorption-demo.spec.json`. 남은 갭: 차트 "회색막대+1강조" 정책(styles.chart 블록), badge/connector 화살촉 프리셋, 미이관 변종(AR·X·V) radius.

**2026-06-07 — design-pick 110룩 전체 흡수(style+palette) + 공개리포 준비**: design-pick(=design-diversity, `epoko77-ai`, **MIT**) 카탈로그 110룩의 style+palette 본질을 흡수. **팔레트 8→15**(신규 9~15: Signal Orange·Amber Gold·Forest Green·Royal Violet·Terracotta Earth·Graphite Mono·Magenta Pop — 램프는 대표 팩 실측 강조색서 캔버스 향해 결정론 보간, mono는 accents=[blue]). **스타일 6→11**(신규: editorial-serif=Playfair·brutalist=Archivo Black+하드오프셋섀도·geometric-grotesk=Space Grotesk·mono-technical=IBM Plex Mono·soft-rounded=Quicksand+소프트섀도 — 각 컴포넌트 radius/border/shadow는 대표 팩 `shape` 실측 기반). **🐞 shadow() 함정**: color는 토큰해석 없이 hex 직박음, `alpha`는 (100-alpha)=투명도 → brutalist는 `#0A0A0A`/alpha0(불투명100%), soft는 alpha88(12%)로 교정. **권위 룩업표** `catalog/design-pick-absorption-map.md`(110룩→`--style`+`--palette`, 팔레트=강조색 RGB최근접·스타일=type축/폰트규칙, 전 15팔레트·11스타일 사용). 검증: 전 조합 build-template 데모빌드 통과 + 포트폴리오 11스타일×5슬라이드 PowerPoint COM 재렌더(card.png→slide_N.png 마이그레이션) + brutalist/soft-rounded/editorial-serif 육안검수 통과(Playfair 등 폰트 렌더머신 설치 확인). **귀속**: `THIRD-PARTY-NOTICES.md` 신설(design-pick MIT 전문+대표팩 출처+오픈폰트 안내). 브랜치 `feat/absorb-design-pick-all`(587a504→88024aa, **main 미머지·origin 미푸시**). **목표=ppt-lab 공개 리포 전환**. 라이선스 결론: design-pick MIT라 흡수·공개 OK, 리스크는 스펙배포 아닌 *프로덕션 산출물*(브랜드 워드마크/로고/사진)에 있어 산출물엔 자체 워드마크+오픈폰트 사용. 남은 갭: **레이아웃 축 미흡수**(아이소메트릭·블루프린트 등 새 기하구조는 필요 소수만 추후), 신규 스타일 폰트 렌더머신 설치 의존.

**🔑 흡수 라이선스 모델(핵심 재구성)**: 카탈로그/포트폴리오에 보여주는 건 **레퍼런스 덱이 아니라 흡수한 스타일 토큰을 내 중립 샘플에 입힌 내 빌드 결과물**. 시각 스타일/기법은 저작권 대상 아님→산출 PNG는 내 것(전시·커밋 안전). 레퍼런스 원본 .pptx는 절대 등장/커밋 안 함(`**/_pptx-references/*.pptx` gitignore로 강제, SOURCES.md가 출처·라이선스 원장). 표기의무(showeet=Showeet.com CC류)는 `styles[*].attribution`에 구조화→갤러리 자동 캡션. **이름 바꿔도 귀속 의무 안 사라짐(라이선스 워싱 금지)**. 덱 소스 추천: SlidesCarnival(CC BY)·Showeet·lrkrol Velis(CC0). 함정: Slidesgo 월3개한도, GitHub "ppt template"은 대개 생성라이브러리·LICENSE없으면 All Rights Reserved.
