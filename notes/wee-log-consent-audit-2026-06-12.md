# wee-log 동의서 발송 flow 3축 감사 — 2026-06-12

> 스냅샷: detached worktree `/mnt/c/dev/wee-log-audit-consent` @ `17ecbfb` (P4 하드닝 커밋 포함).
> 감사 축: ① 보안(S) ② 워크플로(W) ③ UX(U). 모든 file:line은 17ecbfb 기준.
> ⚠️ `/mnt/c/dev/wee-log` 본체는 `feat/p4-release-gate`에서 별도 작업 진행 중 — 수정 작업 시 충돌 조율 필요.

## 종합 판정

암호 경계(영지식·sealed box·키 수명주기·소유 격리·PII 0)는 **견고**. "얼레벌레"의 실체는 3가지:

1. **🔴 응답 유실 삼각구조 (W-1 × W-2 × W-3)** — 제출된 동의서가 조용히 사라지는 경로가 3개 있고 서로 증폭함. 컴플라이언스 문서라 최우선.
2. **🟠 서버 이전 반쪽 (S-1, S-2, W-4)** — Solapi 키 여전히 클라이언트 인라인, Worker엔 SMS 발송 라우트 자체가 없음. entitlement 게이트는 서버만 구현(클라 헤더 미송신 → 플래그 켜면 전면 마비). **= P4 출시게이트 범위, feat/p4-release-gate 작업과 중복 주의**
3. **🟡 보호자 폼 방어 누락 (S-3, S-4)** — id 속성 미이스케이프 + 서버 필드 검증 부재 → 저장형 XSS 가능(S-2 무인증과 결합 시 실제 공격 경로). CSP 부재.

---

## 보안 (S)

### [S-1] Solapi API 키·시크릿이 배포 빌드에 인라인 — High ⚠️P4중복
- `electron/sms.ts:16-21`, `electron.vite.config.ts`, `electron-builder.yml` (asar)
- `MAIN_VITE_SOLAPI_*`는 빌드 시 리터럴 치환 → asar 풀면 전 고객 공통 자격증명 추출 가능. 원래 머지 보류 사유였던 그 위험이 main에 그대로.
- 수정: SMS 발송을 Worker로 이전(`wrangler secret`), 앱은 발송 요청만.

### [S-2] `/requests` 등록 사실상 무인증 — Medium ⚠️P4중복
- `worker.ts:48-49,108-180`. `REQUIRE_ENTITLEMENT="false"`라 게이트 휴면. bearer는 클라 자가생성 → 누구나 임의 폼을 신뢰 도메인에 호스팅 가능(피싱·스팸). 레이트리밋은 bearer 해시 단위라 토큰 회전으로 우회.
- 수정: 게이트 활성화(W-4 선행) 또는 등록 토큰/IP 보조 제한.

### [S-3] 보호자 폼 `id`/`name`/`for` 속성 `f.key` 미이스케이프 + Worker 필드 검증 부재 → 저장형 XSS — Medium
- `form-page.ts:102,108-141`, `worker.ts:152-157`. 렌더러만 `/^[a-z][a-z0-9_]*$/` 검증, 서버는 미검증. S-2와 결합 시 신뢰 도메인 XSS.
- 수정: id에도 esc(), Worker `handleCreate`에서 key 정규식 + type 화이트리스트.

### [S-4] 보호자 폼 CSP 헤더 부재 — Low
- `worker.ts:316-324`. 수정: `default-src 'none'; script-src 'self' …` 추가.

### [S-5] Worker 에러 응답에 내부 메시지 노출 — Low
- `worker.ts:177,362` `detail: e.message`. 수정: 고정 코드로 치환.

### [S-6] capability 토큰 콘솔 로깅 — Low
- `consent.ipc.ts:317,331`. 수정: token 대신 id 로깅.

### [S-7] 공개 GET(`/f/:token`, `/api/f/:token`) 레이트리밋 부재 — Low
- 144-bit 엔트로피라 실위험 낮음. IP 보조 제한 검토.

