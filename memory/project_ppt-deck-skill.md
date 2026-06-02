---
name: project-ppt-deck-skill
description: ppt-deck 스킬 — 카탈로그 기반 PPTX 자동 생성. jay.pm.ai 가이드 하네스 구현
metadata: 
  node_type: memory
  type: project
  originSessionId: 50fdce27-7a62-43f2-8e9b-7676765113d1
---

`~/.claude/skills/ppt-deck/` — jay.pm.ai의 "Claude로 PPT Skill 만들기" 가이드 하네스를 완전 구현한 스킬. 2026-06-02 구축.

**구조**: SKILL.md + references/ (archetype-catalog.html·chart-catalog.html=시각 SSOT, design-tokens.json=컬러18+5팔레트+타이포11, layouts.json=좌표, slide-types.md=의사결정트리+SPEC KEYS, chart-usage-guide.md, copy-guide.md, forbidden-patterns.md=AI tell 12종, build-template.py=python-pptx 빌더, qa-runner.sh, figma-builder.md).

**핵심 사실**:
- HTML 카탈로그 2종은 가이드의 구글드라이브(folders/1zYzPMwLftzyR-opKM78V-PRsSvxjvk8u)에서 받음. md/json은 그로부터 도출.
- 좌표계 단일화: 1920×1080 px → 빌더가 px÷96=inch, px×0.75=pt 변환.
- 빌드: `python3 references/build-template.py OUT.pptx --palette N --spec spec.json` (spec 없으면 내장 데모). 36 variant 전부 0에러 검증.
- 한글: 빌더가 latin+EastAsian+cs 모두 폰트 지정. Pretendard는 WSL엔 있었으나 Windows 미등록이라 PowerPoint가 Malgun 폴백했었음 → 2026-06-02 Windows 사용자폰트로 설치 완료(`/mnt/c/dev/notion-fonts/`의 ttf 사용). 이제 Pretendard 렌더.
- QA 렌더: 이 PC는 soffice 없음. qa-runner.sh가 Windows PowerPoint COM으로 PNG export. 🐛한글 파일명 .pptx는 powershell -File이 .ps1을 CP949로 읽어 경로 깨짐→렌더 0장 버그 있었음. ASCII 임시폴더 렌더+UTF-8 BOM+wslpath+per-slide Export로 수정 완료. 상세 [[wsl-windows-nonascii-path]].
- Figma 경로(use_figma)는 MCP 1회 연결 필요 → 기본 비활성, [[feedback_no-emoji-in-ui]] 규칙과 forbidden-patterns 일치(emoji 금지).

**7단계 워크플로**: 자료정독 → variant 매칭표(사용자OK) → Output Format → Palette(5종) → 카피변환 → 빌드 → QA. Human-in-the-loop.
