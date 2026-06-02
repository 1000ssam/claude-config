#!/usr/bin/env node
/**
 * YouTube Channel RSS Scraper — Notion AI Sandbox 버전
 *
 * 단일 파일, 외부 패키지 없음 (Node 18+ 내장 fetch 사용).
 * Notion DB에 RSS 기반 신규 영상 메타데이터를 upsert.
 *
 * 자막 본문은 이 버전에서 제외됨 (샌드박스 yt-dlp 미보장).
 * 자막까지 필요하면 로컬 PC용 원본 사용.
 *
 * 환경변수:
 *   NOTION_TOKEN    — Notion Internal Integration Token (필수)
 *   NOTION_DB_ID    — 적재 대상 DB ID (필수, --db-id로 오버라이드 가능)
 *
 * Usage:
 *   node scrape.mjs                       # 최근 7일, channels.json 전체
 *   node scrape.mjs --days 14             # 최근 14일
 *   node scrape.mjs --channel UC_xxx      # 특정 채널만
 *   node scrape.mjs --db-id <db-id>       # 대상 DB 오버라이드
 *   node scrape.mjs --channels-json '[{"id":"UC_xxx","name":"X"}]'  # 인라인 채널
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI 인자 ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const DAYS = parseInt(getArg('--days') || '7', 10);
const FILTER_CHANNEL = getArg('--channel');
const DB_ID = getArg('--db-id') || process.env.NOTION_DB_ID;
const INLINE_CHANNELS = getArg('--channels-json');

if (!process.env.NOTION_TOKEN) {
  console.error('NOTION_TOKEN 환경변수가 필요합니다.');
  process.exit(1);
}
if (!DB_ID) {
  console.error('NOTION_DB_ID 환경변수 또는 --db-id 인자가 필요합니다.');
  process.exit(1);
}

// ── 채널 목록 ─────────────────────────────────────────────────
let channels;
if (INLINE_CHANNELS) {
  channels = JSON.parse(INLINE_CHANNELS);
} else {
  const p = join(__dirname, 'channels.json');
  if (!existsSync(p)) {
    console.error('channels.json 이 없습니다. --channels-json 인자로 인라인 전달하거나 같은 폴더에 두세요.');
    process.exit(1);
  }
  channels = JSON.parse(readFileSync(p, 'utf-8'));
}
if (FILTER_CHANNEL) {
  channels = channels.filter((c) => c.id === FILTER_CHANNEL);
  if (channels.length === 0) {
    console.error(`채널 ID를 찾을 수 없습니다: ${FILTER_CHANNEL}`);
    process.exit(1);
  }
}

// ── Notion 미니 클라이언트 (필수 기능만 인라인) ───────────────
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2026-03-11';
const _dsCache = new Map();

async function notionCall(method, path, body) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || `Notion API ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

async function resolveDsId(dbId) {
  if (_dsCache.has(dbId)) return _dsCache.get(dbId);
  const db = await notionCall('GET', `/databases/${dbId}`);
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`data_source not found for db ${dbId}`);
  _dsCache.set(dbId, dsId);
  return dsId;
}

async function notionQueryAll(dbId, filter) {
  const dsId = await resolveDsId(dbId);
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (filter) body.filter = filter;
    if (cursor) body.start_cursor = cursor;
    const r = await notionCall('POST', `/data_sources/${dsId}/query`, body);
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

async function notionCreatePage(dbId, properties, cover) {
  const body = { parent: { database_id: dbId }, properties };
  if (cover) body.cover = cover;
  try {
    return await notionCall('POST', '/pages', body);
  } catch (e) {
    if (e.status === 404) {
      body.parent = { data_source_id: dbId };
      return notionCall('POST', '/pages', body);
    }
    throw e;
  }
}

async function notionUpdatePage(pageId, patch) {
  return notionCall('PATCH', `/pages/${pageId}`, patch);
}

const prop = {
  title: (t) => ({ title: [{ text: { content: t } }] }),
  richText: (t) => ({ rich_text: [{ text: { content: t } }] }),
  select: (n) => ({ select: { name: n } }),
  url: (u) => ({ url: u }),
  date: (s) => ({ date: { start: s } }),
  checkbox: (b) => ({ checkbox: b }),
};

// ── RSS 파싱 ──────────────────────────────────────────────────
function parseRSS(xml) {
  const entries = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return r ? r[1].trim() : '';
    };
    const videoId = get('yt:videoId');
    if (!videoId) continue;
    entries.push({
      videoId,
      title: get('title'),
      published: get('published'),
      url: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }
  return entries;
}

function isoDate(s) { return new Date(s).toISOString().slice(0, 10); }
function cutoffDate() {
  const d = new Date(); d.setDate(d.getDate() - DAYS); return d;
}

// ── 메인 ──────────────────────────────────────────────────────
const cutoff = cutoffDate();
const allNew = [];
const stats = { channels: 0, rss: 0, dateFiltered: 0, existing: 0, processed: 0 };

// 기존 영상 제목 셋 (한 번에 로드)
let existingTitles = new Set();
try {
  const pages = await notionQueryAll(DB_ID);
  existingTitles = new Set(
    pages.map((p) => p.properties?.제목?.title?.[0]?.plain_text).filter(Boolean)
  );
  console.log(`기존 DB 영상: ${existingTitles.size}개`);
} catch (e) {
  console.warn(`기존 영상 조회 실패 — 전부 신규로 처리: ${e.message}`);
}

for (const ch of channels) {
  console.log(`\n[채널] ${ch.name} (${ch.id})`);
  stats.channels++;
  let xml;
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`);
    if (!r.ok) { console.log(`  RSS 응답 ${r.status} — 스킵`); continue; }
    xml = await r.text();
  } catch (e) {
    console.log(`  RSS fetch 실패: ${e.message} — 스킵`);
    continue;
  }
  const entries = parseRSS(xml);
  stats.rss += entries.length;
  console.log(`  RSS: ${entries.length}개`);

  const recent = entries.filter((e) => new Date(e.published) >= cutoff);
  stats.dateFiltered += entries.length - recent.length;
  console.log(`  최근 ${DAYS}일: ${recent.length}개`);

  const fresh = recent.filter((v) => !existingTitles.has(v.title));
  stats.existing += recent.length - fresh.length;
  console.log(`  신규: ${fresh.length}개`);

  for (const v of fresh) {
    allNew.push({ ...v, channel: ch.name, publishDate: isoDate(v.published) });
    existingTitles.add(v.title);
  }
}

// ── Notion upsert ─────────────────────────────────────────────
let created = 0, failed = 0;
for (const v of allNew) {
  try {
    await notionCreatePage(
      DB_ID,
      {
        '제목': prop.title(v.title),
        '영상ID': prop.richText(v.videoId),
        '채널': prop.select(v.channel),
        'URL': prop.url(v.url),
        '게시일': prop.date(v.publishDate),
        'by AI': prop.checkbox(true),
      },
      { type: 'external', external: { url: `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg` } }
    );
    created++;
    stats.processed++;
  } catch (e) {
    failed++;
    console.warn(`  생성 실패: ${v.videoId} — ${e.message}`);
  }
}

console.log(`
══════════════════════════════════
  완료 리포트
══════════════════════════════════
  채널: ${stats.channels}개
  RSS: ${stats.rss}개
  날짜 필터 제외: ${stats.dateFiltered}개
  기존 스킵: ${stats.existing}개
  신규 생성: ${created}개
  실패: ${failed}개
══════════════════════════════════`);

if (allNew.length > 0) {
  console.log('\n신규 영상:');
  for (const v of allNew) console.log(`  - [${v.channel}] ${v.title} (${v.publishDate})`);
}
