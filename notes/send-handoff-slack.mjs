import { readFileSync } from 'node:fs';
import { slack } from 'file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs';

const handoff = readFileSync('/mnt/c/dev/notiontalk-toolkit/HANDOFF.md', 'utf8');

const msg =
  '📋 *notiontalk-toolkit 핸드오프* — 이따 마저 읽고 작업하세요\n' +
  '경로: `/mnt/c/dev/notiontalk-toolkit/HANDOFF.md`\n\n' +
  '```\n' + handoff + '\n```';

const res = await slack.sendMessage('#자동화메시지', msg);
console.log('sent:', res.ts);
