import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const BLOG_DB = '2f4dd1dc-d644-81d5-ac29-fe1404e69381';
const AUTHOR_ID = '2f4dd1dc-d644-812c-b1fe-e4f273ca2ddd';

// ─────────────────────────────────────────────
// #1 개관편 — 본문 전체 초안
// ─────────────────────────────────────────────
const body1 = `<callout icon="🚀" color="blue_bg">
\t**2026년 5월 13일, 노션이 'Make with Notion'에서 개발자 플랫폼을 공개했습니다.** 노션을 외부 데이터·도구·AI 에이전트와 연결하는 7가지 기능이 한꺼번에 발표됐습니다.
\t지난 글에서 소개한 노션 워커스도 이때 알파 단계를 졸업했습니다. 이 글은 시리즈의 출발점으로, 발표 전체를 교사·실무자 눈높이에서 지도처럼 훑어봅니다.
\t---
\t**이 글에서 배울 내용** ⏳ \`읽기 5분\`
\t- Make with Notion 2026에서 무엇이 발표됐는지
\t- 노션이 말하는 'Any data, any tool, any agent'가 무슨 뜻인지
\t- 7가지 기능이 각각 무엇이고, 누구에게 필요한지
\t- 지금 당장 쓸 수 있는지 — 요금제·비용·시점
</callout>
# 노션이 '닫힌 도구'에서 '플랫폼'으로
그동안 노션은 잘 만든 '문서·데이터베이스 도구'였습니다. 하지만 노션 안의 일은 노션 안에서 끝났습니다. 회사의 고객 데이터, 외부 AI, 다른 업무 앱과 노션을 잇는 건 개발자의 몫이었고, 그마저도 직접 서버를 돌려야 했습니다.
Make with Notion 2026에서 노션이 던진 메시지는 한 문장으로 요약됩니다.
> **"Any data, any tool, any agent"** — 어떤 데이터든, 어떤 도구든, 어떤 에이전트든 노션 안으로.
쉽게 말하면 이렇습니다. **노션을 '내 업무의 중심 허브'로 만들고, 바깥의 데이터와 AI를 노션 쪽으로 끌어오겠다**는 선언입니다. 지금까지는 노션이 다른 도구로 데이터를 보내주는 쪽에 가까웠다면, 이제는 반대로 끌어당기는 쪽이 됩니다.
# 한눈에 보는 7가지
발표된 기능을 표로 정리하면 이렇습니다. 각 기능은 이 시리즈에서 한 편씩 따로, 자세히 다룹니다.
| 기능 | 한 줄 설명 | 누구에게 필요한가 |
| --- | --- | --- |
| 워커스(Workers) | 노션이 대신 돌려주는 코드 실행 공간 | 아래 모든 확장의 '기반' |
| Database Sync | 외부 DB를 노션 DB로 자동 동기화 | 외부 데이터를 노션에서 보고 싶은 사람 |
| External Agents | 클로드·코덱스 같은 외부 AI를 노션 안으로 초대 | 여러 AI를 노션에서 함께 쓰고 싶은 팀 |
| Custom Agent Tools | 정확한 코드 도구로 에이전트를 보강 | 정확도·크레딧 절약이 중요한 사람 |
| Webhook Triggers | 외부 앱의 사건이 노션 자동화를 발동 | 이벤트 기반 자동화가 필요한 사람 |
| 노션 CLI(ntn) | 개발자·코딩 AI가 쓰는 명령줄 도구 | 직접 빌드·배포하는 사람 |
| Agent SDK | 노션 에이전트를 외부 앱에 심기 | 노션 밖에서 노션 AI를 쓰고 싶은 사람 |
# 지난 글의 워커스, 정식 기능이 되다
지난 글에서 노션 워커스를 "2026년 3월 기준 알파 단계"라고 소개했습니다. 그 사이 노션은 워커스를 개발자 플랫폼의 **핵심 기반**으로 끌어올렸습니다.
알파 때 워커스는 '에이전트용 코드 도구'라는 좁은 기능이었습니다. 하지만 이제는 위 표의 Database Sync·Custom Agent Tools·Webhook이 **모두 워커스 위에서 돌아갑니다.** 워커스가 플랫폼 전체를 움직이는 엔진이 된 셈입니다.
| 구분 | 알파 때 | 지금 |
| --- | --- | --- |
| 위상 | 독립된 도구 하나 | 플랫폼 전체의 기반 |
| 단계 | 알파(테스트 단계) | 베타(정식 제품군의 일부) |
| 비용 | 무료 | 베타 무료 → 2026년 8월 11일부터 크레딧 과금 |
# 교사·실무자가 지금 알아야 할 것
<callout icon="⚠️" color="orange_bg">
\t개발자 플랫폼의 핵심 기능 상당수(워커스 배포·데이터 동기화·웹훅 등)는 **비즈니스(Business) 이상 요금제**에서만 쓸 수 있습니다. 무료·플러스 요금제에서는 제한됩니다.
</callout>
- **대부분 코드가 필요합니다.** 다만 클로드 코드 같은 AI 코딩 도구로 코드를 생성할 수 있어, 직접 코딩하지 않고도 만들 수는 있습니다.
- **비용이 듭니다.** 워커스는 베타 기간 무료지만, 2026년 8월 11일부터 노션 크레딧으로 과금됩니다.
- **기능마다 단계가 다릅니다.** 어떤 기능은 베타, 어떤 기능은 알파입니다. 다음 편들에서 기능별로 단계를 표시하겠습니다.
# 정리
Make with Notion 2026의 개발자 플랫폼은 **노션을 업무의 중심 허브로 만들려는 시도**입니다.
- 외부 데이터·도구·AI를 노션 안으로 끌어오는 7가지 기능이 발표됐습니다
- 지난 글에서 소개한 워커스는 알파를 졸업해 플랫폼의 기반이 됐습니다
- 핵심 기능은 비즈니스 요금제와 크레딧 비용이 필요합니다
<callout icon="💡" color="green_bg">
\t**다음 편에서는** 첫 번째 기능인 **Database Sync**를 다룹니다. 세일즈포스·구글시트 같은 외부 데이터를 노션 데이터베이스 안으로 자동으로 끌어오는 기능입니다.
</callout>`;

