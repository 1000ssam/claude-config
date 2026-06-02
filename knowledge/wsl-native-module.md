# Claude Bash 도구로 네이티브 Node 모듈 빌드하면 Linux 바이너리 생성됨

## 문제
Claude Code의 Bash 도구는 WSL(Linux) 환경에서 실행됨.
`better-sqlite3` 같은 네이티브 모듈을 Bash 도구로 빌드하면 **Linux ELF 바이너리**가 생성됨.

Windows에서 실행되는 Electron 앱은 Linux 바이너리를 로드할 수 없어 오류 발생.

## 실제 발생 패턴
1. 사용자가 PowerShell에서 `npm install` → Windows 바이너리 생성 ✅
2. 어떤 이유로 바이너리 삭제됨 (packaging 등)
3. Claude가 Bash 도구로 `electron-rebuild` / `prebuild-install` 실행 → **Linux 바이너리로 덮어씀** ❌
4. 사용자가 PowerShell에서 다시 실행 → Windows 바이너리로 복구 ✅

## 증상
- `Error: The specified module could not be found` (.node 파일 로드 실패)
- WSL에서는 `require('better-sqlite3')` OK인데 Electron에서 실패

## 원인
| 환경 | 컴파일러 | 생성 바이너리 |
|------|---------|-------------|
| Claude Bash 도구 (WSL) | GCC/Clang | Linux ELF (.node) |
| PowerShell (Windows) | MSVC | Windows PE (.node) |

## 해결 원칙
**네이티브 모듈 빌드 명령은 Claude가 Bash로 실행하지 말고, 사용자에게 PowerShell에서 실행하도록 안내**

```powershell
# 사용자가 PowerShell에서 직접 실행
cd C:\dev\your-project
npx @electron/rebuild -v {electron-version} --only better-sqlite3
```

## 적용 범위
`better-sqlite3`, `sharp`, `canvas`, `node-gyp` 빌드가 필요한 모든 패키지.

---

# 같은 node_modules를 WSL/Windows가 공유할 때 OS별 optional dep이 사라지는 문제 (npm #4828)

## 문제
프로젝트가 `/mnt/c/dev/...`처럼 **WSL과 Windows가 같은 node_modules를 공유**할 때, 한쪽에서
`npm i`나 `npm i --no-save <pkg>`를 돌리면 OS별 native 바이너리가 떨려나간다.

```
Cannot find module @rollup/rollup-win32-x64-msvc
# 또는
Cannot find module @rollup/rollup-linux-x64-gnu
```

## 실제 발생 패턴 (wee-log-ai Phase 3, 2026-05-20)
1. WSL에서 `npm run build` 시도 → `Cannot find module @rollup/rollup-linux-x64-gnu`
2. WSL에서 `npm i --no-save @rollup/rollup-linux-x64-gnu` → WSL 빌드 OK
3. 같은 순간 Windows에서 `npm run dev` 시도 → `Cannot find module @rollup/rollup-win32-x64-msvc`
4. 양쪽이 서로의 바이너리를 덮어쓰는 핑퐁

## 원인
- 알려진 npm 버그: 플랫폼별 optional dependencies가 lockfile 기준 OS와 다를 때 누락 (npm/cli #4828).
- 대상 패키지: rollup 4.x, esbuild, swc, sharp 등 OS별 native 패키지로 분리 배포되는 도구.

## 해결 (즉시)
**누락된 OS 바이너리만 `--no-save`로 추가**한다. lockfile 안 건드림.

```bash
# WSL
npm i --no-save @rollup/rollup-linux-x64-gnu

# PowerShell
npm i --no-save @rollup/rollup-win32-x64-msvc
```

1회씩 추가하면 두 바이너리가 공존해 이후 양쪽 명령이 정상 동작.

## 해결 (영구·권장)
WSL 측에서는 **type-check만** 수행하고 **빌드/dev/런타임은 Windows 전용**으로 한정한다.
공유 node_modules에 `npm i`를 양쪽에서 돌리지 않는 게 가장 안전.

자동화 검증을 위해 WSL에서도 빌드가 필요하면, 양 바이너리를 모두 `--no-save`로 1회씩 설치한
상태를 유지한다 (lockfile은 그대로). **임시 해결한 뒤엔 반대 OS도 한 번 더 검증**해야 한다 —
한쪽 OK만 보고하면 사용자가 반대 OS에서 다시 막힌다.

## 라우터 키워드
WSL 바이너리, WSL native module, .node 파일 Windows, better-sqlite3 WSL, 네이티브 모듈 WSL,
rollup-linux-x64-gnu, rollup-win32-x64-msvc, optional dependencies 누락, npm 4828, MODULE_NOT_FOUND rollup
