---
name: project_ppt-lab-rebuild
description: ppt-lab-rebuild 스킬(그리드 클린룸 PPT 하네스) — 리포 위치·grammar 흡수 현황·다음 로드맵
metadata: 
  node_type: memory
  type: project
  originSessionId: 26b3cd0e-5f66-4e03-a43a-9c3c8ebbb371
---

`ppt-lab-rebuild` = 그리드 기반 클린룸 PPT 생성 하네스 (기존 [[project_ppt-lab-skill]]의 흡수모델과 별개 스킬). **24 아키타입** × (레이아웃·스타일·팔레트·크기) 직교축 + design-pick 110룩.

- **리포**: `1000ssam/ppt-lab-rebuild` (비공개, default branch=**master**). 스킬 경로 `~/.claude/skills/ppt-lab-rebuild`가 곧 리포 루트. 2026-06-12 원격 신설·푸시(그 전엔 로컬 전용이었음).
- **grammar 룩 딥 11종**(스킨→문법 승격, 전부 master): neo-brutalism · swiss-editorial-bold · dark-luxury-keynote · luxury-editorial-serif · memphis-retro-90s · glassmorphism · dark-tech · **글로우 4룩 딥(2026-06-13 머지): prismatic-dark(prism 그라디언트 스트로크/텍스트)·engineered-dark(radial_glow·단색 바이올렛)·vivid-gradient-future(메시+frosted 글래스)·hyundai-cinematic(chevron+eye 글로우)**. + monochrome-risk(grammar)·goldman-ir(다크스킨). 전부 prompt.md 싹싹 정독으로 정체성 흡수(glow 1차 glow-only=약함 반려→딥 재흡수).
- **엔진 grammar 씨임**: `tools/build-template.py`의 `GRAMMAR` dict 1지점 분기(무선언 룩=무회귀). 키 — upper_tiers·body_bold·cover·badge·block_fill·accent_repeat·mono_accent·header_rule·chart_style(brutal/swiss/luxe/**tech/prism/cinematic**)·rule_field·type·decor·bg_gradient·glass·tilt·**mono_meta·grid_bg·section_watermark·kpi_value_accent·gradient_stroke/text·radial_glow·quiet_compare·chevron·card_enumerator** + 다크캔버스 자동(resolve_dark).
- 🆕 **일반 가독성 레이어 `_bg_atmosphere`**(2026-06-13): 룩이 *배경*(bg_gradient/radial_glow/image)을 선언하면 카드 opacity·차트 백드롭이 **엔진에서 자동 도출**(resolve_dark의 가독성 짝). depth 토큰 없는 룩 byte-identical. **흡수 시 카드 alpha 수동지정 금지** — 배경만 선언. ⚠️ 단 차트 백드롭 불투명도(일관성↔가독성 균형)는 **HITL 노브 `chart_backdrop_opacity`**(CLI/spec/룩토큰, 기본=가독 바닥선≈48) — SKILL.md "가독성↔일관성 게이트"로 *사용자*가 결정(공유 스킬이라 누가 쓰든). 객관 바닥선=엔진, 그 위 균형=사람.
- **다음 흡수 로드맵**: `references/absorption-roadmap.md` — Tier A(43)/B(스킵 11), ~9 씨임 키트. 공짜 2개·🥇글로우 키트 완료. **다음 = (1) extract를 리포 정체성으로 격상**(사용자 결정 2026-06-13: `tools/extract-look/style/pptx.py` 1급화 + SKILL.md "레퍼런스 측정 안 함=클린룸" 캐논 문구 정합 — 현재 충돌) **(2) 🥈 그라디언트-온-셰이프 키트.** 재현성 주의: 룩=살아있는 문법이라 재빌드 시 룩 변동(뽑은 .pptx 파일은 불변, 정확재현=git 핀).
- **흡수 루틴**: `references/absorption-routine.md`. 소스 = design-diversity 팩 **로컬 클론** `/mnt/c/dev/design-diversity/design-packs/<slug>/`(prompt.md·tokens.json·preview.png). 검증 = all-archetypes 데모를 `--look <slug>`로 23 전수 렌더 후 시각 QA(Windows PowerPoint COM, `tools/qa-runner.sh`).
- 🚨 **제1 교훈(2026-06-13)**: 흡수는 **각 룩 `prompt.md`를 처음부터 끝까지 싹싹 정독**해서 한다. 로드맵/키트의 씨임 *이름*(예 "glow")만 보고 효과 1개만 흡수하면 **반드시 특색 약함=정형화**(글로우 1차가 이래서 사용자 QA 반려). 효과는 정체성의 10~20%일 뿐 — 모노 라벨·격자·워터마크·타이포 위계 같은 *비-효과* 규칙이 더 강한 식별 단서인 경우 많음. **통과 게이트 = 원본 preview.png 대조**(추측 금지). 시각 QA 제시 시 항상 원본 preview를 결과와 나란히. → [[feedback_visual-qa-show-original-target]]
- 교훈: 신규 차트/마크는 하드코딩 색 금지·role 토큰 사용(캔버스 휘도 자동 대응) — 안 그러면 반대 명도 배경서 증발(흡수 중 버그 2건 원인).
- **showcase 아키타입(24번째, Focus, 2026-06-12 master 머지)**: 와이드 미디어 전용. 헤더와 좌측정렬·무크롭·무왜곡 + 불릿 **이미지 종횡비 자동배치**(세로여유=우측 / 가로여유=하단) + **룩 카드 스킨(border/shadow) 자동 상속**(플랫룩=맨몸). 와이드 스크린샷·UI캡처·도표는 feature(우측·cover 크롭) 대신 showcase. `build_showcase`.
- **이미지 조달 도구 3종 + 우선순위**(SKILL.md): ① `tools/extract-images.py` — 사용자 콘텐츠(PDF fitz·PPTX/DOCX zip·폴더·URL)에서 이미지 추출→`assets/extracted/`+매니페스트(아이콘 필터·중복제거). ② `tools/gen-texture.py` — 절차적 배경(mesh·linear·glow·dots·grain·solid, numpy+PIL, `--look` 팔레트 자동, 결정론). ③ AI 생성 `tools/gen-image.py`(Gemini Nano Banana 래퍼, 키=`~/.claude/secrets/Gemini API Credentials.md`)는 **`feat/image-gen` 브랜치에 파킹**(워크플로 복잡도로 master 미머지). 우선순위 = 추출>절차적>AI>플레이스홀더. 크롭은 엔진 `media()` fit/focal.
