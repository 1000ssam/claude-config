---
name: 푸시 후 preview URL 자동 안내
description: feat 브랜치 푸시 후 빌드/배포 안내할 때 사용자가 묻지 않아도 preview URL 함께 제공
type: feedback
originSessionId: ad543f70-e88e-4185-9d4e-d3de1ef3ec62
---
feat 브랜치에 푸시한 뒤 보고할 때는 **항상 Vercel preview URL을 같이** 적는다. 사용자가 매번 URL을 요청하지 않아도 자동으로.

**Why:** 사용자가 "프리뷰 주소는 기본적으로 좀 줘라 항상"이라고 명시 (2026-04-30, notiontalk-landing 작업 중). 푸시 → 빌드 → 사용자 검증의 흐름에서 URL이 매번 필요한데, 매번 요청해야 하는 게 거슬림.

**How to apply:**
- `feat/<branch>`에 push한 직후 보고 메시지에 해당 프로젝트의 preview URL을 포함
- notiontalk-landing의 about-us 작업: `https://notiontalk-landing-git-feat-abou-af4752-1000s-projects-a51f0c2a.vercel.app/contents/about-us/`
- 다른 프로젝트/브랜치는 Vercel preview alias 패턴 따라 만들거나, 처음 한 번 확인해서 메모
- 빌드 폴링 결과(READY/ERROR) 보고 시점에도 URL 재안내