// ─────────────────────────────────────────────
// 아웃라인 공통 빌더
// ─────────────────────────────────────────────
function outline(no, name, intro, sections, nextTeaser) {
  const sec = sections.map((s) => `# ${s.h}\n${s.points.map((p) => `- ${p}`).join('\n')}`).join('\n');
  return `<callout icon="📝" color="gray_bg">
\t이 페이지는 'Make with Notion 2026' 시리즈 #${no} — ${name} 편의 아웃라인 초안입니다. 헤딩 구조와 핵심 포인트만 잡아두었으며, 본문 서술은 확장 예정입니다.
\t상위 개관편: 시리즈 #1 'Make with Notion 2026 — 노션이 개발자 플랫폼을 열었다'
\t톤·포맷은 기존 글과 동일하게 — 비유 중심, 존댓말, 교사·실무자 눈높이, 상단 요약 callout + 하단 다음 편 예고.
</callout>
${intro}
${sec}
# 정리 + 다음 편 예고
- 3줄 요약 불릿(핵심만)
- 💡 green callout으로 다음 편 예고: ${nextTeaser}
---
[작성 메모] 공식 출처만 인용: notion.com/releases/2026-05-13, notion.com/blog/introducing-developer-platform, developers.notion.com. 동기화 주기·샌드박스 스펙 등 세부 수치는 2차 보도라 미확정 — 본문에서 단정 인용 금지.`;
}

const intro = (hook) => `# 도입 (상단 요약 callout 자리)
- 후킹 한 줄: ${hook}
- "이 글에서 배울 내용" 체크리스트 4개 + 읽기 시간 표기
- 직전 편과의 연결 문장 한 줄`;

const body2 = outline(2, 'Database Sync',
  intro('세일즈포스·구글시트의 데이터를 노션에 옮겨 적는 수작업, 이제 안 해도 됩니다'),
  [
    { h: '왜 필요한가', points: [
      '노션은 잘 만든 데이터베이스 도구지만, 회사·기관의 진짜 데이터는 바깥(CRM·스프레드시트·사내 DB)에 흩어져 있음',
      '지금까지의 방법: 복사·붙여넣기 / 수동 갱신 / 개발자가 만든 연동에 의존',
      "핵심 통증: 노션 안 데이터가 금세 '옛날 데이터'가 된다" ] },
    { h: 'Database Sync가 하는 일', points: [
      'API를 가진 외부 데이터베이스를 노션 DB로 자동 동기화하고, 항상 최신 상태로 유지',
      '공식 언급 연동 예시: Salesforce, Zendesk, Postgres, Strava',
      '워커스 위에서 동작 → 시리즈 #1(워커스)과 연결 고리 명시' ] },
    { h: '비유 자리', points: [
      '아이디어: 외부 DB = 원본 장부 / 노션 = 자동으로 최신 내용이 베껴지는 사본',
      '확장 시 그림 1컷 권장' ] },
    { h: '실제 활용 예 (교사·실무자 버전)', points: [
      '학교·기관: 외부 설문/폼 응답 모음을 노션 대시보드로',
      '업무: CRM 고객 목록을 노션에서 다른 데이터와 함께 한눈에',
      '사용자 실제 사례 1개로 교체 권장' ] },
    { h: '지금 알아야 할 것', points: [
      '출시 단계: Beta',
      '비즈니스(Business) 이상 요금제 필요',
      '워커스 기반 → 2026년 8월 11일 이후 크레딧 비용 고려' ] },
  ],
  '시리즈 #3 External Agents');

