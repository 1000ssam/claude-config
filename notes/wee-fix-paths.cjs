const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env={};for(const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local","utf8").split("\n")){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const POOLER=`postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
const HOST="49694458-3bfc-4f41-ba66-5c08a4c7a0fc", MEMBER="c66de593-367a-4f0f-b8aa-4f2b30fc9bd2";
(async()=>{const c=new Client({connectionString:POOLER,ssl:{rejectUnauthorized:false}});await c.connect();
const r=await c.query(`update public.resources set file_path = $1 || '/' || split_part(file_path,'/',2)
  where uploader_id=$2 and status='published' and file_path like $3 returning title, file_path`,[HOST,MEMBER,MEMBER+'/%']);
console.log("경로 보정:",r.rowCount,"건"); console.table(r.rows);
await c.end();})().catch(e=>{console.error(e.message);process.exit(1);});
