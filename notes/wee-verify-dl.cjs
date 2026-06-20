const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local","utf8").split("\n")){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const URL=env.NEXT_PUBLIC_SUPABASE_URL, ANON=env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POOLER=`postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
(async()=>{
  // 비소유·비staff 신규 회원으로 다운로드 테스트(발행본 정책 경로)
  const email="wee-dltest@weetest.kr", pw="WeeDl!2345";
  await fetch(`${URL}/auth/v1/signup`,{method:"POST",headers:{apikey:ANON,"content-type":"application/json"},body:JSON.stringify({email,password:pw,data:{display_name:"dltest"}})});
  const jwt=(await (await fetch(`${URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:ANON,"content-type":"application/json"},body:JSON.stringify({email,password:pw})})).json()).access_token;
  const pg=new Client({connectionString:POOLER,ssl:{rejectUnauthorized:false}});await pg.connect();
  const r=(await pg.query("select title,file_path from public.resources where title='감정 온도계 활동지' limit 1")).rows[0];
  // sign
  const sg=await fetch(`${URL}/storage/v1/object/sign/resources/${r.file_path}`,{method:"POST",headers:{apikey:ANON,Authorization:`Bearer ${jwt}`,"content-type":"application/json"},body:JSON.stringify({expiresIn:60})});
  const sj=await sg.json();
  if(!sj.signedURL){console.error("서명 실패(비소유 회원):",sg.status,JSON.stringify(sj));process.exit(1);}
  const dl=await fetch(`${URL}/storage/v1${sj.signedURL}`);
  const head=Buffer.from(await dl.arrayBuffer()).subarray(0,5).toString("latin1");
  console.log(`비소유 회원 다운로드: http=${dl.status}, 시작바이트="${head}" → ${dl.status===200&&head==="%PDF"?"✅ PDF 정상":"❌"}`);
  // cleanup dltest account
  await pg.query("delete from auth.users where email=$1",[email]);
  await pg.end();
})().catch(e=>{console.error(e.message);process.exit(1);});
