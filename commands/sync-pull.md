---
description: "Claude Code 환경 수동 pull. 다른 PC에서 push 한 변경분을 이 PC로 들여온다. dry-run 미리보기 → 사용자 확인 → 실제 적용 2단계로 동작. 트리거: '/sync-pull', 'config 가져와', '환경 동기화 받아'."
---

# Claude Code 환경 수동 Pull

다른 PC(또는 GitHub origin/main)의 변경분을 이 PC로 들여온다. **명시적 사용자 승인** 후에만 실제 적용.

## 워크플로

### 1단계: 미리보기 (dry-run)

```bash
node /home/user/.claude/config-repo/config-sync.js --pull
```

이 명령은 **실제 변경을 적용하지 않는다**. 다음만 출력:
- 들여올 커밋 목록 (`git log HEAD..FETCH_HEAD --oneline`)
- 파일 변경 통계 (`git diff --stat HEAD FETCH_HEAD`)
- 로컬 working tree 에 미커밋 변경이 있다면 경고

### 2단계: 사용자에게 확인 요청

미리보기 출력을 사용자에게 그대로 보여주고:
- 변경 없으면 "들여올 게 없습니다" 로 종료.
- 변경 있으면 한국어로 "이 변경분을 적용할까요?" 라고 물어본다.
- 로컬 dirty 경고가 떴다면 "먼저 `/sync-push` 로 로컬 변경을 보낼지, 아니면 `--force` 로 강제 pull 할지" 추가 확인.

### 3단계: 사용자 승인 시 적용

사용자가 "적용", "OK", "ㄱㄱ" 등 긍정 응답한 경우:

```bash
node /home/user/.claude/config-repo/config-sync.js --pull --apply
```

로컬 dirty 무시하고 강제 pull 이 필요한 경우(사용자가 명시적으로 강제 요청 시에만):

```bash
node /home/user/.claude/config-repo/config-sync.js --pull --apply --force
```

### 4단계: 결과 보고

- 종료 코드 0 + "Pull 완료" → 성공.
- 종료 코드 1 (fetch 실패), 3 (로컬 dirty) → 원인 설명 후 사용자 안내.

## 주의

- **시크릿(`secrets/`, `.env`, `*.token` 등)은 sync 대상이 아니다**. 양쪽 PC에 각각 수동 배치.
- pull 은 origin/main 으로 `reset --hard` 하므로 config-repo 의 **untracked/modified 파일은 날아갈 수 있다**. dirty 가드가 기본 동작.
- 사용자 동의 없이 절대로 `--apply` 를 바로 실행하지 말 것.
