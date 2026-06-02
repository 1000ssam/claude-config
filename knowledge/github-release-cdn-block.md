# npm install 시 GitHub 릴리스 에셋 CDN 차단으로 prebuilt 다운로드 실패

## 문제
일부 망(학교/기관 네트워크 등)에서 **`release-assets.githubusercontent.com`**(GitHub 릴리스 에셋 CDN)이
차단/극심한 스로틀 상태가 됨. `github.com` 자체는 닿지만 **릴리스 에셋 다운로드만 0바이트**로 실패.

`postinstall`에서 prebuilt 바이너리를 이 CDN에서 받는 패키지들이 줄줄이 깨짐.

## 증상
- `npm install`이 `ffmpeg-static` 등의 postinstall에서 ~30초 타임아웃 → **전체 롤백**(node_modules 비워짐)
- prebuilt 다운로드가 0바이트로 끝남
- npm 레지스트리(`registry.npmjs.org`)는 멀쩡한데 GitHub 릴리스만 막힘

## 영향받는 대표 패키지 (postinstall에서 GitHub 릴리스 에셋을 받음)
- `ffmpeg-static` (ffmpeg.exe)
- `better-sqlite3` (prebuilt .node)
- `node-llama-cpp` / `@node-llama-cpp/*` (단, npm 패키지에 prebuilt 동봉돼 `--ignore-scripts`에도 존재하는 경우 있음)
- 그 외 prebuild-install 계열 다수

## 원인
prebuild-install/postinstall 스크립트가 바이너리를 npm이 아니라 **GitHub Releases 자산 URL**에서 받기 때문.
망에서 그 CDN만 선택적으로 막히면 레지스트리 설치는 되는데 바이너리만 실패.

## 해결
**`npm install --ignore-scripts`(레지스트리는 안 막힘) + 바이너리 직접 배치** 또는 **VPN/핫스팟으로 1회 정상 설치**.

직접 배치 시 (예: wee-log 사례):
- `ffmpeg.exe` ← 같은 ffmpeg-static을 쓰는 다른 앱 설치본에서 복사
- `better-sqlite3/build/` ← 동일 Electron ABI(예: electron 33)·동일 버전 설치본에서 복사
- `@node-llama-cpp/*` prebuilt는 npm 패키지 동봉이라 `--ignore-scripts`에도 이미 존재
- electron 본체는 `%LOCALAPPDATA%\electron\Cache\`에 zip 있으면 `node node_modules\electron\install.js`로 추출(네트워크 불필요)

## 주의
- 다른 PC/클린 설치에서 같은 망이면 **동일 차단 재현** → 위 절차 또는 VPN 필요.
- WSL에서 `--ignore-scripts`로 설치하면 네이티브 모듈이 빌드 안 됨 → Windows PowerShell에서 `npm install` 재실행 필요(개발 환경 한정). 이때 빌드는 [[wsl-native-module]] 주의사항 적용(Claude Bash로 빌드 금지).

## 관련
- `~/.claude/knowledge/wsl-native-module.md` — WSL/Windows 네이티브 바이너리 차이
- wee-log 프로젝트(2026-05) STT/LLM 통합 시 실제 발생.
