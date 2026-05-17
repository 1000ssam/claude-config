#!/usr/bin/env node
/**
 * Claude Code 설정 동기화 스크립트 (수동 트리거 전용)
 *
 * 사용법:
 *   node config-sync.js --pull            (들여올 변경 미리보기)
 *   node config-sync.js --pull --apply    (실제 pull 적용)
 *   node config-sync.js --pull --apply --force   (로컬 dirty 상태도 무시하고 강제)
 *   node config-sync.js --push            (보낼 변경 미리보기)
 *   node config-sync.js --push --apply    (실제 push 적용)
 *   node config-sync.js --push --apply --allow-secrets  (시크릿 경고 무시, 위험)
 *
 * 안전 디폴트: --apply 없이는 working tree만 갱신하고 git에는 손대지 않음.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HOME_DIR = require('os').homedir();
const CLAUDE_DIR = path.join(HOME_DIR, '.claude');
const REPO_DIR = path.join(CLAUDE_DIR, 'config-repo');

const FILE_MAP = [
  ['CLAUDE.md', 'CLAUDE.md'],
  ['settings.json', 'settings.json'],
  ['mcp.json', 'mcp.json'],
  ['statusline-command.sh', 'statusline-command.sh'],
];

// 메모리 디렉토리는 플랫폼별로 경로가 다름 (WSL: -home-user, Windows: C--Users-user)
// projects/ 아래에서 가장 최근에 수정된 memory 디렉토리를 자동 선택
function findLocalMemoryRel() {
  const projectsDir = path.join(CLAUDE_DIR, 'projects');
  if (!fs.existsSync(projectsDir)) return path.join('projects', '-home-user', 'memory');
  const cands = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({
      rel: path.join('projects', d.name, 'memory'),
      abs: path.join(projectsDir, d.name, 'memory'),
    }))
    .filter(c => fs.existsSync(c.abs));
  if (!cands.length) return path.join('projects', '-home-user', 'memory');
  cands.sort((a, b) => fs.statSync(b.abs).mtimeMs - fs.statSync(a.abs).mtimeMs);
  return cands[0].rel;
}

const DIR_MAP = [
  ['knowledge', 'knowledge'],
  ['commands', 'commands'],
  ['hooks', 'hooks'],
  [findLocalMemoryRel(), 'memory'],
];

const isWSL = process.platform === 'linux' && fs.existsSync('/mnt/c');
const NOTES_DIR = isWSL ? '/mnt/c/dev/notes' : 'C:\\dev\\notes';
const EXTRA_DIR_MAP = [
  [NOTES_DIR, 'notes'],
];

// settings.json 에서 양방향으로 무시할 머신별 필드(로컬 값을 항상 보존)
const LOCAL_ONLY_SETTINGS_FIELDS = ['hooks', 'model', 'env'];

const SECRET_PATTERNS = [
  /(^|\/)secrets(\.bak)?\//,
  /(^|\/)\.env(\..+)?$/,
  /\.token$/,
  /\.key$/,
  /\.pem$/,
  /(^|\/)credentials\.json$/,
  /(^|\/)\.credentials\.json$/,
];

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function git(cmd, opts = {}) {
  const out = execSync(`git ${cmd}`, {
    cwd: REPO_DIR,
    stdio: opts.inherit ? 'inherit' : 'pipe',
    timeout: 30000,
  });
  // stdio: 'inherit' 인 경우 execSync 는 null 을 반환한다.
  return out ? out.toString().trim() : '';
}

function gitSafe(cmd) {
  try { return git(cmd); } catch (_) { return ''; }
}

function copyFile(src, dst) {
  const dir = path.dirname(dst);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });

  for (const f of fs.readdirSync(dst, { withFileTypes: true })) {
    const srcPath = path.join(src, f.name);
    const dstPath = path.join(dst, f.name);
    if (!fs.existsSync(srcPath)) {
      if (f.isDirectory()) fs.rmSync(dstPath, { recursive: true });
      else fs.unlinkSync(dstPath);
    }
  }

  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, f.name);
    const dstPath = path.join(dst, f.name);
    if (f.isDirectory()) copyDir(srcPath, dstPath);
    else copyFile(srcPath, dstPath);
  }
}

// settings.json 머지: LOCAL_ONLY_SETTINGS_FIELDS 는 양방향 모두 로컬 값 보존
function mergeSettings(localPath, repoPath, direction) {
  const local = fs.existsSync(localPath) ? JSON.parse(fs.readFileSync(localPath, 'utf8')) : {};
  const repo = fs.existsSync(repoPath) ? JSON.parse(fs.readFileSync(repoPath, 'utf8')) : {};

  const stripLocalOnly = (obj) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!LOCAL_ONLY_SETTINGS_FIELDS.includes(k)) out[k] = v;
    }
    return out;
  };
  const pickLocalOnly = (obj) => {
    const out = {};
    for (const k of LOCAL_ONLY_SETTINGS_FIELDS) {
      if (obj[k] !== undefined) out[k] = obj[k];
    }
    return out;
  };

  if (direction === 'push') {
    // local → repo: repo 의 로컬 전용 필드 그대로 두고, 나머지만 로컬로 덮어씀
    const merged = { ...stripLocalOnly(repo), ...stripLocalOnly(local), ...pickLocalOnly(repo) };
    fs.writeFileSync(repoPath, JSON.stringify(merged, null, 2) + '\n');
  } else {
    // repo → local: local 의 로컬 전용 필드 그대로 두고, 나머지만 repo 로 덮어씀
    const merged = { ...stripLocalOnly(local), ...stripLocalOnly(repo), ...pickLocalOnly(local) };
    fs.writeFileSync(localPath, JSON.stringify(merged, null, 2) + '\n');
  }
}

function doPushCopy() {
  for (const [src, dst] of FILE_MAP) {
    const srcPath = path.join(CLAUDE_DIR, src);
    const dstPath = path.join(REPO_DIR, dst);
    if (src === 'settings.json') {
      mergeSettings(srcPath, dstPath, 'push');
      continue;
    }
    if (fs.existsSync(srcPath)) copyFile(srcPath, dstPath);
  }
  for (const [src, dst] of DIR_MAP) {
    copyDir(path.join(CLAUDE_DIR, src), path.join(REPO_DIR, dst));
  }
  for (const [src, dst] of EXTRA_DIR_MAP) {
    copyDir(src, path.join(REPO_DIR, dst));
  }
}

function doPullCopy() {
  for (const [src, dst] of FILE_MAP) {
    const repoPath = path.join(REPO_DIR, dst);
    const localPath = path.join(CLAUDE_DIR, src);
    if (!fs.existsSync(repoPath)) continue;
    if (src === 'settings.json') {
      mergeSettings(localPath, repoPath, 'pull');
      continue;
    }
    copyFile(repoPath, localPath);
  }
  for (const [src, dst] of DIR_MAP) {
    const repoPath = path.join(REPO_DIR, dst);
    if (fs.existsSync(repoPath)) copyDir(repoPath, path.join(CLAUDE_DIR, src));
  }
  for (const [src, dst] of EXTRA_DIR_MAP) {
    const repoPath = path.join(REPO_DIR, dst);
    if (fs.existsSync(repoPath)) copyDir(repoPath, src);
  }
}

function statusPorcelain() {
  const out = gitSafe('status --porcelain');
  return out ? out.split('\n').filter(Boolean) : [];
}

function detectSecrets(paths) {
  return paths.filter(p => SECRET_PATTERNS.some(re => re.test(p)));
}

// ─────── PUSH ───────

function pushDryRun() {
  doPushCopy();
  const status = statusPorcelain();
  if (!status.length) {
    console.log(`${GREEN}변경 없음.${RESET} push 할 내용이 없습니다.`);
    return;
  }
  console.log('## Push 예정 변경사항 (working tree → origin/main)');
  status.forEach(l => console.log('  ' + l));

  const paths = status.map(l => l.slice(3));
  const leaks = detectSecrets(paths);
  if (leaks.length) {
    console.log(`\n${RED}[경고] 시크릿 의심 파일 감지:${RESET}`);
    leaks.forEach(f => console.log(`  - ${f}`));
    console.log(`${RED}--apply 시 자동 차단됩니다. 통과시키려면 .gitignore 보강 또는 --allow-secrets.${RESET}`);
  }
  console.log('\n실제 push: 같은 명령에 --apply 추가하여 재실행.');
}

function pushApply(allowSecrets) {
  doPushCopy();
  git('add -A');
  const staged = gitSafe('diff --cached --name-only').split('\n').filter(Boolean);
  if (!staged.length) {
    console.log(`${GREEN}변경 없음.${RESET}`);
    return;
  }
  const leaks = detectSecrets(staged);
  if (leaks.length && !allowSecrets) {
    console.error(`${RED}[ABORT] 시크릿 의심 파일이 staging 에 들어왔습니다:${RESET}`);
    leaks.forEach(f => console.error(`  - ${f}`));
    console.error(`${RED}.gitignore 에 추가하거나 --allow-secrets (위험) 으로 강제.${RESET}`);
    git('reset');
    process.exit(2);
  }
  git('commit -m "auto-sync"');
  try {
    git('push -u origin main', { inherit: true });
    console.log(`${GREEN}Push 완료.${RESET}`);
  } catch (e) {
    console.error(`${RED}Push 실패:${RESET} ${e.message}`);
    process.exit(4);
  }
}

// ─────── PULL ───────

function pullDryRun() {
  try {
    git('fetch origin main');
  } catch (e) {
    console.error(`${RED}fetch 실패:${RESET} ${e.message}`);
    process.exit(1);
  }
  const log = gitSafe('log HEAD..FETCH_HEAD --oneline');
  if (!log) {
    console.log(`${GREEN}원격에 새 변경 없음.${RESET}`);
  } else {
    console.log('## Pull 들여올 커밋');
    console.log(log);
    console.log('\n## 파일 변경 (HEAD → FETCH_HEAD)');
    console.log(gitSafe('diff --stat HEAD FETCH_HEAD'));
  }
  const dirty = statusPorcelain();
  if (dirty.length) {
    console.log(`\n${YELLOW}[주의] 로컬 working tree 에 미커밋 변경이 있습니다:${RESET}`);
    dirty.forEach(l => console.log('  ' + l));
    console.log(`${YELLOW}--apply 시 차단됩니다. 먼저 push 하거나 --force 로 강제.${RESET}`);
  }
  if (log) console.log('\n실제 pull: 같은 명령에 --apply 추가하여 재실행.');
}

function pullApply(force) {
  try {
    git('fetch origin main');
  } catch (e) {
    console.error(`${RED}fetch 실패:${RESET} ${e.message}`);
    process.exit(1);
  }
  const dirty = statusPorcelain();
  if (dirty.length && !force) {
    console.error(`${RED}[ABORT] 로컬에 미커밋 변경이 있습니다:${RESET}`);
    dirty.forEach(l => console.error('  ' + l));
    console.error(`${RED}먼저 push 하거나 --force 로 강제.${RESET}`);
    process.exit(3);
  }
  const log = gitSafe('log HEAD..FETCH_HEAD --oneline');
  if (!log) {
    console.log(`${GREEN}원격에 새 변경 없음. 종료.${RESET}`);
    return;
  }
  git('reset --hard origin/main');
  doPullCopy();
  console.log(`${GREEN}Pull 완료.${RESET}`);
}

// ─────── 진입점 ───────

const args = process.argv.slice(2);
const mode = args.includes('--pull') ? 'pull' : args.includes('--push') ? 'push' : null;
const apply = args.includes('--apply') || args.includes('--yes');
const force = args.includes('--force');
const allowSecrets = args.includes('--allow-secrets');

if (!mode) {
  console.error('사용법: node config-sync.js [--pull|--push] [--apply] [--force] [--allow-secrets]');
  process.exit(64);
}

if (mode === 'pull') {
  if (apply) pullApply(force);
  else pullDryRun();
} else {
  if (apply) pushApply(allowSecrets);
  else pushDryRun();
}
