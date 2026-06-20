import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/mnt/c/dev/notiontalk-landing/");
const sharp = require("sharp");

const SRC = "/tmp/og-doc";
async function b64(name, w = 880, q = 82) {
  const buf = await sharp(`${SRC}/${name}.png`)
    .resize(w)
    .jpeg({ quality: q })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const [landing, card, photo, nocover] = await Promise.all([
  b64("landing"),
  b64("detail-card"),
  b64("detail-photo"),
  b64("detail-nocover"),
]);

// 작은 썸네일(상속 표시용)
const landingThumb = await b64("landing", 360, 78);

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>노션톡 · 동적 OG 렌더링 구조</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<style>
  :root{
    --paper:#F4F4F4; --paper2:#ECECEC; --ink:#1C1917; --sub:#57534E;
    --muted:#A8A29E; --accent:#1F5D5C; --accent2:#154645; --edge:#E7E5E4;
    --mint:#9FE3D0;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{
    margin:0; background:var(--paper); color:var(--ink);
    font-family:"Pretendard Variable",Pretendard,-apple-system,system-ui,sans-serif;
    font-weight:350; letter-spacing:-0.02em; line-height:1.7;
  }
  .wrap{max-width:920px; margin:0 auto; padding:0 22px 96px}
  /* hero */
  header.hero{
    background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);
    color:#fff; padding:56px 0 50px; margin-bottom:46px;
  }
  .hero .wrap{padding-bottom:0}
  .eyebrow{font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,.7); font-weight:600; margin:0 0 14px}
  h1{font-size:clamp(28px,5vw,40px); font-weight:700; letter-spacing:-0.04em; line-height:1.18; margin:0 0 16px}
  h1 .hl{color:var(--mint)}
  .lede{font-size:17px; color:rgba(255,255,255,.84); max-width:660px; margin:0}
  .live{display:inline-flex; align-items:center; gap:7px; margin-top:22px; padding:7px 14px; border-radius:999px; background:rgba(255,255,255,.12); font-size:13px; font-weight:600; color:#fff}
  .live .dot{width:8px;height:8px;border-radius:9px;background:var(--mint)}
  .live a{color:#fff}
  /* sections */
  section{margin:0 0 52px}
  h2{font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent); font-weight:700; margin:0 0 6px}
  .h2sub{font-size:23px; font-weight:700; letter-spacing:-0.035em; margin:0 0 22px}
  p{margin:0 0 14px; color:var(--sub); font-size:15.5px}
  strong{font-weight:600; color:var(--ink)}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:13px; background:var(--paper2); padding:2px 7px; border-radius:6px; color:var(--accent2); letter-spacing:0}
  /* summary cards */
  .grid3{display:grid; grid-template-columns:repeat(3,1fr); gap:14px}
  .card{background:#fff; border:1px solid var(--edge); border-radius:16px; padding:22px}
  .card .n{font-size:12px; font-weight:700; color:var(--mint); background:var(--accent); width:26px;height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:14px}
  .card h3{font-size:16px; font-weight:700; letter-spacing:-0.03em; margin:0 0 7px}
  .card p{font-size:14px; margin:0}
  /* flow diagram */
  .flow{background:#fff; border:1px solid var(--edge); border-radius:18px; padding:26px 24px}
  .node{border:1.5px solid var(--edge); border-radius:12px; padding:13px 16px; background:#fff}
  .node .path{font-family:ui-monospace,Menlo,Consolas,monospace; font-size:12.5px; color:var(--accent2); font-weight:600}
  .node .desc{font-size:13px; color:var(--sub); margin-top:3px}
  .node.root{border-color:var(--accent); border-width:2px; background:linear-gradient(135deg,#fff, #f3faf8)}
  .branch{display:flex; gap:14px; margin-top:14px}
  .branch>div{flex:1}
  .arrow{display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:12px; margin:10px 0; letter-spacing:0.1em}
  .pill{display:inline-block; font-size:11.5px; font-weight:700; color:var(--accent); background:rgba(31,93,92,.09); padding:3px 9px; border-radius:999px; margin-bottom:9px; letter-spacing:0}
  /* render examples */
  .ex{margin:0 0 30px}
  .ex .label{display:flex; align-items:baseline; gap:10px; margin-bottom:12px; flex-wrap:wrap}
  .tag{font-size:11.5px; font-weight:700; letter-spacing:0.02em; color:#fff; background:var(--accent); padding:4px 11px; border-radius:999px}
  .tag.alt{background:var(--ink)}
  .tag.ghost{background:#fff; color:var(--sub); border:1px solid var(--edge)}
  .ex .label .t{font-size:17px; font-weight:700; letter-spacing:-0.03em}
  figure{margin:0}
  .shot{width:100%; border-radius:14px; border:1px solid var(--edge); box-shadow:0 18px 40px -28px rgba(15,23,42,.5); display:block}
  figcaption{font-size:13.5px; color:var(--muted); margin-top:10px}
  .twocol{display:grid; grid-template-columns:1fr 1fr; gap:18px}
  .inherit{display:flex; gap:16px; align-items:center; background:#fff; border:1px solid var(--edge); border-radius:14px; padding:16px}
  .inherit img{width:150px; border-radius:9px; border:1px solid var(--edge); flex-shrink:0}
  .inherit .txt{font-size:14px; color:var(--sub)}
  .inherit .txt b{color:var(--ink); font-weight:600}
  /* note box */
  .note{background:#fff; border:1px solid var(--edge); border-left:3px solid var(--accent); border-radius:0 14px 14px 0; padding:18px 20px}
  .note h4{margin:0 0 8px; font-size:15px; font-weight:700; letter-spacing:-0.02em}
  .note p{font-size:14.5px; margin:0 0 8px}
  .note p:last-child{margin:0}
  /* table */
  table{width:100%; border-collapse:collapse; background:#fff; border:1px solid var(--edge); border-radius:14px; overflow:hidden; font-size:14px}
  th,td{text-align:left; padding:13px 16px; border-bottom:1px solid var(--edge); vertical-align:top}
  th{background:var(--paper2); font-weight:700; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:var(--sub)}
  tr:last-child td{border-bottom:none}
  td code{font-size:12px}
  td .d{color:var(--sub); font-size:13px; margin-top:3px}
  footer{color:var(--muted); font-size:13px; border-top:1px solid var(--edge); padding-top:22px; margin-top:10px}
  @media (max-width:680px){
    .grid3,.twocol,.branch{grid-template-columns:1fr; flex-direction:column}
    .inherit{flex-direction:column; align-items:flex-start}
    .inherit img{width:100%}
  }
</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    <p class="eyebrow">notiontalk · Open Graph</p>
    <h1>페이지마다 다른 <span class="hl">동적 OG</span>,<br/>실제 이미지 파일 없이.</h1>
    <p class="lede">예전엔 모든 페이지가 정적 <code style="background:rgba(255,255,255,.14);color:#fff">/og.png</code> 하나를 공유했습니다. 이제 Next.js가 빌드 시점에 페이지별 1200×630 PNG를 생성해 카카오·페이스북·X 공유 썸네일에 자동으로 물립니다.</p>
    <span class="live"><span class="dot"></span> 라이브 · <a href="https://www.notiontalk.com">www.notiontalk.com</a> 적용 완료</span>
  </div>
</header>

<div class="wrap">

  <section>
    <h2>한눈에</h2>
    <div class="h2sub">무엇이 바뀌었나</div>
    <div class="grid3">
      <div class="card"><div class="n">1</div><h3>정적 → 동적</h3><p>고정 <code>og.png</code> 한 장 대신, 빌드 때 코드로 PNG를 그려 생성합니다.</p></div>
      <div class="card"><div class="n">2</div><h3>파일 불필요</h3><p>디자이너가 매번 이미지를 만들 필요 없이, 제목·표지 데이터로 자동 합성됩니다.</p></div>
      <div class="card"><div class="n">3</div><h3>페이지별 차등</h3><p>랜딩·하위·상세가 각각 다른 OG를 갖습니다. 이벤트는 표지까지 반영.</p></div>
    </div>
  </section>

  <section>
    <h2>동작 원리</h2>
    <div class="h2sub">파일 컨벤션 + 상속 (단일 출처)</div>
    <p>각 폴더에 <code>opengraph-image.tsx</code>를 두면 그 라우트의 OG가 됩니다. 하위 라우트는 가장 가까운 상위의 OG를 <strong>상속</strong>하고, 자기 폴더에 파일이 있으면 그걸로 <strong>덮어씁니다</strong>. 메타데이터에 정적 <code>images</code>를 따로 두지 않아 OG 출처가 한 곳으로 통일됩니다.</p>
    <div class="flow">
      <div class="node root">
        <span class="pill">루트 · 모든 페이지의 기본값</span>
        <div class="path">app/opengraph-image.tsx</div>
        <div class="desc">딥틸 브랜드 카드 → 홈 · 소개 · 커뮤니티 목록 등 자체 OG가 없는 모든 라우트가 상속</div>
      </div>
      <div class="arrow">▼  상세 페이지만 덮어씀  ▼</div>
      <div class="node" style="border-color:var(--ink)">
        <span class="pill" style="color:var(--ink);background:rgba(28,25,23,.07)">override · 이벤트 상세</span>
        <div class="path">app/contents/community/[slug]/opengraph-image.tsx</div>
        <div class="desc">표지 있으면 표지 풀블리드 + 워드마크 / 표지 없으면 제목 브랜드 카드</div>
      </div>
    </div>
  </section>

  <section>
    <h2>페이지 유형별 렌더</h2>
    <div class="h2sub">랜딩 · 하위 · 상세</div>

    <div class="ex">
      <div class="label"><span class="tag">랜딩 · 홈</span><span class="t">브랜드 딥틸 카드</span></div>
      <figure>
        <img class="shot" src="${landing}" alt="랜딩 OG — 브랜드 딥틸 카드" />
        <figcaption>실제 홈 히어로 카피("끝없는 업무, 정리 안 되는 기록 · 노션과 AI로 가볍게")와 25,000+ 지표를 그대로 사용. <code>/</code></figcaption>
      </figure>
    </div>

    <div class="ex">
      <div class="label"><span class="tag ghost">하위 페이지</span><span class="t">루트 기본 카드를 상속</span></div>
      <div class="inherit">
        <img src="${landingThumb}" alt="상속되는 기본 카드" />
        <div class="txt"><b>소개(about) · 커뮤니티 목록</b> 등은 자체 OG가 없으므로 위 랜딩과 <b>동일한 브랜드 카드</b>를 그대로 물려받습니다. 페이지별 OG가 필요해지면 해당 폴더에 <code>opengraph-image.tsx</code> 한 장만 추가하면 됩니다.</div>
      </div>
    </div>

    <div class="ex">
      <div class="label"><span class="tag alt">상세 · 이벤트</span><span class="t">표지 있음 → 표지 풀블리드 + 워드마크</span></div>
      <div class="twocol">
        <figure>
          <img class="shot" src="${card}" alt="이벤트 OG — 강의 카드형 표지" />
          <figcaption>카드형 표지(제목이 이미 디자인됨) — 표지를 그대로 살림</figcaption>
        </figure>
        <figure>
          <img class="shot" src="${photo}" alt="이벤트 OG — 실사진 표지" />
          <figcaption>실사진 표지(밋업) — 좌하단 워드마크만</figcaption>
        </figure>
      </div>
    </div>

    <div class="ex">
      <div class="label"><span class="tag alt">상세 · 이벤트</span><span class="t">표지 없음 → 제목 브랜드 카드</span></div>
      <figure>
        <img class="shot" src="${nocover}" alt="이벤트 OG — 표지 없는 브랜드 카드" />
        <figcaption>표지가 없는 이벤트는 제목을 얹은 딥틸 카드로 폴백. 제목은 동기화된 이벤트 데이터에서 자동 반영.</figcaption>
      </figure>
    </div>
  </section>

  <section>
    <h2>설계 결정</h2>
    <div class="h2sub">표지엔 왜 제목을 안 얹었나</div>
    <div class="note">
      <h4>"표지 + 제목 오버레이"에서 "표지 + 워드마크만"으로</h4>
      <p>처음엔 표지 위에 제목을 오버레이했는데, 강의 표지 상당수가 <strong>이미 제목이 디자인된 카드</strong>였습니다. 그 위에 제목을 또 얹으니 텍스트가 두 번 겹쳐 지저분했습니다.</p>
      <p>그래서 표지는 <strong>그대로 살리고</strong> 좌하단에 작은 <strong>노션톡 워드마크</strong>만 얹는 방식으로 정리했습니다. 카드형·사진형 표지 모두 깔끔하고, 이벤트 제목은 공유 카드에서 <code>og:title</code> 텍스트(예: "노션톡 2nd 밋업 | 노션톡 커뮤니티")로 표시됩니다.</p>
    </div>
  </section>

  <section>
    <h2>기술 메모</h2>
    <div class="h2sub">어떻게 그리나</div>
    <table>
      <tr><th style="width:34%">항목</th><th>방식</th></tr>
      <tr><td>생성 엔진</td><td><code>next/og</code> (Satori → resvg). JSX를 PNG로 래스터화<div class="d">빌드 시 정적 생성 → 런타임 비용 0</div></td></tr>
      <tr><td>한글 폰트</td><td>Pretendard 정적 OTF를 jsdelivr에서 로드<div class="d">Satori가 woff2/variable를 못 읽어 OTF 사용 · 빌드당 1회만 받도록 메모이즈</div></td></tr>
      <tr><td>표지 이미지</td><td>로컬 <code>.webp</code>를 sharp로 PNG 디코딩 후 cover-fit<div class="d">resvg가 webp를 직접 못 읽는 케이스 방어</div></td></tr>
      <tr><td>메타 주입</td><td><code>og:image</code> · <code>twitter:image</code> · width/height 자동<div class="d">파일 컨벤션이 처리 — 수동 URL 관리 불필요</div></td></tr>
      <tr><td>출력 규격</td><td>1200 × 630 PNG (소셜 표준)</td></tr>
    </table>
  </section>

  <section>
    <h2>파일 맵</h2>
    <div class="h2sub">무엇이 어디에</div>
    <table>
      <tr><th style="width:46%">파일</th><th>역할</th></tr>
      <tr><td><code>app/_og/og.tsx</code></td><td>공용 모듈 — 폰트 로더 · 표지 디코더 · BrandCard / CoverCard</td></tr>
      <tr><td><code>app/opengraph-image.tsx</code></td><td>사이트 기본 OG(브랜드 카드) — 모든 라우트의 폴백</td></tr>
      <tr><td><code>app/contents/community/[slug]/opengraph-image.tsx</code></td><td>이벤트별 OG — 표지/무표지 분기</td></tr>
      <tr><td><code>layout.tsx</code> · <code>community/page.tsx</code> · <code>[slug]/page.tsx</code></td><td>정적 <code>/og.png</code> 참조 제거 (OG 출처 단일화)</td></tr>
    </table>
  </section>

  <footer>
    노션톡 동적 OG 렌더링 구조 · 2026-06-13 · 브랜치 <code>feat/dynamic-og</code> → <code>main</code> 머지 · 프로덕션 배포 완료
  </footer>

</div>
</body>
</html>`;

writeFileSync("/mnt/c/dev/notes/og-render-overview.html", html);
console.log("written:", "/mnt/c/dev/notes/og-render-overview.html");
console.log("size:", (html.length / 1024).toFixed(0) + "KB");
