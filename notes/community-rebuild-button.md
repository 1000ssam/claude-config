# 커뮤니티 발행(재배포) 트리거 — 노션 버튼용

> ⚠️ 이 파일은 시크릿을 포함합니다. 버튼에 옮긴 뒤 **삭제**하세요. (notes 폴더는 git repo 아님 = 푸시 안 됨)

## 핵심
- **반드시 POST.** GET(링크 클릭)은 동작 안 함 — 라우트가 의도적으로 GET은 무시함.
- 노션 *네이티브 버튼*은 링크 열기(GET)만 가능 → 단독으론 트리거 불가.
  → 노션 **자동화 'Send webhook'** 액션(POST+헤더 가능)이나, 외부 fetch(POST)로 호출해야 함.

## 엔드포인트
```
POST https://www.notiontalk.com/api/notion-webhook/
Header:  x-webhook-secret: 6a15a751f9d312f75eb73e08e38eff53964774389018dcffb8a4e31af3a465d3
```
또는 헤더를 못 쓰는 도구라면 쿼리스트링(POST 유지):
```
POST https://www.notiontalk.com/api/notion-webhook/?secret=6a15a751f9d312f75eb73e08e38eff53964774389018dcffb8a4e31af3a465d3
```

## 동작 확인용 curl (이거 실행하면 진짜 재배포 1회 뜸)
```bash
curl -X POST "https://www.notiontalk.com/api/notion-webhook/" \
  -H "x-webhook-secret: 6a15a751f9d312f75eb73e08e38eff53964774389018dcffb8a4e31af3a465d3"
# 기대 응답: {"ok":true,"triggered":true}
```

## 트리거 후 흐름
노션 이벤트 DB 편집 → 이 POST → Vercel Deploy Hook 발사 → 재빌드(prebuild의 sync-community.mjs가 노션 재스캔) → 새 스냅샷 라이브 (보통 1~3분)
