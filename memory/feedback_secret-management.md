---
name: secret-management
description: 시크릿 3대 원칙 — 하드코딩 금지, 대화창 노출 금지, 깃 푸시 금지
type: feedback
---

## 시크릿 3대 원칙 (대원칙)

1. **모든 종류의 시크릿은 하드코딩 금지** — 코드에 직접 넣지 않고, `~/.claude/secrets/` 시크릿 파일에서 런타임 로드하는 참조 구조로 만든다.
2. **시크릿을 대화창에 쓰도록 유도 금지** — 사용자에게 파일 경로를 알려주고 직접 파일에 입력하게 한다. (예: "이 파일을 열어서 토큰을 붙여넣으세요: `~/.claude/secrets/xxx.md`")
3. **시크릿이 하드코딩된 채로 GitHub 푸시 금지** — 커밋 전 `git diff --cached`로 시크릿 포함 여부 반드시 확인. GitHub Push Protection 경고 시 무조건 멈추고 사용자에게 알림.

**Why:** 2026-03-28 두 건의 사고 발생.
- `google-client.json`(OAuth client_secret)을 skills-for-teachers 공개 리포에 번들링 → GitHub secret scanning alert
- `canva-oauth.mjs`에 Canva client_secret 하드코딩 → private 리포라 노출은 안 됐지만 같은 패턴

**How to apply:**
- 새 스킬/모듈에서 API 키가 필요하면 `~/.claude/secrets/{서비스명}-credentials.md`에 보관
- 코드에서는 해당 파일을 읽어서 파싱하는 로더 패턴 사용
- 스킬 문서에는 "파일을 열어 토큰을 입력하세요" 안내 (대화창 입력 유도 X)
- `.gitignore`에 `**/google-client.json`, `**/client_secret*.json`, `**/credentials.json`, `**/*.key`, `.env`, `config.json`, `secrets/` 포함
- `.env.example`, `config.example.json`만 git에 포함
- `git add` 전에 시크릿 파일이 staging에 없는지 확인

## 실행 환경별 시크릿 관리 방식

| 실행 환경 | 방식 |
|-----------|------|
| 로컬 전용 | 시크릿 파일(`~/.claude/secrets/`) + `.gitignore`, 빈 템플릿만 git에 포함 |
| 서버 배포 (Vercel, AWS 등) | 호스팅 서비스 환경변수 (대시보드에서 설정) |
| CI/CD (GitHub Actions) | Repository Secrets (`${{ secrets.KEY }}`) |
| 팀 공유 | `.env.example` 템플릿 + 각자 로컬 `.env` |

공통 원칙: git에는 절대 실제 값이 올라가지 않는다. 빈 템플릿/예시만 올리고, 실제 값은 각 환경에서 주입.
