// 위링 샘플 자료에 동작하는 더미 PDF 붙이기.
// 임시 호스트 계정으로 더미 PDF 업로드 → 샘플 resources.file_path를 그 경로로 갱신.
// 다운로드는 storage select 정책(발행본이면 누구나)으로 동작. 표시 저자(uploader_id)는 slowly008 유지.
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
const HOST_EMAIL = "wee-sample-host@weetest.kr";
const HOST_PW = "WeeSample!2345";
const MEMBER = "c66de593-367a-4f0f-b8aa-4f2b30fc9bd2"; // slowly008 (표시 저자)
const SAMPLE_TITLES = ["감정 온도계 활동지", "자존감 향상 집단상담 8회기 프로그램", "또래관계 점검 설문지", "상담 동의 안내 가정통신문", "사회정서학습(SEL) 수업 자료"];

// 유효한 최소 PDF 생성(xref 오프셋 계산).
function makePdf(title) {
  const stream = `BT /F1 16 Tf 24 100 Td (WEE-linked sample - ${title.replace(/[()\\]/g, " ")}) Tj ET`;
  const objs = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 360 160]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>",
    `<</Length ${Buffer.byteLength(stream)}>>\nstream\n${stream}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((body, i) => { offsets[i] = Buffer.byteLength(pdf); pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { pdf += String(o).padStart(10, "0") + " 00000 n \n"; });
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

async function api(path, opts) { return fetch(`${URL}${path}`, opts); }

(async () => {
  // 1) 임시 호스트 계정 확보(이미 있으면 로그인)
  await api(`/auth/v1/signup`, { method: "POST", headers: { apikey: ANON, "content-type": "application/json" }, body: JSON.stringify({ email: HOST_EMAIL, password: HOST_PW, data: { display_name: "샘플자료 호스트" } }) });
  const tr = await (await api(`/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "content-type": "application/json" }, body: JSON.stringify({ email: HOST_EMAIL, password: HOST_PW }) })).json();
  const jwt = tr.access_token;
  if (!jwt) throw new Error("호스트 토큰 발급 실패: " + JSON.stringify(tr));

  const pg = new Client({ connectionString: POOLER, ssl: { rejectUnauthorized: false } });
  await pg.connect();
  const hostId = (await pg.query(`select id from auth.users where email=$1`, [HOST_EMAIL])).rows[0].id;

  // 2) 각 샘플 자료마다 더미 PDF 업로드 + file_path/mime/size 갱신
  let ok = 0;
  for (const title of SAMPLE_TITLES) {
    const bytes = makePdf(title);
    const path = `${hostId}/sample-${Math.abs(hash(title))}.pdf`;
    const up = await api(`/storage/v1/object/resources/${path}`, {
      method: "POST",
      headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, "content-type": "application/pdf", "x-upsert": "true" },
      body: bytes,
    });
    if (!up.ok) { console.error(`업로드 실패 [${title}]`, up.status, await up.text()); continue; }
    const r = await pg.query(
      `update public.resources set file_path=$1, mime='application/pdf', size_bytes=$2, updated_at=now()
       where uploader_id=$3 and title=$4 and status='published'`,
      [path, bytes.length, MEMBER, title]
    );
    if (r.rowCount > 0) ok++;
  }
  console.log(`더미 PDF 연결 완료: ${ok}/${SAMPLE_TITLES.length}`);
  console.log(`호스트 계정: ${HOST_EMAIL} (id ${hostId}) — /admin/users에 '샘플자료 호스트'로 보임`);
  await pg.end();
})().catch((e) => { console.error(e.message); process.exit(1); });

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
