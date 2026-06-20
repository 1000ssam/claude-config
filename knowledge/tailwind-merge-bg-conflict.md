# tailwind-merge가 `bg-{color}` + `bg-gradient-*`를 충돌 처리 → 배경색 탈락

## 문제
shadcn의 `cn()`(= `tailwind-merge` + `clsx`)으로 클래스를 합칠 때,
**`bg-primary`(background-color)와 `bg-gradient-to-b`(background-image)를 같은 background 그룹의
충돌로 보고, 뒤에 온 쪽만 남긴다.** solid 배경색 위에 미세 그라데이션을 얹으려는 의도가
조용히 깨진다.

```js
import { twMerge } from 'tailwind-merge';
twMerge('bg-primary bg-gradient-to-b from-white/10 to-black/10')
// → 'bg-gradient-to-b from-white/10 to-black/10'   ← bg-primary 사라짐!
```

## 증상 (실제 발생: wee-log 버튼, 2026-06-05)
- 버튼 default variant를 `bg-primary bg-gradient-to-b from-white/10 to-black/10`로 작성
- 의도: teal 배경 + 위아래 미세 sheen/shade
- 실제: `bg-primary`가 머지에서 탈락 → 배경색 소실 → 페이지 배경(paper) 위에
  `white10%→black10%` 그라데이션만 남아 **버튼이 흰색 + 흰 글씨(안 보임)**로 렌더
- 함정 포인트: **빌드된 CSS 규칙(.bg-primary, gradient stops)은 전부 정상.**
  문제는 그 클래스가 **DOM 엘리먼트에 안 붙은 것**이라 CSS만 grep하면 못 잡는다.

## 진단 (결정론적)
CSS 들여다보기 전에 `twMerge`를 직접 돌려 클래스 생존을 확인하는 게 가장 빠르다:
```bash
node --input-type=module -e "
import { twMerge } from 'tailwind-merge';
const out = twMerge('<문제의 className 전체>');
console.log(out, '/ bg-primary 유지?', out.includes('bg-primary'));
"
```

## 원인
tailwind-merge는 동일 CSS 속성군(여기선 background)에 속하는 유틸리티 중
**마지막 것만 남기는** 게 기본 동작(의도된 충돌 해소). `bg-{color}`와 `bg-gradient-*`가
실제 CSS에선 `background-color` vs `background-image`로 공존 가능하지만,
twMerge 기본 설정은 둘을 한 그룹으로 묶어 버린다.

## 해결책 (택1)
1. **그냥 solid로** (권장, 명시적 > 영리한): `bg-primary` 하나만. sheen 포기.
   ```
   bg-primary text-primary-foreground hover:bg-primary/90
   ```
2. **두 속성을 한 선언으로 합치기**: `background` 단축속성 arbitrary로 색+그라데이션을
   1개 유틸에 담으면 충돌 그룹이 하나라 안 떨어진다(단 가독성↓, fragile).
   ```
   [background:linear-gradient(to_bottom,rgba(255,255,255,.1),rgba(0,0,0,.1)),hsl(var(--primary))]
   ```
3. **globals.css 전용 유틸 클래스**로 빼서 `background: linear-gradient(...), hsl(var(--primary));`
   한 줄로 정의(가장 유지보수 친화적). 컴포넌트엔 그 클래스 1개만 부여.
4. `twMerge`를 우회: 충돌나는 두 클래스를 `cn`에 같이 넣지 말고 별도 처리하거나
   `tailwind-merge`에 커스텀 config(extend)로 그룹 분리(과설계 주의).

## 적용 범위
`cn()`/`twMerge`를 쓰는 모든 shadcn 기반 프로젝트. 특히:
- `bg-{color}` + `bg-gradient-*` 조합
- 동일 속성군 충돌 일반: `shadow-sm` + `shadow-[custom]`, `rounded-md` + `rounded-xl`,
  `text-sm` + `text-[13px]` 등도 같은 메커니즘으로 뒤엣것만 남는다(이건 보통 의도대로지만,
  "두 개 다 적용되겠지" 가정하면 깨진다).

## 라우터 키워드
tailwind-merge 충돌, twMerge bg 충돌, cn 배경색 사라짐, bg-primary 탈락, bg-gradient 충돌,
shadcn 그라데이션 버튼, 버튼 흰색 렌더, 클래스 머지 누락, background-color background-image 공존
