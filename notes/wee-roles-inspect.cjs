// 위링 — 라이브 회원/역할 진단 (READ-ONLY)
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");

const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

(async () => {
  const c = new Client({ connectionString: POOLER });
  await c.connect();
  const { rows } = await c.query(`
    select p.id, u.email, p.display_name, p.role, p.is_master, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at asc
  `);
  console.table(rows.map(r => ({
    email: r.email,
    name: r.display_name,
    role: r.role,
    master: r.is_master,
    created: new Date(r.created_at).toISOString().slice(0, 16),
  })));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