const body3 = outline(3, 'External Agents',
  intro('노션 AI 말고도, 내가 쓰던 클로드·코덱스를 노션 안으로 불러올 수 있습니다'),
  [
    { h: '왜 필요한가', points: [
      '노션 AI도 좋지만, 사람마다 손에 익은 AI(클로드·코덱스 등)가 따로 있음',
      '지금까지: 노션 창과 AI 창을 오가며 복사·붙여넣기',
      '핵심 통증: AI가 노션 밖에 있어서, 노션의 맥락을 모른 채 일한다' ] },
    { h: 'External Agents가 하는 일', points: [
      "외부 AI 에이전트를 노션 워크스페이스의 '참여자'로 초대",
      '초대된 에이전트가 노션 안에서 직접 대화하고, 팀원과 나란히 작업 수행',
      '출시 시 지원: Claude(Claude Code), Codex, Cursor, Decagon — 이후 확대 예정' ] },
    { h: '비유 자리', points: [
      '아이디어: 노션 = 회의실 / 외부 에이전트 = 회의에 초대된 외부 전문가',
      'External Agents(밖→안)와 Agent SDK(안→밖)의 방향 대비를 미리 한 줄 언급' ] },
    { h: '실제 활용 예', points: [
      '리서치는 클로드, 코드 작업은 코덱스 — 노션 한 곳에서 분담',
      '고객 응대 에이전트(Decagon 등)를 노션 워크스페이스에 상주' ] },
    { h: '지금 알아야 할 것', points: [
      "출시 단계: Alpha (릴리스 노트상 'Orchestrate Agents')",
      '알파 단계라 기능·지원 목록이 계속 바뀔 수 있음',
      '요금제·크레딧 조건 확인 필요' ] },
  ],
  '시리즈 #4 Custom Agent Tools');

const body4 = outline(4, 'Custom Agent Tools',
  intro('에이전트가 가끔 틀리는 계산·규칙 처리, 코드 도구로 못박아 둘 수 있습니다'),
  [
    { h: '왜 필요한가', points: [
      'LLM이 직접 처리하는 작업은 계산·규칙 적용에서 가끔 틀린다(비결정적)',
      '에이전트가 생각(thinking)할 때마다 크레딧이 소모된다 — 지난 워커스 글에서 다룬 비용 문제',
      '핵심: 정확해야 하는 일은 AI 추론이 아니라 코드에 맡겨야 한다' ] },
    { h: 'Custom Agent Tools가 하는 일', points: [
      '워커스로 결정론적(deterministic) 코드 도구를 만들어 커스텀 에이전트에 연결',
      'LLM이 매개하는 일반 tool call로는 보장하기 어려운 정확한 로직을 코드로 고정',
      '코드 기반 처리라 토큰·크레딧 비용도 더 낮음' ] },
    { h: '비유 자리', points: [
      "아이디어: 비서에게 '암산' 대신 '계산기'를 쥐어주기",
      '지난 워커스 글(시리즈 #1)의 \\"비서-도구\\" 비유를 이어받아 일관성 유지' ] },
    { h: '실제 활용 예', points: [
      '성적 산출·점수 환산처럼 정확성이 생명인 계산',
      '정해진 양식대로의 문서 생성, 규칙 기반 분류' ] },
    { h: '지금 알아야 할 것', points: [
      '출시 단계: Beta',
      '워커스 기반 → 코드 작성 필요(AI 코딩 도구로 보완 가능)',
      '크레딧 절약 효과가 핵심 셀링포인트' ] },
  ],
  '시리즈 #5 Webhook Triggers');

