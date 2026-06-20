---
name: feedback_first-pass-ui-quality
description: "어떤 페이지/앱이든 첫 패스에서 \"와꾸\"가 잘 나오게 하는 범용 UI 원칙 (프로젝트 불문)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eb1a690f-4a77-4bdc-b744-7a7ea9bf3424
---

새 UI를 만들 때 첫 시도에서 톤·완성도가 잘 나오게 하는 범용 원칙. 특정 프로젝트 레시피가 아니라 매번 적용.

**Why:** 위링 랜딩이 한 번에 잘 뽑힌 건 운이 아니라 아래가 맞물린 결과였고, 사용자가 이를 재사용 원칙으로 남기라고 요청함.

**How to apply:**
1. **코드 전에 '취향'을 고정한다.** 색·폰트·무드를 내가 고르지 말고, 구체적 비교안(컬러+폰트 2~3안, 가능하면 ASCII/스니펫 프리뷰)을 `AskUserQuestion`으로 제시해 사용자가 고르게 한다. 결과물이 취향에 맞는 게 아니라 시작부터 일치하도록 설계된다. 범위·데이터 모델 같은 분기 결정도 코드 전에 확정.
2. **디자인 토큰 단일 출처.** 색/그림자/radius/폰트를 한 곳(CSS `@theme`/변수)에 정의하고 컴포넌트는 참조만(`bg-accent` `text-ink`). 색 하드코딩 금지 → 화면 전체가 저절로 한 가족처럼 보임. (→ [[feedback_design-tokens-not-hardcoding]])
3. **'AI 슬롭' 디폴트를 의도적으로 금지.** 싸 보이는 주범을 먼저 차단: 이모지 아이콘 금지·SVG만([[feedback_no-emoji-in-ui]]), 한글 `word-break:keep-all`([[feedback_korean-linebreak-visual-qa]]), 거친 그림자 대신 낮은-blur 따뜻한 그림자, 충분한 radius·여백. **고급스러움 = 비싼 효과 추가가 아니라 싸구려 디폴트 제거.**
4. **콘텐츠는 진짜로.** lorem ipsum 금지. 실제 사실을 조사해 카피에 넣고, 명확한 콘셉트/브랜드 의미에서 글·색·여백이 한 방향을 가리키게 한다. 콘셉트가 선명하면 디자인이 따라온다. 단 출처 없는 정보 발명 금지([[feedback_no-fabrication]]).
5. **한 패스 = 한 응집 단위.** 백엔드 등은 분리하고, 한 번의 시각적 호흡으로 끝까지 다듬을 수 있는 범위로 좁힌다.
6. **검증을 정직하게.** 빌드 통과 ≠ 시각 QA. 폰트 적용·모바일 줄바꿈·애니메이션은 실제 URL에서 육안 확인이 필요하다고 명시([[feedback_measure-layout-before-changing]]).

참고 스킬: frontend-design / soft-skill / taste-skill / make-interfaces-feel-better (무드·디테일 보강 시).
