# HANDOFF: 원격 오픈웨이트 LLM — 월정액 서버 임대 전 직접 테스트 (GPU 랩탑에서 이어서)

> 작성 2026-06-20 (데스크톱 세션). **이 문서는 GPU 랩탑에서 이어서 작업하기 위한 자기완결형 지시서.**
> wee-log 리포가 없어도 0단계(모델 품질 테스트)는 이 문서만으로 진행 가능. 앱 통합(C절)만 wee-log 필요.

---

## 0. 왜 랩탑인가 (데스크톱에서 확인된 사실 — 재조사 불필요)

- 데스크톱 GPU 확인 결과: **전용 GPU 없음.** `nvidia-smi` 실패, Windows GPU는 `Intel(R) Graphics`(내장)만.
- → 데스크톱은 CPU 추론만 가능(11B Q4가 초당 수 토큰, 속도는 못 봄). 그래서 **GPU 랩탑으로 이동**해 0단계를 GPU 가속으로 제대로 돌리려는 것.
- 랩탑 첫 작업: 아래 **8절 "랩탑 첫 명령"**부터 시작.

---

## 1. 한 줄 결론 + 핵심 통찰

**월정액 서버 약정 없이 거의 공짜로 검증 가능.** 섞인 두 질문을 분리한다:

| 질문 | 필요한 것 |
|---|---|
| **Q1. 이 모델 작문 품질이 상담 요약에 충분한가?** | **서버 불필요** — 랩탑 GPU 로컬(LM Studio/Ollama) |
| **Q2. vLLM로 띄웠을 때 속도·동시성·비용이 받쳐주나?** | **시간당 GPU 임대로 충분** — 월 약정 불필요 |

🔑 **결정적 사실**: wee-log 앱에 이미 **OpenAI 호환 원격 프로바이더**(`lib/ai/providers/remote-http-provider.ts`)가 들어가 있다. → KT·IWINV 서버를 전혀 안 빌려도, **OpenAI 호환 엔드포인트면 무엇이든**(로컬 LM Studio, 시간당 임대 vLLM) 앱 원격 모드에 그대로 꽂아 전체 파이프라인(가명화→전송→응답)을 테스트할 수 있다.

---

## 2. 배경 — 무엇을 왜 테스트하나

- **대상 기능**: 전문상담교사용 앱(wee-log)의 AI 기능 — **상담 축어록 요약 · 맥락 브리핑**.
- **현재**: 로컬 LLM(node-llama-cpp). **목표**: 자체 GPU 서버에 올린 고성능 오픈웨이트 모델로 확장.
- **워크로드 스펙**: 입력 2k~8k 토큰 / 출력 0.3~1.5k 토큰 / **한국어 작문 품질 최우선** / 추론 요구 중간.
- **왜 자체 서버**: 상용 클라우드 LLM에 상담 데이터를 주지 않기 위함(프로젝트 존재 이유). 국내 리전.
- **월정액 후보** (약정 전 검증이 이 테스트의 목적):
  - KT클라우드 A100 = **월 ~484만원**(비현실, 정지해도 과금). → 테스트·운영 모두 부적합.
  - **IWINV A6000 48GB = 월 49만원, 무약정** = 1순위. 11B FP16(~22GB)+STT(~8GB) 한 장 동거 여유.
  - **무약정이 핵심**: "월 수백 약정"이 무서운 거라면 IWINV는 약정이 아니라 한 달 단위 해지 → 1개월 = 49만원 한 번 = 대규모 파일럿으로 쓰고 아니면 다음 달 해지.

---

## 3. 모델 후보 (조사 완료 — 최종 선택은 사용자 결정 대기)

| 모델 | 파라미터 | 라이선스(상업) | 한국어 근거 | VRAM·컨텍스트 |
|---|---|---|---|---|
| 🥇 **Mi:dm 2.0 Base** (KT) | 11.5B | **MIT** ✅ 무조건 | Ko-MTBench **89.7**(작문 동급최강), KMMLU 57.3 | BF16 ~24GB · 32K |
| 🥈 **Solar-Open-100B INT4** (업스테이지) | 102.6B MoE(A12B) | Apache-2.0 ✅ | KMMLU **73.0**(상업가능 중 최상위) | INT4 ~60GB · 128K |
| 🥉 **Qwen3.5-27B FP8** (알리바바) | 27B | Apache-2.0 ✅ | 한국어 공식벤치 **미확인**(직접 검증 필수) | FP8 ~29GB · 262K |
| A.X 4.0 Light (SKT) | 7.3B | Apache-2.0 ✅ | KMMLU 64.15 | ~15GB · 16K (빠른 맛보기용) |

- **기본 선택 = Mi:dm 2.0 11.5B** (MIT라 학교/교육청 납품 어떤 형태로도 리스크 0 + 작문 품질 최상).
- HF id: `K-intelligence/Midm-2.0-Base-Instruct`
- ❌ 탈락: EXAONE(NC 상업금지), Kanana-2/HCX(라이선스 제약), Llama(한국어 작문 열위).
- 상세표: wee-log `docs/remote-llm/MODEL-COMPARISON.md`.

