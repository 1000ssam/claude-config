#!/usr/bin/env node
/**
 * Claude Code 설정 동기화 스크립트
 * 사용법:
 *   node config-sync.js --pull   (원격 → 로컬)
 *   node config-sync.js --push   (로컬 → 원격, 기본값)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLAUDE_DIR = path.join(require('os').homedir(), '.claude');
const REPO_DIR = path.join(CLAUDE_DIR, 'config-repo');

// 동기화 대상 매핑: [소스 (CLAUDE_DIR 기준), 목적지 (REPO_DIR 기준)]
const FILE_MAP = [
  ['CLAUDE.md', 'CLAUDE.md'],
  ['settings.json', 'settings.json'],
  ['mcp.json', 'mcp.json'],
  ['statusline-command.sh', 'statusline-command.sh'],
];

const DIR_MAP = [
  ['knowledge', 'knowledge'],
  ['commands', 'commands'],
  ['hooks', 'hooks'],
  [path.join('projects', 'C--Users-user', 'memory'), 'memory'],
];

function copyFile(src, dst) {
  const dir = path.dirname(dst);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });

  // 목적지에서 소스에 없는 파일 삭제 (동기화 유지)
  if (fs.existsSync(dst)) {
    for (const f of fs.readdirSync(dst, { withFileTypes: true })) {
      const srcPath = path.join(src, f.name);
      const dstPath = path.join(dst, f.name);
      if (!fs.existsSync(srcPath)) {
        if (f.isDirectory()) fs.rmSync(dstPath, { recursive: true });
        else fs.unlinkSync(dstPath);
      }
    }
  }

  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, f.name);
    const dstPath = path.join(dst, f.name);
    if (f.isDirectory()) copyDir(srcPath, dstPath);
    else copyFile(srcPath, dstPath);
  }
}

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: REPO_DIR, stdio: 'pipe', timeout: 15000 }).toString().trim();
}

function push() {
  // 로컬 → 리포로 복사
  for (const [src, dst] of FILE_MAP) {
    const srcPath = path.join(CLAUDE_DIR, src);
    if (fs.existsSync(srcPath)) copyFile(srcPath, path.join(REPO_DIR, dst));
  }
  for (const [src, dst] of DIR_MAP) {
    copyDir(path.join(CLAUDE_DIR, src), path.join(REPO_DIR, dst));
  }

  // 변경사항 확인 후 commit + push
  try {
    git('add -A');
    const status = git('diff --cached --quiet 2>&1 || echo changed');
    if (!status.includes('changed')) return; // 변경 없음
    git('commit -m "auto-sync"');
    git('push -u origin main');
  } catch (_) {
    // 네트워크 실패 등 — 다음에 재시도
  }
}

function pull() {
  try {
    git('fetch origin main');
    git('reset --hard origin/main');
  } catch (_) {
    return; // 원격 없거나 네트워크 실패
  }

  // 리포 → 로컬로 복사
  for (const [src, dst] of FILE_MAP) {
    const repoPath = path.join(REPO_DIR, dst);
    if (fs.existsSync(repoPath)) copyFile(repoPath, path.join(CLAUDE_DIR, src));
  }
  for (const [src, dst] of DIR_MAP) {
    const repoPath = path.join(REPO_DIR, dst);
    if (fs.existsSync(repoPath)) {
      const claudePath = path.join(CLAUDE_DIR, src);
      copyDir(repoPath, claudePath);
    }
  }
}

// 실행
const mode = process.argv[2] || '--push';
if (mode === '--pull') pull();
else push();
