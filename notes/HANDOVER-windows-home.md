# HANDOVER

## 이번 세션 요약

### 1. skills-for-teachers 오타 수정
- 폴더명 `skiils` → `skills` 수정 (로컬 + GitHub 리포 rename)
- 프로젝트 전체 12개 파일에서 `skiils-for-teachers` → `skills-for-teachers` 일괄 치환
- 커밋+푸시 완료 (`main`)
- 메모리(MEMORY.md) 경로도 수정 완료

### 2. exam-analyzer 스킬 — 자연어 모드 추가
- **SKILL.md 수정 완료** (`skills-for-teachers` 커밋+푸시 완료)
- `~/.claude/skills/exam-analyzer/SKILL.md`에도 복사하여 테스트 진행
- 변경 내용:
  - 자연어 모드 추가 (교과서 PDF 없이 주제를 자연어로 지정)
  - 워크플로 시뮬레이션 예제 4개 추가
  - config에서 textbookDir을 선택사항으로 변경

### 3. exam-analyzer 자연어 모드 테스트 (한무제)
- 동아시아사 기출 7개 PDF로 "한무제" 분석 실행
- 결과: 정답 3문항 + 오답보기 2문항 식별
- 분석표 + 스크린샷 3개 생성 완료
  - `기출분석\한무제_기출분석.md`
  - `기출분석\한무제_스크린샷\` (3개 webp)

### 4. exam-analyzer 개선 논의 (미반영)
아래 내용을 SKILL.md에 아직 반영하지 않음:
1. **자연어 모드 Step 1 개선**: 교과서 폴더가 config에 있으면 교과서 PDF 텍스트에서 주제 검색 → 관련 페이지에서 키워드 추출. 교과서 없을 때만 Claude 지식 폴백
2. **Step 3 검증 단계 추가**: 키워드 매칭 후보를 Claude가 직접 읽고 오매칭 필터링 (진시황 문제 걸러내는 것처럼)
3. **범위 미지정 시 흐름**: 교과서 목록 보여주고 선택 유도 / 교과서 없으면 자연어 입력 안내
4. **웹 검색 폴백은 탈락**: EBSi 등에서 교과서급 키워드를 뽑을 수 없음 확인됨. 우선순위는 교과서 PDF > Claude 지식

### 5. Claude Code 초보자 교육자료
- 폴더: `C:\dev\claude-code-beginner-guide\`
- 파일 3개:
  - `install-claude-code.ps1` — Node.js + Git + Claude Code 원클릭 설치
  - `git-basics.md` — Git 기초 (커밋/푸시/저장소)
  - `claude-code-education.md` — 노션용 10파트 교육자료
- **남은 작업**: `git-basics.md`를 `claude-code-education.md` Part 4에 합쳐서 파일 하나로 정리

## 다음 세션 TODO

1. **exam-analyzer SKILL.md 반영** — 위 4번 개선사항 적용 후 커밋+푸시
2. **교육자료 합치기** — git-basics.md + claude-code-education.md → 하나로 통합
3. **~/.claude/skills 정리** — 테스트용으로 덮어쓴 exam-analyzer/SKILL.md를 원하는 버전으로 확정할지 결정

## 주요 경로

| 항목 | 경로 |
|------|------|
| 공유 스킬 리포 | `C:\dev\skills-for-teachers\` (GitHub: `1000ssam/skills-for-teachers`) |
| 내 스킬 | `C:\Users\user\.claude\skills\` (GitHub: `1000ssam/claude-skills`) |
| 교육자료 | `C:\dev\claude-code-beginner-guide\` |
| 기출분석 결과 | `C:\Users\user\Downloads\2015 개정 동아시아사 교과서\기출분석\` |
