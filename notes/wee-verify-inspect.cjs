// 위링 — 인증 신청/역할 진단 (READ-ONLY)
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
(async () => {
  const c = new Client({ connectionString: POOLER, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log("=== profiles ===");
  const p = await c.query(`select u.email, pr.display_name, pr.role, pr.is_master
    from public.profiles pr join auth.users u on u.id=pr.id order by pr.created_at`);
  console.table(p.rows);
  console.log("=== verification_requests ===");
  const v = await c.query(`select u.email, vr.school_name, vr.status, vr.reviewed_at, vr.reviewed_by
    from public.verification_requests vr join auth.users u on u.id=vr.user_id order by vr.created_at`);
  console.table(v.rows.map(r => ({ email: r.email, school: r.school_name, status: r.status, reviewed: r.reviewed_at ? new Date(r.reviewed_at).toISOString().slice(0,16) : null })));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
