# 스킬 리포 stash-pop 충돌 리뷰 (8개 파일)

- ours(stage2) = **Updated upstream** = 현재 커밋된 HEAD 상태
- theirs(stage3) = **Stashed changes** = stash에 들어있던 로컬 편집
- 아래는 ours→theirs unified diff. 파일별로 어느 쪽을 살릴지 결정.

================================================================
## .gitignore
ours(2)=30줄 / theirs(3)=23줄
```diff
diff --git a/.gitignore b/.gitignore
index 057a35a..5f64b40 100644
--- a/.gitignore
+++ b/.gitignore
@@ -1,30 +1,23 @@
-# Secrets - NEVER commit
-secrets/
-*.secret
-*.secret.*
-
-# Environment files with real values
-.env
-!.env.example
-
-# Config files with real credentials
-config.json
-!config.example.json
-
-# Node
-node_modules/
-
-# OAuth tokens
-notion-to-docs/token.json
-
-# OS
-.DS_Store
-Thumbs.db
-desktop.ini
-
-# Runtime/cache
-.last-organize.json
-
-# Python
-__pycache__/
-*.pyc
+# Secrets - NEVER commit
+secrets/
+*.secret
+*.secret.*
+
+# Environment files with real values
+.env
+!.env.example
+
+# Config files with real credentials
+config.json
+!config.example.json
+
+# Node
+node_modules/
+
+# OS
+.DS_Store
+Thumbs.db
+desktop.ini
+
+# Runtime/cache
+.last-organize.json
```

================================================================
## document-organizer/SKILL.md
ours(2)=328줄 / theirs(3)=417줄
```diff
diff --git a/document-organizer/SKILL.md b/document-organizer/SKILL.md
index b90c54a..ccb94c1 100644
--- a/document-organizer/SKILL.md
+++ b/document-organizer/SKILL.md
@@ -1,328 +1,417 @@
----
-name: document-organizer
-description: "한국 공공기관 공문서 파일들을 공문 번호별로 자동 분류하여 폴더로 정리합니다. 공문 본문 PDF를 읽고 액션 아이템을 추출하여 Notion에 등록할 수도 있습니다. Use when: (1) 공문서 정리, (2) 공문 분류, (3) 공문 파일 정리, (4) 공문 액션, (5) 공문 정리 + 액션, (6) 공문 노션 등록이 필요할 때. 파일명 패턴은 references/pattern_examples.md 참조."
-allowed-tools: Bash(node *), Read, Write, Glob, Grep, Agent
----
-
-# Document Organizer
-
-## Overview
-Windows 환경에서 한국 공공기관 공문서 파일을 공문 번호별로 자동 분류하고, 선택적으로 본문에서 액션 아이템을 추출하여 Notion에 등록합니다.
-
-**런타임:** Node.js (필수)
-
-## Workflow
-
-Claude는 아래 순서를 **반드시** 따른다.
-
-**트리거 분기:**
-- `"공문 정리"` / `"공문 분류"` / `"공문 액션"` / `"공문 노션 등록"` → **Step 1~6 전체** (기본 동작)
-- `"공문 파일만 정리"` → Step 1~3만 (파일 이동만, Notion 스킵)
-- `"공문 정리 되돌리기"` / `"공문 undo"` → 마지막 정리 작업 되돌리기
-
-### Step 1. Config 확인
-
-이 스킬 디렉토리 내 `config.json`을 읽는다.
-
-**config.json이 없는 경우 (최초 실행):**
-
-사용자에게 공문서가 저장된 폴더 경로를 질문한다:
-
-```
-"공문서 파일이 들어있는 폴더의 경로를 알려주세요."
-```
-
-사용자가 경로를 알려주면, **그 경로를 기본값으로** config.json을 자동 생성한다:
-
-```json
-{
-  "version": "1.0",
-  "default_profile": "work",
-  "profiles": {
-    "work": {
-      "name": "기본 공문 폴더",
-      "path": "{사용자가 알려준 경로}",
-      "last_used": null
-    }
-  }
-}
-```
-
-**중요:**
-- 경로 작성 시 반드시 **Windows 절대경로** + **역슬래시 이스케이프(`\\`)**를 사용한다.
-- 사용자가 `바탕화면의 공문 모음 폴더` 등 자연어로 말하거나, 현재 세션 작업 디렉토리에서 실행하는 경우에도 절대경로로 변환하여 저장한다.
-- **예시 경로를 제시하지 않는다.** 사용자가 지정한 경로가 곧 기본값이 된다.
-
-**config.json이 있는 경우:**
-
-`profiles.<default_profile>.path`를 추출하고 바로 Step 2로 진행한다.
-
-### Step 2. 스크립트 실행
-
-```bash
-node "<이 스킬의 디렉토리>/scripts/organize.mjs"
-```
-
-- 스킬 디렉토리는 `~/.claude/skills/document-organizer` (설치 위치에 따라 다를 수 있음)
-- 프로필 지정 시: `node organize.mjs <config_path> <profile_name>`
-- 스크립트가 config.json을 직접 읽고, 대상 폴더를 스캔하고, 정리까지 한번에 수행
-
-### Step 3. 결과 보고
-
-스크립트 출력을 사용자에게 전달 (생성 폴더 수, 이동 파일 수)
-
-**`"공문 파일만 정리"` 트리거인 경우 여기서 종료. 그 외에는 Step 4로 진행.**
-
-**최초 실행은 경로 질문 1턴 + config 생성 & 스크립트 실행 1턴 = 최대 2턴.**
-**이후 실행은 config 읽기 + 스크립트 실행 = 1턴으로 완료해야 한다.**
-
----
-
-### Step 4. 제목 기반 사전분류 + 액션 추출
-
-> **토큰 최적화:** 모든 PDF를 서브에이전트로 읽지 않는다. 제목 기반으로 필수/팔로우업을 분류한 뒤, 필수 공문만 PDF를 읽어 액션을 추출한다. 나머지는 제목만으로 팔로우업 체크리스트를 구성한다.
-
-#### 4-1. PDF 목록 조회
-
-```bash
-node "<스킬 디렉토리>/scripts/organize.mjs" --list-pdfs --new-only
-```
-
-`--new-only` 플래그는 undo 로그를 참조하여 **이번 정리에서 새로 이동한 공문만** 반환한다. 기존에 정리된 공문은 제외.
-
-스크립트가 JSON을 출력한다:
-```json
-{
-  "pdfs": [
-    { "docId": "인창고등학교-22206", "title": "AI 중점학교", "path": "C:\\...\\본문.pdf" }
-  ],
-  "hwpOnly": [
-    { "docId": "인창고등학교-123", "file": "본문.hwp" }
-  ]
-}
-```
-
-- `hwpOnly` 항목은 사용자에게 `"⚠️ {파일명}: HWP 형식은 읽을 수 없어 스킵합니다."` 알림.
-
-#### 4-2. 제목 기반 분류 (메인 컨텍스트)
-
-`pdfs` 배열의 각 항목을 제목(`title`)으로 **필수** vs **팔로우업**으로 분류한다. 서브에이전트 불필요.
-
-**필수 (PDF 읽기 대상)** — 아래 조건 중 하나라도 매칭:
-
-| 우선순위 | 조건 | 예시 |
-|----------|------|------|
-| 1 | `[제출]` 태그 | [제출] AIDT 활용 현황 |
-| 2 | 제목에 "제출", "보고", "제출 요청" | 점검 결과 제출 요청 |
-| 3 | 제목에 "결과" | 디지털튜터 선정 결과 |
-| 4 | 제목에 "정보공시" | 정보공시 정시 1차 일정 |
-| 5 | 제목에 "추진 계획" | 과의존 예방교육 추진 계획 |
-| 6 | 제목에 "담당자 교육" | G-ONE 담당자 교육 |
-| 7 | 조치성 키워드: "정비", "정리", "변경", "현행화", "권한관리", "주의" | 메신저 정비, 계정 정리 |
-
-**팔로우업 (PDF 안 읽음)** — 위 조건 미매칭:
-- `[협조]` 태그, 순수 `[알림]`/`[안내]`, "가이드", "보급 알림", "자료 알림" 등
-
-분류 결과를 사용자에게 요약 보고:
-```
-📋 분류 결과: 필수 {N}건 (PDF 읽기) / 팔로우업 {M}건 (제목만)
-```
-
-#### 4-3. 필수 공문 → 서브에이전트 배치
-
-**필수 PDF 수**에 따라 **5개씩** 배치를 나눈다:
-- 5개 이하 → 서브에이전트 1개
-- 6~10개 → 서브에이전트 2개
-- 11~15개 → 서브에이전트 3개
-- 16~20개 → 서브에이전트 4개
-- 21개 이상 → 서브에이전트 최대 5개
-
-각 서브에이전트에 `references/extraction_agent_prompt.md`의 프롬프트 템플릿을 사용하되:
-- `{today}`를 오늘 날짜로 치환
-- `{pdf_list}`를 해당 배치의 PDF 경로 목록으로 치환
-
-**Agent 도구로 서브에이전트들을 병렬 실행한다** (`subagent_type: "general-purpose"`, `model: "sonnet"`).
-
-필수 공문이 0건이면 서브에이전트를 생성하지 않고 4-5로 바로 진행.
-
-#### 4-4. 필수 공문 결과 집계
-
-각 서브에이전트가 반환한 JSON `results` 배열을 병합한다.
-
-**마감일 없는 필수 액션 처리:**
-- `deadline`이 없거나 빈 문자열인 액션 → `deadline`을 오늘 날짜로 설정, `note`에 "마감일 재확인 요망" 추가
-
-**프로젝트 그룹핑 후처리:**
-- 여러 공문이 같은 사업/프로그램에 관한 것인지 `docId`, `title`, `suggestProject` 필드로 판별
-- 3개 이상 관련 공문이 있으면 프로젝트로 묶기
-
-#### 4-5. 팔로우업 체크리스트 구성
-
-팔로우업 공문들을 **태그별**로 그룹핑하여 체크리스트를 구성한다:
-
-```
-### 협조 요청
-- [ ] [협조] 공문 제목 (인창고등학교-XXXX)
-- [ ] [협조] 공문 제목 (인창고등학교-YYYY)
-
-### 참고 자료
-- [ ] [안내] 공문 제목 (인창고등학교-ZZZZ)
-- [ ] [알림] 공문 제목 (인창고등학교-WWWW)
-```
-
-태그가 없는 팔로우업은 "기타" 그룹에 넣는다.
-
-### Step 5. 사용자 확인
-
-집계된 결과를 사용자에게 보여준다:
-
-```
-## 추출된 액션 아이템 (필수 공문)
-
-### ⚠️ 기한 경과
-(expired=true인 항목들)
-
-### 오늘/내일 마감
-(기한이 임박한 항목들)
-
-### 향후 기한
-(나머지 액션 항목들)
-
----
-
-## 팔로우업 체크리스트 (참고/협조 공문)
-
-### 협조 요청
-- [ ] [협조] 공문 제목 (인창고등학교-XXXX)
-
-### 참고 자료
-- [ ] [안내] 공문 제목 (인창고등학교-YYYY)
-
----
-수정하거나 제외할 항목이 있으면 알려주세요. 없으면 "확인"이라고 해주세요.
-```
-
-사용자가 수정을 요청하면 반영 후 재확인. `"확인"` 시 Step 6으로 진행.
-
-### Step 6. Notion에 등록
-
-1. `~/.claude/secrets/notion-credentials.md`를 읽어 Notion API 토큰과 DB ID를 확인한다.
-   - 파일이 없으면 사용자에게 Notion API 키와 DB ID를 안내하며 중단.
-
-2. **필수 액션** → 개별 태스크/프로젝트 등록 (기존 로직):
-
-**개별 태스크:**
-```bash
-echo '{"action":"create_task","data":{"title":"신청서 제출","deadline":"2026-03-20","note":"인창고등학교-22206"}}' | node "<스킬 디렉토리>/scripts/notion-api.mjs"
-```
-
-**프로젝트 + 복수 태스크:**
-```bash
-echo '{"action":"create_tasks_with_project","data":{"project_title":"AI 중점학교 운영 신청","tasks":[...]}}' | node "<스킬 디렉토리>/scripts/notion-api.mjs"
-```
-
-3. **팔로우업** → config.json의 `followup_page_id` 확인:
-
-**`followup_page_id`가 있는 경우 (기본):** 해당 페이지에 블록을 **append**한다.
-- `notion-pilot.md`의 `notion.appendBlocks(followupPageId, [...])` 사용
-- 날짜 heading + to_do 블록으로 구성
-
-**`followup_page_id`가 없는 경우:** 새 태스크를 생성하고, 생성된 page ID를 config.json의 `followup_page_id`에 저장한다.
-
-- `checklist`는 Step 4-5에서 구성한 그룹별 체크리스트
-
-4. 결과 보고: 생성된 태스크/프로젝트 수 + 팔로우업 태스크 생성 여부, 에러가 있으면 에러 내용.
-
-## 파일명 패턴
-
-```
-(기관명-공문번호 (본문) 발신기관명) [제출] 제목.확장자
-(기관명-공문번호 (첨부) 발신기관명) [붙임N] 제목.확장자
-(기관명-공문번호 (본문)) [제출] 제목.확장자          ← 발신기관 없는 경우도 지원
-```
-
-정규표현식:
-```
-/\(([^-]+)-(\d+)\s+\((본문|첨부)\)[^)]*\)/
-```
-
-`[^)]*`로 괄호 닫기 전까지의 모든 내용(발신기관명 등)을 허용합니다.
-
-상세 예시 → `references/pattern_examples.md`
-
-## Configuration
-
-**위치:** 이 스킬 디렉토리 내 `config.json`
-
-**최초 실행 시:** AI가 사용자에게 경로를 질문하고, 사용자가 지정한 경로를 기본값으로 하여 config.json을 자동 생성한다. 사용자가 직접 편집할 필요 없음.
-
-**구조 예시:**
-
-```json
-{
-  "version": "1.0",
-  "default_profile": "work",
-  "profiles": {
-    "work": {
-      "name": "기본 공문 폴더",
-      "path": "(사용자가 최초 실행 시 지정한 경로)",
-      "last_used": null
-    }
-  }
-}
-```
-
-**경로 규칙:**
-- 반드시 Windows 절대경로 사용 (`C:\\...`)
-- JSON 내 역슬래시는 이스케이프 (`\\`)
-- `/c/Users/...` 같은 Git Bash 스타일 경로 사용 금지
-- **기본값 없음:** 사용자가 최초 실행 시 지정한 경로가 곧 기본값
-
-상세 구조 → `references/config_structure.md`
-
-**Notion 설정:** `~/.claude/secrets/notion-credentials.md` (시크릿 참조)
-
-## Commands
-
-| 사용자 입력 | 동작 |
-|---|---|
-| `"공문 정리"` / `"공문 분류"` / `"공문 액션"` | 정리 + 액션 추출 + Notion 등록 (Step 1~6) |
-| `"personal 프로필로 공문 정리"` | 특정 프로필 사용 (Step 1~6) |
-| `"공문 파일만 정리"` | 파일 이동만 (Step 1~3), Notion 스킵 |
-| `"공문 경로 변경"` / `"다른 폴더로 공문 정리"` | 새 경로를 질문하고 config.json 업데이트 |
-| `"공문 정리 설정 초기화"` | config.json 삭제 (다음 실행 시 경로 재질문) |
-| `"공문 정리 되돌리기"` / `"공문 undo"` | 마지막 정리 작업 되돌리기 (`organize.mjs --undo`) |
-
-## Output Example
-
-```
-공문 모음\
-├── (인창고등학교-22206 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] AI 중점학교 운영 신청\
-│   ├── (인창고등학교-22206 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] AI 중점학교.pdf
-│   ├── (인창고등학교-22206 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임1] 신청서.hwpx
-│   └── (인창고등학교-22206 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임2] 계획서.hwpx
-└── (인창고등학교-568 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] 디지털튜터\
-    ├── (인창고등학교-568 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] 디지털튜터.pdf
-    └── (인창고등학교-568 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임1] 명단.xlsx
-```
-
-## Scripts
-
-- `scripts/organize.mjs` — 메인 정리 스크립트 (Node.js)
-- `scripts/notion-api.mjs` — Notion API 연동 스크립트 (Node.js, stdin JSON 입력)
-
-## Error Handling
-
-| 상황 | 처리 |
-|------|------|
-| PDF 읽기 실패 (암호화/스캔 이미지) | 경고 후 해당 공문 스킵 |
-| 본문이 PDF가 아닌 경우 (.hwp/.hwpx) | 스킵, 사용자에게 알림 |
-| 시크릿 파일 없음 | 안내 제시, Notion 단계 중단 |
-| Notion API 인증 실패 | 에러 표시, API 키 확인 안내 |
-| 액션 아이템 없음 (안내/통보 공문) | "조치 사항 없음" 보고, Notion 스킵 |
-
-## Notes
-- 본문 파일이 없는 공문은 `공문_기관명-번호` 폴더명 사용
-- 패턴 미매칭 파일은 이동하지 않고 원본 위치 유지
-- 이미 폴더가 존재하면 기존 폴더에 파일 추가
-- 액션 추출 가이드 → `references/action_extraction_guide.md`
+---
+name: document-organizer
+description: "한국 공공기관 공문서 파일들을 공문 번호별로 자동 분류하여 폴더로 정리합니다. 공문 본문 PDF를 읽고 액션 아이템을 추출하여 Notion에 등록할 수도 있습니다. Use when: (1) 공문서 정리, (2) 공문 분류, (3) 공문 파일 정리, (4) 공문 액션, (5) 공문 정리 + 액션, (6) 공문 노션 등록이 필요할 때. 파일명 패턴은 references/pattern_examples.md 참조."
+allowed-tools: Bash(node *), Read, Write, Glob, Grep, Agent
+---
+
+# Document Organizer
+
+## Overview
+Windows 환경에서 한국 공공기관 공문서 파일을 공문 번호별로 자동 분류하고, 선택적으로 본문에서 액션 아이템을 추출하여 Notion에 등록합니다.
+
+**런타임:** Node.js (필수)
+
+## Workflow
+
+Claude는 아래 순서를 **반드시** 따른다.
+
+**트리거 분기:**
+- `"공문 정리"` / `"공문 분류"` / `"공문 액션"` / `"공문 노션 등록"` → **Step 1~6 전체** (기본 동작)
+- `"공문 파일만 정리"` → Step 1~3만 (파일 이동만, Notion 스킵)
+- `"공문 정리 되돌리기"` / `"공문 undo"` → 마지막 정리 작업 되돌리기
+
+### Step 1. Config 확인
+
+이 스킬 디렉토리 내 `config.json`을 읽는다.
+
+**config.json이 없는 경우 (최초 실행):**
+
+사용자에게 아래 3가지를 **한 번에** 질문한다:
+
+```
+공문 정리 초기 설정이 필요합니다. 아래 3가지를 알려주세요:
+
+1. 공문서 파일이 들어있는 폴더 경로 (스캔 대상)
+2. 정리된 파일을 저장할 경로 (같은 폴더면 "같음")
+3. 액션 아이템 저장 방식: Notion / 마크다운
+```
+
+사용자 답변을 받으면 **config.json을 한 번에 생성**한다:
+
+```json
+{
+  "version": "1.2",
+  "default_profile": "work",
+  "profiles": {
+    "work": {
+      "name": "기본 공문 폴더",
+      "path": "{스캔 경로}",
+      "destination": "{저장 경로 — '같음'이면 path와 동일}",
+      "last_used": null
+    }
+  },
+  "output": "notion 또는 markdown"
+}
+```
+
+**중요:**
+- 경로 작성 시 반드시 **Windows 절대경로** + **역슬래시 이스케이프(`\\`)**를 사용한다.
+- 사용자가 `바탕화면의 공문 모음 폴더` 등 자연어로 말하거나, 현재 세션 작업 디렉토리에서 실행하는 경우에도 절대경로로 변환하여 저장한다.
+- **예시 경로를 제시하지 않는다.** 사용자가 지정한 경로가 곧 기본값이 된다.
+- `destination`을 생략하거나 "같음"이면 `path`와 동일하게 설정한다.
+
+**config.json이 있는 경우:**
+
+config를 읽고 바로 Step 2로 진행한다. **추가 질문 없음.**
+
+### Step 2. 스크립트 실행
+
+```bash
+node "<이 스킬의 디렉토리>/scripts/organize.mjs"
+```
+
+- 스킬 디렉토리는 `~/.claude/skills/document-organizer` (설치 위치에 따라 다를 수 있음)
+- 프로필 지정 시: `node organize.mjs <config_path> <profile_name>`
+- 스크립트가 config.json을 직접 읽고, 대상 폴더를 스캔하고, 정리까지 한번에 수행
+
+### Step 3. 결과 보고
+
+스크립트 출력을 사용자에게 전달 (생성 폴더 수, 이동 파일 수)
+
+**`"공문 파일만 정리"` 트리거인 경우 여기서 종료. 그 외에는 Step 4로 진행.**
+
+**최초 실행은 경로 질문 1턴 + config 생성 & 스크립트 실행 1턴 = 최대 2턴.**
+**이후 실행은 config 읽기 + 스크립트 실행 = 1턴으로 완료해야 한다.**
+
+---
+
+### Step 4. 제목 기반 사전분류 + 액션 추출
+
+> **토큰 최적화:** 모든 PDF를 서브에이전트로 읽지 않는다. 제목 기반으로 필수/팔로우업을 분류한 뒤, 필수 공문만 PDF를 읽어 액션을 추출한다. 나머지는 제목만으로 팔로우업 체크리스트를 구성한다.
+
+#### 4-1. PDF 목록 조회 + 기존 등록 필터링
+
+**a) PDF 목록 조회:**
+
+```bash
+node "<스킬 디렉토리>/scripts/organize.mjs" --list-pdfs
+```
+
+**b) 노션 기존 등록 조회 (output이 "notion"인 경우):**
+
+```bash
+node "<스킬 디렉토리>/scripts/notion-api.mjs" --list-existing
+```
+
+이 명령은 Task DB에서 `by AI = true`인 항목의 비고 필드에서 공문번호의 **숫자 부분만** 추출하여 반환한다:
+```json
+{
+  "taskCount": 30,
+  "projectCount": 3,
+  "registeredDocNumbers": ["1577", "1909", ...]
+}
+```
+
+**c) 필터링:** `pdfs` 배열의 각 `docId`에서 숫자 부분(예: `인창고등학교-1577` → `1577`)을 추출하여 `registeredDocNumbers`와 비교한다. 일치하면 해당 PDF를 제외한다. 이렇게 하면 비고 필드의 기관명 표기 차이(`인창고` vs `인창고등학교`)와 무관하게 정확히 매칭된다.
+
+필터링 결과를 보고:
+```
+기존 등록 {X}건 스킵 / 신규 {Y}건 처리 대상
+```
+
+신규가 0건이면 "신규 공문 없음"을 보고하고 **팔로우업 체크리스트(4-5)만 구성**한 뒤 Step 5로 진행.
+
+- `hwpOnly` 항목은 사용자에게 `"⚠️ {파일명}: HWP 형식은 읽을 수 없어 스킵합니다."` 알림.
+- `output`이 `"markdown"`이면 b) 단계를 스킵하고 전체 PDF를 대상으로 한다.
+
+#### 4-2. 제목 기반 분류 (메인 컨텍스트)
+
+`pdfs` 배열의 각 항목을 제목(`title`)으로 **필수** vs **팔로우업**으로 분류한다. 서브에이전트 불필요.
+
+**필수 (PDF 읽기 대상)** — 아래 조건 중 하나라도 매칭:
+
+| 우선순위 | 조건 | 예시 |
+|----------|------|------|
+| 1 | `[제출]` 태그 | [제출] AIDT 활용 현황 |
+| 2 | 제목에 "제출", "보고", "제출 요청" | 점검 결과 제출 요청 |
+| 3 | 제목에 "결과" | 디지털튜터 선정 결과 |
+| 4 | 제목에 "정보공시" | 정보공시 정시 1차 일정 |
+| 5 | 제목에 "추진 계획" | 과의존 예방교육 추진 계획 |
+| 6 | 제목에 "담당자 교육" | G-ONE 담당자 교육 |
+| 7 | 조치성 키워드: "정비", "정리", "변경", "현행화", "권한관리", "주의" | 메신저 정비, 계정 정리 |
+
+**팔로우업 (PDF 안 읽음)** — 위 조건 미매칭:
+- `[협조]` 태그, 순수 `[알림]`/`[안내]`, "가이드", "보급 알림", "자료 알림" 등
+
+분류 결과를 사용자에게 요약 보고:
+```
+📋 분류 결과: 필수 {N}건 (PDF 읽기) / 팔로우업 {M}건 (제목만)
+```
+
+#### 4-3. 필수 공문 → 서브에이전트 배치
+
+**필수 PDF 수**에 따라 **5개씩** 배치를 나눈다:
+- 5개 이하 → 서브에이전트 1개
+- 6~10개 → 서브에이전트 2개
+- 11~15개 → 서브에이전트 3개
+- 16~20개 → 서브에이전트 4개
+- 21개 이상 → 서브에이전트 최대 5개
+
+각 서브에이전트에 `references/extraction_agent_prompt.md`의 프롬프트 템플릿을 사용하되:
+- `{today}`를 오늘 날짜로 치환
+- `{pdf_list}`를 해당 배치의 PDF 경로 목록으로 치환
+
+**Agent 도구로 서브에이전트들을 병렬 실행한다** (`subagent_type: "general-purpose"`, `model: "sonnet"`).
+
+필수 공문이 0건이면 서브에이전트를 생성하지 않고 4-5로 바로 진행.
+
+#### 4-4. 필수 공문 결과 집계
+
+각 서브에이전트가 반환한 JSON `results` 배열을 병합한다.
+
+**마감일 없는 필수 액션 처리:**
+- `deadline`이 없거나 빈 문자열인 액션 → `deadline`을 오늘 날짜로 설정, `note`에 "마감일 재확인 요망" 추가
+
+**프로젝트 그룹핑 후처리:**
+- 여러 공문이 같은 사업/프로그램에 관한 것인지 `docId`, `title`, `suggestProject` 필드로 판별
+- 3개 이상 관련 공문이 있으면 프로젝트로 묶기
+
+#### 4-5. 팔로우업 체크리스트 구성
+
+팔로우업 공문들을 **태그별**로 그룹핑하여 체크리스트를 구성한다:
+
+```
+### 협조 요청
+- [ ] [협조] 공문 제목 (인창고등학교-XXXX)
+- [ ] [협조] 공문 제목 (인창고등학교-YYYY)
+
+### 참고 자료
+- [ ] [안내] 공문 제목 (인창고등학교-ZZZZ)
+- [ ] [알림] 공문 제목 (인창고등학교-WWWW)
+```
+
+태그가 없는 팔로우업은 "기타" 그룹에 넣는다.
+
+### Step 5. 사용자 확인
+
+집계된 결과를 사용자에게 보여준다:
+
+```
+## 추출된 액션 아이템 (필수 공문)
+
+### ⚠️ 기한 경과
+(expired=true인 항목들)
+
+### 오늘/내일 마감
+(기한이 임박한 항목들)
+
+### 향후 기한
+(나머지 액션 항목들)
+
+---
+
+## 팔로우업 체크리스트 (참고/협조 공문)
+
+### 협조 요청
+- [ ] [협조] 공문 제목 (인창고등학교-XXXX)
+
+### 참고 자료
+- [ ] [안내] 공문 제목 (인창고등학교-YYYY)
+
+---
+수정하거나 제외할 항목이 있으면 알려주세요. 없으면 "확인"이라고 해주세요.
+```
+
+사용자가 수정을 요청하면 반영 후 재확인. `"확인"` 시 Step 6으로 진행.
+
+### Step 6. 결과 저장
+
+`config.json`의 `output` 필드에 따라 분기한다. (Step 1에서 설정 완료됨)
+
+#### 6-A. Notion 등록 (`output: "notion"`)
+
+> **의존:** `~/.claude/skills/scripts/notion-api.mjs` (공용 Notion 모듈). 크레덴셜은 모듈이 자동 로드.
+> **중복 방지:** `bulkUpsert`가 비고 필드 기반으로 자동 upsert (신규→생성, 기존→업데이트).
+
+**6-A-1. 필수 액션 등록 (TASKS DB)**
+
+사용자가 확인한 필수 액션 아이템을 **단일 JSON 파일**로 구성 후 서브에이전트 1개로 등록:
+
+```json
+{"actions":[
+  {"action":"create_tasks_with_project","data":{"project_title":"프로젝트명","tasks":[
+    {"title":"태스크 제목","deadline":"2026-03-20","note":"인창고등학교-22206"}
+  ]}},
+  {"action":"create_task","data":{"title":"개별 태스크","deadline":"","note":"인창고등학교-1234"}}
+]}
+```
+
+**비고(`note`) 필드 규칙:** 반드시 `인창고등학교-XXXX` 풀네임 형식으로 작성. 이 값이 upsert 매칭 키.
+
+```bash
+node "<스킬 디렉토리>/scripts/notion-api.mjs" --batch <json_파일_경로>
+```
+
+**6-A-2. 팔로우업 체크리스트 (기존 페이지에 블록 추가)**
+
+팔로우업 항목은 별도 태스크로 생성하지 **않는다**. 대신 **기존 팔로우업 페이지**에 to_do 블록으로 추가한다:
+
+1. `config.json`의 `followup_page_id`에서 대상 페이지 ID를 읽는다.
+   - 없으면 사용자에게 페이지 URL을 질문하고 config에 저장.
+2. 공용 모듈로 블록을 추가한다:
+   ```javascript
+   import { notion } from '~/.claude/skills/scripts/notion-api.mjs';
+   const blocks = [
+     notion.block.heading2('공문 팔로우업 (YYYY-MM-DD)'),
+     notion.block.heading3('협조 요청'),
+     // to_do 블록들...
+     notion.block.heading3('참고 자료'),
+     // to_do 블록들...
+   ];
+   await notion.appendBlocks(followupPageId, blocks);
+   ```
+3. 페이지 제목의 날짜 멘션을 오늘 날짜로 업데이트한다:
+   ```javascript
+   await notion.updatePage(followupPageId, { properties: {
+     '내용': { title: [
+       { type: 'text', text: { content: '공문 팔로우업 체크리스트(' } },
+       { type: 'mention', mention: { type: 'date', date: { start: 'YYYY-MM-DD' } } },
+       { type: 'text', text: { content: ')' } }
+     ]}
+   }});
+   ```
+4. 결과 보고: 추가된 블록 수.
+
+---
+
+#### 6-B. 마크다운 저장 (`output: "markdown"`)
+
+정리 대상 폴더(`destination`)에 `action-items-YYYY-MM-DD.md` 파일을 Write 도구로 저장한다.
+
+**파일 형식:**
+
+```markdown
+# 공문 액션 아이템 — {YYYY-MM-DD}
+
+## 필수 액션
+
+### ⚠️ 기한 경과
+- [ ] **{액션 제목}** — 기한: {날짜} | {공문번호}
+
+### 오늘/내일 마감
+- [ ] **{액션 제목}** — 기한: {날짜} | {공문번호}
+
+### 향후 기한
+- [ ] **{액션 제목}** — 기한: {날짜} | {공문번호}
+
+## 팔로우업
+
+### 협조 요청
+- [ ] [협조] 공문 제목 ({공문번호})
+
+### 참고 자료
+- [ ] [안내] 공문 제목 ({공문번호})
+```
+
+- 같은 날짜에 이미 파일이 있으면 `action-items-YYYY-MM-DD-2.md`로 번호 증가.
+- 저장 후 사용자에게 파일 경로를 보고한다.
+
+## 파일명 패턴
+
+```
+(기관명-공문번호 (본문) 발신기관명) [제출] 제목.확장자
+(기관명-공문번호 (첨부) 발신기관명) [붙임N] 제목.확장자
+(기관명-공문번호 (본문)) [제출] 제목.확장자          ← 발신기관 없는 경우도 지원
+```
+
+정규표현식:
+```
+/\(([^-]+)-(\d+)\s+\((본문|첨부)\)[^)]*\)/
+```
+
+`[^)]*`로 괄호 닫기 전까지의 모든 내용(발신기관명 등)을 허용합니다.
+
+상세 예시 → `references/pattern_examples.md`
+
+## Configuration
+
+**위치:** 이 스킬 디렉토리 내 `config.json`
+
+**최초 실행 시:** Step 1에서 스캔 경로, 저장 경로, 출력 방식을 한 번에 질문하고 config.json을 생성한다. 이후에는 추가 질문 없이 자동 실행.
+
+**구조 예시:**
+
+```json
+{
+  "version": "1.2",
+  "default_profile": "work",
+  "profiles": {
+    "work": {
+      "name": "기본 공문 폴더",
+      "path": "C:\\Users\\user\\OneDrive\\Desktop",
+      "destination": "C:\\Users\\user\\OneDrive\\Desktop\\RESOURCES\\공문",
+      "last_used": null
+    }
+  },
+  "output": "notion"
+}
+```
+
+**필드 설명:**
+- `path` — 공문 파일을 스캔할 폴더 (바탕화면 등)
+- `destination` — 정리된 파일을 저장할 폴더 (생략 시 `path`와 동일)
+- `output` — 액션 결과 저장 방식: `"notion"` 또는 `"markdown"`
+
+**경로 규칙:**
+- 반드시 Windows 절대경로 사용 (`C:\\...`)
+- JSON 내 역슬래시는 이스케이프 (`\\`)
+- `/c/Users/...` 같은 Git Bash 스타일 경로 사용 금지
+
+상세 구조 → `references/config_structure.md`
+
+**Notion 설정 (output: notion일 때):** `~/.claude/secrets/notion-credentials.md` (시크릿 참조)
+
+## Commands
+
+| 사용자 입력 | 동작 |
+|---|---|
+| `"공문 정리"` / `"공문 분류"` / `"공문 액션"` | 정리 + 액션 추출 + Notion 등록 (Step 1~6) |
+| `"personal 프로필로 공문 정리"` | 특정 프로필 사용 (Step 1~6) |
+| `"공문 파일만 정리"` | 파일 이동만 (Step 1~3), Notion 스킵 |
+| `"공문 설정 변경"` | config.json 설정을 대화형으로 수정 (경로, 출력 방식 등) |
+| `"공문 정리 설정 초기화"` | config.json 삭제 (다음 실행 시 초기 설정 재질문) |
+| `"공문 정리 되돌리기"` / `"공문 undo"` | 마지막 정리 작업 되돌리기 (`organize.mjs --undo`) |
+
+## Output Example
+
+```
+공문 모음\
+├── (인창고등학교-22206 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] AI 중점학교 운영 신청\
+│   ├── (인창고등학교-22206 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] AI 중점학교.pdf
+│   ├── (인창고등학교-22206 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임1] 신청서.hwpx
+│   └── (인창고등학교-22206 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임2] 계획서.hwpx
+└── (인창고등학교-568 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] 디지털튜터\
+    ├── (인창고등학교-568 (본문) 경기도구리남양주교육지원청 초등교육지원과) [제출] 디지털튜터.pdf
+    └── (인창고등학교-568 (첨부) 경기도구리남양주교육지원청 초등교육지원과) [붙임1] 명단.xlsx
+```
+
+## Scripts
+
+- `scripts/organize.mjs` — 메인 정리 스크립트 (Node.js)
+- `scripts/notion-api.mjs` — Notion 연동 래퍼 (공용 `~/.claude/skills/scripts/notion-api.mjs` 모듈 사용, bulkUpsert 기반)
+
+## Error Handling
+
+| 상황 | 처리 |
+|------|------|
+| PDF 읽기 실패 (암호화/스캔 이미지) | 경고 후 해당 공문 스킵 |
+| 본문이 PDF가 아닌 경우 (.hwp/.hwpx) | 스킵, 사용자에게 알림 |
+| 시크릿 파일 없음 | 안내 제시, Notion 단계 중단 |
+| Notion API 인증 실패 | 에러 표시, API 키 확인 안내 |
+| 액션 아이템 없음 (안내/통보 공문) | "조치 사항 없음" 보고, Notion 스킵 |
+
+## Notes
+- 본문 파일이 없는 공문은 `공문_기관명-번호` 폴더명 사용
+- 패턴 미매칭 파일은 이동하지 않고 원본 위치 유지
+- 이미 폴더가 존재하면 기존 폴더에 파일 추가
+- 액션 추출 가이드 → `references/action_extraction_guide.md`
```

