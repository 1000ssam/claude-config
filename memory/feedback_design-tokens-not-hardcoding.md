---
name: 디자인은 하드코딩 금지, 변수/시맨틱 클래스 기반 리팩토링
description: 리디자인 작업 시 Tailwind 하드코딩 값(rounded-2xl, text-xs, bg-primary 등)으로 다른 하드코딩을 대체하지 말고, CSS 변수와 시맨틱 유틸리티로 리팩토링할 것
type: feedback
originSessionId: c5227e49-626a-4a00-b4f9-2e92644e2cef
---
리디자인 시 하드코딩된 Tailwind 값(`rounded-lg`, `text-xs font-bold`, `shadow-sm` 등)을 다른 하드코딩 값으로 단순 치환하지 않는다. 디자인 시스템 변수/시맨틱 클래스로 리팩토링해야 한다.

**Why:** 하드코딩 치환은 매번 디자인을 바꿀 때마다 페이지를 전부 다시 편집하게 만든다. 사용자가 2026-04-17 ExamGuard Minimax 리디자인 작업에서 명시적으로 지적: "하드코딩을 다시 하드코딩하는 게 아니라 모두 변수 대응형으로 리팩토링을 해야지".

**How to apply:**
- globals.css `@layer components`에 시맨틱 유틸리티 정의: `.heading-page`, `.heading-section`, `.card-surface`, `.card-hoverable`, `.nav-link` 등
- 페이지에서는 이 시맨틱 클래스만 사용. 다음 리디자인 때는 globals.css만 수정하면 전체 전환 완료
- 타이포그래피: `h1`/`h2`/`h3` 태그는 globals.css의 @layer base에서 자동 스타일링. 페이지에서 `text-2xl font-bold` 같은 클래스를 또 붙이지 않는다
- 색상: `bg-blue-500` 같은 컬러 리터럴 금지. `bg-primary`, `bg-accent`, `bg-muted`, `text-muted-foreground` 등 시맨틱 토큰만 사용
- 그림자·라디우스도 마찬가지. `shadow-subtle`, `shadow-brand` 같은 시맨틱 토큰만 참조
- inline `style={{ letterSpacing: ... }}` 금지. globals.css로 옮긴다
- 컴포넌트(Button/Card/Badge/Dialog) variant에 디자인을 인코드. 소비자가 `className`으로 라디우스·패딩·색을 덮어쓰지 않게 한다
