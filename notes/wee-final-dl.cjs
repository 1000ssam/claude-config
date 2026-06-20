const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs=require("fs");const env={};
for(const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local","utf8").split("\n")){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const URL=env.NEXT_PUBLIC_SUPABASE_URL,ANON=env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POOLER=`postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
(async()=>{
  const email="wee-dltest@weetest.kr",pw="WeeDl!2345";
  await fetch(`${URL}/auth/v1/signup`,{method:"POST",headers:{apikey:ANON,"content-type":"application/json"},body:JSON.stringify({email,password:pw,data:{display_name:"dltest"}})});
  const jwt=(await(await fetch(`${URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:ANON,"content-type":"application/json"},body:JSON.stringify({email,password:pw})})).json()).access_token;
  const pg=new Client({connectionString:POOLER,ssl:{rejectUnauthorized:false}});await pg.connect();
  let allok=true;
  for(const t of ["감정 온도계 활동지","자존감 향상 집단상담 8회기 프로그램","사회정서학습(SEL) 수업 자료"]){
    const fp=(await pg.query("select file_path from public.resources where title=$1 and status='published' limit 1",[t])).rows[0].file_path;
    const sj=await(await fetch(`${URL}/storage/v1/object/sign/resources/${fp}`,{method:"POST",headers:{apikey:ANON,Authorization:`Bearer ${jwt}`,"content-type":"application/json"},body:JSON.stringify({expiresIn:60})})).json();
    const dl=await fetch(`${URL}/storage/v1${sj.signedURL}`);
    const head=Buffer.from(await dl.arrayBuffer()).subarray(0,4).toString("latin1");
    const ok=dl.status===200&&head==="%PDF";allok=allok&&ok;
    console.log(`${ok?"✅":"❌"} ${t} — http=${dl.status} head=${head}`);
  }
  await pg.query("delete from auth.users where email=$1",[email]);
  console.log("dltest 정리 완료. 전체:",allok?"✅ 다운로드 정상":"❌");
  await pg.end();process.exit(allok?0:1);
})().catch(e=>{console.error(e.message);process.exit(1);});