================================================================
## document-organizer/scripts/notion-api.mjs
ours(2)=132줄 / theirs(3)=132줄
```diff
diff --git a/document-organizer/scripts/notion-api.mjs b/document-organizer/scripts/notion-api.mjs
index aa8209a..f7c7fd9 100644
--- a/document-organizer/scripts/notion-api.mjs
+++ b/document-organizer/scripts/notion-api.mjs
@@ -1,132 +1,132 @@
-/**
- * Document Organizer - Notion 연동 (공용 notion-api.mjs 래퍼)
- *
- * 사용법:
- *   --list-existing              기존 등록된 공문번호 조회
- *   --batch <json_file>          배치 등록 (bulkUpsert)
- *   <json_file>                  단일 등록
- *
- * 의존: ~/.claude/skills/scripts/notion-api.mjs (공용 모듈)
- */
-
-import { readFileSync, existsSync } from 'fs';
-import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
-
-// ── DB ID (notion-workspace 스킬의 DB 레지스트리와 동일) ──
-const TASKS_DB = '2eedd1dcd64481358087f7422ea1c7ff';
-const PROJECTS_DB = '2eedd1dcd644813586b0e978943fd85a';
-
-// ── 기존 등록 공문번호 조회 ─────────────────────────────
-async function listExisting() {
-  const allPages = await notion.queryAll(TASKS_DB, {
-    filter: { property: 'by AI', checkbox: { equals: true } },
-  });
-
-  const docNumbers = new Set();
-  for (const page of allPages) {
-    const note = notion.extractValue(page, '비고') || '';
-    // 패턴 1: "인창고등학교-2243" → 2243
-    // 패턴 2: "인창고등학교-2243, 2844, 3060" → 2243, 2844, 3060 (쉼표 뒤 숫자도 캡처)
-    // 패턴 3: "인창고등학교-2969/3012" → 2969, 3012 (슬래시 구분도 캡처)
-    const allNums = note.matchAll(/(?:[가-힣]+-|[,/]\s*)(\d{3,})/g);
-    for (const m of allNums) docNumbers.add(m[1]);
-  }
-
-  console.log(JSON.stringify({
-    taskCount: allPages.length,
-    registeredDocNumbers: [...docNumbers].sort((a, b) => Number(a) - Number(b)),
-  }, null, 2));
-}
-
-// ── 배치/단일 등록 (bulkUpsert 기반) ────────────────────
-async function executeActions(parsed) {
-  const actions = parsed.actions || [parsed];
-  const allItems = [];
-  const projectResults = [];
-
-  for (const req of actions) {
-    if (req.action === 'create_task' || req.action === 'create_followup_task') {
-      const d = req.data;
-      const props = {
-        '내용': notion.prop.title(d.title),
-        '상태': notion.prop.status('시작 전'),
-        'by AI': { checkbox: true },
-        '태그': notion.prop.multiSelect(['정보부업무']),
-      };
-      if (d.deadline) props['마감일'] = { date: { start: d.deadline } };
-      if (d.note) props['비고'] = notion.prop.richText(d.note);
-      // matchValue = 비고 필드 (공문번호 기반 upsert)
-      allItems.push({ matchValue: d.note || d.title, properties: props });
-
-    } else if (req.action === 'create_tasks_with_project') {
-      const { project_title, tasks } = req.data;
-      // 프로젝트 upsert
-      try {
-        const projResult = await notion.upsertPage(PROJECTS_DB, '제목', 'title', project_title, {
-          '제목': notion.prop.title(project_title),
-        });
-        projectResults.push({ type: 'project', title: project_title, ...projResult });
-        // 하위 태스크 추가
-        for (const t of tasks) {
-          const props = {
-            '내용': notion.prop.title(t.title),
-            '상태': notion.prop.status('시작 전'),
-            'by AI': { checkbox: true },
-            '태그': notion.prop.multiSelect(['정보부업무']),
-            'PROJECTS': { relation: [{ id: projResult.pageId }] },
-          };
-          if (t.deadline) props['마감일'] = { date: { start: t.deadline } };
-          if (t.note) props['비고'] = notion.prop.richText(t.note);
-          allItems.push({ matchValue: t.note || t.title, properties: props });
-        }
-      } catch (e) {
-        projectResults.push({ type: 'project', title: project_title, error: e.message });
-      }
-    }
-  }
-
-  // 태스크 bulkUpsert (비고 필드 기반 매칭)
-  let taskStats = { updated: 0, created: 0, failed: 0, errors: [] };
-  if (allItems.length > 0) {
-    taskStats = await notion.bulkUpsert(TASKS_DB, '비고', allItems, {
-      onProgress: (done, total) => process.stderr.write(`\r${done}/${total}`),
-    });
-  }
-
-  console.log(JSON.stringify({
-    success: taskStats.failed === 0 && projectResults.every(p => !p.error),
-    projects: projectResults,
-    tasks: taskStats,
-  }, null, 2));
-}
-
-// ── 메인 ─────────────────────────────────────────────────
-async function main() {
-  const args = process.argv.slice(2);
-
-  if (args[0] === '--list-existing') {
-    await listExisting();
-    return;
-  }
-
-  const isBatch = args[0] === '--batch';
-  const filePath = isBatch ? args[1] : args[0];
-
-  if (!filePath) {
-    console.error(JSON.stringify({ success: false, error: '파일 경로가 필요합니다.' }));
-    process.exit(1);
-  }
-
-  if (!existsSync(filePath)) {
-    console.error(JSON.stringify({ success: false, error: `파일 없음: ${filePath}` }));
-    process.exit(1);
-  }
-
-  const parsed = JSON.parse(readFileSync(filePath, 'utf-8').trim());
-  await executeActions(parsed);
-}
-
-main().catch(e => {
-  console.error(JSON.stringify({ success: false, error: e.message }));
-  process.exit(1);
-});
+/**
+ * Document Organizer - Notion 연동 (공용 notion-api.mjs 래퍼)
+ *
+ * 사용법:
+ *   --list-existing              기존 등록된 공문번호 조회
+ *   --batch <json_file>          배치 등록 (bulkUpsert)
+ *   <json_file>                  단일 등록
+ *
+ * 의존: ~/.claude/skills/scripts/notion-api.mjs (공용 모듈)
+ */
+
+import { readFileSync, existsSync } from 'fs';
+import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs';
+
+// ── DB ID (notion-workspace 스킬의 DB 레지스트리와 동일) ──
+const TASKS_DB = '2eedd1dcd64481358087f7422ea1c7ff';
+const PROJECTS_DB = '2eedd1dcd644813586b0e978943fd85a';
+
+// ── 기존 등록 공문번호 조회 ─────────────────────────────
+async function listExisting() {
+  const allPages = await notion.queryAll(TASKS_DB, {
+    filter: { property: 'by AI', checkbox: { equals: true } },
+  });
+
+  const docNumbers = new Set();
+  for (const page of allPages) {
+    const note = notion.extractValue(page, '비고') || '';
+    // 패턴 1: "인창고등학교-2243" → 2243
+    // 패턴 2: "인창고등학교-2243, 2844, 3060" → 2243, 2844, 3060 (쉼표 뒤 숫자도 캡처)
+    // 패턴 3: "인창고등학교-2969/3012" → 2969, 3012 (슬래시 구분도 캡처)
+    const allNums = note.matchAll(/(?:[가-힣]+-|[,/]\s*)(\d{3,})/g);
+    for (const m of allNums) docNumbers.add(m[1]);
+  }
+
+  console.log(JSON.stringify({
+    taskCount: allPages.length,
+    registeredDocNumbers: [...docNumbers].sort((a, b) => Number(a) - Number(b)),
+  }, null, 2));
+}
+
+// ── 배치/단일 등록 (bulkUpsert 기반) ────────────────────
+async function executeActions(parsed) {
+  const actions = parsed.actions || [parsed];
+  const allItems = [];
+  const projectResults = [];
+
+  for (const req of actions) {
+    if (req.action === 'create_task' || req.action === 'create_followup_task') {
+      const d = req.data;
+      const props = {
+        '내용': notion.prop.title(d.title),
+        '상태': notion.prop.status('시작 전'),
+        'by AI': { checkbox: true },
+        '태그': notion.prop.multiSelect(['정보부업무']),
+      };
+      if (d.deadline) props['마감일'] = { date: { start: d.deadline } };
+      if (d.note) props['비고'] = notion.prop.richText(d.note);
+      // matchValue = 비고 필드 (공문번호 기반 upsert)
+      allItems.push({ matchValue: d.note || d.title, properties: props });
+
+    } else if (req.action === 'create_tasks_with_project') {
+      const { project_title, tasks } = req.data;
+      // 프로젝트 upsert
+      try {
+        const projResult = await notion.upsertPage(PROJECTS_DB, '제목', 'title', project_title, {
+          '제목': notion.prop.title(project_title),
+        });
+        projectResults.push({ type: 'project', title: project_title, ...projResult });
+        // 하위 태스크 추가
+        for (const t of tasks) {
+          const props = {
+            '내용': notion.prop.title(t.title),
+            '상태': notion.prop.status('시작 전'),
+            'by AI': { checkbox: true },
+            '태그': notion.prop.multiSelect(['정보부업무']),
+            'PROJECTS': { relation: [{ id: projResult.pageId }] },
+          };
+          if (t.deadline) props['마감일'] = { date: { start: t.deadline } };
+          if (t.note) props['비고'] = notion.prop.richText(t.note);
+          allItems.push({ matchValue: t.note || t.title, properties: props });
+        }
+      } catch (e) {
+        projectResults.push({ type: 'project', title: project_title, error: e.message });
+      }
+    }
+  }
+
+  // 태스크 bulkUpsert (비고 필드 기반 매칭)
+  let taskStats = { updated: 0, created: 0, failed: 0, errors: [] };
+  if (allItems.length > 0) {
+    taskStats = await notion.bulkUpsert(TASKS_DB, '비고', allItems, {
+      onProgress: (done, total) => process.stderr.write(`\r${done}/${total}`),
+    });
+  }
+
+  console.log(JSON.stringify({
+    success: taskStats.failed === 0 && projectResults.every(p => !p.error),
+    projects: projectResults,
+    tasks: taskStats,
+  }, null, 2));
+}
+
+// ── 메인 ─────────────────────────────────────────────────
+async function main() {
+  const args = process.argv.slice(2);
+
+  if (args[0] === '--list-existing') {
+    await listExisting();
+    return;
+  }
+
+  const isBatch = args[0] === '--batch';
+  const filePath = isBatch ? args[1] : args[0];
+
+  if (!filePath) {
+    console.error(JSON.stringify({ success: false, error: '파일 경로가 필요합니다.' }));
+    process.exit(1);
+  }
+
+  if (!existsSync(filePath)) {
+    console.error(JSON.stringify({ success: false, error: `파일 없음: ${filePath}` }));
+    process.exit(1);
+  }
+
+  const parsed = JSON.parse(readFileSync(filePath, 'utf-8').trim());
+  await executeActions(parsed);
+}
+
+main().catch(e => {
+  console.error(JSON.stringify({ success: false, error: e.message }));
+  process.exit(1);
+});
```

