# WSL `/mnt/c` 아래 Next.js `next dev` → 파일 수정이 핫리로드(HMR)에 반영 안 됨 (inotify 미전달)

## 문제
WSL 안에서 `/mnt/c/dev/...`의 Next.js(또는 Vite 등) dev 서버를 띄운 채 소스를 수정해도
브라우저가 갱신되지 않는다. 편집이 "먹지 않는" 것처럼 보여 코드를 의심하며 디버깅이 헛돈다
(실제로는 코드가 정상이고 watcher가 변경을 못 본 것).

## 원인
`/mnt/c`는 **9p 프로토콜로 마운트된 Windows 파일시스템**이라,
Windows 측에서 발생한 파일변경 이벤트(`inotify`)가 **WSL 측 watcher에 전달되지 않는다.**
dev 서버의 파일 감시(webpack/chokidar 등)가 변경 자체를 감지하지 못한다.

즉 HMR 미작동은 **빌드/코드 문제가 아니라 파일시스템 watch 문제**다.
CSS·소스를 아무리 grep해도 원인이 안 나오는 함정.

## 해결책
1. **dev 서버 재기동** (가장 빠른 확인).
   재기동하면 디스크의 최신 소스를 다시 읽으므로 "편집이 반영 안 된" 게 코드 문제인지
   watch 문제인지 즉시 갈린다. 재기동 후 반영되면 → watch 문제 확정.
2. **폴링(polling) 워처로 항구 해결**. inotify가 안 오면 주기적으로 디스크를 직접 폴링하게 한다.
   - 예: 환경변수 `CHOKIDAR_USEPOLLING=true`
   - 예: Next/webpack `watchOptions.poll`(ms 간격), Vite `server.watch.usePolling: true`
   - (정확한 키/플래그는 쓰는 번들러 버전 문서로 확인 — 일반 원리는 "폴링 켜기")
   - 트레이드오프: 폴링은 CPU를 약간 더 쓰고 반영이 폴링 간격만큼 느려질 수 있다.
3. **근본 해결은 프로젝트를 WSL 네이티브 FS(`~/`)에 두기** — inotify가 정상 작동한다.
   단 이 사용자는 작업경로 규칙상 모든 프로젝트를 `/mnt/c` 아래에 둬야 하므로(전역 CLAUDE.md),
   현실적인 해법은 **폴링**이다. 네이티브 이전은 규칙 위반이라 채택하지 않는다.

## 진단 순서
`/mnt/c`에서 dev 중 "편집 반영 안 됨"을 만나면, **코드를 의심하기 전에**:
1. dev 서버 재기동 → 반영되면 watch 문제 확정.
2. 반복된다면 폴링 워처(`CHOKIDAR_USEPOLLING=true` 등) 설정.

## 적용 범위
WSL에서 `/mnt/c`(또는 `/mnt/d` 등 Windows 드라이브 마운트) 아래에서 돌리는
모든 dev 서버 — Next.js `next dev`, Vite, webpack-dev-server, nodemon, tsc --watch 등
inotify 기반 파일 감시를 쓰는 도구 전반.
(확인: wee-linked.com 리디자인 작업 중 `/mnt/c/dev`에서 발생)

## 라우터 키워드
WSL /mnt/c 핫리로드 안됨, next dev HMR 미반영, inotify 미전달, 9p 파일감시,
CHOKIDAR_USEPOLLING, 편집 반영 안됨 dev, watchOptions.poll, vite usePolling, dev 서버 재기동
