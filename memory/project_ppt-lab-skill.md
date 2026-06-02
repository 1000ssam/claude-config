---
name: project-ppt-lab-skill
description: ppt-lab — PPT 디자인 하네스 연습용 제로베이스 샌드박스 스킬
metadata: 
  node_type: memory
  type: project
  originSessionId: 50fdce27-7a62-43f2-8e9b-7676765113d1
---

`~/.claude/skills/ppt-lab/` — `[[project_ppt-deck-skill]]`(완성형)와 **별개의 격리 연습장**. 2026-06-02 구축. 사용자가 PPT 디자인 하네스 원리를 학습하며 **자기 PPTX 레퍼런스를 흡수해 나만의 변종·토큰을 제로베이스에서 쌓는** 용도.

**격리**: 자체 git repo(`git init`). 부모 `~/.claude/skills/.gitignore`에 `ppt-lab/` 추가해 claude-skills repo에서 제외. ppt-deck 절대 안 건드림.

**구조**: layouts.json=`{}`(빈 카탈로그), design-tokens=STARTER, slide-types=빈 표. 도구는 완비:
- `tools/extract-pptx.py` — PPTX를 1920×1080 px로 정규화 측정(좌표·색·폰트·텍스트) + suggested_layout/tokens 출력. EMU÷9525=px. **결정론 측정**.
- `tools/render-catalog.py` — layouts.json→catalog.html 자동 생성(SVG 와이어프레임). HTML을 손으로 안 고치고 생성물로 강등 → drift 0.
- `tools/build-template.py` — ppt-deck 헬퍼 엔진 + 빈 VARIANT_TO_BUILDER. 변종 0개여도 안내 슬라이드로 안 죽음.
- `tools/qa-runner.sh` — 한글 파일명 수정본 복사.

**흡수 4조각**: layouts.json(좌표)+build함수+slide-types(키) 필수, design-tokens(색) 필요시, catalog.html 자동. 워크드 예제: `catalog/EXAMPLE_명문고-cover.md`(사용자 실제 덱 측정→CV 변종화 전 과정). 사용자 브랜드색 추출됨: navy #0B2C5C, blue #1B66C9, green #1F9D57.

**검증**: 빈 빌더·카탈로그 생성·측정기(사용자 myeongmungo 덱) 전부 작동 확인. extract-pptx role_guess 버그(size_px 평탄화) 수정 완료.