================================================================
## document-organizer/scripts/organize.mjs
ours(2)=284줄 / theirs(3)=261줄
```diff
diff --git a/document-organizer/scripts/organize.mjs b/document-organizer/scripts/organize.mjs
index 7724b83..0278474 100644
--- a/document-organizer/scripts/organize.mjs
+++ b/document-organizer/scripts/organize.mjs
@@ -1,284 +1,261 @@
-/**
- * Document Organizer - Main Script (Node.js)
- * 공문서를 공문 번호별로 자동 정리
- *
- * 사용법:
- *   node organize.mjs [config_path] [profile_name]   — 정리 실행
- *   node organize.mjs --undo                          — 마지막 정리 되돌리기
- */
-
-import { readdirSync, mkdirSync, renameSync, rmdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
-import { join, extname } from 'path';
-import { homedir } from 'os';
-
-// ── Config ──────────────────────────────────────────────
-const SKILL_DIR = join(homedir(), '.claude', 'skills', 'document-organizer');
-const UNDO_LOG_PATH = join(SKILL_DIR, '.last-organize.json');
-
-const args = process.argv.slice(2);
-const flags = new Set(args.filter(a => a.startsWith('--')));
-const positional = args.filter(a => !a.startsWith('--'));
-
-const isUndo = flags.has('--undo');
-const isListPdfs = flags.has('--list-pdfs');
-const isNewOnly = isListPdfs && flags.has('--new-only');
-const CONFIG_PATH = (!isUndo && !isListPdfs && positional[0]) || join(SKILL_DIR, 'config.json');
-const PROFILE_NAME = positional[isUndo || isListPdfs ? 0 : 1] || null;
-
-function loadConfig() {
-  if (!existsSync(CONFIG_PATH)) return null;
-  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
-}
-
-function getDirectories(config, profileName) {
-  const name = profileName || config.default_profile || 'work';
-  const profile = config.profiles?.[name];
-  if (!profile) throw new Error(`프로필 '${name}'을 찾을 수 없습니다.`);
-  return {
-    scanPath: profile.path,
-    destPath: profile.destination || profile.path
-  };
-}
-
-// ── Pattern ─────────────────────────────────────────────
-const PATTERN = /\(([^-]+)-(\d+)\s+\((본문|첨부)\)[^)]*\)/;
-
-function groupFiles(files) {
-  const groups = {};
-  const folderNames = {};
-  const unmatched = [];
-
-  for (const name of files) {
-    const m = name.match(PATTERN);
-    if (m) {
-      const key = `${m[1]}-${m[2]}`;
-      (groups[key] ??= []).push(name);
-      if (m[3] === '본문') {
-        folderNames[key] = name.replace(extname(name), '');
-      }
-    } else {
-      unmatched.push(name);
-    }
-  }
-  return { groups, folderNames, unmatched };
-}
-
-// ── Organize ────────────────────────────────────────────
-function organize(scanPath, destPath, groups, folderNames) {
-  let movedCount = 0;
-  let folderCount = 0;
-  const moves = [];       // undo 기록용
-  const createdDirs = [];
-  const skipped = [];     // 목적지에 이미 존재하여 스킵된 파일
-
-  if (!existsSync(destPath)) {
-    mkdirSync(destPath, { recursive: true });
-  }
-
-  for (const [key, fileNames] of Object.entries(groups)) {
-    const fname = folderNames[key] || `공문_${key}`;
-    const folderPath = join(destPath, fname);
-
-    if (!existsSync(folderPath)) {
-      mkdirSync(folderPath, { recursive: true });
-      createdDirs.push(folderPath);
-      folderCount++;
-    }
-
-    for (const fileName of fileNames) {
-      const src = join(scanPath, fileName);
-      const dst = join(folderPath, fileName);
-      if (existsSync(src) && !existsSync(dst)) {
-        renameSync(src, dst);
-        moves.push({ from: src, to: dst });
-        movedCount++;
-      } else if (existsSync(src) && existsSync(dst)) {
-        skipped.push({ file: fileName, docKey: key });
-      }
-    }
-  }
-
-  // undo 로그 저장
-  const undoLog = {
-    timestamp: new Date().toISOString(),
-    moves,
-    createdDirs
-  };
-  writeFileSync(UNDO_LOG_PATH, JSON.stringify(undoLog, null, 2), 'utf-8');
-
-  return { folderCount, movedCount, skipped };
-}
-
-// ── Undo ────────────────────────────────────────────────
-function undo() {
-  if (!existsSync(UNDO_LOG_PATH)) {
-    console.error('ERROR: 되돌릴 정리 기록이 없습니다.');
-    process.exit(1);
-  }
-
-  const log = JSON.parse(readFileSync(UNDO_LOG_PATH, 'utf-8'));
-  console.log(`되돌리기: ${log.timestamp} 작업 (${log.moves.length}개 파일)`);
-
-  let restored = 0;
-  let errors = 0;
-
-  // 파일을 원래 위치로 복원 (역순)
-  for (const { from, to } of [...log.moves].reverse()) {
-    if (existsSync(to)) {
-      try {
-        renameSync(to, from);
-        restored++;
-      } catch (e) {
-        console.error(`  실패: ${to} → ${e.message}`);
-        errors++;
-      }
-    } else {
-      console.log(`  스킵 (파일 없음): ${to}`);
-    }
-  }
-
-  // 빈 폴더 삭제 (역순)
-  for (const dir of [...log.createdDirs].reverse()) {
-    try {
-      if (existsSync(dir) && readdirSync(dir).length === 0) {
-        rmdirSync(dir);
-        console.log(`  폴더 삭제: ${dir}`);
-      }
-    } catch { /* 비어있지 않으면 무시 */ }
-  }
-
-  // undo 로그 삭제
-  try { writeFileSync(UNDO_LOG_PATH, '', 'utf-8'); } catch {}
-
-  console.log(`\n복원: ${restored}개 파일`);
-  if (errors) console.log(`실패: ${errors}개`);
-}
-
-// ── List PDFs ──────────────────────────────────────────
-function listPdfs() {
-  const config = loadConfig();
-  if (!config) {
-    console.error('ERROR: config.json을 찾을 수 없습니다.');
-    process.exit(1);
-  }
-
-  const { destPath } = getDirectories(config, PROFILE_NAME);
-  if (!existsSync(destPath)) {
-    console.log(JSON.stringify({ pdfs: [], hwpOnly: [] }));
-    return;
-  }
-
-  // --new-only: undo 로그에서 이번에 이동한 공문번호만 필터링
-  let newDocIds = null;
-  if (isNewOnly && existsSync(UNDO_LOG_PATH)) {
-    const log = JSON.parse(readFileSync(UNDO_LOG_PATH, 'utf-8'));
-    if (log.moves && log.moves.length > 0) {
-      newDocIds = new Set();
-      for (const { to } of log.moves) {
-        const m = to.match(PATTERN);
-        if (m) newDocIds.add(`${m[1]}-${m[2]}`);
-      }
-    }
-  }
-  if (isNewOnly && (!newDocIds || newDocIds.size === 0)) {
-    console.log(JSON.stringify({ pdfs: [], hwpOnly: [] }));
-    return;
-  }
-
-  const pdfs = [];
-  const hwpOnly = [];
-
-  const folders = readdirSync(destPath).filter(name => {
-    try { return statSync(join(destPath, name)).isDirectory(); } catch { return false; }
-  });
-
-  for (const folder of folders) {
-    const folderPath = join(destPath, folder);
-    const files = readdirSync(folderPath);
-    const bodyPdf = files.find(f => f.includes('(본문)') && f.toLowerCase().endsWith('.pdf'));
-    const bodyHwp = files.find(f => f.includes('(본문)') && (f.endsWith('.hwp') || f.endsWith('.hwpx')));
-
-    if (bodyPdf) {
-      const m = bodyPdf.match(PATTERN);
-      const docId = m ? `${m[1]}-${m[2]}` : folder;
-      if (newDocIds && !newDocIds.has(docId)) continue;
-      const title = bodyPdf.replace(extname(bodyPdf), '').replace(/\([^)]*\)\s*/g, '').replace(/\[[^\]]*\]\s*/, '').trim();
-      pdfs.push({ docId, title, path: join(folderPath, bodyPdf) });
-    } else if (bodyHwp) {
-      const m = bodyHwp.match(PATTERN);
-      const docId = m ? `${m[1]}-${m[2]}` : folder;
-      if (newDocIds && !newDocIds.has(docId)) continue;
-      hwpOnly.push({ docId, file: bodyHwp });
-    }
-  }
-
-  console.log(JSON.stringify({ pdfs, hwpOnly }));
-}
-
-// ── Main ────────────────────────────────────────────────
-function main() {
-  if (isUndo) {
-    undo();
-    return;
-  }
-
-  if (isListPdfs) {
-    listPdfs();
-    return;
-  }
-
-  const config = loadConfig();
-  if (!config) {
-    console.error('ERROR: config.json을 찾을 수 없습니다.');
-    process.exit(1);
-  }
-
-  const { scanPath, destPath } = getDirectories(config, PROFILE_NAME);
-  if (!existsSync(scanPath)) {
-    console.error(`ERROR: 스캔 경로가 존재하지 않습니다: ${scanPath}`);
-    process.exit(1);
-  }
-
-  console.log(`스캔: ${scanPath}`);
-  if (destPath !== scanPath) console.log(`정리: ${destPath}`);
-
-  const allFiles = readdirSync(scanPath).filter(n => {
-    try { return statSync(join(scanPath, n)).isFile(); } catch { return false; }
-  });
-
-  console.log(`총 파일: ${allFiles.length}개`);
-
-  const { groups, folderNames, unmatched } = groupFiles(allFiles);
-  const groupCount = Object.keys(groups).length;
-  console.log(`공문 그룹: ${groupCount}개`);
-
-  if (unmatched.length) {
-    console.log(`패턴 미매칭: ${unmatched.length}개`);
-    unmatched.forEach(f => console.log(`  - ${f}`));
-  }
-
-  if (groupCount === 0) {
-    console.log('정리할 공문이 없습니다.');
-    process.exit(0);
-  }
-
-  const { folderCount, movedCount, skipped } = organize(scanPath, destPath, groups, folderNames);
-
-  console.log(`\n생성된 폴더: ${folderCount}개`);
-  console.log(`이동된 파일: ${movedCount}개`);
-
-  if (skipped.length) {
-    // 공문번호별로 그룹핑하여 보고
-    const byDoc = {};
-    for (const { file, docKey } of skipped) {
-      (byDoc[docKey] ??= []).push(file);
-    }
-    console.log(`\n스킵 (목적지에 이미 존재): ${skipped.length}개`);
-    for (const [docKey, files] of Object.entries(byDoc)) {
-      console.log(`  [${docKey}] ${files.length}개 파일`);
-      files.forEach(f => console.log(`    - ${f}`));
-    }
-  }
-}
-
-main();
+/**
+ * Document Organizer - Main Script (Node.js)
+ * 공문서를 공문 번호별로 자동 정리
+ *
+ * 사용법:
+ *   node organize.mjs [config_path] [profile_name]   — 정리 실행
+ *   node organize.mjs --undo                          — 마지막 정리 되돌리기
+ */
+
+import { readdirSync, mkdirSync, renameSync, rmdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
+import { join, extname } from 'path';
+import { homedir } from 'os';
+
+// ── Config ──────────────────────────────────────────────
+const SKILL_DIR = join(homedir(), '.claude', 'skills', 'document-organizer');
+const UNDO_LOG_PATH = join(SKILL_DIR, '.last-organize.json');
+
+const isUndo = process.argv[2] === '--undo';
+const isListPdfs = process.argv[2] === '--list-pdfs';
+const CONFIG_PATH = (!isUndo && !isListPdfs && process.argv[2]) || join(SKILL_DIR, 'config.json');
+const PROFILE_NAME = process.argv[3] || null;
+
+function loadConfig() {
+  if (!existsSync(CONFIG_PATH)) return null;
+  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
+}
+
+function getDirectories(config, profileName) {
+  const name = profileName || config.default_profile || 'work';
+  const profile = config.profiles?.[name];
+  if (!profile) throw new Error(`프로필 '${name}'을 찾을 수 없습니다.`);
+  return {
+    scanPath: profile.path,
+    destPath: profile.destination || profile.path
+  };
+}
+
+// ── Pattern ─────────────────────────────────────────────
+const PATTERN = /\(([^-]+)-(\d+)\s+\((본문|첨부)\)[^)]*\)/;
+
+function groupFiles(files) {
+  const groups = {};
+  const folderNames = {};
+  const unmatched = [];
+
+  for (const name of files) {
+    const m = name.match(PATTERN);
+    if (m) {
+      const key = `${m[1]}-${m[2]}`;
+      (groups[key] ??= []).push(name);
+      if (m[3] === '본문') {
+        folderNames[key] = name.replace(extname(name), '');
+      }
+    } else {
+      unmatched.push(name);
+    }
+  }
+  return { groups, folderNames, unmatched };
+}
+
+// ── Organize ────────────────────────────────────────────
+function organize(scanPath, destPath, groups, folderNames) {
+  let movedCount = 0;
+  let folderCount = 0;
+  const moves = [];       // undo 기록용
+  const createdDirs = [];
+  const skipped = [];     // 목적지에 이미 존재하여 스킵된 파일
+
+  if (!existsSync(destPath)) {
+    mkdirSync(destPath, { recursive: true });
+  }
+
+  for (const [key, fileNames] of Object.entries(groups)) {
+    const fname = folderNames[key] || `공문_${key}`;
+    const folderPath = join(destPath, fname);
+
+    if (!existsSync(folderPath)) {
+      mkdirSync(folderPath, { recursive: true });
+      createdDirs.push(folderPath);
+      folderCount++;
+    }
+
+    for (const fileName of fileNames) {
+      const src = join(scanPath, fileName);
+      const dst = join(folderPath, fileName);
+      if (existsSync(src) && !existsSync(dst)) {
+        renameSync(src, dst);
+        moves.push({ from: src, to: dst });
+        movedCount++;
+      } else if (existsSync(src) && existsSync(dst)) {
+        skipped.push({ file: fileName, docKey: key });
+      }
+    }
+  }
+
+  // undo 로그 저장
+  const undoLog = {
+    timestamp: new Date().toISOString(),
+    moves,
+    createdDirs
+  };
+  writeFileSync(UNDO_LOG_PATH, JSON.stringify(undoLog, null, 2), 'utf-8');
+
+  return { folderCount, movedCount, skipped };
+}
+
+// ── Undo ────────────────────────────────────────────────
+function undo() {
+  if (!existsSync(UNDO_LOG_PATH)) {
+    console.error('ERROR: 되돌릴 정리 기록이 없습니다.');
+    process.exit(1);
+  }
+
+  const log = JSON.parse(readFileSync(UNDO_LOG_PATH, 'utf-8'));
+  console.log(`되돌리기: ${log.timestamp} 작업 (${log.moves.length}개 파일)`);
+
+  let restored = 0;
+  let errors = 0;
+
+  // 파일을 원래 위치로 복원 (역순)
+  for (const { from, to } of [...log.moves].reverse()) {
+    if (existsSync(to)) {
+      try {
+        renameSync(to, from);
+        restored++;
+      } catch (e) {
+        console.error(`  실패: ${to} → ${e.message}`);
+        errors++;
+      }
+    } else {
+      console.log(`  스킵 (파일 없음): ${to}`);
+    }
+  }
+
+  // 빈 폴더 삭제 (역순)
+  for (const dir of [...log.createdDirs].reverse()) {
+    try {
+      if (existsSync(dir) && readdirSync(dir).length === 0) {
+        rmdirSync(dir);
+        console.log(`  폴더 삭제: ${dir}`);
+      }
+    } catch { /* 비어있지 않으면 무시 */ }
+  }
+
+  // undo 로그 삭제
+  try { writeFileSync(UNDO_LOG_PATH, '', 'utf-8'); } catch {}
+
+  console.log(`\n복원: ${restored}개 파일`);
+  if (errors) console.log(`실패: ${errors}개`);
+}
+
+// ── List PDFs ──────────────────────────────────────────
+function listPdfs() {
+  const config = loadConfig();
+  if (!config) {
+    console.error('ERROR: config.json을 찾을 수 없습니다.');
+    process.exit(1);
+  }
+
+  const { destPath } = getDirectories(config, PROFILE_NAME);
+  if (!existsSync(destPath)) {
+    console.log(JSON.stringify({ pdfs: [], hwpOnly: [] }));
+    return;
+  }
+
+  const pdfs = [];
+  const hwpOnly = [];
+
+  const folders = readdirSync(destPath).filter(name => {
+    try { return statSync(join(destPath, name)).isDirectory(); } catch { return false; }
+  });
+
+  for (const folder of folders) {
+    const folderPath = join(destPath, folder);
+    const files = readdirSync(folderPath);
+    const bodyPdf = files.find(f => f.includes('(본문)') && f.toLowerCase().endsWith('.pdf'));
+    const bodyHwp = files.find(f => f.includes('(본문)') && (f.endsWith('.hwp') || f.endsWith('.hwpx')));
+
+    if (bodyPdf) {
+      // 파일명에서 공문번호와 제목 추출
+      const m = bodyPdf.match(PATTERN);
+      const docId = m ? `${m[1]}-${m[2]}` : folder;
+      const title = bodyPdf.replace(extname(bodyPdf), '').replace(/\([^)]*\)\s*/g, '').replace(/\[[^\]]*\]\s*/, '').trim();
+      pdfs.push({ docId, title, path: join(folderPath, bodyPdf) });
+    } else if (bodyHwp) {
+      const m = bodyHwp.match(PATTERN);
+      const docId = m ? `${m[1]}-${m[2]}` : folder;
+      hwpOnly.push({ docId, file: bodyHwp });
+    }
+  }
+
+  console.log(JSON.stringify({ pdfs, hwpOnly }));
+}
+
+// ── Main ────────────────────────────────────────────────
+function main() {
+  if (isUndo) {
+    undo();
+    return;
+  }
+
+  if (isListPdfs) {
+    listPdfs();
+    return;
+  }
+
+  const config = loadConfig();
+  if (!config) {
+    console.error('ERROR: config.json을 찾을 수 없습니다.');
+    process.exit(1);
+  }
+
+  const { scanPath, destPath } = getDirectories(config, PROFILE_NAME);
+  if (!existsSync(scanPath)) {
+    console.error(`ERROR: 스캔 경로가 존재하지 않습니다: ${scanPath}`);
+    process.exit(1);
+  }
+
+  console.log(`스캔: ${scanPath}`);
+  if (destPath !== scanPath) console.log(`정리: ${destPath}`);
+
+  const allFiles = readdirSync(scanPath).filter(n => {
+    try { return statSync(join(scanPath, n)).isFile(); } catch { return false; }
+  });
+
+  console.log(`총 파일: ${allFiles.length}개`);
+
+  const { groups, folderNames, unmatched } = groupFiles(allFiles);
+  const groupCount = Object.keys(groups).length;
+  console.log(`공문 그룹: ${groupCount}개`);
+
+  if (unmatched.length) {
+    console.log(`패턴 미매칭: ${unmatched.length}개`);
+    unmatched.forEach(f => console.log(`  - ${f}`));
+  }
+
+  if (groupCount === 0) {
+    console.log('정리할 공문이 없습니다.');
+    process.exit(0);
+  }
+
+  const { folderCount, movedCount, skipped } = organize(scanPath, destPath, groups, folderNames);
+
+  console.log(`\n생성된 폴더: ${folderCount}개`);
+  console.log(`이동된 파일: ${movedCount}개`);
+
+  if (skipped.length) {
+    // 공문번호별로 그룹핑하여 보고
+    const byDoc = {};
+    for (const { file, docKey } of skipped) {
+      (byDoc[docKey] ??= []).push(file);
+    }
+    console.log(`\n스킵 (목적지에 이미 존재): ${skipped.length}개`);
+    for (const [docKey, files] of Object.entries(byDoc)) {
+      console.log(`  [${docKey}] ${files.length}개 파일`);
+      files.forEach(f => console.log(`    - ${f}`));
+    }
+  }
+}
+
+main();
```

