---
name: project-notion-action-relay
description: 시크릿 기반 자동화 액션 통합 파이프라인. 새 자동화·시크릿 작업·노션 버튼 트리거·bullet 배포·GitHub Actions 릴레이 관련 요청 시 먼저 이 repo(1000ssam/notion-action-relay) 참조.
metadata: 
  node_type: memory
  type: project
  originSessionId: d7d54379-d03c-4c2e-ba2f-81c0b760d485
---

시크릿이 필요한 액션을 한 곳에서 실행하는 범용 파이프라인 (구 bullet-instant-publish에서 확장).

- repo: `github.com/1000ssam/notion-action-relay` (private) / 로컬 `/mnt/c/dev/notion-action-relay/`
- 구조: `run.py`(라우터) + `actions/<name>.py`(각 `run(payload)`) + `.github/workflows/run-action.yml`(workflow_dispatch). 새 액션 = actions/ 파일 + repo Secrets + 워크플로 `env:` 매핑.
- 실행: 로컬 `python3 run.py bullet-publish`(시크릿 `~/.claude/secrets/bullet-auth.env`) / `/bullet-publish` 슬래시 커맨드 / 노션은 "웹훅 보내기"→Vercel `/api/trigger`→workflow_dispatch (PAT은 Vercel env에만, 노션엔 저권한 TRIGGER_SECRET만).
- bullet 액션: GCP Cloud Function `.../publish`, Firebase Bearer(60분), **시나리오 A**(서버가 노션 재조회 → body.json 재사용 OK). publish는 **single-flight** → 409 ABORTED 시 자동 재시도(25s×4).
- ✅ 로컬+Actions+Vercel릴레이 E2E 201 검증 완료. Vercel 릴레이 `https://notion-action-relay.vercel.app/api/trigger`(노션 샌드박스 망 격리라 웹훅→Vercel 중계). env: GH_PAT(Actions:write)/TRIGGER_SECRET. 노션 버튼→웹훅→Vercel→Actions→배포까지 **실사용 검증 완료(2026-05-24), 완전 가동**. (설정 상세: repo의 `NOTION-SETUP.md`)
- ⚠️ refresh token = 계정탈취급 시크릿. Actions Secrets / 로컬 secrets에만.

연관: [[project_notiontalk-architecture]] · [[feedback_secret-management]]
