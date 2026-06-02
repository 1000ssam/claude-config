/**
 * build-v2.js — wee-story-proposal.html 의 차별화 보강판(v2) 생성
 *  - 위노트 경쟁 분석 관점(클라우드 의존 / 모델 천장 / 컴플라이언스)을 반영한
 *    DIFFERENTIATION 슬라이드 2장을 Positioning(15) 뒤에 삽입
 *  - 슬라이드 16~20 → 18~22 로 재번호, 전체 분모 /20 → /22
 *  - 약점 카피(슬라이드 15 callout, 슬라이드 12 AI 카드) 보강
 */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const SRC = path.join(DIR, 'wee-story-proposal.html');
const OUT = path.join(DIR, 'wee-story-proposal-v2.html');

let s = fs.readFileSync(SRC, 'utf8');
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1); } };

// ── 1. 슬라이드 16~20 → 18~22 재번호 (높은 번호부터: 충돌 방지) ──────────
//   커버(1)·클로징(20) 슬라이드는 slide-header가 없어 header-page도 없음 → 조건부 처리
for (let n = 20; n >= 16; n--) {
  assert(s.includes(`data-slide="${n}"`), `data-slide="${n}" not found`);
  s = s.replace(`data-slide="${n}"`, `data-slide="${n + 2}"`);
  if (s.includes(`>${n} / 20<`)) {
    s = s.replace(`>${n} / 20<`, `>${n + 2} / 22<`);
  }
}

// ── 2. 나머지(1~15) + 네비게이션 분모 /20 → /22 ───────────────────────
s = s.replace(/>(\d+) \/ 20</g, '>$1 / 22<');

// ── 3. 덱 상수/스토리지 키 ────────────────────────────────────────────
assert(s.includes('var T=20'), 'var T=20 not found');
s = s.replace('var T=20', 'var T=22');
s = s.replace(/wee-story-slide/g, 'wee-story-v2-slide');
s = s.replace(
  '<title>위스토리 — 공동 개발·유통 협업 제안서</title>',
  '<title>위스토리 — 공동 개발·유통 협업 제안서 (차별화 보강판)</title>'
);

// ── 4. 표준 라이트 로고 SVG ───────────────────────────────────────────
const LOGO = '<svg height="22" viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="22" r="5" fill="#0075de"/><text x="20" y="36" font-family="\'Inter\',\'Pretendard Variable\',sans-serif" font-size="36" font-weight="900" letter-spacing="-0.05em" fill="#141210">WEE</text><line x1="103" y1="10" x2="103" y2="36" stroke="#141210" stroke-width="1" stroke-linecap="round" opacity=".2"/><text x="115" y="27" font-family="\'Inter\',\'Pretendard Variable\',sans-serif" font-size="12" font-weight="600" letter-spacing="0.38em" fill="#141210" opacity=".55">STORY</text></svg>';

