---
name: 작업 경로 규칙 - 반드시 /mnt/c/dev/ 하위에서만
description: WSL에서 프로젝트 작업 시 /mnt/c/dev/ 마운트 경로만 사용해야 함
type: feedback
---

반드시 `/mnt/c/dev/` 하위에서만 프로젝트 작업을 수행한다.

**Why:** `/home/user/workspace/` 같은 WSL 네이티브 폴더에서 작업하면, PowerShell에서 `npm run dev`로 앱을 실행할 때 변경사항이 반영되지 않는다. WSL과 Windows가 서로 다른 파일시스템을 바라보게 되어 git push/pull로 동기화해야 하는 번거로움이 생긴다.

**How to apply:** 새 프로젝트 클론, 파일 수정, 스크립트 실행 등 모든 작업을 `/mnt/c/dev/` 하위에서 수행한다. WSL 네이티브 경로(`/home/user/...`)에는 절대 프로젝트 폴더를 만들지 않는다.
