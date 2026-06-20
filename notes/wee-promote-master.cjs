// 위링 — 열음쌤(조열음) admin + 마스터 승격 부트스트랩
// 권한상승 차단 트리거를 통과하기 위해 app.privileged='on' 컨텍스트에서 update.
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");

const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
const TARGET = "chanyang8907@naver.com";

(async () => {
  const c = new Client({ connectionString: POOLER });
  await c.connect();

  // DO 블록 = 단일 트랜잭션. set_config(...,true)는 트랜잭션 로컬이라 내부 update에만 특권 적용.
  await c.query(
    `do $$
     begin
       perform set_config('app.privileged','on', true);
       update public.profiles
         set role = 'admin', is_master = true
         where id = (select id from auth.users where email = $tgt$${TARGET}$tgt$);
       perform set_config('app.privileged','off', true);
     end $$;`
  );

  const { rows } = await c.query(
    `select u.email, p.display_name, p.role, p.is_master
       from public.profiles p join auth.users u on u.id = p.id
      where u.email = $1`,
    [TARGET]
  );
  console.log("승격 후 상태:");
  console.table(rows);

  const ok = rows[0]?.role === "admin" && rows[0]?.is_master === true;
  console.log(ok ? "✅ 승격 성공" : "❌ 승격 실패 — 확인 필요");
  await c.end();
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
