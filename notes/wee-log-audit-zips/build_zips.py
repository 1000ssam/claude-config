#!/usr/bin/env python3
"""wee-log 감사 위임용 ZIP 빌더.
- 민감/빌드/의존성 파일을 제외하고, 아키텍처 이음새 단위로 8청크 + 앵커 zip 생성.
- 모든 코드 파일을 라우팅하고, 미할당분을 리포트(무단 누락 방지).
"""
import os, sys, subprocess, zipfile, fnmatch
from pathlib import Path

REPO = Path("/mnt/c/dev/wee-log")
OUT  = Path("/mnt/c/dev/notes/wee-log-audit-zips")
OUT.mkdir(parents=True, exist_ok=True)

# ── 절대 제외 (보안/용량) ────────────────────────────────────────────────
EXCLUDE_DIRS = {"node_modules", ".next", "out", "dist", ".wrangler",
                ".git", "binaries", "keys", "data", ".turbo"}
EXCLUDE_FILE_GLOBS = ["*.tsbuildinfo", "package-lock.json", ".env*",
                      "*.db", "*.db-wal", "*.db-shm", "*.node", "*.exe",
                      "*.map", "*.png", "*.jpg", "*.jpeg", "*.ico", "*.woff*",
                      # 벤더 라이브러리(자체 호스팅 libsodium 브라우저 빌드) — 감사 대상 아님
                      "libsodium*.mjs", "sodium-wrappers*.mjs"]
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".cjs",
            ".sql", ".css", ".html"}

def file_excluded(name: str) -> bool:
    return any(fnmatch.fnmatch(name, g) for g in EXCLUDE_FILE_GLOBS)

def walk_rel():
    """EXCLUDE_DIRS를 in-place로 가지치기하여 node_modules 등에 진입하지 않음."""
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        rroot = Path(root).relative_to(REPO)
        for f in files:
            if file_excluded(f):
                continue
            yield (rroot / f).as_posix() if str(rroot) != "." else f

# ── 전체 코드 파일 수집 ──────────────────────────────────────────────────
all_files = list(walk_rel())
all_code = {f for f in all_files if Path(f).suffix in CODE_EXT}

# ── 라우팅 규칙: (zip명, [glob ...]) ─────────────────────────────────────
# glob은 repo-relative posix. dir/** = 디렉토리 전체.
ROUTES = {
 "01-SECURITY-CORE": [
    "lib/crypto/**",
    "scripts/consent-crypto.check.mts", "scripts/consent-schema.check.mts",
    "scripts/consent-audit.check.mts", "scripts/consent-resend-scope.check.mts",
    "scripts/gen-entitlement-keys.mjs", "scripts/patch-libsodium-esm.mjs",
 ],
 "02-DATA-MAINLIB": [
    "lib/db.ts", "lib/db-init.ts", "lib/backup.ts",
    "lib/academic-year.ts", "lib/utils.ts",
    "lib/queries/**", "lib/export/**", "lib/constants/**",
    "scripts/seed.mjs", "scripts/seed-electron.cjs", "scripts/clear.mjs",
 ],
 "03-MAIN-IPC": [
    "electron/**",
 ],
 "04-SERVICES-AI-STT": [
    "lib/ai/**", "lib/stt/**", "src/lib/ai/**",
    "scripts/sanitize-output.check.mts", "scripts/redact.check.mts",
    "scripts/json-extract.check.mts", "scripts/token-estimate.check.mts",
    "scripts/llm-verify.mts",
 ],
 "05-RENDERER-PAGES": [
    "src/App.tsx", "src/main.tsx", "src/routes.tsx", "src/index.html",
    "src/pages/**", "src/hooks/**", "src/lib/queries/**",
 ],
 "06-RENDERER-FEATURES": [
    "src/components/sessions/**", "src/components/cases/**",
    "src/components/students/**", "src/components/consent/**",
    "src/components/calendar/**", "src/components/reports/**",
    "src/components/statistics/**", "src/components/dashboard/**",
 ],
 "07-RENDERER-UI-SHARED": [
    "src/components/ui/**", "src/components/layout/**",
    "src/components/ai/**", "src/components/stt/**",
    "src/globals.css", "src/assets/**",
    # src/lib 잔여 유틸 (ai/queries 제외)
    "src/lib/academic-year.ts", "src/lib/back-link.ts", "src/lib/case-staleness.ts",
    "src/lib/chart-palette.ts", "src/lib/constants/**", "src/lib/export/**",
    "src/lib/filter-sort.ts", "src/lib/format-student.ts", "src/lib/holidays.ts",
    "src/lib/theme.ts", "src/lib/utils.ts",
    "src/components/logo-wee-story.tsx", "src/components/logo-weenote.tsx",
    "design system/**",
    "scripts/filter-sort.check.mts", "scripts/format-student.check.mts",
    "scripts/holidays.check.mts", "scripts/academic-year.check.mts",
    "scripts/case-staleness.check.mts", "scripts/text-diff.check.mts",
    "scripts/options.check.mts",
 ],
 "08-EDGE-BACKEND": [
    "cloudflare/src/**", "cloudflare/test/**", "cloudflare/schema.sql", "supabase/**",
    "scripts/subscription/**", "scripts/sms-sim.mjs",
    "scripts/verify-phase3-behavior.mjs", "scripts/verify-phase3-units.mjs",
    "SUBSCRIPTION_DESIGN.md",
 ],
}