================================================================
## exam-analyzer/SKILL.md
ours(2)=658줄 / theirs(3)=415줄
```diff
diff --git a/exam-analyzer/SKILL.md b/exam-analyzer/SKILL.md
index eeefcc6..381e113 100644
--- a/exam-analyzer/SKILL.md
+++ b/exam-analyzer/SKILL.md
@@ -1,658 +1,415 @@
----
-name: exam-analyzer
-description: "수능/모평/학평 기출 PDF를 분석하거나, 기출 PDF에서 개별 문항을 이미지로 크롭합니다. 교과서 PDF가 있으면 자동 키워드 추출, 없으면 자연어로 범위를 지정할 수 있습니다. 시험지 PDF를 문항별 이미지로 자동 분할하는 기능도 지원합니다. 모든 수능 과목(국어, 수학, 영어, 사탐, 과탐, 한국사 등)에 대응합니다. Use when: (1) 기출 분석, (2) 기출 정리, (3) 단원별 기출, (4) 시험 분석, (5) 기출 분할, (6) 문항 분할, (7) 시험지 분할, (8) 기출 캡쳐, (9) 문제 캡쳐, (10) 문항 크롭, (11) 기출 스크린샷이 필요할 때. 트리거: '기출문제 캡쳐', '문제 잘라줘', '문항 크롭', '기출 스크린샷'."
-allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
----
-
-# Exam Analyzer (수능 기출 분석기)
-
-## Overview
-
-수능/모평/학평 기출 PDF를 분석하거나, 문항별로 자동 분할한다.
-
-**세 가지 모드**를 지원한다:
-- **교과서 모드**: 교과서 단원 PDF에서 키워드를 자동 추출하여 기출 매칭 (정밀)
-- **자연어 모드**: 교과서 PDF 없이, 사용자가 주제/범위를 자연어로 지정 (간편)
-- **분할 모드**: 시험지 PDF를 문항별 개별 이미지로 자동 분할 (분석 없이 크롭만)
-
-모든 수능 과목(국어, 수학, 영어, 사회탐구, 과학탐구, 한국사 등)에 대응한다.
-
-## Role
-
-당신은 대한민국 수능 기출 분석 전문가이다.
-교과서 내용 또는 사용자가 지정한 주제를 기반으로 기출 문항을 매칭하고,
-출제 패턴과 키워드를 체계적으로 정리하는 것이 임무이다.
-
-## Input: 모드 분기
-
-사용자 입력을 분석하여 모드를 자동 판별한다:
-
-| 입력 패턴 | 모드 |
-|----------|------|
-| `기출 분할`, `문항 분할`, `시험지 분할` + 파일/폴더 경로 | **분할 모드** |
-| `기출 분석` + 단원 번호, 파일 경로, 교과서 키워드 | **교과서 모드** |
-| `기출 분석` + 자연어 주제 | **자연어 모드** |
-| `기출 분석` (범위 없음) | 모드 선택 안내 |
-
----
-
-### 분할 모드
-
-시험지 PDF의 모든 문항을 자동 감지하여 개별 이미지로 크롭한다.
-키워드 추출이나 분석 없이 순수 크롭만 수행한다.
-
-```
-기출 분할 "D:\기출\2025 수능 동아시아사.pdf"
-기출 분할 "D:\기출\2024\"
-문항 분할 "C:\시험지\모의고사.pdf"
-```
-
-**동작:**
-1. 입력이 파일이면 해당 PDF만, 폴더이면 하위 PDF 전체를 처리한다.
-2. 각 PDF에서 시험명을 자동 식별한다 (학년도 + 시험 유형).
-   - 1순위: PDF 텍스트에서 `20XX학년도`, `대학수학능력시험`, `모의평가` 등 패턴 탐색
-   - 2순위: 텍스트 식별 실패 시 **파일명**에서 폴백 (`2024 수능 동아시아사.pdf` → `2024_수능`)
-3. 1번~50번까지 순회하며 존재하는 문항을 모두 감지한다.
-4. 각 문항을 개별 크롭하여 저장한다.
-
-**출력 규칙:**
-- 입력 파일/폴더의 **부모 디렉토리**에 시험명 폴더를 생성한다.
-- 파일명은 `Q{번호:02d}.webp` (폴더명이 시험명이므로 파일명에는 번호만)
-- 예시:
-  ```
-  D:\기출\2024\2024 수능 동아시아사.pdf
-  → D:\기출\2024\2024_수능\Q01.webp, Q02.webp, ...
-
-  D:\기출\2024\  (폴더 지정)
-  → D:\기출\2024\2024_수능\Q01.webp, ...
-  → D:\기출\2024\2024_6월모평\Q01.webp, ...
-  → D:\기출\2024\2024_9월모평\Q01.webp, ...
-  ```
-
-**스크립트 실행:**
-```bash
-python "<스킬경로>/scripts/crop_questions.py" --split "<pdf_or_dir>"
-```
-출력 폴더는 자동 결정되므로 인자로 넘기지 않는다.
-
----
-
-### 분석 모드: 범위 지정 방식
-
-사용자는 다음 방식 중 하나로 범위를 지정한다:
-
-### 방식 1: 단원 번호 (교과서 모드)
-```
-기출 분석 02
-```
-→ 교과서 폴더에서 `02`가 포함된 파일을 자동 매칭
-
-### 방식 2: 키워드로 교과서 매칭 (교과서 모드)
-```
-기출 분석 선사 문화
-기출 분석 미적분
-```
-→ 교과서 파일명에서 키워드 검색
-
-### 방식 3: 파일 경로 직접 지정 (교과서 모드)
-```
-기출 분석 "C:\...\02. 선사 문화.pdf"
-```
-→ 파일 경로 뒤에도 페이지 옵션 사용 가능: `기출 분석 "경로" p1-3`
-
-### 방식 4: 자연어로 주제 지정 (자연어 모드)
-```
-기출 분석 조선 전기 정치
-기출 분석 삼각함수의 활용
-기출 분석 전자기 유도와 상호 유도
-```
-→ 교과서 PDF 없이 사용 가능
-→ Claude가 해당 주제의 교과 지식을 활용하여 키워드를 생성
-
-### 페이지 범위 옵션 (교과서 모드에서만, 선택)
-
-단원 내 특정 부분만 분석하고 싶을 때 `p시작-끝`을 추가한다:
-```
-기출 분석 03 p1-3
-기출 분석 03 p4-6
-```
-→ 해당 페이지에서만 키워드를 추출하여 기출 매칭
-→ 내용이 많은 단원을 소주제별로 쪼개 분석할 때 유용
-→ 페이지 옵션이 없으면 단원 전체를 사용
-
-**범위를 지정하지 않은 경우**, 모드 선택부터 안내한다.
-
-## Configuration
-
-### 기출 폴더 (필수, 두 모드 공통)
-
-| 항목 | 설명 | 기본값 |
-|------|------|--------|
-| 기출 폴더 | 기출 시험 PDF가 있는 폴더 | 사용자에게 물어본다 |
-
-### 교과서 폴더 (교과서 모드에서만 필수)
-
-| 항목 | 설명 | 기본값 |
-|------|------|--------|
-| 교과서 폴더 | 교과서 단원별 PDF가 있는 폴더 | 사용자에게 물어본다 |
-
-경로가 확인되면 `exam-analyzer/config.json`에 저장하여 이후 재사용한다.
-
-```json
-{
-  "textbookDir": "C:\\Users\\...\\교과서",
-  "examDir": "C:\\Users\\...\\기출"
-}
-```
-
-자연어 모드에서는 `textbookDir`이 없어도 된다. `examDir`만 있으면 동작한다.
-
-```json
-{
-  "examDir": "C:\\Users\\...\\기출"
-}
-```
-
-## Workflow
-
-### Step 0: 모드 판별 및 분기
-
-1. 사용자 입력에서 모드를 판별한다:
-   - `기출 분할`, `문항 분할`, `시험지 분할` → **분할 모드** (Step 0-S로 분기)
-   - 그 외 → **분석 모드** (Step 0-A로 진행)
-
-#### Step 0-S: 분할 모드 실행
-
-1. 사용자가 지정한 파일 또는 폴더 경로를 확인한다.
-2. 출력 폴더를 결정한다:
-   - 사용자가 지정하면 그대로 사용
-   - 지정하지 않으면 입력 경로의 상위에 `분할/` 폴더 생성
-3. `crop_questions.py --split` 스크립트를 실행한다.
-4. 결과를 보고하고 **여기서 종료**한다 (Step 1~6 불필요).
-
-#### Step 0-A: 분석 모드 설정 확인
-
-1. `exam-analyzer/config.json` 파일이 있으면 읽어서 경로를 로드한다.
-2. 사용자 입력을 분석하여 **분석 모드를 세분화**한다:
-   - 단원 번호, 파일 경로, 또는 config에 `textbookDir`이 있고 교과서 파일명과 매칭되는 키워드 → **교과서 모드**
-   - 그 외 자연어 주제 → **자연어 모드**
-3. **교과서 모드**: `textbookDir`과 `examDir`이 모두 필요하다. 없으면 물어본다.
-4. **자연어 모드**: `examDir`만 필요하다. 없으면 물어본다. 교과서 폴더는 묻지 않는다.
-
-### Step 1: 키워드 추출
-
-#### 교과서 모드
-
-1. 사용자가 지정한 범위로 교과서 PDF 파일을 찾는다.
-2. PyMuPDF(`fitz`)로 교과서 PDF 전체 페이지의 텍스트를 추출한다.
-3. 텍스트에서 핵심 키워드를 추출한다:
-   - 굵은 글씨, 반복 등장 용어
-   - 고유명사 (문화명, 인물명, 지명, 제도명, 공식명, 법칙명 등)
-   - "핵심어", "미리 보는", "학습 목표" 등 교과서의 메타 표시 주변 텍스트
-4. 추출한 키워드 목록을 사용자에게 보여주고 확인/수정 기회를 준다.
-
-#### 자연어 모드
-
-1. 사용자가 지정한 주제를 분석한다.
-2. 해당 주제에 대한 **교과 과정 수준의 키워드**를 Claude의 지식으로 생성한다:
-   - 과목을 먼저 식별한다 (한국사, 동아시아사, 수학Ⅱ, 물리학Ⅰ 등)
-   - 해당 과목 교육과정에서 다루는 핵심 개념, 용어, 인물, 사건 등을 나열한다
-   - 수능/모평에서 자주 출제되는 제시어와 선지 키워드를 포함한다
-3. 생성한 키워드 목록을 사용자에게 보여주고 확인/수정 기회를 준다.
-   - 이 단계가 중요하다: Claude의 지식이 교과서 범위와 다를 수 있으므로 반드시 확인받는다.
-
-### Step 2: 기출 PDF 텍스트 추출 (2패스)
-
-#### 패스 1: Python 스크립트로 텍스트 추출 + 이미지 문항 감지
-
-아래 Python 스크립트를 **임시 파일로 작성하여 실행**한다. 스크립트는 모든 기출 PDF를 순회하며:
-- 시험명을 식별하고
-- 문항별 텍스트를 추출하되 **발문+제시문**과 **개별 선지 텍스트**를 분리 저장하고
-- 텍스트가 50자 미만인 문항은 해당 페이지를 이미지(PNG)로 저장하여
-- 결과를 JSON으로 출력한다.
-
-```python
-import fitz, json, sys, os, re
-sys.stdout.reconfigure(encoding='utf-8')
-
-CHOICE_MARKERS = ['①', '②', '③', '④', '⑤']
-TEXT_THRESHOLD = 50  # 이 미만이면 이미지 제시문으로 간주
-
-def extract_stem_and_choices(text):
-    """발문+제시문과 개별 선지를 분리 추출"""
-    choices = {}
-    marker_positions = []
-    for i, m in enumerate(CHOICE_MARKERS):
-        idx = text.find(m)
-        if idx >= 0:
-            marker_positions.append((idx, i + 1, m))
-    marker_positions.sort(key=lambda x: x[0])
-    # stem = 첫 번째 선지 마커 이전 텍스트
-    stem_end = marker_positions[0][0] if marker_positions else len(text)
-    stem = text[:stem_end].strip()
-    # 각 선지 텍스트 추출
-    for j, (pos, num, marker) in enumerate(marker_positions):
-        start = pos + len(marker)
-        end = marker_positions[j + 1][0] if j + 1 < len(marker_positions) else len(text)
-        choices[num] = text[start:end].strip()
-    return stem, choices
-
-def detect_exam_name(doc):
-    """첫 페이지에서 시험명 식별"""
-    text = doc[0].get_text()
-    year_m = re.search(r'(\d{4})\s*학년도', text)
-    year = year_m.group(1) if year_m else 'unknown'
-    if '대학수학능력시험' in text and '모의평가' not in text:
-        return f'{year}_수능'
-    if '6월' in text and '모의평가' in text:
-        return f'{year}_6월모평'
-    if '9월' in text and '모의평가' in text:
-        return f'{year}_9월모평'
-    month_m = re.search(r'(\d{1,2})월', text)
-    month = month_m.group(1) if month_m else ''
-    if '학력평가' in text or '전국연합' in text:
-        return f'{year}_{month}월학평'
-    return f'{year}_기출'
-
-def split_questions(doc):
-    """문항 번호 기준으로 텍스트 분리, 발문과 선지를 분리 추출"""
-    questions = {}
-    for page_num in range(len(doc)):
-        page = doc[page_num]
-        for q_num in range(1, 51):
-            hits = page.search_for(f"{q_num}.")
-            if not hits:
-                continue
-            if q_num in questions:
-                continue
-            full_text = page.get_text()
-            pattern_start = f'{q_num}.'
-            start_idx = full_text.find(pattern_start)
-            if start_idx < 0:
-                continue
-            next_pattern = f'{q_num + 1}.'
-            end_idx = full_text.find(next_pattern, start_idx + len(pattern_start))
-            if end_idx < 0:
-                q_text = full_text[start_idx:]
-            else:
-                q_text = full_text[start_idx:end_idx]
-            stem_text, choices = extract_stem_and_choices(q_text)
-            questions[q_num] = {
-                'page': page_num,
-                'stem_text': stem_text,
-                'choices': choices,
-                'needs_vision': len(stem_text) < TEXT_THRESHOLD
-            }
-    return questions
-
-def main(exam_dir, output_json, vision_img_dir):
-    os.makedirs(vision_img_dir, exist_ok=True)
-    results = []
-    for fname in sorted(os.listdir(exam_dir)):
-        if not fname.lower().endswith('.pdf'):
-            continue
-        # 정답지 파일(_정답.png)은 건너뛴다
-        if '_정답' in fname:
-            continue
-        path = os.path.join(exam_dir, fname)
-        doc = fitz.open(path)
-        exam_name = detect_exam_name(doc)
-        questions = split_questions(doc)
-        exam_entry = {
-            'file': fname,
-            'exam_name': exam_name,
-            'questions': {}
-        }
-        for q_num, q_data in sorted(questions.items()):
-            entry = {
-                'page': q_data['page'],
-                'stem_text': q_data['stem_text'],
-                'choices': q_data['choices'],
-                'needs_vision': q_data['needs_vision'],
-                'vision_image': None
-            }
-            if q_data['needs_vision']:
-                page = doc[q_data['page']]
-                pix = page.get_pixmap(dpi=200)
-                img_name = f"{exam_name}_p{q_data['page']}_Q{q_num:02d}.png"
-                img_path = os.path.join(vision_img_dir, img_name)
-                pix.save(img_path)
-                entry['vision_image'] = img_path
-            exam_entry['questions'][str(q_num)] = entry
-        results.append(exam_entry)
-        doc.close()
-    with open(output_json, 'w', encoding='utf-8') as f:
-        json.dump(results, f, ensure_ascii=False, indent=2)
-    # 요약 출력
-    total_q = sum(len(e['questions']) for e in results)
-    vision_q = sum(1 for e in results for q in e['questions'].values() if q['needs_vision'])
-    print(f"완료: {len(results)}개 시험, {total_q}개 문항, Vision 필요 {vision_q}개")
-
-if __name__ == '__main__':
-    main(sys.argv[1], sys.argv[2], sys.argv[3])
-```
-
-**실행:**
-```bash
-python /tmp/extract_exam_text.py "<기출폴더>" "/tmp/exam_extracted.json" "/tmp/vision_images/"
-```
-
-#### 패스 1.5: 정답지 읽기 (Claude Read 도구)
-
-기출 폴더에서 **`{시험명}_정답.png`** 파일을 찾아 정답 번호를 추출한다.
-
-1. 기출 폴더 내 `_정답.png` 파일을 모두 찾는다.
-   - 파일명 규칙: `{시험명}_정답.png` (예: `2025_수능_정답.png` ↔ `2025_수능.pdf`)
-   - 연도별 하위 폴더도 탐색한다.
-2. 각 정답지 이미지를 **Read 도구**로 읽어서 문항별 정답 번호를 추출한다.
-   - 정답지 형식: 테이블에 문항 번호와 원문자(①~⑤)로 정답 표기
-3. 추출 결과를 시험명 기준으로 매핑한다:
-   ```json
-   {
-     "2025_수능": {1: 5, 2: 2, 3: 1, ...},
-     "2025_9월모평": {1: 3, 2: 4, ...}
-   }
-   ```
-4. JSON의 각 문항에 `correct_answer` (정답 번호)와 `correct_choice_text` (정답 선지 텍스트)를 추가한다.
-   - `correct_choice_text` = `choices[correct_answer]`
-   - 정답지가 없는 시험은 `correct_answer: null`로 표기하고, 매칭 시 `stem_text`만 사용한다.
-
-#### 패스 2: Vision 분석 (Claude Read 도구)
-
-1. `/tmp/exam_extracted.json`을 읽는다.
-2. `needs_vision: true`인 문항을 찾는다.
-3. 각 문항의 `vision_image` 경로를 **Read 도구**로 읽어서 이미지 속 제시문 내용을 텍스트로 파악한다.
-   - Read 도구로 이미지를 읽을 때 프롬프트: "이 시험 문항의 제시문(지문, 자료, 그림 등) 내용을 텍스트로 추출해줘. 선지(①~⑤)는 제외."
-4. 파악한 텍스트를 해당 문항의 `vision_text` 필드에 추가하여 JSON을 업데이트한다.
-5. Vision 분석이 끝나면 `/tmp/vision_images/` 폴더를 삭제한다.
-
-### Step 3: 관련 문항 매칭
-
-1. Step 1의 키워드 목록과 Step 2의 JSON 데이터를 대조한다.
-2. **키워드 매칭 대상**: 각 문항에서 아래 텍스트를 결합하여 사용한다:
-   - `stem_text` (발문 + 제시문) — **항상 사용**
-   - `correct_choice_text` (정답 선지 텍스트) — **정답지가 있을 때 추가**
-   - `vision_text` (이미지 제시문) — **Vision 분석이 된 문항만 추가**
-   - ⚠️ **오답 선지(choices에서 정답 제외한 나머지)는 절대 매칭에 포함하지 않는다.**
-3. 키워드가 2개 이상 포함된 문항을 "관련 문항"으로 판정한다.
-4. Vision으로만 판별된 문항에는 `(이미지 제시문)` 표시를 붙인다.
-5. 정답 선지 키워드로만 매칭된 문항에는 `(선지)` 표시를 붙인다.
-6. 매칭 결과를 시험별로 정리한다.
-
-### Step 4: 분석표 생성
-
-아래 구조로 마크다운 문서를 생성한다:
-
-```markdown
-# [주제명] 기출 분석
-
-> 분석 주제: **[대주제] > [소주제]**
-> 분석 모드: [교과서 모드 / 자연어 모드]
-> 분석 범위: [시험 목록]
-
----
-
-## 1. 시험별 출제 현황
-(시험명, 시행일, 문항번호, 핵심 제시어)
-
-## 2. 출제 패턴 분석
-(문제 유형 분류, 출제 빈도)
-
-## 3. 키워드별 핵심 정리
-(시험에 등장한 키워드 기준으로, 각 개념의 핵심 내용 정리)
-
-## 4. 시험장에서 바로 쓰는 판별 체크리스트
-(키워드 → 개념 → 연관 정보 즉시 연결 테이블)
-
-## 5. 출제 경향 요약
-(패턴, 주의점, 학습 전략)
-```
-
-### Step 5: 분석표 저장
-
-- **교과서 모드**: 교과서 폴더의 상위 디렉토리에 저장한다.
-- **자연어 모드**: 기출 폴더의 상위 디렉토리에 `기출분석/` 폴더를 만들어 저장한다.
-- 파일명: `[주제명]_기출분석.md`
-- 저장 경로를 사용자에게 알려준다.
-
-### Step 6: 관련 문항 스크린샷 저장
-
-분석에서 매칭된 각 문항을 PDF에서 개별 크롭하여 WebP로 저장한다.
-
-1. 매칭된 문항 정보를 JSON 파일로 작성한다:
-```json
-[
-  {
-    "file": "exam_filename.pdf",
-    "exam_name": "2025_3월학평",
-    "questions": [{"q": 2, "page": 0}, {"q": 5, "page": 0}]
-  }
-]
-```
-2. `exam-analyzer/scripts/crop_questions.py` 스크립트를 실행한다:
-```bash
-python "<스킬경로>/scripts/crop_questions.py" "<기출폴더>" "<출력폴더>" "<questions.json>"
-```
-3. 출력 폴더:
-   - **교과서 모드**: 교과서 폴더의 상위 디렉토리에 `[단원번호]_기출_스크린샷/`
-   - **자연어 모드**: 기출 폴더의 상위 디렉토리에 `기출분석/[주제명]_스크린샷/`
-4. 파일명: `{시험명}_Q{번호:02d}.webp`
-5. 저장 완료 후 파일 목록과 경로를 사용자에게 알려준다.
-
-**page 인덱스 결정 방법**: 문항 번호로부터 페이지를 추정할 필요 없음.
-스크립트가 각 페이지에서 `search_for("N.")`으로 문항을 직접 검색하므로,
-모든 페이지(0부터 끝까지)를 대상으로 해당 문항 번호가 있는 페이지를 찾으면 된다.
-확실하지 않으면 page를 -1로 지정하고, 스크립트가 전 페이지를 순회한다.
-
-## Workflow Simulation
-
-### 예제 A: 자연어 모드 (교과서 PDF 없음, 첫 실행)
-
-```
-👤 사용자: 기출 분석 조선 전기 정치
-
-🤖 Claude: 기출 폴더 경로를 알려주세요. (기출 시험 PDF가 모여 있는 폴더)
-
-👤 사용자: D:\수능\한국사 기출
-
-🤖 Claude: 확인했습니다. 기출 폴더에 PDF 8개를 찾았습니다:
-   - 2026학년도 수능 한국사.pdf
-   - 2026학년도 6월 모평 한국사.pdf
-   - 2025학년도 수능 한국사.pdf
-   - ... (5개 더)
-
-   교과서 PDF 폴더도 있으신가요?
-   없으면 제가 주제 키워드를 직접 생성해서 분석할 수 있습니다.
-
-👤 사용자: 교과서는 없어
-
-🤖 Claude: 알겠습니다. "조선 전기 정치" 주제로 키워드를 생성했습니다:
-
-   **과목**: 한국사
-   **키워드 (23개)**:
-   태조, 정도전, 6조직계제, 태종, 의정부서사제, 세종, 집현전,
-   훈민정음, 경국대전, 직전법, 과전법, 의정부, 6조, 승정원,
-   사헌부, 사간원, 홍문관, 3사, 언론 기능, 성종, 세조,
-   단종, 왕자의 난
-
-   키워드를 수정하거나 추가하고 싶으신 게 있나요?
-   (없으면 이대로 진행합니다)
-
-👤 사용자: 관수관 추가하고 진행해
-
-🤖 Claude: 관수관(觀水觀) 추가했습니다. 총 24개 키워드로 기출 매칭을 시작합니다.
-
-   ...기출 PDF 8개 분석 중...
-
-   [매칭 결과]
-   8개 시험에서 총 12문항이 매칭되었습니다:
-   - 2026 수능 3번: 6조직계제 vs 의정부서사제 비교
-   - 2026 6모 2번: 세종의 업적 (집현전, 훈민정음)
-   - 2025 수능 4번: 경국대전 반포 시기 순서
-   - ...
-
-   분석표를 생성하고 문항 스크린샷을 크롭하겠습니다.
-
-🤖 Claude: 완료! 저장 위치:
-   - 분석표: D:\수능\기출분석\조선_전기_정치_기출분석.md
-   - 스크린샷: D:\수능\기출분석\조선_전기_정치_스크린샷\ (12개 파일)
-```
-
-### 예제 B: 교과서 모드 (교과서 PDF 있음, config 설정 완료)
-
-```
-👤 사용자: 기출 분석 03
-
-🤖 Claude: config.json 확인 — 교과서 폴더: D:\교과서\한국사\
-   "03. 고려의 성립과 변천.pdf" 를 찾았습니다.
-
-   교과서에서 키워드를 추출합니다...
-
-   **키워드 (31개)**:
-   왕건, 호족, 태조, 훈요 10조, 광종, 과거제, 노비안검법,
-   성종, 최승로, 시무 28조, 중앙 관제, 2성 6부, 중서문하성,
-   ...
-
-   키워드를 수정하거나 추가하고 싶으신 게 있나요?
-
-👤 사용자: ㅇㅇ 진행
-
-🤖 Claude: 기출 PDF 8개에서 매칭 시작...
-   ...
-```
-
-### 예제 C: 자연어 모드 (수학 과목)
-
-```
-👤 사용자: 기출 분석 삼각함수의 활용
-
-🤖 Claude: 기출 폴더를 확인합니다.
-   config.json에 기출 폴더가 저장되어 있습니다: D:\수능\수학 기출
-
-   "삼각함수의 활용" 주제로 키워드를 생성했습니다:
-
-   **과목**: 수학Ⅰ
-   **키워드 (18개)**:
-   사인법칙, 코사인법칙, 삼각형의 넓이, 외접원,
-   sin, cos, tan, 삼각함수 그래프, 주기, 진폭,
-   최댓값, 최솟값, 삼각방정식, 삼각부등식,
-   호도법, 부채꼴, 각의 변환, 일반각
-
-   수정할 부분 있나요?
-
-👤 사용자: 없어 고고
-
-🤖 Claude: 기출 PDF 12개에서 매칭 시작...
-   ...
-```
-
-### 예제 D: 모드 선택 안내 (범위 미지정)
-
-```
-👤 사용자: 기출 분석
-
-🤖 Claude: 분석할 범위를 알려주세요. 두 가지 방법이 있습니다:
-
-   📚 **교과서가 있다면** — 단원 번호나 파일 경로를 알려주세요:
-      예) 기출 분석 02
-      예) 기출 분석 "D:\교과서\02. 선사 문화.pdf"
-
-   💬 **교과서 없이도 가능** — 주제를 자연어로 알려주세요:
-      예) 기출 분석 조선 전기 정치
-      예) 기출 분석 삼각함수의 활용
-      예) 기출 분석 전자기 유도
-
-👤 사용자: 고려 경제 생활
-
-🤖 Claude: "고려 경제 생활" 주제로 자연어 모드로 진행합니다.
-   기출 폴더 경로를 알려주세요.
-   ...
-```
-
-## Technical Notes
-
-### PDF 텍스트 추출
-
-```python
-import fitz, sys
-sys.stdout.reconfigure(encoding='utf-8')  # Windows 한글 깨짐 방지
-
-doc = fitz.open(path)
-text = doc[page_num].get_text()
-```
-
-- PyMuPDF(`fitz`)가 설치되어 있지 않으면 `pip install pymupdf`로 설치한다.
-- 텍스트 추출 시 반드시 `sys.stdout.reconfigure(encoding='utf-8')`을 사용한다.
-
-### 이미지 기반 제시문 처리 (Vision 2패스 구조)
-
-Step 2의 패스 1 스크립트가 선지 제거 + 이미지 문항 감지 + 페이지 이미지 저장을 자동 처리한다.
-패스 2에서 Claude가 Read 도구로 저장된 이미지를 분석하여 텍스트를 보완한다.
-
-- **선지 제거**: `strip_choices()` — 선지 마커(①②③④⑤) 이전 텍스트만 추출
-- **이미지 감지**: `stem_text` 50자 미만 → `needs_vision: true` + 페이지 PNG 저장
-- **Vision 분석**: Claude Read 도구로 PNG를 읽어 제시문 내용을 텍스트화
-
-상세 스크립트는 Step 2 패스 1 참조.
-
-**이미지 기반 PDF 처리 (페이지 전체 부실한 경우)**
-
-페이지 전체 텍스트가 부실한 경우(스캔본 등):
-
-```python
-pix = page.get_pixmap(dpi=200)
-pix.save(output_path)
-```
-
-### 시험 유형 식별 패턴
-
-| 텍스트 패턴 | 시험 유형 |
-|------------|----------|
-| `대학수학능력시험 문제지` (6월/9월 없음) | 수능 |
-| `대학수학능력시험 6월 모의평가` | 6월 모평 (평가원) |
-| `대학수학능력시험 9월 모의평가` | 9월 모평 (평가원) |
-| `전국연합학력평가` + 월 | 교육청 모의고사 |
-| `고3` + `사회탐구영역` / `과학탐구영역` / `국어영역` 등 | 교육청 모의고사 |
-
-### 문항 스크린샷 크롭 알고리즘
-
-스크립트: `exam-analyzer/scripts/crop_questions.py`
-
-**의존성:** `pip install pymupdf pillow numpy`
-
-**알고리즘:**
-1. `page.search_for("N.")` 로 문항 번호 좌표 검색 → 좌/우 컬럼 판별
-2. 같은 컬럼의 다음 문항 또는 마지막 선지(⑤) 위치로 y 범위 결정
-3. 세로 과목 라벨(동아시아사, 물리학Ⅰ 등)을 동적 감지하여 x 범위에서 제외
-4. 200dpi 렌더링 → numpy threshold(< 250)로 흰 여백 트리밍
-5. 사방 균일 8px 안전 패딩 추가 후 WebP quality=88 저장
-
-**대응하는 시험지 레이아웃:**
-- 평가원(수능/6월모평/9월모평): 2단 컬럼
-- 교육청(학력평가): 2단 컬럼
-- 문항 수 무관 (20문항 사탐/과탐, 30문항 수학, 45문항 국어 등 모두 대응)
-
-## Commands
-
-| 사용자 입력 | 모드 | 동작 |
-|---|---|---|
-| `"기출 분할 [파일경로]"` | 분할 | 해당 PDF의 모든 문항을 개별 이미지로 크롭 |
-| `"기출 분할 [폴더경로]"` | 분할 | 폴더 내 모든 PDF를 문항별로 분할 |
-| `"문항 분할 [경로]"` / `"시험지 분할 [경로]"` | 분할 | 위와 동일 (별칭) |
-| `"기출 분석 02"` / `"02번 기출 정리"` | 교과서 | 단원 02 전체로 기출 분석 |
-| `"기출 분석 03 p1-3"` | 교과서 | 단원 03의 1~3페이지만으로 기출 분석 |
-| `"기출 분석 선사 문화"` | 교과서 | 교과서 파일명에서 키워드 매칭 |
-| `"기출 분석 [파일경로]"` | 교과서 | 해당 파일을 교과서로 사용 |
-| `"기출 분석 [파일경로] p4-6"` | 교과서 | 해당 파일의 특정 페이지로 기출 분석 |
-| `"기출 분석 조선 전기 정치"` | 자연어 | Claude 지식으로 키워드 생성 후 분석 |
-| `"기출 분석 삼각함수의 활용"` | 자연어 | Claude 지식으로 키워드 생성 후 분석 |
-| `"기출 분석"` (범위 없음) | — | 모드 선택 안내 표시 |
-
-## Notes
-
-- 한 번에 하나의 주제만 분석한다.
-- 기출 폴더에 여러 학년도가 섞여 있어도 시험명으로 자동 분류한다.
-- 분석 결과의 "정답"은 추론이므로, 공식 정답과 다를 수 있음을 명시한다.
-- 이미지 기반 문항은 `(이미지 기반)` 표시를 붙여 텍스트 분석의 한계를 명시한다.
-- 크롭 스크립트 실행 전 `pymupdf`, `pillow`, `numpy`가 설치되어 있는지 확인하고, 없으면 자동 설치한다.
-- **자연어 모드 주의사항**: Claude의 키워드가 실제 교과서 범위와 다를 수 있다. 반드시 키워드 확인 단계에서 사용자 검토를 거친다.
+---
+name: exam-analyzer
+description: "수능/모평/학평 기출 PDF를 분석하거나, 기출 PDF에서 개별 문항을 이미지로 크롭합니다. 교과서 PDF가 있으면 자동 키워드 추출, 없으면 자연어로 범위를 지정할 수 있습니다. 모든 수능 과목(국어, 수학, 영어, 사탐, 과탐, 한국사 등)에 대응합니다. Use when: (1) 기출 분석, (2) 기출 정리, (3) 단원별 기출, (4) 시험 분석, (5) 기출 캡쳐, (6) 문제 캡쳐, (7) 문항 크롭, (8) 기출 스크린샷이 필요할 때. 트리거: '기출문제 캡쳐', '문제 잘라줘', '문항 크롭', '기출 스크린샷'."
+allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
+---
+
+# Exam Analyzer (수능 기출 분석기)
+
+## Overview
+
+수능/모평/학평 기출 PDF를 분석하여
+관련 문항을 찾아내고, 학생의 학습에 도움이 되는 형태로 정리한다.
+
+**두 가지 모드**를 지원한다:
+- **교과서 모드**: 교과서 단원 PDF에서 키워드를 자동 추출하여 기출 매칭 (정밀)
+- **자연어 모드**: 교과서 PDF 없이, 사용자가 주제/범위를 자연어로 지정 (간편)
+
+모든 수능 과목(국어, 수학, 영어, 사회탐구, 과학탐구, 한국사 등)에 대응한다.
+
+## Role
+
+당신은 대한민국 수능 기출 분석 전문가이다.
+교과서 내용 또는 사용자가 지정한 주제를 기반으로 기출 문항을 매칭하고,
+출제 패턴과 키워드를 체계적으로 정리하는 것이 임무이다.
+
+## Input: 범위 지정 방식
+
+사용자는 다음 방식 중 하나로 범위를 지정한다:
+
+### 방식 1: 단원 번호 (교과서 모드)
+```
+기출 분석 02
+```
+→ 교과서 폴더에서 `02`가 포함된 파일을 자동 매칭
+
+### 방식 2: 키워드로 교과서 매칭 (교과서 모드)
+```
+기출 분석 선사 문화
+기출 분석 미적분
+```
+→ 교과서 파일명에서 키워드 검색
+
+### 방식 3: 파일 경로 직접 지정 (교과서 모드)
+```
+기출 분석 "C:\...\02. 선사 문화.pdf"
+```
+→ 파일 경로 뒤에도 페이지 옵션 사용 가능: `기출 분석 "경로" p1-3`
+
+### 방식 4: 자연어로 주제 지정 (자연어 모드)
+```
+기출 분석 조선 전기 정치
+기출 분석 삼각함수의 활용
+기출 분석 전자기 유도와 상호 유도
+```
+→ 교과서 PDF 없이 사용 가능
+→ Claude가 해당 주제의 교과 지식을 활용하여 키워드를 생성
+
+### 페이지 범위 옵션 (교과서 모드에서만, 선택)
+
+단원 내 특정 부분만 분석하고 싶을 때 `p시작-끝`을 추가한다:
+```
+기출 분석 03 p1-3
+기출 분석 03 p4-6
+```
+→ 해당 페이지에서만 키워드를 추출하여 기출 매칭
+→ 내용이 많은 단원을 소주제별로 쪼개 분석할 때 유용
+→ 페이지 옵션이 없으면 단원 전체를 사용
+
+**범위를 지정하지 않은 경우**, 모드 선택부터 안내한다.
+
+## Configuration
+
+### 기출 폴더 (필수, 두 모드 공통)
+
+| 항목 | 설명 | 기본값 |
+|------|------|--------|
+| 기출 폴더 | 기출 시험 PDF가 있는 폴더 | 사용자에게 물어본다 |
+
+### 교과서 폴더 (교과서 모드에서만 필수)
+
+| 항목 | 설명 | 기본값 |
+|------|------|--------|
+| 교과서 폴더 | 교과서 단원별 PDF가 있는 폴더 | 사용자에게 물어본다 |
+
+경로가 확인되면 `exam-analyzer/config.json`에 저장하여 이후 재사용한다.
+
+```json
+{
+  "textbookDir": "C:\\Users\\...\\교과서",
+  "examDir": "C:\\Users\\...\\기출"
+}
+```
+
+자연어 모드에서는 `textbookDir`이 없어도 된다. `examDir`만 있으면 동작한다.
+
+```json
+{
+  "examDir": "C:\\Users\\...\\기출"
+}
+```
+
+## Workflow
+
+### Step 0: 모드 판별 및 설정 확인
+
+1. `exam-analyzer/config.json` 파일이 있으면 읽어서 경로를 로드한다.
+2. 사용자 입력을 분석하여 **모드를 자동 판별**한다:
+   - 단원 번호, 파일 경로, 또는 config에 `textbookDir`이 있고 교과서 파일명과 매칭되는 키워드 → **교과서 모드**
+   - 그 외 자연어 주제 → **자연어 모드**
+3. **교과서 모드**: `textbookDir`과 `examDir`이 모두 필요하다. 없으면 물어본다.
+4. **자연어 모드**: `examDir`만 필요하다. 없으면 물어본다. 교과서 폴더는 묻지 않는다.
+
+### Step 1: 키워드 추출
+
+#### 교과서 모드
+
+1. 사용자가 지정한 범위로 교과서 PDF 파일을 찾는다.
+2. PyMuPDF(`fitz`)로 교과서 PDF 전체 페이지의 텍스트를 추출한다.
+3. 텍스트에서 핵심 키워드를 추출한다:
+   - 굵은 글씨, 반복 등장 용어
+   - 고유명사 (문화명, 인물명, 지명, 제도명, 공식명, 법칙명 등)
+   - "핵심어", "미리 보는", "학습 목표" 등 교과서의 메타 표시 주변 텍스트
+4. 추출한 키워드 목록을 사용자에게 보여주고 확인/수정 기회를 준다.
+
+#### 자연어 모드
+
+1. 사용자가 지정한 주제를 분석한다.
+2. 해당 주제에 대한 **교과 과정 수준의 키워드**를 Claude의 지식으로 생성한다:
+   - 과목을 먼저 식별한다 (한국사, 동아시아사, 수학Ⅱ, 물리학Ⅰ 등)
+   - 해당 과목 교육과정에서 다루는 핵심 개념, 용어, 인물, 사건 등을 나열한다
+   - 수능/모평에서 자주 출제되는 제시어와 선지 키워드를 포함한다
+3. 생성한 키워드 목록을 사용자에게 보여주고 확인/수정 기회를 준다.
+   - 이 단계가 중요하다: Claude의 지식이 교과서 범위와 다를 수 있으므로 반드시 확인받는다.
+
+### Step 2: 기출 PDF 텍스트 추출
+
+1. 기출 폴더의 모든 PDF 파일을 나열한다.
+2. 각 PDF에서:
+   - PyMuPDF로 텍스트 추출을 시도한다.
+   - **첫 페이지 상단**에서 시험명(학년도, 월, 시험 유형)을 식별한다.
+   - 텍스트가 부실한 경우(이미지 기반 PDF), 페이지를 이미지로 변환하여 Read 도구로 분석한다.
+3. 각 시험지의 문항을 번호 기준으로 분리한다.
+
+### Step 3: 관련 문항 매칭
+
+1. Step 1의 키워드 목록과 Step 2의 문항 텍스트를 대조한다.
+2. 키워드가 2개 이상 포함된 문항을 "관련 문항"으로 판정한다.
+3. 텍스트 매칭이 안 되는 문항(이미지 기반)은 이미지 분석으로 보완한다.
+4. 매칭 결과를 시험별로 정리한다.
+
+### Step 4: 분석표 생성
+
+아래 구조로 마크다운 문서를 생성한다:
+
+```markdown
+# [주제명] 기출 분석
+
+> 분석 주제: **[대주제] > [소주제]**
+> 분석 모드: [교과서 모드 / 자연어 모드]
+> 분석 범위: [시험 목록]
+
+---
+
+## 1. 시험별 출제 현황
+(시험명, 시행일, 문항번호, 핵심 제시어, 묻는 것)
+
+## 2. 출제 패턴 분석
+(문제 유형 분류, 출제 빈도)
+
+## 3. 키워드별 핵심 정리
+(시험에 등장한 키워드 기준으로, 각 개념의 핵심 내용 정리)
+
+## 4. 시험장에서 바로 쓰는 판별 체크리스트
+(키워드 → 개념 → 연관 정보 즉시 연결 테이블)
+
+## 5. 출제 경향 요약
+(패턴, 주의점, 학습 전략)
+```
+
+### Step 5: 분석표 저장
+
+- **교과서 모드**: 교과서 폴더의 상위 디렉토리에 저장한다.
+- **자연어 모드**: 기출 폴더의 상위 디렉토리에 `기출분석/` 폴더를 만들어 저장한다.
+- 파일명: `[주제명]_기출분석.md`
+- 저장 경로를 사용자에게 알려준다.
+
+### Step 6: 관련 문항 스크린샷 저장
+
+분석에서 매칭된 각 문항을 PDF에서 개별 크롭하여 WebP로 저장한다.
+
+1. 매칭된 문항 정보를 JSON 파일로 작성한다:
+```json
+[
+  {
+    "file": "exam_filename.pdf",
+    "exam_name": "2025_3월학평",
+    "questions": [{"q": 2, "page": 0}, {"q": 5, "page": 0}]
+  }
+]
+```
+2. `exam-analyzer/scripts/crop_questions.py` 스크립트를 실행한다:
+```bash
+python "<스킬경로>/scripts/crop_questions.py" "<기출폴더>" "<출력폴더>" "<questions.json>"
+```
+3. 출력 폴더:
+   - **교과서 모드**: 교과서 폴더의 상위 디렉토리에 `[단원번호]_기출_스크린샷/`
+   - **자연어 모드**: 기출 폴더의 상위 디렉토리에 `기출분석/[주제명]_스크린샷/`
+4. 파일명: `{시험명}_Q{번호:02d}.webp`
+5. 저장 완료 후 파일 목록과 경로를 사용자에게 알려준다.
+
+**page 인덱스 결정 방법**: 문항 번호로부터 페이지를 추정할 필요 없음.
+스크립트가 각 페이지에서 `search_for("N.")`으로 문항을 직접 검색하므로,
+모든 페이지(0부터 끝까지)를 대상으로 해당 문항 번호가 있는 페이지를 찾으면 된다.
+확실하지 않으면 page를 -1로 지정하고, 스크립트가 전 페이지를 순회한다.
+
+## Workflow Simulation
+
+### 예제 A: 자연어 모드 (교과서 PDF 없음, 첫 실행)
+
+```
+👤 사용자: 기출 분석 조선 전기 정치
+
+🤖 Claude: 기출 폴더 경로를 알려주세요. (기출 시험 PDF가 모여 있는 폴더)
+
+👤 사용자: D:\수능\한국사 기출
+
+🤖 Claude: 확인했습니다. 기출 폴더에 PDF 8개를 찾았습니다:
+   - 2026학년도 수능 한국사.pdf
+   - 2026학년도 6월 모평 한국사.pdf
+   - 2025학년도 수능 한국사.pdf
+   - ... (5개 더)
+
+   교과서 PDF 폴더도 있으신가요?
+   없으면 제가 주제 키워드를 직접 생성해서 분석할 수 있습니다.
+
+👤 사용자: 교과서는 없어
+
+🤖 Claude: 알겠습니다. "조선 전기 정치" 주제로 키워드를 생성했습니다:
+
+   **과목**: 한국사
+   **키워드 (23개)**:
+   태조, 정도전, 6조직계제, 태종, 의정부서사제, 세종, 집현전,
+   훈민정음, 경국대전, 직전법, 과전법, 의정부, 6조, 승정원,
+   사헌부, 사간원, 홍문관, 3사, 언론 기능, 성종, 세조,
+   단종, 왕자의 난
+
+   키워드를 수정하거나 추가하고 싶으신 게 있나요?
+   (없으면 이대로 진행합니다)
+
+👤 사용자: 관수관 추가하고 진행해
+
+🤖 Claude: 관수관(觀水觀) 추가했습니다. 총 24개 키워드로 기출 매칭을 시작합니다.
+
+   ...기출 PDF 8개 분석 중...
+
+   [매칭 결과]
+   8개 시험에서 총 12문항이 매칭되었습니다:
+   - 2026 수능 3번: 6조직계제 vs 의정부서사제 비교
+   - 2026 6모 2번: 세종의 업적 (집현전, 훈민정음)
+   - 2025 수능 4번: 경국대전 반포 시기 순서
+   - ...
+
+   분석표를 생성하고 문항 스크린샷을 크롭하겠습니다.
+
+🤖 Claude: 완료! 저장 위치:
+   - 분석표: D:\수능\기출분석\조선_전기_정치_기출분석.md
+   - 스크린샷: D:\수능\기출분석\조선_전기_정치_스크린샷\ (12개 파일)
+```
+
+### 예제 B: 교과서 모드 (교과서 PDF 있음, config 설정 완료)
+
+```
+👤 사용자: 기출 분석 03
+
+🤖 Claude: config.json 확인 — 교과서 폴더: D:\교과서\한국사\
+   "03. 고려의 성립과 변천.pdf" 를 찾았습니다.
+
+   교과서에서 키워드를 추출합니다...
+
+   **키워드 (31개)**:
+   왕건, 호족, 태조, 훈요 10조, 광종, 과거제, 노비안검법,
+   성종, 최승로, 시무 28조, 중앙 관제, 2성 6부, 중서문하성,
+   ...
+
+   키워드를 수정하거나 추가하고 싶으신 게 있나요?
+
+👤 사용자: ㅇㅇ 진행
+
+🤖 Claude: 기출 PDF 8개에서 매칭 시작...
+   ...
+```
+
+### 예제 C: 자연어 모드 (수학 과목)
+
+```
+👤 사용자: 기출 분석 삼각함수의 활용
+
+🤖 Claude: 기출 폴더를 확인합니다.
+   config.json에 기출 폴더가 저장되어 있습니다: D:\수능\수학 기출
+
+   "삼각함수의 활용" 주제로 키워드를 생성했습니다:
+
+   **과목**: 수학Ⅰ
+   **키워드 (18개)**:
+   사인법칙, 코사인법칙, 삼각형의 넓이, 외접원,
+   sin, cos, tan, 삼각함수 그래프, 주기, 진폭,
+   최댓값, 최솟값, 삼각방정식, 삼각부등식,
+   호도법, 부채꼴, 각의 변환, 일반각
+
+   수정할 부분 있나요?
+
+👤 사용자: 없어 고고
+
+🤖 Claude: 기출 PDF 12개에서 매칭 시작...
+   ...
+```
+
+### 예제 D: 모드 선택 안내 (범위 미지정)
+
+```
+👤 사용자: 기출 분석
+
+🤖 Claude: 분석할 범위를 알려주세요. 두 가지 방법이 있습니다:
+
+   📚 **교과서가 있다면** — 단원 번호나 파일 경로를 알려주세요:
+      예) 기출 분석 02
+      예) 기출 분석 "D:\교과서\02. 선사 문화.pdf"
+
+   💬 **교과서 없이도 가능** — 주제를 자연어로 알려주세요:
+      예) 기출 분석 조선 전기 정치
+      예) 기출 분석 삼각함수의 활용
+      예) 기출 분석 전자기 유도
+
+👤 사용자: 고려 경제 생활
+
+🤖 Claude: "고려 경제 생활" 주제로 자연어 모드로 진행합니다.
+   기출 폴더 경로를 알려주세요.
+   ...
+```
+
+## Technical Notes
+
+### PDF 텍스트 추출
+
+```python
+import fitz, sys
+sys.stdout.reconfigure(encoding='utf-8')  # Windows 한글 깨짐 방지
+
+doc = fitz.open(path)
+text = doc[page_num].get_text()
+```
+
+- PyMuPDF(`fitz`)가 설치되어 있지 않으면 `pip install pymupdf`로 설치한다.
+- 텍스트 추출 시 반드시 `sys.stdout.reconfigure(encoding='utf-8')`을 사용한다.
+
+### 이미지 기반 PDF 처리
+
+텍스트 추출이 부실한 페이지는 이미지로 변환하여 Read 도구로 분석한다:
+
+```python
+pix = page.get_pixmap(dpi=200)
+pix.save(output_path)
+```
+
+### 시험 유형 식별 패턴
+
+| 텍스트 패턴 | 시험 유형 |
+|------------|----------|
+| `대학수학능력시험 문제지` (6월/9월 없음) | 수능 |
+| `대학수학능력시험 6월 모의평가` | 6월 모평 (평가원) |
+| `대학수학능력시험 9월 모의평가` | 9월 모평 (평가원) |
+| `전국연합학력평가` + 월 | 교육청 모의고사 |
+| `고3` + `사회탐구영역` / `과학탐구영역` / `국어영역` 등 | 교육청 모의고사 |
+
+### 문항 스크린샷 크롭 알고리즘
+
+스크립트: `exam-analyzer/scripts/crop_questions.py`
+
+**의존성:** `pip install pymupdf pillow numpy`
+
+**알고리즘:**
+1. `page.search_for("N.")` 로 문항 번호 좌표 검색 → 좌/우 컬럼 판별
+2. 같은 컬럼의 다음 문항 또는 마지막 선지(⑤) 위치로 y 범위 결정
+3. 콘텐츠 기반 하단 트리밍: 실제 내용 끝 + 12px 마진으로 조임
+4. 노이즈 필터링: 페이지 번호, "확인 사항" 안내문 자동 제거
+5. 세로 과목 라벨(동아시아사, 물리학Ⅰ 등)을 동적 감지하여 x 범위에서 제외
+6. 200dpi 렌더링 → numpy threshold(< 250)로 흰 여백 트리밍
+7. 사방 균일 8px 안전 패딩 추가 후 WebP quality=88 저장
+
+**대응하는 시험지 레이아웃:**
+- 평가원(수능/6월모평/9월모평): 2단 컬럼
+- 교육청(학력평가): 2단 컬럼
+- 문항 수 무관 (20문항 사탐/과탐, 30문항 수학, 45문항 국어 등 모두 대응)
+
+## Commands
+
+| 사용자 입력 | 모드 | 동작 |
+|---|---|---|
+| `"기출 분석 02"` / `"02번 기출 정리"` | 교과서 | 단원 02 전체로 기출 분석 |
+| `"기출 분석 03 p1-3"` | 교과서 | 단원 03의 1~3페이지만으로 기출 분석 |
+| `"기출 분석 선사 문화"` | 교과서 | 교과서 파일명에서 키워드 매칭 |
+| `"기출 분석 [파일경로]"` | 교과서 | 해당 파일을 교과서로 사용 |
+| `"기출 분석 [파일경로] p4-6"` | 교과서 | 해당 파일의 특정 페이지로 기출 분석 |
+| `"기출 분석 조선 전기 정치"` | 자연어 | Claude 지식으로 키워드 생성 후 분석 |
+| `"기출 분석 삼각함수의 활용"` | 자연어 | Claude 지식으로 키워드 생성 후 분석 |
+| `"기출 분석"` (범위 없음) | — | 모드 선택 안내 표시 |
+
+## Notes
+
+- 한 번에 하나의 주제만 분석한다.
+- 기출 폴더에 여러 학년도가 섞여 있어도 시험명으로 자동 분류한다.
+- 분석 결과의 "정답"은 추론이므로, 공식 정답과 다를 수 있음을 명시한다.
+- 이미지 기반 문항은 `(이미지 기반)` 표시를 붙여 텍스트 분석의 한계를 명시한다.
+- 크롭 스크립트 실행 전 `pymupdf`, `pillow`, `numpy`가 설치되어 있는지 확인하고, 없으면 자동 설치한다.
+- **자연어 모드 주의사항**: Claude의 키워드가 실제 교과서 범위와 다를 수 있다. 반드시 키워드 확인 단계에서 사용자 검토를 거친다.
```

