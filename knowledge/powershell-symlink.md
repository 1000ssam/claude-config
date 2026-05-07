---
name: PowerShell Symlink 권한 문제
description: PowerShell New-Item SymbolicLink은 개발자 모드를 인식 못 함. cmd /c mklink 사용 필수. 배치 일괄 실행으로 성능 확보.
---

## 문제

- `New-Item -ItemType SymbolicLink`은 Windows 개발자 모드가 켜져있어도 "관리자 권한 필요" 에러 발생
- PowerShell 5.1 (Windows 내장)에서 확인된 문제

## 해결

- `cmd.exe /c mklink "링크" "대상"` 사용 — 개발자 모드를 정상 인식
- 대량 생성 시 개별 `cmd /c mklink` 호출은 매우 느림 (프로세스 N개 생성)
- **배치 파일(.bat)에 mklink 명령을 모아서 한 번에 실행**하면 성능 해결

## 추가 발견

- PowerShell 스크립트에서 `$ErrorActionPreference = "Stop"` + 해시테이블 인덱서 `$hash[$key]`는 스크립트 컨텍스트에서 NullArray 에러 유발 가능
- 격리된 커맨드에서는 정상 동작하나, 긴 스크립트 내에서 이전 에러 스트림이 전파되어 발생
- 해결: `$ErrorActionPreference` 기본값(Continue) 유지, 또는 JSON 직접 파싱으로 우회

## -Path vs -LiteralPath (필수)

- PowerShell의 `-Path`는 `[]`를 **와일드카드 문자 클래스**로 해석함
- 파일명에 `[붙임1]`, `[연수]` 같은 대괄호가 있으면 `Test-Path`, `Move-Item`, `Copy-Item` 등이 **조용히 실패**
- 에러 없이 실패하므로 디버깅이 매우 어려움
- **해결: 파일 경로를 다루는 모든 cmdlet에 `-LiteralPath` 사용**
- `Get-ChildItem`의 결과를 파이프로 넘길 때도 `-LiteralPath $_.FullName` 필수

## 배치 파일 인코딩 주의

- 한글 파일명 포함 시 배치 파일에 `chcp 65001 >nul` 추가 + UTF-8(BOM 없음)으로 작성
- `[IO.File]::WriteAllLines($path, $lines, (New-Object Text.UTF8Encoding $false))` 사용
- `-Encoding ASCII`는 한글이 깨짐, `-Encoding Default`(CP949)도 불안정
- WSL 터미널에서 PowerShell 한글 출력은 깨져 보이지만 파일시스템은 정상 — 파일로 출력 후 확인할 것