// ── 5. DIFFERENTIATION 슬라이드 2장 (Positioning 15 뒤) ───────────────
const NEW_SLIDES = `
<!-- ═══ NEW. DIFFERENTIATION 01 — 위노트 다시 보기 ════════════════════ -->
<div class="slide" data-slide="16">
  <div class="slide-header">
    ${LOGO}
    <span class="header-section">Differentiation</span><span class="header-page">16 / 22</span>
  </div>
  <div class="slide-body">
    <div><span class="badge badge-blue">DIFFERENTIATION 01</span></div>
    <div class="t-display" style="margin:20px 0 20px">위노트, 다시 보기 — <span class="t-accent">'로컬'이라는 표방의 이면</span></div>
    <div class="t-body t-muted mb-32">공개 배포본을 직접 분석한 결과, 위노트의 '온디바이스' 포지셔닝에는 두 가지 구조적 공백이 있습니다.</div>
    <div class="split" style="gap:28px">
      <div class="cols cols-2" style="gap:32px">
        <div class="card" style="display:flex;flex-direction:column;gap:18px;padding:44px 40px">
          <div style="font-size:28px;font-weight:700">숨어 있는 클라우드 의존</div>
          <ul class="fl">
            <li>카카오 Kanana <strong>로컬 LLM</strong>을 핵심 가치로 내세움</li>
            <li>그러나 별도의 <strong>클라우드 추론 계층(Google Gemini 2.5)</strong>이 함께 탑재</li>
            <li>클라우드 사용 시 학생 상담 데이터가 Google 서버로 전송 — <strong>개인정보 국외 이전</strong>에 해당</li>
            <li>그 동의는 상담 도중 <strong>교사 1인의 클릭 한 번</strong>에 의존</li>
          </ul>
        </div>
        <div class="card" style="display:flex;flex-direction:column;gap:18px;padding:44px 40px">
          <div style="font-size:28px;font-weight:700">학교 PC에 묶인 모델 천장</div>
          <ul class="fl">
            <li>로컬 모델은 노후 학교 PC(<strong>최소 4GB RAM</strong>)에서 구동되도록 소형 양자화 모델로 제한</li>
            <li>AI 출력 품질이 <strong>개별 학교의 PC 사양에 종속</strong>됨</li>
          </ul>
        </div>
      </div>
      <div class="callout" style="font-size:26px">위노트의 <strong>크레딧 차등 요금제</strong>는 — 로컬 모델이 아니라, 이 클라우드 계층의 사용량을 미터링하는 구조입니다.</div>
      <div class="t-caption">분석 근거: 위노트 v2.2.5 공개 배포본 코드 분석</div>
    </div>
  </div>
</div>

<!-- ═══ NEW. DIFFERENTIATION 02 — 위스토리의 차별점 ════════════════════ -->
<div class="slide bg-warm" data-slide="17">
  <div class="slide-header">
    ${LOGO}
    <span class="header-section">Differentiation</span><span class="header-page">17 / 22</span>
  </div>
  <div class="slide-body">
    <div><span class="badge badge-blue">DIFFERENTIATION 02</span></div>
    <div class="t-display" style="margin:20px 0 20px">차별점 — <span class="t-accent">항목별 비교</span></div>
    <div class="t-body t-muted mb-32">차별점은 '같은 제품 + 더 나은 유통'이 아닙니다. 위노트가 '온디바이스'라는 정체성을 유지하는 한 동일하게 취하기 어려운 포지션입니다.</div>
    <div class="split" style="gap:28px">
      <table class="cmp-table">
        <thead><tr><th></th><th class="col-a">위노트</th><th class="col-b">위스토리</th></tr></thead>
        <tbody>
          <tr><td>AI 추론 위치</td><td class="col-a">로컬 + Google Gemini 클라우드(국외)</td><td class="col-b">상담 기록은 학교 PC 로컬 저장 · AI 추론은 국내 기관 전용 서버</td></tr>
          <tr><td>개인정보 국외 이전</td><td class="col-a">클라우드 계층 사용 시 발생</td><td class="col-b">발생하지 않음 — 제3자·해외 API 미경유</td></tr>
          <tr><td>민감정보 처리 동의</td><td class="col-a">상담 중 교사 1인 클릭 모달</td><td class="col-b">기관 인가 — PIA·위탁계약·보안심의 기반</td></tr>
          <tr><td>AI 모델 품질</td><td class="col-a">학교 PC 사양에 종속(소형 모델)</td><td class="col-b">서버 기반 — 모델 규모·품질 천장 없음</td></tr>
        </tbody>
      </table>
      <div class="callout" style="font-size:26px">B2G 조달에서 위노트가 거치지 않은 기관 절차(PIA · 위탁계약 · 국외이전 고지)를 — <strong>위스토리는 정면으로 충족합니다.</strong></div>
      <div class="t-caption">AI 추론 인프라의 구체 설계는 12쪽 'AI 통합 — 함께 풀고 싶은 과제'와 연결되는 협업 항목입니다.</div>
    </div>
  </div>
</div>
`;

const ANCHOR = '<!-- ═══ 15. BUSINESS';
assert(s.includes(ANCHOR), 'BUSINESS anchor not found');
s = s.replace(ANCHOR, NEW_SLIDES + '\n' + ANCHOR);

// ── 6. 슬라이드 15 callout — 제품 동등성 인정 톤 제거, 차별화로 브릿지 ──
const OLD_CALLOUT = '제품력은 이미 충분합니다. 거기에 <strong>신뢰, 채널, 브랜드</strong>가 더해집니다.';
assert(s.includes(OLD_CALLOUT), 'slide 15 callout not found');
s = s.replace(OLD_CALLOUT,
  '채널·브랜드는 출발선일 뿐입니다. 위노트가 따라오기 어려운 <strong>구조적 차별점</strong>은 다음 장에서 다룹니다.');

// ── 7. 슬라이드 12 AI 카드 1 — '로컬 LLM'(위노트와 동일) → 통제된 추론 ──
const OLD_CARD = '<div style="font-size:28px;font-weight:700;margin-bottom:12px">로컬 LLM</div><div class="t-body-sm t-muted">온디바이스 처리<br>데이터 외부 전송 없음</div>';
assert(s.includes(OLD_CARD), 'slide 12 AI card not found');
s = s.replace(OLD_CARD,
  '<div style="font-size:28px;font-weight:700;margin-bottom:12px">통제된 AI 추론</div><div class="t-body-sm t-muted">데이터를 국외·제3자로<br>보내지 않는 추론 인프라</div>');

// ── write ─────────────────────────────────────────────────────────────
fs.writeFileSync(OUT, s, 'utf8');
const slideCount = (s.match(/data-slide="/g) || []).length;
const diffCount = (s.match(/Differentiation/g) || []).length;
console.log('OK ->', OUT);
console.log('slides:', slideCount, '(expected 22)');
console.log('Differentiation header tags:', diffCount, '(expected 2)');
console.log('remaining "/ 20":', (s.match(/ \/ 20</g) || []).length, '(expected 0)');
