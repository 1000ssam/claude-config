---
name: bullet.so redirect syntax
description: bullet.so 리다이렉트는 Netlify 스타일 splat 문법 사용. notiontalk.com 운영 시 슬러그 변경 작업에서 재사용
type: reference
originSessionId: 79865c81-0ded-44cb-81d4-40d81437382e
---
bullet.so 리다이렉트는 Netlify 스타일 `:splat` 문법을 사용한다 (Apache `$1`이나 단순 `*` 치환이 아님).

**와일드카드 패턴:**
```
From: /old-path/*
To:   /new-path/:splat
```

`From` 칸의 `*`로 매칭한 값은 `To` 칸에서 `:splat`으로 받는다. To 칸에 `*`를 그대로 쓰면 리터럴 문자로 박혀서 `/new-path/*` 같은 깨진 URL이 생성된다.

**제약:**
- splat은 From 칸에 한 번만 사용 가능
- 한 룰당 최대 1,000자
- 프로젝트당 static 2,000개 / dynamic 100개

**공식 문서:** https://bullet.so/docs/redirects/

**사용 맥락:** notiontalk.com 블로그(bullet.so 호스팅)에서 페이지 슬러그 변경 시. 상위 페이지 단일 리다이렉트만 걸면 하위 페이지는 잡히지 않으므로 와일드카드 룰 필수.
