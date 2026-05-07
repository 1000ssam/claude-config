---
description: "Claude Code 환경 수동 push. 이 PC의 ~/.claude 변경분을 GitHub origin/main 에 보낸다. dry-run 미리보기 → 사용자 확인 → 실제 적용 2단계로 동작. 트리거: '/sync-push', 'config 보내', '환경 동기화 보내'."
---

# Claude Code 환경 수동 Push

이 PC의 `~/.claude/` 설정·skills·commands·knowledge·memory + `/mnt/c/dev/notes/` 변경분을 GitHub `1000ssam/claude-config` 의 `origin/main` 에 push 한다. **명시적 사용자 승인** 후에만 실제 적용.

## 워크플로

### 1단계: 미리보기 (dry-run)

```bash
node /home/user/.claude/config-repo/config-sync.js --push
```

이 명령은 **commit/push 하지 않는다**. 매핑 대상 파일을 `~/.claude/config-repo/` working tree 로 복사한 뒤 다음만 출력:
- `git status --porcelain` 으로 어떤 파일이 추가/수정/삭제되는지
- 시크릿 의심 파일(`secrets/*`, `*.token`, `*.key`, `*.pem`, `.env*`, `.credentials.json`)이 staging 영역에 들어왔는지 빨간 경고

### 2단계: 사용자에게 확인 요청

미리보기 출력을 사용자에게 그대로 보여주고:
- 변경 없으면 "보낼 게 없습니다" 로 종료.
- 변경 있으면 한국어로 "이 변경분을 push 할까요?" 라고 물어본다.
- **시크릿 경고가 떴다면 별도로 명시**: "시크릿 의심 파일이 감지됐습니다. .gitignore 보강을 권장합니다. 그래도 진행할까요?"

### 3단계: 사용자 승인 시 적용

사용자가 "적용", "OK", "ㄱㄱ" 등 긍정 응답한 경우:

```bash
node /home/user/.claude/config-repo/config-sync.js --push --apply
```

시크릿 경고를 무시하고 강제 push 가 필요한 경우(사용자가 명시적·반복적으로 요청 시에만):

```bash
node /home/user/.claude/config-repo/config-sync.js --push --apply --allow-secrets
```

### 4단계: 결과 보고

- 종료 코드 0 + "Push 완료" → 성공. 다른 PC 에서 `/sync-pull` 로 받을 수 있다고 안내.
- 종료 코드 2 (시크릿 차단) → 어떤 파일이 걸렸는지 알리고 .gitignore 보강 제안.
- 종료 코드 4 (push 실패) → fetch + rebase 또는 충돌 해결 안내.

## 주의

- **양쪽 PC 동시 작업 금지가 권장**. 한 PC 에서 push 했으면 다른 PC 는 작업 시작 전 `/sync-pull` 로 받기.
- 시크릿이 staging 에 들어온 경우 기본적으로 차단된다. `--allow-secrets` 는 사용자가 그 위험을 인지한 경우에만.
- 사용자 동의 없이 절대로 `--apply` 를 바로 실행하지 말 것.
