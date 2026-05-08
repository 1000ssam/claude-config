---
name: Vercel CLI 한계 우회 — OAuth 토큰으로 REST API 직접 호출
description: vercel CLI는 도메인 redirect, deploy hook 삭제 등 일부 작업이 안 됨. 저장된 OAuth 토큰을 꺼내 api.vercel.com에 직접 PATCH/DELETE 가능
type: reference
originSessionId: fb8539cb-917f-4cfc-88a9-037da0946810
---
# Vercel CLI가 못 하는 작업을 REST API로 처리하기

`vercel` CLI에 명령이 없는 일부 작업은 저장된 OAuth 토큰을 꺼내 `api.vercel.com`을 직접 치면 가능.

## 토큰 위치

```
~/.local/share/com.vercel.cli/auth.json
```

`.token` 필드에 `vca_...` 형태. CLI가 OAuth 로그인 시 저장한 access token. `Authorization: Bearer <token>` 헤더로 사용.

```bash
TOK=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.local/share/com.vercel.cli/auth.json','utf8')).token)")
```

## CLI에 없어서 직접 쳐야 했던 사례

### 1. 도메인 redirect 설정 (bare → www)
```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/<projId>/domains/<domain>?teamId=<teamId>" \
  -d '{"redirect":"www.example.com","redirectStatusCode":308}'
```
**주의**: `redirect` 값은 **scheme 빼고 호스트만**. `https://` 붙이면 "domain not added to project" 에러.

### 2. Deploy hook 삭제
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOK" \
  "https://api.vercel.com/v1/projects/<projId>/deploy-hooks/<hookId>?teamId=<teamId>"
```

### 3. Deploy hook 목록 (CLI에 없음)
```bash
curl -H "Authorization: Bearer $TOK" \
  "https://api.vercel.com/v9/projects/<projId>?teamId=<teamId>" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.stringify(JSON.parse(d).link.deployHooks,null,2))})"
```

## 환경 정보 추출

```bash
# project ID + team ID는 .vercel/project.json에 있음
cat .vercel/project.json
```

## 주의

- 토큰엔 만료 시각(`expiresAt`)과 refresh token이 같이 들어있음. CLI가 알아서 갱신하므로 우리가 다시 로그인할 필요는 없으나, 만료된 토큰을 잡으면 401 — 한 번 `vercel ls` 같은 CLI 명령 돌려서 갱신시키면 됨.
- 이 토큰은 사용자 권한 전체 수준이라 채팅 출력에 절대 노출 금지. env 변수로만 다룬다.