# 앵커(모든 zip 공통 — 단일대화 운영이라 00에만 1회 포함)
ANCHOR = {
 "files": ["CLAUDE.md", "package.json",
           "electron/preload.ts",
           "tsconfig.json", "tsconfig.node.json", "tsconfig.web.json",
           "tailwind.config.ts", ".eslintrc.json", "components.json",
           "postcss.config.mjs", "electron.vite.config.ts", "electron-builder.yml",
           "scripts/_assert.mts"],
 "globs": ["types/**", "src/types/**"],
}

def match(glob, files):
    if glob.endswith("/**"):
        pref = glob[:-3] + "/"
        return {f for f in files if f.startswith(pref)}
    return {f for f in files if f == glob or fnmatch.fnmatch(f, glob)}

# ── 라우팅 적용 + 커버리지 검사 ──────────────────────────────────────────
assigned = {}
covered = set()
for zipname, globs in ROUTES.items():
    sel = set()
    for g in globs:
        sel |= match(g, all_code)
    assigned[zipname] = sorted(sel)
    covered |= sel

anchor_files = set(ANCHOR["files"])
for g in ANCHOR["globs"]:
    anchor_files |= match(g, all_code)
# 앵커에 들어가는 코드파일도 covered로 인정
covered |= (anchor_files & all_code)

unassigned = sorted(all_code - covered)

# ── 빌드 함수 ────────────────────────────────────────────────────────────
def write_zip(name, rel_files, extra=None):
    zpath = OUT / f"{name}.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in sorted(rel_files):
            src = REPO / rel
            if src.exists():
                z.write(src, rel)
        if extra:
            for arc, content in extra.items():
                z.writestr(arc, content)
    size = zpath.stat().st_size
    return zpath, size, len(rel_files) + (len(extra) if extra else 0)

# ── 앵커 부속물 생성: 파일트리 / DB스키마 / MANIFEST ─────────────────────
def build_tree():
    return "\n".join(sorted(all_files))

def build_db_schema():
    db = REPO / "data" / "wee-log.db"
    if not db.exists():
        return "(data/wee-log.db 없음 — db-init.ts의 스키마 정의 참조)"
    try:
        schema = subprocess.check_output(["sqlite3", str(db), ".schema"], text=True)
        tables = subprocess.check_output(["sqlite3", str(db), ".tables"], text=True).split()
        counts = []
        for t in tables:
            try:
                c = subprocess.check_output(["sqlite3", str(db), f"SELECT COUNT(*) FROM {t};"], text=True).strip()
                counts.append(f"{t}: {c} rows")
            except Exception:
                pass
        return f"-- wee-log.db (페이크 데이터) 스키마 덤프\n-- 행수: {', '.join(counts)}\n-- 주의: ENC:v1:... 값은 AES-GCM 암호문, 컬럼명/구조만 참고\n\n{schema}"
    except Exception as e:
        return f"(스키마 덤프 실패: {e})"

file_tree = build_tree()
db_schema = build_db_schema()

route_table = "\n".join(
    f"- **{z}.zip** — {len(assigned[z])} 파일" for z in ROUTES
)