const body5 = outline(5, 'Webhook Triggers',
  intro('폼이 제출되거나 결제가 끝나는 순간, 노션이 알아서 반응하게 만들 수 있습니다'),
  [
    { h: '왜 필요한가', points: [
      "지금까지 노션 자동화는 대부분 '노션 안에서 일어난 일'로만 시작됐다",
      '바깥 앱에서 일어난 사건(폼 제출, 결제 완료 등)은 노션이 알아채지 못했다',
      '핵심 통증: 바깥 사건과 노션 사이에 사람이 끼어 수동으로 옮겨야 했다' ] },
    { h: 'Webhook Triggers가 하는 일', points: [
      '외부 앱이 노션 워크플로를 직접 트리거(발동)할 수 있게 하는 웹훅',
      '외부에서 일어난 일이 노션 내부 자동화를 즉시 깨운다 — 이벤트 기반',
      '워커스 위에서 동작' ] },
    { h: '비유 자리', points: [
      '아이디어: 초인종 — 바깥 손님이 누르면 집 안에서 곧바로 반응',
      '확장 시 그림 1컷 권장' ] },
    { h: '실제 활용 예', points: [
      '외부 설문/신청 폼 제출 → 노션에 자동으로 페이지·행 생성',
      '결제·예약 완료 → 노션 기록 및 후속 자동화 발동' ] },
    { h: '지금 알아야 할 것', points: [
      '출시 단계: Beta',
      "보안: 웹훅 URL은 '비밀'처럼 다뤄야 함 — URL을 아는 누구나 이벤트를 보낼 수 있음(서명 검증 권장)",
      '비즈니스 이상 요금제 + 크레딧 비용' ] },
  ],
  '시리즈 #6 노션 CLI(ntn)');

const body6 = outline(6, '노션 CLI(ntn)',
  intro('개발자 플랫폼 전체를 다루는 \\"리모컨\\" — 사람도, 코딩 AI도 같은 도구를 씁니다'),
  [
    { h: '왜 필요한가', points: [
      '워커스 배포, 플랫폼 조작을 일일이 화면에서 클릭하는 대신 명령 한 줄로',
      '사람뿐 아니라 클로드 코드 같은 코딩 에이전트도 같은 도구로 노션을 조작',
      "공식 영상 제목도 'Built for Agents & Humans' — 두 사용자를 동시에 겨냥" ] },
    { h: '노션 CLI가 하는 일', points: [
      '한 번 인증하면 노션 읽기·액션, 워커스 관리·배포, 워크플로 자동화를 터미널/IDE에서 처리',
      '주요 명령 예: \`ntn workers new\` / \`ntn workers deploy\` / \`ntn workers list\`',
      '이미지·PDF 등 정적 파일 업로드도 지원' ] },
    { h: '비유 자리', points: [
      '아이디어: 개발자 플랫폼 전체를 다루는 만능 리모컨',
      '지난 워커스 글에서 ntn을 짧게 언급했음 — 그 대목을 이어받아 한 편으로 확장' ] },
    { h: '지금 알아야 할 것', points: [
      '코딩 도구라는 점 — 비개발자에게는 진입장벽이 있음(AI 코딩 도구로 완화 가능)',
      '[확인 필요] Windows 지원 여부 — 지난 글 시점엔 macOS/Linux만 지원, Windows는 WSL 필요. 정식 출시 후 변동 가능성 점검할 것',
      'CLI 공식 가이드: developers.notion.com/cli' ] },
  ],
  '시리즈 #7 Agent SDK');

const body7 = outline(7, 'Agent SDK',
  intro('이번엔 반대 방향 — 노션 에이전트를 팀즈·CRM 같은 외부 앱 안에서 부릅니다'),
  [
    { h: '왜 필요한가', points: [
      '지금까지 노션 에이전트는 노션 안에서만 쓸 수 있었다',
      "하지만 일하는 화면은 노션 밖(팀즈·CRM·대시보드)인 경우가 많다",
      "핵심: '노션을 떠나지 않고 쓰는' 것뿐 아니라 '노션 밖에서도 노션 AI를 쓰는' 것이 필요" ] },
    { h: 'Agent SDK가 하는 일', points: [
      '노션 에이전트를 외부 도구·앱 안에 임베드하는 SDK',
      '활용 예: CRM, Microsoft Teams, 각종 대시보드 안에서 노션 에이전트 호출',
      '방향성 정리: External Agents(#3)는 \\"밖→안\\", Agent SDK는 \\"안→밖\\"' ] },
    { h: '비유 자리', points: [
      '아이디어: 노션 에이전트를 다른 앱에 끼워 넣는 \\"플러그인\\"',
      '#3과 짝을 이루는 마무리 편이므로 두 방향을 한 그림으로 정리 권장' ] },
    { h: '지금 알아야 할 것', points: [
      '출시 단계: Alpha (웨이트리스트)',
      '알파라 사양·접근 방식이 계속 바뀔 수 있음',
      '개발자 대상 성격이 강함 — 교사 독자에게는 \\"이런 방향도 있다\\" 수준으로 가볍게' ] },
  ],
  '시리즈 마무리 — 7가지 기능 전체 회고 및 \\"무엇부터 시작할까\\" 제안');

