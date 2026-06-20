---
name: wee-linked-domain
description: wee-linked.com 도메인 구매·DNS·호스팅 인프라 구성
metadata: 
  node_type: memory
  type: project
  originSessionId: abfee570-e45e-49a5-a9d0-6211835b1a8e
---

`wee-linked.com` 도메인 (2026-06-08 Porkbun에서 신규 등록, 1년).

**인프라 토폴로지**
- 등록기관: Porkbun (구매 60일 뒤 Cloudflare 이전 가능 — 갱신비 원가화 옵션, 미실행)
- DNS: **Cloudflare**로 네임서버 위임 완료 (paislee/yichun.ns.cloudflare.com)
- 웹 호스팅: **Vercel**
  - A `@` → 76.76.21.21 (DNS only/회색구름)
  - CNAME `www` → cname.vercel-dns.com (DNS only)
  - ⚠️ Vercel 앞단 Cloudflare는 반드시 DNS only. 프록시(주황) 켜면 SSL 충돌.
- 이메일: **보류**. CS 메일 용도 우선, 나중에 뉴스레터 확장 예정.
  - 현재 Porkbun 잔존 레코드(MX fwd1/fwd2.porkbun.com, SPF, _acme TXT)는 무해해서 남겨둠 → 메일 방식 확정 시 정리.
  - 후보: 무료 포워딩(Cloudflare/Porkbun) 또는 Google Workspace($6/월). 발송은 SES/Resend 별도.

도메인명 결정 맥락: `weelinked.com`(하이픈 없음)이 더 깔끔하나 이미 등록됨 → 하이픈 있는 `wee-linked.com`으로 .com 확보. 타깃이 국내라 "wee" 어감 리스크는 무시.