---

## 4. 테스트 3단계 (비용 오름차순)

### 0단계 — 랩탑 GPU 로컬, 0원 (← 랩탑에서 지금 할 것)
- LM Studio 또는 Ollama로 **Mi:dm 양자화판**을 GPU로 구동. **데이터가 PC를 안 떠나므로 진짜 같은 시나리오로 품질 평가 가능**(단, 실제 학생 식별정보는 합성으로 대체 권장).
- Q1(작문 품질) 답 + 랩탑 GPU 한도 내 속도 체감.

### 1단계 — 시간당 GPU 임대, 몇천원~1만원, 반나절 ⭐ (결정용)
- **국내 엘리스클라우드 A100 80GB 시간당 2,000원** 또는 해외 **Vast.ai/RunPod**(A6000 시간당 수백원).
- vLLM + Mi:dm **BF16 풀정밀** 서빙 → 후보 2~3개 블라인드 비교 + **실워크로드로 tok/s·동시성·VRAM 실측**.
- 1~2시간이면 "월 49만 A6000 한 장이 내 동시 사용자에 충분한가" 답. 끝나면 인스턴스 삭제 = 과금 종료.

### 2단계 — IWINV 무약정 월 49만, 진짜 베타
- 1단계 통과 시 한 달만 켜고 실사용 베타. 무약정이라 다음 달 해지 가능. **KT 월 약정은 건너뜀.**

---

## 5. 랩탑 실행 절차 (구체)

### A. LM Studio 경로 (가장 쉬움 — 비개발자 친화, GUI)
1. https://lmstudio.ai 설치(Windows).
2. 모델 검색에서 `Midm-2.0` GGUF 탐색 → 없으면 HF에서 `K-intelligence/Midm-2.0-Base-Instruct` 의 커뮤니티 GGUF를 받아 로드. **GGUF가 안 보이면** 우선 검증된 `Qwen` 계열 GGUF로 파이프라인부터 확인 후 Mi:dm 확보.
3. 양자화는 **Q4_K_M**(품질·속도 균형) 우선. VRAM 여유 있으면 Q5/Q6/Q8.
4. "Local Server" 켜기 → `http://localhost:1234/v1` (OpenAI 호환). 채팅 UI에서 **6절 더미 시나리오**로 요약 품질 평가.

### B. Ollama 경로 (CLI 선호 시)
```bash
# 설치(윈도우): https://ollama.com  /  엔드포인트: http://localhost:11434/v1 (OpenAI 호환)
ollama run hf.co/<GGUF-repo>:Q4_K_M      # HF GGUF 직접 실행 (Mi:dm GGUF repo 확인 필요)
# 빠른 파이프라인 확인용 대안(공식 레지스트리):  ollama run qwen3
```

### C. wee-log 앱 통합 테스트 (선택 — wee-log 리포 필요)
- wee-log를 랩탑에 클론/동기화 후 `git fetch && git checkout feat/archival-status-model` (remote-llm 문서·코드가 이 브랜치에 있음).
- 앱 설정 → AI 원격 모드 ON, `base_url = http://localhost:1234/v1`(LM Studio) 또는 `:11434/v1`(Ollama), `model = <로드한 모델명>`, API key 임의값.
- 원격 모드 켤 때 **가명화 고지 다이얼로그** 동의 → 요약 실행 → `lib/ai/ai-service.ts`의 `enforceRedactionForRemote()` 초크포인트가 실명·전화·이메일을 가명화하는지, 응답이 정상 복원되는지 확인.
- ⚠️ **알려진 버그**: `remote-http-provider.ts`의 SSE `[DONE]` 처리 `break`가 for문만 탈출하고 read 루프 지속(:102 부근). 통합 테스트 중 응답 끊김/행 발생하면 이 부분 수정. (출처: `HANDOFF-remote-llm.md` §2)

### D. 1단계 클라우드 벤치 (랩탑 GPU로 품질 통과 후)
```bash
# 엘리스/RunPod/Vast 인스턴스에서 (예시)
pip install vllm
vllm serve K-intelligence/Midm-2.0-Base-Instruct --max-model-len 16384
# 다른 터미널에서 OpenAI 호환 /v1/chat/completions 로 실워크로드(2k~8k 입력) 던져 tok/s·동시성 측정
# 끝나면 반드시 인스턴스 삭제 (과금 종료)
```

### 랩탑 GPU VRAM → 가능 모델 (Mi:dm 11.5B 기준)
| VRAM | 권장 |
|---|---|
| 8GB (예: 4060/4070 랩탑) | Q4_K_M (~7–8GB) — 빠듯, 컨텍스트 짧게 |
| 12GB (3060/4070 12GB) | Q5/Q6 여유 |
| 16GB+ (4080/4090 랩탑) | Q8 또는 작은 모델 BF16, 동시성 여유 |
| 24GB (4090 데스크톱급) | Mi:dm BF16 풀정밀 직접 가능 |