// ─────────────────────────────────────────────
// 게시물 정의
// ─────────────────────────────────────────────
const posts = [
  { slug: 'mwn-2026-developer-platform',
    title: "[초안] Make with Notion 2026 — 노션이 '개발자 플랫폼'을 열었다",
    metaTitle: 'Make with Notion 2026 — 노션 개발자 플랫폼 총정리 | 노션톡',
    metaDesc: '2026년 5월 13일 Make with Notion에서 공개된 노션 개발자 플랫폼. 워커스·Database Sync·External Agents 등 7가지 기능을 교사·실무자 눈높이로 한눈에 정리했습니다.',
    body: body1 },
  { slug: 'notion-database-sync',
    title: '[초안] 노션 Database Sync — 외부 데이터를 노션 DB로 자동 동기화',
    metaTitle: '노션 Database Sync — 외부 데이터 자동 동기화 | 노션톡',
    metaDesc: '세일즈포스·구글시트 같은 외부 데이터를 노션 데이터베이스로 자동 동기화하는 Database Sync 기능을 정리했습니다. (아웃라인 초안)',
    body: body2 },
  { slug: 'notion-external-agents',
    title: '[초안] 노션 External Agents — 클로드·코덱스를 노션 안으로',
    metaTitle: '노션 External Agents — 외부 AI를 노션 워크스페이스로 | 노션톡',
    metaDesc: '클로드·코덱스 같은 외부 AI 에이전트를 노션 워크스페이스 참여자로 초대하는 External Agents 기능을 정리했습니다. (아웃라인 초안)',
    body: body3 },
  { slug: 'notion-custom-agent-tools',
    title: '[초안] 노션 Custom Agent Tools — 정확도와 크레딧을 함께 잡는 도구',
    metaTitle: '노션 Custom Agent Tools — 결정론적 에이전트 도구 | 노션톡',
    metaDesc: '워커스로 결정론적 코드 도구를 만들어 커스텀 에이전트의 정확도를 높이고 크레딧을 아끼는 Custom Agent Tools를 정리했습니다. (아웃라인 초안)',
    body: body4 },
  { slug: 'notion-webhook-triggers',
    title: '[초안] 노션 Webhook Triggers — 외부 사건이 노션 자동화를 깨운다',
    metaTitle: '노션 Webhook Triggers — 외부 이벤트 기반 자동화 | 노션톡',
    metaDesc: '폼 제출·결제 완료 같은 외부 앱의 사건으로 노션 워크플로를 발동시키는 Webhook Triggers 기능을 정리했습니다. (아웃라인 초안)',
    body: body5 },
  { slug: 'notion-cli',
    title: '[초안] 노션 CLI(ntn) — 사람과 코딩 에이전트를 위한 명령줄 도구',
    metaTitle: '노션 CLI(ntn) — 개발자 플랫폼 명령줄 도구 | 노션톡',
    metaDesc: '워커스 배포와 개발자 플랫폼 전체를 다루는 노션 CLI(ntn)를 사람과 코딩 에이전트 관점에서 정리했습니다. (아웃라인 초안)',
    body: body6 },
  { slug: 'notion-agent-sdk',
    title: '[초안] 노션 Agent SDK — 노션 에이전트를 외부 앱에 심기',
    metaTitle: '노션 Agent SDK — 노션 에이전트 외부 임베드 | 노션톡',
    metaDesc: '노션 에이전트를 CRM·팀즈 같은 외부 앱 안에 임베드하는 Agent SDK를 정리했습니다. (아웃라인 초안)',
    body: body7 },
];

// ─────────────────────────────────────────────
// 생성
// ─────────────────────────────────────────────
for (const p of posts) {
  const page = await notion.createPage(BLOG_DB, {
    'Post Title': notion.prop.title(p.title),
    'Slug': notion.prop.richText(p.slug),
    'Meta Title': notion.prop.richText(p.metaTitle),
    'Meta Description': notion.prop.richText(p.metaDesc),
    'Author': notion.prop.relation([AUTHOR_ID]),
    'Publish': notion.prop.checkbox(false),
  });
  await notion.updatePageMarkdown(page.id, p.body);
  console.log(`✓ ${p.slug}\n  ${page.url}`);
}
console.log('완료: 7개 초안 생성');
