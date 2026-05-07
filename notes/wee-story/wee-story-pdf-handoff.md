# Wee-story 제안서 핸드오프

## 현재 상태

HTML 슬라이드 덱 제작 완료, PDF 생성 완료, Vercel 배포 완료.

## 파일 위치

| 파일 | 경로 |
|------|------|
| 제안서 원본 (마크다운) | `/mnt/c/dev/notes/wee-story/wee-story-proposal.md` |
| HTML 슬라이드 덱 | `/mnt/c/dev/notes/wee-story/wee-story-proposal.html` |
| PDF | `/mnt/c/dev/notes/wee-story/wee-story-proposal.pdf` |
| PDF 생성 스크립트 | `/mnt/c/dev/notes/wee-story/generate-pdf.js` |
| 프로필 사진 (김용천) | `/mnt/c/dev/notes/wee-story/profile-kim.jpg` |
| 프로필 사진 (조열음) | `/mnt/c/dev/notes/wee-story/profile-cho.jpg` |

## 배포

- **Vercel**: https://wee-story-proposal.vercel.app (alias)
- 원본 프로젝트: `wee-story` (1000s-projects-a51f0c2a)
- 배포 명령: `cp wee-story-proposal.html index.html && vercel deploy --yes --prod`

## 슬라이드 구성 (19장)

| # | 섹션 | 타입 | 배경 |
|---|------|------|------|
| 1 | 표지 | 센터 | 흰 |
| 2 | Executive Summary | 3컬럼(문제/솔루션/검증) + 하단 제안 callout | 흰 |
| 3 | Problem 01 | Statement (큰 타이포) | 흰 |
| 4 | Problem 02 | 3컬럼 카드 | 웜화이트 |
| 5 | Market | Big Number 2x2 그리드 | 흰 |
| 6 | Solution | 3컬럼 카드 + callout | 웜화이트 |
| 7 | Feature 01 | 2컬럼 피처 리스트 | 흰 |
| 8 | Feature 02 | 2컬럼 카드 (NEIS/보고서) | 웜화이트 |
| 9 | Feature 03 | 2컬럼 카드 (캘린더/통계) | 흰 |
| 10 | Security | 5컬럼 카드 | 웜화이트 |
| 11 | AI Integration | 3컬럼 카드 | 흰 |
| 12 | Traction | Big Number 4열 + callout | **다크** (유일) |
| 13 | Transition (왜 앱인가) | 비교 테이블 | 웜화이트 |
| 14 | Positioning | 비교 테이블 (위노트·위로그 vs 위스토리+테크빌) | 웜화이트 |
| 15 | Business Model | 빅넘버(176/17) + 2단 요금제 카드 | 흰 |
| 16 | Team | 인스타 프로필 스타일 2컬럼 | 웜화이트 |
| 17 | Partnership | 2컬럼 카드 (제안자/테크빌) | 흰 |
| 18 | Vision | Statement + 2컬럼 카드 | 웜화이트 |
| 19 | Closing | 좌측 텍스트 + 우측 하단 로고 | 흰 |

## 디자인 레퍼런스

- wee-log 앱의 디자인 토큰 차용 (Notion Blue #0075de, warm neutrals, Inter/Pretendard)
- Claude Design System Prompt 원칙 적용 (AI slop 회피, 최소 20px+ 텍스트)
- 타이포 스케일: hero 80px, display 64px, title 52px, body 28px, big-num 140px

## 주요 결정 사항

- **다크 배경은 12번(Traction)만 사용** — 위스토리 디자인 언어(흰/웜화이트)를 기본으로 유지
- **경쟁사 비교는 기능이 아닌 포지셔닝** — 제품력은 대등, 신뢰·채널·브랜드가 차별점
- **위노트 + 위로그 병기** — 시장에 전용 솔루션 2개
- **비즈니스 모델 2단**: 베이직(기관+개인) + AI 프리미엄(기관 업셀링/개인 애드온)
- **수익 배분 등 세부 조건은 제안서에서 제외** — 협의 사항
- **16번 팀 소개**: 인스타 프로필 스타일, 원형 프로필 사진 사용

## PDF 생성

```bash
cd /mnt/c/dev/notes/wee-story && node generate-pdf.js
```

- puppeteer 사용, 1920x1080 16:9 비율
- 폰트 로드 2초 대기 후 생성

## 후속 작업

- [ ] PDF 인쇄 품질 최종 확인 (폰트 렌더링, 이미지)
- [ ] 제안서 마크다운 원본도 최종 내용과 동기화 (현재 HTML이 최신)
