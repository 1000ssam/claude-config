// READ-ONLY subscriber list hygiene scan.
// Loads env from phase3 worktree, paginates ALL subscribers from Notion,
// and analyzes email quality. Does NOT write/update/archive anything.
import { createRequire } from "node:module";
import fs from "node:fs";

// Load @notionhq/client from the phase3 worktree by absolute path
// (this script lives in /mnt/c/dev/notes/ which has no node_modules).
const require = createRequire("/mnt/c/dev/newsletter-self-host-phase3/package.json");
const { Client } = require("/mnt/c/dev/newsletter-self-host-phase3/node_modules/@notionhq/client");

const ENV_PATH = "/mnt/c/dev/newsletter-self-host-phase3/.env";
const SUSPECTS_OUT = "/mnt/c/dev/notes/list-hygiene-suspects.txt";

// --- minimal .env loader (no external dep) ---
function loadEnv(path) {
  const txt = fs.readFileSync(path, "utf8");
  const env = {};
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv(ENV_PATH);
const TOKEN = env.NOTION_TOKEN;
const DB_ID = env.NOTION_SUBSCRIBERS_DB_ID;
if (!TOKEN || !DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_SUBSCRIBERS_DB_ID in env");
  process.exit(1);
}

const PROP = { email: "Email", status: "Status", name: "Name" };
const client = new Client({ auth: TOKEN });

function pageToSub(page) {
  const props = page.properties ?? {};
  return {
    pageId: page.id,
    email: props[PROP.email]?.title?.[0]?.plain_text ?? "",
    status: props[PROP.status]?.select?.name ?? "(none)",
    name: props[PROP.name]?.rich_text?.[0]?.plain_text || undefined,
  };
}

// READ ONLY: databases.query with full pagination, NO filter (fetch everyone)
async function fetchAll() {
  const out = [];
  let cursor = undefined;
  do {
    const res = await client.databases.query({
      database_id: DB_ID,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const page of res.results) out.push(pageToSub(page));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return out;
}

function mask(email) {
  if (!email || !email.includes("@")) return email || "(empty)";
  const [local, domain] = email.split("@");
  const ml = local.length <= 2 ? local[0] + "*" : local.slice(0, 2) + "*".repeat(Math.max(1, local.length - 2));
  const dotIdx = domain.lastIndexOf(".");
  let md;
  if (dotIdx <= 0) {
    md = domain[0] + "*".repeat(Math.max(1, domain.length - 1));
  } else {
    const host = domain.slice(0, dotIdx);
    const tld = domain.slice(dotIdx); // includes dot
    const mh = host.length <= 2 ? host[0] + "*" : host[0] + "*".repeat(Math.max(1, host.length - 2)) + host.slice(-1);
    md = mh + tld;
  }
  return `${ml}@${md}`;
}

// RFC-ish: not perfect, catches obvious malformed
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// common Korean + global typo domains
const TYPO_DOMAINS = new Set([
  "gmial.com", "gmai.com", "gamil.com", "gmail.con", "gmail.co", "gmail.cm",
  "gmaill.com", "gmail.comm", "gnail.com", "gmal.com", "gmail.om",
  "naver.con", "naver.co", "naver.cmo", "navre.com", "nver.com", "nave.com", "naver.om",
  "hanmail.ne", "hanmail.nt", "hanmai.net", "hanmal.net",
  "daum.ner", "daum.nt", "daun.net", "dau.net",
  "nate.con", "nate.co", "nate.cm",
  "kakao.con", "kakao.co", "kakap.com", "kako.com", "kakao.cm",
  "yaho.com", "yahoo.con", "yahoo.co", "hotmial.com", "hotmail.con", "outlok.com",
]);

const ROLE_LOCALS = new Set([
  "admin", "administrator", "test", "tester", "noreply", "no-reply", "donotreply",
  "do-not-reply", "postmaster", "webmaster", "root", "info", "support", "abuse",
  "mailer-daemon", "hostmaster", "example", "sample", "demo", "asdf", "qwer",
]);
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com",
  "temp-mail.org", "throwaway.email", "yopmail.com", "trashmail.com",
  "getnada.com", "sharklasers.com", "example.com", "test.com", "test.test",
]);

const subs = await fetchAll();

// status breakdown
const statusCounts = {};
for (const s of subs) statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;

// --- extra format edge-case sanity (catches things the permissive RFC-ish regex tolerates) ---
const formatWarn = [];
for (const s of subs) {
  const raw = s.email ?? "";
  const norm = raw.trim().toLowerCase();
  const issues = [];
  if (raw !== raw.trim()) issues.push("leading/trailing whitespace");
  if (/\s/.test(norm)) issues.push("internal whitespace");
  if ((norm.match(/@/g) || []).length !== 1) issues.push("@ count != 1");
  if (/\.\./.test(norm)) issues.push("consecutive dots");
  if (norm.startsWith(".") || norm.includes(".@") || norm.includes("@.")) issues.push("dot at boundary");
  if (norm.endsWith(".")) issues.push("trailing dot");
  if (/[^\x00-\x7f]/.test(norm)) issues.push("non-ascii char");
  if (norm.includes(",") || norm.includes(";")) issues.push("comma/semicolon (multi-address?)");
  const tld = norm.split(".").pop() || "";
  if (norm.includes(".") && tld.length < 2) issues.push("short TLD");
  if (issues.length) formatWarn.push({ email: raw, status: s.status, issues });
}

// --- domain frequency (helps spot rare/suspect domains not in typo set) ---
const domainCounts = {};
for (const s of subs) {
  const norm = (s.email || "").trim().toLowerCase();
  const d = norm.includes("@") ? norm.split("@")[1] : "(no-@)";
  domainCounts[d] = (domainCounts[d] || 0) + 1;
}
const sortedDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
const rareDomains = sortedDomains.filter(([, c]) => c === 1);

// analyze
const malformed = [];
const typo = [];
const roleDisposable = [];
const seen = new Map(); // normalized -> [raw...]
const dupGroups = [];

for (const s of subs) {
  const raw = s.email;
  const norm = (raw || "").trim().toLowerCase();

  // duplicates tracking
  if (norm) {
    if (!seen.has(norm)) seen.set(norm, []);
    seen.get(norm).push({ raw, status: s.status, pageId: s.pageId });
  }

  if (!norm || !EMAIL_RE.test(norm)) {
    malformed.push({ email: raw, status: s.status });
    continue; // malformed: skip further domain checks (can't trust parse)
  }

  const domain = norm.split("@")[1];
  const local = norm.split("@")[0];

  if (TYPO_DOMAINS.has(domain)) typo.push({ email: raw, status: s.status, domain });

  if (ROLE_LOCALS.has(local) || DISPOSABLE_DOMAINS.has(domain)) {
    roleDisposable.push({ email: raw, status: s.status });
  }
}

for (const [norm, arr] of seen) {
  if (arr.length > 1) dupGroups.push({ norm, count: arr.length, entries: arr });
}

// build suspect file (full, for owner)
let fileLines = [];
fileLines.push(`# Subscriber list hygiene scan — ${new Date().toISOString()}`);
fileLines.push(`# Total subscribers: ${subs.length}`);
fileLines.push(`# Status breakdown: ${JSON.stringify(statusCounts)}`);
fileLines.push("");
fileLines.push(`## (1) MALFORMED / INVALID FORMAT (${malformed.length})`);
for (const m of malformed) fileLines.push(`  [${m.status}] ${m.email === "" ? "(empty)" : m.email}`);
fileLines.push("");
fileLines.push(`## (2) DOMAIN TYPOS (${typo.length})`);
for (const t of typo) fileLines.push(`  [${t.status}] ${t.email}   (typo domain: ${t.domain})`);
fileLines.push("");
fileLines.push(`## (3) DUPLICATES (case-insensitive, trimmed) — ${dupGroups.length} groups`);
for (const g of dupGroups) {
  fileLines.push(`  ${g.norm}  x${g.count}`);
  for (const e of g.entries) fileLines.push(`     - raw="${e.raw}" status=${e.status} pageId=${e.pageId}`);
}
fileLines.push("");
fileLines.push(`## (4) ROLE / DISPOSABLE / TEST (${roleDisposable.length})`);
for (const r of roleDisposable) fileLines.push(`  [${r.status}] ${r.email}`);
fileLines.push("");
fileLines.push(`## (5) FORMAT EDGE-CASE WARNINGS (${formatWarn.length})`);
for (const f of formatWarn) fileLines.push(`  [${f.status}] ${f.email}   -> ${f.issues.join("; ")}`);
fileLines.push("");
fileLines.push(`## DOMAIN DISTRIBUTION (top + rare)`);
fileLines.push(`  distinct domains: ${sortedDomains.length}; singleton domains: ${rareDomains.length}`);
fileLines.push(`  -- top 15 --`);
for (const [d, c] of sortedDomains.slice(0, 15)) fileLines.push(`  ${c}\t${d}`);
fileLines.push(`  -- singleton (count==1) domains --`);
for (const [d] of rareDomains) fileLines.push(`  1\t${d}`);
fileLines.push("");
fs.writeFileSync(SUSPECTS_OUT, fileLines.join("\n"), "utf8");

// console summary (masked)
const maskedSamples = (arr, n = 3) => arr.slice(0, n).map((x) => mask(x.email)).join(", ");

console.log("=== SUBSCRIBER LIST HYGIENE SCAN (READ-ONLY) ===");
console.log("TOTAL:", subs.length);
console.log("STATUS BREAKDOWN:", JSON.stringify(statusCounts));
console.log("");
console.log(`(1) MALFORMED: ${malformed.length}`);
console.log("    samples:", malformed.length ? mas(malformed) : "-");
function mas(a){return a.slice(0,3).map(x=>x.email===""?"(empty)":mask(x.email)).join(", ");}
console.log(`(2) TYPO DOMAINS: ${typo.length}`);
console.log("    samples:", typo.length ? maskedSamples(typo) : "-");
console.log(`(3) DUPLICATE GROUPS: ${dupGroups.length} (extra records: ${dupGroups.reduce((a,g)=>a+(g.count-1),0)})`);
console.log("    samples:", dupGroups.length ? dupGroups.slice(0,3).map(g=>`${mask(g.norm)} x${g.count}`).join(", ") : "-");
console.log(`(4) ROLE/DISPOSABLE/TEST: ${roleDisposable.length}`);
console.log("    samples:", roleDisposable.length ? maskedSamples(roleDisposable) : "-");
console.log(`(5) FORMAT EDGE-CASE WARNINGS: ${formatWarn.length}`);
console.log("    samples:", formatWarn.length ? formatWarn.slice(0,3).map(f=>`${mask(f.email)} (${f.issues.join(",")})`).join(" | ") : "-");
console.log("");
console.log(`DOMAINS: distinct=${sortedDomains.length}, singleton=${rareDomains.length}`);
console.log("  top10:", sortedDomains.slice(0,10).map(([d,c])=>`${d}:${c}`).join(", "));
console.log("");
console.log("Full suspect list + domain distribution written to:", SUSPECTS_OUT);
