# Wee-story PDF 핸드오프

## 현재 상태

마크다운 내용 수정 완료, PDF 디자인 **처음부터 다시 해야 함**.

**파일 위치**
- 제안서 마크다운: `/home/user/workspace/notes/wee-story-proposal.md`
- HTML (재작업 대상): `/home/user/workspace/notes/wee-story-proposal.html`
- PDF 생성 스크립트: `/home/user/workspace/notes/generate-pdf.js`
- 생성 명령: `cd ~/workspace/notes && node generate-pdf.js`

---

## 반성 (다음 세션에서 반드시 지킬 것)

레퍼런스 코드를 받으면 **값을 그대로 옮길 것**. "이런 느낌"으로 자의적으로 재해석하지 말 것.
- spacing, font, shadow, border-radius — 전부 레퍼런스 코드의 숫자 그대로
- 레퍼런스에 없는 걸 추가하지 말 것 (AI Slop 패턴)
- 카드 안 visual content는 이모지 금지, 실제 mini UI mockup으로

---

## 이번 세션에서 한 것

1. **내용 수정** (마크다운 + HTML 반영 완료)
   - "전용 도구가 없다/극히 드물다" 표현 전부 제거
   - "도구의 부재" → "기존 도구의 한계"로 변경
   - "통일된 기록 도구가 없어" → "각 도구가 제 역할을 못하면서"로 변경

2. **디자인 시도 실패**
   - 1차: 네이비+오렌지 맥킨지 스타일 → 촌스럽다는 피드백
   - 2차: 퍼플+라이트 (아래 레퍼런스 기반) → 레퍼런스 무시하고 AI Slop 생성
   - **근본 문제**: 레퍼런스 코드의 실제 값(spacing, typography, card structure)을 무시하고 자의적으로 재해석

---

## 다음 세션 할 일: 레퍼런스 기반 PDF 재작업

### 핵심 원칙
레퍼런스 코드의 값을 **그대로** PDF HTML로 옮길 것. 재해석 금지.

### 레퍼런스에서 반드시 지켜야 할 값

```
배경:      background: #f9f8fc
카드:      background: #ffffff
퍼플:      #7c5cff  (sparingly — 포인트만)
퍼플 라이트: #f0edff
텍스트1:   #1a1a2e
텍스트2:   #64748b
텍스트3:   #94a3b8
보더:      rgba(0,0,0,0.06)  ← 이 값 그대로
그림자:    0 1px 3px rgba(0,0,0,0.04)  ← 이 값 그대로

카드 border-radius: rounded-2xl = 16px
카드 gap:  gap-6 = 24px  ← 내가 12px으로 줄였다가 망함
카드 패딩 (visual): p-6 = 24px
카드 패딩 (footer): px-6 pb-6 pt-5

헤딩 폰트: Playfair Display, serif, italic  ← 아예 안 써서 망함
바디 폰트:  Pretendard Variable
배지:      rounded-full border px-4 py-2 + Sparkles 아이콘
```

### 카드 구조 (레퍼런스 그대로)
```html
<div class="card" style="border-radius:16px; overflow:hidden; background:white; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
  <!-- 상단: 시각적 콘텐츠 (mini UI mockup, 차트 등) -->
  <div style="padding:24px; display:flex; align-items:center; justify-content:center;">
    <!-- 실제 mini UI 목업 — 이모지 금지 -->
  </div>
  <!-- 하단: 텍스트 (border-top separator) -->
  <div style="border-top:1px solid rgba(0,0,0,0.06); padding:20px 24px 24px;">
    <h3>제목</h3>
    <p>설명</p>
  </div>
</div>
```

### 카드 안 visual content 방향
레퍼런스처럼 실제 미니 UI를 SVG/HTML로 구현해야 함. 예:
- 전환율 퍼널 카드 → 미니 퍼널 시각화
- 시장 규모 카드 → 도넛 차트 (레퍼런스의 CreditDonut 스타일)
- 경쟁사 비교 카드 → 미니 비교 UI
- 팀 카드 → 미니 프로필 UI

### 섹션 타이틀 스타일 (레퍼런스)
```css
/* 레퍼런스의 h2 스타일 */
font-family: 'Playfair Display', serif;
font-style: italic;
font-size: 40-48pt;
font-weight: 400 (normal, not bold);
color: #1a1a2e;
```

### Badge 스타일 (레퍼런스)
```css
display: inline-flex;
align-items: center;
gap: 8px;
border-radius: 100px;
border: 1px solid rgba(0,0,0,0.06);
background: white;
padding: 8px 16px;
font-size: 9pt;
font-weight: 500;
color: #64748b;
/* + Sparkles 아이콘 in #7c5cff */
```

---

## 포맷 확정사항

- **A4 세로** (이메일 첨부용, 대면 미팅 전 발송)
- Puppeteer로 PDF 생성 (`node generate-pdf.js`)
- 10페이지 구성 유지

## 미완료 (내용 관련)

- 연락처 공란 (이메일, 전화번호) — 보내기 전 직접 채워야 함
- 조열음 선생님 참여 의향 미확인 → 확정 시 팀 섹션 업데이트
