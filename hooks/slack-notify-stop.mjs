#!/usr/bin/env node
// Stop hook: 한 턴(사람 프롬프트→응답 종료)이 THRESHOLD분 이상 걸렸으면
// #자동화메시지 에 완료 알림을 보낸다. 모델의 자발적 기억에 의존하지 않는
// 결정론적 트리거. 실패해도 세션을 막지 않는다(항상 exit 0).
//
// 트리거 정확도: "마지막 사람 프롬프트 timestamp → now" 경과로 판정 →
// 빠른 턴엔 안 울리고, Claude가 실제로 ≥5분 작업한 턴에만 1회 울림(스팸/중간오발 없음).
import { readFileSync } from 'node:fs';

const THRESHOLD_MS = 5 * 60 * 1000; // 5분
const CHANNEL = '#자동화메시지';

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

async function main() {
  let input = {};
  try { input = JSON.parse(readStdin() || '{}'); } catch {}
  const tp = input.transcript_path;
  if (!tp) return;

  let lines;
  try { lines = readFileSync(tp, 'utf8').trim().split('\n'); } catch { return; }

  let lastPromptTs = null;     // 마지막 '사람' 프롬프트 시각
  let lastAssistantText = '';  // 마지막 assistant 텍스트(요약용)
  for (const ln of lines) {
    let e; try { e = JSON.parse(ln); } catch { continue; }
    const msg = e.message;
    if (e.type === 'user' && msg) {
      const c = msg.content;
      const isToolResult = Array.isArray(c) && c.length > 0 && c.every(x => x && x.type === 'tool_result');
      const isRealText = typeof c === 'string'
        ? c.trim().length > 0
        : Array.isArray(c) && c.some(x => x && x.type === 'text');
      // 슬래시커맨드 stdout 등 메타 user 엔트리 제외
      if (!isToolResult && isRealText && !e.isMeta) lastPromptTs = e.timestamp;
    } else if (e.type === 'assistant' && msg && Array.isArray(msg.content)) {
      const t = msg.content.filter(x => x && x.type === 'text').map(x => x.text).join('').trim();
      if (t) lastAssistantText = t;
    }
  }

  if (!lastPromptTs) return;
  const elapsed = Date.now() - new Date(lastPromptTs).getTime();
  if (!(elapsed >= THRESHOLD_MS)) return; // 짧은 턴 → 무음

  // 한 줄 요약: 마지막 assistant 텍스트 첫 의미 줄, 마크다운/이모지 제거
  let summary = (lastAssistantText.split('\n').map(s => s.trim()).find(s => s.length > 0) || '작업 완료')
    .replace(/[*_`#>~]/g, '')
    .replace(/^[-•\d.\s]+/, '')
    .slice(0, 70);
  const mins = Math.round(elapsed / 60000);

  const text = `✅ 작업 완료: ${summary} (${mins}분)`;
  if (process.env.SLACK_NOTIFY_DRYRUN === '1') { console.log('[dryrun] ' + text); return; }
  try {
    const { slack } = await import('file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs');
    await slack.sendMessage(CHANNEL, text);
  } catch {}
}

main().catch(() => {}).finally(() => process.exit(0));
