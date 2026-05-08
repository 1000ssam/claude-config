---
name: 정규식·도구 출력 단정 전 재검증
description: grep/regex로 "없다"고 단정하기 전에 nested 태그·multiline 케이스를 한 번 더 검증할 것. 도구 한계로 인한 false negative를 사실로 보고하지 말 것
type: feedback
originSessionId: d1d37640-ec19-45c0-b70a-3ed1a825da8a
---
`grep -oiE '<h1[^>]*>[^<]{0,200}</h1>'` 처럼 `[^<]` 클래스를 쓰는 단일라인 정규식은 nested 태그(`<br/>`, `<span>` 등)가 들어간 H1을 놓친다. "H1 0개"라고 단정 보고했지만 실제로는 1개 존재했음.

**Why:** 2026-05-05 notiontalk.com SEO 진단에서 H1 부재로 보고했다가 사용자가 직접 확인해 정정 요청. 도구 출력의 false negative를 진단 결론으로 그대로 보고한 사례.

**How to apply:**
- HTML 태그 존재 여부를 단정하기 전, nested 태그 허용하는 다중 패턴으로 재검증한다 (예: Python `re.DOTALL`, `<tag.*?</tag>`).
- "0개", "없음", "부재" 같은 부정 단정은 한 번 더 다른 방법으로 확인 후 보고.
- 단일 grep 결과가 0이면 곧장 단정하지 말고 "단일 정규식으론 못 잡았는데 재확인 필요" 정도로 톤 다운.
