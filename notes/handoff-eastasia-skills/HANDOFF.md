# HANDOFF — 동아시아사 주제8 수업자료 + 스킬 리포 충돌 해소

작성: 2026-05-27 세션 종료 시점. 다음 세션은 이 문서만 읽고 콜드 스타트로 이어가면 된다.

---

## 0. 한 줄 요약

동아시아사 주제8 「교역망의 발달과 은 유통」을 3차시로 쪼개 **1·2·3차시 수업자료 모두 노션에 완성**했다(2026-05-27). 트랙 A 수업자료 제작은 종료. 남은 블로커는 **트랙 B 스킬 리포 stash-pop 충돌 8개 파일 미해결** 뿐 — 다음 세션 첫 할 일 = 이 충돌 해소 + main push.

---

## 1. 트랙 A — 동아시아사 주제8 수업자료 (eastasia-worksheet 스킬)

### 3차시 분할 (확정)
| 차시 | 교과서 범위 | 내용 |
|---|---|---|
| 1차시 | pp.102~105 | 동아시아 각국의 교역 관계 — 명 해금 정책·감합·류큐 중계무역·밀무역·왜관·슈인장·천계령·동남아 거점(믈라카) |
| 2차시 | pp.106~107 | 유럽의 진출과 은 유통 확산 — 갈레온 무역, 은본위·일조편법·지정은제, 회취법·이와미 은광 |
| 3차시 | pp.108~111 | 동서 문물 교류 + 제한 무역 — 마테오 리치·곤여만국전도·난학, 광둥 무역 체제·공행, 매카트니·삼각 무역 |

### 1차시 — ✅ 완료 (노션)
- **페이지 URL**: https://www.notion.so/3-_08-1-36bdd1dcd64481aa86d5d78c84a6acae
- 페이지 ID: `36bdd1dc-d644-81aa-86d5-d78c84a6acae`
- 구성: 본문(H1 1·2·3 + 개조식 명사형 불릿 + 자료 콜아웃) → `# 4. 기출 분석`(요약/방식 콜아웃 + 12문항 이미지) → `# 5. 기출 풀이`(인라인 폼 DB)
- **형식 필수**: 개조식 + 명사형 어미(서술형 문장 금지). 핵심어 볼드 inline, `→` 화살표. (서술형으로 처음 썼다가 사용자 강한 거부 → 재작성함)
- 폼 DB(`동아시아사_08...기출풀이`): 활동내용(title)·관련학생(relation single)·주제(multi_select)·학번/학급/영역(**rollup show_original**)·누가기록 종합(formula, 리터럴+`prop("활동 내용")`)
- ⚠️ 구 페이지(서술형, ID `36bdd1dc-d644-81f7-9a54-c11224ac191b`)는 **휴지통**으로 보냄. 되살리지 말 것.

### 2차시 — ✅ 완료 (2026-05-27 노션)
- **페이지 URL**: https://www.notion.so/08-2-36ddd1dcd64481629cebc200f45c8d52
- 페이지 ID: `36ddd1dc-d644-8162-9ceb-c200f45c8d52`
- 제목: `08. 교역망의 발달과 은 유통 (2차시: 유럽의 진출과 은 유통의 확산)`
- 구성: 본문(`# 1.` 유럽의 진출과 교역망의 확대 / `# 2.` 은의 유통과 중국으로의 유입, 개조식+명사형, 자료 콜아웃=갈레온·일조편법·신흠 상촌고·회취법·어제와오늘 이와미) → `# 3. 기출 분석` → `# 4. 기출 풀이`(인라인 폼 DB).
- **기출 8문항 매칭(연대순)**: 2023 6월 Q12 / 2024 6월 Q9·Q11 / 2024 9월 Q9 / 2025 5월 Q14 / 2025 7월 Q14 / 2025 9월 Q12 / 2025 10월 Q11. 스크린샷 `08_기출_스크린샷/`.
  - 처음엔 시기통합 문항(2024 6월 Q9·Q11, 2024 9월 Q9 마제은)을 제외했다가, 사용자 교정으로 **1차시+2차시 통합 문항 추가 삽입**(선지/보기까지 스캔). → 메모리 `feedback_worksheet-include-integrated-exams`.
  - 1차시에 이미 들어간 통합 문항(2023수능 Q8·Q11, 2025 10월 Q7·6월 Q7·수능 Q5)은 중복 삽입 안 함.
- **폼 DB 설계 정정**: 실제로는 수식/롤업 없음. 문항별 rich_text + 관련학생(relation **single_property**) + 주제 multi_select + 답안메모. createDatabase relation은 `data_source_id` 필수(database_id 쓰면 400). 상세 → 메모리 `project_eastasia-worksheet`.

