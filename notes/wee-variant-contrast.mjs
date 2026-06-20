// A안(로즈-리드 튜닝) / B안(블루-리드 차분) 후보값 WCAG 검증
function hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function lum([r,g,b]){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function contrast(h1,h2){const L1=lum(hexToRgb(h1)),L2=lum(hexToRgb(h2));const[hi,lo]=L1>L2?[L1,L2]:[L2,L1];return Math.round(((hi+0.05)/(lo+0.05))*100)/100;}
function tag(c){return c>=4.5?'AA':c>=3?'AA-large':'FAIL';}

const pairs = [
  // A안 (warm-neutral canvas, rose-led)
  ['A: muted text #6d6862 / canvas #f7f6f5', '#6d6862', '#f7f6f5'],
  ['A: ink #2b2630 / canvas #f7f6f5',         '#2b2630', '#f7f6f5'],
  ['A: white / primary rose-ink #b0617e',     '#ffffff', '#b0617e'],
  ['A: white / hover #8a4763',                '#ffffff', '#8a4763'],
  ['A: blue-ink #5a7fa6 / blue-soft #eef4fb', '#5a7fa6', '#eef4fb'],
  // B안 (cool-neutral canvas, blue-led)
  ['B: muted text #5d616b / canvas #f6f7f9',  '#5d616b', '#f6f7f9'],
  ['B: ink #232733 / canvas #f6f7f9',         '#232733', '#f6f7f9'],
  ['B: white / primary blue #45638c',         '#ffffff', '#45638c'],
  ['B: white / hover #374e6f',                '#ffffff', '#374e6f'],
  ['B: primary blue #45638c text / white',    '#45638c', '#ffffff'],
  ['B: rose-ink #b0617e (spice) / white',     '#b0617e', '#ffffff'],
  ['B: white / today rose fill #c07e98',      '#ffffff', '#c07e98'],
];
for(const[n,fg,bg]of pairs){const c=contrast(fg,bg);console.log(`${n.padEnd(42)} ${String(c).padEnd(6)} ${tag(c)}`);}
