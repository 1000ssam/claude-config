import { readFileSync, statSync, existsSync } from 'fs';
import { basename, join } from 'path';
import { homedir } from 'os';
import { slack } from 'file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs';

const TOKEN_PATHS = [
  join(homedir(), '.claude', 'secrets', 'slack-bot-token.txt'),
  '/mnt/c/Users/user/.claude/secrets/slack-bot-token.txt',
];
const TOKEN = readFileSync(TOKEN_PATHS.find(existsSync), 'utf-8').trim();

const CHANNEL = '#자동화메시지';
const FILES = [
  '/mnt/c/dev/running-challenge-3/samples/applefitness_watch.png',
  '/mnt/c/dev/running-challenge-3/samples/garmin_phone.jpg',
  '/mnt/c/dev/running-challenge-3/samples/garmin_watch.jpg',
  '/mnt/c/dev/running-challenge-3/samples/nrc_phone.jpg',
  '/mnt/c/dev/running-challenge-3/samples/nrc_watch.jpg',
];

async function slackForm(method, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
    body,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.error}`);
  return data;
}

const channelId = await slack.findChannel(CHANNEL);

const uploaded = [];
for (const path of FILES) {
  const filename = basename(path);
  const length = statSync(path).size;

  const { upload_url, file_id } = await slackForm('files.getUploadURLExternal', {
    filename,
    length: String(length),
  });

  const form = new FormData();
  form.append('file', new Blob([readFileSync(path)]), filename);
  const r = await fetch(upload_url, { method: 'POST', body: form });
  if (!r.ok) throw new Error(`Upload failed for ${filename}: ${r.status}`);

  uploaded.push({ id: file_id, title: filename });
  console.log(`  uploaded: ${filename}`);
}

const result = await slackForm('files.completeUploadExternal', {
  files: JSON.stringify(uploaded),
  channel_id: channelId,
});

console.log('done:', result.ok ? `${uploaded.length} files shared to ${CHANNEL}` : result);
