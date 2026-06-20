import fs from 'fs';
const DIR = '/mnt/c/dev/notes/wee-linked-mock';
const master = fs.readFileSync(DIR + '/mymind-native.html', 'utf8');

const NAV_BIG = `
  header.nav{height:94px;padding:0 48px}
  .brand .mark{font-size:25px}
  .brand .en{font-size:15px}
  nav.menu{gap:6px}
  nav.menu a{padding:10px 16px;font-size:15px}
  .nav-auth{gap:16px}
  .nav-auth .login{font-size:15px}
  .nav-auth .btn-sm{padding:11px 22px;font-size:14.5px}`;

const V1 = `<style id="variant">
/* ===== V1: 네비바 확대 + 네비↔히어로 마진 확대 (데스크톱 전용) ===== */
@media (min-width:769px){${NAV_BIG}
  .hero{padding-top:152px}
  .board-stage{margin-top:58px}
}
</style>`;

const V2 = `<style id="variant">
/* ===== V2: V1 + 카드 프리뷰를 히어로 우측 단으로 (데스크톱 전용) ===== */
@media (min-width:769px){${NAV_BIG}
  .hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:center;gap:52px;
    max-width:1180px;margin:0 auto;padding:104px 48px 84px;overflow:hidden}
  .hero .inner{max-width:none;margin:0;padding:0}
  .hero h1{font-size:84px}
  .hero .sub{max-width:470px}
  .board-stage{margin:0;padding:0;max-height:540px;overflow:hidden;
    -webkit-mask-image:linear-gradient(#000 80%,transparent);mask-image:linear-gradient(#000 80%,transparent)}
  .board{column-count:2;column-gap:14px;max-width:none;margin:0;-webkit-mask-image:none;mask-image:none}
  .it{margin-bottom:14px}
}
</style>`;

for (const [name, css] of [['var1-nav.html', V1], ['var2-board-right.html', V2]]) {
  const out = master.replace('</body>', css + '\n</body>');
  fs.writeFileSync(DIR + '/' + name, out);
  console.log('wrote', name);
}
