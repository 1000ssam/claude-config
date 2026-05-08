---
name: Vercel env add 개행문자 버그
description: vercel env add 시 heredoc(<<<) 사용하면 \n 붙어 UUID 등 값이 깨짐
type: feedback
---

`vercel env add` 로 환경변수 추가할 때 `<<< "값"` 방식을 쓰면 값 끝에 개행문자(\n)가 붙어서 UUID 같은 정밀한 값이 깨진다.

**Why:** bash heredoc이 자동으로 newline을 추가하는 동작. Notion DB ID에 \n이 붙으면 "invalid uuid" 에러 발생.

**How to apply:** 항상 `printf '값' | vercel env add KEY environment` 방식으로 추가. 절대 `<<< "값"` 사용 금지.