### 3차시 — ✅ 완료 (2026-05-27 노션)
- **페이지 URL**: https://www.notion.so/08-3-36ddd1dcd6448168a638cae015ed1da8
- 페이지 ID: `36ddd1dc-d644-8168-a638-cae015ed1da8`
- 제목: `08. 교역망의 발달과 은 유통 (3차시: 동서 문물 교류와 제한 무역)` (영역=동아시아사/학년도=2026/학기=1학기)
- 구성(1·2차시 동일): 본문(`# 1.` 동아시아와 유럽의 문물 교류[선교사·곤여만국전도·난학·홍대용] / `# 2.` 동아시아의 제한 무역과 유럽의 대응[광둥 무역 체제·공행·매카트니·삼각 무역], 개조식+명사형, 자료 콜아웃 6개) → `# 3. 기출 분석`(요약/방식 콜아웃) → `## 시험별 기출 문항`(7문항) → `# 4. 기출 풀이`(인라인 폼 DB).
- **기출 7문항(중복 배제 후 확정)**: 2025 5월 Q8·2025 9월 Q8(마테오 리치) / 2023 9월 Q15·2024 수능 Q6·2025 3월 Q13·2025 7월 Q8(난학·해체신서) / 2024 9월 Q12(매카트니 거절=청+네덜란드 통합). 스크린샷 `08_기출_스크린샷/`에 신규 7개 크롭(덮어쓰기 없음).
  - false positive 제외: 키워드가 오답 선지에만 있거나 정답이 3차시 선지가 아닌 문항(예: 2023 6월 Q5 매카트니=책봉 오답, 2025 6월 Q6 정답=신라승려, 2025 9월 Q3 정답=불교, 2025 수능 Q12 정답=양명학) — 정답 PNG 확인 후 배제.
  - 1·2차시 중복분(2023수능 Q11, 2025 6월 Q2·9월 Q11·수능 Q5 등 매카트니/공행 선지 문항)은 재삽입 안 함.
- **폼 DB**: `동아시아사_08. 교역망의 발달과 은 유통 (3차시)_기출문제 답 입력` (id `942079f8-240b-4dda-821c-5a4d0365519a`). 무수식 구조 복제 = 제출 제목(title)+문항별 rich_text 7개+관련 학생(relation single)+주제(multi_select="08. 교역망의 발달과 은 유통")+답안 메모.
- **미적용(1·2차시도 동일)**: 스킬 STEP5~7(핵심질문/성찰폼/비디오프롬프트)은 1·2차시 실물에 없어 3차시도 생략. 추가 원하면 별도 요청.

### 경로·ID 모음
- 교과서 폴더: `/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/교과서/`
  - 2차시·3차시 원본: `3. 동아시아의 사회 변동과 문화 교류_08. 교역망의 발달과 은 유통.pdf` (10페이지, 1차시=PDF p1~4, 2차시=p5~6, 3차시=p7~10)
- 기출문제 폴더: `/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/기출문제/` (2023·2024·2025 하위, 13개 PDF + 정답 PNG)
- 기출 스크린샷(1차시 완료분): `/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/08_기출_스크린샷/` (12 webp)
- 워크시트 DB: `2eedd1dc-d644-81ac-a004-effe85796fce` (속성: 주제 title / 영역 select=동아시아사 / 학년도 select=2026 / 학기 select)
- 폼 템플릿 DB: `319dd1dc-d644-8090-8472-f6991df01a4f` (DS `319dd1dc-d644-81ae-b23c-000b8e8f5ee3`)
- 학생 명렬표 DB: `2eedd1dc-d644-81bc-8973-c7f1932f082f` (DS `2eedd1dc-d644-81b7-814d-000b7c0ba6e2`)
- 노션 모듈: `import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs'` (MCP 금지)
- exam-analyzer 크롭 스크립트: `~/.claude/skills/exam-analyzer/scripts/crop_questions.py` (분석모드: `python crop_questions.py <기출폴더> <출력폴더> <questions.json>`)

### 1차시 기출 매칭 결과 (재사용/참고)
2023·2025 시험에서 12문항 매칭(2024는 1차시 해당 없음). 오답 선지 false positive는 제시문 기준으로 제외함. 2차시(은유통)·3차시(문물·제한무역) 매칭은 새로 해야 함 — 같은 13개 PDF에서 회취법·이와미·갈레온·일조편법(2차시) / 마테오리치·공행·매카트니·삼각무역(3차시) 키워드로.

### 폼 DB 만들 때 핵심 함정 (이미 메모리에도 있음)
- **Notion API로 만든 relation은 수식 `map/join` 순회 불가**(`Type error with formula`). 템플릿 수식 ID 재매핑 방식은 작동 안 함.
- → 학번/학급/영역은 **rollup(show_original)**, 누가기록 종합은 **리터럴 + `prop("활동 내용")`**.
- dual_property 변환 금지(학생 명렬표에 역방향 속성 남음). 실수로 만들면 raw `PATCH /data_sources/{ds}` `{properties:{"<이름>":null}}`로 삭제.

---

## 2. 트랙 B — 스킬 리포 stash-pop 충돌 (🚧 블로커, 다음 세션 1순위)

