# 관계망 그리기 인터랙티브 웹앱 — 핸드오프

## 맥락

인창고 김용천 선생님의 역사 수업 **"삼국통일 다시보기"**를 종이 워크시트에서 웹앱으로 전환. **활동 1(관계망 그리기) + 활동 2(은유 글짓기)** 범위. 활동 3·4는 제외.

## 프로젝트 위치

**`/mnt/c/dev/samguk-network`** (Windows 경로: `C:\dev\samguk-network`)

- Next.js 16 (App Router) + TypeScript + Tailwind v4 + tldraw v4.5
- 아직 git init 안 함
- dev 실행: `cd /mnt/c/dev/samguk-network && npm run dev` → `http://localhost:3000`
- WSL2 /mnt/c 특성상 초기 컴파일 1분 이상 소요 (Ready 후 첫 GET도 느림)

## 관련 원본 파일

| 경로 | 역할 |
|------|------|
| `/mnt/c/Users/user/Inbox/Desktop/워크시트_삼국통일다시보기_v2.hwpx` | 사료 + 활동 1~4 원본 |
| `/mnt/c/Users/user/Inbox/Desktop/수업매뉴얼_삼국통일다시보기_김용천.hwpx` | 수업 매뉴얼 |

## 확정된 결정 사항

### 학습 플로우
**B안 (사료 병행)**: 노드 캔버스에 던지면서 클릭 시 사료 팝업으로 탐구. C안(게이팅)은 자유도 원칙과 충돌해서 버림.

### 기술 스택
- **tldraw v4.5.10** (자유 드로잉 + 커스텀 shape + JSON snapshot + 터치 지원)
- **Next.js 16 + React 19 + TypeScript + Tailwind v4**
- 배포: Vercel (미배포)
- 저장: 1차는 로컬스토리지 (`persistenceKey: "samguk-network-v1"`)

### 관계 표현 방식
**하이브리드**: tldraw 화살표(binding) 주 + 자유 텍스트 메모 보조. 그림판식 freehand는 주 도구 아님.

### 관계선 프리셋 5종 + 자유 커스텀
워크시트 원본에 있는 5종:
- 우호 (solid, 화살촉 없음, green)
- 적대 (solid, 양끝 화살촉, red)
- 투항/항복 (solid, 단방향, orange)
- 망명 (dotted, 단방향, blue)
- 징집·강제이주 (dashed, 단방향, black)

선택된 화살표에 프리셋 버튼 누르면 즉시 스타일+레이블 적용. tldraw 기본 스타일 메뉴로 추가 커스텀 가능.

### 인물 번호 (★ 워크시트 v2 기준, 이전 메모와 다름)

| # | 인물 | 출신 | 출처 |
|---|------|------|------|
| ① | 문무왕 | 신라 | 삼국사기 |
| ② | 고구려 민중 | 고구려 | 구당서 |
| ③ | 가실 | 신라 | 삼국사기 |
| ④ | 귀실집사 | 백제 | 일본서기 |
| ⑤ | **연남생** | 고구려 | 천남생묘지명 |
| ⑥ | **왜군** | 왜 | 일본서기·구당서 |
| ⑦ | **백제 농민** (가상) | 백제 | — |

국가 5: 신라(orange) · 고구려(green) · 백제(blue) · 당(red) · 왜(violet)

### 폰트 세트
| 카테고리 | 대표 폰트 | 용도 |
|---------|---------|------|
| UI 기본 | **Pretendard Variable** | 버튼·메뉴·본문 |
| 고딕 대체 | Noto Sans KR, IBM Plex Sans KR | — |
| 명조 | **Noto Serif KR** / Gowun Batang | 사료 원문, 활동 2 본문 |
| 손글씨 | **Gaegu** / Nanum Pen Script | 노드/선 레이블 |
| 부드러움 | Gowun Dodum | 캐주얼 |

**tldraw CSS 변수 오버라이드** (`globals.css`):
```css
.tl-container {
  --tl-font-draw: var(--font-hand);    /* Gaegu */
  --tl-font-sans: var(--font-gothic);  /* Pretendard */
  --tl-font-serif: var(--font-serif);  /* Noto Serif KR */
}
```
→ tldraw 기본 폰트 피커(sans/serif/draw/mono)가 그대로 한글 폰트 세트로 동작. 별도 커스텀 피커 안 만듦.

## 파일 구조

```
app/
├── data/sources.json              # 인물 7 + 국가 5 + 프리셋 5
├── lib/
│   ├── types.ts                   # Country, Person, RelationshipPreset, SourcesData
│   └── sources.ts                 # JSON 로드 + personById/countryById 맵
├── components/
│   ├── Canvas.tsx                 # Tldraw 임베드 + 노드 생성 + 선택 리스너 (client)
│   ├── NodePalette.tsx            # 좌측 팔레트 (배치된 건 disabled)
│   ├── SourcePanel.tsx            # 우측 사료 패널 (명조체)
│   └── RelationshipPresets.tsx    # 상단 프리셋 바 (화살표 선택 시 등장)
├── globals.css                    # Tailwind + 폰트 CSS 변수 + tldraw 오버라이드
├── layout.tsx                     # <head> 웹폰트 link (Pretendard + Google Fonts)
└── page.tsx                       # "use client" + dynamic import Canvas (ssr:false)
```

