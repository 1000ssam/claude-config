---
name: book-writer-project
description: 골든래빗 출판사 노션 책 집필 프로젝트 - Google Docs API로 스타일 적용 자동화
type: project
---

## 프로젝트: book-writer (C:\dev\book-writer)

### 책 정보
- 제목(후보): "선생님을 위한 8282 업무자동화 노션" 등
- 저자: 김용천 (노션 공식 앰버서더)
- 출판사: 골든래빗
- 대상: 유치원~고등학교 교사
- 예상 분량: 300-350쪽
- 목차: PART1~6 (기본사용법 → 업무정리 → 소통협업 → 효율화 → AI → 외부연결)
- 집필 일정: 1/3 완료 2025.06.01, 전체 완료 2025.12.31

### Google Docs 문서 ID (slowly008@gmail.com 계정, 복사본)
- 집필계획서: `1U2hWxJqhyZ6deA4aquUXziaPMjgaqPpkjdEafP_l3co`
- 집필가이드: `1bfARTkoH4H6qJgG2JxSB-pqaYyeKyptnAqaNS0z3VY4`
- 샘플원고(컨펌됨): `1J-4kmtbNnfzFu0YMI2B77KfZOl0aZNh2i0sdXhZt1YQ`
- PART1 원고(작성완료): `1W71Mss_O8cWWo2xHN6OP6l1B_TVphqiQyu6fcMwrUCQ`

### 스타일 매핑 (완성, 검증 완료)
- style-map.js: 골든래빗 가이드 기준 스타일 정의
- docs-writer.js: 마크다운 → Google Docs batchUpdate 변환기
- 지원 요소: 장(H1), 절(H2), 중제목(H3 파랑), 소제목(H4 밑줄), 본문, 팁(▶ 9pt), 코드(Roboto Mono 노란배경), 코너(<한 걸음 더!>)

### gws CLI 설정
- 계정: slowly008@gmail.com
- Google Cloud 프로젝트: gen-lang-client-0956068072 (이름: make)
- client_secret: 358410151364-ijasavahhiuifcnjh75vsdpkrghc507a
- gws 버전: 0.11.1

### 다음 단계
- 워크플로 스킬 만들기: "3장 2절 써줘" → 레퍼런스 탐색 → 초안 생성 → Docs에 삽입
- 레퍼런스: 노션 페이지(md화) + 강의녹취(txt/md)