### 상태
- 리포: `~/.claude/skills` (= `/mnt/c/Users/user/.claude/skills`), GitHub `1000ssam/claude-skills`, branch `main`.
- `git pull --rebase origin main` 과정에서 stash(`pre-zoom-skill-rebase`)를 pop하다 **8개 파일 충돌 미해결**.
- **origin/main이 로컬보다 1커밋 앞섬** (로컬 0 ahead, origin 1 ahead).
- **stash@{0} 아직 살아있음** → theirs(stash) 내용 복구 가능. 지금 결정은 되돌릴 수 있음.

### 용어
- **ours (stage2) = "Updated upstream" = 현재 커밋된 HEAD 상태**
- **theirs (stage3) = "Stashed changes" = 서랍(stash)에 있던 커밋 안 한 편집**

### 충돌 8개 파일 (ours줄 / theirs줄)
| 파일 | ours | theirs | 메모 |
|---|---|---|---|
| `exam-analyzer/SKILL.md` | 658 | 415 | **ours 권장**(정답매칭·분할모드 최신). + 이 세션에서 내가 머지충돌마커 정리 의도였음 |
| `document-organizer/SKILL.md` | 328 | 417 | ⚠️ theirs가 더 큼 — 사용자 확인 필요 |
| `document-organizer/scripts/notion-api.mjs` | 132 | 132 | 전면 치환 — 확인 필요 |
| `document-organizer/scripts/organize.mjs` | 284 | 261 | 확인 필요 |
| `maily-subscribe/SKILL.md` | 121 | 121 | 전면 치환 — 확인 필요 |
| `notion-pilot.md` | 275 | 255 | 확인 필요 |
| `scripts/slack-api.mjs` | 116 | 108 | 소폭 — 확인 필요 |
| `.gitignore` | 30 | 23 | 확인 필요 |

- **전체 양쪽 diff 리뷰 문서**: `/mnt/c/dev/notes/skills-merge-conflict-review.md` (3,602줄). 다음 세션에서 사용자에게 이 문서 열어보게 하고 **파일별 ours/theirs 결정**을 받아야 함.

### 이 세션에서 만든 미커밋 작업 (충돌 때문에 아직 커밋 못 함)
1. `eastasia-worksheet.md` (working tree `M`): STEP 2에 **본문 작성 형식(개조식·명사형)** 규칙 추가, ✅/❌ 체크리스트 갱신, **STEP 4 수식→rollup**으로 정정 + API 한계 ⚠️ 추가, Notes 갱신.
2. `exam-analyzer/SKILL.md` (UU): **ours(Updated upstream) 채택 예정** = 머지충돌마커 제거하고 658줄 버전 남기기.

### 해소 절차 (사용자 결정 후)
1. 파일별로 `git checkout --ours <f>` 또는 `git checkout --theirs <f>` (또는 수동 병합) → `git add <f>`.
2. 8개 모두 add (unmerged 0) 확인.
3. 내 eastasia-worksheet.md도 `git add`.
4. `git stash drop`은 사용자 확인 후에만(혹시 theirs를 일부만 살릴 경우 대비).
5. origin 1커밋 흡수: `git pull --rebase origin main` 또는 이미 rebase 흔적 있으니 상태 보고 결정.
6. **커밋 전 충돌마커 검출 가드**: `grep -rnE '^(<<<<<<<|=======|>>>>>>>)' --include='*.md' --include='*.mjs' .` 으로 0 확인.
7. 커밋 + `git push origin main` (사용자가 main 지정함).

### ⚠️ 주의
- 본인이 만들지 않은 staged 변경(~40개)이 인덱스에 있음. 한 커밋에 휩쓸리지 않게 주의(또는 사용자에게 의도 확인).
- 충돌마커 박힌 채로 절대 push 금지.

---

## 3. 이번 세션 메모리 기록 (완료)
- `reference_notion-formula-api-relation.md` — API relation 수식 순회 불가 → rollup
- `feedback_worksheet-gaesik-myeongsahyeong.md` — 워크시트 개조식+명사형
- `project_config-sync.md` 에 **후순위 과제** 추가 — sync(pull/push)·skills 리포가 stash-pop 충돌·UU·마커 잔류를 남길 수 있는지 점검, 커밋 전 마커검출 가드 필요

## 4. 다음 세션 첫 행동
1. (트랙 B, 여전히 미해결) `/mnt/c/dev/notes/skills-merge-conflict-review.md` 열어 사용자에게 8개 파일별 ours/theirs 결정 받기 → 충돌 해소 → 마커 0 확인 → main push (eastasia-worksheet.md·exam-analyzer 포함).
   - **추가 기록 필요**: notion-pilot.md 에러 가이드에 "createDatabase relation은 `data_source_id` 필수(2026-03-11), database_id 쓰면 400" 패턴 추가. (스킬 리포 충돌 해소 후 함께 커밋)
2. ~~동아시아사 3차시 제작~~ — ✅ 완료(2026-05-27). 위 트랙 A 3차시 섹션 참고. 트랙 A 수업자료(1·2·3차시) 전부 종료.
