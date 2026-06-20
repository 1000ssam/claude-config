import { chromium } from "playwright";
const U="http://localhost:3987/";
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const p=await c.newPage();
await p.goto(U,{waitUntil:"networkidle",timeout:60000});
// 데스크톱 레일의 hero-shimmer 카드 3장 측정
const cards = await p.locator(".hero-shimmer").elementHandles();
console.log("shimmer count:", cards.length); // 모바일+데스크톱 합쳐 6장 예상(숨김 포함)
// 보이는(데스크톱) 카드만: boundingBox 가 있는 것
async function frame(label){
  const out=[];
  for (let i=0;i<cards.length;i++){
    const bb = await cards[i].boundingBox();
    if (bb && bb.width>0) out.push({i, y:Math.round(bb.y*10)/10, h:Math.round(bb.height*10)/10});
  }
  console.log(label, JSON.stringify(out));
}
// 같은 카드(데스크톱 첫 3장)를 여러 시점에 측정 → translateY/scale 로 y·h 가 흔들리면 애니메이션 작동
for (const t of [600,1400,2200,3000,3800,4600]){
  await p.waitForTimeout(t - (await p.evaluate(()=>0)) ); // 단순 대기
  await frame(`t~${t}ms`);
  await p.waitForTimeout(0);
}
await b.close();
