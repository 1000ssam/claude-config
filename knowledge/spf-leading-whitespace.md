# SPF(및 TXT) 레코드 — 값 앞 선행 공백이 인증을 통째로 깨뜨린다

DNS TXT 레코드 값 **맨 앞에 공백 1칸**이 끼면, SPF가 "레코드 없음"으로 취급돼 SES·수신서버가 SPF 인증에 실패한다. 붙여넣기할 때 따라 들어오는 흔한 함정. (가비아처럼 값 칸이 따옴표로 감싸진 UI에서 특히 자주 발생.)

## 증상

- AWS SES 콘솔: **"사용자 지정 MAIL FROM 도메인에 대한 SPF 레코드를 찾을 수 없습니다"** (Custom MAIL FROM 경고).
- mxtoolbox/dig 등으로 보면 TXT 값이 `" v=spf1 ..."`처럼 보이지만 사람 눈엔 잘 안 띔.

## 원인

SPF는 RFC 7208상 **레코드가 정확히 `v=spf1`로 시작**해야 SPF로 인식된다. 값이 `" v=spf1 ..."`(앞 공백)이면 `v=spf1`로 "시작"하지 않으므로 **SPF 레코드가 아닌 것으로 폐기**된다. → SES/수신서버 입장에선 SPF가 아예 없는 것.

## 진단 (결정론적, 콘솔 불필요)

```js
// 캐시 우회: 권위 네임서버에 직접 질의
const dns=require("dns").promises, {Resolver}=require("dns").promises;
const ns=[]; for(const h of ["ns.gabia.net","ns.gabia.co.kr"]) ns.push(...await dns.resolve4(h));
const r=new Resolver(); r.setServers(ns);
const txt=(await r.resolveTxt("mail.example.com")).map(a=>a.join("")).find(v=>v.includes("spf1"));
console.log(JSON.stringify(txt), "starts ok:", txt.startsWith("v=spf1"));
// 첫 글자 코드 32(space)면 선행 공백 버그.  [...txt.slice(0,1)].map(c=>c.charCodeAt(0))
```

- `length`도 단서: `v=spf1 include:amazonses.com ~all`은 정확히 33자. 34면 공백 1칸 의심.

## 해결

DNS 관리툴(가비아 등)에서 해당 TXT 레코드 값 **맨 앞 공백만 삭제** → `v`로 시작하게. 따옴표는 보통 표시용 구분자라 그대로 둬도 됨(권위 NS 응답에 따옴표 글자가 안 보이면 구분자 처리된 것). 핵심은 **값이 `v=spf1`로 시작**하는 것 하나.

- SES는 DNS를 주기적으로 재확인 → 수정 후 경고 해소까지 몇 분~수시간. 레코드 자체가 맞으면 됨.
- SPF 없이도 DKIM 정렬만으로 DMARC는 통과하므로 발송 자체는 됐을 수 있음. 하지만 고치면 **SPF+DKIM 이중 정렬**로 도달률이 더 견고.

## 일반화

- 앞 공백 함정은 **모든 TXT 기반 검증**(DKIM TXT, DMARC, google-site-verification, _acme-challenge 등)에 동일. 값은 항상 의도한 첫 글자로 시작하는지 권위 NS로 검증.
- 중간/뒤 공백은 정상일 수 있음(SPF는 토큰 구분자로 공백 사용). **문제는 선행 공백.**

## 실 발견

- newsletter-self-host (2026-05-29): `mail.notiontalk.com` SPF가 `" v=spf1 include:amazonses.com ~all"`(앞 공백)이라 SES가 MAIL FROM SPF를 못 찾음. 가비아에서 공백 제거 → 권위 NS 33자/`v` 시작 확인 → 해소.
