---
name: ai-club 프로젝트
description: 고1 AI 동아리 연간 운영 — 회차별 웹페이지 + Notion DB 제출 시스템
type: project
---

# AI 동아리 프로젝트

## 기본 정보
- **경로**: `/mnt/c/dev/ai-club`
- **리포**: https://github.com/1000ssam/ai-club (private)
- **배포**: https://ai-club-eight.vercel.app/
- **대상**: 고1, 6명, 코딩/AI 선행지식 없음, 유료 구독 없음
- **도구**: 무료 도구만 — 전반부 Gemini 웹, 후반부 AI Studio

## 회차별 현황
| 회차 | 날짜 | 주제 | URL | 상태 |
|------|------|------|-----|------|
| 1 | 03.27 | 동아리 조직 + 온보딩 | /session-01/ | ✅ |
| 2 | 04.10 | 프롬프트 스킬 | /session-02/ | ✅ |
| 3 | 05.22 | AI로 발표 자료 만들기 | /session-03/ | - |

## Notion DB
- **1회차**: `f1897643-1197-44a4-ac10-77a61dcedaa7` — 이름/반/AI경험/별명/AI비교소감/프로젝트아이디어/느낀점
- **2회차**: `33edd1dc-d644-81c8-b5da-cc865467b432` — 이름/최고의프롬프트/오늘의발견/1회차기록(텍스트, 추후 relation으로 수동 변경)
- **위치**: RESOURCES > AI 동아리 (같은 부모 페이지)

## Vercel 환경변수
- `NOTION_TOKEN` — 공통
- `NOTION_DB_ID` — 1회차 DB
- `NOTION_S02_DB_ID` — 2회차 DB

## API 구조
- `api/submit.js` — 1회차: create(행 생성) + update(단계별 업데이트) 분리
- `api/submit-s02.js` — 2회차: 마지막 스텝에서 한 번에 제출

## 2회차 프롬프트 6원칙 (역할 부여 제거, 현대화)
1. 맥락 제공
2. 구체적 요청
3. 출력 형식
4. 제약 조건
5. 예시 제시 (Few-shot)
6. 대화로 좁히기

## 핵심 트러블슈팅
- **Vercel env add 개행문자 버그**: `<<< "값"` 방식으로 추가 시 \n 붙어 UUID 깨짐 → `printf '값' | vercel env add` 사용
- **Notion relation API 생성 불가**: 양쪽 DB 모두 같은 integration에 공유돼야 함. 수동 설정으로 대체

## Why: 프로젝트 목적
**How to apply:** 3회차부터 콘텐츠 기획 시 "AI를 메타적으로 쓰는 법(한 턴이 아닌 여러 턴)" 철학 유지. AI Studio는 Temperature·시스템 프롬프트 직접 조작이 목적이므로 후반 회차에서 시스템 프롬프트 실습 연계 예정.
