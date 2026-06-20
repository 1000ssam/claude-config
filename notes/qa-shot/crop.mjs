import { chromium } from "playwright";
const U="http://localhost:3987/";
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const p=await c.newPage();
async function shot(file, waitMs){
  await p.goto(U,{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(waitMs);
  // col1(좌측 레일) 영역만 클립
  await p.screenshot({path:file, clip:{x:96,y:205,width:260,height:200}});
  console.log("OK",file,waitMs);
}
await shot("c_a.png",800);
await shot("c_b.png",2400);
await shot("c_c.png",4000);
await b.close();
