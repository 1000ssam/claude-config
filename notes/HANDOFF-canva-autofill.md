# Canva Autofill 연동 핸드오프

## 완료된 작업 (2026-03-22)

### 1. Canva OAuth 인증 구축
- `~/.claude/skills/scripts/canva-oauth.mjs` — OAuth 2.0 + PKCE 토큰 발급/갱신 스크립트
- 로컬 서버(127.0.0.1:3333) 콜백 방식, 브라우저 인증 후 자동 토큰 저장
- 토큰 4시간 유효, refresh_token으로 자동 갱신
- 크리덴셜: `~/.claude/secrets/canva-credentials.md`
- 토큰: `~/.claude/secrets/canva-token.json`

### 2. Canva REST API 모듈
- `~/.claude/skills/scripts/canva-api.mjs` — 래퍼 모듈
- `canva.autofill(templateId, title, data)` — 오토필 실행 (폴링 자동)
- `canva.getTemplateDataset(templateId)` — 필드 목록 조회
- `canva.exportDesign(designId, format)` — 내보내기
- `canva.text(value)`, `canva.image(assetId)` — 데이터 헬퍼

### 3. 스킬 파일
- `~/.claude/skills/canva-autofill.md` — 트리거: 캔바, 카드뉴스, 캐러셀, 오토필
- 브랜드 템플릿 레지스트리, 캐러셀1 데이터셋 필드 매핑 포함
- 콘텐츠 → 카드뉴스 변환 규칙 정의

### 4. 테스트 결과
- 노션톡 최신 블로그 포스트(노션 앰버서더) → 캐러셀1 템플릿 오토필 성공
- 생성된 디자인: `DAHEmPjhzEo` (8페이지)
- Pro 플랜에서 Autofill API 사용 가능 확인

## 삽질 기록

### OAuth invalid_grant 에러
- 원인: 스코프 미등록 상태에서 authorize하면 `invalid_scope` 에러가 `invalid_grant`로 위장됨
- 해결: Canva Developer Portal에서 필요한 스코프 전부 활성화 후 재인증
- 필요 스코프: `design:content:read`, `design:content:write`, `design:meta:read`, `asset:read`, `asset:write`, `profile:read`, `brandtemplate:meta:read`, `brandtemplate:content:read`

### code_challenge_method 대소문자
- Canva 문서에는 `s256`(소문자)로 표기되어 있으나 `S256`(대문자)도 동작함
- 실제 실패 원인은 스코프였지 대소문자가 아니었음

### Canva MCP 한계
- Canva MCP(`mcp.canva.com/mcp`)에는 오토필/편집 도구가 없음
- `generate-design`(AI 생성)과 `brand_kit_id`(브랜드킷 적용)만 가능
- 브랜드킷 ≠ 브랜드 템플릿: 킷은 색상/폰트, 템플릿은 레이아웃+필드
- 오토필은 REST API 직접 호출 필수

## 오토필 제약

- 텍스트/이미지 교체만 가능 (폰트, 색상, 레이아웃 변경 불가)
- 슬라이드 추가/삭제 불가 — 템플릿 페이지 수 고정
- 템플릿 퀄리티가 결과물 품질을 결정

## 다음 작업

- [ ] Threads API 인증 해결 → 글 자동 수집
- [ ] 노션 블로그 → 카드뉴스 변환 자동화 파이프라인 완성
- [ ] 캐러셀2 등 추가 템플릿 데이터셋 매핑
- [ ] 이미지 자동 생성/선택 연동 검토
