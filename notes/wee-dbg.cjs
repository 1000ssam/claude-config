const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local","utf8").split("\n")){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const POOLER=`postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
(async()=>{const c=new Client({connectionString:POOLER,ssl:{rejectUnauthorized:false}});await c.connect();
console.log("== resources file_path (샘플) ==");
console.table((await c.query("select title, file_path, status from public.resources where uploader_id='c66de593-367a-4f0f-b8aa-4f2b30fc9bd2' order by title")).rows);
console.log("== storage.objects (resources 버킷) ==");
console.table((await c.query("select name, bucket_id from storage.objects where bucket_id='resources' order by name")).rows);
await c.end();})().catch(e=>{console.error(e.message);process.exit(1);});
