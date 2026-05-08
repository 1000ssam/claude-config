---
name: clipboard-image-shortcut
description: 사용자가 "클립보드/cb/이미지복붙" 말하면 즉시 Windows Pictures/Screenshots 최신 파일을 Read 도구로 읽기
type: feedback
originSessionId: c45fd7e6-e53c-456d-80c1-0a5dead7c29c
---
사용자가 "클립보드", "cb", "이미지 복붙", "이미지가 안 보인다" 류 말하면
Windows 스크린샷 폴더의 가장 최신 파일을 즉시 Read.

```bash
ls -t "/mnt/c/Users/user/Pictures/Screenshots/" | head -1
```

해당 파일을 Read 도구로 읽는다.

**Why:** PowerShell 클립보드 방식보다 빠르고 안정적. Win+Shift+S 캡처는 자동으로 이 폴더에 저장됨.
이미지 첨부가 대화창에 안 보일 때 fallback 으로도 사용.

**How to apply:**
- "클립보드" / "cb" / "이미지 복붙 안되" / "이미지가 안 보임" → 즉시 위 폴더 최신 파일 Read.
- 다른 시도(PowerShell, 별도 캡처) 없이 바로 실행.
- 옛 경로(`OneDrive/그림/Screenshots/`)는 더 이상 존재 안 함. 항상 `Pictures/Screenshots/` 사용.
