---
name: 플랫폼 호환성 사전 체크
description: CLI 도구나 패키지를 사용하는 프로젝트 시작 전 반드시 OS 호환성을 확인할 것
type: feedback
---

개발 시작 전에 사용할 CLI 도구/패키지의 플랫폼 호환성을 반드시 체크하라.

**Why:** ntn CLI(Notion Workers)가 Windows를 지원하지 않는데 이를 확인하지 않고 전체 워커를 구현한 뒤에야 발견. 코드는 완성했지만 테스트/배포가 불가능한 상황이 발생함.

**How to apply:** 플랜 단계에서 핵심 의존성(특히 CLI 도구)의 `package.json` engines/os 필드, 또는 공식 문서의 지원 플랫폼을 확인한다. 사용자 환경이 win32임을 항상 인지하고, WSL 필요 여부를 사전에 안내한다.
