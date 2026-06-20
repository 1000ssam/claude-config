#!/usr/bin/env python3
"""
Guide-blog native-migration renderer-gap audit.

Fetches every /contents/guide/ article (bullet.so rendered HTML) and detects, per
page, which Notion block-type signatures appear in the RENDERED BODY DOM.

bullet.so emits semantic `notion-*` class names, so we reverse-infer the source
Notion block type from rendered markup. CRITICAL: bullet inlines its full CSS
stylesheet (~48KB) on every page, so the entire `notion-*` vocabulary appears as
CSS-rule selectors even when the block is absent. We therefore strip
<style>/<script>/<svg> first and match only `class="...notion-X..."` attribute
hits — never bare substrings.

Each feature maps to SUPPORTED / GAP relative to LetterBody.tsx (the self-host
renderer, read directly from source). A page is "broken on self-host" if it uses
>=1 GAP block. No LLM, no fulltext to model — pure signature counting.
"""
import concurrent.futures as cf
import json
import re
import subprocess

URLS_FILE = "/mnt/c/dev/notes/_guide_urls.txt"
TIMEOUT = 15

# ---- detection signatures (class-attribute scoped) ------------------------
# Each value is a list of regex; page "has" feature if ANY matches the cleaned
# (style/script-stripped) HTML. Counting is per-page presence (0/1).
def cls(name):  # match notion-<name> inside a class="..." attribute
    return r'class="[^"]*\b' + name + r'\b'

SIGNATURES = {
    # ---- SUPPORTED by LetterBody ----
    "paragraph":        [cls("notion-text")],
    "heading":          [cls("notion-h1"), cls("notion-h2"), cls("notion-h3"), cls("notion-h4")],
    "bulleted_list":    [cls("notion-list-disc")],
    "numbered_list":    [cls("notion-list-numbered")],
    "to_do":            [cls("notion-to-do"), r'type="checkbox"'],
    "callout":          [cls("notion-callout")],
    "quote":            [cls("notion-quote")],
    "divider":          [cls("notion-hr")],
    "image":            [cls("notion-asset-wrapper-image"), cls("notion-image")],
    "simple_table":     [cls("notion-simple-table")],
    "bookmark":         [cls("notion-bookmark")],
    "code":             [cls("notion-code"), r'<pre[ >]'],

    # ---- GAP: NOT rendered by LetterBody (silently dropped → content loss) ----
    "toggle":           [cls("notion-toggle"), r'<details[ >]'],
    # Real column blocks only. bullet uses `notion-half-width` on the page-root
    # wrapper and `notion-row` per top-level block-row → both are layout CHROME and
    # must NOT count. A genuine multi-column block renders `notion-column-list` /
    # `notion-column` (the (?!-) excludes notion-column-title / -list children, and
    # the leading \b excludes notion-collection-column-title DB chrome).
    "column_layout":    [r'class="[^"]*\bnotion-column-list\b', r'class="[^"]*\bnotion-column\b(?!-)'],
    "db_view_table":    [cls("notion-collection-view-type-table"), cls("notion-table-cell"),
                         cls("notion-table-row"), cls("notion-collection-header")],
    "db_view_gallery":  [cls("notion-gallery-grid"), cls("notion-gallery-view"), cls("notion-collection-card")],
    "db_view_board":    [cls("notion-board-group"), cls("notion-board-th")],
    "embed_iframe":     [r'<iframe[ >]', cls("notion-embed")],
    "video":            [cls("notion-asset-wrapper-video"), r'<video[ >]'],
    "table_of_contents":[cls("notion-table-of-contents")],
    "equation":         [r'\bkatex\b', r'mathjax', cls("notion-equation"), r'<math[ >]'],
    "file_attachment":  [cls("notion-file")],
    "link_mention":     [cls("notion-lm")],     # notion "link to page" / link-mention card
    "button":           [cls("notion-button")],
    "synced_block":     [cls("notion-synced")],
    "ai_block":         [cls("notion-ai-pdf-conversation"), cls("notion-ai-block")],
}

SUPPORTED = {
    "paragraph", "heading", "bulleted_list", "numbered_list", "to_do",
    "callout", "quote", "divider", "image", "simple_table", "bookmark", "code",
}

_STRIP = [
    re.compile(r'<style[^>]*>.*?</style>', re.I | re.S),
    re.compile(r'<script[^>]*>.*?</script>', re.I | re.S),
    re.compile(r'<svg[^>]*>.*?</svg>', re.I | re.S),
]


def fetch(url):
    try:
        out = subprocess.run(
            ["curl", "-s", "--max-time", str(TIMEOUT), url],
            capture_output=True, timeout=TIMEOUT + 5,
        )
        html = out.stdout.decode("utf-8", "ignore")
        if len(html) < 2000:
            return url, None
        return url, html
    except Exception:
        return url, None


def clean_html(html):
    for rx in _STRIP:
        html = rx.sub("", html)
    return html


def detect(html):
    clean = clean_html(html)
    found = []
    for feat, pats in SIGNATURES.items():
        if any(re.search(p, clean, re.IGNORECASE) for p in pats):
            found.append(feat)
    return found


def main():
    with open(URLS_FILE) as f:
        urls = [u.strip() for u in f if u.strip()]
    urls = [u for u in urls if not u.rstrip("/").endswith("/contents/guide")]

    results, failed = {}, []
    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        for url, html in ex.map(fetch, urls):
            if html is None:
                failed.append(url)
            else:
                results[url] = detect(html)

    n = len(results)
    freq = {feat: 0 for feat in SIGNATURES}
    for feats in results.values():
        for f in feats:
            freq[f] += 1

    gap_feats = [f for f in SIGNATURES if f not in SUPPORTED]
    broken = {url: [f for f in feats if f in gap_feats]
              for url, feats in results.items()
              if any(f in gap_feats for f in feats)}

    gap_freq = sorted({f: freq[f] for f in gap_feats}.items(), key=lambda kv: -kv[1])

    report = {
        "total_urls": len(urls),
        "fetched_ok": n,
        "failed_count": len(failed),
        "failed_urls": failed,
        "freq_all": dict(sorted(freq.items(), key=lambda kv: -kv[1])),
        "supported_freq": dict(sorted({f: freq[f] for f in SUPPORTED}.items(), key=lambda kv: -kv[1])),
        "gap_freq": dict(gap_freq),
        "broken_page_count": len(broken),
        "broken_page_pct": round(100 * len(broken) / n, 1) if n else 0,
        "top_gap_blocks": gap_freq[:6],
        "broken_pages": dict(sorted(broken.items())),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
