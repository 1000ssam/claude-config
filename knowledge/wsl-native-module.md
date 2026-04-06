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

## 라우터 키워드
WSL 바이너리, WSL native module, .node 파일 Windows, better-sqlite3 WSL, 네이티브 모듈 WSL
