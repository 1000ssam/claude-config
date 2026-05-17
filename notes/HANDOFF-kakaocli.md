# kakaocli Windows 포팅 프로젝트 인수인계

## 목표
macOS 전용 카카오톡 CLI(https://github.com/silver-flight-group/kakaocli)를 참고하여 **Windows 카카오톡 PC용 CLI**를 새로 만든다.

## 조사 완료 사항

### 원본 (kakaocli) 분석
- **언어**: Swift, macOS 14+ 전용
- **기능**: DB 읽기(채팅/메시지 조회, 검색, SQL) + UI 자동화(메시지 전송, 로그인, 수집)
- **DB**: SQLCipher 암호화 SQLite, IOPlatformUUID 기반 PBKDF2 키 유도
- **UI 자동화**: macOS Accessibility API, CGEvent, AppKit, Vision OCR, AppleScript
- **레퍼런스2** (k-skill): kakaocli를 그대로 쓰는 래퍼. 추가 기술 단서 없음

### macOS 의존성 → Windows 대체 매핑
| macOS | Windows 대체 |
|-------|-------------|
| IOPlatformUUID | `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid` 등 |
| CommonCrypto (PBKDF2) | Node `crypto` / Python `hashlib` |
| SQLCipher (Homebrew) | `better-sqlite3` + sqlcipher 또는 `pysqlcipher3` |
| Accessibility API | Windows UI Automation (UIA) |
| CGEvent | `SendInput` API / `pywinauto` |
| macOS Keychain | Windows Credential Manager |
| Vision OCR | WinRT OCR / Tesseract |

## 미조사 (다음 세션에서 할 일)

1. **Windows 카카오톡 PC DB 위치 확인** — `%LocalAppData%\Kakao\` 또는 `%AppData%\Kakao\` 탐색
2. **DB 암호화 여부 및 키 유도 방식** — macOS와 동일한 SQLCipher인지, 키 시드가 뭔지 리버스 엔지니어링
3. **DB 스키마 파악** — 테이블/컬럼 구조
4. **MVP 범위 결정** — 읽기 전용(chats, messages, search)부터 시작 권장

## 기술 스택 결정

- **실행 환경**: PowerShell / Windows 네이티브 (WSL 아님)
- **언어**: Node.js 또는 Python (미확정)
- **1단계**: DB 읽기 전용 CLI
- **2단계**: UI 자동화 (메시지 전송)
