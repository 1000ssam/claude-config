// 위링 0014 마이그레이션 풀러 직접 적용(트랜잭션).
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
const sql = fs.readFileSync("/mnt/c/dev/wee-linked/supabase/migrations/0015_open_gate_to_members.sql", "utf8");
(async () => {
  const c = new Client({ connectionString: POOLER, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    await c.query("begin");
    await c.query(sql);
    await c.query("commit");
    console.log("✅ 0014 적용 완료");
  } catch (e) {
    await c.query("rollback");
    console.error("❌ 적용 실패(롤백):", e.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
