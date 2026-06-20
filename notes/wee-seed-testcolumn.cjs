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
  const yid = (await c.query(`select id from auth.users where email='chanyang8907@naver.com'`)).rows[0]?.id;
  if (!yid) throw new Error("열음쌤 계정 없음");
  // 이미 같은 테스트 칼럼 있으면 재사용(중복 생성 방지)
  const exist = (await c.query(`select id from public.columns where title like '[테스트]%편집권한%'`)).rows[0]?.id;
  let id = exist;
  if (!id) {
    const doc = JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "편집권한 가드 확인용 비공개 테스트 칼럼입니다. (열음쌤 작성)" }] }] });
    id = (await c.query(
      `insert into public.columns(author_id,title,summary,content,content_text,status)
       values($1,'[테스트] 편집권한 확인용 칼럼','가드 테스트',$2::jsonb,'편집권한 가드 확인용','draft') returning id`,
      [yid, doc]
    )).rows[0].id;
  }
  console.log("테스트 칼럼 id:", id, exist ? "(기존 재사용)" : "(신규 생성)");
  console.log("작성자(열음쌤) id:", yid);
  console.log("편집 시도 URL: /admin/columns/" + id + "/edit  (→ /forbidden 기대)");
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