================================================================
## maily-subscribe/SKILL.md
ours(2)=121줄 / theirs(3)=121줄
```diff
diff --git a/maily-subscribe/SKILL.md b/maily-subscribe/SKILL.md
index e5cc1ee..8c94347 100644
--- a/maily-subscribe/SKILL.md
+++ b/maily-subscribe/SKILL.md
@@ -1,121 +1,121 @@
----
-name: maily-subscribe
-description: "Maily 뉴스레터 구독자를 등록하고 그룹을 관리합니다. 이메일 정보를 형태 불문하고 파싱하여 Maily API로 등록하며, 그룹 지정 시 신규/기존 구독자 모두 그룹에 추가합니다. writer_memo 슬러그 처리 및 중복 구독자 무시를 지원합니다. Use when: (1) 뉴스레터 구독자 등록, (2) Maily 구독자 추가, (3) 구독자 그룹 관리가 필요할 때."
-allowed-tools: Bash(node *), Read, Write
----
-
-# Maily Subscribe
-
-## Overview
-
-사용자가 던지는 이메일 정보를 파싱하여 Maily API로 구독자를 등록하고, 필요 시 그룹에 추가한다.
-
-**런타임:** Node.js
-
-## Config
-
-**크리덴셜:** `~/.claude/secrets/maily-credentials.md`를 Read 도구로 읽어 `api_token`, `groups` 등을 확인한다.
-
-**config 예시:** `~/.claude/skills/maily-subscribe/config.example.json` 참조
-
-`groups`는 그룹 이름(한글 가능) → Maily ext_id 매핑이다.
-새 그룹이 생기면 Maily 대시보드 URL에서 ext_id를 확인하여 `~/.claude/secrets/maily-credentials.md`의 Groups 테이블에 추가한다.
-
-## Workflow
-
-Claude는 아래 순서를 **반드시** 따른다.
-
-### Step 1. Config 읽기
-
-`~/.claude/secrets/maily-credentials.md`를 읽어 `api_token`, `groups`를 로드한다.
-`api_base`는 `https://api.maily.so`, `newsletter_slug`는 `notiontalk`을 사용한다.
-
-### Step 2. 입력 파싱
-
-사용자가 던진 텍스트에서 구독자 정보와 그룹 지정 여부를 추출한다. 형태는 자유롭다:
-- 단순 이메일 목록
-- "이름 / 이메일" 형태
-- 표, JSON, 복붙한 스프레드시트 등 무엇이든
-
-각 구독자에서 추출할 필드:
-- `email` (필수)
-- `name` (선택)
-- `writer_memo` (선택) — 구독자의 특성/출처 메모
-
-그룹 지정 파악:
-- 사용자가 "XX 그룹에 추가", "XX 그룹으로" 등을 언급하면 그룹명 추출
-- config의 `groups`에서 해당 이름으로 ext_id를 찾는다
-- 그룹명이 config에 없으면 사용자에게 알리고 Maily 대시보드에서 ext_id 확인을 요청한다
-
-### Step 3. writer_memo 처리
-
-**`by-claude` 마킹 규칙 (필수):**
-Claude가 등록하는 모든 구독자의 `writer_memo`에는 반드시 `_by-claude` 접미사를 붙인다.
-- 메모가 없어서 기본값만 쓰는 경우: `"by-claude"`
-
-**메모가 있는 경우:** 한국어/자연어 메모를 영문 슬러그로 변환한 뒤 `_by-claude`를 붙인다.
-- 예: `"노션 강의 수강생"` → `"notion-class-student_by-claude"`
-- 예: `"유튜브 댓글 이벤트 당첨자"` → `"youtube-comment-winner_by-claude"`
-- 소문자, 하이픈 구분, 특수문자 제거
-
-**메모가 없는 경우:** 사용자에게 질문한다:
-```
-이 구독자들의 writer_memo를 무엇으로 설정할까요?
-(예: 출처, 경로, 특성 등. 슬러그로 변환 후 _by-claude가 자동으로 붙습니다)
-```
-답변을 받은 후 슬러그 변환 + `_by-claude` 접미사를 붙여 사용한다.
-
-### Step 4. API 호출 (scripts/subscribe.mjs 실행)
-
-```bash
-node "/mnt/c/Users/user/.claude/skills/maily-subscribe/scripts/subscribe.mjs" \
-  --config "/mnt/c/Users/user/.claude/skills/maily-subscribe/config.json" \
-  --data "<JSON 문자열>" \
-  [--group-id "<ext_id>"]
-```
-
-**스크립트 동작:**
-1. 구독자를 순차적으로 POST 등록
-   - 200 → 신규 등록 성공, 그룹 추가 대상
-   - 422 → 기존 구독자, 그룹 추가 대상 (등록 스킵)
-   - 429 → 1초 대기 후 최대 3회 재시도
-   - 기타 → 실패 목록에 기록, 그룹 추가 건너뜀
-2. `--group-id` 지정 시, 등록 성공 + 기존 구독자 **모두** 그룹에 추가
-   - 신규/기존 구분 없이 전원 그룹 추가 시도
-   - `marketing_agreement: true`, `marketing_agreed_at: 현재 시각` 항상 고정
-
-### Step 5. 결과 보고
-
-```
-✅ 신규 등록:      N명
-⏭️  기존 구독자:   N명
-❌ 등록 실패:      N명
-────────────────────────
-📌 그룹 추가 성공: N명
-📌 그룹 추가 실패: N명
-```
-
-## 그룹 ext_id 확인 방법
-
-Maily 대시보드 → 구독자 → 그룹 선택 → URL에서 마지막 path segment가 ext_id
-```
-https://maily.so/notiontalk/o/m/subscription_groups/{ext_id}
-```
-확인한 ext_id를 config.json의 `groups`에 추가한다.
-
-## Commands
-
-| 사용자 입력 | 동작 |
-|---|---|
-| 이메일 목록 붙여넣기 | 파싱 후 등록만 |
-| 이메일 목록 + "XX 그룹에 추가" | 등록 + 그룹 추가 |
-| "XX 그룹 추가해줘" + 이메일 목록 | 등록 + 그룹 추가 |
-| "새 그룹 등록해줘: 그룹명 / ext_id" | config.json groups에 추가 |
-
-## Notes
-
-- `marketing_agreement`는 항상 `true` 고정 (뉴스레터 등록 = 마케팅 동의)
-- `welcome_letter`는 기본값(`true`) 사용 — 등록 즉시 웰컴 메일 발송됨
-- 대량 등록 시 Rate Limit(초당 20회) 고려하여 스크립트가 자동 조절
-- `writer_memo`에는 항상 `_by-claude` 접미사 필수 — Claude가 등록한 구독자 추적용
-- 그룹 추가는 신규/기존 구독자 구분 없이 항상 시도 (기존 구독자도 그룹 추가 가능)
+---
+name: maily-subscribe
+description: "Maily 뉴스레터 구독자를 등록하고 그룹을 관리합니다. 이메일 정보를 형태 불문하고 파싱하여 Maily API로 등록하며, 그룹 지정 시 신규/기존 구독자 모두 그룹에 추가합니다. writer_memo 슬러그 처리 및 중복 구독자 무시를 지원합니다. Use when: (1) 뉴스레터 구독자 등록, (2) Maily 구독자 추가, (3) 구독자 그룹 관리가 필요할 때."
+allowed-tools: Bash(node *), Read, Write
+---
+
+# Maily Subscribe
+
+## Overview
+
+사용자가 던지는 이메일 정보를 파싱하여 Maily API로 구독자를 등록하고, 필요 시 그룹에 추가한다.
+
+**런타임:** Node.js
+
+## Config
+
+**크리덴셜:** `~/.claude/secrets/maily-credentials.md`를 Read 도구로 읽어 `api_token`, `groups` 등을 확인한다.
+
+**config 예시:** `~/.claude/skills/maily-subscribe/config.example.json` 참조
+
+`groups`는 그룹 이름(한글 가능) → Maily ext_id 매핑이다.
+새 그룹이 생기면 Maily 대시보드 URL에서 ext_id를 확인하여 `~/.claude/secrets/maily-credentials.md`의 Groups 테이블에 추가한다.
+
+## Workflow
+
+Claude는 아래 순서를 **반드시** 따른다.
+
+### Step 1. Config 읽기
+
+`~/.claude/secrets/maily-credentials.md`를 읽어 `api_token`, `groups`를 로드한다.
+`api_base`는 `https://api.maily.so`, `newsletter_slug`는 `notiontalk`을 사용한다.
+
+### Step 2. 입력 파싱
+
+사용자가 던진 텍스트에서 구독자 정보와 그룹 지정 여부를 추출한다. 형태는 자유롭다:
+- 단순 이메일 목록
+- "이름 / 이메일" 형태
+- 표, JSON, 복붙한 스프레드시트 등 무엇이든
+
+각 구독자에서 추출할 필드:
+- `email` (필수)
+- `name` (선택)
+- `writer_memo` (선택) — 구독자의 특성/출처 메모
+
+그룹 지정 파악:
+- 사용자가 "XX 그룹에 추가", "XX 그룹으로" 등을 언급하면 그룹명 추출
+- config의 `groups`에서 해당 이름으로 ext_id를 찾는다
+- 그룹명이 config에 없으면 사용자에게 알리고 Maily 대시보드에서 ext_id 확인을 요청한다
+
+### Step 3. writer_memo 처리
+
+**`by-claude` 마킹 규칙 (필수):**
+Claude가 등록하는 모든 구독자의 `writer_memo`에는 반드시 `_by-claude` 접미사를 붙인다.
+- 메모가 없어서 기본값만 쓰는 경우: `"by-claude"`
+
+**메모가 있는 경우:** 한국어/자연어 메모를 영문 슬러그로 변환한 뒤 `_by-claude`를 붙인다.
+- 예: `"노션 강의 수강생"` → `"notion-class-student_by-claude"`
+- 예: `"유튜브 댓글 이벤트 당첨자"` → `"youtube-comment-winner_by-claude"`
+- 소문자, 하이픈 구분, 특수문자 제거
+
+**메모가 없는 경우:** 사용자에게 질문한다:
+```
+이 구독자들의 writer_memo를 무엇으로 설정할까요?
+(예: 출처, 경로, 특성 등. 슬러그로 변환 후 _by-claude가 자동으로 붙습니다)
+```
+답변을 받은 후 슬러그 변환 + `_by-claude` 접미사를 붙여 사용한다.
+
+### Step 4. API 호출 (scripts/subscribe.mjs 실행)
+
+```bash
+node "C:/Users/user/.claude/skills/maily-subscribe/scripts/subscribe.mjs" \
+  --config "C:/Users/user/.claude/skills/maily-subscribe/config.json" \
+  --data "<JSON 문자열>" \
+  [--group-id "<ext_id>"]
+```
+
+**스크립트 동작:**
+1. 구독자를 순차적으로 POST 등록
+   - 200 → 신규 등록 성공, 그룹 추가 대상
+   - 422 → 기존 구독자, 그룹 추가 대상 (등록 스킵)
+   - 429 → 1초 대기 후 최대 3회 재시도
+   - 기타 → 실패 목록에 기록, 그룹 추가 건너뜀
+2. `--group-id` 지정 시, 등록 성공 + 기존 구독자 **모두** 그룹에 추가
+   - 신규/기존 구분 없이 전원 그룹 추가 시도
+   - `marketing_agreement: true`, `marketing_agreed_at: 현재 시각` 항상 고정
+
+### Step 5. 결과 보고
+
+```
+✅ 신규 등록:      N명
+⏭️  기존 구독자:   N명
+❌ 등록 실패:      N명
+────────────────────────
+📌 그룹 추가 성공: N명
+📌 그룹 추가 실패: N명
+```
+
+## 그룹 ext_id 확인 방법
+
+Maily 대시보드 → 구독자 → 그룹 선택 → URL에서 마지막 path segment가 ext_id
+```
+https://maily.so/notiontalk/o/m/subscription_groups/{ext_id}
+```
+확인한 ext_id를 config.json의 `groups`에 추가한다.
+
+## Commands
+
+| 사용자 입력 | 동작 |
+|---|---|
+| 이메일 목록 붙여넣기 | 파싱 후 등록만 |
+| 이메일 목록 + "XX 그룹에 추가" | 등록 + 그룹 추가 |
+| "XX 그룹 추가해줘" + 이메일 목록 | 등록 + 그룹 추가 |
+| "새 그룹 등록해줘: 그룹명 / ext_id" | config.json groups에 추가 |
+
+## Notes
+
+- `marketing_agreement`는 항상 `true` 고정 (뉴스레터 등록 = 마케팅 동의)
+- `welcome_letter`는 기본값(`true`) 사용 — 등록 즉시 웰컴 메일 발송됨
+- 대량 등록 시 Rate Limit(초당 20회) 고려하여 스크립트가 자동 조절
+- `writer_memo`에는 항상 `_by-claude` 접미사 필수 — Claude가 등록한 구독자 추적용
+- 그룹 추가는 신규/기존 구독자 구분 없이 항상 시도 (기존 구독자도 그룹 추가 가능)
```

================================================================
## notion-pilot.md
ours(2)=275줄 / theirs(3)=255줄
```diff
diff --git a/notion-pilot.md b/notion-pilot.md
index c19c032..0397e9a 100644
--- a/notion-pilot.md
+++ b/notion-pilot.md
@@ -1,275 +1,255 @@
----
-name: notion-pilot
-description: "Notion 워크스페이스 통합 스킬. DB·페이지·블록 CRUD, 파일 업로드, 이미지 커버 설정 등 모든 Notion 작업을 처리합니다. notion-api.mjs 모듈을 통해 직접 API를 호출합니다. Use when: (1) 노션에 추가/수정/조회, (2) 노션 DB 생성, (3) 노션 이미지 업로드, (4) 노션 커버 설정, (5) 노션 파일 업로드, (6) Notion API 작업. 트리거: '노션', 'Notion', '노션에', '노션 DB', '노션 페이지', '노션 업로드'."
-allowed-tools: Bash(node *), Read, Write, Glob, Grep
----
-
-# Notion Pilot 스킬
-
-Notion 워크스페이스(2026 HOME)에 페이지를 생성·조회·수정할 때 사용하는 스킬.
-
-## 대원칙
-
-1. **마감일이 있는 할 일·일정** → **TASKS**에 생성
-2. **그 외 모든 자료** (메모, 링크, 참고자료, 아이디어 등) → **RESOURCES**에 생성
-3. **마일스톤이 필요한 큰 업무** → **PROJECTS**에 생성 + 하위 TASKS를 릴레이션으로 연결
-4. AI가 생성한 페이지는 반드시 `by AI` 체크박스를 `__YES__`로 설정
-
-## DB 레지스트리
-
-### PROJECTS
-- **DB URL**: `https://www.notion.so/2eedd1dcd644813586b0e978943fd85a`
-- **Data Source**: `collection://2eedd1dc-d644-81c8-ae9f-000bea34f602`
-- **쓰기 가능 속성**:
-  - `제목` (title): 프로젝트 이름
-  - `TASKS` (relation): TASKS DB 페이지 URL 배열
-- **자동 속성** (쓰기 불가): 상태, 진행율, 프로젝트 기간, RESOURCES (모두 수식/롤업)
-
-### TASKS
-- **DB URL**: `https://www.notion.so/2eedd1dcd64481358087f7422ea1c7ff`
-- **Data Source**: `collection://2eedd1dc-d644-8161-b4ec-000bc61f864a`
-- **쓰기 가능 속성**:
-  - `내용` (title): 할 일 제목
-  - `상태` (status): `시작 전` | `진행 중` | `완료`
-  - `마감일` (date): 날짜 설정 시 expanded format 사용
-    - `date:마감일:start` — ISO-8601 날짜
-    - `date:마감일:end` — 기간일 경우 종료일 (단일 날짜면 NULL)
-    - `date:마감일:is_datetime` — 시간 포함 여부 (0 or 1)
-  - `태그` (multi_select): `노션연수`, `노션크리에이터`, `정보부업무`, `학생인권안전`, `콘텐츠제작`, `역사교육`, `연수`
-  - `비고` (text): 추가 메모
-  - `PROJECTS` (relation): PROJECTS DB 페이지 URL 배열
-  - `RESOURCES` (relation): RESOURCES DB 페이지 URL 배열
-  - `by AI` (checkbox): AI 생성 여부
-
-### RESOURCES
-- **DB URL**: `https://www.notion.so/2eedd1dcd64481a892aff0c82b28f2fa`
-- **Data Source**: `collection://2eedd1dc-d644-81d5-a705-000b74a28a57`
-- **쓰기 가능 속성**:
-  - `제목` (title): 자료 이름
-  - `태그` (multi_select): `개인`, `공유페이지`, `노션크리에이터`, `노션템플릿`, `레시피`, `아이디어`, `정보교육부업무`, `AI`, `가이드북`, `유튜브`, `SEO`
-  - `비고` (text): 추가 메모
-  - `userDefined:URL` (url): 관련 링크
-  - `TASKS` (relation): TASKS DB 페이지 URL 배열
-  - `by AI` (checkbox): AI 생성 여부
-
-## API 호출 방법
-
-### `notion-api.mjs` 모듈 (유일한 방법)
-
-모든 Notion API 작업에 이 모듈을 사용한다. MCP 대비 토큰 효율적이고 API 100% 커버.
-**`mcp__notion-mcp__*` 도구는 절대 사용하지 않는다.** OAuth MCP 토큰 만료 등의 문제가 발생해도 notion-api.mjs로만 작업한다.
-모듈 경로: `/mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs`
-
-```javascript
-import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
-
-// 검색
-const results = await notion.search('교직원', { filter: 'database' });
-
-// DB 생성
-const db = await notion.createDatabase(parentPageId, '새 DB', '📋', {
-  '이름': { title: {} },
-  '상태': { select: { options: [{ name: '진행중', color: 'blue' }] } },
-});
-
-// 페이지 생성 (DB 내) - prop 헬퍼 사용
-const page = await notion.createPage(dbId, {
-  '이름': notion.prop.title('홍길동'),
-  '상태': notion.prop.status('시작 전'),   // status 타입 속성
-  '분류': notion.prop.select('진행중'),    // select 타입 속성
-  '점수': notion.prop.number(95),
-  '태그': notion.prop.multiSelect(['A', 'B']),
-});
-
-// DB 전체 조회 (자동 페이지네이션)
-const allPages = await notion.queryAll(dbId, {
-  filter: { property: '상태', select: { equals: '진행중' } },
-});
-
-// ── 페이지 본문 읽기/쓰기 (마크다운 우선) ──
-// 읽기: 특수 블록도 <callout>, <database> 등 확장 태그로 반환됨 (누락 없음)
-const content = await notion.getPageMarkdown(pageId);
-
-// 쓰기: 마크다운 문자열로 본문 전체 교체 (블록 API 대비 토큰 6배 절약)
-await notion.updatePageMarkdown(pageId, '## 섹션 제목\n\n본문 내용\n\n- 항목 1\n- 항목 2');
-
-// 블록 API는 마크다운으로 불가능한 세밀한 조작이 필요할 때만 사용
-await notion.appendBlocks(pageId, [
-  notion.block.callout('안내', '📝', 'blue_background'),
-  notion.block.toDo('할 일 항목', false),
-  notion.block.toggle('토글 제목', [notion.block.paragraph('토글 내부')]),
-  notion.block.code('console.log("hi")', 'javascript'),
-]);
-
-// ── 마크다운 쓰기 시 특수 블록 레퍼런스 ──
-// ✅ 읽기/쓰기 모두 지원:
-//
-//   [callout] 반드시 아래 형식 준수 — 태그와 내용이 별도 줄, 내용은 탭(\t) 들여쓰기:
-//   <callout icon="📌">
-//   	한 줄 내용
-//   </callout>
-//   <callout icon="📌" color="blue_bg">
-//   	멀티라인 내용
-//   	두 번째 줄 (탭 들여쓰기 필수)
-//   </callout>
-//   ※ 색상 단축키: blue_bg, green_bg, yellow_bg, orange_bg, red_bg, purple_bg, pink_bg, gray_bg
-//   ⚠️ 금지: <callout icon="📌">내용</callout> (한 줄 인라인 형식은 단순 텍스트만 가능)
-//   ⚠️ 금지: 내용에 빈 줄(\n\n) 포함 — 빈 줄 대신 탭+빈줄(\t\n) 사용
-//
-//   [toggle/details] 반드시 아래 형식 준수 — 내용은 탭(\t) 들여쓰기:
-//   <details>
-//   <summary>토글 제목</summary>
-//   	내용 (탭 들여쓰기 필수)
-//   	
-//   	빈 줄도 탭+빈줄(\t\n\t) 형태로
-//   </details>
-//   ⚠️ 금지: <details><summary>제목</summary>내용</details> (한 줄 인라인 형식 — 파싱 실패)
-//
-//   > 인용문 (quote)
-//   --- (divider)
-//   - [ ] 미완료 / - [x] 완료 (to_do)
-//   | 헤더 | ... | (table)
-//   ```lang ... ``` (code)
-//   $`E=mc^2`$ (인라인 수식)
-//   $$\nE=mc^2\n$$ (수식 블록)
-//
-// ⚠️ 읽기전용 (쓰기 불가, 블록 API로 대체):
-//   bookmark → 읽으면 <unknown alt="bookmark"/> 로 표시
-//   embed → 읽으면 <unknown alt="embed"/> 로 표시
-//   synced_block → 블록 API 필수
-
-// ── 저수준 API 호출 (call) ──
-// 시그니처: notion.call(method, path, body?)
-// - method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
-// - path: 슬래시(/)로 시작하는 API 경로 (예: '/pages/PAGE_ID')
-// - body: POST/PATCH 시 요청 본문 (선택)
-// ⚠️ queryAll/createPage 등 고수준 함수는 DB ID → DS ID 자동 변환을 하지만,
-//    call()은 자동 변환하지 않으므로 DS ID가 필요한 엔드포인트에서는 직접 DS ID를 사용해야 한다.
-const page = await notion.call('GET', '/pages/PAGE_ID');
-const children = await notion.call('GET', '/blocks/BLOCK_ID/children?page_size=100');
-await notion.call('PATCH', '/pages/PAGE_ID', { in_trash: true });
-
-// 배치 처리 (동시성 15, Notion 버스트 허용 범위)
-await notion.batch(items, async (item) => {
-  await notion.createPage(dbId, { '이름': notion.prop.title(item.name) });
-});
-
-// ── Upsert (단건, 10건 미만) ──
-// matchType: 'title' | 'rich_text' | 'number' | 'select'
-const result = await notion.upsertPage(dbId, '이름', 'title', '홍길동', {
-  '이름': notion.prop.title('홍길동'),
-  '점수': notion.prop.number(95),
-});
-// → { action: 'created' | 'updated', pageId: '...' }
-
-// ── Bulk Upsert (10건 이상, queryAll 캐시 + 동시성 15) ──
-const stats = await notion.bulkUpsert(dbId, '이름', [
-  { matchValue: '홍길동', properties: { '이름': notion.prop.title('홍길동'), '점수': notion.prop.number(100) } },
-  { matchValue: '김철수', properties: { '이름': notion.prop.title('김철수'), '점수': notion.prop.number(88) } },
-  // ... 수십~수백건
-], { onProgress: (done, total) => console.log(`${done}/${total}`) });
-// → { updated: 1, created: 1, failed: 0, errors: [] }
-
-// 파일 업로드 → 페이지 커버 설정
-await notion.setCover(pageId, 'C:/path/to/cover.webp');
-
-// 파일 업로드 → 이미지 블록 추가
-await notion.addImageBlock(pageId, 'C:/path/to/photo.png');
-
-// URL에서 다운로드 → Notion 업로드
-const uploadId = await notion.uploadFromUrl('https://example.com/img.jpg');
-// uploadId를 커버/블록에 직접 사용 가능
-
-// 로컬 파일 업로드만 (ID 반환)
-const id = await notion.uploadFile('C:/path/to/file.pdf');
-```
-
-**주의사항**:
-- 크리덴셜은 모듈이 자동으로 `~/.claude/secrets/notion-credentials.md`에서 로드
-- API 버전 `2026-03-11` 통일 (DB ID → DS ID 자동 변환 내장)
-- Formula에서 다른 Formula/Rollup 참조 시 `{{notion:block_property:PROP_ID:...}}` 내부 형식 필요 (prop() 불가)
-
-## 실패 시 자가 수복 프로토콜
-
-모듈 함수 호출이 실패하면 아래 순서를 따른다. **MCP 폴백은 절대 하지 않는다.**
-
-1. **에러 패턴 가이드 조회** — 아래 테이블에서 에러 코드+메시지 패턴을 먼저 확인
-2. **가이드에 있으면** — 해당 해법을 즉시 적용하여 재시도
-3. **가이드에 없으면** — 인라인 스크립트로 우회 → 성공 시 **이 가이드 테이블에 패턴 추가** + `notion-api.mjs` 업데이트 + 커밋
-4. 404 폴백이 자동으로 문제를 해결한 경우에도, 해당 패턴을 가이드에 기록
-
-```
-실패 → 에러 패턴 가이드 확인
-        ├─ 패턴 있음 → 해법 적용 → 재시도
-        └─ 패턴 없음 → 인라인 우회 → 성공?
-                                      ├─ Yes → 가이드 추가 + 모듈 업데이트 + 커밋
-                                      └─ No  → 에러 분석 반복 (MCP 폴백 금지)
-```
-
-### 에러 패턴 가이드
-
-| 코드 | 메시지 패턴 | 원인 | 해법 |
-|------|------------|------|------|
-| 400 | `body.parent.database_id should be a string` | `createPage`에 객체를 넘김 | 첫 인자로 DB ID **문자열**만 넘긴다: `createPage('db-id', { props })` |
-| 400 | `text.annotations should be not present` | `annotations`를 `text` 객체 안에 넣음 | `annotations`는 rich_text 아이템 최상위에 배치: `{ text: { content: '...' }, annotations: { bold: true } }` |
-| 400 | `rich_text should be an array` | rich_text에 문자열을 넣음 | `rich_text: [{ text: { content: '...' } }]` 배열 형태 필수 |
-| 400 | `Could not find property` | DB 속성명 오타 | `notion.prop.*` 헬퍼 사용 + DB 레지스트리 속성명 확인 |
-| 400 | `body.children[N]` 관련 | 블록 구조 오류 | `notion.block.*` 헬퍼 사용. 직접 JSON 구성 시 Notion API 블록 스펙 확인 |
-| 404 | `Could not find database` | DB ID가 DS ID로 변경됨 | 자동 폴백 작동. `_dsCache`에 매핑 저장됨 |
-| 401 | `API token is invalid` | 토큰 만료/갱신 필요 | `~/.claude/secrets/notion-credentials.md` 토큰 교체 |
-| 429 | `Rate limited` | 요청 과다 | `notion.batch()` 동시성 15 사용. 자동 재시도 대기 |
-| 200 | (사일런트) `createDatabase` 후 properties 없음 | API 2026-03-11에서 `POST /databases`의 properties 파라미터가 무시됨 | 수정 완료: DB 생성 → `data_sources[0].id` 추출 → `PATCH /data_sources/{dsId}`로 properties 추가. 기본 'Name' 속성은 title 타입 속성명으로 자동 rename |
-
-> 새로운 에러 패턴을 발견할 때마다 이 테이블에 추가한다.
-
-## 토큰 절약 규칙
-
-1. **페이지 본문은 마크다운 API 우선**: 읽기 `getPageMarkdown()`, 쓰기 `updatePageMarkdown()`. 특수 블록도 `<callout>`, `<database>` 등 확장 태그로 보존됨. 블록 API 대비 읽기 20배, 쓰기 6배 토큰 절약.
-2. **블록 API는 세밀한 조작이 필요할 때만**: 특정 블록 하나만 수정/삭제, 블록 순서 조작 등.
-3. DB 스키마는 이 스킬에 이미 기록되어 있으므로 매번 fetch하지 않는다.
-4. **여러 페이지 작업 시** `notion.batch()`로 동시성 15 병렬 처리.
-5. **전체 조회 시** `notion.queryAll()`로 자동 페이지네이션.
-6. **Upsert 전략 선택**: 10건 미만 → `upsertPage()`, 10건 이상 → `bulkUpsert()`.
-
-## 헬퍼 레퍼런스
-
-### `notion.block.*` — 블록 빌더
-
-| 헬퍼 | 인자 | Notion 블록 타입 |
-|-------|------|-----------------|
-| `paragraph(text, {link?, color?})` | 텍스트, 옵션 | paragraph |
-| `heading1(text)` | 텍스트 | heading_1 |
-| `heading2(text)` | 텍스트 | heading_2 |
-| `heading3(text)` | 텍스트 | heading_3 |
-| `heading4(text)` | 텍스트 | heading_4 |
-| `bullet(text)` | 텍스트 | bulleted_list_item |
-| `numbered(text)` | 텍스트 | numbered_list_item |
-| `toDo(text, checked?)` | 텍스트, 체크 여부(기본 false) | to_do |
-| `quote(text, color?)` | 텍스트, 색상(기본 default) | quote |
-| `toggle(text, children?)` | 텍스트, 하위 블록 배열 | toggle |
-| `callout(text, emoji?, color?)` | 텍스트, 이모지(기본 💡), 색상 | callout |
-| `code(text, language?)` | 코드 문자열, 언어(기본 plain text) | code |
-| `bookmark(url, caption?)` | URL, 캡션 | bookmark |
-| `equation(expression)` | LaTeX 수식 | equation |
-| `divider()` | — | divider |
-| `tableOfContents(color?)` | 색상(기본 default) | table_of_contents |
-
-> table, column_list, synced_block 등 복잡한 구조체는 헬퍼 없이 JSON 직접 구성
-
-### `notion.prop.*` — 속성 빌더
-
-| 헬퍼 | 인자 | Notion 속성 타입 |
-|-------|------|-----------------|
-| `title(text)` | 텍스트 | title |
-| `richText(text)` | 텍스트 | rich_text |
-| `number(n)` | 숫자 | number |
-| `select(name)` | 옵션명 | select |
-| `multiSelect(names)` | 옵션명 배열 | multi_select |
-| `status(name)` | 상태명 | status |
-| `checkbox(checked)` | boolean | checkbox |
-| `date(start, end?)` | ISO 날짜, 종료일(선택) | date |
-| `url(url)` | URL 문자열 | url |
-| `email(email)` | 이메일 문자열 | email |
-| `phone(phone)` | 전화번호 문자열 | phone_number |
-| `people(ids)` | 사용자 ID 또는 배열 | people |
-| `relation(ids)` | 페이지 ID 또는 배열 | relation |
+---
+name: notion-pilot
+description: "Notion 워크스페이스 통합 스킬. DB·페이지·블록 CRUD, 파일 업로드, 이미지 커버 설정 등 모든 Notion 작업을 처리합니다. notion-api.mjs 모듈을 통해 직접 API를 호출합니다. Use when: (1) 노션에 추가/수정/조회, (2) 노션 DB 생성, (3) 노션 이미지 업로드, (4) 노션 커버 설정, (5) 노션 파일 업로드, (6) Notion API 작업. 트리거: '노션', 'Notion', '노션에', '노션 DB', '노션 페이지', '노션 업로드'."
+allowed-tools: Bash(node *), Read, Write, Glob, Grep
+---
+
+# Notion Pilot 스킬
+
+Notion 워크스페이스(2026 HOME)에 페이지를 생성·조회·수정할 때 사용하는 스킬.
+
+## 대원칙
+
+1. **마감일이 있는 할 일·일정** → **TASKS**에 생성
+2. **그 외 모든 자료** (메모, 링크, 참고자료, 아이디어 등) → **RESOURCES**에 생성
+3. **마일스톤이 필요한 큰 업무** → **PROJECTS**에 생성 + 하위 TASKS를 릴레이션으로 연결
+4. AI가 생성한 페이지는 반드시 `by AI` 체크박스를 `__YES__`로 설정
+
+## DB 레지스트리
+
+### PROJECTS
+- **DB URL**: `https://www.notion.so/2eedd1dcd644813586b0e978943fd85a`
+- **Data Source**: `collection://2eedd1dc-d644-81c8-ae9f-000bea34f602`
+- **쓰기 가능 속성**:
+  - `제목` (title): 프로젝트 이름
+  - `TASKS` (relation): TASKS DB 페이지 URL 배열
+- **자동 속성** (쓰기 불가): 상태, 진행율, 프로젝트 기간, RESOURCES (모두 수식/롤업)
+
+### TASKS
+- **DB URL**: `https://www.notion.so/2eedd1dcd64481358087f7422ea1c7ff`
+- **Data Source**: `collection://2eedd1dc-d644-8161-b4ec-000bc61f864a`
+- **쓰기 가능 속성**:
+  - `내용` (title): 할 일 제목
+  - `상태` (status): `시작 전` | `진행 중` | `완료`
+  - `마감일` (date): 날짜 설정 시 expanded format 사용
+    - `date:마감일:start` — ISO-8601 날짜
+    - `date:마감일:end` — 기간일 경우 종료일 (단일 날짜면 NULL)
+    - `date:마감일:is_datetime` — 시간 포함 여부 (0 or 1)
+  - `태그` (multi_select): `노션연수`, `노션크리에이터`, `정보부업무`, `학생인권안전`, `콘텐츠제작`, `역사교육`, `연수`
+  - `비고` (text): 추가 메모
+  - `PROJECTS` (relation): PROJECTS DB 페이지 URL 배열
+  - `RESOURCES` (relation): RESOURCES DB 페이지 URL 배열
+  - `by AI` (checkbox): AI 생성 여부
+
+### RESOURCES
+- **DB URL**: `https://www.notion.so/2eedd1dcd64481a892aff0c82b28f2fa`
+- **Data Source**: `collection://2eedd1dc-d644-81d5-a705-000b74a28a57`
+- **쓰기 가능 속성**:
+  - `제목` (title): 자료 이름
+  - `태그` (multi_select): `개인`, `공유페이지`, `노션크리에이터`, `노션템플릿`, `레시피`, `아이디어`, `정보교육부업무`, `AI`, `가이드북`, `유튜브`, `SEO`
+  - `비고` (text): 추가 메모
+  - `userDefined:URL` (url): 관련 링크
+  - `TASKS` (relation): TASKS DB 페이지 URL 배열
+  - `by AI` (checkbox): AI 생성 여부
+
+## API 호출 방법
+
+### `notion-api.mjs` 모듈 (유일한 방법)
+
+모든 Notion API 작업에 이 모듈을 사용한다. MCP 대비 토큰 효율적이고 API 100% 커버.
+**`mcp__notion-mcp__*` 도구는 절대 사용하지 않는다.** OAuth MCP 토큰 만료 등의 문제가 발생해도 notion-api.mjs로만 작업한다.
+모듈 경로: `C:/Users/user/.claude/skills/scripts/notion-api.mjs`
+
+```javascript
+import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs';
+
+// 검색
+const results = await notion.search('교직원', { filter: 'database' });
+
+// DB 생성
+const db = await notion.createDatabase(parentPageId, '새 DB', '📋', {
+  '이름': { title: {} },
+  '상태': { select: { options: [{ name: '진행중', color: 'blue' }] } },
+});
+
+// 페이지 생성 (DB 내) - prop 헬퍼 사용
+const page = await notion.createPage(dbId, {
+  '이름': notion.prop.title('홍길동'),
+  '상태': notion.prop.status('시작 전'),   // status 타입 속성
+  '분류': notion.prop.select('진행중'),    // select 타입 속성
+  '점수': notion.prop.number(95),
+  '태그': notion.prop.multiSelect(['A', 'B']),
+});
+
+// DB 전체 조회 (자동 페이지네이션)
+const allPages = await notion.queryAll(dbId, {
+  filter: { property: '상태', select: { equals: '진행중' } },
+});
+
+// ── 페이지 본문 읽기/쓰기 (마크다운 우선) ──
+// 읽기: 특수 블록도 <callout>, <database> 등 확장 태그로 반환됨 (누락 없음)
+const content = await notion.getPageMarkdown(pageId);
+
+// 쓰기: 마크다운 문자열로 본문 전체 교체 (블록 API 대비 토큰 6배 절약)
+await notion.updatePageMarkdown(pageId, '## 섹션 제목\n\n본문 내용\n\n- 항목 1\n- 항목 2');
+
+// 블록 API는 마크다운으로 불가능한 세밀한 조작이 필요할 때만 사용
+await notion.appendBlocks(pageId, [
+  notion.block.callout('안내', '📝', 'blue_background'),
+  notion.block.toDo('할 일 항목', false),
+  notion.block.toggle('토글 제목', [notion.block.paragraph('토글 내부')]),
+  notion.block.code('console.log("hi")', 'javascript'),
+]);
+
+// ── 마크다운 쓰기 시 특수 블록 레퍼런스 ──
+// ✅ 읽기/쓰기 모두 지원:
+//   <callout icon="📌">기본 콜아웃 (color 없음)</callout>
+//   <callout icon="📌" color="blue_bg">컬러 콜아웃 (blue_bg, green_bg, orange_bg 등)</callout>
+//   <details><summary>토글 제목</summary>토글 내부 내용</details>
+//   > 인용문 (quote)
+//   --- (divider)
+//   - [ ] 미완료 / - [x] 완료 (to_do)
+//   | 헤더 | ... | (table)
+//   ```lang ... ``` (code)
+//   $`E=mc^2`$ (인라인 수식)
+//   $$\nE=mc^2\n$$ (수식 블록)
+//
+// ⚠️ 읽기전용 (쓰기 불가, 블록 API로 대체):
+//   bookmark → 읽으면 <unknown alt="bookmark"/> 로 표시
+//   embed → 읽으면 <unknown alt="embed"/> 로 표시
+//   synced_block → 블록 API 필수
+
+// ── 저수준 API 호출 (call) ──
+// 시그니처: notion.call(method, path, body?)
+// - method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
+// - path: 슬래시(/)로 시작하는 API 경로 (예: '/pages/PAGE_ID')
+// - body: POST/PATCH 시 요청 본문 (선택)
+// ⚠️ queryAll/createPage 등 고수준 함수는 DB ID → DS ID 자동 변환을 하지만,
+//    call()은 자동 변환하지 않으므로 DS ID가 필요한 엔드포인트에서는 직접 DS ID를 사용해야 한다.
+const page = await notion.call('GET', '/pages/PAGE_ID');
+const children = await notion.call('GET', '/blocks/BLOCK_ID/children?page_size=100');
+await notion.call('PATCH', '/pages/PAGE_ID', { in_trash: true });
+
+// 배치 처리 (동시성 15, Notion 버스트 허용 범위)
+await notion.batch(items, async (item) => {
+  await notion.createPage(dbId, { '이름': notion.prop.title(item.name) });
+});
+
+// ── Upsert (단건, 10건 미만) ──
+// matchType: 'title' | 'rich_text' | 'number' | 'select'
+const result = await notion.upsertPage(dbId, '이름', 'title', '홍길동', {
+  '이름': notion.prop.title('홍길동'),
+  '점수': notion.prop.number(95),
+});
+// → { action: 'created' | 'updated', pageId: '...' }
+
+// ── Bulk Upsert (10건 이상, queryAll 캐시 + 동시성 15) ──
+const stats = await notion.bulkUpsert(dbId, '이름', [
+  { matchValue: '홍길동', properties: { '이름': notion.prop.title('홍길동'), '점수': notion.prop.number(100) } },
+  { matchValue: '김철수', properties: { '이름': notion.prop.title('김철수'), '점수': notion.prop.number(88) } },
+  // ... 수십~수백건
+], { onProgress: (done, total) => console.log(`${done}/${total}`) });
+// → { updated: 1, created: 1, failed: 0, errors: [] }
+
+// 파일 업로드 → 페이지 커버 설정
+await notion.setCover(pageId, 'C:/path/to/cover.webp');
+
+// 파일 업로드 → 이미지 블록 추가
+await notion.addImageBlock(pageId, 'C:/path/to/photo.png');
+
+// URL에서 다운로드 → Notion 업로드
+const uploadId = await notion.uploadFromUrl('https://example.com/img.jpg');
+// uploadId를 커버/블록에 직접 사용 가능
+
+// 로컬 파일 업로드만 (ID 반환)
+const id = await notion.uploadFile('C:/path/to/file.pdf');
+```
+
+**주의사항**:
+- 크리덴셜은 모듈이 자동으로 `~/.claude/secrets/notion-credentials.md`에서 로드
+- API 버전 `2026-03-11` 통일 (DB ID → DS ID 자동 변환 내장)
+- Formula에서 다른 Formula/Rollup 참조 시 `{{notion:block_property:PROP_ID:...}}` 내부 형식 필요 (prop() 불가)
+
+## 실패 시 자가 수복 프로토콜
+
+모듈 함수 호출이 실패하면 아래 순서를 따른다. **MCP 폴백은 절대 하지 않는다.**
+
+1. **에러 패턴 가이드 조회** — 아래 테이블에서 에러 코드+메시지 패턴을 먼저 확인
+2. **가이드에 있으면** — 해당 해법을 즉시 적용하여 재시도
+3. **가이드에 없으면** — 인라인 스크립트로 우회 → 성공 시 **이 가이드 테이블에 패턴 추가** + `notion-api.mjs` 업데이트 + 커밋
+4. 404 폴백이 자동으로 문제를 해결한 경우에도, 해당 패턴을 가이드에 기록
+
+```
+실패 → 에러 패턴 가이드 확인
+        ├─ 패턴 있음 → 해법 적용 → 재시도
+        └─ 패턴 없음 → 인라인 우회 → 성공?
+                                      ├─ Yes → 가이드 추가 + 모듈 업데이트 + 커밋
+                                      └─ No  → 에러 분석 반복 (MCP 폴백 금지)
+```
+
+### 에러 패턴 가이드
+
+| 코드 | 메시지 패턴 | 원인 | 해법 |
+|------|------------|------|------|
+| 400 | `body.parent.database_id should be a string` | `createPage`에 객체를 넘김 | 첫 인자로 DB ID **문자열**만 넘긴다: `createPage('db-id', { props })` |
+| 400 | `text.annotations should be not present` | `annotations`를 `text` 객체 안에 넣음 | `annotations`는 rich_text 아이템 최상위에 배치: `{ text: { content: '...' }, annotations: { bold: true } }` |
+| 400 | `rich_text should be an array` | rich_text에 문자열을 넣음 | `rich_text: [{ text: { content: '...' } }]` 배열 형태 필수 |
+| 400 | `Could not find property` | DB 속성명 오타 | `notion.prop.*` 헬퍼 사용 + DB 레지스트리 속성명 확인 |
+| 400 | `body.children[N]` 관련 | 블록 구조 오류 | `notion.block.*` 헬퍼 사용. 직접 JSON 구성 시 Notion API 블록 스펙 확인 |
+| 404 | `Could not find database` | DB ID가 DS ID로 변경됨 | 자동 폴백 작동. `_dsCache`에 매핑 저장됨 |
+| 401 | `API token is invalid` | 토큰 만료/갱신 필요 | `~/.claude/secrets/notion-credentials.md` 토큰 교체 |
+| 429 | `Rate limited` | 요청 과다 | `notion.batch()` 동시성 15 사용. 자동 재시도 대기 |
+| 200 | (사일런트) `createDatabase` 후 properties 없음 | API 2026-03-11에서 `POST /databases`의 properties 파라미터가 무시됨 | 수정 완료: DB 생성 → `data_sources[0].id` 추출 → `PATCH /data_sources/{dsId}`로 properties 추가. 기본 'Name' 속성은 title 타입 속성명으로 자동 rename |
+
+> 새로운 에러 패턴을 발견할 때마다 이 테이블에 추가한다.
+
+## 토큰 절약 규칙
+
+1. **페이지 본문은 마크다운 API 우선**: 읽기 `getPageMarkdown()`, 쓰기 `updatePageMarkdown()`. 특수 블록도 `<callout>`, `<database>` 등 확장 태그로 보존됨. 블록 API 대비 읽기 20배, 쓰기 6배 토큰 절약.
+2. **블록 API는 세밀한 조작이 필요할 때만**: 특정 블록 하나만 수정/삭제, 블록 순서 조작 등.
+3. DB 스키마는 이 스킬에 이미 기록되어 있으므로 매번 fetch하지 않는다.
+4. **여러 페이지 작업 시** `notion.batch()`로 동시성 15 병렬 처리.
+5. **전체 조회 시** `notion.queryAll()`로 자동 페이지네이션.
+6. **Upsert 전략 선택**: 10건 미만 → `upsertPage()`, 10건 이상 → `bulkUpsert()`.
+
+## 헬퍼 레퍼런스
+
+### `notion.block.*` — 블록 빌더
+
+| 헬퍼 | 인자 | Notion 블록 타입 |
+|-------|------|-----------------|
+| `paragraph(text, {link?, color?})` | 텍스트, 옵션 | paragraph |
+| `heading1(text)` | 텍스트 | heading_1 |
+| `heading2(text)` | 텍스트 | heading_2 |
+| `heading3(text)` | 텍스트 | heading_3 |
+| `bullet(text)` | 텍스트 | bulleted_list_item |
+| `numbered(text)` | 텍스트 | numbered_list_item |
+| `toDo(text, checked?)` | 텍스트, 체크 여부(기본 false) | to_do |
+| `quote(text, color?)` | 텍스트, 색상(기본 default) | quote |
+| `toggle(text, children?)` | 텍스트, 하위 블록 배열 | toggle |
+| `callout(text, emoji?, color?)` | 텍스트, 이모지(기본 💡), 색상 | callout |
+| `code(text, language?)` | 코드 문자열, 언어(기본 plain text) | code |
+| `bookmark(url, caption?)` | URL, 캡션 | bookmark |
+| `equation(expression)` | LaTeX 수식 | equation |
+| `divider()` | — | divider |
+| `tableOfContents(color?)` | 색상(기본 default) | table_of_contents |
+
+> table, column_list, synced_block 등 복잡한 구조체는 헬퍼 없이 JSON 직접 구성
+
+### `notion.prop.*` — 속성 빌더
+
+| 헬퍼 | 인자 | Notion 속성 타입 |
+|-------|------|-----------------|
+| `title(text)` | 텍스트 | title |
+| `richText(text)` | 텍스트 | rich_text |
+| `number(n)` | 숫자 | number |
+| `select(name)` | 옵션명 | select |
+| `multiSelect(names)` | 옵션명 배열 | multi_select |
+| `status(name)` | 상태명 | status |
+| `checkbox(checked)` | boolean | checkbox |
+| `date(start, end?)` | ISO 날짜, 종료일(선택) | date |
+| `url(url)` | URL 문자열 | url |
+| `email(email)` | 이메일 문자열 | email |
+| `phone(phone)` | 전화번호 문자열 | phone_number |
+| `people(ids)` | 사용자 ID 또는 배열 | people |
+| `relation(ids)` | 페이지 ID 또는 배열 | relation |
```

================================================================
## scripts/slack-api.mjs
ours(2)=116줄 / theirs(3)=108줄
```diff
diff --git a/scripts/slack-api.mjs b/scripts/slack-api.mjs
index 73a27d7..a991552 100644
--- a/scripts/slack-api.mjs
+++ b/scripts/slack-api.mjs
@@ -2,23 +2,23 @@
  * Slack API 공용 모듈
  *
  * Usage:
