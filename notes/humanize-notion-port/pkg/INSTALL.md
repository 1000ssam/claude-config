# humanize-korean 스킬 번들 — 설치 안내

AI(ChatGPT·Claude·Gemini 등)가 쓴 한글 텍스트의 "AI 티"를 탐지·분류해 내용은 그대로 두고 문체·리듬·표현만 자연스러운 한국어로 윤문하는 오케스트레이터 스킬의 전체 번들이다.

## 번들 구성

```
SKILL.md                      # 오케스트레이터 본체 (fast/strict 2모드)
references/                   # 룰북·분류체계·처방·지표
  quick-rules.md              #   Fast 모드 슬림 룰북 (monolith 전용)
  ai-tell-taxonomy.md         #   분류 체계 본진 (SSOT, 10대분류 × 40+ 패턴) — Strict 전용
  rewriting-playbook.md       #   카테고리별 윤문 처방 — Strict 전용
  web-service-spec.md         #   웹 서비스 확장 스펙 (옵션)
  scholarship.md              #   번역학 학술 인용 계보
  metrics.py / metrics_v2.py  #   post-editese 정량 지표 (표준 라이브러리만)
  baseline.json / baseline_v2.json  # 지표 회귀 베이스라인
agents/                       # 파이프라인 서브에이전트 12종
  humanize-monolith.md        #   Fast 단일 호출 (탐지+윤문+자체검증)
  ai-tell-detector.md         #   Strict: 탐지
  korean-style-rewriter.md    #   Strict: 윤문
  content-fidelity-auditor.md #   Strict: 의미 동등성 감사
  naturalness-reviewer.md     #   Strict: 자연스러움 리뷰
  korean-ai-tell-taxonomist.md      # 분류 체계 유지·확장
  korean-translation-scholar.md     # 학술 정통성 큐레이션
  taxonomy-gap-analyzer.md          # 본진 vs 외부 보고서 갭 분석
  translationese-research-distiller.md  # 번역투 학술 보고서 증류
  post-editese-metric-engineer.md       # 정량 지표 엔지니어링
  quick-rules-integrator.md             # v2.0 → quick-rules 통합·PR
  humanize-web-architect.md             # 웹 서비스 아키텍처 (옵션)
```

## Claude Code 설치 (재배포)

```bash
# 1) 스킬 본체 + references
mkdir -p ~/.claude/skills/humanize-korean
cp SKILL.md ~/.claude/skills/humanize-korean/
cp -r references ~/.claude/skills/humanize-korean/

# 2) 서브에이전트 정의 (전역)
cp agents/*.md ~/.claude/agents/
```

설치 후 트리거 문구(예: "AI 티 없애줘", "GPT 문체 자연스럽게", "휴머나이저")로 호출한다.

> ⚠️ SKILL.md 안의 절대 경로(`/home/user/.claude/...`, `/mnt/c/...`)는 원 환경 기준이다. 다른 환경에 설치하면 `quick_rules_path` 등 경로 인자를 해당 환경의 실제 설치 위치로 바꿔야 한다.

## Notion에서 사용

이 zip이 첨부된 Notion 스킬 DB 페이지의 **본문 자체가 스킬 명세**다. Notion AI 에이전트/사람이 본문을 읽고 윤문 절차를 따르면 되고, zip은 Claude Code 환경으로 다시 옮길 때(재배포) 쓴다. 단일 호출로 처리하려면 본문의 "Fast 모드" 절차를, 정밀 검증이 필요하면 "Strict 모드"(5인 파이프라인) 절차를 따른다.
