# bullet.so — 노션톡 v2 네비바 이식 스니펫 (드롭다운 + 모바일 햄버거 포함)

원본: `/mnt/c/dev/notiontalk-landing/app/v2/page.tsx:214-498`
디자인 토큰: `/mnt/c/dev/notiontalk-landing/app/globals.css`

## 동작 사양

- 768px 미만: 햄버거 버튼 → 클릭 시 풀 너비 패널 슬라이드 다운
  - 패널 안의 "노션+AI 꿀팁", "툴킷"은 클릭으로 서브섹션 토글
  - ESC 키로 닫힘
- 768px 이상: 데스크탑 메뉴 (드롭다운은 hover로 열림)
- 스크롤 0~20px: 투명 배경
- 스크롤 20px 초과 또는 모바일 메뉴 열림: paper 90% + blur + 하단 보더

## 1) Custom Code → Head (`<head>` 안에 들어감)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">

<style>
  :root {
    --nt-paper: #F4F4F4;
    --nt-paper-dark: #ECECEC;
    --nt-paper-90: rgba(244, 244, 244, 0.9);
    --nt-paper-95: rgba(244, 244, 244, 0.95);
    --nt-edge: #E7E5E4;
    --nt-dark: #1C1917;
    --nt-sub: #57534E;
    --nt-accent: #1F5D5C;
    --nt-font: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", sans-serif;
  }

  /* bullet.so 기본 헤더 숨김 — 안 사라지면 검사 후 셀렉터 추가 */
  header,
  .site-header,
  .navbar,
  nav[role="navigation"]:not(.nt-nav) { display: none !important; }

  body { padding-top: 56px; }

  .nt-nav {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 40 !important;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background-color 300ms ease,
                backdrop-filter 300ms ease,
                border-color 300ms ease;
    font-family: var(--nt-font);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .nt-nav.is-active {
    background: var(--nt-paper-90);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom-color: var(--nt-edge);
  }

  .nt-nav__inner {
    max-width: 80rem !important;
    margin: 0 auto !important;
    padding: 0 1.5rem !important;
    height: 3.5rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: auto !important;
  }
  @media (min-width: 1024px) {
    .nt-nav__inner { padding: 0 2.5rem !important; }
  }

  .nt-nav__logo {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: var(--nt-dark);
    text-decoration: none;
  }

  /* ============ desktop menu ============ */
  /* !important: bullet.so 자체 CSS와의 우선순위 싸움 방지 */
  .nt-nav__desktop {
    display: none !important;
    align-items: center;
    gap: 2rem;
    font-size: 15px;
    color: var(--nt-sub);
  }
  @media (min-width: 768px) {
    .nt-nav__desktop { display: flex !important; }
  }

  .nt-nav__desktop > a,
  .nt-nav__dd-trigger {
    color: var(--nt-sub);
    text-decoration: none;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    cursor: pointer;
    transition: color 150ms ease;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .nt-nav__desktop > a:hover,
  .nt-nav__dd-trigger:hover { color: var(--nt-dark); }

  .nt-nav__dd { position: relative; }
  .nt-nav__dd-arrow {
    width: 10px; height: 10px;
    transition: transform 200ms ease;
  }
  .nt-nav__dd[data-open="true"] .nt-nav__dd-arrow { transform: rotate(180deg); }

  .nt-nav__dd-menu {
    position: absolute;
    top: 100%; left: 0;
    padding-top: 8px;
    min-width: 180px;
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    transition: opacity 200ms ease, transform 200ms ease;
  }
  .nt-nav__dd[data-open="true"] .nt-nav__dd-menu {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .nt-nav__dd-inner {
    border-radius: 12px;
    border: 1px solid var(--nt-edge);
    background: #fff;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05);
    overflow: hidden;
    padding: 4px 0;
  }
  .nt-nav__dd-inner a {
    display: block;
    padding: 10px 16px;
    font-size: 14px;
    color: var(--nt-dark);
    text-decoration: none;
    transition: background-color 150ms ease;
  }
  .nt-nav__dd-inner a:hover { background: var(--nt-paper-dark); }

  /* ============ mobile hamburger ============ */
  .nt-nav__hamburger {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    margin-right: -8px;
    color: var(--nt-dark);
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }
  /* PC에서 햄버거 숨김 — 베이스 스타일 뒤에 와야 cascade에서 이김 */
  @media (min-width: 768px) {
    .nt-nav__hamburger { display: none !important; }
  }
  .nt-nav__hamburger svg { width: 20px; height: 20px; }
  .nt-nav__icon-close { display: none; }
  .nt-nav[data-mobile-open="true"] .nt-nav__icon-open { display: none; }
  .nt-nav[data-mobile-open="true"] .nt-nav__icon-close { display: block; }

  /* ============ mobile panel ============ */
  .nt-nav__mobile {
    overflow: hidden;
    max-height: 0;
    background: var(--nt-paper-95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-top: 1px solid transparent;
    transition: max-height 300ms ease;
  }
  @media (min-width: 768px) {
    .nt-nav__mobile { display: none !important; }
  }
  .nt-nav[data-mobile-open="true"] .nt-nav__mobile {
    max-height: 28rem;
    border-top-color: var(--nt-edge);
  }

  .nt-nav__mobile-inner {
    padding: 8px 24px;
    display: flex;
    flex-direction: column;
    font-size: 15px;
  }
  .nt-nav__m-link,
  .nt-nav__m-section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    color: var(--nt-dark);
    text-decoration: none;
    background: none;
    border: 0;
    font: inherit;
    cursor: pointer;
    transition: color 150ms ease;
  }
  .nt-nav__m-link:hover { color: var(--nt-accent); }

  .nt-nav__m-section-toggle svg {
    width: 12px; height: 12px;
    color: var(--nt-sub);
    transition: transform 200ms ease;
  }
  .nt-nav__m-section[data-open="true"] .nt-nav__m-section-toggle svg {
    transform: rotate(180deg);
  }

  .nt-nav__m-sub {
    overflow: hidden;
    max-height: 0;
    transition: max-height 200ms ease;
  }
  .nt-nav__m-section[data-open="true"] .nt-nav__m-sub {
    max-height: 8rem;
  }
  .nt-nav__m-sub a {
    display: block;
    padding: 10px 0 10px 16px;
    font-size: 14px;
    color: var(--nt-sub);
    text-decoration: none;
    transition: color 150ms ease;
  }
  .nt-nav__m-sub a:hover { color: var(--nt-dark); }
</style>
```

## 2) Custom Code → Body (또는 Footer)

```html
<nav class="nt-nav" id="ntNav" data-mobile-open="false">
  <div class="nt-nav__inner">
    <a href="/" class="nt-nav__logo">노션톡</a>

    <!-- desktop -->
    <div class="nt-nav__desktop">
      <div class="nt-nav__dd" data-dd="tip" data-open="false">
        <button type="button" class="nt-nav__dd-trigger" aria-haspopup="menu">
          노션+AI 꿀팁
          <svg class="nt-nav__dd-arrow" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l3 3 3-3"/></svg>
        </button>
        <div class="nt-nav__dd-menu" role="menu">
          <div class="nt-nav__dd-inner">
            <a href="https://www.notiontalk.com/contents/guide/" role="menuitem">글 모아 보기</a>
            <a href="https://www.notiontalk.com/contents/vod/" role="menuitem">강의 영상 보기</a>
          </div>
        </div>
      </div>

      <a href="https://www.notiontalk.com/contents/templates/">노션 템플릿</a>

      <div class="nt-nav__dd" data-dd="toolkit" data-open="false">
        <button type="button" class="nt-nav__dd-trigger" aria-haspopup="menu">
          툴킷
          <svg class="nt-nav__dd-arrow" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l3 3 3-3"/></svg>
        </button>
        <div class="nt-nav__dd-menu" role="menu">
          <div class="nt-nav__dd-inner">
            <a href="https://www.notiontalk.com/contents/tools/tags/agent-skill/" role="menuitem">AI 에이전트 스킬</a>
            <a href="https://www.notiontalk.com/contents/tools/tags/app/" role="menuitem">업무 자동화 앱</a>
          </div>
        </div>
      </div>

      <a href="https://www.notiontalk.com/contents/community/">커뮤니티</a>
      <a href="https://www.notiontalk.com/contents/about-us/">제작자 소개</a>
    </div>

    <!-- hamburger (mobile only) -->
    <button type="button" class="nt-nav__hamburger" id="ntHamburger" aria-label="메뉴 열기" aria-expanded="false">
      <svg class="nt-nav__icon-open" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
      <svg class="nt-nav__icon-close" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>
    </button>
  </div>

  <!-- mobile panel -->
  <div class="nt-nav__mobile">
    <div class="nt-nav__mobile-inner">
      <div class="nt-nav__m-section" data-section="tip" data-open="false">
        <button type="button" class="nt-nav__m-section-toggle">
          <span>노션+AI 꿀팁</span>
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l3 3 3-3"/></svg>
        </button>
        <div class="nt-nav__m-sub">
          <a href="https://www.notiontalk.com/contents/guide/">글 모아 보기</a>
          <a href="https://www.notiontalk.com/contents/vod/">강의 영상 보기</a>
        </div>
      </div>

      <a class="nt-nav__m-link" href="https://www.notiontalk.com/contents/templates/">노션 템플릿</a>

      <div class="nt-nav__m-section" data-section="toolkit" data-open="false">
        <button type="button" class="nt-nav__m-section-toggle">
          <span>툴킷</span>
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l3 3 3-3"/></svg>
        </button>
        <div class="nt-nav__m-sub">
          <a href="https://www.notiontalk.com/contents/tools/tags/agent-skill/">AI 에이전트 스킬</a>
          <a href="https://www.notiontalk.com/contents/tools/tags/app/">업무 자동화 앱</a>
        </div>
      </div>

      <a class="nt-nav__m-link" href="https://www.notiontalk.com/contents/community/">커뮤니티</a>
      <a class="nt-nav__m-link" href="https://www.notiontalk.com/contents/about-us/">제작자 소개</a>
    </div>
  </div>
</nav>

<script>
  (function () {
    var nav = document.getElementById('ntNav');
    if (!nav) return;

    var hamburger = document.getElementById('ntHamburger');
    var dropdowns = nav.querySelectorAll('.nt-nav__dd');
    var mSections = nav.querySelectorAll('.nt-nav__m-section');
    var scrolled = false;

    function applyActive() {
      var mobileOpen = nav.getAttribute('data-mobile-open') === 'true';
      if (scrolled || mobileOpen) nav.classList.add('is-active');
      else nav.classList.remove('is-active');
    }

    /* scroll */
    function onScroll() {
      var next = window.scrollY > 20;
      if (next !== scrolled) {
        scrolled = next;
        applyActive();
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* desktop dropdown — hover */
    dropdowns.forEach(function (dd) {
      dd.addEventListener('mouseenter', function () { dd.setAttribute('data-open', 'true'); });
      dd.addEventListener('mouseleave', function () { dd.setAttribute('data-open', 'false'); });
      /* keyboard click toggle for accessibility */
      var trigger = dd.querySelector('.nt-nav__dd-trigger');
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = dd.getAttribute('data-open') === 'true';
        dd.setAttribute('data-open', open ? 'false' : 'true');
      });
    });

    /* mobile panel toggle */
    hamburger.addEventListener('click', function () {
      var open = nav.getAttribute('data-mobile-open') === 'true';
      var next = !open;
      nav.setAttribute('data-mobile-open', next ? 'true' : 'false');
      hamburger.setAttribute('aria-expanded', next ? 'true' : 'false');
      hamburger.setAttribute('aria-label', next ? '메뉴 닫기' : '메뉴 열기');
      /* reset mobile sections when closing */
      if (!next) {
        mSections.forEach(function (s) { s.setAttribute('data-open', 'false'); });
      }
      applyActive();
    });

    /* mobile section toggle */
    mSections.forEach(function (s) {
      var btn = s.querySelector('.nt-nav__m-section-toggle');
      btn.addEventListener('click', function () {
        var open = s.getAttribute('data-open') === 'true';
        s.setAttribute('data-open', open ? 'false' : 'true');
      });
    });

    /* mobile link click → close panel */
    nav.querySelectorAll('.nt-nav__m-link, .nt-nav__m-sub a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.setAttribute('data-mobile-open', 'false');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');
        mSections.forEach(function (s) { s.setAttribute('data-open', 'false'); });
        applyActive();
      });
    });

    /* ESC closes mobile panel */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (nav.getAttribute('data-mobile-open') === 'true') {
        nav.setAttribute('data-mobile-open', 'false');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');
        applyActive();
      }
      dropdowns.forEach(function (dd) { dd.setAttribute('data-open', 'false'); });
    });
  })();
</script>
```

## 적용 후 점검

1. 데스크탑(>=768px)에서 "노션+AI 꿀팁" hover → 드롭다운 부드럽게 표시
2. 데스크탑에서 "툴킷" hover → 드롭다운
3. 모바일(<768px)에서 햄버거 클릭 → 패널 슬라이드 다운
4. 모바일 패널 안 "노션+AI 꿀팁" 클릭 → 서브섹션 펼침
5. 모바일 패널 안 링크 클릭 → 패널 자동 닫힘
6. ESC → 패널/드롭다운 모두 닫힘
7. 스크롤 시 paper 배경 페이드인

## 커스터마이즈

- `노션톡` 로고 텍스트 → 본인 블로그 브랜드
- 모바일 메뉴 펼침 시 페이지 배경이 시각적으로 살짝 어색하면 `--nt-paper-95`를 블로그 배경 톤에 맞게 조정 (예: `rgba(255,255,255,0.95)`)
