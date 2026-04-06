# Notion API Bulk Upsert 성능 테스트 결과

## 배경

- Notion API에는 네이티브 bulk upsert 엔드포인트가 없음 (2026-03-11 최신 API 기준)
- Make.com의 Notion 모듈에서 "벌크 업서트"가 매우 빠르게 동작하는 것을 관찰
- 실제 원리를 파악하고 최적화된 upsert 패턴을 실험

---

## 핵심 발견 1: Notion Rate Limit의 실체

- **공식 문서**: "평균 초당 3요청, 버스트 허용"
- **실제 한도**: 15분당 2,700콜 (= 평균 3/초)
- **중요**: 이것은 하드캡이 아니라 평균이므로, 짧은 시간 동안 동시에 15건 이상을 보내도 429 에러가 발생하지 않음

### 동시성별 성능 테스트 (각 20건 Create)

| 동시성 | 소요시간 | 건/초 | 429 에러 |
|--------|----------|-------|----------|
| 3 | 17.7초 | 1.1 | 0 |
| 5 | 8.9초 | 2.2 | 0 |
| 10 | 5.1초 | 3.9 | 0 |
| 15 | 3.3초 | 6.1 | 0 |

> 동시성을 3에서 15로 올리면 처리량이 약 5.5배 증가하며, 429 에러는 발생하지 않았다.

---

## 핵심 발견 2: Upsert 전략 비교

### 전략 A: 건바이건 쿼리 (비최적화)

- 매 건마다: `query(필터)` → 존재여부 판별 → `create` 또는 `update`
- 건당 API 2콜 소모
- 100건 upsert (동시성 3): **129.4초** (0.77건/초)

### 전략 B: queryAll 캐시 + 높은 동시성 (최적화)

1. `queryAll`로 DB 전체를 한번에 조회 → 로컬 Map에 캐싱 (약 1.2초)
2. Map에서 존재여부 판별 (로컬, 0ms)
3. `create` 또는 `update`만 실행 (건당 API 1콜)
4. 동시성 15로 병렬 처리
- 100건 upsert: **33.6초** (3.0건/초), 429 에러 0건

### 비교표

| 전략 | API 콜 수 | 소요시간 | 건/초 | 개선율 |
|------|-----------|----------|-------|--------|
| A: 건바이건 쿼리, 동시성 3 | ~200회 | 129.4초 | 0.77 | 기준 |
| B: queryAll 캐시, 동시성 15 | ~101회 | 33.6초 | 3.0 | **3.9배** |

---

## 핵심 발견 3: 손익분기점

queryAll 캐시 전략은 고정 비용(queryAll 1회 + 페이지네이션)이 있으므로 소량에서는 오버헤드가 됨.

| DB 기존 행 수 | queryAll 비용 | 손익분기 upsert 건수 |
|--------------|--------------|-------------------|
| ~100건 | ~1초 (API 1콜) | ~4건 |
| ~500건 | ~5초 (API 5콜) | ~20건 |
| ~1,000건 | ~10초 (API 10콜) | ~40건 |

**실질적으로 10건 이상이면 벌크 전략(전략 B)이 유리하다.**

---

## 구현 패턴 요약

### 단건 upsert (10건 미만)

```javascript
async function upsertPage(dbId, matchKey, matchValue, properties) {
  // title 타입: { title: { equals: value } }
  // rich_text 타입: { rich_text: { equals: value } }
  const filterType = isTitle ? 'title' : 'rich_text';
  const query = await queryDatabase(dbId, {
    filter: { property: matchKey, [filterType]: { equals: matchValue } },
    pageSize: 1,
  });
  if (query.results.length > 0) {
    return await updatePage(query.results[0].id, { properties });
  } else {
    return await createPage(dbId, properties);
  }
}
```

### 벌크 upsert (10건 이상)

```javascript
async function bulkUpsert(dbId, matchKey, items, { concurrency = 15 } = {}) {
  // 1. 전체 DB를 한번에 조회 → 로컬 캐시
  const allPages = await queryAll(dbId);
  const cache = new Map();
  for (const p of allPages) {
    const val = extractPropertyValue(p, matchKey);
    if (val) cache.set(val, p.id);
  }

  // 2. 캐시 기반으로 create/update 분기, 동시성 제어
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(chunk.map(async (item) => {
      const existingId = cache.get(item.matchValue);
      if (existingId) {
        await updatePage(existingId, { properties: item.properties });
        return 'updated';
      } else {
        await createPage(dbId, item.properties);
        return 'created';
      }
    }));
    results.push(...settled);
  }
  return results;
}
```

### 429 에러 처리 (재시도 로직)

```javascript
// Retry-After 헤더를 존중하는 재시도
if (err.status === 429) {
  const wait = parseInt(err.response?.retry_after || '1', 10);
  await new Promise(r => setTimeout(r, wait * 1000));
  // 재시도
}
```

---

## 주의사항

1. **필터 타입이 속성 타입에 따라 다름**: `title` → `{ title: { equals } }`, `rich_text` → `{ rich_text: { equals } }`, `number` → `{ number: { equals } }` 등
2. **queryAll 페이지네이션**: Notion API는 한번에 최대 100건만 반환하므로, `start_cursor`를 이용한 자동 반복 조회 필요
3. **15분 예산 관리**: 2,700콜/15분을 넘기면 429 발생. 대량(수백 건) 처리 시 진행률 모니터링 권장
4. **updatePage body에 page_id 넣지 말 것**: 최신 API에서 validation error 발생 (테스트 중 발견한 버그)

---

## 테스트 환경

- Notion API Version: 2022-06-28 (CRUD), 2026-03-11 (File Upload)
- Node.js v24.13.1
- 테스트 일시: 2026-03-18
