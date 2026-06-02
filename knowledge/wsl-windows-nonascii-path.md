# WSL↔Windows 핸드오프: 한글/공백 파일명 경로 깨짐

## 증상
WSL에서 Windows 프로그램(PowerPoint COM, LibreOffice, ffmpeg, 기타 `.exe`)에 **한글·공백·유니코드가 든 파일 경로**를 넘기면, 프로그램이 파일을 "못 찾음/못 엶"으로 조용히 실패한다. ASCII 경로는 멀쩡한데 한글 경로만 실패 → 인코딩 문제임을 의심.

## 근본 원인
`powershell.exe -File script.ps1` 은 **.ps1 파일을 시스템 ANSI 코드페이지(한국어 Windows = CP949)로 읽는다.** bash(`cat > x.ps1`)는 UTF-8로 쓰므로, 스크립트 안에 박힌 UTF-8 한글 경로가 CP949로 오독되어 깨진다. → `Open()` 실패.
- 같은 함정: `cmd.exe /c`, 배치파일, UTF-8 인자를 받는 모든 Windows 콘솔 도구.
- 경로 변환(`/mnt/c→C:`) 자체는 문제 아님. **파일 인코딩 + 콘솔 코드페이지**가 문제.

## 해결 (견고한 순서)
1. **ASCII 전용 작업폴더에서 실행** (가장 견고)
   - 입력 파일을 `…/AppData/Local/Temp/job_$$/deck.ext` 같은 **ASCII 경로로 복사**해 거기서 처리.
   - 스크립트(.ps1/.bat)에는 ASCII 경로만 넣는다 → 깨질 바이트 없음.
   - 결과물만 bash `cp` 로 원래 한글 경로로 복사(bash는 UTF-8 안전).
2. **.ps1 에 UTF-8 BOM 추가** (보조): `printf '\xEF\xBB\xBF' > x.ps1` 후 append → PowerShell이 UTF-8로 인식. (1과 병행 권장)
3. **경로 변환은 `wslpath -w`** 사용 (sed 수제 변환보다 안전): `WIN="$(wslpath -w "$LINUX_PATH")"`.
4. PowerPoint PNG는 `SaveAs(path,18)`(폴더 생성+한글 파일명) 대신 **슬라이드별 `.Export("…\slide_$i.png","PNG",w,h)`** 로 ASCII 파일명 직접 생성 → 후처리 단순.
5. 인라인 `powershell -Command` 에서 bash가 `$` 를 변수로 먹는 문제는 별개 → `.ps1` 파일로 분리(전역 규칙).

## 실제 사례
ppt-deck 스킬 `qa-runner.sh`: 한글 제목 `.pptx`(`동아시아사_08-3_….pptx`)가 렌더 0장 → ASCII 임시폴더 렌더 + BOM + wslpath + per-slide Export 로 수정 → 13장 정상. (2026-06-02)
