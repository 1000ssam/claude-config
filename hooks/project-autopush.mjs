#!/usr/bin/env node
/**
 * project-autopush.mjs  —  프로젝트 리포 자동 커밋+푸시
 *
 * /mnt/c/dev (WSL) 또는 C:\dev (Windows) 바로 아래의 git 리포를 스캔해,
 * 변경분이 있으면 자동 커밋 후 origin 으로 push 한다.
 * Claude Code 의 SessionEnd / PreCompact 훅에서 호출된다. (명령어 없음)
 *
 * 사용:
 *   node project-autopush.mjs              실제 커밋+푸시
 *   node project-autopush.mjs --dry-run    무엇을 할지 로그만, 변경 없음
 *
 * 브랜치 규칙:
 *   - 커밋이 하나도 없는 빈 리포      → 현재 브랜치(main)에 최초 커밋
 *   - feature 브랜치 위             → 그 브랜치에 커밋
 *   - main/master (+커밋 존재)      → feat/autosync-YYYYMMDD 생성/재사용 후 거기 커밋
 *
 * 안전장치:
 *   - 커밋 직전 시크릿 패턴 스캔 → 걸리면 그 리포 통째로 건너뜀
 *   - 변경 파일 300개 초과 → .gitignore 누락 의심, 건너뜀
 *   - origin 리모트 없음 / detached HEAD → 건너뜀
 *   - 한 리포의 실패가 다른 리포로 번지지 않음
 *
 * 로그: ~/.claude/project-autopush.log  (최근 400줄 유지)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DRY = process.argv.includes('--dry-run');

const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
const DEV_DIR = isWSL ? '/mnt/c/dev' : 'C:\\dev';
const LOG_FILE = path.join(os.homedir(), '.claude', 'project-autopush.log');
const HOST = os.hostname();
const MAX_CHANGED_FILES = 300;

// config-sync.js 와 동일한 시크릿 패턴
const SECRET_PATTERNS = [
  /(^|\/)secrets(\.bak)?\//,
  /(^|\/)\.env(\..+)?$/,
  /\.token$/,
  /\.key$/,
  /\.pem$/,
  /(^|\/)credentials\.json$/,
  /(^|\/)\.credentials\.json$/,
];

const logLines = [];
function log(msg) {
  logLines.push(`[${new Date().toISOString()}] ${msg}`);
}

function git(repo, cmd) {
  return execSync(`git ${cmd}`, { cwd: repo, stdio: 'pipe', timeout: 30000 }).toString().trim();
}
function gitSafe(repo, cmd) {
  try { return git(repo, cmd); } catch { return null; }
}

// porcelain 한 줄 → 변경 경로(들). 리네임은 'old -> new' 양쪽 다 반환.
function pathsFromPorcelain(line) {
  const body = line.slice(3);
  return body.includes(' -> ') ? body.split(' -> ') : [body];
}

function detectSecrets(porcelainLines) {
  const hits = [];
  for (const line of porcelainLines) {
    for (const p of pathsFromPorcelain(line)) {
      if (SECRET_PATTERNS.some(re => re.test(p))) hits.push(p);
    }
  }
  return hits;
}

function listRepos(devDir) {
  if (!fs.existsSync(devDir)) return [];
  const repos = [];
  for (const entry of fs.readdirSync(devDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const repoPath = path.join(devDir, entry.name);
    // .git 은 디렉토리(일반 리포)일 수도 파일(worktree)일 수도 있음
    if (fs.existsSync(path.join(repoPath, '.git'))) repos.push(repoPath);
  }
  return repos;
}

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function processRepo(repo) {
  const name = path.basename(repo);

  const status = gitSafe(repo, 'status --porcelain');
  if (status === null) { log(`SKIP ${name}: git status 실패`); return; }
  const dirty = status.split('\n').filter(Boolean);

  // detached HEAD 보호 — symbolic-ref 가 실패하면 detached
  const branch = gitSafe(repo, 'symbolic-ref --short -q HEAD');
  if (!branch) {
    if (dirty.length) log(`SKIP ${name}: detached HEAD, 변경분 ${dirty.length}건 (수동 처리 필요)`);
    return;
  }

  const hasRemote = !!gitSafe(repo, 'remote');
  if (!hasRemote) {
    if (dirty.length) log(`SKIP ${name}: origin 리모트 없음, 변경분 ${dirty.length}건`);
    return;
  }

  let needPush = false;
  let targetBranch = branch;

  if (dirty.length) {
    if (dirty.length > MAX_CHANGED_FILES) {
      log(`SKIP ${name}: 변경 파일 ${dirty.length}개 — .gitignore 누락 의심, 수동 확인 필요`);
      return;
    }

    const secrets = detectSecrets(dirty);
    if (secrets.length) {
      log(`ABORT ${name}: 시크릿 의심 파일 → 커밋 건너뜀 — ${secrets.join(', ')}`);
      return;
    }

    // 브랜치 규칙: main/master 이고 커밋이 이미 존재하면 feat 브랜치로 우회
    const hasCommits = gitSafe(repo, 'rev-parse --verify -q HEAD') !== null;
    if (hasCommits && (branch === 'main' || branch === 'master')) {
      targetBranch = `feat/autosync-${todayStamp()}`;
    }

    if (DRY) {
      const where = targetBranch === branch ? branch : `${branch} → ${targetBranch} (신규/재사용)`;
      log(`WOULD ${name}: ${dirty.length}개 파일 커밋 [${where}] 후 push`);
      return;
    }

    try {
      if (targetBranch !== branch) {
        const exists = gitSafe(repo, `rev-parse --verify -q refs/heads/${targetBranch}`);
        git(repo, exists ? `checkout ${targetBranch}` : `checkout -b ${targetBranch}`);
        log(`${name}: main 보호 → 브랜치 ${targetBranch}`);
      }
      git(repo, 'add -A');
      const msg = `auto-sync ${new Date().toISOString().slice(0, 16).replace('T', ' ')} (${HOST})`;
      git(repo, `commit -m "${msg}"`);
      log(`${name}: 커밋 [${targetBranch}] — ${dirty.length}개 파일`);
      needPush = true;
    } catch (e) {
      log(`SKIP ${name}: 커밋 실패 — ${String(e.message).split('\n')[0]}`);
      return;
    }
  } else {
    // 변경 없음 — 미푸시 커밋이 있으면 push 만
    const ahead = gitSafe(repo, 'rev-list --count @{u}..HEAD');
    if (ahead && parseInt(ahead, 10) > 0) {
      if (DRY) { log(`WOULD ${name}: 미푸시 커밋 ${ahead}개 push`); return; }
      needPush = true;
    }
  }

  if (needPush) {
    try {
      git(repo, 'push -u origin HEAD');
      log(`${name}: push 완료 [${targetBranch}]`);
    } catch (e) {
      log(`FAIL ${name}: push 실패 — ${String(e.message).split('\n')[0]}`);
    }
  }
}

// ─────── 실행 ───────

const repos = listRepos(DEV_DIR);
log(`=== project-autopush 시작${DRY ? ' [DRY-RUN]' : ''} (${HOST}) — ${DEV_DIR}, git 리포 ${repos.length}개 ===`);
for (const repo of repos) {
  try {
    processRepo(repo);
  } catch (e) {
    log(`ERROR ${path.basename(repo)}: ${String(e.message).split('\n')[0]}`);
  }
}
log(`=== 종료 ===`);

// 로그 파일에 누적 (최근 400줄 유지)
try {
  let prev = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean) : [];
  prev = prev.concat(logLines);
  if (prev.length > 400) prev = prev.slice(-400);
  fs.writeFileSync(LOG_FILE, prev.join('\n') + '\n');
} catch { /* 로그 실패는 무시 */ }

// 콘솔에도 출력 (수동 실행 시 확인용)
console.log(logLines.join('\n'));