- *   import { slack } from 'file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs'
+ *   import { slack } from 'file:///C:/Users/user/.claude/skills/scripts/slack-api.mjs'
  *
  *   const channels = await slack.listChannels()
  *   await slack.sendMessage('#자동화메시지', 'Hello from Claude Code!')
  *   const messages = await slack.readMessages('#자동화메시지', 10)
  */
 
-import { readFileSync, existsSync } from 'fs';
-import { homedir } from 'os';
-import { join } from 'path';
+import { readFileSync } from 'fs';
+
+// ── WSL/Windows 경로 변환 ────────────────────────────────
+function resolvePath(p) {
+  if (process.platform === 'linux') return p.replace(/^([A-Za-z]):\//, (_, d) => `/mnt/${d.toLowerCase()}/`);
+  return p;
+}
 
 // ── 크리덴셜 자동 로드 ──────────────────────────────────
-const SECRETS_CANDIDATES = [
-  join(homedir(), '.claude', 'secrets', 'slack-bot-token.txt'),
-  '/mnt/c/Users/user/.claude/secrets/slack-bot-token.txt',
-];
-const SECRETS_PATH = SECRETS_CANDIDATES.find(p => existsSync(p)) || SECRETS_CANDIDATES[0];
+const SECRETS_PATH = resolvePath('C:/Users/user/.claude/secrets/slack-bot-token.txt');
 
 function loadToken() {
   const token = readFileSync(SECRETS_PATH, 'utf-8').trim();
@@ -58,23 +58,15 @@ async function listChannels({ types = 'public_channel,private_channel', limit =
   return data.channels;
 }
 
-// ── 채널 ID 캐시 (프로세스 내 재사용) ───────────────────
-const _channelCache = new Map([
-  ['자동화메시지', 'C0A1TU9RD3L'],
-]);
-
 // ── 채널 ID 조회 (이름 → ID) ────────────────────────────
 async function findChannel(nameOrId) {
   // 이미 ID 형식이면 그대로 반환
   if (/^[A-Z0-9]+$/.test(nameOrId)) return nameOrId;
 
   const name = nameOrId.replace(/^#/, '');
-  if (_channelCache.has(name)) return _channelCache.get(name);
-
   const channels = await listChannels();
   const ch = channels.find(c => c.name === name);
   if (!ch) throw new Error(`Channel not found: ${name}`);
-  _channelCache.set(name, ch.id);
   return ch.id;
 }
 
```

