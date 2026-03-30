# HANDOFF — 생기부 초안 생성 Notion Worker (student-record-writer)

> 작성: 2026-03-27 KST (최종 업데이트)

## 현재 상태

**배포 완료 + 실행 성공. Rate limit 재시도 로직 추가 후 재배포 필요.**

## 완료된 것

### 워커 배포 + 실행 확인
- **Notion Worker 이름**: `student-record-writer`
- **Tool**: `writeStudentRecord` (제목: 학생 성취기록 작성)
- **Windows 소스**: `C:\dev\notion-workers\projects\student-record-writer\`
- **WSL 배포용**: `~/dev/notion-workers/projects/seunggibu-worker/` (WSL 쪽은 이름 변경 전)
- Notion Custom Agent에 연결하여 실행 성공 확인
- Anthropic API 환경변수 등록 완료 (`ntn workers env set`)

### 코드 구성
- `src/systemPrompt.ts` — 교과세특 프롬프트 (few-shot 3개, 캐싱 임계값 충족)
- `src/generateDraft.ts` — Claude Sonnet 4.6 호출 + 프롬프트 캐싱 + rate limit 재시도
- `src/notionHelpers.ts` — Notion DB 쿼리/쓰기 (isFullPage, 속성명 상수화, 2000자 분할)
- `src/index.ts` — Worker tool 정의 + 병렬 처리 (동시 10개, worker pool 패턴)

### 설계 결정
- Claude 단일 호출 (Gemini 파이프라인 불필요)
- 1명당 1호출 + 병렬 처리 (컨텍스트 격리로 품질 일관성)
- 프롬프트 캐싱 (cache_control: ephemeral)
- 성취수준은 AI가 활동 주제에서 추론
- Rate limit 시 지수 백오프 재시도 (5s→10s→20s, 최대 3회)

### 대상 Notion DB
- 누가기록 DB ID: `2eedd1dc-d644-81f5-960c-cf72311a10ac`
- 입력 필드: `누가기록 종합` (formula)
- 출력 필드: `AI 생기부 초안` (text)

### 환경
- **ntn CLI**: WSL Ubuntu에서만 실행 가능 (Windows 미지원)
- **Node.js**: 22.22.0 (WSL)
- **인증**: `ntn login` 완료 (workspace: 1000쌤의 학교에서 노션하기)

## 미완료 / 주의사항

1. **rate limit 재시도 코드가 아직 재배포 안 됨** — Windows 소스는 수정 완료, WSL에 복사+재배포 필요:
   ```bash
   # WSL에서
   cp /mnt/c/dev/notion-workers/projects/student-record-writer/src/*.ts src/
   ntn workers deploy
   ```

2. **Anthropic API 키 로테이션 필요** — 대화에 키가 노출됨. Console에서 재발급 후:
   ```bash
   ntn workers env set ANTHROPIC_API_KEY=새키
   ```

3. **WSL 쪽 폴더 이름 불일치** — Windows는 `student-record-writer`, WSL은 `seunggibu-worker`. 기능에 영향 없으나 정리하려면:
   ```bash
   # WSL에서
   cd ~/dev/notion-workers/projects
   mv seunggibu-worker student-record-writer
   ```

4. **Notion AI 크레딧** — 에이전트 1회 호출 시 ~6크레딧 소모 (내부 멀티턴). 학생 수와 무관하게 고정.

## 삽질 기록
`C:\dev\notes\LESSONS_LEARNED.md` 항목 #9에 상세 기록.