---

## 6. 평가 기준 (블라인드 비교 체크리스트)

후보 2~3개에 **동일 입력**을 주고 모델명 가린 채 비교:
- [ ] 한국어 작문 자연스러움(번역투·한자어 과다 없는가 — Qwen 계열 특히 주의).
- [ ] 상담 노트 톤 적합성(과장·평가어 없이 사실 중심).
- [ ] **사실 보존**(원문에 없는 내용 환각 없는가).
- [ ] 요약 길이 적정(출력 0.3~1.5k 토큰 범위).
- [ ] 민감정보가 출력에 노출되지 않는가.

> 공식 벤치마크는 "요약 작문 품질"을 직접 측정하지 않는다 → **실제(합성) 축어록 30~50건 블라인드 비교가 진짜 결정 근거.**

---

## 7. 🚨 민감정보 가드레일 (불변식 — 위반 금지)

- 이 프로젝트의 **존재 이유 = 외부 AI 사업자에 상담 데이터 미제공.** 따라서:
  - 품질 테스트한다고 **글로벌 토큰 API(OpenRouter 등)나 해외 GPU(Vast/RunPod)에 진짜 축어록 입력 금지.** → 자기모순.
  - 외부에선 **합성/더미 상담 시나리오만**. 진짜 데이터는 **랩탑 로컬(0단계)** 또는 **본 서버**에서만.
- 법적: 상담 내용은 **가명화 후에도 개인정보**로 취급. 서버 **무저장·무로그는 옵션이 아니라 불변식**.
- 마케팅 문구 한계: "외부 AI 미제공 · 국내 자체 서버 · 가명화 · 서버 무저장"까지만. "종단간 암호화"·"서버도 못 읽음" 류 과장 금지(레벨2 TEE 전까지).

---

## 8. 랩탑 첫 명령 (복붙 시작점)

```bash
# 1) GPU 확인
nvidia-smi
# 2) (확인되면) LM Studio 설치 → Mi:dm GGUF 로드 → Local Server 켜기 (5-A절)
#    또는 Ollama 경로 (5-B절)
# 3) 6절 체크리스트로 더미 상담 시나리오 요약 품질 평가
# 4) 품질 통과 시 → 1단계(엘리스/RunPod) vLLM 벤치 (5-D절)
```
> 첫 메시지로 Claude에게: "이 핸드오프(`~/.claude/config-repo/notes/HANDOFF-remote-llm-testing.md` 또는 `/mnt/c/dev/notes/HANDOFF-remote-llm-testing.md`) 이어서 진행. nvidia-smi 결과는 [붙여넣기]" 라고 주면 됨.

---

## 9. 관련 파일 (wee-log 리포 — 자체 git: github.com/1000ssam/wee-log)

> 이 문서들은 **`feat/archival-status-model` 브랜치에 커밋**돼 있음(랩탑에서 그 브랜치 체크아웃 필요).
> `HANDOFF-remote-llm.md`는 **추적 안 되는 로컬 파일**(데스크톱 워킹트리에만 존재) → 핵심을 본 문서에 임베드함.

- `docs/remote-llm/MODEL-COMPARISON.md` — 후보 전체 비교표·TOP3 근거.
- `docs/remote-llm/COST-AND-BREAKEVEN.md` — 서버 비용·손익분기(IWINV 30석 BEP).
- `docs/remote-llm/KT-CLOUD-COST.md` — KT 단독 비용 기록.
- `docs/remote-llm/STT-COMPARISON.md` — STT(Whisper/pyannote) 비교(동거 서버 검토).
- `HANDOFF-remote-llm.md` — 구현 지시서(레벨1 아키텍처, redact 초크포인트, SSE 버그) ⚠️미추적.
- `SERVER-SETUP-GUIDE.md`, `implementation-notes-remote-llm.md` — 서버 셋업·설계 노트.
- `lib/ai/ai-service.ts` → `enforceRedactionForRemote()` (레벨1의 심장, 우회 경로 금지).
- `lib/ai/providers/remote-http-provider.ts` → SSE `[DONE]` 버그(:102 부근).

---

## 10. 미해결 / 사용자 결정 대기

1. **모델 최종 선택** (Mi:dm 기본선 → 블라인드 비교 후 확정).
2. **서버**: IWINV A6000 무약정(1순위) vs KT(CSAP 공공인증 보유 — B2G 조달 시 유리하나 10배 비쌈). IWINV/스마일서브 CSAP 보유 여부 미확인.
3. **도메인**: 기존 보유 서브도메인 vs 신규 (예: consent.wee-linked.com 같은 wee-consent 서버에 합칠지).
4. **원격 모드 기본값**: opt-in 권장(로컬 우선 철학 유지).
5. (레벨2 장기) GPU TEE 기밀컴퓨팅으로 "서버 운영자도 못 읽음" — KT TEE 지원 여부 선행 확인.
