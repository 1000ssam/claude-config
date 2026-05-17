# Vercel CLI: preview env 추가 시 git-branch 인자 필수

## 증상

Vercel CLI 50.x 이상에서 preview 환경에 환경변수를 추가할 때 다음 명령이 모두 실패:

```bash
vercel env add MY_VAR preview --value foo --yes
printf foo | vercel env add MY_VAR preview
vercel env add MY_VAR preview --value foo --yes  # CLI가 권장하는 명령 그대로
```

에러:
```json
{
  "status": "action_required",
  "reason": "git_branch_required",
  "message": "Add MY_VAR to which Git branch for Preview? Pass branch as third argument, or omit for all Preview branches."
}
```

CLI 자체 안내 메시지(`omit for all Preview branches`)와 실제 동작이 모순. agent / non-interactive 모드에서는 prompt를 띄울 수 없어 그냥 fail.

production / development는 영향 없음 — `vercel env add MY_VAR production --value foo --yes`는 정상 동작.

## 해법

git-branch 위치에 **빈 문자열 `""`을 명시적으로 전달**하면 "all preview branches"로 해석된다:

```bash
vercel env add MY_VAR preview "" --value foo --yes
```

stdin 방식도 동일하게 `""` 인자를 추가하면 동작:

```bash
printf foo | vercel env add MY_VAR preview ""
```

## 원인 추정

Vercel CLI 50.x가 non-interactive 모드(agent 환경 자동 감지)에서 빠진 인자를 prompt로 묻지 않고 즉시 에러로 처리. preview는 git-branch 차원이 추가로 필요한데 omit 시 prompt가 아닌 fail로 떨어짐.
빈 문자열은 명시적 "all branches" 시그널로 해석됨.

## 검증 환경

- Vercel CLI 50.37.3 (2026-05)
- WSL 2 / bash, Claude Code agent 호출

## 참고

- production/development에는 git-branch 차원이 없으므로 `""` 불필요
- 특정 branch에만 등록하려면 `vercel env add MY_VAR preview my-branch --value foo --yes`
- 기존 등록을 덮어쓰려면 `--force` 추가