manifest = """# _ANCHOR / MANIFEST — 먼저 읽어라

이 자료는 Electron(33) + Vite + React(18) 로컬우선 상담기록 데스크톱 앱 **wee-log(제품명 Wee-Story)**의
정적 감사를 위한 분할 업로드다. 너는 **코드를 실행할 수 없는 정적 리뷰어**다.

## 운영 방식
- 단일 대화. `00-ANCHOR.zip`(이 파일 포함)을 먼저 받았고, 이후 `01`~`08`을 순서대로 받는다.
- 매 청크 리포트의 마지막 섹션 "6) 청크 밖과 얽힌 의심점"에 교차 의심을 남겨라(마지막 종합 패스에서 대조).
- 외부 심볼은 `_ANCHOR/`의 타입(`types/`, `src/types/electron.d.ts`)·`electron/preload.ts`(Renderer↔Main 계약)로
  "계약"만 확인. 안 보이는 코드는 추측 말고 "확인 필요"로 표기. 환각 금지.

## 청크 지도 (총 8 + 앵커)
__ROUTE_TABLE__

## 업로드(=감사) 순서 — 위험도 우선
01-SECURITY-CORE → 08-EDGE-BACKEND → 03-MAIN-IPC → 02-DATA-MAINLIB → 04-SERVICES → 05 → 06 → 07

## 아키텍처 한 줄 요약
- Main 프로세스(`electron/main.ts`)만 DB 접근. Renderer는 `window.api.*`(preload contextBridge)로 IPC.
- 암호화: AES-256-GCM, 포맷 `ENC:v1:{b64 iv}:{b64 ct+tag}`. `decrypt()`는 ENC 프리픽스 없으면 평문 반환(레거시 호환).
- 암호화 필드는 SQL WHERE 불가 → "전체 로드 후 JS 필터" 패턴(`lib/queries/`).
- 동의서: 별도 Cloudflare Worker가 호스팅, libsodium sealed box. 구독/엔타이틀먼트: Supabase + 서명.

## ⚠️ 모듈화 감사 핵심: lib/ ↔ src/lib/ 평행 중복
Main용 `lib/`와 Renderer용 `src/lib/`에 **이름이 같은 평행 모듈**이 존재한다. 단일출처화 대상인지 판단하라:
- `lib/academic-year.ts` ↔ `src/lib/academic-year.ts`
- `lib/utils.ts` ↔ `src/lib/utils.ts`
- `lib/constants/` ↔ `src/lib/constants/`
- `lib/export/` ↔ `src/lib/export/`
- `lib/queries/` ↔ `src/lib/queries/`
- `lib/ai/` ↔ `src/lib/ai/`
(주의: 분할상 main측은 02·04, renderer측은 05·07에 흩어져 있다. 각 청크 "섹션 6"에 중복 의심을 남겨라.)

## 제외된 것 (감사 범위 아님)
node_modules / 빌드산출물(.next·out·.wrangler) / 바이너리(binaries·ffmpeg) / **민감정보(.env·keys·실DB)**.
DB는 `_ANCHOR/db-schema.sql`로 스키마만 제공(페이크 데이터, 값은 암호문).

## 감사 5축 (각 청크 공통 출력 포맷)
1) 보안  2) 모듈화/아키텍처  3) 코드품질  4) 성능  5) 테스트 공백  6) 청크 밖과 얽힌 의심점
발견마다: [심각도 High/Med/Low] · 파일:라인 · 근거 · 구체적 수정안. 리팩토링은 의미 불변 전제 + 영향범위·순서.
""".replace("__ROUTE_TABLE__", route_table)

# ── 00-ANCHOR 빌드 ───────────────────────────────────────────────────────
extra_anchor = {
    "_ANCHOR/MANIFEST.md": manifest,
    "_ANCHOR/FILE-TREE.txt": file_tree,
    "_ANCHOR/db-schema.sql": db_schema,
}
zp, sz, n = write_zip("00-ANCHOR", anchor_files, extra=extra_anchor)
print(f"  00-ANCHOR.zip            {n:3d} files  {sz/1024:7.1f} KB")

# ── 01~08 빌드 ───────────────────────────────────────────────────────────
for zipname in ROUTES:
    zp, sz, n = write_zip(zipname, assigned[zipname])
    print(f"  {zipname}.zip{' '*(20-len(zipname))}{n:3d} files  {sz/1024:7.1f} KB")

# ── 커버리지 리포트 ──────────────────────────────────────────────────────
print("\n=== 커버리지 ===")
print(f"  전체 코드파일: {len(all_code)}")
print(f"  청크 할당:     {len(covered & all_code)}")
print(f"  앵커 포함:     {len(anchor_files & all_code)}")
if unassigned:
    print(f"  ⚠️ 미할당 {len(unassigned)}건:")
    for u in unassigned:
        print(f"     - {u}")
else:
    print("  ✅ 미할당 0 — 모든 코드파일이 어느 zip엔가 포함됨")