**양호**: sealed box 정확, 요청별 키쌍+AES-256-GCM 로컬 암호화, 1회용·만료 서버사이드 원자적 강제, 144-bit 토큰, device_hash 소유 격리, SMS/D1/감사로그 PII 0, entitlement JWT alg 고정(EdDSA), 레이트리밋 fail-closed, IPC 가드, libsodium 셀프호스팅, 본문 esc() (id 제외).
**보류**: libsodium 셀프호스트 파일 upstream 해시 대조 미수행. entitlement 게이트 실배포 거동·sub↔device 결합은 구독 설계 사항.

---

## 워크플로 (W)

### [W-1] 재발송이 보호자의 미수합 제출분을 서버에서 파기 — High
- `consent.ipc.ts:70-77` + `worker.ts:219-225`. revoke가 서버 `responded` 확인 없이 `ciphertext=NULL`. 보호자는 "제출 완료"를 봤는데 응답은 영구 소실.
- 수정: `handleRevoke`에서 responded면 보존/409 + 앱은 revoke 전 수합 1회 강제.

### [W-2] 서버 매시 cron이 만료된 responded 암호문 즉시 파기 — High
- `worker.ts:370-375`. "만료 직전 제출분 유실 수정 완료"는 로컬 절반만 사실 — 서버 cron 경로는 여전히 유실. 밤사이/주말 미폴링 시 소실.
- 수정: responded(미ack)는 유예기간(만료+7일) 후 파기, pending만 즉시.

### [W-3] 수합 트리거가 동의서 탭 진입 1회+수동 버튼뿐 — High
- `consent-panel.tsx:126-130`이 유일한 `CONSENT_POLL` 호출처. "보내놓고 잊으면" 7일 후 W-2가 파기 → 구조적 유실.
- 수정: 메인 프로세스 주기 폴링(unlock 후 30분 간격) 또는 앱 시작 시 1회.

### [W-4] entitlement 반쪽 이전 — 서버는 검증, 클라는 헤더 미송신 — High(플래그 전환 시) ⚠️P4중복
- `worker.ts:48-68` vs `consent-remote.ts:52-57`. `REQUIRE_ENTITLEMENT='true'` 켜는 순간 동의서 전 기능 401 마비. SMS Worker 발송 라우트는 아예 없음(17ecbfb는 API 접근 게이트일 뿐 발송 게이트 아님).

### [W-5] 로컬 상태 `responded` 도달 불가(죽은 상태) — Medium
- 어떤 코드도 설정 안 함(sent→ingested 직행). '응답 도착' 배지 영원히 미표시 → W-3 수합 누락 증폭.

### [W-6] SMS `failed` 후 회복 경로 부재 + 서버 고아 행 + failed 의미 중첩 — Medium
- failed에 링크 복사/재시도 UI 없음, 재발송 무효화 대상에서도 제외. failed가 "SMS 실패"와 "복호 영구 실패" 겸용 — poll이 failed 토큰 응답을 수합 없이 ack 파기(`consent.ipc.ts:301-304`).

### [W-7] 죽은 코드: `getPollableRequests`·`getConsentRequestWithPrivateKey`·미사용 타입 — Medium
- 개인키 다루는 미사용 함수 잔존 → 감사 표면 확대 + 오용 위험.

### [W-8] 17ecbfb 신규 기능(레이트리밋·revoke·entitlement) 테스트 0건 — Medium
- revoke는 과거 500 회귀 전력(779e6fb) 있는데 무테스트. flow.mjs에 revoke 410/429/401 케이스 추가 필요.

### [W-9] 미구현 기능 스키마·주석 선반영(proxy_cache, sms 버킷) — Low
### [W-10] 로컬 pending 스턱(등록~sent 사이 크래시) + pending 복사 버튼 죽은 조건 — Low
### [W-11] revoke 실패 무시 → 구 링크 생존, 신·구 응답 2건 공존 가능 — Low
### [W-12] 보호자 제출 레이트리밋 IP 20/h — CGNAT 오차단 가능성 — Low

**양호**: 제출 원자성(UPDATE WHERE pending), 수합 멱등(upsert+ack 재시도+poison 차단), 배치 발송 무효화 설계(+회귀 테스트 12), 감사로그 빌더, 소유 격리.

