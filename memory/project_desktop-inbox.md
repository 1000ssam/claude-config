---
name: desktop-inbox 프로젝트
description: 바탕화면/문서/사진/동영상 자동 정리 PowerShell 스크립트. Inbox 미러링 + Symlink 다중 분류.
type: project
---

## 프로젝트 경로
`/mnt/c/dev/desktop-inbox/`

## 구조
- `desktop-inbox.ps1` — 메인 스크립트 (Step 1: Inbox 이동, Step 2: Symlink 분류)
- `config.json` — 설정 (소스 폴더, typeMap, 제외 패턴, 스케줄 주기)
- `install.ps1` — Windows 작업 스케줄러 등록
- `uninstall.ps1` — 스케줄러 해제

## 핵심 설계
- 물리 파일은 `~/Inbox/{소스폴더명}/...`에 구조 미러링 보관
- `~/Sorted/ByType/`, `~/Sorted/ByModified/`에 symlink로 분류
- symlink 생성은 `cmd /c mklink` 사용 (PowerShell New-Item은 개발자 모드 인식 불가)
- 배치 파일 일괄 실행 방식 (개별 cmd 호출은 너무 느림)
- 배치 파일 인코딩: UTF-8(BOM 없음) + `chcp 65001`

## 현재 상태 (2026-04-22)
- Step 1 (Inbox 이동): 완료, 6000+개 파일 이동 성공
- Step 2 (Symlink 분류): 완료, 12000+개 symlink 생성
- install.ps1: 미테스트 (스케줄러 등록)
- 배포 준비: Git 리포 미생성

## 후속 과제
- Other 카테고리 지속 축소 (사용자 피드백 기반 확장자 추가)
- install.ps1 테스트 및 스케줄러 등록
- Git 리포 초기화 + README 작성
- v2: 생성일 기준 분류 추가
