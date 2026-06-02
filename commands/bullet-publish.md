---
description: notiontalk bullet.so 사이트 즉시 배포 (1시간 자동배포 안 기다리고 노션 최신본 즉시 반영)
---

`python3 /mnt/c/dev/notion-action-relay/run.py bullet-publish` 를 실행해서 bullet.so 사이트를 즉시 배포해줘.

- publish 함수가 노션 최신본을 재조회하므로 노션·CC 작업 결과가 그대로 반영된다.
- 전체 리빌드라 1~2분 걸린다. 완료까지 기다린 뒤 HTTP 상태/응답을 보고할 것.
- `409 ABORTED`가 나오면 스크립트가 자동 재시도한다(매시간 자동배포와 겹친 경우). 끝까지 실패하면 메시지를 그대로 보여줄 것.
