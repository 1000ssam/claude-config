#!/usr/bin/env node
/**
 * probe-ytdlp.mjs — Notion AI 샌드박스에서 yt-dlp 자막 추출 가능 여부 검증
 *
 * 목적: "샌드박스에 yt-dlp가 있다"는 주장을 실제로 확인한다.
 *   1) yt-dlp 바이너리(또는 python -m yt_dlp)가 실제로 호출되는가
 *   2) 호출된다면 영상 1개에서 한글 자막을 실제로 받아오는가 (YouTube 안티봇 통과 여부)
 *
 * 사용법:
 *   node probe-ytdlp.mjs [YOUTUBE_URL]
 *   - 인자 없으면 아래 DEFAULT_URL 사용. 반드시 "한글 자막/자동자막이 있는" 영상으로 바꿔서 테스트.
 *   - 권장: 본인 채널의 최근 영상 URL 하나를 넣을 것.
 *
 * 출력 마지막의 ===== VERDICT ===== 블록만 복사해서 보내주면 됩니다.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DEFAULT_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // ← 한글 자막 있는 영상으로 교체 권장
const URL = process.argv[2] || DEFAULT_URL;

const log = (...a) => console.log(...a);
const hr = () => log("-".repeat(60));

// child_process 한 번 실행. spawn 자체가 막히는 경우(EPERM/ENOENT)도 잡는다.
function run(cmd, args, opts = {}) {
  try {
    const r = spawnSync(cmd, args, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 64,
      timeout: opts.timeout ?? 120000,
      ...opts,
    });
    return {
      spawned: r.error == null,
      code: r.status,
      signal: r.signal,
      stdout: (r.stdout || "").trim(),
      stderr: (r.stderr || "").trim(),
      error: r.error ? `${r.error.code || ""} ${r.error.message}`.trim() : null,
    };
  } catch (e) {
    return { spawned: false, code: null, stdout: "", stderr: "", error: `${e.code || ""} ${e.message}`.trim() };
  }
}

// ── 0. 런타임 정보 ────────────────────────────────────────────────
log("===== RUNTIME =====");
log("node      :", process.version);
log("platform  :", `${process.platform} ${process.arch}`);
log("fetch?    :", typeof fetch === "function" ? "yes" : "no");
log("PATH      :", (process.env.PATH || "").split(":").slice(0, 12).join(":") || "(empty)");
hr();

// ── 1. yt-dlp 호출 경로 탐색 ──────────────────────────────────────
// 직접 바이너리 → python3 -m yt_dlp → python -m yt_dlp 순으로 --version 시도
const candidates = [
  { label: "yt-dlp", cmd: "yt-dlp", base: ["--version"] },
  { label: "python3 -m yt_dlp", cmd: "python3", base: ["-m", "yt_dlp", "--version"] },
  { label: "python -m yt_dlp", cmd: "python", base: ["-m", "yt_dlp", "--version"] },
];

log("===== YT-DLP DETECTION =====");
let ytdlp = null; // { label, cmd, prefix:[] }
for (const c of candidates) {
  const r = run(c.cmd, c.base, { timeout: 20000 });
  const status = r.spawned ? `exit=${r.code}` : `spawn FAILED (${r.error})`;
  log(`[${c.label}] ${status}${r.stdout ? "  version=" + r.stdout.split("\n")[0] : ""}`);
  if (r.stderr) log("   stderr:", r.stderr.split("\n").slice(0, 3).join(" | "));
  if (r.spawned && r.code === 0 && !ytdlp) {
    ytdlp = { label: c.label, cmd: c.cmd, prefix: c.base.slice(0, -1) }; // --version 제거한 prefix
  }
}
hr();

if (!ytdlp) {
  log("===== VERDICT =====");
  log("YTDLP_PRESENT = NO");
  log("SUBS_DOWNLOADED = NO");
  log("NOTE: yt-dlp 호출 경로를 못 찾음. 위 DETECTION 섹션의 spawn 에러 메시지를 확인할 것.");
  log("      (ENOENT=바이너리 없음 / EPERM=프로세스 생성 차단됨)");
  process.exit(0);
}

log(`>> 사용 경로: ${ytdlp.label}`);
log(`>> 대상 URL : ${URL}`);
hr();

// ── 2. 자막 트랙 목록 조회 (다운로드 없이) ───────────────────────
// --list-subs 는 다운로드 없이 어떤 자막이 있는지 + 차단 여부를 빠르게 보여준다.
log("===== LIST SUBTITLES (--list-subs) =====");
const list = run(ytdlp.cmd, [...ytdlp.prefix, "--list-subs", "--skip-download", URL], { timeout: 60000 });
log("exit:", list.code, list.spawned ? "" : `(spawn failed: ${list.error})`);
if (list.stdout) log(list.stdout.split("\n").slice(0, 40).join("\n"));
if (list.stderr) log("STDERR:", list.stderr.split("\n").slice(0, 8).join("\n"));
hr();

// ── 3. 실제 한글 자막 다운로드 시도 ──────────────────────────────
const outDir = mkdtempSync(join(tmpdir(), "ytsub-"));
log("===== DOWNLOAD KO SUBS (json3) =====");
log("temp dir:", outDir);

// 원본 스크래퍼와 동일 옵션(--write-auto-sub --sub-lang ko --sub-format json3) + 수동자막도 함께
const dl = run(
  ytdlp.cmd,
  [
    ...ytdlp.prefix,
    "--write-auto-sub",
    "--write-sub",
    "--sub-lang", "ko",
    "--sub-format", "json3",
    "--skip-download",
    "-o", join(outDir, "%(id)s.%(ext)s"),
    URL,
  ],
  { timeout: 120000 }
);
log("exit:", dl.code, dl.spawned ? "" : `(spawn failed: ${dl.error})`);
if (dl.stdout) log("STDOUT:", dl.stdout.split("\n").slice(0, 15).join("\n"));
if (dl.stderr) log("STDERR:", dl.stderr.split("\n").slice(0, 15).join("\n"));

// 생성된 자막 파일 확인
let subFiles = [];
try {
  subFiles = readdirSync(outDir).filter((f) => /\.(json3|vtt|srv\d|ttml|srt)$/i.test(f));
} catch {}
log("created sub files:", subFiles.length ? subFiles.join(", ") : "(none)");

let snippet = "";
let subBytes = 0;
if (subFiles.length) {
  const f = join(outDir, subFiles[0]);
  subBytes = statSync(f).size;
  snippet = readFileSync(f, "utf8").slice(0, 400);
  log(`first file size: ${subBytes} bytes`);
  log("snippet:", snippet.replace(/\s+/g, " ").slice(0, 300));
}

// 정리
try { rmSync(outDir, { recursive: true, force: true }); } catch {}
hr();

// ── 4. 최종 판정 ─────────────────────────────────────────────────
const subsOk = subFiles.length > 0 && subBytes > 50;
log("===== VERDICT =====");
log("YTDLP_PRESENT   = YES  (" + ytdlp.label + ")");
log("LIST_SUBS_EXIT  = " + list.code);
log("DOWNLOAD_EXIT   = " + dl.code);
log("SUBS_DOWNLOADED = " + (subsOk ? "YES" : "NO"));
if (!subsOk) {
  log("NOTE: 바이너리는 있으나 자막 추출 실패. 위 DOWNLOAD STDERR 의 차단/에러 메시지가 핵심.");
  log("      (예: 'Sign in to confirm', HTTP 429, 'no subtitles' 등)");
} else {
  log("NOTE: 자막 추출 성공 → 원본 yt-dlp 자막 로직을 샌드박스 패키지에 복원 가능.");
}