### 문서-코드 불일치 (7건)
1. 세 문서 모두 consent IPC 위치를 `electron/main.ts`로 안내 — 실제 `electron/ipc/consent.ipc.ts`
2. HANDOFF ⛔머지조건 "SMS 서버사이드 발송 게이트" 미충족인데 진행 기록 없음
3. implementation-notes "재발송 무효화=ack" — 실제 별도 `/revoke`
4. implementation-notes "public/index.html 폼" — 실제 form-page.ts 서버 렌더
5. schema.sql proxy_cache 주석이 존재하지 않는 `/proxy/*` 참조
6. CHECKLIST "12/12"는 구버전(현재 14스위트)
7. "만료 직전 제출분 유실 수정 완료" — 서버 cron 경로(W-2)는 미수정

---

## UX (U)

### [U-1] 재발송 시 기존 링크 무경고 즉사 — High (W-1과 동전의 양면)
- 발송 다이얼로그에 "기존 발송분 무효화" 고지·확인 없음. 수정: 진행 중 요청 있으면 확인 다이얼로그.
### [U-2] JS/libsodium 로드 실패 시 "불러오는 중…" 영구 정지 — High
- noscript·onerror 폴백·타임아웃 없음. `sodium.ready`가 try 밖. 보호자는 일회성 방문자라 치명적.
### [U-3] 제출 시점 만료(410)면 입력 전체 소거 + 재요청 안내 없음 — Medium
### [U-4] 신뢰 신호 약함 — SMS·폼에 학교/상담실명 없음, 문의처 없음 → 피싱 오인 — Medium
### [U-5] 만료 시점이 교사·보호자 양쪽 어디에도 안 보임 — Medium
### [U-6] 에러에 개발자 용어 노출("VITE_CONSENT_SERVER_URL", "fetch failed", Solapi 원문) — Medium
### [U-7] 발송 전 양식 내용·SMS 본문 미리보기 없음(이름만 보고 체크) — Medium
### [U-8] 탭 열어둬도 자동 갱신 없음(수동 수합만), "마지막 수합" 표시 없음 — Medium
### [U-9] 양식 편집 중 다른 템플릿 클릭 시 무경고 소실 — Medium
### [U-10] 전자서명 키보드 불가(접근성), 에러-입력 ARIA 미연결 — Low
### [U-11] 429를 "네트워크 확인하세요"로 오안내(CGNAT 다수 공유) — Low
### [U-12] 제출 시각 UTC ISO 원문 표시(KST -9h 오해) — Low

**양호**: iOS 줌 방지(16px), 중복클릭 방어 양측, 제출 실패 시 입력 보존, 인라인 검증+첫 에러 스크롤, 만료/제출완료 링크 구분 안내, 성공 화면, 개인정보·암호화 고지, 기본 양식 시딩+삭제 보호, 이모지 0(SVG만), 링크 일괄 복사.
**실기기 검증 필요**: 모바일(iOS Safari·삼성 인터넷) 서명 캔버스 드로잉·화면 회전 좌표.

---

## 권장 수정 묶음

| 묶음 | 항목 | 성격 |
|------|------|------|
| **A. 응답 유실 차단** (최우선) | W-1, W-2, W-3 (+W-5 responded 활용) | 서버+앱, 데이터 유실 |
| **B. 폼 방어** | S-3, S-4 (+S-5) | Worker, 저렴하고 즉효 |
| **C. UX 핵심** | U-1(=W-1 UI면), U-2, U-3, U-6 | 앱+폼 |
| **D. P4 게이트와 통합** | S-1, S-2, W-4 (+W-8 테스트) | **feat/p4-release-gate 작업과 조율 필수 — 중복 구현 금지** |
| **E. 정리** | W-6, W-7, W-9~12, U-4, U-5, U-7~12, 문서 7건 | 후순위 |

## 감사 산출물·정리
- 스냅샷 워크트리 `/mnt/c/dev/wee-log-audit-consent`는 수정 계획 확정 후 `git worktree remove`로 정리.
- 수정 적용 시 QA 체크리스트(`wee-log-qa-checklist-2026-06-12.md`)에 동의서 항목 추가 필요.
