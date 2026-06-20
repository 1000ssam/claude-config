# notiontalk.com 재빌드(발행) 버튼 — 노션용

> ⚠️ 시크릿 포함. 버튼에 옮긴 뒤 삭제하세요. (notes는 git repo 아님)

## 동작
이 버튼을 누르면 → relay가 GitHub Actions → Vercel Deploy Hook → notiontalk-landing
전체 재빌드(sync-creators + sync-community 노션 재스캔) → community/about-us 갱신.

## 엔드포인트 (반드시 POST)
```
POST https://notion-action-relay.vercel.app/api/trigger?action=notiontalk-rebuild
Header:  X-Trigger-Key: 5a6c644f381acdd83406f4c62d0d0d47e0c6e23312a1c79e
```
헤더 못 쓰는 도구면 쿼리(POST 유지):
```
POST https://notion-action-relay.vercel.app/api/trigger?action=notiontalk-rebuild&key=5a6c644f381acdd83406f4c62d0d0d47e0c6e23312a1c79e
```

## 동작 확인 curl (실행 시 실제 재빌드 1회)
```bash
curl -X POST "https://notion-action-relay.vercel.app/api/trigger?action=notiontalk-rebuild" \
  -H "X-Trigger-Key: 5a6c644f381acdd83406f4c62d0d0d47e0c6e23312a1c79e"
# 기대: {"ok":true,"triggered":"notiontalk-rebuild",...}
```

## 참고
- 이 키(TRIGGER_SECRET)는 기존 about-us/bullet-publish 버튼과 동일.
- bullet-publish(기본 action)는 bullet만 재발행 → 네이티브 community/about-us엔 무효.
  네이티브 갱신은 반드시 ?action=notiontalk-rebuild.
