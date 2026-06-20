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
  const r = await c.query("delete from public.columns where title like '[테스트]%편집권한%' returning id");
  console.log("삭제된 테스트 칼럼:", r.rowCount);
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
