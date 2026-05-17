// MD 한 장을 watch 하면서 HTML로 라이브 렌더링하는 30줄짜리 파이프라인.
// - 사용: node render.mjs   (이 디렉토리에서)
// - 입력: ./tutorial.md
// - 출력: ./tutorial.html  (브라우저로 직접 열기)
import { readFileSync, writeFileSync, watchFile } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, 'tutorial.md');
const OUT = resolve(here, 'tutorial.html');

marked.setOptions({ gfm: true, breaks: false });

const wrap = (body, title) => `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- auto-refresh 제거됨. 변경 보려면 F5/Cmd+R -->
  <title>${title}</title>
  <style>
    :root {
      --bg: #0b0b0c;
      --surface: #18181a;
      --surface-hi: #232325;
      --border: rgba(255,255,255,0.08);
      --border-hi: rgba(255,255,255,0.14);
      --text: #f5f5f6;
      --muted: #98989b;
      --faint: #5a5a5d;
      --accent: #D6FF00;
      --accent-soft: rgba(214, 255, 0, 0.12);
      --code-bg: #111;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard Variable', 'Pretendard', sans-serif;
      max-width: 820px; margin: 0 auto; padding: 56px 32px 120px;
      line-height: 1.65; -webkit-font-smoothing: antialiased;
      font-size: 16px;
    }

    /* 타이포그래피 */
    h1, h2, h3, h4 { letter-spacing: -0.02em; line-height: 1.25; text-wrap: balance; }
    h1 { font-size: 38px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.03em; }
    h2 {
      font-size: 26px; font-weight: 800; margin: 56px 0 16px;
      padding: 18px 0 0;
      border-top: 1px solid var(--border);
      letter-spacing: -0.02em;
    }
    /* 마일스톤 헤딩 (## M0, ## M1, ... ## 보너스, ## 마무리) — 액센트 박스 */
    h2:has(+ p),
    h2 {
      position: relative;
    }
    h2::before {
      content: '';
      position: absolute;
      left: -16px; top: 32px;
      width: 4px; height: calc(100% - 32px - 8px);
      background: var(--accent);
      border-radius: 2px;
      opacity: 0;
    }
    h2:not(:first-of-type)::before { opacity: 0.6; }

    h3 { font-size: 18px; font-weight: 700; margin: 28px 0 8px; color: var(--text); }
    h4 { font-size: 14px; margin: 20px 0 6px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
    p, li { font-size: 15.5px; }
    p { text-wrap: pretty; }
    a { color: var(--accent); text-underline-offset: 3px; }
    strong { color: var(--accent); font-weight: 700; }
    em { color: var(--text); font-style: italic; }

    /* 코드 */
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13.5px; background: var(--code-bg);
      padding: 2px 6px; border-radius: 4px;
      box-shadow: 0 0 0 1px var(--border);
    }
    pre {
      background: var(--code-bg); padding: 16px 18px; border-radius: 10px;
      overflow-x: auto; box-shadow: 0 0 0 1px var(--border);
      line-height: 1.55; margin: 16px 0;
    }
    pre code { background: transparent; padding: 0; box-shadow: none; }

    /* 컨셉 박스 (blockquote) — 시연자 멘트, 핵심 개념 */
    blockquote {
      border-left: 3px solid var(--accent);
      background: var(--accent-soft);
      padding: 14px 18px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
      color: var(--text);
    }
    blockquote p { margin: 0; }
    blockquote p + p { margin-top: 10px; }
    blockquote strong { color: var(--accent); }

    /* 테이블 */
    table {
      width: 100%; border-collapse: collapse;
      margin: 16px 0; font-size: 14.5px;
      box-shadow: 0 0 0 1px var(--border);
      border-radius: 8px; overflow: hidden;
    }
    th, td {
      padding: 12px 14px; text-align: left; vertical-align: top;
      border-bottom: 1px solid var(--border);
    }
    tr:last-child td { border-bottom: none; }
    th {
      color: var(--muted); font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.04em; font-size: 12px;
      background: rgba(255,255,255,0.02);
    }

    /* 리스트 */
    ul, ol { padding-left: 22px; }
    li { margin-bottom: 6px; }

    /* 진행 상태 체크박스 — task list */
    input[type="checkbox"] {
      margin-right: 10px; vertical-align: middle;
      accent-color: var(--accent);
      transform: scale(1.2);
      transform-origin: center;
    }
    /* 체크된 항목은 muted 처리 (li:has 활용) */
    li:has(> input[type="checkbox"]:checked) {
      color: var(--faint);
      text-decoration: line-through;
      text-decoration-color: var(--faint);
    }
    li:has(> input[type="checkbox"]:checked) strong {
      color: var(--faint);
    }
    /* 안 된 항목 중 첫 번째 = "지금 여기" 시각 강조 */
    ul:has(> li > input[type="checkbox"]) > li:has(> input[type="checkbox"]:not(:checked)):first-of-type {
      /* 체크된 게 위에 있는 경우만 적용되도록 처리는 :has 한계로 단순 첫번째에 강조 */
    }

    /* 마일스톤 진행 리스트 (h2 "진행 상태" 다음 ul) — 추가 스타일 */
    h2 + ul,
    h2 + p + ul {
      list-style: none; padding-left: 0;
    }
    h2 + ul li,
    h2 + p + ul li {
      padding: 6px 8px;
      border-radius: 6px;
      margin-bottom: 2px;
    }

    /* hr 구분선 */
    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 48px 0;
    }

    /* 우하단 갱신 스탬프 */
    .stamp {
      position: fixed; right: 16px; bottom: 16px;
      background: var(--surface); color: var(--muted);
      padding: 6px 12px; border-radius: 999px;
      font-size: 11px; box-shadow: 0 0 0 1px var(--border);
      font-variant-numeric: tabular-nums;
      backdrop-filter: blur(10px);
    }

    /* 인쇄/스크린샷용 깔끔하게 */
    @media print {
      body { max-width: none; padding: 32px; }
      .stamp { display: none; }
    }
  </style>
</head>
<body>
  <article>${body}</article>
  <div class="stamp">${new Date().toLocaleTimeString('ko-KR', { hour12: false })} 갱신</div>
</body>
</html>`;

function render() {
  try {
    const md = readFileSync(SRC, 'utf-8');
    const title = (md.match(/^#\s+(.+)$/m) || [, '교재'])[1];
    const html = wrap(marked.parse(md), title);
    writeFileSync(OUT, html);
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    console.log(`[${ts}] rendered ${md.length}B → ${OUT}`);
  } catch (err) {
    console.error('render 실패:', err.message);
  }
}

render();
watchFile(SRC, { interval: 300 }, render);
console.log(`watching ${SRC}`);
console.log(`open  file://${OUT}`);
