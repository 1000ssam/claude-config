// B2 "에어" — 순백 배경 + 반투명 틴트 포인트. 반투명은 흰 위 합성색으로 검증.
function hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function lum([r,g,b]){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function contrast(c1,c2){const L1=lum(c1),L2=lum(c2);const[hi,lo]=L1>L2?[L1,L2]:[L2,L1];return Math.round(((hi+0.05)/(lo+0.05))*100)/100;}
function rgb(h){return hexToRgb(h);}
// rgba(color,a) over white -> solid rgb
function over(hex,a){const[r,g,b]=hexToRgb(hex);return[Math.round(a*r+(1-a)*255),Math.round(a*g+(1-a)*255),Math.round(a*b+(1-a)*255)];}
function toHex([r,g,b]){return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
function tag(c){return c>=4.5?'AA':c>=3?'AA-large':'FAIL';}
const W=[255,255,255];

const blueTint = over('#4a6aa0',0.10);   // 활성탭/인증 배지
const roseTint = over('#c47e98',0.14);   // 오늘 배지
const blueHL   = over('#4a6aa0',0.16);   // 블루 형광펜
const roseHL   = over('#c47e98',0.18);   // 로즈 형광펜
console.log('합성 틴트색: blueTint',toHex(blueTint),'roseTint',toHex(roseTint),'blueHL',toHex(blueHL),'roseHL',toHex(roseHL),'\n');

const rows = [
  ['ink #20242e / white(canvas)',        rgb('#20242e'), W],
  ['muted #646973 / white',              rgb('#646973'), W],
  ['white / primary #4a6aa0 (solid CTA)', W, rgb('#4a6aa0')],
  ['white / primary #46659a (대안 진함)',  W, rgb('#46659a')],
  ['white / primary-h #3a5482',           W, rgb('#3a5482')],
  ['blue-ink #3f5e87 text / blueTint',   rgb('#3f5e87'), blueTint],
  ['blue-ink #34527c / blueHL(형광펜)',   rgb('#34527c'), blueHL],
  ['rose-ink #a85072 text / roseTint',   rgb('#a85072'), roseTint],
  ['rose-ink #8f4d6b / roseHL(형광펜)',   rgb('#8f4d6b'), roseHL],
  ['ink / neutral btn over .05',         rgb('#20242e'), over('#28324a',0.05)],
];
for(const[n,fg,bg]of rows){const c=contrast(fg,bg);console.log(`${n.padEnd(38)} ${String(c).padEnd(6)} ${tag(c)}`);}
