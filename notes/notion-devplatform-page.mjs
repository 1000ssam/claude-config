import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const RESOURCES_DB = '2eedd1dcd64481a892aff0c82b28f2fa';
const RESOURCES_DS = '2eedd1dc-d644-81d5-a705-000b74a28a57';

// 1) 스키마에서 실제 속성명을 타입 기준으로 탐지 (속성명 오타 방지)
const ds = await notion.call('GET', `/data_sources/${RESOURCES_DS}`);
const props = ds.properties;
const byType = (t) => Object.entries(props).filter(([, v]) => v.type === t).map(([k]) => k);
const titleProp = byType('title')[0];
const multiProp = byType('multi_select')[0];
const urlProp = byType('url')[0];
const checkboxProp = byType('checkbox')[0];
const richProp = byType('rich_text')[0];
console.log('탐지된 속성:', { titleProp, multiProp, urlProp, checkboxProp, richProp });

// 2) 본문 마크다운
const md = `> **2026년 5월 13일**, Notion 공동창업자이자 CEO인 **Ivan Zhao**가 진행한 라이브 키노트를 통해 **Notion Developer Platform**이 정식 공개되었습니다. 핵심 비전은 **"Any data, any tool, any agent"** — 어떤 데이터든, 어떤 도구든, 어떤 에이전트든 Notion 워크스페이스 안으로 끌어들이겠다는 선언입니다.

<callout icon="📋" color="gray_bg">
\t이 페이지는 Notion 공식 자료(공식 블로그 · 릴리스 노트 3.5 · 제품 페이지 · 개발자 문서 · 행사 페이지)만을 근거로 토픽별 정리했습니다. 언론 보도·커뮤니티 자료는 포함하지 않았습니다.
\t정리 기준일: 2026-05-17
</callout>

## 📌 1. 행사 개요

| 항목 | 내용 |
| --- | --- |
| 행사명 | Notion Developer Platform Launch |
| 일시 | 2026년 5월 13일 |
| 형식 | 온라인 라이브 키노트 (종료 후 녹화본 공개) |
| 진행 | Ivan Zhao — Notion 공동창업자 겸 CEO |
| 릴리스 | Notion 3.5 "Notion Developer Platform" |
| 행사 페이지 | makewithnotion.com |

키노트는 ① 외부 데이터를 Notion으로 동기화하는 데모, ② 외부 AI 에이전트를 Notion 안으로 불러오는 데모, ③ Notion CLI로 직접 빌드하는 데모, 세 축으로 구성되었습니다.

Notion은 그동안 개발자 대상 기능(공개 API 정도)이 제한적이었는데, 이번 발표는 그 기조를 정면으로 전환하는 선언입니다. Ivan Zhao는 이를 회사가 "역사적으로 제한적이던 개발자 포커스에서 의도적으로 벗어나는 행보"라고 규정했습니다. 발표 시점 기준 이미 **100만 개 이상의 Custom Agent**가 사용자들에 의해 만들어졌고, Slack Q&A 응답·주간 리포트 작성·업무 자동 분배 등에 활용되고 있다고 밝혔습니다.

### 이 플랫폼이 푸는 문제

기존에는 Notion을 외부 시스템과 연결하거나 커스텀 로직을 붙이려면 자체 서버를 운영하고, 외부 API를 직접 폴링하고, 인증을 직접 관리해야 했습니다. Developer Platform은 이 인프라 부담을 **Notion이 호스팅하는 런타임**으로 흡수하고, 사람과 코딩 에이전트가 같은 데이터 위에서 협업하는 구조를 지향합니다.

## 🧱 2. Notion Workers — 호스팅 런타임 (플랫폼의 기반)

**Workers**는 Developer Platform 전체를 떠받치는 핵심 구성요소입니다. 다른 기능들이 모두 이 위에서 동작합니다.

- **정의**: 커스텀 코드를 위한 Notion 호스팅 런타임. 작은 **TypeScript** 프로그램 단위이며, Notion이 관리하는 격리된 보안 샌드박스(secure sandbox)에서 실행됩니다.
- **서버리스**: 사용자가 서버를 프로비저닝·운영할 필요가 없습니다. "로직을 작성하고, 샌드박스에 배포하면 바로 라이브 — 준비할 서버 없음(no servers to provision)".
- **배포 방식**: Notion CLI를 통해 배포합니다. 사람이 직접 작성하거나, 코딩 에이전트가 코드를 짠 뒤 CLI로 deploy 합니다.
- **역할**: Workers는 단독 기능이 아니라 Database Sync · Custom Agent Tools · Webhook 등 상위 기능을 모두 구동하는 실행 엔진입니다.
- **CLI 명령 예시**: \`ntn workers new\`, \`ntn workers deploy\`, \`ntn workers list\`
- **플랜 요건**: Workers의 배포·운영은 **Business 및 Enterprise 플랜**에서 제공됩니다.

## 🔄 3. Database Sync — 외부 데이터 동기화 (Beta)

- **정의**: API를 가진 거의 모든 외부 데이터베이스의 데이터를 Notion 데이터베이스로 끌어와, 항상 최신 상태로 유지하는 기능.
- **연동 예시**: Salesforce, Zendesk, Postgres, Strava 등.
- **구동 기반**: Workers 위에서 동작하며, 외부 소스를 주기적으로 동기화해 데이터를 신선하게 유지합니다.
- **의의**: CRM·고객지원·운영 DB의 데이터를 Notion 안에서 직접 보고 다룰 수 있고, 그 데이터를 Custom Agent의 컨텍스트로도 활용할 수 있게 됩니다.
- **출시 단계**: Beta

## 🛠 4. Custom Agent Tools — 결정론적 에이전트 도구 (Beta)

- **정의**: Workers를 이용해 Custom Agent를 위한 **결정론적(deterministic) 도구**를 직접 코드로 구현하는 기능.
- **필요성**: LLM이 매개하는 일반적인 tool call로는 항상 보장하기 어려운 정확한 로직(계산, 규칙 기반 처리 등)을 코드로 고정할 수 있습니다.
- **부가 이점**: 코드 기반 처리이므로 LLM 호출 대비 토큰 비용이 더 낮습니다.
- **출시 단계**: Beta

## 🔔 5. Webhook Triggers — 외부 트리거 (Beta)

- **정의**: 외부 앱이 Notion 워크플로를 직접 트리거할 수 있게 하는 웹훅.
- **의의**: 이벤트 기반 자동화 — 외부 시스템에서 일어난 일이 Notion 내부 워크플로를 즉시 발화시킵니다.
- **출시 단계**: Beta

## 🤖 6. External Agents API / Orchestrate Agents (Alpha)

- **정의**: 외부 AI 에이전트를 Notion 워크스페이스의 "참여자"로 끌어들이는 API. 사용자가 직접 만든 에이전트도 포함됩니다.
- **동작 방식**: 외부 에이전트가 Notion 안에서 직접 대화하고, 팀원과 나란히 액션을 수행합니다.
- **출시 시 지원 에이전트**: Claude(Claude Code), Codex, Cursor, Decagon — "out of the box"로 동작하도록 파트너십 체결. 이후 지원 목록을 확대할 예정입니다.
- **출시 단계**: Alpha (릴리스 노트상 "Orchestrate Agents")

## 📦 7. Agent SDK — Notion 에이전트 외부 임베드 (Alpha)

- **정의**: Notion 에이전트를 외부 도구 안에 임베드하는 SDK.
- **활용 예**: CRM, Microsoft Teams, 각종 대시보드 등 외부 인터페이스 안에서 Notion 에이전트를 호출.
- **방향성**: External Agents API가 "외부 에이전트를 Notion 안으로" 끌어오는 것이라면, Agent SDK는 반대로 "Notion 에이전트를 외부로" 내보내는 것입니다.
- **출시 단계**: Alpha

## ⌨️ 8. Notion CLI (\`ntn\`)

- **정의**: 개발자와 코딩 에이전트가 Developer Platform 전체와 상호작용하는 공식 커맨드라인 도구.
- **인증**: 한 번 인증하면(authenticate once) 이후 Notion 읽기·액션 수행, Workers 관리·배포, 워크플로 자동화를 모두 터미널/IDE에서 처리할 수 있습니다.
- **주요 기능**:
    - Workers 생성·배포·운영 (\`ntn workers new\` / \`deploy\` / \`list\`)
    - Notion API 인증 요청 (인라인 JSON 구성, 셸 자동완성 지원)
    - 정적 파일 업로드 (이미지·PDF 등을 Notion 페이지에서 참조)
- **설계 의도**: 사람과 AI 코딩 에이전트 양쪽을 모두 1차 사용자로 상정합니다. 공식 영상 제목도 "Meet the Notion CLI: Built for Agents & Humans"입니다.

## 🔗 9. Connections 탭 & Agent Hall of Fame

- **통합 Connections 탭**: 워크스페이스 연결과 개인 연결을 한곳에서 관리하는 중앙 탭.
- **Agent Hall of Fame**: 미리 만들어진 에이전트 템플릿 모음. 셋업 체크리스트와 프롬프트가 함께 제공되어 빠르게 도입할 수 있습니다.

## 💳 10. 가격 · 플랜 · 일정

<callout icon="⚠️" color="yellow_bg">
\tWorkers 과금 일정: 베타 기간 동안 Workers는 무료로 실행되지만, 2026년 8월 11일부터 Notion 크레딧으로 과금됩니다.
</callout>

- **베타 무료 기간**: 출시 시점 ~ 2026-08-11 이전까지 Workers 실행 무료.
- **2026-08-11~**: Workers 실행이 Notion 크레딧 기반 과금으로 전환.
- **플랜 요건**: Workers 배포·운영은 Business / Enterprise 플랜.

## 📊 11. 기능별 출시 단계 요약

| 기능 | 한 줄 설명 | 출시 단계 |
| --- | --- | --- |
| Notion Workers | 호스팅 코드 런타임 (서버리스, TypeScript) | 베타 (무료 → 8/11 과금) |
| Database Sync | 외부 API DB → Notion DB 동기화 | Beta |
| Custom Agent Tools | 코드 기반 결정론적 에이전트 도구 | Beta |
| Webhook Triggers | 외부 앱이 Notion 워크플로 트리거 | Beta |
| External Agents API | 외부 에이전트를 Notion 참여자로 | Alpha |
| Agent SDK | Notion 에이전트를 외부 도구에 임베드 | Alpha |
| Notion CLI (ntn) | 플랫폼 전체 제어 커맨드라인 | 출시 |

## 🆚 12. 알파 단계 Workers vs. 3.5 발표 Workers

<callout icon="🔎" color="blue_bg">
\t중요: 5월 13일 이전 공식 릴리스 노트에는 Workers 언급이 전혀 없습니다. 알파 Workers는 키노트·릴리스 없이 GitHub 템플릿 저장소와 개발자 포털 opt-in으로만 조용히 풀린 사전 공개였습니다.
</callout>

### 공개 경로의 차이

- **알파**: 공식 행사 발표가 아님. Notion 공식 조직 GitHub 저장소 \`makenotion/workers-template\`(알파 전용 README 문서 포함)와 개발자 포털 opt-in(developer preview)으로 배포. "지금은 진지한 용도로 쓰지 말라"는 사전 공개 경고가 수반됨.
- **3.5 발표**: Ivan Zhao 라이브 키노트와 공식 릴리스 노트 v3.5로 정식 공개.

### 핵심 차이 비교

| 구분 | 알파 단계 Workers | 3.5 발표 Workers (2026-05-13) |
| --- | --- | --- |
| 공개 방식 | 키노트·릴리스 없이 GitHub 템플릿 + 포털 opt-in으로 조용히 배포 | Ivan Zhao 라이브 키노트 + 공식 릴리스 노트 v3.5 |
| 위상 | 독립된 "에이전트용 코드 도구 프레임워크" | Developer Platform 전체의 기반 런타임 |
| 성숙도 | alpha → developer preview (사용 자제 권고) | Beta (정식 제품군의 일부) |
| 기능 범위 | tool call 중심, 이후 data sync·webhook 추가 | Database Sync·Custom Agent Tools·Webhook Triggers가 모두 "Workers 기반"으로 정식화 |
| 주변 제품 | Workers 단독 | External Agents API·Agent SDK·통합 CLI와 함께 발표 |
| 가격 | 무료 (가격 정책 없음) | 베타 무료 → 2026-08-11부터 크레딧 과금 |

### 무엇이 바뀌었나

1. **"도구"에서 "플랫폼 기반"으로 격상** — 알파 시절에는 "에이전트가 외부 API와 대화하게 해주는 TypeScript 도구 프레임워크"라는 좁은 포지션이었습니다. 3.5에서는 Database Sync·Custom Agent Tools·Webhook Triggers가 전부 "Workers로 구동된다"고 명시되며 플랫폼의 실행 엔진으로 재정의됐습니다.
2. **기능 묶음의 정식 명명** — 알파에서 산발적으로 붙던 sync·webhook 기능이 3.5에서 각각 이름 붙은 Beta 제품(\`Sync any data source\`, \`Build custom tools\`, \`Trigger workflows from anywhere\`)으로 정리됐습니다.
3. **과금 도입** — 알파는 가격 언급 자체가 없었고, 3.5 발표에서 2026-08-11 크레딧 과금 전환 일정이 처음 공식화됐습니다.

### 출처 신뢰도 구분

- **공식 확인됨**: v3.5 릴리스 노트, 공식 블로그, \`makenotion/workers-template\` 저장소(Notion 공식 조직), 5/13 이전 릴리스 노트에 Workers 부재.
- **2차 보도(미확정)**: "2026년 3월 조용한 알파 도입", "4월 developer preview", 샌드박스 스펙(30초 타임아웃·128MB 메모리·아웃바운드 도메인 허용목록)은 외부 블로그 보도이며 Notion 공식 문서에서 직접 확인되지 않았습니다. 본문에서는 단정 표현을 피했습니다.

## 📚 13. 공식 레퍼런스 링크

| 분류 | 링크 |
| --- | --- |
| 공식 발표 블로그 | https://www.notion.com/blog/introducing-developer-platform |
| 릴리스 노트 3.5 | https://www.notion.com/releases/2026-05-13 |
| 릴리스 전체 목록 | https://www.notion.com/releases |
| 제품 페이지 | https://www.notion.com/product/dev |
| 헬프센터 안내 | https://www.notion.com/en-gb/help/what-is-the-notion-developer-platform |
| 개발자 문서 포털 | https://developers.notion.com/ |
| Notion CLI 시작 가이드 | https://developers.notion.com/cli/get-started/overview |
| 행사 페이지 | https://makewithnotion.com/ |
| 행사 FAQ | https://makewithnotion.com/faqs |
| 키노트 라이브스트림 (YouTube) | https://www.youtube.com/live/rpE2rzKO6L0 |
| "Meet the Notion CLI" 영상 | https://www.youtube.com/watch?v=k-6ldiWIDsg |
| 공식 GitHub (makenotion/skills) | https://github.com/makenotion/skills |
| 알파 Workers 템플릿 저장소 (makenotion) | https://github.com/makenotion/workers-template |
`;

// 3) 기존 페이지 본문 갱신 (알파 vs 3.5 Workers 비교 섹션 추가)
const PAGE_ID = '363dd1dc-d644-81f4-a4a4-d3c6dd794600';
await notion.updatePageMarkdown(PAGE_ID, md);
console.log('본문 갱신 완료:', PAGE_ID);
