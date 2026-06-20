# Notion 속성 select→multi_select 변경 → 필터 깨짐 + Next ISR이 stale 캐시로 동결

노션 UI에서 속성 타입을 **`select` → `multi_select`로 바꾸거나 옵션명을 변경**하면, 그 속성으로 **필터(query)하던 기존 코드가 `validation_error`로 깨진다.** 더 위험한 건, 그 쿼리를 쓰는 페이지가 **Next.js ISR(`export const revalidate`)** 이면 실패가 **사용자에게 안 보이고**, 옛 캐시를 계속 서빙해서 "겉보기엔 멀쩡한데 새 내용이 안 뜨는" 동결 상태가 된다.

실제 사례: newsletter-self-host의 레터 DB `유형` 속성을 select→multi_select로 바꾸고 옵션 `웰컴레터`→`웰컴`으로 변경 → 홈 목록 쿼리가 깨졌으나 라이브는 변경 이전 캐시를 계속 보여줘서 며칠간 발견 못 함.

## 증상

select 타입 가정으로 만든 필터를 multi_select 속성에 그대로 보내면:

```
validation_error
The property type in the database does not match the property type of the filter provided:
database property multi_select does not match filter select
```

- API를 직접 때려보면(스크립트 재현) 즉시 이 에러가 난다.
- **그러나 ISR 페이지는 에러를 삼킨다**: revalidate 주기마다 백그라운드 재생성이 실패해도 Next는 마지막 성공 렌더(stale)를 계속 서빙하고 로그만 남긴다 → 화면은 정상처럼 보임. 새 데이터 미반영이 유일한 단서.

## 진단 (추측 금지, 실측)

1. **실제 DB 스키마 retrieve** — 코드가 가정한 타입(select)과 라이브 타입(multi_select)을 대조. 옵션명까지 글자 단위로 비교(`웰컴레터`≠`웰컴`).
2. **코드의 필터를 그대로 재현 스크립트로 실행** — 에러나는지 직접 확인.
3. **라이브 페이지 내용 ↔ DB 기대값 대조** — 라이브가 "옛날 값"을 보이면 stale 동결 의심.

## 정답 — 필터·읽기 양쪽 다 전환

```javascript
// 필터: select → multi_select
// equals        → contains
// does_not_equal → does_not_contain
filter: { property: "유형", multi_select: { contains: "웰컴" } }
filter: { property: "유형", multi_select: { does_not_contain: "테스트" } }

// 읽기: .select.name(단일) → .multi_select[].name(배열)
const types = (page.properties?.["유형"]?.multi_select ?? []).map(o => o.name).filter(Boolean);
const isWelcome = types.includes("웰컴");   // === 비교 X, includes 사용
```

- 읽기 헬퍼를 `extractTypes(page): string[]` 하나로 단일화(DRY)해서 목록/판정/감사 스크립트가 같은 출처를 쓰게 한다.
- 옵션명 상수도 노션 스키마와 **글자 그대로** 일치시킨다.

## 캐시 동결 해소

- **코드 고쳐 새로 배포하면 ISR 캐시가 자동으로 비워진다**(Vercel은 배포 시점에 무효화). 별도 조치 불필요.
- 코드 배포 없이 노션 내용만 바꿔 즉시 반영하고 싶을 때만 `revalidateTag(...)` / `revalidatePath(...)`를 쓴다.

## 함정

- `select` 필터가 빈값/미포함을 통과시키던 로직(`does_not_equal`)은 multi_select에서 `does_not_contain`으로 바꿔도 "빈 태그·다른 태그는 통과" 의미가 유지된다 — 의도 보존 확인.
- multi_select는 한 레코드에 **여러 태그**가 붙을 수 있으므로 단일 문자열 비교(`type === X`)는 전부 `includes(X)`로.
- 테스트에 select 가정이 박혀 있으면 같이 깨지므로 필터 단언·픽스처를 함께 갱신.
- 같은 함정이 status↔select, 옵션 추가/이름변경에도 적용된다.
