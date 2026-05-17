# Make with Notion 2026 시리즈 — 작성 바이블

## 0. 이 문서의 용도
9편 블로그 포스트를 일관되게 쓰기 위한 단일 기준 문서. 각 작성 에이전트는 이 문서를 먼저 끝까지 읽고, **자기 담당 1편만** 작성한다. 다른 편은 건드리지 않는다.

## 1. 시리즈 개요
- 소재: 2026-05-13 노션 'Make with Notion'에서 발표된 **개발자 플랫폼**
- 블로그: notiontalk (notiontalk.com) — 교사·실무자 대상
- 총 9편 = 본편 3편(A·B·C) + 기능 6편(#2~#7)

## 2. 독자
교사·실무자·비개발자. 노션은 쓰지만 코딩은 모른다. 기술 용어는 반드시 풀어서, 비유로 설명한다.

## 3. 톤 & 스타일 (★최우선)
- 존댓말, 친절, **비유 중심**. 이전 글('노션 워커스 알파편') 톤을 그대로 잇는다.
- **분석은 서술에서 멈춘다.** 비판적인 척·예리한 척 금지. "위장막"·"인질" 같은 냉소적·자극적 표현 금지.
- 전략 분석(B편)은 **긍정~중립 뉘앙스**. 진짜 리스크는 드라마화 없이 담담한 사실 맥락으로 제시.
- **출처에 없는 내용 발명 절대 금지.** 사실 진술은 오직 §7 Facts Sheet에 있는 것만 사용. §7에 없거나 "미확정"으로 표시된 건 단정하지 말 것.
- UI/모킹에 이모지 아이콘 쓰지 말 것(콜아웃 아이콘 정도만 허용).

## 4. 포맷 규약
- 노션 페이지. `notion-api.mjs`의 `updatePageMarkdown(pageId, md)`로 본문 전체를 작성한다.
- 글 구조:
  1. 상단 callout(`blue_bg`) = **굵은 한 줄 후킹** + `---` 줄 + `**이 글에서 배울 내용** ⏳ ` + 읽기시간 + 불릿 4개
  2. `#` 헤딩 섹션들 (본문)
  3. 표·비유 적극 활용
  4. 필요 시 ⚠️ 주의 callout(`orange_bg`)
  5. `# 정리` — 핵심 불릿 3개 안팎
  6. 맨 끝 💡 다음 편 예고 callout(`green_bg`)
- callout 마크다운은 태그/내용 별도 줄, 내용은 탭 들여쓰기. 한 줄 내용도 인라인 금지. (`~/.claude/skills/notion-pilot.md` 형식 규칙 준수)
- 표는 마크다운 `| | |` + 구분선 `| --- |`.
- 분량: 이전 워커스 글 정도(읽기 5분 안팎). 기능 6편은 그보다 짧아도 됨.

## 5. 척추 — 본편 3편이 공유하는 인과 사슬
> 노션은 'DB 경쟁'을 하는 게 아니라 **에이전트 운영환경**이 되려 한다 → 그래서 갈아타기 비용이 *데이터*가 아니라 *워크플로 전체*에 쌓인다 → 에이전트가 행동할 때마다 크레딧이 소모되니, 운영환경이 곧 **매출 모델**이 된다.

본편(특히 B)은 이 사슬 위에서 쓴다. 단, 위 표현을 그대로 베끼지 말고 각 글의 맥락에 맞게 풀어 쓴다.

## 6. 9편 명세

### A. [본편] 개발자 플랫폼 발표 정리
- page ID: `363dd1dc-d644-81b0-b411-ef7b420cf09f` (기존 초안 존재 — 바이블 기준으로 다듬고 보강)
- 다룰 것: 키노트 개요, 7개 기능 한눈에 보는 표, 알파 워커스의 정식(Beta) 졸업, 교사·실무자가 알아야 할 것(요금제·비용·출시단계), 정리
- 안 다룰 것: 각 기능의 깊은 설명(기능 6편에 위임), 전략 분석(B), 크레딧 상세(C)
- 다음 편 예고: B '노션의 B2B 대전환'

### B. [본편] 노션의 B2B 대전환 분석
- **오케스트레이터(사람)가 직접 작성. 에이전트 대상 아님.**

### C. [본편] Workers 크레딧 정책 — 비용 이야기
- page ID: `363dd1dc-d644-81f7-9570-d5e225f46ece`
- 다룰 것: Workers 8/11 유료 전환, 크레딧 구조($10/1000·워크스페이스 공유·매월 리셋), per-run 과금, run 단가가 작업량에 따라 변동한다는 점, run 3종(Sync/Tool call/Webhook)과 공식 비용 예시, 서버리스 종량제가 표준이라는 맥락(AWS·CF·Vercel 가볍게), 크레딧 아끼는 법
- 다룰 것(추가): run 단가가 작업량에 따라 변동해 **정확한 사전 견적이 어렵다**는 점을 실용 정보로 안내. 단어는 '불투명' 대신 '예측이 어렵다'를 쓴다. 반드시 ① '소규모로 먼저 돌려 실제 크레딧 소모를 실측하라' 팁 ② '아직 베타라 가격 정책이 더 구체화될 수 있다'는 균형을 함께 붙인다. 변동 단가가 '실제 한 일만큼 매긴다'는 면에선 합리적이라는 균형도 한 줄. 노션의 의도를 추궁하는 톤 금지.
- 안 다룰 것: 전략 분석, 기능 동작 원리
- 다음 편 예고: 기능 시리즈 첫 편(Database Sync)

### 기능 6편 (#2~#7) — 각 페이지에 아웃라인 초안이 이미 있음. 아웃라인을 바이블·Facts 기준으로 **완성된 본문으로 대체**(append 아님).
| 편 | 제목 키워드 | page ID | 출시단계 |
|---|---|---|---|
| #2 | Database Sync | `363dd1dc-d644-8150-befb-f2e5c7eb04e7` | Beta |
| #3 | External Agents | `363dd1dc-d644-8131-80e1-ff22c503c5b0` | Alpha |
| #4 | Custom Agent Tools | `363dd1dc-d644-813e-a61c-f5a9e62b7dd1` | Beta |
| #5 | Webhook Triggers | `363dd1dc-d644-817f-a1fe-cbb75ade336a` | Beta |
| #6 | Notion CLI(ntn) | `363dd1dc-d644-812f-80de-e2626544ef79` | 출시 |
| #7 | Agent SDK | `363dd1dc-d644-812a-b1b0-c47650145afe` | Alpha |
각 편의 다룰것/안다룰것/다음편 예고는 해당 페이지의 기존 아웃라인을 따른다. 기능 6편은 전략 분석을 하지 말 것(설명문에 집중).

## 7. Facts Sheet — 사실 진술은 오직 이것만 사용
- 발표: 2026-05-13, 'Make with Notion', Ivan Zhao(공동창업자·CEO) 라이브 키노트.
- 7개 기능: Workers / Database Sync / Custom Agent Tools / Webhook Triggers / External Agents API('Orchestrate Agents') / Agent SDK / Notion CLI(`ntn`).
- 출시 단계: Workers·Database Sync·Custom Agent Tools·Webhook Triggers = **Beta** / External Agents·Agent SDK = **Alpha** / CLI = 출시.
- Workers: 노션이 호스팅하는 코드 런타임. TypeScript. 보안 샌드박스. CLI로 배포. Database Sync·Custom Agent Tools·Webhook이 모두 Workers 위에서 동작. **Business·Enterprise 플랜 전용.**
- Workers 과금: 베타 기간 무료 → **2026-08-11부터** Notion 크레딧으로 과금. **per-run** 모델. 대표값 **약 $0.0023/run**, 1,000크레딧($10)당 약 4,348 run. **run 단가는 고정이 아니라 작업량(실행 시간·처리량)에 따라 변동.** 초·메모리·API콜 단위의 별도 컴퓨트 청구는 없음.
- 크레딧: **$10 / 1,000크레딧**, 워크스페이스 공유, 매월 리셋·이월 없음. Custom Agents와 같은 크레딧 풀 공유. 청구·소모는 다음 월 서비스 날짜부터.
- run 3종: Sync(동기화 1회=1run), Tool call(에이전트가 워커 호출 1회=1run), Webhook(워커가 처리한 이벤트 1건=1run).
- 공식 비용 예시(C편용): Sync 일1회 $0.07/월·시간당 $1.66/월·15분마다 $6.62/월 | Tool call 월30회 $0.21·월3,000회 $27.60·월9,000회 $103.50 | Webhook 일20건 $1.38/월·일200건 $13.80/월·일5,000건 $345/월.
- Database Sync: API를 가진 외부 DB를 노션 DB로 **단방향(pull into Notion)** 동기화. 공식 서술은 일관되게 "노션 안으로 끌어온다"이며 양방향·쓰기 되돌림 언급은 없음. 기존 'Synced Databases'(Jira/GitHub 등)는 명시적으로 단방향 읽기전용. **→ 본문에서 양방향이라고 쓰거나 "노션에서 데이터를 고친다"고 암시하지 말 것.** 쓰기는 에이전트가 Worker를 통해 외부 API로 수행하는 경로로 설명.
- 알파 Workers: 2026-05-13 이전, 키노트·릴리스 없이 공식 GitHub 템플릿 저장소(`makenotion/workers-template`)와 개발자 포털 opt-in으로 조용히 공개됐던 알파. 5/13에 정식(Beta)으로 졸업.
- External Agents 출시 시 지원: Claude(Claude Code), Codex, Cursor, Decagon. 이후 확대 예정.
- (B편 맥락) '워크스페이스 = 에이전트 운영환경' 전환은 노션만의 길이 아니라 업계 공통 흐름(MS Copilot, Salesforce Agentforce 등). 노션의 차별점 = 문서/워크스페이스 출신이라는 출발점 + 'any agent' 중립성.
- (C편 맥락) 무게 기반 종량제는 서버리스의 표준. AWS Lambda = 요청수 + GB-초, Cloudflare Workers·Vercel = CPU/Active CPU 시간 과금. 노션은 이를 'run·크레딧'으로 추상화하고 AI 크레딧과 한 풀로 통합한 게 특징.
- **미확정(쓰지 말 것)**: 샌드박스 정확 스펙(타임아웃·메모리 수치), 단방향/양방향 100% 단정, External Agents·Agent SDK의 과금 방식, Notion이 벽시계 시간/CPU 시간 중 무엇으로 과금하는지.

## 8. 출처·단정 규율
- 공식 자료(notion.com 릴리스/블로그/헬프, developers.notion.com) 기반임을 자연스럽게 드러낸다.
- 단정할 수 없는 것은 "~로 보인다 / 공식 확인되지 않음"으로 표기. [[feedback_no-fabrication]] 원칙 최우선.

## 9. 노션 작성 메커니즘 (작성 에이전트용)
- `import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';`
- 본문 작성: `await notion.updatePageMarkdown(pageId, markdown);`
- 담당 page ID는 §6 참조. **새 페이지를 만들지 말 것.** 지정된 page ID의 본문만 교체.
- callout/표 형식이 깨지면 `~/.claude/skills/notion-pilot.md`의 마크다운 규칙을 참조.

## 10. 실행 체크리스트 (오케스트레이터용)
- [ ] 바이블 사용자 확인
- [ ] B·C 페이지 셸 생성 → C의 page ID를 §6에 기입
- [ ] 8편 작성 에이전트 병렬 실행(A·C·#2~#7) + B는 오케스트레이터 직접 작성
- [ ] 9편 정합성 리뷰(크로스레퍼런스·중복·톤)를 리뷰 에이전트에 위임
- [ ] 결과 보고
