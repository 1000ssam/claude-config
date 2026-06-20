const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local","utf8").split("\n")){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const POOLER=`postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;
(async()=>{const c=new Client({connectionString:POOLER,ssl:{rejectUnauthorized:false}});await c.connect();
const u=await c.query("select u.email, u.id from auth.users u where u.email in ('slowly007@goedu.kr','slowly008@gmail.com')");
console.log("USERS:",JSON.stringify(u.rows));
const b=await c.query("select slug,name,id from public.boards order by sort_order");
console.log("BOARDS:",JSON.stringify(b.rows));
const cat=await c.query("select slug,name,id from public.resource_categories order by sort_order");
console.log("CATS:",JSON.stringify(cat.rows));
await c.end();})().catch(e=>{console.error(e.message);process.exit(1);});