## 핵심 구현 포인트

- **Shape meta**: `shape.meta = { kind: "country"|"person", countryId|personId }` → 셀렉션 리스너로 인물 노드 판별 → 사료 패널 오픈
- **editor.store.listen**: 모든 변경마다 `recomputePlaced()` + `syncSelection()` (노드 12개 O(n) 재계산, 비용 낮음)
- **프리셋 적용**: `editor.updateShape({ id, type: "arrow", props: { color, dash, arrowheadStart, arrowheadEnd, text } })` batch
- **배치 중복 방지**: `placedCountryIds / placedPersonIds` Set으로 팔레트 버튼 disabled 처리
- **SSR 회피**: `page.tsx`에서 `dynamic(() => import("./components/Canvas"), { ssr: false })`

## 완료된 작업

1. ✅ Next.js 스캐폴드 + tldraw 설치
2. ✅ 사료 데이터 JSON화 (v2 번호 기준)
3. ✅ 좌측 팔레트 + 캔버스
4. ✅ 사료 사이드패널 (인물 클릭 시)
5. ✅ 관계선 프리셋 5종 + 자유 커스텀
6. ✅ 한글 웹폰트 세트 + tldraw 폰트 변수 매핑
7. ✅ dev 서버 구동 확인 (HTTP 200)

## 미완료 / 다음 세션 할 일

### 즉시 할 일
- [ ] **사용자 브라우저 테스트 피드백 수렴** — UX 감 맞는지 확인
- [ ] **활동 2 UI 구현**
  - 상단 탭 `[활동 1 관계망]` `[활동 2 은유 글짓기]`
  - 좌: 인물 7 카드(사료 미리보기) / 우: `"OOO에게 삼국 통일은 ___ 이다"` + 이유 입력 / 우상단: 활동 1 미니뷰
  - 은유 TIP (직관 → 은유 2단계 힌트)
  - 최소 3명 체크, 모둠 분담 UI는 MVP 범위 밖
- [ ] **공유 메뉴**
  - PNG 저장 (`editor.toImage()` or `exportAs('png')`)
  - JSON 스냅샷 저장/불러오기 (이어하기용)
  - Web Share API (`navigator.share`) — 모바일에서 카톡·메일 네이티브 시트
  - 데스크톱 폴백: PNG 다운로드 후 "원하는 앱에 첨부" 안내
  - Kakao Share SDK는 MVP 범위 밖 (개발자 앱 등록 필요)

### 나중에
- [ ] 인트로 화면 (학습목표·사용법·시작 버튼)
- [ ] 교사 수합 뷰 (미정 — 선생님별 요구 달라 별도 협의)
- [ ] 백지도 배경 (선생님이 준비할 7세기 동아시아 지도)
- [ ] Vercel 배포
- [ ] 학교 기기 환경(태블릿·크롬북·터치) 실제 테스트

## 참고 — 사료 원문 재추출 명령

```bash
python3 "/home/user/.claude/skills/hwpx-skill/scripts/text_extract.py" \
  "/mnt/c/Users/user/Inbox/Desktop/워크시트_삼국통일다시보기_v2.hwpx" \
  --format markdown
```

## 워크시트 원본 안내문

### 활동 1
> 아래 백지도 위에 국가 5개(신라·고구려·백제·당·왜)와 인물 ①~⑦을 배치하고, 사료에서 추론한 관계를 선과 텍스트로 자유롭게 표현하세요.
>
> 관계선 예시 ─ 우호 · 적대 · 투항/항복 · 망명 · 징집·강제이주 (학생이 자유롭게 더 추가 가능)
>
> ※ TIP  인물을 특정 국가 안에 가두지 마세요. 국적이 아니라 처지·이해관계에 따라 자유롭게 배치.

### 활동 2
> 인물 ①~⑦ 중 최소 3명을 골라 "OO에게 삼국 통일은 (   )이다"를 완성하세요. 모둠원과 협의해 ①~⑦ 중 빠지는 인물이 없도록 합니다.
>
> ※ TIP  은유적 표현 권장. 막막하면 '직관적 표현 → 은유' 순으로 떠올려 보세요.
> 예: 삼국통일을 완수하여 마음이 편안하고 몸이 이완됨 → 안마 의자

## 설계 원칙 (반드시 유지)

1. **자유도 최대 보장** ★ — 색·굵기·대시·레이블·폰트 전부 학생 선택
2. **사료가 유일한 근거** — 앱 내에서 사료 원문 쉽게 열람
3. **인물은 국가에 종속 X** — 독립 이동 가능 (자동 연결하는 화살표 방식이라 국가 노드 밖에 둬도 무방)
4. **다면적 해석 허용** — "정답" 없음, 채점 로직 금지
