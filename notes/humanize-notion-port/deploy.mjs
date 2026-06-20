import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const DB_ID = '99bbd345-f231-4d84-854e-bb5577badc10'; // SKILLS database
const ZIP = '/mnt/c/dev/notes/humanize-notion-port/humanize-korean-skill.zip';
const TITLE = '[SKILL]_humanize-korean_AI한글티제거';
const SUMMARY = 'AI(ChatGPT·Claude·Gemini)가 쓴 한글 텍스트의 번역투·AI 티 10대 패턴을 탐지·분류해 내용은 그대로 두고 문체·리듬·표현만 자연스럽게 윤문하는 오케스트레이터. Fast(monolith 단일 호출)·Strict(5인 파이프라인) 2모드, 의미 불변·변경률 50% 강제중단.';

const body = [
'## humanize-korean — AI 한글 티 제거 오케스트레이터 (v1.5)',
'AI(ChatGPT·Claude·Gemini 등)가 쓴 한글 텍스트의 "AI 티"를 탐지·분류해 **내용은 한 글자도 건드리지 않고** 문체·리듬·표현만 자연스러운 한국어로 윤문한다. 대상은 번역투·영어 인용 과다·기계적 병렬·관용구·피동태 남용·접속사 남발·리듬 균일성·이모지/불릿 과다 등 10대 카테고리 40+ 패턴이다. **의미 불변이 최상위 불문율**이며, 수치·고유명사·직접 인용은 윤문 대상이 아니다.',
'## 트리거 조건',
'사용자가 **AI가 쓴 한글 글을 사람이 쓴 것처럼 자연스럽게** 만들어 달라고 할 때 발동.',
'- 시동어: "AI 티 없애줘", "AI 같은 글 자연스럽게", "GPT/ChatGPT 문체", "AI 번역투 고쳐", "사람이 쓴 것처럼 윤문", "AI 윤문", "휴머나이저", "humanize Korean", "번역투 제거"',
'- 후속 작업: "특정 카테고리만 다시", "윤문 강도 조정", "장르 바꿔서", "이 문단만", "2차 윤문"도 모두 이 스킬.',
'- 제외: 단순 맞춤법·오탈자 교정(직접 처리), 번역(번역 스킬), 내용 추가·삭제를 동반한 재작성(집필 스킬).',
'## 2모드 구조',
'<callout icon="🚀" color="blue_bg">',
'\t**Fast (디폴트)** — humanize-monolith 에이전트가 한 호출에서 탐지·윤문·자체검증을 일괄 처리. 도구 호출 3~5회, 5,000자 이하 wall-clock 2~3분 목표.',
'</callout>',
'<callout icon="🔬" color="purple_bg">',
'\t**Strict (--strict 또는 8,000자 초과 자동 승급)** — 5인 파이프라인(탐지 → 윤문 → 병렬 검증 → 종합 판정). 정밀 검증·재윤문 루프가 필요할 때만.',
'</callout>',
'## Phase 0 — 컨텍스트 확인 및 모드 결정',
'작업 시작 시 첫 줄로 다음을 출력한다.',
'```',
'humanize-korean v1.5 — {fast|strict} 모드 / run_id: {YYYY-MM-DD-NNN}',
'```',
'- 모드: `--strict`·"정밀 모드" 명시 → strict / 입력 8,000자 초과 → strict 자동 승급(1줄 고지) / 그 외 → fast.',
'- run_id: cwd 기준 `_workspace/{YYYY-MM-DD-NNN}/`. 당일 첫 실행이면 001, 이후 마지막 +1. 기존 시퀀스는 Glob으로 `01_input.txt` 표지 파일을 매칭해 간접 조회.',
'## Fast 모드 (디폴트)',
'1. **입력 저장** — `_workspace/{run_id}/01_input.txt`에 원문 저장, 첫 300자로 장르 자동 추정.',
'2. **monolith 호출** — humanize-monolith 1회 호출. 입력 = 원문 경로 + 슬림 룰북(`references/quick-rules.md`) + 장르 힌트. 단일 호출 안에서:',
'\t- 룰북 로드 → 메모리에서 패턴 탐지 + 윤문 + 자체검증 6항 점검',
'\t- 변경률 50% 초과 시 자동 롤백',
'\t- 자체검증 위반 시 1회 부분 재실행',
'\t- `final.md` + `summary.md` 작성',
'3. **결과 전달** — 한 줄 상태(`변경률 X% / 등급 Y / 자체검증 N/6`) + 윤문본 + summary 핵심 표. 등급 B 이하면 `--strict` 안내.',
'## Strict 모드',
'| 단계 | 에이전트 | 산출 |',
'| --- | --- | --- |',
'| A. 탐지 | ai-tell-detector | 02_detection.json |',
'| B. 윤문 (최대 3회) | korean-style-rewriter | 03_rewrite.md + diff |',
'| C. 병렬 검증 | content-fidelity-auditor / naturalness-reviewer | 04 / 05 json |',
'| D. 출력 | (오케스트레이터 종합) | final.md + summary.md |',
'',
'**종합 판정 매트릭스**',
'| fidelity | naturalness | 후속 |',
'| --- | --- | --- |',
'| full_pass | accept | 최종 승인 → Phase D |',
'| full_pass | rewrite_round_2 | 2차 윤문 (Phase B 재호출) |',
'| full_pass | rollback_and_rewrite | 롤백 후 재윤문 |',
'| conditional_pass | — | 롤백된 edit만 재시도 |',
'| fail | — | 전면 재작업 |',
'',
'최대 3회 후 미해결이면 `hold_and_report`로 사람 개입.',
'## 옵션 (인자 끝에 자연어로)',
'- `장르: 칼럼|리포트|블로그|공적` (생략 시 자동 추정)',
'- `강도: 보수|기본|적극` (기본값: 기본)',
'- `최소심각도: S1|S2|S3` (기본값: S2)',
'- `--strict` — 5인 파이프라인 강제 사용',
'## 주의 사항',
'- **의미 불변이 최상위.** monolith·strict 모두에서 위반 즉시 롤백.',
'- 수치·고유명사·직접 인용은 탐지/윤문 대상 아님(Do-NOT list 엄수).',
'- 장르·register 보존 — 격식체 입력은 격식체로 출력. 칼럼이 에세이로 옮겨가지 않는다. AI 티는 문법·수사이지 격식 자체가 아니다.',
'- 변경률 30% 초과 → 경고, 50% 초과 → 강제 중단.',
'## 스크립트 번들',
'첨부 **`humanize-korean-skill.zip`** = 실행에 필요한 전체.',
'- `SKILL.md` — 오케스트레이터 본체',
'- `references/` — quick-rules.md(Fast 룰북)·ai-tell-taxonomy.md(분류 SSOT)·rewriting-playbook.md(처방)·web-service-spec.md·scholarship.md·metrics.py/metrics_v2.py·baseline*.json',
'- `agents/` — 파이프라인 서브에이전트 12종 (humanize-monolith·ai-tell-detector·korean-style-rewriter·content-fidelity-auditor·naturalness-reviewer + 분류·학술·지표 보조 7종)',
'- `INSTALL.md` — Claude Code 재배포 설치법 (`~/.claude/skills/humanize-korean/` + `~/.claude/agents/`)',
'',
'Notion에서는 이 본문이 곧 스킬 명세다. 본문을 읽고 Fast/Strict 절차를 따르면 되고, zip은 Claude Code 환경으로 다시 옮길 때(재배포) 쓴다.',
].join('\n');

// 1) 페이지 생성
const page = await notion.createPage(DB_ID, {
  '제목': notion.prop.title(TITLE),
  '요약': notion.prop.richText(SUMMARY),
  '상태': notion.prop.status('완료'),
  '스크립트 있음': notion.prop.checkbox(true),
});
console.log('page created:', page.id, page.url);

// 2) 본문 작성
await notion.updatePageMarkdown(page.id, body);
console.log('body written:', body.length, 'chars');

// 3) zip 업로드
const uploadId = await notion.uploadFile(ZIP);
console.log('zip uploaded, file_upload id:', uploadId);

// 4) 파일 속성에 첨부
await notion.call('PATCH', `/pages/${page.id}`, {
  properties: {
    '파일': { files: [{ type: 'file_upload', name: 'humanize-korean-skill.zip', file_upload: { id: uploadId } }] },
  },
});
console.log('파일 속성 첨부 완료');

console.log('\n=== DONE ===');
console.log('URL:', page.url);
console.log('PAGE_ID:', page.id);
