---
name: project_wee-log-community-bridge
description: wee-log 앱 커뮤니티 탭 = 위링 웹뷰 임베드 + Supabase 계정 공유 세션 다리. 권한 모델·토큰회전 근본해소 다음 세션 작업
metadata: 
  node_type: memory
  type: project
  originSessionId: 7aabf8f1-1a03-4617-8fbd-67b2325312f8
---

앱 '커뮤니티' 탭이 위링(wee-linked.com/community)을 `<webview>`로 인앱 임베드 + **같은 Supabase
프로젝트(msmiqcinohvomkgmezta) 공유로 로그인 세션 이어줌**. 메인 프로세스가 세션을 @supabase/ssr
쿠키로 합성해 webview 파티션(`persist:wee-community`)에 주입(self-contained, 위링 코드 변경 0).

브랜치 `feat/community-session-bridge`(베이스 `feat/subscription-login-gate`, 워크트리
`/mnt/c/dev/wee-log-community-bridge`). **둘 다 main 미머지.** 핸드오프=`HANDOFF-community-bridge.md`.
구현+정적검증+적대적리뷰(2R, 결함15건 수정)+회귀검증 완료. 시각 QA 후 커밋/머지 대기.

iframe 불가 이유: 위링 X-Frame-Options:DENY + cross-origin 쿠키. webview는 first-party라 통함.
토큰 회전 충돌(앱·webview 동시 갱신→한쪽 로그아웃)은 양방향 동기화(sync-back + onAuthStateChange
재주입)로 완화.

🚩 **다음 세션 작업 2건(2026-06-20 사용자 결정, 보류)**:
1. **권한 모델(위링 리포 작업)**: 액션 4종(읽기/쓰기/좋아요/댓글)×콘텐츠 2종(칼럼/게시판).
   비로그인=칼럼 읽기+좋아요. 로그인(미인증)=칼럼 읽기+좋아요+댓글. 인증회원=게시판 전부+칼럼 전부.
   게시판은 인증회원 전용(미인증 읽기조차 없음). 위링 RLS(0009/0015/0016)+`/community` 게이팅+
   wee-log 서브카피. ⚠️확인필요: 비로그인 좋아요 dedup(0005_engagement auth 의존?)·칼럼 댓글 스키마.
2. **토큰 회전 근본해소**: 위링 webview 임베드모드에서 `autoRefreshToken:false`(앱이 단일 refresher).
   위링 `createBrowserClient` 조건부 + wee-log가 임베드 신호(`?embed=app`) 부착. 위링 배포 묶임.

관련: [[project_wee-log-subscription-decisions]] [[project_wee-linked-deploy]] [[project_wee-log]]
