# Notion API — 페이지 휴지통 처리: `archived` → `in_trash`

Notion API 버전 **2026-03-11**부터 페이지/DB를 휴지통으로 보낼 때 사용하는 body 필드가 `archived`에서 `in_trash`로 이름이 바뀌었다. 이전 코드/문서/AI 학습 데이터에는 여전히 `archived`가 남아 있어 처음 시도하면 거의 항상 실패한다.

## 증상

`PATCH /pages/{id}` 또는 `PATCH /databases/{id}`에 `{ archived: true }`를 보내면:

```
400 Bad Request
body failed validation: body.archived should be not present, instead was `true`.
```

## 정답

```javascript
// 휴지통으로 이동
await notion.call('PATCH', '/pages/PAGE_ID', { in_trash: true });

// 휴지통에서 복원
await notion.call('PATCH', '/pages/PAGE_ID', { in_trash: false });
```

응답 페이지 객체에서도 같은 필드명을 본다: `response.in_trash` (이전엔 `response.archived`).

## 대상 엔드포인트

| 엔드포인트 | body 필드 |
|---|---|
| `PATCH /pages/{id}` | `in_trash` |
| `PATCH /databases/{id}` | `in_trash` |
| `PATCH /blocks/{id}` | `in_trash` |
| `PATCH /comments/{id}` | (해당 없음, 코멘트는 별도) |

## 함정

- `properties` 같이 보내려고 한 번에 PATCH 묶지 말 것. 휴지통 이동은 별도 PATCH로 분리하는 게 안전 (properties 검증 실패 시 in_trash도 같이 롤백됨).
- `archived: false`로 "복원"하던 옛 코드는 `in_trash: false`로 치환해야 동작.
- Notion SDK(`@notionhq/client`) 2.2.x 이하는 여전히 `archived` 이름을 export — 사용 시 typedef 충돌. 모듈 버전 확인.

## 관련

- 스킬: `~/.claude/skills/notion-pilot.md` — 에러 패턴 가이드 테이블에 동일 항목 등록됨
- 실 발견 PR: running-challenge-3 (2026-05-14, 푸르공 중복 row 정리 중 발견)
