---
name: notion-print
description: 노션 A4 인쇄 미리보기 웹앱 — 블록 분할 엔진으로 빈 공간 최소화
type: project
---

노션 페이지를 A4 규격으로 스마트 분할하여 미리보기하는 Next.js 웹앱.
**Why:** 노션 네이티브 인쇄가 블록을 통째로 다음 페이지로 밀어서 빈 공간이 과도함.
**How to apply:** `~/workspace/notion-print/HANDOFF.md` 참조.

## 현재 상태 (2026-03-31)
- MVP 완성, 로컬 동작 확인
- 페이지 분할: "캡처 후 자르기" 방식 (CSS overflow:hidden + marginTop:-Npx)
- BFC(flow-root)로 margin collapse 차이 해결
- 콜아웃/코드/테이블/이미지는 원자 블록 (분할 불가)

## 핵심 후속 과제
1. **텍스트 리플로우 분할** — 캡처 자르기 → 실제 텍스트 분리. 콜아웃 내부 블록 단위, 단락 줄 단위 분할
2. 여백/글꼴 조절 UI
3. 크롬 확장 래퍼 (Side Panel)
4. Vercel 배포 (NOTION_TOKEN 환경변수 분기)
