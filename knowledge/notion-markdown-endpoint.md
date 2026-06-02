# Notion 마크다운 엔드포인트 (2026-03-11) — 본문 읽기/쓰기 함정

Notion API `2026-03-11`부터 페이지 본문을 마크다운으로 다루는 엔드포인트가 생겼다.
SDK(`@notionhq/client` 5.x): `pages.retrieveMarkdown({ page_id })`, `pages.updateMarkdown({ page_id, type: "replace_content", replace_content: { new_str } })`.
`Notion-Version: 2026-03-11` 헤더 필수.

블록 `blocks.children.list`/`append` 구식 방식과 달리 **중첩목록·토글·콜아웃·표·체크박스·날짜멘션을 무손실 왕복**한다. 페이지 본문 복사/이관은 이 방식이 정답. (구식 list는 1레벨만 읽어 중첩 자식을 조용히 누락.)

## 함정 1: 이미지/파일 URL은 쓰기 시 재호스팅 안 됨
`retrieveMarkdown` 출력의 이미지는 `![](...)` + **만료성 pre-signed S3 URL**(prod-files-secure 등). 이걸 그대로 `updateMarkdown(replace_content)`하면 Notion이 재호스팅하지 않고 **빈 `![]()`로 버린다**(실측 확인). → 본문 이미지를 보존하려면 별도로 File Uploads API 재업로드 필요. 안 할 거면 "원본에서 확인" 안내로 대체.

## 함정 2: `<unknown>` 블록은 쓰기 거부
미지원 블록(북마크/임베드/링크프리뷰/브레드크럼/템플릿/자식DB) 또는 truncated(>~20k blocks) 콘텐츠는 `retrieveMarkdown`이 `<unknown url="..." alt="..."/>`로 내보낸다. 이걸 포함한 채 `updateMarkdown`하면:
`validation_error: The update page tool cannot safely create new <unknown .../> blocks`
→ **페이지 본문 주입 전체가 거부됨.** 해결: PATCH 전에 `<unknown ...>` 토큰을 정규식으로 제거하고 나머지 본문만 주입한다 (`/<unknown\b[^>]*\/>/g` + 페어 태그 `/<unknown\b[^>]*>[\s\S]*?<\/unknown>/g`). 제거된 부분은 사용자에게 원본 확인 안내.

## 출처
wee-log-migration v2→v3 본문 이관 구현 중 실측 (2026-05-27).
