---
name: changelog-on-deploy
description: 앱 기능 변경 시 반드시 버전 기록(changelog) 업데이트 후 커밋
type: feedback
---

앱에 사용자가 체감할 수 있는 변경(기능 추가, 버그 수정, UI 변경)을 반영할 때 반드시 changelog/버전 기록을 업데이트한다.

**Why:** 버전 기록 없이 커밋만 하면 사용자가 변경 사항을 알 수 없고, 나중에 추적도 어렵다.

**How to apply:**
- 모든 커밋에 버전을 올리는 게 아니라, **사용자 체감 변경** 단위로 버전을 올린다
- Semantic Versioning 기준: 기능 추가 = minor(1.x.0), 버그 수정 = patch(1.0.x)
- 내부 리팩토링, 코드 정리, 주석 변경 등은 버전에 반영하지 않는다
- changelog 파일이 있는 프로젝트에서는 해당 파일을 업데이트하고, 없으면 사용자에게 제안한다
